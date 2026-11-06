# 素描小院 · 独立 QA 审查报告

- 审查对象：`/Users/jarrett/Desktop/DSH/项目/素描小院`（本地 http://127.0.0.1:8137）
- 审查快照：**2026-11-06 18:35 构建**（`build.mjs` 962 行 / `assets/style.css` 1353 行 / `assets/app.js` 262 行；14 个 HTML、16 张 SVG）
- 方法：curl 全量资源；源码静态审查（build.mjs / style.css / app.js / 全部 HTML 与内容 JSON）；headless Chrome 156 + CDP 实测（375×800 mobile 模拟、三档字号、交互点击、print 媒体模拟、`Page.printToPDF` + pypdf 数页/抽文本）；未修改任何站点文件（只新增本报告）。
- ⚠️ 审查期间站点被并发重建 3 次（18:22 → 18:30 → 18:35）。本报告按 18:35 快照逐条实测；其中「顶栏按钮 44px」「打印时隐藏“点一下放大”徽标」「`overflow-x: hidden` 兜底」是审查期间已修好的，已计入「已验证」。若之后继续改，请以最新行号复核。

---

## 一、总体结论

**不建议直接发布。** 内容质量、信息架构、大字/高对比的亮色设计、语义化 HTML、链接完整性和核心交互都做得很好（详见第五节），但存在 **7 个必须修的问题**，集中在三处：

1. **打印**——页面承诺「打印时只保留练习纸」，实测不符合：单张打印出 3 页（含只有标题/一句提醒的废页），纸上还印着「只打印这一张」按钮；课程页打印会把「朗读」「标记完成」按钮、笔记框一起印出。这是受众最可能用到的功能，且费纸。
2. **夜间模式与键盘焦点**——夜间模式所有主按钮是白字浅珊瑚底 **2.45:1**（AA 要求 4.5:1）；焦点环金色 on 纸底 **2.37:1**（UI 对比度要求 3:1）。
3. **375px × 大字号**——搜索页 6 张平台卡在「特大」下被撑到 443px、内容右侧被 `overflow-x:hidden` 裁掉；课程「完成」按钮长文案溢出被裁。BRIEF 的硬性要求是「375px 不横向滚动 + 三档字号可用」，当前靠隐藏滚动条掩盖了内容裁切。
4. **示意图内文字**——练习纸 SVG 的说明文字在手机上只有约 5–6px，且灰字对比度 2.05–2.91:1；对老花受众是硬伤。

修完上述各项（约 6 处 CSS / 4 处 build.mjs / 2 处 app.js / 1 批 SVG 颜色字号）即可发布。未发现 JS 运行时报错、断链、外部 CDN 依赖或内容硬伤。

---

## 二、严重（必须改）

### S1. 打印练习纸不符合承诺：出现废页、纸上印按钮、未固定 A4
- **实测**（Chrome 156，`@page` 14mm，A4 内容区）：
  - 「打印全部练习纸」= **5 页**：p1 只有「练习纸 / 打印出来，随手就能练 / 导语 / 打印时只保留练习纸，菜单和按钮会自动隐藏」，p2–p5 各一张练习纸；
  - 「只打印这一张」= **3 页**：p1 标题页、p2 练习纸、p3 只有一句「小提醒：打印用 A4 纸…」；
  - 每张练习纸上都印着 **「只打印这一张」按钮**（PDF 文本已确认）。
- **原因**：`assets/style.css:1244-1257` 的 `@media print` 只隐藏了 `.sheet-toolbar .btn`，没有隐藏：
  - `.sheet-head .sheet-print`（按钮本体，`practice.html:57/66/75/84`，生成自 `build.mjs:775`）；
  - 页面头 `.page-head`（`practice.html:43-50`，`build.mjs:760-766`）；
  - 末尾「小提醒」（`practice.html:91`，`build.mjs:784`）。
  - 另外 `@page` 只写了 margin，没有 `size`，实测输出是 **Letter 612×792pt**，国内打印机多为 A4。
