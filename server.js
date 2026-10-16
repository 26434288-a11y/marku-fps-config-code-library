const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { randomUUID } = require('crypto');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_FILE = path.join(ROOT, 'data', 'codes.json');
const SETTINGS_FILE = path.join(ROOT, 'data', 'settings.json');
const DATA_DIR = path.dirname(DATA_FILE);
const ANNOUNCEMENT_CACHE_FILE = path.join(
  ROOT,
  'data',
  'announcements-cache.json'
);
const DELTA_ANNOUNCEMENT_URL =
  process.env.ANNOUNCEMENT_URL || 'https://comm.ams.game.qq.com/ide/';
const ARENA_ANNOUNCEMENT_URL = 'https://apps.game.qq.com/cmc/cross';
const ANNOUNCEMENT_TIMEOUT_MS = 9000;
const MAX_BODY_BYTES = 1024 * 1024;
const INTERNATIONAL_CMS_URL = 'https://sg-community.playerinfinite.com';
const INTERNATIONAL_CMS_PATH =
  '/api/gpts.information_feeds_svr.InformationFeedsSvr';
const INTERNATIONAL_CMS_GAME_IDS = {
  暗区突围: '30048',
  三角洲行动: '30029',
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const GAMES = ['暗区突围', '三角洲行动'];
const TYPES = ['改枪码', '配装码'];
const GAME_LABELS = {
  暗区突围: '暗区突围：无限',
  三角洲行动: '三角洲行动',
};

function gameLabel(game) {
  return GAME_LABELS[game] || game;
}

let codes = loadCodes();
let settings = loadSettings();

function loadCodes() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function saveCodes() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(codes, null, 2) + '\n');
}

function loadSettings() {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      gameCode: String(parsed.gameCode == null ? '' : parsed.gameCode),
      controlCode: String(parsed.controlCode == null ? '' : parsed.controlCode),
      postCode: String(parsed.postCode == null ? '' : parsed.postCode),
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { gameCode: '', controlCode: '', postCode: '' };
    }
    throw err;
  }
}

function saveSettings() {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2) + '\n');
}

function refreshCodesFromDisk() {
  if (!fs.existsSync(DATA_FILE)) return;
  try {
    codes = loadCodes();
  } catch (error) {
    console.error('读取 codes.json 失败，继续使用内存数据:', error.message);
  }
}

function refreshSettingsFromDisk() {
  if (!fs.existsSync(SETTINGS_FILE)) return;
  try {
    settings = loadSettings();
  } catch (error) {
    console.error('读取 settings.json 失败，继续使用内存数据:', error.message);
  }
}

