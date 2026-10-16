# Marku FPS Config Code Library

一个轻量的游戏配置码管理网站，用于记录《暗区突围：无限》和《三角洲行动》的改枪码、配装码和暗区设置码。

A lightweight game configuration code manager for storing gun build codes, loadout codes, and Arena Breakout settings codes for Arena Breakout: Infinite and Delta Force.

## 功能 / Features

- 暗区突围：无限、三角洲行动双游戏页签<br>Arena Breakout: Infinite and Delta Force dual game tabs
- 改枪码、配装码管理<br>Gun build code and loadout code management
- 暗区突围：无限设置码管理<br>Arena Breakout: Infinite settings code management
- 按枪械描述搜索，支持拼音和拼音首字母<br>Search by weapon description, with pinyin and pinyin initial support
- 类型筛选、卡片详情、复制反馈<br>Type filtering, card details, and copy feedback
- 手动拖动调整顺序<br>Manual drag-and-drop reordering
- 白天 / 黑夜主题<br>Light / dark theme
- 预览配置码，支持分类导入、严格校验、TXT 导出和 data 文件夹备份<br>Preview configuration codes with categorized import, strict validation, TXT export, and data folder backup
- 双游戏官方更新公告与本地缓存<br>Official update announcements for both games with local caching
- 应用内反馈入口与 GitHub Issue 模板<br>In-app feedback entry and GitHub issue templates
- 数据保存在本地 JSON 文件<br>Data stored in local JSON files
- 原生 HTML / CSS / JavaScript，无前端构建步骤<br>Native HTML / CSS / JavaScript with no frontend build step

## 下载便携版 / Portable Download

普通用户请下载最新 Release 中的 `Marku-Code-Library.zip`。完整解压后双击 `Marku.exe` 即可运行。

Regular users should download `Marku-Code-Library.zip` from the latest Release. Extract it completely, then double-click `Marku.exe` to run.

[下载最新版本 / Download the latest version](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/latest)

## Windows 首次运行提示 / Windows First-Run Notice

Marku 当前没有购买代码签名证书，因此 Windows SmartScreen 可能显示“未知发布者”或“Windows 已保护你的电脑”。

Marku does not currently have a paid code-signing certificate, so Windows SmartScreen may show "Unknown publisher" or "Windows protected your PC".

如果出现该提示：

If you see this warning:

1. 点击“更多信息”。<br>Click "More info".
2. 点击“仍要运行”。<br>Click "Run anyway".
3. 如果随后出现用户账户控制，选择“是”。<br>If Windows User Account Control appears, choose "Yes".

请只从本项目的 GitHub Releases 页面下载文件，不要全局关闭 Windows Defender。详细说明见 [WINDOWS-SMARTSCREEN.txt](WINDOWS-SMARTSCREEN.txt)。

Only download files from this project's GitHub Releases page, and do not disable Windows Defender globally. See [WINDOWS-SMARTSCREEN.txt](WINDOWS-SMARTSCREEN.txt) for details.

## 运行 / Running

需要 Node.js 18 或更高版本。

Node.js 18 or later is required.

```bash
node server.js
```

默认访问地址：

Default address:

```text
http://localhost:3000
```

可指定端口：

You can also specify a port:

```powershell
$env:PORT=8080; node server.js
```

## 数据 / Data

运行时会自动创建：

The following files are created automatically at runtime:

- `data/codes.json`
- `data/settings.json`

这两个文件已加入 `.gitignore`，不会上传个人配置。备份时复制整个 `data` 文件夹即可。

Both files are listed in `.gitignore`, so personal configurations are not uploaded. To back up, copy the entire `data` folder.

## 文档 / Documentation

- [更新日志 / Changelog](CHANGELOG.md)
- [常见问题 / FAQ](FAQ.md)
- [反馈问题或建议 / Report an issue or suggestion](https://github.com/26434288-a11y/marku-fps-config-code-library/issues/new/choose)
- [MIT License](LICENSE)

## 安全 / Security

当前版本没有账号和权限控制，适合在可信的局域网或私人环境中使用。不要直接将服务暴露到公网。

The current version has no accounts or access control. It is suitable for private computers or trusted LAN environments. Do not expose the service directly to the public internet.

## 第三方资源 / Third-Party Resources

拼音搜索使用 `pinyin-pro`，许可证保存在 `public/vendor/pinyin-pro.LICENSE`。

Pinyin search uses `pinyin-pro`; its license is saved at `public/vendor/pinyin-pro.LICENSE`.