- **改法**（只改 style.css 即可，无需动 14 个 HTML）：
  ```css
  @page { size: A4; margin: 14mm; }
  @media print {
    .page-head, .sheet-toolbar, .sheet-head .sheet-print,
    .print-note, main > .container:last-child { display: none !important; }
    .sheet-art img { max-height: 165mm; width: auto; max-width: 100%; display: block; margin: 0 auto; }
  }
  ```
  （末尾提醒没有类，建议在 `build.mjs:784` 给它加 `class="small muted no-print"`——`style.css:1249` 已有 `.no-print` 隐藏规则；或直接用它所在的 `.container` 选择器。）
  验收：打印全部 = 4 页且每页一张练习纸；单张打印 = 1 页。

### S2. 课程页打印会把交互控件一起印出来
- **实测** `lesson-1.html` 打印 = **5 页**，PDF 文本里含：「朗读这一课」+「点一下开始读，再点一下停…」、「画完了，标记这一课完成」、「进度和笔记只存在你自己的手机里…」、笔记框 placeholder「比如：排线还是不够匀…」、图注「· 放大看」、「点一下放大」（后者 18:35 已修）。
- **原因**：`@media print`（`style.css:1244-1257`）没有隐藏 `.read-row`（`build.mjs:419-423`）、`.practice-actions`（`build.mjs:505-507`）、`.note-field`（`build.mjs:501-504`）、`.save-hint`、`figcaption a`。
- **改法**：在 `@media print` 增加：
  ```css
  .read-row, .practice-actions, .save-hint, .note-field,
  .checklist input, figcaption a, .breadcrumb { display: none !important; }
  ```
  或在 build 给这些元素加 `no-print` 类。验收：打印一课的正文连续、无按钮/输入框/空笔记框。

### S3. 夜间模式主按钮对比度 2.45:1（WCAG 1.4.3 AA 失败）
- **实测**（Chrome computed style）：`.btn-primary` = `rgb(255,253,248)` on `rgb(221,146,118)` → **2.45:1**；hover（`--accent-deep` #eaa98f）→ **1.95:1**。影响首页「开始第一课」「学会上网找资料」、课程页「画完了，标记这一课完成」、练习纸「打印全部练习纸」等所有主按钮。
- **原因**：`assets/style.css:364-371` 把按钮文字写死 `#fffdf8`，背景用 `var(--accent)`；而暗色主题的 `--accent` 是浅色 `#dd9276`（`style.css:58`）。
- **改法**：在 `.btn-primary` 规则后追加：
  ```css
  html[data-theme="dark"] .btn-primary { color: #221d18; }
  html[data-theme="dark"] .btn-primary:hover { color: #221d18; }
  ```
  （#221d18 on #dd9276 ≈ 6.1:1，on #eaa98f ≈ 8.3:1。）

### S4. 键盘焦点环对比度 2.37:1 < 3:1（WCAG 1.4.11 AA）
- **实测计算**：`--focus`（`style.css:37`）外圈 `--gold` #C89B3C on 纸底 #FBF6EC = **2.37:1**，on 卡片 #FFFDF8 = **2.52:1**；且 `:focus-visible` 用 `outline:none` + `box-shadow`（`style.css:139-143`），Windows 高对比度/强制颜色模式下焦点完全不可见。
- **改法**（二选一，推荐后者）：
  ```css
  /* 方案 A：只换颜色 */
  --focus: 0 0 0 3px var(--paper), 0 0 0 6px var(--accent-deep); /* 亮 6.72:1，暗 8.41:1 */
  /* 方案 B：直接改成 outline，强制颜色模式也可见 */
  :focus-visible { outline: 3px solid var(--accent-deep); outline-offset: 2px; box-shadow: none; }
  ```
  验收：Tab 遍历全部交互元素，焦点环在纸底/卡片/暗色下都清晰。

### S5. 375px + 大字/特大：搜索页平台卡内容被裁切
- **实测**（375px，`--fs` 三档）：
  | 字号 | `.platform-grid` 的 1fr 轨道 | 卡片右侧位置 | 结果 |
  |---|---|---|---|
  | 标准 | 370px（容器 339px） | 386 > 375 | 卡片圆角边被裁 11px |
  | 大 | 407px | 424 | 右侧约 32px 不可见 |
  | 特大 | 443px | 463 | 右侧约 70px 不可见（步骤 li 行尾被切） |