function backupFilePayloads() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  return fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const content = fs.readFileSync(path.join(DATA_DIR, entry.name));
      const extension = path.extname(entry.name).toLowerCase();
      const type =
        extension === '.json'
          ? 'application/json'
          : extension === '.md'
          ? 'text/markdown'
          : extension === '.txt'
          ? 'text/plain'
          : 'application/octet-stream';
      return {
        name: entry.name,
        type,
        size: content.length,
        content: content.toString('base64'),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function chooseWindowsBackupDirectory() {
  if (process.platform !== 'win32') {
    const error = new Error('当前系统不支持原生文件夹选择');
    error.statusCode = 501;
    throw error;
  }

  const script = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Windows.Forms
$owner = New-Object System.Windows.Forms.Form
$owner.ShowInTaskbar = $false
$owner.StartPosition = 'CenterScreen'
$owner.TopMost = $true
$owner.Size = New-Object System.Drawing.Size(1, 1)
$owner.Opacity = 0
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = '选择 Marku data 备份位置'
$dialog.ShowNewFolderButton = $true
$result = $dialog.ShowDialog($owner)
$owner.Dispose()
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
  [Console]::Out.Write($dialog.SelectedPath)
}
`;

  try {
    const { stdout } = await execFileAsync(
      'powershell.exe',
      ['-NoProfile', '-STA', '-Command', script],
      {
        encoding: 'utf8',
        windowsHide: false,
        maxBuffer: 1024 * 1024,
        timeout: 30000,
      }
    );
    return String(stdout || '').trim();
  } catch (error) {
    error.statusCode = 501;
    throw error;
  }
}

function copyDataBackup(targetDirectory) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '');
  const backupRoot = path.join(
    targetDirectory,
    `Marku-data-${timestamp}`
  );
  const destination = path.join(backupRoot, 'data');
  fs.mkdirSync(destination, { recursive: true });

  const files = [];
  for (const entry of fs.readdirSync(DATA_DIR, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    fs.copyFileSync(
      path.join(DATA_DIR, entry.name),
      path.join(destination, entry.name)
    );
    files.push(entry.name);
  }
  return {
    destination,
    files: files.sort((a, b) => a.localeCompare(b)),
  };
}

function isLocalRequest(req) {
  const remoteAddress = String(req.socket.remoteAddress || '');
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remoteAddress);
}

function findMarkuHelper() {
  const candidates = [
    path.join(ROOT, '.build', 'Marku.exe'),
    path.join(ROOT, 'Marku.exe'),
    path.join(ROOT, 'Marku-Browser.exe'),
    path.join(ROOT, 'Marku-Desktop.exe'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || '';
}

async function openExplorerLocation(target) {
  const helper = findMarkuHelper();
  if (helper) {
    await execFileAsync(helper, ['--open-location', target], {
      windowsHide: true,
      timeout: 10000,
      encoding: 'utf8',
    });
    return;
  }

  const script = `
$shell = New-Object -ComObject Shell.Application
$shell.Explore($env:MARKU_LOCATION)
Start-Sleep -Milliseconds 350
$windows = $shell.Windows()
if ($windows.Count -gt 0) {
  $window = $windows.Item($windows.Count - 1)
  $window.Visible = $true
  Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class MarkuWindow {
  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);
}
"@
  [MarkuWindow]::SetForegroundWindow([IntPtr]$window.HWND) | Out-Null
}
`;

  await execFileAsync(
    'powershell.exe',
    ['-NoProfile', '-STA', '-Command', script],
    {
      encoding: 'utf8',
      windowsHide: true,
      maxBuffer: 1024 * 1024,
      timeout: 10000,
      env: {
        ...process.env,
        MARKU_LOCATION: target,
      },
    }
  );
}

function normalizeText(value) {
  return String(value == null ? '' : value).trim();
}

function validateEntry(input) {
  const errors = [];
  const game = normalizeText(input.game);
  const type = normalizeText(input.type);
  const weapon = normalizeText(input.weapon);
  const price = normalizeText(input.price);
  const code = String(input.code == null ? '' : input.code);

  if (!GAMES.includes(game)) errors.push('请选择有效的游戏');
  if (!TYPES.includes(type)) errors.push('请选择有效的类型');
  if (!weapon) errors.push('枪械不能为空');
  if (!code.trim()) errors.push('代码不能为空');
  if (code.length > 5000) errors.push('代码长度超出限制');

  return {
    errors,
    entry: {
      game,
      type,
      weapon,
      price,
      code,
    },
  };
}

function sortCodes(list) {
  return [...list].sort((a, b) => {
    const aOrdered = Number.isFinite(a.order);
    const bOrdered = Number.isFinite(b.order);
    if (aOrdered !== bOrdered) return aOrdered ? 1 : -1;
    if (aOrdered && bOrdered) return a.order - b.order;
    return String(b.updatedAt).localeCompare(String(a.updatedAt));
  });
}

const ANNOUNCEMENT_CACHE_MS = 5 * 60 * 1000;
const ANNOUNCEMENT_CACHE_VERSION = 3;
let announcementCache = loadAnnouncementCache();

function createAnnouncementCache() {
  return { at: 0, total: 0, items: [] };
}

function createAnnouncementCacheGroup() {
  return {
    'zh-CN': createAnnouncementCache(),
    en: createAnnouncementCache(),
  };
}

function normalizeAnnouncementCache(value) {
  if (!value || typeof value !== 'object') return createAnnouncementCache();
  return {
    at: Number(value.at || 0),
    total: Number(value.total || 0),
    items: Array.isArray(value.items) ? value.items : [],
  };
}

function normalizeAnnouncementCacheGroup(value) {
  if (!value || typeof value !== 'object') {
    return createAnnouncementCacheGroup();
  }
  if (value['zh-CN'] || value.en) {
    return {
      'zh-CN': normalizeAnnouncementCache(value['zh-CN']),
      en: normalizeAnnouncementCache(value.en),
    };
  }
  return {
    'zh-CN': normalizeAnnouncementCache(value),
    en: createAnnouncementCache(),
  };
}

function loadAnnouncementCache() {
  try {
    const raw = fs.readFileSync(ANNOUNCEMENT_CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Number(parsed.version || 0) !== ANNOUNCEMENT_CACHE_VERSION) {
      throw new Error('公告缓存版本已更新');
    }
    const games = parsed.games || {};
    return {
      暗区突围: normalizeAnnouncementCacheGroup(
        games['暗区突围'] || parsed.arena
      ),
      三角洲行动: normalizeAnnouncementCacheGroup(
        games['三角洲行动'] || parsed.delta || parsed
      ),
    };
  } catch (err) {
    return {
      暗区突围: createAnnouncementCacheGroup(),
      三角洲行动: createAnnouncementCacheGroup(),
    };
  }
}

function saveAnnouncementCache() {
  try {
    fs.mkdirSync(path.dirname(ANNOUNCEMENT_CACHE_FILE), { recursive: true });
    fs.writeFileSync(
      ANNOUNCEMENT_CACHE_FILE,
      JSON.stringify(
        {
          version: ANNOUNCEMENT_CACHE_VERSION,
          games: announcementCache,
        },
        null,
        2
      ) + '\n'
    );
  } catch {
    // Announcement caching is best effort.
  }
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    ANNOUNCEMENT_TIMEOUT_MS
  );

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeAnnouncementImage(image) {
  if (!image) return '';
  return String(image).startsWith('//') ? `https:${image}` : String(image);
}

async function fetchDeltaAnnouncementsOnce(limit, start) {
  const body = new URLSearchParams({
    iChartId: '329849',
    iSubChartId: '329849',
    sIdeToken: 'o3Iw53',
    chanid: '6895',
    typeids: '1',
    limit: String(limit),
    start: String(start),
    isPreengage: '1',
    needGopenid: '1',
  });

  const response = await fetchWithTimeout(DELTA_ANNOUNCEMENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`公告接口返回 ${response.status}`);
  }

  const payload = await response.json();
  const data = payload && payload.jData && payload.jData.data ? payload.jData.data : {};
  const items = Array.isArray(data.items) ? data.items : [];

  return {
    total: Number(data.total || 0),
    items: items.map((item) => {
      const docId = String(item.iDocID || '');
      return {
        id: docId,
        title: String(item.sTitle || ''),
        date: String(item.sIdxTime || ''),
        channel: String(item.sChannelInfo || ''),
        url:
          item.sRedirectURL ||
          `https://df.qq.com/cp/a20240906main/newsdetail.html?id=${docId}`,
        image: normalizeAnnouncementImage(item.sIMG),
      };
    }),
  };
}

