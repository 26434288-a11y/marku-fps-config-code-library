(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.MarkuImportParser = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const GAME_ALIASES = new Map([
    ["暗区突围", "暗区突围"],
    ["暗区突围：无限", "暗区突围"],
    ["暗区突围:无限", "暗区突围"],
    ["arena breakout infinite", "暗区突围"],
    ["三角洲行动", "三角洲行动"],
    ["delta force", "三角洲行动"],
  ]);

  const SETTING_FIELDS = new Map([
    ["游戏", "gameCode"],
    ["控制", "controlCode"],
    ["后处理", "postCode"],
  ]);

  function normalizeHeading(value) {
    return String(value || "")
      .replace(/^#{1,6}\s*/, "")
      .replace(/^[【\[]/, "")
      .replace(/[】\]]$/, "")
      .replace(/[：:]$/, "")
      .trim()
      .toLowerCase();
  }

  function splitFields(line) {
    if (/[|｜]/.test(line)) return line.split(/[|｜]/);
    if (line.includes("\t")) return line.split(/\t+/);
    if (/[,，]/.test(line)) return line.split(/[,，]/);
    if (/[：:]/.test(line)) return line.split(/[：:]/);
    return [line];
  }

  function normalizePrice(value) {
    return String(value || "")
      .replace(/[Ww￥¥,\s]/g, "")
      .trim();
  }

  function findCodeInLine(line) {
    const arenaSetting = line.match(
      /(游戏|控制|后处理)-(?:[A-Za-z0-9_-]+)/i
    );
    if (arenaSetting) {
      return {
        kind: "setting",
        game: "暗区突围",
        field: SETTING_FIELDS.get(arenaSetting[1]),
        code: arenaSetting[0],
      };
    }

    const arenaCode = line.match(/(改枪|配装)-(?:[A-Za-z0-9_-]+)/i);
    if (arenaCode) {
      return {
        kind: "code",
        game: "暗区突围",
        type: arenaCode[1] === "配装" ? "配装码" : "改枪码",
        code: arenaCode[0],
      };
    }

    const deltaCandidates =
      line.match(/[^\s|｜,，:：]+-[^\s|｜,，:：]+-[A-Za-z0-9]{6,}/g) || [];
    const deltaCode = deltaCandidates.find(
      (candidate) => !/^(改枪|配装|游戏|控制|后处理)-/.test(candidate)
    );
    if (deltaCode) {
      return {
        kind: "code",
        game: "三角洲行动",
        type: "改枪码",
        code: deltaCode,
      };
    }

    return null;
  }

  function splitRestTokens(value) {
    return String(value || "")
      .split(/[|｜\t,，]+|\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function extractPrice(value) {
    const token = splitRestTokens(value).find((part) =>
      /^\d+(?:\.\d+)?[Ww]?$/.test(part)
    );
    return normalizePrice(token || "");
  }

  function extractWeapon(value, codeInfo) {
    const cleanWeapon = (candidate) =>
      splitRestTokens(candidate)
        .filter(
          (part) =>
            part !== "改枪码" &&
            part !== "配装码" &&
            !/^\d+(?:\.\d+)?[Ww]?$/.test(part)
        )
        .join(" ")
        .trim();

    const source = String(value || "");
    const codeIndex = source.indexOf(codeInfo.code);
    if (codeIndex !== -1) {
      const before = cleanWeapon(source.slice(0, codeIndex));
      if (before) return before;

      const after = cleanWeapon(
        source.slice(codeIndex + codeInfo.code.length)
      );
      if (after) return after;
    }

    return cleanWeapon(source);
  }

  function parseImportText(text) {
    const content = String(text || "")
      .replace(/^\uFEFF/, "")
      .replace(/\r\n?/g, "\n");
    const items = new Map();
    const settings = {};
    const issues = [];
    const seenCodes = new Set();
    let currentGame = "";

    for (const [lineIndex, rawLine] of content.split("\n").entries()) {
      const lineNumber = lineIndex + 1;
      let line = rawLine.replace(/^\uFEFF/, "").trim();
      if (!line) continue;
      if (/^[-_—–]{3,}$/.test(line)) continue;

      line = line.replace(/^(?:[-*•]\s+|\d+[.)、]\s*)/, "").trim();
      const heading = normalizeHeading(line);
      const importedGame = GAME_ALIASES.get(heading);
      if (importedGame) {
        currentGame = importedGame;
        continue;
      }

      const settingMatch = line.match(
        /^(游戏|控制|后处理)\s*(?:[|｜:：,，]|\t)\s*(.*)$/
      );
      if (settingMatch) {
        if (currentGame && currentGame !== "暗区突围") {
          issues.push({
            line: lineNumber,
            message: "设置码只能放在“暗区突围：无限”分区",
            text: line,
          });
          continue;
        }
        const value = settingMatch[2].trim();
        if (!value) {
          issues.push({
            line: lineNumber,
            message: `${settingMatch[1]}设置码不能为空`,
            text: line,
          });
          continue;
        }
        settings[SETTING_FIELDS.get(settingMatch[1])] = value;
        continue;
      }

      if (/^(游戏|控制|后处理)\s*$/.test(line)) {
        issues.push({
          line: lineNumber,
          message: `${line}设置码缺少内容和分隔符`,
          text: line,
        });
        continue;
      }

      const inlineCode = findCodeInLine(line);
      if (inlineCode && inlineCode.kind === "setting") {
        if (currentGame && currentGame !== "暗区突围") {
          issues.push({
            line: lineNumber,
            message: "设置码只能放在“暗区突围：无限”分区",
            text: line,
          });
          continue;
        }
        settings[inlineCode.field] = inlineCode.code;
        continue;
      }

      if (!currentGame && (!inlineCode || inlineCode.kind !== "code")) {
        issues.push({
          line: lineNumber,
          message: "无法从该行识别配置码，且当前没有游戏名称分区",
          text: line,
        });
        continue;
      }

      if (inlineCode && inlineCode.kind === "code") {
        if (currentGame && currentGame !== inlineCode.game) {
          issues.push({
            line: lineNumber,
            message:
              currentGame === "暗区突围"
                ? "暗区突围分区中不能包含三角洲行动改枪码"
                : "三角洲行动分区中不能包含暗区突围配置码",
            text: line,
          });
          continue;
        }

        const explicitType = line.match(/(改枪码|配装码)/);
        if (explicitType && explicitType[1] !== inlineCode.type) {
          issues.push({
            line: lineNumber,
            message: `配置类型“${explicitType[1]}”与代码前缀不一致`,
            text: line,
          });
          continue;
        }

        const weapon = extractWeapon(line, inlineCode);
        const price = extractPrice(line);
        const code = inlineCode.code;

        if (!weapon) {
          issues.push({
            line: lineNumber,
            message: "缺少枪械描述",
            text: line,
          });
          continue;
        }
        if (!code) {
          issues.push({
            line: lineNumber,
            message: "缺少配置码",
            text: line,
          });
          continue;
        }
        if (code.length > 5000) {
          issues.push({
            line: lineNumber,
            message: "配置码长度超出限制",
            text: line,
          });
          continue;
        }
        if (price && !/^\d+(?:\.\d+)?$/.test(price)) {
          issues.push({
            line: lineNumber,
            message: "价格应为数字，例如 28W 或 28",
            text: line,
          });
          continue;
        }

        const key = `${inlineCode.game}\u0000${code}`;
        if (seenCodes.has(key)) {
          issues.push({
            line: lineNumber,
            message: "同一文件中存在重复配置码",
            text: line,
          });
          continue;
        }
        seenCodes.add(key);
        items.set(key, {
          game: inlineCode.game,
          type: inlineCode.type,
          weapon,
          price,
          code,
        });
        continue;
      }

      if (!currentGame) {
        issues.push({
          line: lineNumber,
          message: "无法从该行识别配置码，且当前没有游戏名称分区",
          text: line,
        });
        continue;
      }

      const parts = splitFields(line).map((part) => part.trim());
      if (parts.length < 2) {
        issues.push({
          line: lineNumber,
          message: /[-_]/.test(line)
            ? "缺少枪械描述"
            : "缺少配置码或有效分隔符",
          text: line,
        });
        continue;
      }

      let weapon = parts[0];
      let price = "";
      let type = "";
      let code = "";

      if (currentGame === "三角洲行动") {
        if (parts.length === 2) {
          code = parts[1];
        } else if (parts.length === 3) {
          price = normalizePrice(parts[1]);
          code = parts[2];
        } else {
          issues.push({
            line: lineNumber,
            message: "三角洲行动配置应使用“枪械描述 | 价格 | 代码”",
            text: line,
          });
          continue;
        }
        type = "改枪码";
      } else {
        const typeIndex = parts.findIndex(
          (part) => part === "改枪码" || part === "配装码"
        );
        code = parts[parts.length - 1];
        const inferredType = /^改枪[-_]/.test(code)
          ? "改枪码"
          : /^配装[-_]/.test(code)
          ? "配装码"
          : "";

        if (typeIndex === -1) {
          if (!inferredType) {
            issues.push({
              line: lineNumber,
              message:
                "缺少“改枪码”或“配装码”，且无法从代码前缀推断",
              text: line,
            });
            continue;
          }
          if (parts.length > 3) {
            issues.push({
              line: lineNumber,
              message: "配置字段数量不正确",
              text: line,
            });
            continue;
          }
          type = inferredType;
          if (parts.length === 3) {
            price = normalizePrice(parts[1]);
          }
        } else {
          if (typeIndex !== parts.length - 2) {
            issues.push({
              line: lineNumber,
              message:
                "配置类型必须紧邻代码前，例如“枪械描述 | 价格 | 类型 | 代码”",
              text: line,
            });
            continue;
          }
          type = parts[typeIndex];
          if (inferredType && inferredType !== type) {
            issues.push({
              line: lineNumber,
              message: `配置类型“${type}”与代码前缀不一致`,
              text: line,
            });
            continue;
          }
          if (typeIndex === 2) {
            price = normalizePrice(parts[1]);
          } else if (typeIndex !== 1) {
            issues.push({
              line: lineNumber,
              message: "暗区突围：无限配置字段数量不正确",
              text: line,
            });
            continue;
          }
        }
      }

      if (!weapon) {
        issues.push({
          line: lineNumber,
          message: "缺少枪械描述",
          text: line,
        });
        continue;
      }
      if (!code) {
        issues.push({
          line: lineNumber,
          message: "缺少配置码",
          text: line,
        });
        continue;
      }
      if (code.length > 5000) {
        issues.push({
          line: lineNumber,
          message: "配置码长度超出限制",
          text: line,
        });
        continue;
      }
      if (price && !/^\d+(?:\.\d+)?$/.test(price)) {
        issues.push({
          line: lineNumber,
          message: "价格应为数字，例如 28W 或 28",
          text: line,
        });
        continue;
      }

      const key = `${currentGame}\u0000${code}`;
      if (seenCodes.has(key)) {
        issues.push({
          line: lineNumber,
          message: "同一文件中存在重复配置码",
          text: line,
        });
        continue;
      }
      seenCodes.add(key);
      items.set(key, {
        game: currentGame,
        type,
        weapon,
        price,
        code,
      });
    }

    if (!items.size && !Object.keys(settings).length && !issues.length) {
      issues.push({
        line: 1,
        message: "没有识别到可导入内容",
        text: "请选择由 Marku 导出的 TXT 文件",
      });
    }

    return {
      items: [...items.values()],
      settings,
      issues,
    };
  }

  return {
    parseImportText,
  };
});