- **原因**：`.platform-card .best { white-space: nowrap }`（`style.css:997`）把 `.p-head`/卡片的 min-content 撑大，而 `.platform-grid` 在 ≤980px 是 `grid-template-columns: 1fr`（= `minmax(auto,1fr)`），轨道跟着 min-content 撑破容器；`html, body { overflow-x: hidden }`（`style.css:1308`）又把溢出藏起来，用户看不到也拿不到被裁的文字。
- **改法**：
  ```css
  .platform-card .best { white-space: normal; }
  @media (max-width: 860px) { .platform-card .p-head { flex-wrap: wrap; } }
  ```
  去掉 nowrap 后 1fr 轨道回到容器宽度，可能换成两行显示；`overflow-x:hidden` 可保留作兜底，但不能靠它掩盖问题。验收：375px 三档字号下 `.platform-grid` 轨道 ≤ 339px，六张卡全部内容可见。

### S6. 375px 课程「完成」按钮溢出并被裁切
- **实测**：点击完成后 JS 把文案改成 `✓ 这一课已完成（点一下可以取消）`（`assets/app.js:129`），按钮实测 **365px 宽**、right=405（视口 375）→ 右侧被裁；卡片内容区只有约 294px。特大字号下即使未完成态，按钮也有 366px（卡片内容区约 285px）。
- **原因**：`.btn { white-space: nowrap }`（`style.css:1301`）+ app.js 长文案。
- **改法**：
  ```css
  @media (max-width: 860px) { .btn { white-space: normal; } }
  ```
  `app.js:129` 文案缩短为 `✓ 已完成（点一下取消）` 和 `标记这一课完成`；`app.js:120` 的 CTA「八课都学完了，回去复习」在特大字号下也会超出进度卡（约 314px vs 277px），同步改成「都学完了，去复习」。验收：375px 三档字号下按钮不超出卡片/视口。

### S7. 示意图/练习纸 SVG 内文字过小、部分对比度不足
- **字号（手机）**：练习纸 SVG 700 单位宽，在 375px 卡片里显示约 294px（缩放 0.42）：12 单位字 ≈ **5.0px**、15 单位 ≈ 6.3px；课程示意图 640 宽显示约 314px（缩放 0.49）：13–15 单位 ≈ 6.4–7.4px。且不随字号三档放大（图片内文字）。
- **对比度（WCAG 1.4.3，图片内文字同样适用）**：`#B9AD9A` on #FBF6EC = **2.05:1**、`#A99E8D` = **2.45:1**、`#A98D6B` = **2.91:1**，均低于 4.5:1。
- **位置**：
  - 练习纸说明文字（12–13 单位 + 低对比色）：`assets/img/sheet-apple.svg:19,20,29,30,39,40,50`、`sheet-lines.svg:6,7,60`、`sheet-shapes.svg:6,7,22,36,73,74,75`、`sheet-values.svg:6,7,51,65`；
  - 课程示意图图注小句（#A98D6B 15 单位）：`cube.svg:59`、`cylinder.svg:61`、`flower.svg:80`、`lines.svg:67`、`sphere.svg:69`、`stilllife.svg:77`、`tones.svg:82`、`tools.svg:67`、`hero-stilllife.svg:69,71`。
- **改法**：
  1. 上述 `fill` 统一改为 `#5E5449`（on #FBF6EC = 6.86:1，打印也清楚），页眉/日期类可改 `#6B6055`（5.68:1）；
  2. 练习纸 12–13 单位文字提到 ≥20 单位，640 宽示意图文字提到 ≥20–22 单位（或把关键说明搬到 HTML 的 `.sheet-notes` / figcaption，用户可点「点一下放大」看原图——这个入口 18:35 已加，方向正确）；
  3. 给 `sheet-*.svg` 里没写 `font-family` 的 `<text>` 统一加 `font-family="PingFang SC, Microsoft YaHei, sans-serif"`。
- 验收：375px 截图放大后练习纸说明可读；打印稿灰字不虚。

---

## 三、建议（应该改）

