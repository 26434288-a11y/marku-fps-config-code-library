(() => {
  "use strict";

  const ZH_TO_EN = {
    "暗区突围：无限": "Arena Breakout: Infinite",
    暗区突围: "Arena Breakout: Infinite",
    三角洲行动: "Delta Force",
    改枪码: "Gun Build Code",
    配装码: "Loadout Code",
    烽火地带改枪码: "Operations Gun Build Code",
    全面战场改枪码: "Warfare Gun Build Code",
    黑潮爆破改枪码: "Black Tide Demolition Gun Build Code",
    黑潮爆破配装码: "Black Tide Demolition Loadout Code",

    设置: "Settings",
    语言: "Language",
    中文: "中文",
    English: "English",
    主题切换: "Theme",
    白天: "Light",
    黑夜: "Dark",
    游戏选择: "Game Selection",
    我都玩: "All Games",
    预览当前配置码: "Preview Current Configuration Codes",
    导入本地配置码: "Import Local Configuration Codes",
    打开文件所在位置: "Open File Location",
    "来Github给我留言吧!": "Leave Feedback on GitHub",
    分类导入: "Categorized Import",
    导入范围: "Import Scope",
    三角洲行动改枪码: "Delta Force Gun Build Codes",
    "暗区突围配装/改枪码":
      "Arena Breakout: Infinite Loadout/Gun Build Codes",
    暗区突围设置码: "Arena Breakout: Infinite Settings Codes",
    全部配置码: "All Configuration Codes",
    选择本地TXT文件: "Select Local TXT File",
    预览配置码: "Preview Configuration Codes",
    "备份 data 文件夹": "Back Up data Folder",
    "导出 TXT": "Export TXT",
    复制全部: "Copy All",
    设置码: "Settings Code",
    游戏设置码: "Game Settings Code",
    控制设置码: "Control Settings Code",
    后处理设置码: "Post-Processing Settings Code",
    编辑设置码: "Edit Settings Code",
    游戏: "Game",
    控制: "Control",
    后处理: "Post-Processing",
    粘贴游戏设置码: "Paste game settings code",
    粘贴控制设置码: "Paste control settings code",
    粘贴后处理设置码: "Paste post-processing settings code",

    查看最新公告: "View Latest Announcements",
    调整顺序: "Reorder",
    保存顺序: "Save Order",
    请先清空筛选: "Clear filters first",
    新增: "Add",
    编辑: "Edit",
    删除: "Delete",
    复制: "Copy",
    保存: "Save",
    关闭: "Close",
    详情: "Details",
    确认: "Confirm",
    确定: "Confirm",
    取消: "Cancel",
    更多操作: "More Actions",
    拖拽排序: "Drag to reorder",
    "搜索......": "Search...",
    清空搜索: "Clear Search",
    全部类型: "All Types",
    清空筛选: "Clear Filters",
    类型: "Type",
    请选择: "Select",
    枪械描述: "Weapon Description",
    配装描述: "Loadout Description",
    描述: "Description",
    价格: "Price",
    代码: "Code",
    配装方案码: "Loadout Code",
    粘贴完整代码: "Paste the complete code",
    "例如：QJB201两倍45发": "e.g. QJB201 2x 45-round",
    "例如：30": "e.g. 30",
    "例如：3300": "e.g. 3300",
    "例如：H416": "e.g. H416",
    "例如：五套AEK": "e.g. T5 AEK loadout",
    "例如：攻防兼备": "e.g. Balanced attack and defense",
    请输入描述: "Enter a description",
    无: "None",

    最新更新公告: "Latest Update Announcements",
    刷新: "Refresh",
    加载中: "Loading...",
    加载失败: "Failed to load",
    暂无更新公告: "No update announcements",
    公告加载失败: "Failed to load announcements",
    "请检查网络，然后点击右上角刷新重试。":
      "Check your network, then click Refresh in the top-right corner.",
    "离线缓存 · 正在显示上次获取的公告":
      "Offline cache · Showing the last fetched announcements",
    "检测到 data 更新，列表已刷新":
      "Data changes detected. The list has been refreshed.",

    没有符合条件的配置: "No matching configurations",
    还没有配置: "No configurations yet",
    换个筛选条件试试: "Try changing the filters",
    "点击右上角「新增」开始添加":
      "Click Add in the top-right corner to get started",
    暂无配置码: "No configuration codes",
    请选择类型: "Please select a type",
    所选类型与代码模式不一致:
      "The selected type does not match the code mode",
    枪械描述不能为空: "Weapon description cannot be empty",
    配装描述不能为空: "Loadout description cannot be empty",
    描述不能为空: "Description cannot be empty",
    代码不能为空: "Code cannot be empty",
    保存失败: "Failed to save",
    已保存: "Saved",
    已添加: "Added",
    "网络错误，请稍后重试": "Network error. Please try again later.",
    顺序已保存: "Order saved",
    保存顺序失败: "Failed to save order",
    已清空筛选: "Filters cleared",
    "已清空其他内容": "Other fields were cleared",
    "请先清空筛选和搜索": "Clear filters and search first",
    删除配置: "Delete Configuration",
    删除失败: "Failed to delete",
    已删除: "Deleted",
    未保存的修改: "Unsaved Changes",
    "有未保存的修改，确定关闭吗？":
      "You have unsaved changes. Close anyway?",
    切换类型: "Change Type",
    清空并切换: "Clear and Switch",
    跳转提示: "Navigation Notice",
    前往Github: "Go to GitHub",
    "前往 Github": "Go to GitHub",
    "前往 GitHub": "Go to GitHub",
    "该操作将跳转到 GitHub 反馈页面，是否继续？":
      "This will open the GitHub feedback page. Continue?",

    没有可复制的配置码: "No configuration codes to copy",
    "已复制全部配置码": "All configuration codes copied",
    "复制失败，请手动选择": "Copy failed. Select the text manually.",
    没有可复制的设置码: "No settings codes to copy",
    已复制设置码: "Settings code copied",
    无法读取文件: "Unable to read the file",
    没有可导出的配置码: "No configuration codes to export",
    "Marku配置码.txt": "Marku-configuration-codes.txt",
    文本文件: "Text file",
    已导出: "Exported",
    "导出失败，请重试": "Export failed. Please try again.",
    设置码加载失败: "Failed to load settings codes",
    "保存失败，请稍后重试": "Failed to save. Please try again later.",
    "无法打开文件所在位置": "Unable to open the file location",
    已打开文件所在位置: "File location opened",
    "正在打开文件所在位置...": "Opening the file location...",
    "请选择备份位置": "Choose a backup location",
    "正在打开文件夹选择器...": "Opening the folder picker...",
    "data 文件夹备份完成": "data folder backup completed",
    已备份: "Backed up",
    "备份 data 文件夹": "Back Up data Folder",
    "备份失败": "Backup failed",
    "读取备份数据失败": "Failed to read backup data",
    "浏览器不支持选择文件夹，已下载 JSON 格式备份":
      "Folder selection is not supported. A JSON backup was downloaded.",

    导入检查失败: "Import Check Failed",
    知道了: "OK",
    确认导入: "Confirm Import",
    导入失败: "Import failed",
    请先选择导入范围: "Select an import scope first",
    未找到该配置: "Configuration not found",
    未识别到三角洲行动改枪码: "No Delta Force Gun Build Code was found",
    未识别到暗区突围配装改枪码:
      "No Arena Breakout: Infinite Loadout/Gun Build Code was found",
    "未识别到暗区突围配装/改枪码":
      "No Arena Breakout: Infinite Loadout/Gun Build Code was found",
    未识别到暗区突围设置码:
      "No Arena Breakout: Infinite settings code was found",
    未识别到可导入内容: "No importable content was found",
    "当前导入范围不允许包含暗区突围配置码":
      "Arena Breakout: Infinite configuration codes are not allowed in this import scope",
    "当前导入范围不允许包含暗区突围设置码":
      "Arena Breakout: Infinite settings codes are not allowed in this import scope",
    "当前导入范围不允许包含三角洲行动改枪码":
      "Delta Force Gun Build Codes are not allowed in this import scope",
    "当前导入范围不允许包含配置码":
      "Configuration codes are not allowed in this import scope",
    "当前导入范围不接受设置码":
      "Settings codes are not accepted in this import scope",
    "未知的导入范围": "Unknown import scope",
    导入数据包含无效条目: "Import data contains invalid entries",
    "没有可导入的内容": "There is no importable content",
    "单次最多导入 5000 条配置码":
      "A single import can contain at most 5,000 configuration codes",
    "导入会覆盖当前范围内的数据，请确认后重试":
      "Import will overwrite data in the selected scope. Confirm and try again.",
    "设置码只能放在“暗区突围：无限”分区":
      "Settings codes can only be placed in the Arena Breakout: Infinite section",
    "无法从该行识别配置码，且当前没有游戏名称分区":
      "Unable to identify a configuration code, and no game section is active",
    "暗区突围分区中不能包含三角洲行动改枪码":
      "The Arena Breakout: Infinite section cannot contain Delta Force Gun Build Codes",
    "三角洲行动分区中不能包含暗区突围配置码":
      "The Delta Force section cannot contain Arena Breakout: Infinite configuration codes",
    缺少枪械描述: "Missing weapon description",
    缺少配置码: "Missing configuration code",
    配置码长度超出限制: "Configuration code is too long",
    "价格应为数字，例如 28W 或 28":
      "Price must be a number, such as 28W or 28",
    同一文件中存在重复配置码:
      "Duplicate configuration codes exist in the same file",
    缺少配置码或有效分隔符:
      "Missing configuration code or valid separator",
    "三角洲行动配置应使用“枪械描述 | 价格 | 代码”":
      "Delta Force entries must use \"Weapon Description | Price | Code\"",
    "缺少“改枪码”或“配装码”，且无法从代码前缀推断":
      "Missing Gun Build Code or Loadout Code, and it cannot be inferred from the code prefix",
    配置字段数量不正确: "Incorrect number of configuration fields",
    "配置类型必须紧邻代码前，例如“枪械描述 | 价格 | 类型 | 代码”":
      "The type must immediately precede the code, for example \"Weapon Description | Price | Type | Code\"",
    "暗区突围：无限配置字段数量不正确":
      "Arena Breakout: Infinite has an incorrect number of configuration fields",
    没有识别到可导入内容: "No importable content was recognized",
    "请选择由 Marku 导出的 TXT 文件":
      "Select a TXT file exported by Marku",
  };

  const EN_TO_ZH = Object.fromEntries(
    Object.entries(ZH_TO_EN).map(([zh, en]) => [en, zh])
  );

  const PATTERNS = [
    [
      /^(.+)不能为空$/,
      (match, translate) =>
        `${translate(match[1], "en")} cannot be empty`,
    ],
    [
      /^(.+)设置码缺少内容和分隔符$/,
      (match, translate) =>
        `${translate(match[1], "en")} settings code is missing content or a separator`,
    ],
    [
      /^配置类型“(.+)”与代码前缀不一致$/,
      (match, translate) =>
        `Configuration type "${translate(match[1], "en")}" does not match the code prefix`,
    ],
    [
      /^已复制(.+)$/,
      (match, translate) => `Copied ${translate(match[1], "en")}`,
    ],
    [
      /^确定删除「(.+)」吗？$/,
      (match) => `Delete "${match[1]}"?`,
    ],
    [
      /^第 (\d+) 行：([\s\S]+)$/,
      (match, translate) =>
        `Line ${match[1]}: ${translate(match[2], "en")}`,
    ],
    [
      /^另有 (\d+) 处问题未显示。$/,
      (match) => `${match[1]} additional issue(s) are not shown.`,
    ],
    [
      /^data 文件夹备份完成，共 (\d+) 个文件$/,
      (match) => `data folder backup completed: ${match[1]} file(s)`,
    ],
    [
      /^data 备份完成：(.+)$/,
      (match) => `data backup completed: ${match[1]}`,
    ],
  ];

  function preserveWhitespace(original, translated) {
    const match = original.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!match) return translated;
    return `${match[1]}${translated}${match[3]}`;
  }

  function translate(value, language = "zh-CN") {
    const text = value == null ? "" : String(value);
    const stripped = text.trim();
    if (!stripped) return text;

    if (language === "en") {
      const direct = ZH_TO_EN[stripped];
      return direct ? preserveWhitespace(text, direct) : text;
    }

    const direct = EN_TO_ZH[stripped];
    return direct ? preserveWhitespace(text, direct) : text;
  }

  function translateMessage(value, language = "zh-CN") {
    const translated = translate(value, language);
    if (language !== "en" || translated !== value) return translated;

    for (const [pattern, replacement] of PATTERNS) {
      const match = String(value).match(pattern);
      if (match) {
        return replacement(match, translate);
      }
    }

    return translated;
  }

  window.MarkuI18N = {
    translate,
    translateMessage,
  };
})();