async function fetchArenaAnnouncementsOnce(limit, start) {
  const params = new URLSearchParams({
    serviceId: '463',
    source: 'web_pc',
    typeids: '1,2',
    limit: String(limit),
    start: String(start),
    filter: 'channel',
    chanid: '6887',
    withtop: 'yes',
    topMode: 'new',
  });
  const response = await fetchWithTimeout(
    `${ARENA_ANNOUNCEMENT_URL}?${params.toString()}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`暗区公告接口返回 ${response.status}`);
  }

  const payload = await response.json();
  if (String(payload.status) !== '0') {
    throw new Error(payload.msg || '暗区公告获取失败');
  }

  const data = payload.data || {};
  const items = Array.isArray(data.items) ? data.items : [];
  const total = Number(data.total || 0);

  return {
    total,
    items: items.map((item) => {
      const newsId = String(item.iNewsId || '');
      return {
        id: String(item.iId || newsId),
        title: String(item.sTitle || ''),
        date: String(item.sCreated || item.sIdxTime || ''),
        channel: String(item.sTagIds || ''),
        url:
          item.sRedirectURL ||
          `https://aqtwwx.qq.com/web202501/newsdetail.html?newsid=${newsId}`,
        image: normalizeAnnouncementImage(item.sIMG),
      };
    }),
  };
}