1. **首页缺失 `aria-current`**：`index.html` 实测 0 个 `aria-current`（其他页 header + tabbar 各 1 个）。原因：`build.mjs:142/156` 比较 `key === page`，而 NAV 的 key 是 `home`、`buildIndex` 传的是 `page:'index'`（`build.mjs:206/340`）。改法：`header()`/`tabbar()` 内 `const cur = page === 'index' ? 'home' : page;` 再比较；顺便把 `page === 'lesson'` 时的「学习地图」标为当前页。
2. **搜索页 tablist 语义不完整**：`role="tablist"`（`build.mjs:607-611`）没有 `tabpanel`、`aria-controls`，且 5 个 tab 实测 `tabIndex` 全为 0（ARIA tabs 模式应只有一个 tab stop、其余 -1）。读屏用户听到“选项卡”却没有对应面板。改法：改成 `role="group" aria-label="选择搜索平台"` + `aria-pressed`（`app.js:227` 同步 `aria-pressed`），或补面板与 roving tabindex + Home/End。
3. **触控目标仍低于 BRIEF 的 48px**（实测，375px）：`.p-link` 40px、`.sheet-print` 40px（`style.css:1001/1283`）、页脚链接 40px（`1327`）、面包屑链接 36px（`1329`）、课程侧栏链接 37px（`1330`）、图注「放大看」26px、复选 input 26px。至少补到 44px：`.site-footer a, .p-link, .sheet-print, .breadcrumb a, .aside-list a { min-height: 44px; }`，`figcaption a { padding-block: .4rem; }`（BRIEF 硬性 48，当前顶栏两控件已是 44，属最低线）。
4. **`#keywords` 锚点被吸顶头遮挡**：全站没有 `scroll-margin-top`（grep 0 处），页脚「可以搜的关键词」跳到 `search.html#keywords` 时小标题会藏在 sticky header 下。改法：`[id] { scroll-margin-top: calc(var(--header-h) + 1rem); }`。
5. **朗读范围与切块**：`data-read-scope` 放在 `<main>`（`build.mjs:407`、`576`），朗读会把侧栏「八堂课 第 1…第 8 课」「眼睛累了」等卡片也读出来；且 `app.js:208` 读的是 `data-read-scope-target` 属性——HTML 从未生成该属性，目前靠 `|| '[data-read-scope]'` 兜底才工作（能跑，但脆弱）。另外 `app.js:210` 按换行切块，单块可能 >15 秒（Chrome 长句会中途截断），建议按「。！？」切到每块 ≤80 字。改法：朗读前 clone scope 并移除 `nav, aside, .read-row, .breadcrumb`（或给它们加 `data-read-skip`）。
6. **输入框占位文字对比度不足**：默认 `::placeholder` 色 #757575 实测亮色约 4.29:1、暗色 3.63:1（背景 #221d18）。改法：`.note-field textarea::placeholder { color: var(--muted); opacity: 1 }`（亮 5.68 / 暗 6.66）。
7. **帮助页标题层级与语气**：`help.html` 是 H1 → 7 个 H3（`help.html:51-102`），跨级；且 H2「她最想问的十个问题」（`help.html:110` / `build.mjs:864`）用第三人称「她」，与全站「你」不一致。改法：帮助卡片 h3→h2；改「你最想问的十个问题」。
8. **进度语义补强**：`app.js:101` 更新了 `aria-valuenow`，但没有 `aria-valuetext`；顶栏「已学 0/8 课」更新时读屏不播报（完成按钮的 `aria-pressed` 和 toast `role=status` 已有 ✓）。改法：`el.setAttribute('aria-valuetext', '已学 ' + count + ' 课，共 8 课')`。
9. **添加到主屏图标缺失**：全站无 `apple-touch-icon`，manifest 只有 SVG icon（`build.mjs:926-948`）。帮助页教了「添加到主屏幕」，iOS 会拿网页截图当图标。改法：加 180×180 PNG + `<link rel="apple-touch-icon">`，manifest 补 192/512 PNG。
10. **`color-mix` 无回退**（微信内置浏览器旧内核可能不支持，BRIEF 要求微信必须正常）：`style.css` 有 12 处，其中 `.site-header`（约 205 行）背景一旦失效会变透明，滚动时正文会从 header 下穿过。改法：每条 `background: color-mix(...)` 前先写 `background: var(--paper);`（或对应实色）兜底。
11. **示意图宽高与真实 SVG 不符**：`build.mjs:442` 对所有示意图硬编码 `width="640" height="420"`，但 `tones.svg` 的 viewBox 是 640×460 → 首屏按 420 预留、加载后跳高（CLS）。改法：build 读 SVG viewBox 生成宽高，或只保留 width、删 height。
12. **`meta color-scheme: light dark` 与 `data-theme` 不联动**：页面夜间模式靠 `data-theme`，但 meta 声明 light/dark 会让 UA 按系统偏好渲染表单控件/滚动条，可能出现暗控件配亮纸底。改法：CSS `html { color-scheme: light; } html[data-theme="dark"] { color-scheme: dark; }`，meta 可删。
13. **打印时 `figcaption` 里的「· 放大看」链接仍会印出**（`lesson-1.html:85` 等，`build.mjs` figure 段）：随 S2 一起在 print 隐藏 `figcaption a`。
14. **`@page` 固定 A4**：写入 `size: A4`，避免不同打印机默认 Letter（本机 headless 实测默认 Letter 612×792pt）。

