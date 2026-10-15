# Changelog

本项目的重要更新记录在此文件中。

Important updates to this project are recorded in this file.

## [1.3.0] - 2026-10-16

### Added

- 三角洲行动新增烽火地带改枪码、全面战场改枪码、黑潮爆破改枪码和黑潮爆破配装码，并支持按代码格式自动识别和筛选<br>Added Delta Force Operations weapon build codes, Warfare weapon build codes, Black Tide weapon build codes, and Black Tide loadout codes, with automatic recognition and filtering based on code format
- 新增“清空筛选”；筛选生效时禁止进入调整顺序模式，并显示原因提示<br>Added "Clear filters"; reorder mode is disabled while filters are active and now explains why
- 游戏标题和页签新增暗区突围：无限、三角洲行动官方图标，移动端标题仅保留缩小后的游戏图标<br>Added official Arena Breakout: Infinite and Delta Force icons to the game title and tabs; mobile view keeps only the smaller game icon
- 移动端卡片操作合并为“更多操作”菜单，可复制、编辑和删除<br>Combined mobile card actions into a More Actions menu for copy, edit, and delete
- 新增/编辑页面支持按 Enter 提交，代码文本框不再插入换行<br>Added Enter-to-submit support to the add/edit form, including the code text area
- GitHub 留言入口新增跳转确认提示<br>Added a navigation confirmation prompt to the GitHub feedback entry

### Changed

- 三角洲行动新增/编辑表单根据模式动态调整价格、单位和描述字段<br>Delta Force add/edit fields now adapt pricing, units, and descriptions to the selected mode
- 暗区突围新增/编辑表单根据类型显示“枪械描述”或“配装描述”<br>Arena Breakout: Infinite now shows either weapon description or loadout description based on the selected type
- 移动端响应式断点由 640px 调整为 480px<br>Adjusted the mobile breakpoint from 640px to 480px
- 桌面端项目图标与游戏图标统一为 26px，移动端统一为 20px<br>Unified the project and game icons at 26px on desktop and 20px on mobile
- 卡片高度调整并统一搜索框、筛选框和操作按钮尺寸<br>Adjusted the card height and unified the search, filter, and action control sizes
- 移动端筛选菜单与触发框对齐，选项保持单行并显示省略号<br>Aligned the mobile filter menu with its trigger and kept options on one line with ellipsis
- “导入配置码”改为“导入本地配置码”，“选择 TXT 文件”改为“选择本地TXT文件”<br>Renamed "Import Configuration Codes" to "Import Local Configuration Codes" and "Select TXT File" to "Select Local TXT File"

### Fixed

- 修复点击游戏页签时短暂出现横向滚动条的问题<br>Fixed the horizontal scrollbar briefly appearing when switching game tabs
- 修复移动端筛选选项换行和菜单错位的问题<br>Fixed mobile filter options wrapping and menu misalignment
- 修复桌面端错误显示移动端“更多操作”按钮的问题<br>Fixed the mobile More Actions button incorrectly appearing on desktop
- 修复移动端页签、操作区和标题栏在窄屏下相互挤压的问题<br>Fixed crowding between mobile tabs, card actions, and the title bar on narrow screens

### Downloads

- [Marku v1.3.0](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/tag/v1.3.0)

## [1.2.0] - 2026-10-15

### Added

- 新增分类导入，支持三角洲改枪码、暗区配装/改枪码、暗区设置码和全部配置码<br>Added categorized import for Delta Force weapon build codes, Arena Breakout loadout/weapon build codes, Arena Breakout settings codes, and all configuration codes
- 导入支持游戏分区和无分区代码格式自动识别，并校验混合类型和残缺信息<br>Import now auto-detects both game-sectioned and non-sectioned code formats, and validates mixed types and incomplete information
- 预览配置码新增 data 文件夹备份入口<br>Added a data folder backup entry to Preview Configuration Codes
- 设置新增“打开文件所在位置”，使用原生启动器快速打开并置前资源管理器<br>Added "Open file location" in Settings, using the native launcher to quickly open and focus File Explorer
- 分类导入选项新增单选框动画、悬浮阴影和默认未选择状态<br>Added radio button animation, hover shadow, and a default unselected state to categorized import options

### Changed

- 暗区突围名称统一为“暗区突围：无限”<br>Standardized the game name to "Arena Breakout: Infinite"
- data 文件被外部覆盖后自动重新读取，页面会自动刷新列表<br>Data files are automatically re-read after being overwritten externally, and the page refreshes the list automatically
- 优化便携版启动器，避免每次调用 PowerShell 和现场编译 Win32 调用<br>Optimized the portable launcher to avoid invoking PowerShell and compiling Win32 calls on every run

### Fixed

- 修复无标题、代码前置、代码与枪械名无分隔符等导入格式无法识别的问题<br>Fixed import formats that were not recognized, such as missing titles, codes placed before names, and missing separators between codes and weapon names
- 修复导入数据覆盖后页面仍显示旧数据的问题<br>Fixed the page still showing old data after imported data overwrote it
- 修复公告离线缓存提示和游戏名称显示<br>Fixed the offline announcement cache notice and game name display

