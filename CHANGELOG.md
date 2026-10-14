# Changelog

本项目的重要更新记录在此文件中。

## [1.1.2] - 2026-10-14

### Added

- README、FAQ 和便携包新增 Windows SmartScreen“未知发布者”处理说明
- 增加 `WINDOWS-SMARTSCREEN.txt` 中英文运行提示

### Downloads

- [Marku v1.1.2](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/tag/v1.1.2)

## [1.1.1] - 2026-10-14

### Changed

- 调整顺序模式的宽度变化增加 0.75 秒平滑过渡
- 卡片间距由 16px 调整为 8px
- 将“参数查询”更名为“预览配置码”
- 关闭按钮和设置按钮不再显示悬浮提示
- 弹窗打开动画改为纯淡入，避免位置和尺寸发生细微变化

### Fixed

- 修复编辑配置后卡片跳到列表顶部的问题，现在会保持原位置
- 修复弹窗打开时出现的轻微抖动
- 清理未使用的样式、函数和冗余服务端接口

### Downloads

- [Marku v1.1.1](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/tag/v1.1.1)

## [1.1.0] - 2026-10-14

### Added

- 设置页面新增 GitHub 反馈入口和新版设置交互
- 参数查询新增 TXT 导出
- 暗区突围和三角洲行动分别获取各自官方更新公告
- 暗区突围公告切换为《暗区突围：无限》端游公告
- 公告请求增加超时、自动重试和分游戏缓存
- 搜索框逐字输入、空格展开和清空动画
- 搜索结果与类型筛选结果的逐项入场动画
- 设置滑块液态拉伸动画

### Changed

- 主题切换改为平滑渐变动画
- 统一设置组件的悬浮交互和文字动画
- 浏览器标题改为 Marku，并增加项目图标

### Fixed

- 修复暗区页签误用三角洲公告的问题
- 修复公告接口失败时直接显示 `fetch failed` 的问题
- 修复窄窗口下卡片操作区错误换行的问题
- 修复连续点击复制按钮时动画不重复的问题

### Downloads

- [Marku v1.1.0](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/tag/v1.1.0)

## [1.0.0] - 2026-10-13

### Added

- 暗区突围和三角洲行动双游戏页签
- 改枪码和配装码管理
- 暗区突围设置码管理
- 枪械描述搜索，支持拼音和拼音首字母
- 类型筛选、配置详情和复制反馈
- 拖动调整配置顺序
- 白天和黑夜主题
- 参数查询功能
- 参数查询 TXT 导出
- Windows 便携版
- 本地 JSON 数据存储

### Downloads

- [Marku v1.0.0](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/tag/v1.0.0)