---

## 四、可选（锦上添花）

- `.print-head` 选择器（`style.css:1259-1263`）在 14 个 HTML 里没有任何对应元素，属死代码；要么在练习纸打印时输出打印页眉，要么删除。
- `data-page`（14 页 body）与 `data-url-template`（5 个 tab）没有任何 JS/CSS 使用（JS 实际用 `data-links`），可删。
- 搜索页 22 个 `target="_blank"` 已带 `rel="noopener"`；可补 `noreferrer`，并给长辈用户加视觉隐藏的「（在新窗口打开）」提示。
- 打印时 `.sheet-art img` 建议再加 `max-height: 165mm`，给不同打印引擎留余量（S1 已含）。
- QR：`assets/img/qr-site.svg` 已生成且 200，alt 完整；**上线后请真机扫码复核一次**（二维码指向 `jarrettchen888.github.io/sketch-courtyard/`，未部署时不可达；帮助页「网址」链接同理）。
- 首页 4 张「担心」卡片与使用帮助 FAQ 同源（`build.mjs:201` 取 faq[0/2/4/5]），改文案只需改一处，正常。
- 页脚 h4 在 practice/404 页面之前没有 h3（轻微跳级，不影响 AA）；统一为 h3 更规范。
- sitemap 无 `lastmod`；`og:url` 所有页面都指向首页（`build.mjs:head()` 固定 `SITE.url`），可改为每页自己的 URL。

---

## 五、已验证通过（不需改）

**结构 / 语言 / 语义**
- 14 个 HTML 全部 `lang="zh-CN"`、`<title>` 独立、每页 h1 唯一。
- 每页 `header` / `main#main` / `footer` landmark 齐全；`nav` 全部有 `aria-label`（主导航 / 快捷导航 / 位置 / 课程导航）；`aside` 有 aria-label；`article` 包住课程正文。
- 标题层级：首页 H1→H2→H3、课程页 H1→H2→H3、搜索页 H1→H2→H3 均正确（帮助页跳级见建议 7）。

**图片 / 表单 / 链接**
- 0 个 `<img>` 缺 alt；示意图 alt 为用户可理解的「示意图：…」；装饰图 `alt=""` + `aria-hidden`；内联图标 SVG 全部 `aria-hidden`。
- 8 课 × 3 个复选（24 个）全部 `id` + `<label for>`；8 个 textarea 全部有 label；按钮均有可读文案；无空链接、无「点这里」类模糊链接。
- 每页都有跳过导航链接 + `#main` 目标；`#keywords`、`#main` 锚点目标均存在。

**对比度（亮色，实测/计算均 ≥4.5:1）**
- 正文 #2B2622/#FBF6EC = 13.89；ink-2 = 9.15；muted = 5.68；链接 accent-deep = 6.72；teal = 6.31；主按钮 #FFFDF8/#A9553F = 5.09；success = 5.52；暗色正文 13.76、muted 7.43、链接 8.41、teal 8.84、success 7.08。**（暗色主按钮与焦点环除外，见 S3/S4。）**

