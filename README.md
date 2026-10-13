# Marku FPS Config Code Library

一个轻量的游戏配置码管理网站，用于记录《暗区突围》和《三角洲行动》的改枪码、配装码和暗区设置码。

## 功能

- 暗区突围、三角洲行动双游戏页签
- 改枪码、配装码管理
- 暗区突围设置码管理
- 按枪械描述搜索，支持拼音和拼音首字母
- 类型筛选、卡片详情、复制反馈
- 手动拖动调整顺序
- 白天 / 黑夜主题
- 预览配置码与 TXT 导出
- 双游戏官方更新公告与本地缓存
- 应用内反馈入口与 GitHub Issue 模板
- 数据保存在本地 JSON 文件
- 原生 HTML / CSS / JavaScript，无前端构建步骤

## 下载便携版

普通用户请下载最新 Release 中的 `Marku-Code-Library.zip`。完整解压后双击 `Marku.exe` 即可运行。

[下载最新版本](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/latest)

## 运行

需要 Node.js 18 或更高版本。

```bash
node server.js
```

默认访问地址：

```text
http://localhost:3000
```

可指定端口：

```powershell
$env:PORT=8080; node server.js
```

## 数据

运行时会自动创建：

- `data/codes.json`
- `data/settings.json`

这两个文件已加入 `.gitignore`，不会上传个人配置。备份时复制整个 `data` 文件夹即可。

## 文档

- [更新日志](CHANGELOG.md)
- [常见问题](FAQ.md)
- [反馈问题或建议](https://github.com/26434288-a11y/marku-fps-config-code-library/issues/new/choose)
- [MIT License](LICENSE)

## 安全

当前版本没有账号和权限控制，适合在可信的局域网或私人环境中使用。不要直接将服务暴露到公网。

## 第三方资源

拼音搜索使用 `pinyin-pro`，许可证保存在 `public/vendor/pinyin-pro.LICENSE`。
