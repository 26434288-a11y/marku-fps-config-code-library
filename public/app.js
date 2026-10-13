(() => {
  "use strict";

  const state = {
    codes: [],
    currentId: null,
    formGame: "暗区突围",
    settingsCodeMode: "view",
    reorderMode: false,
    switchToken: 0,
    contentEnterTimer: null,
    resultsAnimationTimer: null,
    formSnapshot: "",
    settingsCodeSnapshot: "",
    announcements: {
      items: [],
      total: 0,
      loading: false,
    },
    filters: {
      game: "暗区突围",
      type: "",
      search: "",
    },
  };

  const SETTINGS_KEY = "config-codex-settings";
  const settings = {
    theme: "light",
    gameMode: "all",
  };

  let draggedRow = null;
  let draggedRecently = false;
  let tabIndicatorReady = false;

  const $ = (selector) => document.querySelector(selector);

  const listEl = $("#list");
  const searchInput = $("#searchInput");
  const searchMirror = $("#searchMirror");
  const searchClearBtn = $("#searchClearBtn");
  const typeFilter = $("#typeFilter");
  const typeFilterDropdown = $("#typeFilterDropdown");
  const mainContent = $("#mainContent");
  const gameTabs = $("#gameTabs");
  const tabIndicator = gameTabs.querySelector(".tab-indicator");
  const gameTitle = $("#gameTitle");
  const announcementsBtn = $("#announcementsBtn");
  const announcementsDialog = $("#announcementsDialog");
  const announcementList = $("#announcementList");
  const announcementRefreshBtn = $("#announcementRefreshBtn");
  const reorderBtn = $("#reorderBtn");
  const addBtn = $("#addBtn");
  const toast = $("#toast");
  const copyTip = $("#copyTip");
  const hoverTip = $("#hoverTip");
  const actionTip = $("#actionTip");

  const detailDialog = $("#detailDialog");
  const detailBody = $("#detailBody");
  const detailEditBtn = $("#detailEditBtn");
  const detailDeleteBtn = $("#detailDeleteBtn");
  const confirmDialog = $("#confirmDialog");
  const confirmTitle = $("#confirmTitle");
  const confirmMessage = $("#confirmMessage");
  const confirmOkBtn = $("#confirmOkBtn");
  const confirmCancelBtn = $("#confirmCancelBtn");

  const settingsBtn = $("#settingsBtn");
  const settingsDialog = $("#settingsDialog");
  const themeControl = $("#themeControl");
  const gameControl = $("#gameControl");
  const queryCodesBtn = $("#queryCodesBtn");
  const queryDialog = $("#queryDialog");
  const queryResult = $("#queryResult");
  const queryExportBtn = $("#queryExportBtn");
  const queryCopyAllBtn = $("#queryCopyAllBtn");
  const settingsCodeBtn = $("#settingsCodeBtn");
  const settingsCodeDialog = $("#settingsCodeDialog");
  const settingsCodeForm = $("#settingsCodeForm");
  const settingsCodeGame = $("#settingsCodeGame");
  const settingsCodeControl = $("#settingsCodeControl");
  const settingsCodePost = $("#settingsCodePost");
  const settingsCodeError = $("#settingsCodeError");
  const settingsCodeTitle = $("#settingsCodeTitle");
  const settingsCodeEditBtn = $("#settingsCodeEditBtn");
  const settingsCodeSaveBtn = $("#settingsCodeSaveBtn");

  const formDialog = $("#formDialog");
  const entryForm = $("#entryForm");
  const formTitle = $("#formTitle");
  const formError = $("#formError");
  const fieldId = $("#field-id");
  const metaRow = $("#metaRow");
  const typeField = $("#typeField");
  const fieldType = $("#field-type");
  const fieldTypeDropdown = $("#fieldTypeDropdown");
  const fieldWeapon = $("#field-weapon");
  const fieldPrice = $("#field-price");
  const fieldCode = $("#field-code");
  const codeLabel = $("#codeLabel");

  const ICONS = {
    copy:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    edit:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>',
    trash:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>',
    check:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>',
    grip:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 9h8M8 15h8"></path></svg>',
    reorder:
      '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16"></path></svg>',
  };

  const TYPE_CLASS = {
    改枪码: "badge-mod",
    配装码: "badge-loadout",
  };

  const SETTINGS_TYPES = [
    "游戏设置码",
    "控制设置码",
    "后处理设置码",
  ];

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function displayPrice(price) {
    return price ? `${price}W` : "";
  }

  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1900);
  }

  const copyFlashStates = new WeakMap();

  function flashCopySuccess(button) {
    if (!button) return;

    const existing = copyFlashStates.get(button);
    const state = existing || {
      original: button.innerHTML,
      timer: null,
    };
    if (state.timer) clearTimeout(state.timer);

    button.innerHTML = state.original;
    button.classList.remove("is-copied");
    void button.offsetWidth;
    button.classList.add("is-copied");
    button.innerHTML = ICONS.check;

    const timer = setTimeout(() => {
      if (state.timer !== timer) return;
      button.innerHTML = state.original;
      button.classList.remove("is-copied");
      copyFlashStates.delete(button);
    }, 1200);
    state.timer = timer;
    copyFlashStates.set(button, state);
  }

  let copyTipTimer;
  let copyTipFrame = null;
  let copyTipAnchor = null;

  function positionCopyTip() {
    if (!copyTipAnchor) return;
    const rect = copyTipAnchor.getBoundingClientRect();
    if (!copyTipAnchor.isConnected || rect.width === 0) {
      copyTip.classList.remove("show");
      copyTipAnchor = null;
      return;
    }

    const tipWidth = copyTip.offsetWidth;
    const center = rect.left + rect.width / 2;
    const left = Math.min(
      Math.max(center, tipWidth / 2 + 8),
      window.innerWidth - tipWidth / 2 - 8
    );
    copyTip.style.left = `${left}px`;
    copyTip.style.top = `${Math.max(rect.top, 44)}px`;
    copyTipFrame = requestAnimationFrame(positionCopyTip);
  }

  function showCopyTip(button, message) {
    if (!button) return;
    const dialog = button.closest("dialog");
    const parent = dialog || document.body;
    if (copyTip.parentElement !== parent) {
      parent.appendChild(copyTip);
    }

    copyTip.innerHTML = `${ICONS.check}<span>${escapeHtml(message)}</span>`;
    copyTipAnchor = button;
    copyTip.classList.add("show");
    if (copyTipFrame) cancelAnimationFrame(copyTipFrame);
    positionCopyTip();

    clearTimeout(copyTipTimer);
    copyTipTimer = setTimeout(() => {
      copyTip.classList.remove("show");
      if (copyTipFrame) cancelAnimationFrame(copyTipFrame);
      copyTipFrame = null;
      copyTipAnchor = null;
    }, 2500);
  }

  let hoverTipAnchor = null;
  const suppressedHoverTips = new WeakSet();

  function positionHoverTip() {
    if (!hoverTipAnchor) return;
    const rect = hoverTipAnchor.getBoundingClientRect();
    const tipWidth = hoverTip.offsetWidth;
    const tipHeight = hoverTip.offsetHeight;
    const center = rect.left + rect.width / 2;
    const left = Math.min(
      Math.max(center, tipWidth / 2 + 8),
      window.innerWidth - tipWidth / 2 - 8
    );
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeBelow =
      spaceAbove < tipHeight + 16 && spaceBelow >= spaceAbove;

    hoverTip.classList.toggle("is-below", placeBelow);
    hoverTip.style.left = `${left}px`;
    hoverTip.style.top = `${placeBelow ? rect.bottom : rect.top}px`;
  }

  function showHoverTip(button) {
    if (!button || suppressedHoverTips.has(button)) return;
    const text =
      button.dataset.tooltip ||
      button.getAttribute("aria-label") ||
      button.getAttribute("title") ||
      "";
    if (!text) return;

    const dialog = button.closest("dialog");
    const parent = dialog || document.body;
    if (hoverTip.parentElement !== parent) {
      parent.appendChild(hoverTip);
    }

    hoverTip.textContent = text;
    hoverTipAnchor = button;
    hoverTip.classList.add("show");
    positionHoverTip();
  }

  function hideHoverTip(button) {
    if (button && hoverTipAnchor && button !== hoverTipAnchor) return;
    hoverTip.classList.remove("show");
    hoverTipAnchor = null;
  }

  document.addEventListener("pointerover", (event) => {
    const button = event.target.closest("[data-tooltip]");
    if (!button) return;
    if (
      event.relatedTarget instanceof Node &&
      button.contains(event.relatedTarget)
    ) {
      return;
    }
    showHoverTip(button);
  });

  document.addEventListener("pointerout", (event) => {
    const button = event.target.closest("[data-tooltip]");
    if (!button) return;
    if (
      event.relatedTarget instanceof Node &&
      button.contains(event.relatedTarget)
    ) {
      return;
    }
    suppressedHoverTips.delete(button);
    hideHoverTip(button);
  });

  document.addEventListener("focusin", (event) => {
    const button = event.target.closest("[data-tooltip]");
    if (button && button.matches(":focus-visible")) showHoverTip(button);
  });

  document.addEventListener("focusout", (event) => {
    const button = event.target.closest("[data-tooltip]");
    if (button) hideHoverTip(button);
  });

  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("[data-tooltip]");
      if (!button) return;
      suppressedHoverTips.add(button);
      hideHoverTip(button);
    },
    true
  );

  window.addEventListener("scroll", () => hideHoverTip(), true);

  let actionTipTimer;
  function showActionTip(button, message) {
    if (!button) return;
    const rect = button.getBoundingClientRect();
    actionTip.innerHTML = `${ICONS.check}<span>${escapeHtml(message)}</span>`;
    const tipWidth = actionTip.offsetWidth;
    const left = Math.max(rect.left - 8, tipWidth + 8);
    actionTip.style.left = `${left}px`;
    actionTip.style.top = `${rect.top + rect.height / 2}px`;
    actionTip.classList.add("show");
    clearTimeout(actionTipTimer);
    actionTipTimer = setTimeout(() => actionTip.classList.remove("show"), 1600);
  }

  let confirmResolve = null;

  function showDialog(dialog, focusTarget) {
    dialog.showModal();
    if (focusTarget) {
      focusTarget.focus({ preventScroll: true });
      return;
    }
    if (!dialog.hasAttribute("tabindex")) dialog.tabIndex = -1;
    dialog.focus({ preventScroll: true });
  }

  function showConfirm(message, options = {}) {
    confirmTitle.textContent = options.title || "确认";
    confirmMessage.textContent = message;
    confirmOkBtn.textContent = options.okText || "确定";
    return new Promise((resolve) => {
      confirmResolve = resolve;
      showDialog(confirmDialog, confirmOkBtn);
    });
  }

  function closeConfirm(result) {
    if (confirmResolve) {
      const resolve = confirmResolve;
      confirmResolve = null;
      resolve(result);
    }
    if (confirmDialog.open) confirmDialog.close();
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.theme === "light" || saved.theme === "dark") {
        settings.theme = saved.theme;
      }
      if (["暗区突围", "三角洲行动", "all"].includes(saved.gameMode)) {
        settings.gameMode = saved.gameMode;
      }
    } catch {
      // Ignore invalid or unavailable storage.
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors.
    }
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }

  function updateSegmentIndicator(control) {
    const indicator = control.querySelector(".segment-indicator");
    const active = control.querySelector(".segment.is-active");
    if (!indicator || !active || !control.offsetWidth) return;

    control.style.setProperty(
      "--segment-indicator-left",
      `${active.offsetLeft}px`
    );
    control.style.setProperty(
      "--segment-indicator-width",
      `${active.offsetWidth}px`
    );

    if (!control.classList.contains("is-indicator-ready")) {
      requestAnimationFrame(() => {
        control.classList.add("is-indicator-ready");
      });
    }
  }

  function updateSegmentIndicators() {
    updateSegmentIndicator(themeControl);
    updateSegmentIndicator(gameControl);
  }

  function updateSettingsUI() {
    themeControl.querySelectorAll("[data-theme-value]").forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.themeValue === settings.theme
      );
    });
    gameControl.querySelectorAll("[data-game-mode]").forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.gameMode === settings.gameMode
      );
    });
    updateSegmentIndicators();
  }

  function closeDropdown(dropdown) {
    dropdown.classList.remove("is-open");
    const trigger = dropdown.querySelector(".dropdown-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function setDropdownValue(dropdown, value) {
    const input = dropdown.querySelector(".dropdown-value");
    const label = dropdown.querySelector(".dropdown-label");
    const options = dropdown.querySelectorAll(".dropdown-option");
    input.value = value;
    let text = label.dataset.placeholder || "";
    options.forEach((option) => {
      const selected = (option.dataset.value || "") === value;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-selected", selected ? "true" : "false");
      if (selected) text = option.textContent;
    });
    label.textContent = text;
  }

  function initDropdown(dropdown) {
    const trigger = dropdown.querySelector(".dropdown-trigger");
    const options = dropdown.querySelectorAll(".dropdown-option");
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = dropdown.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen) {
        document.querySelectorAll("[data-dropdown].is-open").forEach((other) => {
          if (other !== dropdown) closeDropdown(other);
        });
      }
    });
    options.forEach((option) => {
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        setDropdownValue(dropdown, option.dataset.value || "");
        const input = dropdown.querySelector(".dropdown-value");
        input.dispatchEvent(new Event("change", { bubbles: true }));
        closeDropdown(dropdown);
      });
    });
  }

  function setTabIndicator(left, width) {
    tabIndicator.style.transform = `translate3d(${left}px, 0, 0)`;
    tabIndicator.style.width = `${width}px`;
    tabIndicator.style.borderRadius = "6px";
  }

  function updateTabIndicator({ animate = true } = {}) {
    const activeTab = gameTabs.querySelector(".tab.is-active");
    if (!activeTab || activeTab.hidden || gameTabs.hidden) return;

    const tabsRect = gameTabs.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const left = tabRect.left - tabsRect.left + gameTabs.scrollLeft;
    const width = tabRect.width;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
      !tabIndicatorReady ||
      !animate ||
      reduceMotion ||
      !tabIndicator.animate
    ) {
      for (const animation of tabIndicator.getAnimations()) animation.cancel();
      setTabIndicator(left, width);
      tabIndicatorReady = true;
      return;
    }

    const indicatorRect = tabIndicator.getBoundingClientRect();
    const fromLeft = indicatorRect.left - tabsRect.left + gameTabs.scrollLeft;
    const fromWidth = indicatorRect.width;
    const distance = left - fromLeft;
    const midLeft = fromLeft + distance * 0.42;
    const midWidth = (fromWidth + width) / 2 + Math.abs(distance) * 0.5;

    for (const animation of tabIndicator.getAnimations()) animation.cancel();
    setTabIndicator(fromLeft, fromWidth);

    const animation = tabIndicator.animate(
      [
        {
          transform: `translate3d(${fromLeft}px, 0, 0)`,
          width: `${fromWidth}px`,
          borderRadius: "6px",
          offset: 0,
        },
        {
          transform: `translate3d(${midLeft}px, 0, 0)`,
          width: `${midWidth}px`,
          borderRadius: "11px",
          offset: 0.52,
        },
        {
          transform: `translate3d(${left}px, 0, 0)`,
          width: `${width}px`,
          borderRadius: "6px",
          offset: 1,
        },
      ],
      {
        duration: 700,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      }
    );

    tabIndicator._liquidAnimation = animation;
    animation.onfinish = () => {
      if (tabIndicator._liquidAnimation !== animation) return;
      animation.cancel();
      setTabIndicator(left, width);
      tabIndicator._liquidAnimation = null;
    };
  }

  async function setActiveGame(game, { animate = true } = {}) {
    if (animate && game === state.filters.game) return;

    if (state.reorderMode) {
      state.reorderMode = false;
      updateReorderButton();
    }

    const token = ++state.switchToken;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const shouldAnimate = animate && !reduceMotion;

    state.filters.game = game;
    gameTabs.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.game === game);
    });
    updateTabIndicator();

    if (!shouldAnimate) {
      clearTimeout(state.contentEnterTimer);
      mainContent.classList.remove(
        "is-content-leaving",
        "is-content-entering"
      );
      mainContent.removeAttribute("aria-busy");
    } else {
      clearTimeout(state.contentEnterTimer);
      mainContent.classList.remove("is-content-entering");
      mainContent.classList.add("is-content-leaving");
      mainContent.setAttribute("aria-busy", "true");
      await new Promise((resolve) => window.setTimeout(resolve, 210));
      if (state.switchToken !== token) return;
    }

    gameTitle.textContent = game;
    const isArena = game === "暗区突围";
    typeFilterDropdown.hidden = !isArena;
    settingsCodeBtn.hidden = !isArena;
    if (!isArena) {
      setDropdownValue(typeFilterDropdown, "");
      state.filters.type = "";
    }

    window.scrollTo(0, 0);
    render();

    if (!shouldAnimate) return;

    mainContent.classList.remove("is-content-leaving");
    void mainContent.offsetWidth;
    mainContent.classList.add("is-content-entering");
    state.contentEnterTimer = window.setTimeout(() => {
      if (state.switchToken !== token) return;
      mainContent.classList.remove("is-content-entering");
      mainContent.removeAttribute("aria-busy");
    }, 560);
  }

  function applyGameMode({ animate = true } = {}) {
    const tabsWereHidden = gameTabs.hidden;
    gameTabs.hidden = settings.gameMode !== "all";

    const arenaTab = gameTabs.querySelector('[data-game="暗区突围"]');
    const deltaTab = gameTabs.querySelector('[data-game="三角洲行动"]');
    const showArena = settings.gameMode !== "三角洲行动";
    const showDelta = settings.gameMode !== "暗区突围";

    arenaTab.hidden = !showArena;
    deltaTab.hidden = !showDelta;

    let activeGame = state.filters.game;
    if (!showArena) activeGame = "三角洲行动";
    if (!showDelta) activeGame = "暗区突围";
    setActiveGame(activeGame, { animate });

    if (tabsWereHidden && !gameTabs.hidden) {
      requestAnimationFrame(() => {
        updateTabIndicator({ animate: false });
      });
    }
  }

  async function api(path, options = {}) {
    return fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  }

  async function loadCodes() {
    try {
      const res = await fetch("/api/codes");
      if (!res.ok) throw new Error("服务器返回错误");
      const data = await res.json();
      state.codes = (data.items || []).filter(
        (item) => !SETTINGS_TYPES.includes(item.type)
      );
      render();
    } catch (err) {
      listEl.innerHTML = `<div class="empty"><strong>加载失败</strong>${escapeHtml(
        err.message
      )}</div>`;
    }
  }

  function canReorder() {
    return (
      state.reorderMode && !state.filters.type && !state.filters.search
    );
  }

  function getFiltered() {
    const { game, type, search } = state.filters;
    return state.codes.filter((item) => {
      if (game && item.game !== game) return false;
      if (type && item.type !== type) return false;
      if (search) {
        const weapon = item.weapon || "";
        const matched = window.pinyinPro
          ? window.pinyinPro.match(weapon, search)
          : weapon.toLowerCase().includes(search);
        if (!matched) return false;
      }
      return true;
    });
  }

  function rowHTML(item) {
    const draggable = canReorder();
    const price = displayPrice(item.price);
    const priceChip = price
      ? `<span class="price-chip">${escapeHtml(price)}</span>`
      : "";

    const typeBadge =
      item.game === "暗区突围"
        ? `<span class="badge ${TYPE_CLASS[item.type] || "badge-mod"}">${escapeHtml(
            item.type
          )}</span>`
        : "";

    return `<article class="row" data-id="${escapeHtml(item.id)}" draggable="${draggable ? "true" : "false"}">
      ${
        draggable
          ? `<span class="drag-handle" data-tooltip="拖拽排序">${ICONS.grip}</span>`
          : ""
      }
      <div class="row-main">
        <div class="row-title-wrap">
          <h3 class="row-title" title="${escapeHtml(item.weapon)}">${escapeHtml(
            item.weapon
          )}</h3>
          ${priceChip}
          ${typeBadge}
        </div>
      </div>
      <div class="row-actions">
        <button class="icon-btn" type="button" data-action="copy" data-tooltip="复制" aria-label="复制">${ICONS.copy}</button>
        <button class="icon-btn" type="button" data-action="edit" data-tooltip="编辑" aria-label="编辑">${ICONS.edit}</button>
        <button class="icon-btn danger" type="button" data-action="delete" data-tooltip="删除" aria-label="删除">${ICONS.trash}</button>
      </div>
    </article>`;
  }

  function emptyHTML() {
    const hasFilter = state.filters.type || state.filters.search;
    return `<div class="empty"><strong>${
      hasFilter ? "没有符合条件的配置" : "还没有配置"
    }</strong>${hasFilter ? "换个筛选条件试试" : "点击右上角「新增」开始添加"}</div>`;
  }

  function render({ animateResults = false } = {}) {
    const items = getFiltered();
    listEl.classList.toggle("is-reordering", state.reorderMode);
    listEl.innerHTML = items.length
      ? items.map(rowHTML).join("")
      : emptyHTML();

    clearTimeout(state.resultsAnimationTimer);
    listEl.classList.remove("is-results-entering");

    if (!animateResults) return;

    const animatedItems = listEl.querySelectorAll(".row, .empty");
    animatedItems.forEach((item, index) => {
      item.style.animationDelay = `${Math.min(index * 28, 168)}ms`;
    });
    void listEl.offsetWidth;
    listEl.classList.add("is-results-entering");
    state.resultsAnimationTimer = window.setTimeout(() => {
      listEl.classList.remove("is-results-entering");
      animatedItems.forEach((item) => {
        item.style.animationDelay = "";
      });
    }, 520);
  }

  function findItem(id) {
    return state.codes.find((item) => item.id === id);
  }

  function detailHTML(item) {
    const price = displayPrice(item.price);
    const priceChip = price
      ? `<span class="price-chip">${escapeHtml(price)}</span>`
      : "";
    const typeBadge =
      item.game === "暗区突围"
        ? `<span class="badge ${TYPE_CLASS[item.type] || "badge-mod"}">${escapeHtml(
            item.type
          )}</span>`
        : "";

    return `<div class="detail-head">
      <div class="detail-title-wrap">
        <h2 class="detail-title">${escapeHtml(item.weapon)}</h2>
        ${priceChip}
        ${typeBadge}
      </div>
    </div>
    <div class="code-section">
      <div class="code-head">
        <span>${escapeHtml(item.type)}</span>
        <button class="icon-btn" type="button" id="detailCopyBtn" data-tooltip="复制" aria-label="复制">${ICONS.copy}</button>
      </div>
      <textarea class="code-box" id="detailCode" readonly wrap="off" spellcheck="false">${escapeHtml(
        item.code
      )}</textarea>
    </div>`;
  }

  function openDetail(id) {
    const item = findItem(id);
    if (!item) return;
    state.currentId = id;
    detailBody.innerHTML = detailHTML(item);

    const copyBtn = detailBody.querySelector("#detailCopyBtn");
    copyBtn.addEventListener("click", () => copyCode(item, copyBtn));
    const codeBox = detailBody.querySelector("#detailCode");
    codeBox.addEventListener("click", () => codeBox.select());

    showDialog(detailDialog);
  }

  function showFormError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }

  function configureFormForGame(game) {
    const isArena = game === "暗区突围";
    typeField.hidden = !isArena;
    metaRow.classList.toggle("three", isArena);
    if (!isArena) setDropdownValue(fieldTypeDropdown, "改枪码");
  }

  function updateCodeLabel() {
    if (state.formGame === "三角洲行动") {
      codeLabel.textContent = "改枪码";
    } else {
      codeLabel.textContent = fieldType.value || "代码";
    }
  }

  function openForm(item) {
    state.formGame = item ? item.game : state.filters.game;
    formTitle.textContent = item ? "编辑" : "新增";

    fieldId.value = item ? item.id : "";
    setDropdownValue(
      fieldTypeDropdown,
      item
        ? item.type
        : state.formGame === "暗区突围"
        ? ""
        : "改枪码"
    );
    fieldWeapon.value = item ? item.weapon : "";
    fieldPrice.value = item ? item.price || "" : "";
    fieldCode.value = item ? item.code : "";

    configureFormForGame(state.formGame);
    updateCodeLabel();
    state.formSnapshot = captureFormValues();
    formError.hidden = true;
    showDialog(formDialog);
  }

  function collectForm() {
    return {
      id: fieldId.value,
      game: state.formGame,
      type: state.formGame === "三角洲行动" ? "改枪码" : fieldType.value,
      weapon: fieldWeapon.value.trim(),
      price: fieldPrice.value.trim(),
      code: fieldCode.value,
    };
  }

  async function submitForm(event) {
    event.preventDefault();
    formError.hidden = true;

    const payload = collectForm();
    const errors = [];
    if (!payload.type) errors.push("请选择类型");
    if (!payload.weapon) errors.push("枪械/描述不能为空");
    if (!payload.code.trim()) {
      errors.push(`${codeLabel.textContent || "代码"}不能为空`);
    }
    if (errors.length) {
      showFormError(errors.join("；"));
      return;
    }

    const isEdit = Boolean(payload.id);
    const url = isEdit ? `/api/codes/${payload.id}` : "/api/codes";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await api(url, { method, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data.errors
          ? data.errors.join("；")
          : data.error || "保存失败";
        showFormError(message);
        return;
      }
      formDialog.close();
      await loadCodes();
      showToast(isEdit ? "已保存" : "已添加");
    } catch {
      showFormError("网络错误，请稍后重试");
    }
  }

  function applySettingsCodeMode() {
    const isView = state.settingsCodeMode === "view";
    for (const input of [settingsCodeGame, settingsCodeControl, settingsCodePost]) {
      input.readOnly = isView;
      input.tabIndex = isView ? -1 : 0;
    }
    settingsCodeForm.classList.toggle("is-editing", !isView);
    settingsCodeEditBtn.hidden = !isView;
    settingsCodeSaveBtn.hidden = isView;
    settingsCodeTitle.textContent = isView ? "设置码" : "编辑设置码";
  }

  function buildGameQueryLines(game) {
    return state.codes
      .filter(
        (item) => item.game === game && !SETTINGS_TYPES.includes(item.type)
      )
      .map((item) => {
        if (game === "三角洲行动") {
          return [item.weapon, displayPrice(item.price), item.code]
            .filter(Boolean)
            .join(" | ");
        }
        return [item.weapon, displayPrice(item.price), item.type, item.code]
          .filter(Boolean)
          .join(" | ");
      });
  }

  function buildSettingsQueryLines(item) {
    return [
      ["游戏", item.gameCode],
      ["控制", item.controlCode],
      ["后处理", item.postCode],
    ]
      .filter(([, value]) => String(value || "").trim())
      .map(([label, value]) => `${label} | ${value}`);
  }

  function buildQuerySection(game, codeLines, settingLines) {
    const divider = "------------------------------";
    const blocks = [];

    if (game === "暗区突围" && settingLines.length) {
      blocks.push(settingLines.join("\n\n"));
    }
    if (codeLines.length) {
      if (blocks.length) blocks.push(divider);
      blocks.push(codeLines.join("\n\n"));
    }

    return `${game}\n\n${divider}\n\n${
      blocks.length ? blocks.join("\n\n") : "暂无配置码"
    }`;
  }

  function buildQueryText(settingsItem = {}) {
    const games =
      settings.gameMode === "all"
        ? ["暗区突围", "三角洲行动"]
        : [settings.gameMode];
    const settingLines = buildSettingsQueryLines(settingsItem);

    return games
      .map((game) =>
        buildQuerySection(game, buildGameQueryLines(game), settingLines)
      )
      .join("\n\n\n");
  }

  let queryRequestToken = 0;

  async function openQueryDialog() {
    const token = ++queryRequestToken;
    queryResult.value = buildQueryText();
    showDialog(queryDialog);
    queryResult.scrollTop = 0;

    try {
      const response = await fetch("/api/settings");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "加载失败");
      if (token !== queryRequestToken || !queryDialog.open) return;
      queryResult.value = buildQueryText(data.item || {});
      queryResult.scrollTop = 0;
    } catch {
      showToast("设置码加载失败");
    }
  }

  async function copyAllQueryCodes() {
    const text = queryResult.value;
    if (!text) {
      showToast("没有可复制的配置码");
      return;
    }

    const ok = await copyText(text);
    if (ok) {
      flashCopySuccess(queryCopyAllBtn);
      showCopyTip(queryCopyAllBtn, "已复制全部配置码");
    } else {
      showToast("复制失败，请手动选择");
    }
  }

  async function exportQueryCodes() {
    const text = queryResult.value;
    if (!text) {
      showToast("没有可导出的配置码");
      return;
    }

    const fileName = "Marku配置码.txt";
    const fileContent = `\uFEFF${text}`;

    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "文本文件",
              accept: { "text/plain": [".txt"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(
          new Blob([fileContent], { type: "text/plain;charset=utf-8" })
        );
        await writable.close();
        showActionTip(queryExportBtn, "已导出");
      } catch (error) {
        if (error && error.name === "AbortError") return;
        showToast("导出失败，请重试");
      }
      return;
    }

    const blob = new Blob([fileContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showActionTip(queryExportBtn, "已导出");
  }

  async function openSettingsCodeDialog() {
    settingsCodeForm.reset();
    settingsCodeError.hidden = true;
    state.settingsCodeMode = "view";
    try {
      const res = await fetch("/api/settings");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "加载失败");
      const item = data.item || {};
      settingsCodeGame.value = item.gameCode || "";
      settingsCodeControl.value = item.controlCode || "";
      settingsCodePost.value = item.postCode || "";
    } catch {
      settingsCodeError.textContent = "设置码加载失败";
      settingsCodeError.hidden = false;
    }
    state.settingsCodeSnapshot = captureSettingsCodeValues();
    applySettingsCodeMode();
    showDialog(settingsCodeDialog);
  }

  async function submitSettingsCode(event) {
    event.preventDefault();
    settingsCodeError.hidden = true;
    if (state.settingsCodeMode === "view") return;

    try {
      const res = await api("/api/settings", {
        method: "PUT",
        body: JSON.stringify({
          gameCode: settingsCodeGame.value,
          controlCode: settingsCodeControl.value,
          postCode: settingsCodePost.value,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        settingsCodeError.textContent = "保存失败，请稍后重试";
        settingsCodeError.hidden = false;
        return;
      }
      const item = data.item || {};
      settingsCodeGame.value = item.gameCode || "";
      settingsCodeControl.value = item.controlCode || "";
      settingsCodePost.value = item.postCode || "";
      state.settingsCodeSnapshot = captureSettingsCodeValues();
      state.settingsCodeMode = "view";
      applySettingsCodeMode();
      showToast("已保存");
    } catch {
      settingsCodeError.textContent = "网络错误，请稍后重试";
      settingsCodeError.hidden = false;
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.focus();
      helper.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      helper.remove();
      return ok;
    }
  }

  async function copyCode(item, button) {
    const ok = await copyText(item.code);
    if (ok) {
      flashCopySuccess(button);
      showCopyTip(button, `已复制${item.type}`);
    } else {
      showToast("复制失败，请手动选择");
    }
  }

  async function reorderCodes(ids) {
    try {
      const res = await api("/api/codes/order", {
        method: "PATCH",
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error();
      await loadCodes();
      showActionTip(reorderBtn, "顺序已保存");
    } catch {
      showToast("保存顺序失败");
      await loadCodes();
    }
  }

  function isUpdateAnnouncement(item) {
    return item.title.includes("更新公告");
  }

  function renderAnnouncements() {
    const item = state.announcements.items.find(isUpdateAnnouncement);
    if (!item) {
      announcementList.innerHTML = '<div class="empty">暂无更新公告</div>';
      return;
    }

    announcementList.innerHTML = `<a class="announcement-item" href="${escapeHtml(
      item.url
    )}" target="_blank" rel="noopener">
      <div class="announcement-item-title">${escapeHtml(item.title)}</div>
      <div class="announcement-item-meta">
        <span>${escapeHtml(item.date)}</span>
      </div>
    </a>`;
  }

  async function loadAnnouncements() {
    if (state.announcements.loading) return;
    state.announcements.loading = true;
    announcementList.innerHTML = '<div class="empty">加载中...</div>';

    try {
      const res = await fetch("/api/announcements?limit=20&start=0");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "加载失败");
      state.announcements.total = data.total || 0;
      state.announcements.items = data.items || [];
      renderAnnouncements();
    } catch (err) {
      announcementList.innerHTML = `<div class="empty">加载失败：${escapeHtml(
        err.message
      )}</div>`;
    } finally {
      state.announcements.loading = false;
    }
  }

  function openAnnouncementsDialog() {
    showDialog(announcementsDialog);
    loadAnnouncements();
  }

  function updateReorderButton() {
    if (state.reorderMode) {
      reorderBtn.innerHTML = ICONS.check;
      reorderBtn.dataset.tooltip = "保存顺序";
      reorderBtn.setAttribute("aria-label", "保存顺序");
    } else {
      reorderBtn.innerHTML = ICONS.reorder;
      reorderBtn.dataset.tooltip = "调整顺序";
      reorderBtn.setAttribute("aria-label", "调整顺序");
    }
  }

  function setReorderMode(enabled) {
    state.reorderMode = enabled;
    updateReorderButton();
    render();
  }

  async function handleReorderClick() {
    if (!state.reorderMode) {
      if (state.filters.type || state.filters.search) {
        showToast("请先清空筛选和搜索");
        return;
      }
      setReorderMode(true);
      return;
    }
    const ids = [...listEl.querySelectorAll(".row")].map((row) => row.dataset.id);
    state.reorderMode = false;
    updateReorderButton();
    await reorderCodes(ids);
  }

  async function deleteItem(id) {
    const item = findItem(id);
    if (!item) return;
    const ok = await showConfirm(`确定删除「${item.weapon}」吗？`, {
      title: "删除配置",
      okText: "删除",
    });
    if (!ok) return;

    if (detailDialog.open) detailDialog.close();
    try {
      const res = await fetch(`/api/codes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "删除失败");
      }
      await loadCodes();
      showToast("已删除");
    } catch (err) {
      showToast(err.message || "删除失败");
      await loadCodes();
    }
  }

  gameTabs.addEventListener("click", (event) => {
    const tab = event.target.closest(".tab");
    if (!tab || tab.hidden) return;
    setActiveGame(tab.dataset.game);
  });

  window.addEventListener("resize", () => {
    updateTabIndicator({ animate: false });
    updateSegmentIndicators();
  });

  let searchTimer;
  let searchMirrorValue = "";
  let searchComposing = false;
  let searchClearTimer;

  function updateSearchClearButton() {
    const isClearing = searchClearBtn.classList.contains("is-clearing");
    const hasValue = searchInput.value.length > 0 || isClearing;
    searchClearBtn.hidden = !hasValue;
    searchInput
      .closest(".search-input-wrap")
      .classList.toggle("has-value", hasValue);
  }

  searchClearBtn.addEventListener("click", () => {
    if (!searchInput.value || searchClearBtn.classList.contains("is-clearing")) {
      return;
    }

    clearTimeout(searchClearTimer);
    searchClearBtn.classList.add("is-clearing");
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    searchInput.focus({ preventScroll: true });

    searchClearTimer = window.setTimeout(() => {
      searchClearBtn.classList.remove("is-clearing");
      updateSearchClearButton();
    }, 280);
  });

  function syncSearchMirrorScroll() {
    searchMirror.style.transform = `translateX(${-searchInput.scrollLeft}px)`;
  }

  function renderSearchMirror(value, animate = true) {
    if (value === searchMirrorValue) return;

    const previous = searchMirrorValue;
    const isAppend = value.startsWith(previous);
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < value.length; index += 1) {
      const character = value[index];
      const span = document.createElement("span");
      span.className = "search-char";
      span.textContent = character === " " ? "\u00a0" : character;

      if (character === " ") span.classList.add("is-space");
      if (animate && isAppend && index >= previous.length) {
        span.classList.add("is-entering");
        span.style.animationDelay = `${Math.min(
          (index - previous.length) * 16,
          64
        )}ms`;
      }

      fragment.appendChild(span);
    }

    searchMirror.replaceChildren(fragment);
    searchMirrorValue = value;
    requestAnimationFrame(syncSearchMirrorScroll);
  }

  searchInput.addEventListener("compositionstart", () => {
    searchComposing = true;
    searchInput.closest(".search").classList.add("is-composing");
  });

  searchInput.addEventListener("compositionend", () => {
    searchComposing = false;
    searchInput.closest(".search").classList.remove("is-composing");
    renderSearchMirror(searchInput.value);
  });

  searchInput.addEventListener("scroll", syncSearchMirrorScroll);

  searchInput.addEventListener("input", () => {
    if (!searchComposing) renderSearchMirror(searchInput.value);
    updateSearchClearButton();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.filters.search = searchInput.value.trim().toLowerCase();
      if (state.reorderMode) {
        state.reorderMode = false;
        updateReorderButton();
      }
      render({ animateResults: true });
    }, 120);
  });

  renderSearchMirror(searchInput.value, false);
  updateSearchClearButton();

  typeFilter.addEventListener("change", () => {
    state.filters.type = typeFilter.value;
    if (state.reorderMode) {
      state.reorderMode = false;
      updateReorderButton();
    }
    render({ animateResults: true });
  });

  fieldType.addEventListener("change", () => {
    if (state.formGame === "暗区突围") updateCodeLabel();
  });

  fieldPrice.addEventListener("input", () => {
    let value = fieldPrice.value.replace(/[^\d.]/g, "");
    const dot = value.indexOf(".");
    if (dot !== -1) {
      value = value.slice(0, dot + 1) + value.slice(dot + 1).replace(/\./g, "");
    }
    fieldPrice.value = value;
  });

  listEl.addEventListener("dragstart", (event) => {
    const row = event.target.closest(".row");
    if (!row || !canReorder()) return;
    if (event.target.closest(".row-actions")) return;
    draggedRow = row;
    draggedRecently = true;
    row.classList.add("is-dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", row.dataset.id || "");
    }
  });

  function captureRowRects() {
    const rects = new Map();
    listEl.querySelectorAll(".row").forEach((row) => {
      rects.set(row.dataset.id, row.getBoundingClientRect());
    });
    return rects;
  }

  function playFlip(previousRects) {
    listEl.querySelectorAll(".row").forEach((row) => {
      if (row === draggedRow) return;
      const previous = previousRects.get(row.dataset.id);
      if (!previous) return;
      const current = row.getBoundingClientRect();
      const dx = previous.left - current.left;
      const dy = previous.top - current.top;
      if (!dx && !dy) return;

      row.style.transition = "none";
      row.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        row.style.transition =
          "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)";
        row.style.transform = "";
        const clear = () => {
          row.style.transition = "";
          row.removeEventListener("transitionend", clear);
        };
        row.addEventListener("transitionend", clear);
      });
    });
  }

  listEl.addEventListener("dragover", (event) => {
    if (!draggedRow) return;
    event.preventDefault();
    const target = event.target.closest(".row");
    if (!target || target === draggedRow) return;
    const rect = target.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;

    if (after) {
      if (draggedRow.previousElementSibling === target) return;
      const previousRects = captureRowRects();
      target.after(draggedRow);
      playFlip(previousRects);
    } else {
      if (draggedRow.nextElementSibling === target) return;
      const previousRects = captureRowRects();
      target.before(draggedRow);
      playFlip(previousRects);
    }
  });

  listEl.addEventListener("drop", (event) => {
    if (draggedRow) event.preventDefault();
  });

  listEl.addEventListener("dragend", () => {
    if (!draggedRow) return;
    listEl.querySelectorAll(".row").forEach((row) => {
      row.style.transition = "";
      row.style.transform = "";
    });
    const row = draggedRow;
    row.classList.remove("is-dragging");
    row.classList.add("just-dropped");
    setTimeout(() => row.classList.remove("just-dropped"), 550);
    draggedRow = null;
    setTimeout(() => {
      draggedRecently = false;
    }, 80);
  });

  listEl.addEventListener("click", (event) => {
    if (draggedRecently) return;
    if (state.reorderMode) return;
    if (event.target.closest(".drag-handle")) return;
    const row = event.target.closest(".row");
    if (!row) return;
    const id = row.dataset.id;
    const item = findItem(id);
    if (!item) return;
    const actionBtn = event.target.closest("[data-action]");
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      if (action === "copy") copyCode(item, actionBtn);
      if (action === "edit") openForm(item);
      if (action === "delete") deleteItem(id);
      return;
    }
    openDetail(id);
  });

  announcementsBtn.addEventListener("click", openAnnouncementsDialog);
  announcementRefreshBtn.addEventListener("click", () => loadAnnouncements());

  reorderBtn.addEventListener("click", handleReorderClick);
  addBtn.addEventListener("click", () => openForm(null));

  settingsBtn.addEventListener("click", () => {
    showDialog(settingsDialog);
    requestAnimationFrame(updateSegmentIndicators);
  });
  queryCodesBtn.addEventListener("click", openQueryDialog);
  queryExportBtn.addEventListener("click", exportQueryCodes);
  queryCopyAllBtn.addEventListener("click", copyAllQueryCodes);

  themeControl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-value]");
    if (!button) return;
    settings.theme = button.dataset.themeValue;
    saveSettings();
    applyTheme();
    updateSettingsUI();
  });

  gameControl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-game-mode]");
    if (!button) return;
    settings.gameMode = button.dataset.gameMode;
    saveSettings();
    applyGameMode();
    updateSettingsUI();
  });

  settingsCodeBtn.addEventListener("click", () => openSettingsCodeDialog());
  settingsCodeForm.addEventListener("submit", submitSettingsCode);
  settingsCodeForm.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy-target]");
    if (!button) return;
    const input = document.getElementById(button.dataset.copyTarget);
    const value = input ? input.value : "";
    if (!value) {
      showToast("没有可复制的设置码");
      return;
    }
    const ok = await copyText(value);
    if (ok) {
      flashCopySuccess(button);
      showCopyTip(button, "已复制设置码");
    } else {
      showToast("复制失败，请手动选择");
    }
  });
  settingsCodeEditBtn.addEventListener("click", () => {
    state.settingsCodeMode = "edit";
    applySettingsCodeMode();
    const target = [settingsCodeGame, settingsCodeControl, settingsCodePost].find(
      (input) => input.value
    );
    (target || settingsCodeGame).focus();
  });

  detailEditBtn.addEventListener("click", () => {
    const item = findItem(state.currentId);
    if (!item) return;
    detailDialog.close();
    openForm(item);
  });

  detailDeleteBtn.addEventListener("click", () => deleteItem(state.currentId));

  entryForm.addEventListener("submit", submitForm);

  function captureFormValues() {
    return JSON.stringify({
      type: fieldType.value,
      weapon: fieldWeapon.value,
      price: fieldPrice.value,
      code: fieldCode.value,
    });
  }

  function captureSettingsCodeValues() {
    return JSON.stringify({
      game: settingsCodeGame.value,
      control: settingsCodeControl.value,
      post: settingsCodePost.value,
    });
  }

  function hasUnsavedChanges(dialog) {
    if (dialog === formDialog) {
      return (
        Boolean(state.formSnapshot) &&
        captureFormValues() !== state.formSnapshot
      );
    }
    if (dialog === settingsCodeDialog) {
      return (
        state.settingsCodeMode === "edit" &&
        Boolean(state.settingsCodeSnapshot) &&
        captureSettingsCodeValues() !== state.settingsCodeSnapshot
      );
    }
    return false;
  }

  async function requestClose(dialog) {
    if (dialog === confirmDialog) {
      closeConfirm(false);
      return;
    }
    if (hasUnsavedChanges(dialog)) {
      const ok = await showConfirm("有未保存的修改，确定关闭吗？", {
        title: "未保存的修改",
        okText: "确定",
      });
      if (!ok) return;
    }
    dialog.close();
  }

  document.addEventListener("click", (event) => {
    const closer = event.target.closest("[data-close-dialog]");
    if (closer) {
      const dialog = closer.closest("dialog");
      if (dialog) requestClose(dialog);
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-dropdown]")) return;
    document.querySelectorAll("[data-dropdown].is-open").forEach(closeDropdown);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openDropdown = document.querySelector("[data-dropdown].is-open");
    if (openDropdown) {
      event.preventDefault();
      closeDropdown(openDropdown);
    }
  });

  for (const dialog of [formDialog, settingsCodeDialog]) {
    dialog.addEventListener("cancel", async (event) => {
      if (!hasUnsavedChanges(dialog)) return;
      event.preventDefault();
      const ok = await showConfirm("有未保存的修改，确定关闭吗？", {
        title: "未保存的修改",
        okText: "确定",
      });
      if (ok) dialog.close();
    });
  }

  confirmDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeConfirm(false);
  });
  confirmOkBtn.addEventListener("click", () => closeConfirm(true));
  confirmCancelBtn.addEventListener("click", () => closeConfirm(false));

  loadSettings();
  applyTheme();
  updateSettingsUI();
  initDropdown(typeFilterDropdown);
  initDropdown(fieldTypeDropdown);
  updateReorderButton();
  applyGameMode({ animate: false });
  loadCodes();
})();
