# 常见问题 / FAQ

## 下载哪个文件？ / Which file should I download?

请下载 Release 中的 `Marku-Code-Library.zip`。

Download `Marku-Code-Library.zip` from the Release.

不要下载 `Source code (zip)` 或 `Source code (tar.gz)`，这些只是 GitHub 自动生成的源码包，不能直接双击运行。

Do not download `Source code (zip)` or `Source code (tar.gz)`. These are GitHub-generated source archives and cannot be run by double-clicking.

## 需要安装 Node.js 吗？ / Do I need to install Node.js?

便携版已经包含 Node.js 运行时，不需要额外安装。

The portable version already includes the Node.js runtime, so no extra installation is needed.

从源码运行才需要安装 Node.js：

You only need to install Node.js when running from source:

```bash
node server.js
```

## 为什么 Windows 提示“未知发布者”？ / Why does Windows show "Unknown publisher"?

因为当前程序没有购买代码签名证书，Windows 无法验证发布者身份。

The current program does not have a paid code-signing certificate, so Windows cannot verify the publisher's identity.

请只从本项目的 GitHub Releases 页面下载 `Marku-Code-Library.zip`，然后按以下步骤运行：

Only download `Marku-Code-Library.zip` from this project's GitHub Releases page, then follow these steps:

1. 完整解压压缩包。<br>Extract the archive completely.
2. 双击 `Marku.exe`。<br>Double-click `Marku.exe`.
3. 如果出现“Windows 已保护你的电脑”，点击“更多信息”。<br>If "Windows protected your PC" appears, click "More info".
4. 点击“仍要运行”。<br>Click "Run anyway".
5. 如果出现用户账户控制，选择“是”。<br>If User Account Control appears, choose "Yes".

不要为了运行 Marku 而全局关闭 Windows Defender。如果找不到“仍要运行”，请关闭提示并从官方 Release 页面重新下载。

Do not disable Windows Defender globally just to run Marku. If you cannot find "Run anyway", close the warning and download again from the official Release page.

便携包内的 `WINDOWS-SMARTSCREEN.txt` 也包含相同的处理说明。

The `WINDOWS-SMARTSCREEN.txt` file inside the portable package contains the same instructions.

## 数据保存在哪里？ / Where is the data stored?

数据保存在程序目录下的 `data` 文件夹：

The data is stored in the `data` folder in the program directory:

- `data/codes.json`
- `data/settings.json`

这两个文件不会上传到 GitHub。

These two files are not uploaded to GitHub.

## 如何导入配置码？ / How do I import configuration codes?

打开设置，点击“预览当前配置码”下方的“导入本地配置码”，选择“选择本地TXT文件”，导入由 Marku 导出的 TXT，或包含可识别配置码的 TXT 文件。

Open Settings, click "Import Local Configuration Codes" below "Preview Current Configuration Codes", choose "Select Local TXT File", and import a TXT exported by Marku or a TXT file containing recognizable configuration codes.

同时兼容国际服常见分享格式：暗区突围：无限支持 `Mod Gun-3f...` / `3f...` 改枪码和 `Equipment-...` 配装码；三角洲行动支持 `Operations`、`Warfare`、`Detonation` 改枪码以及 `BLAST6...` 配装码。

Common international sharing formats are also supported: Arena Breakout: Infinite accepts `Mod Gun-3f...` / `3f...` gun build codes and `Equipment-...` loadout codes; Delta Force accepts `Operations`, `Warfare`, and `Detonation` build codes plus `BLAST6...` loadout codes.

导入范围分为四种：

There are four import scopes:

- 三角洲行动改枪码：只覆盖三角洲行动配置<br>Delta Force gun build codes: overwrites only Delta Force configurations
- 暗区突围配装/改枪码：只覆盖暗区突围配置码<br>Arena Breakout loadout/gun build codes: overwrites only Arena Breakout configuration codes
- 暗区突围设置码：只覆盖设置码<br>Arena Breakout settings codes: overwrites only settings codes
- 全部配置码：覆盖三角洲行动配置、暗区突围配置码和设置码<br>All configuration codes: overwrites Delta Force configurations, Arena Breakout configuration codes, and settings codes

分类导入不会清除未选范围的数据。

Categorized import does not clear data outside the selected scope.

程序会先执行独立检查，不会立即写入数据：

The program runs an independent check first and does not write data immediately:

1. 校验游戏名称、配置类型、枪械描述、价格和代码。<br>Validates game name, configuration type, weapon description, price, and code.
2. 发现残缺或格式错误时显示具体行号，并阻止导入。<br>Shows specific line numbers and blocks the import when incomplete or malformed data is found.
3. 检查通过后显示导入数量和覆盖提示。<br>After the check passes, shows the import count and overwrite notice.
4. 只有再次确认后才会替换 `codes.json` 并更新设置码。<br>Only after a second confirmation does it replace `codes.json` and update settings codes.

标准格式示例：

Standard format example:

```text
暗区突围：无限

------------------------------

满改AEK | 64W | 改枪码 | 改枪-xxxxxxxx

三角洲行动

------------------------------

腾龙红点30发 | 65W | 腾龙突击步枪-烽火地带-xxxxxxxx
```

导入检查兼容 UTF-8 BOM、Windows 换行、全角竖线、Tab、逗号、Markdown 标题和常见列表前缀，也可以在没有游戏标题时按代码格式自动识别。

