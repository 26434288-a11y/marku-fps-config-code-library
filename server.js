const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { randomUUID } = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_FILE = path.join(ROOT, 'data', 'codes.json');
const SETTINGS_FILE = path.join(ROOT, 'data', 'settings.json');
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
const ANNOUNCEMENT_CACHE_VERSION = 2;
let announcementCache = loadAnnouncementCache();

function createAnnouncementCache() {
  return { at: 0, total: 0, items: [] };
}

function normalizeAnnouncementCache(value) {
  if (!value || typeof value !== 'object') return createAnnouncementCache();
  return {
    at: Number(value.at || 0),
    total: Number(value.total || 0),
    items: Array.isArray(value.items) ? value.items : [],
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
      暗区突围: normalizeAnnouncementCache(games['暗区突围'] || parsed.arena),
      三角洲行动: normalizeAnnouncementCache(
        games['三角洲行动'] || parsed.delta || parsed
      ),
    };
  } catch (err) {
    return {
      暗区突围: createAnnouncementCache(),
      三角洲行动: createAnnouncementCache(),
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

async function fetchAnnouncementsOnce(game, limit, start) {
  if (game === '暗区突围') {
    return fetchArenaAnnouncementsOnce(limit, start);
  }
  return fetchDeltaAnnouncementsOnce(limit, start);
}

async function fetchAnnouncements(game, limit, start) {
  try {
    return await fetchAnnouncementsOnce(game, limit, start);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return fetchAnnouncementsOnce(game, limit, start);
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
      sendJson(res, 200, { items: sortCodes(codes) });
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
      const updated = { ...codes[index], ...entry, updatedAt: new Date().toISOString() };
      codes[index] = updated;
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

    if (req.method === 'GET' && pathname === '/api/export') {
      sendJson(res, 200, { items: sortCodes(codes), exportedAt: new Date().toISOString() });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/import') {
      const input = await readJson(req);
      const incoming = Array.isArray(input) ? input : input.items;
      if (!Array.isArray(incoming)) return sendJson(res, 400, { error: '导入数据格式不正确' });

      let added = 0;
      let updated = 0;
      let skipped = 0;

      for (const raw of incoming) {
        if (!raw || typeof raw !== 'object') {
          skipped += 1;
          continue;
        }
        const { errors, entry } = validateEntry(raw);
        if (errors.length) {
          skipped += 1;
          continue;
        }
        const now = new Date().toISOString();
        const existing = raw.id && codes.find((item) => item.id === raw.id);
        if (existing) {
          Object.assign(existing, entry, { updatedAt: now });
          updated += 1;
        } else {
          codes.push({ id: randomUUID(), ...entry, createdAt: now, updatedAt: now });
          added += 1;
        }
      }

      saveCodes();
      sendJson(res, 200, { added, updated, skipped });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/settings') {
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
      const now = Date.now();
      const gameCache =
        announcementCache[game] || createAnnouncementCache();
      announcementCache[game] = gameCache;

      if (
        start === 0 &&
        gameCache.items.length &&
        now - gameCache.at < ANNOUNCEMENT_CACHE_MS
      ) {
        return sendJson(res, 200, { ...gameCache, cached: true, game });
      }

      try {
        const result = await fetchAnnouncements(game, limit, start);
        if (start === 0) {
          announcementCache[game] = {
            at: now,
            total: result.total,
            items: result.items,
          };
          saveAnnouncementCache();
        }
        return sendJson(res, 200, { ...result, game });
      } catch (err) {
        if (gameCache.items.length) {
          return sendJson(res, 200, {
            ...gameCache,
            cached: true,
            stale: true,
            game,
            warning: `网络连接失败，当前显示上次缓存的${game}公告`,
          });
        }
        return sendJson(res, 502, {
          error: '无法连接公告服务器，请检查网络后重试',
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