function formatCmsAnnouncementDate(timestamp) {
  const value = Number(timestamp || 0);
  if (!Number.isFinite(value) || value <= 0) return '';
  const date = new Date(value * 1000);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

async function postInternationalCms(game, endpoint, payload) {
  const gameId = INTERNATIONAL_CMS_GAME_IDS[game];
  if (!gameId) throw new Error('不支持的国际服公告来源');

  const response = await fetchWithTimeout(
    `${INTERNATIONAL_CMS_URL}${INTERNATIONAL_CMS_PATH}/${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'X-Language': 'en',
        'X-GameId': gameId,
        'X-AreaId': 'global',
        'X-Source': 'pc_web',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`国际服公告接口返回 ${response.status}`);
  }

  const result = await response.json();
  if (Number(result.code || 0) !== 0) {
    throw new Error(result.msg || '国际服公告获取失败');
  }
  if (Number(result.data?.result || 0) !== 0) {
    throw new Error(result.data?.errmsg || '国际服公告获取失败');
  }
  return result.data || {};
}

async function fetchInternationalAnnouncementsOnce(game, limit, start) {
  const isArena = game === '暗区突围';
  const columnName = isArena ? 'WEB-NEWS' : 'official_news_list';
  const labels = await postInternationalCms(game, 'GetLabelList', {});
  const column = (labels.primary_label_list || []).find(
    (item) =>
      item.label_name === columnName ||
      item.raw_label_name === columnName ||
      (isArena && Number(item.label_id) === 893) ||
      (!isArena && Number(item.label_id) === 825)
  );
  if (!column) throw new Error('未找到国际服公告分类');

  const secondaryLabelId = Number(column.default_secondary_label_id || 0);
  const data = await postInternationalCms(game, 'GetContentByLabel', {
    primary_label_id: Number(column.label_id),
    secondary_label_id: secondaryLabelId,
    offset: start,
    get_num: limit,
    content_class: 0,
    ext_info_type_list: [],
    sort_by_list: [{ key: 'start_timestamp', asc: 0 }],
    use_default_language: false,
  });

  const items = Array.isArray(data.info_content) ? data.info_content : [];
  return {
    total: Number(data.total_num || 0),
    items: items.map((item) => {
      const contentId = String(item.content_id || '');
      return {
        id: contentId,
        title: String(item.title || ''),
        date: formatCmsAnnouncementDate(item.pub_timestamp),
        channel: '',
        url: isArena
          ? `https://www.arenabreakoutinfinite.com/en/news.html?content_id=${encodeURIComponent(
              contentId
            )}`
          : `https://www.playdeltaforce.com/en/detail/index.html?content_id=${encodeURIComponent(
              contentId
            )}`,
        image: normalizeAnnouncementImage(item.pic_urls?.[0]),
      };
    }),
  };
}

async function fetchAnnouncementsOnce(game, limit, start, language = 'zh-CN') {
  if (language === 'en') {
    return fetchInternationalAnnouncementsOnce(game, limit, start);
  }
  if (game === '暗区突围') {
    return fetchArenaAnnouncementsOnce(limit, start);
  }
  return fetchDeltaAnnouncementsOnce(limit, start);
}

async function fetchAnnouncements(game, limit, start, language = 'zh-CN') {
  try {
    return await fetchAnnouncementsOnce(game, limit, start, language);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return fetchAnnouncementsOnce(game, limit, start, language);
  }
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        const err = new Error('请求体过大');
        err.statusCode = 413;
        reject(err);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJson(req) {
  const text = await readBody(req);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const err = new Error('请求体不是有效的 JSON');
    err.statusCode = 400;
    throw err;
  }
}

async function handleApi(req, res, pathname, url) {
  try {
    if (req.method === 'GET' && pathname === '/api/codes') {
      refreshCodesFromDisk();
      sendJson(res, 200, { items: sortCodes(codes) });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/backup') {
      if (!isLocalRequest(req)) {
        return sendJson(res, 403, {
          error: 'data 文件夹备份只能在本机操作',
        });
      }
      const targetDirectory = await chooseWindowsBackupDirectory();
      if (!targetDirectory) {
        return sendJson(res, 200, { cancelled: true });
      }
      const result = copyDataBackup(targetDirectory);
      return sendJson(res, 200, {
        cancelled: false,
        ...result,
      });
    }

    if (req.method === 'POST' && pathname === '/api/open-location') {
      if (!isLocalRequest(req)) {
        return sendJson(res, 403, {
          error: '打开文件位置只能在本机操作',
        });
      }
      if (process.platform !== 'win32') {
        return sendJson(res, 501, {
          error: '当前系统不支持打开文件位置',
        });
      }

      try {
        await openExplorerLocation(ROOT);
      } catch {
        return sendJson(res, 500, {
          error: '无法打开文件所在位置',
        });
      }
      return sendJson(res, 200, { ok: true, path: ROOT });
    }

    if (req.method === 'GET' && pathname === '/api/backup') {
      const files = backupFilePayloads();

      sendJson(res, 200, {
        folder: 'data',
        generatedAt: new Date().toISOString(),
        files,
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/codes') {
      const input = await readJson(req);
      const { errors, entry } = validateEntry(input);
      if (errors.length) return sendJson(res, 400, { errors });
      const now = new Date().toISOString();
      const record = { id: randomUUID(), ...entry, createdAt: now, updatedAt: now };
      codes.push(record);
      saveCodes();
      sendJson(res, 201, { item: record });
      return;
    }

    if (req.method === 'PATCH' && pathname === '/api/codes/order') {
      const input = await readJson(req);
      const ids = Array.isArray(input.ids) ? input.ids : [];
      ids.forEach((id, index) => {
        const item = codes.find((entry) => entry.id === id);
        if (item) item.order = index;
      });
      saveCodes();
      return sendJson(res, 200, { items: sortCodes(codes) });
    }

    if (req.method === 'PUT' && pathname.startsWith('/api/codes/')) {
      const id = pathname.slice('/api/codes/'.length);
      const index = codes.findIndex((item) => item.id === id);
      if (index === -1) return sendJson(res, 404, { error: '未找到该配置' });
      const input = await readJson(req);
      const { errors, entry } = validateEntry(input);
      if (errors.length) return sendJson(res, 400, { errors });
      const gameOrder = sortCodes(codes)
        .filter((item) => item.game === entry.game)
        .map((item) => item.id);
      const position = gameOrder.indexOf(id);
      const updated = { ...codes[index], ...entry, updatedAt: new Date().toISOString() };
      codes[index] = updated;
      if (position >= 0) gameOrder.splice(position, 1);
      gameOrder.splice(position < 0 ? gameOrder.length : position, 0, id);
      gameOrder.forEach((itemId, order) => {
        const item = codes.find((entryItem) => entryItem.id === itemId);
        if (item) item.order = order;
      });
      saveCodes();
      sendJson(res, 200, { item: updated });
      return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/codes/')) {
      const id = pathname.slice('/api/codes/'.length);
      const index = codes.findIndex((item) => item.id === id);
      if (index === -1) return sendJson(res, 404, { error: '未找到该配置' });
      codes.splice(index, 1);
      saveCodes();
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/import') {
      const input = await readJson(req);
      const scope = ['delta', 'arenaCodes', 'arenaSettings', 'all'].includes(
        input.scope
      )
        ? input.scope
        : 'all';
      const incoming = Array.isArray(input.items) ? input.items : [];
      const settingsInput =
        input.settings && typeof input.settings === 'object'
          ? input.settings
          : {};

      if (!incoming.length && !Object.keys(settingsInput).length) {
        return sendJson(res, 400, { error: '没有可导入的内容' });
      }
      if (incoming.length > 5000) {
        return sendJson(res, 400, { error: '单次最多导入 5000 条配置码' });
      }

      const imported = new Map();
      const errors = [];
      incoming.forEach((raw, index) => {
        const { errors: entryErrors, entry } = validateEntry(raw);
        if (entryErrors.length) {
          errors.push(`第 ${index + 1} 条：${entryErrors.join('；')}`);
          return;
        }
        if (scope === 'delta' && entry.game !== '三角洲行动') {
          errors.push(`第 ${index + 1} 条：不是三角洲行动改枪码`);
          return;
        }
        if (scope === 'arenaCodes' && entry.game !== '暗区突围') {
          errors.push(`第 ${index + 1} 条：不是暗区突围配置码`);
          return;
        }
        const key = `${entry.game}\u0000${entry.code}`;
        if (imported.has(key)) {
          errors.push(`第 ${index + 1} 条：配置码重复`);
          return;
        }
        imported.set(key, entry);
      });
      if (errors.length) {
        return sendJson(res, 400, {
          error: '导入数据包含无效条目',
          errors,
        });
      }

      if (scope === 'arenaSettings') {
        if (imported.size) {
          return sendJson(res, 400, { error: '设置码导入不能包含配置码' });
        }
        if (!Object.keys(settingsInput).length) {
          return sendJson(res, 400, { error: '没有可导入的设置码' });
        }
      } else if (scope === 'arenaCodes' && !imported.size) {
        return sendJson(res, 400, { error: '没有可导入的暗区突围配置码' });
      } else if (scope === 'delta' && !imported.size) {
        return sendJson(res, 400, { error: '没有可导入的三角洲行动改枪码' });
      }

      if (
        scope !== 'all' &&
        scope !== 'arenaSettings' &&
        Object.keys(settingsInput).length
      ) {
        return sendJson(res, 400, { error: '当前导入范围不接受设置码' });
      }

      const overwrite = input.overwrite === true;
      const currentScopeCount =
        scope === 'delta'
          ? codes.filter((item) => item.game === '三角洲行动').length
          : scope === 'arenaCodes'
          ? codes.filter((item) => item.game === '暗区突围').length
          : scope === 'arenaSettings'
          ? Object.values(settings).filter(Boolean).length
          : codes.length;
      if (currentScopeCount && !overwrite) {
        return sendJson(res, 409, {
          error: '导入会覆盖当前范围内的数据，请确认后重试',
          previousCount: currentScopeCount,
        });
      }

      const previousCount = codes.length;
      const now = new Date().toISOString();
      let added = imported.size;
      let settingsUpdated = false;

      if (scope !== 'arenaSettings') {
        const nextOrders = new Map();
        const importedCodes = [...imported.values()].map((entry) => {
          const order = nextOrders.get(entry.game) || 0;
          nextOrders.set(entry.game, order + 1);
          return {
            id: randomUUID(),
            ...entry,
            order,
            createdAt: now,
            updatedAt: now,
          };
        });

        if (scope === 'all') {
          codes = importedCodes;
        } else if (scope === 'delta') {
          codes = [
            ...codes.filter((item) => item.game !== '三角洲行动'),
            ...importedCodes,
          ];
        } else if (scope === 'arenaCodes') {
          codes = [
            ...codes.filter((item) => item.game !== '暗区突围'),
            ...importedCodes,
          ];
        }
        saveCodes();
      }

      if (scope === 'all' || scope === 'arenaSettings') {
        settings = {
          gameCode: String(
            settingsInput.gameCode == null ? '' : settingsInput.gameCode
          ),
          controlCode: String(
            settingsInput.controlCode == null ? '' : settingsInput.controlCode
          ),
          postCode: String(
            settingsInput.postCode == null ? '' : settingsInput.postCode
          ),
        };
        saveSettings();
        settingsUpdated = true;
      }

      sendJson(res, 200, {
        added,
        previousCount,
        scope,
        overwritten: previousCount > 0 && added > 0,
        settingsUpdated,
        settings,
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/settings') {
      refreshSettingsFromDisk();
      sendJson(res, 200, { item: settings });
      return;
    }

    if (req.method === 'PUT' && pathname === '/api/settings') {
      const input = await readJson(req);
      settings = {
        gameCode: String(input.gameCode == null ? '' : input.gameCode),
        controlCode: String(input.controlCode == null ? '' : input.controlCode),
        postCode: String(input.postCode == null ? '' : input.postCode),
      };
      saveSettings();
      sendJson(res, 200, { item: settings });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/announcements') {
      const game =
        url.searchParams.get('game') === '暗区突围'
          ? '暗区突围'
          : '三角洲行动';
      const limit = Math.min(
        Math.max(Number(url.searchParams.get('limit') || 20), 1),
        50
      );
      const start = Math.max(Number(url.searchParams.get('start') || 0), 0);
      const language =
        url.searchParams.get('lang') === 'en' ? 'en' : 'zh-CN';
      const now = Date.now();
      const gameCacheGroup =
        announcementCache[game] || createAnnouncementCacheGroup();
      announcementCache[game] = gameCacheGroup;
      const gameCache =
        gameCacheGroup[language] || createAnnouncementCache();
      gameCacheGroup[language] = gameCache;

      if (
        start === 0 &&
        gameCache.items.length &&
        now - gameCache.at < ANNOUNCEMENT_CACHE_MS
      ) {
        return sendJson(res, 200, {
          ...gameCache,
          cached: true,
          game,
          language,
        });
      }

      try {
        const result = await fetchAnnouncements(
          game,
          limit,
          start,
          language
        );
        if (start === 0) {
          gameCacheGroup[language] = {
            at: now,
            total: result.total,
            items: result.items,
          };
          saveAnnouncementCache();
        }
        return sendJson(res, 200, { ...result, game, language });
      } catch (err) {
        if (gameCache.items.length) {
          return sendJson(res, 200, {
            ...gameCache,
            cached: true,
            stale: true,
            game,
            language,
            warning:
              language === 'en'
                ? `Network request failed. Showing cached ${gameLabel(game)} announcements.`
                : `网络连接失败，当前显示上次缓存的${gameLabel(game)}公告`,
          });
        }
        return sendJson(res, 502, {
          error:
            language === 'en'
              ? 'Unable to connect to the announcement server. Check your network and try again.'
              : '无法连接公告服务器，请检查网络后重试',
          code: 'ANNOUNCEMENT_NETWORK_ERROR',
        });
      }
    }

    sendJson(res, 404, { error: '接口不存在' });
  } catch (err) {
    sendJson(res, err.statusCode || 500, { error: err.message || '服务器错误' });
  }
}

function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(PUBLIC_DIR, rel);
  const insidePublic =
    filePath === PUBLIC_DIR || filePath.startsWith(PUBLIC_DIR + path.sep);

  if (!insidePublic) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server Error');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}

function lanAddresses() {
  const result = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const info of interfaces[name] || []) {
      if (info.family === 'IPv4' && !info.internal) result.push(info.address);
    }
  }
  return result;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith('/api/')) {
    handleApi(req, res, pathname, url).catch((err) => {
      console.error(err);
      sendJson(res, err.statusCode || 500, { error: err.message || '服务器错误' });
    });
    return;
  }

  serveStatic(req, res, pathname);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，请使用 PORT=xxxx 指定其他端口后重试。`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log('配置码库已启动');
  console.log(`本机访问: http://localhost:${PORT}`);
  for (const addr of lanAddresses()) {
    console.log(`局域网访问: http://${addr}:${PORT}`);
  }
  console.log('按 Ctrl+C 停止服务');
});