The import check supports UTF-8 BOM, Windows line endings, full-width vertical bars, tabs, commas, Markdown headings, and common list prefixes. It can also auto-detect by code format when game titles are missing.

暗区突围代码通过 `改枪-`、`配装-`、`游戏-`、`控制-`、`后处理-` 前缀判断；三角洲行动代码通过“枪械-模式-代码”的结构判断。若文件中混入与当前导入范围不一致的代码，检查会直接拦截。

Arena Breakout codes are identified by the prefixes `改枪-`, `配装-`, `游戏-`, `控制-`, and `后处理-`; Delta Force codes are identified by the "weapon-mode-code" structure. If the file contains codes that do not match the current import scope, the check blocks the import immediately.

暗区突围：无限的配置类型可以省略。当代码以 `改枪-` 开头时会识别为改枪码，以 `配装-` 开头时会识别为配装码。

The configuration type can be omitted for Arena Breakout: Infinite. A code starting with `改枪-` is recognized as a gun build code, and one starting with `配装-` is recognized as a loadout code.

例如：

For example:

```text
强农卡战备，30W，配装-efZ9dm5RUYCR5f4P4
```

选择“全部配置码”时，如果文件缺少暗区突围设置码，程序会提示：

When "All configuration codes" is selected and the file is missing Arena Breakout settings codes, the program shows:

```text
“全部配置码”导入缺少暗区突围设置码。
如继续导入，设置码将被覆盖为空白。
```

用户确认后才会执行空白覆盖，取消则不会修改任何数据。

The blank overwrite is performed only after user confirmation; canceling leaves all data unchanged.

## 换电脑怎么迁移？ / How do I migrate to a new computer?

关闭程序，然后复制整个 `data` 文件夹到新电脑对应的程序目录中。

Close the program, then copy the entire `data` folder to the corresponding program directory on the new computer.

## 如何备份 data 文件夹？ / How do I back up the data folder?

打开“预览当前配置码”弹窗，点击导出按钮左侧的备份按钮。

Open the "Preview Current Configuration Codes" dialog and click the backup button to the left of the export button.

1. 系统会打开文件夹选择窗口。<br>The system opens a folder selection window.
2. 选择希望保存备份的位置。<br>Choose where to save the backup.
3. Marku 会在该位置创建 `Marku-data-时间戳/data` 文件夹，相当于复制一份完整的 data 文件夹。<br>Marku creates a `Marku-data-timestamp/data` folder at that location, equivalent to copying the entire data folder.
4. 备份中包含当前 `data` 目录里的 `codes.json`、`settings.json`、公告缓存和数据说明。<br>The backup includes `codes.json`, `settings.json`, announcement cache, and the data readme from the current `data` directory.

如果当前浏览器环境不支持目录选择，会自动下载一个 JSON 格式的完整备份文件。

If the current browser environment does not support directory selection, a complete JSON backup file is downloaded automatically.

## 更新版本会覆盖数据吗？ / Will updating the version overwrite my data?

替换程序文件时请保留原来的 `data` 文件夹，否则本地配置会被空模板替换。

Keep the original `data` folder when replacing program files; otherwise your local configuration will be replaced by an empty template.

## 可以多人共用一份数据吗？ / Can multiple people share one data set?

当前版本以本地数据为主。局域网内可以让一台电脑运行程序，其他电脑通过局域网地址访问。

The current version is primarily designed for local data. On a LAN, one computer can run the program and other computers can access it through the LAN address.

不同地点的朋友共用数据需要一台持续在线的服务器或其他托管服务。

Sharing data with friends in different locations requires an always-online server or another hosting service.

## 为什么复制按钮没有反应？ / Why does the copy button not respond?

请使用 `localhost` 或 `127.0.0.1` 打开网站，并允许浏览器访问剪贴板。

Open the site using `localhost` or `127.0.0.1`, and allow the browser to access the clipboard.

## 公告加载失败怎么办？ / What should I do if announcements fail to load?

公告来自腾讯官方接口，需要正常联网。

Announcements come from Tencent's official APIs and require a working internet connection.

1. 点击公告弹窗右上角的刷新按钮重试。<br>Click the refresh button in the top-right corner of the announcement dialog to retry.
2. 确认浏览器可以正常访问其他网站。<br>Make sure the browser can access other websites normally.
3. 从系统托盘退出 Marku，然后重新双击 `Marku.exe`。<br>Exit Marku from the system tray, then double-click `Marku.exe` again.
4. 如果 Windows 防火墙提示，请允许 Marku 或 Node.js 访问网络。<br>If Windows Firewall prompts, allow Marku or Node.js to access the network.
5. 尝试更换网络，例如从 Wi-Fi 切换到手机热点。<br>Try switching networks, for example from Wi-Fi to a mobile hotspot.
6. 关闭 VPN、系统代理或切换公司、学校网络后再试。<br>Turn off VPNs or system proxies, or switch away from corporate/school networks, then try again.

如果之前成功获取过公告，断网时软件会继续显示最后一次缓存的内容。

If announcements were fetched successfully before, the app will keep showing the last cached content when offline.

## 这个项目有登录和权限控制吗？ / Does this project have login and access control?

没有。当前版本适合私人电脑或可信局域网使用，不要直接暴露到公网。

No. The current version is suitable for private computers or trusted LANs; do not expose it directly to the public internet.