**交互（Chrome 375px 实测，控制台 0 报错）**
- 字号三档：normal→large→xlarge 循环，`html[data-fs]`、按钮文案/`aria-label`、`localStorage.smxy.fs` 全部同步；刷新后保持。
- 夜间模式：`data-theme="dark"`、`aria-pressed="true"`、`localStorage.smxy.theme` 同步；再点恢复。
- 课程完成：写 `smxy.progress`、顶栏计数 0→1、`aria-pressed` 切换、按钮文案/样式切换、toast 播报；再点可取消。
- 勾选 `data-persist="check.N"` + `data-ck`、笔记 `data-note` 均按预期存取（localStorage，异常时 try/catch 兜底）。
- 进度条 `role="progressbar"` + aria-label/valuemin/valuemax/valuenow，JS 更新 `aria-valuenow`；`data-progress-cta` 指向下一课/全部完成时回地图。
- 搜索平台：5 个 tab 点击后 17 个关键词的 href 全部切换（实测 B站→小红书 URL 正确，中文经 `encodeURIComponent` 编码为 `%20`/UTF-8）；键盘 ←→↑↓ 可切换并聚焦；6 张平台卡；`微信搜一搜` 无可用搜索 URL 时正确回退为文字说明（无空 href、无 JS 异常）。
- 打印按钮：`data-print` / `data-print-sheet` 均存在且绑定；`print-one` 逻辑成立（其余 `.sheet` 实测 `display:none`，`afterprint` 会清理类）。
- `prefers-reduced-motion` 已处理（关闭平滑滚动与过渡）。

**移动端**
- 375px：header 只剩品牌 + 字号 + 夜间两控件（实测 44×44），无横向滚动（`documentElement.scrollWidth=375`，`overflow-x:hidden` 兜底）；tabbar 58px + body `padding-bottom:66px`，不遮底部内容；`.toast` 在移动端抬到 80px 避开 tabbar。
- 网格在 375 单列、420 以下课程卡单列、平台卡单列、四步法单列、错误对照上下堆叠，均正常（搜索平台卡的 nowrap 问题见 S5）。

**打印（结构层面已对）**
- 已隐藏：`.site-header`、`.tabbar`、`.site-footer`、`.lesson-aside`、`.lesson-nav`、`.sheet-toolbar .btn`、`.fig-zoom::after`（18:35 修）。
- `.sheet { break-inside: avoid }` 生效；`body.print-one .sheet:not(.is-target){display:none}` 生效。

**资源 / 依赖 / 元文件**
- 35 个 URL 全部 200（14 HTML + style.css + app.js + manifest + robots + sitemap + 16 SVG，含新增 `qr-site.svg`）；站内相对链接 0 断链。
- **无外部字体 / CDN / 统计脚本**；外部链接仅 5 个搜索平台（B站、小红书、抖音、百度、知乎，均为功能入口）与本站在 GitHub Pages 的自身地址，符合 BRIEF。
- manifest.webmanifest 合法（name/short_name/start_url/scope/display/theme_color/lang/icons）；robots.txt 含 Sitemap；sitemap.xml 14 条与页面一致。
- 内容契约：8 课（id l1–l8、num 1–8、slug 齐全）、6 个平台、keywords 4 组 17 词、judge 5 / save 4 / safety 6 / tasks 3 / faq 10、faq.json 10 条，全部 JSON 可解析；术语首次出现有括号解释（排线、透视、切圆、明暗交界线、五调子、静物、临摹、中轴等）；未出现「您/阿姨/大妈/老年人/速成」等禁用词（「三天学会」只出现在防骗示例里）；语气统一用「你」（仅帮助页「她」一处，见建议 7）。

---

## 六、建议修复顺序

1. S1 + S2（打印，一次 CSS 补丁 + build 两处小改，费纸且最影响体验）
2. S3 + S4（两个 CSS 变量/规则即可，AA 合规）
3. S5 + S6（两处 `white-space` + app.js 文案）
4. S7（批量改 SVG fill/字号，可与 Lead 并行）
5. 建议 1/3/4/7 等低成本项
6. 最后重跑本报告的验收命令：`curl` 全量 200 + headless 375px 三档测 `scrollWidth` + 打印 A4 页数（练习纸全部=4、单张=1）+ Tab 焦点/暗色对比度抽查。