### Downloads

- [Marku v1.2.0](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/tag/v1.2.0)

## [1.1.2] - 2026-10-14

### Added

- README、FAQ 和便携包新增 Windows SmartScreen“未知发布者”处理说明<br>Added Windows SmartScreen "Unknown publisher" instructions to README, FAQ, and the portable package
- 增加 `WINDOWS-SMARTSCREEN.txt` 中英文运行提示<br>Added bilingual Chinese/English first-run instructions to `WINDOWS-SMARTSCREEN.txt`

### Downloads

- [Marku v1.1.2](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/tag/v1.1.2)

## [1.1.1] - 2026-10-14

### Changed

- 调整顺序模式的宽度变化增加 0.75 秒平滑过渡<br>Added a 0.75-second smooth transition when reorder mode changes width
- 卡片间距由 16px 调整为 8px<br>Changed card spacing from 16px to 8px
- 将“参数查询”更名为“预览配置码”<br>Renamed "Parameter Query" to "Preview Configuration Codes"
- 关闭按钮和设置按钮不再显示悬浮提示<br>Removed hover tooltips from the close and Settings buttons
- 弹窗打开动画改为纯淡入，避免位置和尺寸发生细微变化<br>Changed dialog opening animation to a pure fade-in to avoid subtle position and size changes

### Fixed

- 修复编辑配置后卡片跳到列表顶部的问题，现在会保持原位置<br>Fixed edited cards jumping to the top of the list; they now keep their original position
- 修复弹窗打开时出现的轻微抖动<br>Fixed the subtle wobble when dialogs open
- 清理未使用的样式、函数和冗余服务端接口<br>Removed unused styles, functions, and redundant server endpoints

### Downloads

- [Marku v1.1.1](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/tag/v1.1.1)

## [1.1.0] - 2026-10-14

### Added

- 设置页面新增 GitHub 反馈入口和新版设置交互<br>Added a GitHub feedback entry and new Settings interactions
- 参数查询新增 TXT 导出<br>Added TXT export to Parameter Query
- 暗区突围和三角洲行动分别获取各自官方更新公告<br>Arena Breakout: Infinite and Delta Force now fetch their own official update announcements
- 暗区突围公告切换为《暗区突围：无限》端游公告<br>Switched Arena Breakout announcements to Arena Breakout: Infinite PC announcements
- 公告请求增加超时、自动重试和分游戏缓存<br>Added timeouts, automatic retries, and per-game caching to announcement requests
- 搜索框逐字输入、空格展开和清空动画<br>Added character-by-character input, space expansion, and clear animations to the search box
- 搜索结果与类型筛选结果的逐项入场动画<br>Added item-by-item entrance animations to search results and type filter results
- 设置滑块液态拉伸动画<br>Added a liquid stretch animation to settings sliders

### Changed

- 主题切换改为平滑渐变动画<br>Changed theme switching to a smooth gradient animation
- 统一设置组件的悬浮交互和文字动画<br>Unified hover interactions and text animations across settings components
- 浏览器标题改为 Marku，并增加项目图标<br>Changed the browser title to Marku and added a project icon

### Fixed

- 修复暗区页签误用三角洲公告的问题<br>Fixed the Arena Breakout tab incorrectly using Delta Force announcements
- 修复公告接口失败时直接显示 `fetch failed` 的问题<br>Fixed the announcement API showing `fetch failed` directly on failure
- 修复窄窗口下卡片操作区错误换行的问题<br>Fixed the card action area wrapping incorrectly in narrow windows
- 修复连续点击复制按钮时动画不重复的问题<br>Fixed the copy button animation not replaying on repeated clicks

### Downloads

- [Marku v1.1.0](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/tag/v1.1.0)

## [1.0.0] - 2026-10-13

### Added

- 暗区突围和三角洲行动双游戏页签<br>Dual game tabs for Arena Breakout: Infinite and Delta Force
- 改枪码和配装码管理<br>Weapon build code and loadout code management
- 暗区突围设置码管理<br>Arena Breakout settings code management
- 枪械描述搜索，支持拼音和拼音首字母<br>Weapon description search with pinyin and pinyin initial support
- 类型筛选、配置详情和复制反馈<br>Type filtering, configuration details, and copy feedback
- 拖动调整配置顺序<br>Drag-and-drop configuration reordering
- 白天和黑夜主题<br>Light and dark themes
- 参数查询功能<br>Parameter Query
- 参数查询 TXT 导出<br>Parameter Query TXT export
- Windows 便携版<br>Windows portable version
- 本地 JSON 数据存储<br>Local JSON data storage

### Downloads

- [Marku v1.0.0](https://github.com/26434288-a11y/marku-fps-config-code-library/releases/tag/v1.0.0)
