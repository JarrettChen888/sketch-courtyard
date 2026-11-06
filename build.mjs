/**
 * 素描小院 · 静态站点生成器
 * 用法：node build.mjs
 * 输入：content/lessons.json、content/search-guide.json、content/faq.json
 * 输出：仓库根目录下的 HTML 页面（GitHub Pages 直接发布）
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const rd = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const { lessons } = rd('content/lessons.json');
const guide = rd('content/search-guide.json');
const { faq } = rd('content/faq.json');

const SITE = {
  name: '素描小院',
  tagline: '零基础 · 慢慢画',
  url: 'https://jarrettchen888.github.io/sketch-courtyard/',
  desc: '给零基础的你：8 节素描小课，一步一步学会画画；也教你怎么上网找教程、找参考图。不用注册，免费无广告，手机就能看。',
};

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/* ---------------- 图标 ---------------- */
const ICONS = {
  pencil: '<path d="M4 20l1-4L16.2 4.8a2.1 2.1 0 0 1 3 3L8 19l-4 1z"/><path d="M13.5 6.5l3 3"/><path d="M4 20l3.6-.6"/>',
  arrow: '<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M20 12H5"/><path d="M11 6l-6 6 6 6"/>',
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>',
  map: '<path d="M3 6.5l6-2.5 6 2.5 6-2.5V18l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v16"/><path d="M15 6.5V22"/>',
  search: '<circle cx="11" cy="11" r="6.2"/><path d="M15.6 15.6L21 21"/>',
  grid: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 12h16"/><path d="M12 4v16"/>',
  help: '<circle cx="12" cy="12" r="8.2"/><path d="M9.4 9.4a2.7 2.7 0 1 1 3.8 2.5c-.7.4-1.2 1-1.2 1.9"/><circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none"/>',
  check: '<path d="M5 12.6l4.4 4.4L19 7"/>',
  cross: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  bulb: '<path d="M9.2 18h5.6"/><path d="M10.2 21h3.6"/><path d="M12 3a6 6 0 0 0-3.4 10.9c.4.3.6.7.6 1.2h5.6c0-.5.2-.9.6-1.2A6 6 0 0 0 12 3z"/>',
  shield: '<path d="M12 3l7 3v5.2c0 4.4-3 7.3-7 8.8-4-1.5-7-4.4-7-8.8V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.2v5l3.2 2"/>',
  voice: '<path d="M4 10v4h3l4.5 3.2V6.8L7 10H4z"/><path d="M15.4 9.2a3.6 3.6 0 0 1 0 5.6"/><path d="M17.8 6.6a7.4 7.4 0 0 1 0 10.8"/>',
  eye: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.6"/>',
  moon: '<path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>',
  phone: '<rect x="7" y="2.8" width="10" height="18.4" rx="2.4"/><path d="M10.6 5.6h2.8"/>',
  print: '<path d="M7 9V3.8h10V9"/><rect x="3.8" y="9" width="16.4" height="7.6" rx="2"/><path d="M7 13.6h10V20H7z"/>',
  star: '<path d="M12 3.4l2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.6l5.9-.9z"/>',
  play: '<circle cx="12" cy="12" r="8.6"/><path d="M10 8.4l6 3.6-6 3.6z"/>',
  leaf: '<path d="M4.5 19.5C5 11 11 4.5 20 4.5c0 9-6.5 15-15 14.7z"/><path d="M4.5 19.5L14 10"/>',
  book: '<path d="M12 6.2C10.4 5 8 4.4 4.5 4.4v13.2c3.5 0 5.9.6 7.5 1.8 1.6-1.2 4-1.8 7.5-1.8V4.4c-3.5 0-5.9.6-7.5 1.8z"/><path d="M12 6.2v13.2"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-9.4A4.2 4.2 0 0 1 12 7.9a4.2 4.2 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  paper: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4"/><path d="M9 12h6M9 15.6h6M9 8.4h2"/>',
};
const icon = (name, cls = '') =>
  `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------------- 示意图文案 ---------------- */
const FIG = {
  tools: {
    alt: '示意图：桌面上摆着铅笔、橡皮、素描纸、美纹纸和削笔刀，位置一目了然',
    cap: '示意图：桌面就摆这五样，伸手都能够到。',
  },
  lines: {
    alt: '示意图：练习纸上画着长线、竖排线、斜排线和一块用排线铺出的灰面',
    cap: '示意图：长线一口气拉完，排线并排站队，灰面靠一层层叠出来。',
  },
  cube: {
    alt: '示意图：一个两点透视的方块，消失点和看不见的结构线用虚线标出',
    cap: '示意图：看得见的边画实线，看不见的边用虚线先轻轻画出来。',
  },
  sphere: {
    alt: '示意图：一个球体上画着横竖两条椭圆结构线，旁边是修正前后的圆',
    cap: '示意图：先画一个方框和十字线，再在框里把圆修出来。',
  },
  tones: {
    alt: '示意图：一个球体分出高光、亮部、明暗交界线、反光和投影五个部分，旁边是一条从浅到深的调子条',
    cap: '示意图：一个球，被光分成了五种深浅。',
  },
  cylinder: {
    alt: '示意图：圆柱体的上下两个椭圆结构，以及它旁边的玻璃水杯',
    cap: '示意图：圆柱的上下面都是椭圆，杯子的口和底也一样。',
  },
  stilllife: {
    alt: '示意图：一个苹果和一只水杯摆在一起，画面标出构图位置和投射的阴影',
    cap: '示意图：两样东西一前一后，阴影连在一起，画面才稳。',
  },
  flower: {
    alt: '示意图：一朵花从花心向外画花瓣，旁边是叶子和花茎的走向线',
    cap: '示意图：花瓣从花心往外长，先画中线，再画两边的弧。',
  },
};

/* ---------------- 页面骨架 ---------------- */
const NAV = [
  ['index.html', '首页', 'home'],
  ['map.html', '学习地图', 'map'],
  ['search.html', '学找资料', 'search'],
  ['practice.html', '练习纸', 'practice'],
  ['help.html', '使用帮助', 'help'],
];
const TAB_ICON = { home: 'home', map: 'map', search: 'search', practice: 'grid', help: 'help' };

function head({ title, desc, page }) {
  const full = page === 'index' ? `${SITE.name} · ${SITE.tagline}` : `${title} · ${SITE.name}`;
  return `<!doctype html>
<html lang="zh-CN" data-fs="normal">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc || SITE.desc)}">
<meta name="theme-color" content="#fbf6ec">
<meta name="color-scheme" content="light dark">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc || SITE.desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE.url}">
<meta property="og:site_name" content="${SITE.name}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23fbf6ec'/%3E%3Ccircle cx='32' cy='32' r='21' fill='none' stroke='%232b2622' stroke-width='3'/%3E%3Cpath d='M21 43l1.5-6 14-14a3.2 3.2 0 0 1 4.5 4.5l-14 14-6 1.5z' fill='none' stroke='%23a9553f' stroke-width='3' stroke-linejoin='round'/%3E%3C/svg%3E">
<link rel="manifest" href="manifest.webmanifest">
<link rel="stylesheet" href="assets/style.css">
<script>(function(){try{var d=document.documentElement;var f=localStorage.getItem('smxy.fs');if(f==='large'||f==='xlarge'){d.dataset.fs=f;}if(localStorage.getItem('smxy.theme')==='dark'){d.dataset.theme='dark';}}catch(e){}})();</script>
</head>
<body data-page="${page}">`;
}

function header(page) {
  return `
<a class="skip-link" href="#main">跳到正文</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="index.html" aria-label="${SITE.name}，回到首页">
      <span class="brand-mark" aria-hidden="true">${icon('pencil')}</span>
      <span class="brand-text">素描小院<small>SLOW SKETCH</small></span>
    </a>
    <nav class="nav" aria-label="主导航">
      ${NAV.map(([href, label, key]) => `<a href="${href}"${key === page ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ')}
      <span class="nav-progress"><a href="map.html">已学 <b data-progress-text>0</b>/8 课</a></span>
    </nav>
    <div class="header-tools">
      <button class="btn-fs" type="button" data-fs-toggle aria-label="字号：标准，点一下切换">字号：<span data-fs-label>标准</span></button>
      <button class="btn-icon" type="button" data-theme-toggle aria-label="切换到夜间模式" aria-pressed="false">${icon('moon', 'icon-moon')}${icon('sun', 'icon-sun')}</button>
    </div>
  </div>
</header>`;
}

function tabbar(page) {
  return `
<nav class="tabbar" aria-label="快捷导航">
  ${NAV.map(([href, label, key]) => `<a href="${href}"${key === page ? ' aria-current="page"' : ''}>${icon(TAB_ICON[key])}<span>${label}</span></a>`).join('\n  ')}
</nav>`;
}

function footer() {
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand"><span class="brand-mark" aria-hidden="true">${icon('pencil')}</span><strong>素描小院</strong></div>
        <p>给零基础的你，慢慢画。</p>
        <p>不用注册，免费，无广告。学习记录只存在你自己的浏览器里。</p>
      </div>
      <div>
        <h4>开始学</h4>
        <ul>
          <li><a href="map.html">八堂课 · 学习地图</a></li>
          <li><a href="lesson-1.html">第 1 课：先认识你的工具</a></li>
          <li><a href="practice.html">打印练习纸</a></li>
        </ul>
      </div>
      <div>
        <h4>帮自己找老师</h4>
        <ul>
          <li><a href="search.html">怎么上网找教程</a></li>
          <li><a href="search.html#keywords">可以搜的关键词</a></li>
          <li><a href="help.html">使用帮助</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ${SITE.name} · 慢慢画，不着急</span>
      <span>写给 50 岁开始画画的你 · 手机电脑都能看 · 可打印</span>
    </div>
  </div>
</footer>`;
}

const tail = `<script src="assets/app.js"></script>
</body>
</html>`;

/* ---------------- 首页 ---------------- */
function buildIndex() {
  const worryPicks = [faq[0], faq[2], faq[4], faq[5]].filter(Boolean);
  return `${head({
    page: 'index',
    title: '首页',
    desc: '素描小院：8 节零基础素描小课，大字、可朗读、可打印；还教你怎么上网找教程、找参考图。',
  })}${header('index')}
<main id="main">
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">写给零基础 · 慢慢来</p>
        <h1>从今天起，<br><span class="mark">慢慢画</span>。</h1>
        <p class="hero-lead">不用基础，也不用天赋。每天二十分钟，从一根线开始。这个小院，陪你画完八节小课，画完第一朵花。</p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="lesson-1.html">开始第一课 ${icon('arrow', 'arrow')}</a>
          <a class="btn btn-secondary btn-lg" href="map.html">先看看八堂课</a>
        </div>
        <p class="hero-meta">
          <span>${icon('clock')}每课 15–25 分钟</span>
          <span>${icon('eye')}字大、能朗读</span>
          <span>${icon('phone')}手机就能看</span>
          <span>${icon('print')}可打印</span>
        </p>
      </div>
      <div class="hero-figure">
        <div class="sketch-frame">
          <img src="assets/img/hero-stilllife.svg" width="640" height="480" alt="一张画着苹果和茶杯的素描小画，铅笔线条，旁边放着两支铅笔">
        </div>
        <p class="sketch-caption">第一幅小画，从这里开始</p>
        <span class="hero-note">${icon('pencil')}先轻轻起形，再慢慢加深</span>
      </div>
    </div>
    <div class="container">
      <div class="progress-card">
        <div class="progress-label">你已经走了 <b><span data-progress-text>0</span> / 8</b> 课</div>
        <div class="progress" role="progressbar" aria-label="学习进度" aria-valuemin="0" aria-valuemax="8" aria-valuenow="0"><i data-progress-bar></i></div>
        <a class="btn btn-secondary" href="map.html" data-progress-cta>从第一课开始</a>
      </div>
    </div>
  </section>

  <section class="section-tight">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">为什么在这里学</p>
        <h2>这个小院，为「慢慢学」准备</h2>
        <p>不是网上一口气讲完的大课，是一节一节能做完的小课。</p>
      </div>
      <div class="grid grid-4">
        <div class="card card-pad feature">
          <span class="icon-round">${icon('eye')}</span>
          <h3>字大，看得清</h3>
          <p>右上角能调三档字号，正文够大，行距也松。</p>
        </div>
        <div class="card card-pad feature">
          <span class="icon-round">${icon('voice')}</span>
          <h3>累了可以听</h3>
          <p>每节课都有「朗读」按钮，眼睛累了就让它读给你听。</p>
        </div>
        <div class="card card-pad feature">
          <span class="icon-round">${icon('check')}</span>
          <h3>每课都画得完</h3>
          <p>15–25 分钟，跟着做就能完成一张小画。</p>
        </div>
        <div class="card card-pad feature">
          <span class="icon-round">${icon('search')}</span>
          <h3>还教你自己找老师</h3>
          <p>学会搜关键词、看视频、存参考图，以后不用等别人发资料。</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">八堂小课</p>
        <h2>一周两课，四周慢慢走完</h2>
        <p>时间不够就停下来，明天再画。顺序也不是死的，想画哪课点哪课。</p>
      </div>
      <div class="grid grid-4 course-grid">
        ${lessons
          .map(
            (l) => `<a class="card card-link course-mini" href="lesson-${l.num}.html" data-lesson-mini="${l.num}">
          <span class="num">第 ${l.num} 课</span>
          <h3>${esc(l.title)}</h3>
          <p>${esc(l.subtitle)}</p>
          <span class="state"><span class="dot" aria-hidden="true"></span><span data-state-text>约 ${l.minutes} 分钟</span></span>
        </a>`
          )
          .join('\n        ')}
      </div>
      <div class="section-foot">
        <a class="btn btn-ghost" href="map.html">看完整学习地图 ${icon('arrow')}</a>
      </div>
    </div>
  </section>

  <section class="section-tight">
    <div class="container">
      <div class="card card-pad search-teaser">
        <div>
          <p class="eyebrow">学会找资料</p>
          <h2>网上的老师，比你想的多</h2>
          <p>这一页教你在 B站、小红书、抖音、百度上找教程和参考图：搜什么词、怎么判断好不好、怎么存下来、怎么不被骗。学会以后，你就永远有老师。</p>
          <div class="section-foot">
            <a class="btn btn-primary" href="search.html">学会上网找资料 ${icon('arrow', 'arrow')}</a>
          </div>
        </div>
        <div class="teaser-art" aria-hidden="true">
          <img src="assets/img/search-art.svg" width="420" height="340" alt="插画：放大镜照着搜索框和一张素描小画">
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">你可能会担心</p>
        <h2>这些问题，先替你想过</h2>
        <p>都是来学画的人最常问的，点开看看。</p>
      </div>
      <div class="grid grid-2">
        ${worryPicks
          .map(
            (f) => `<div class="card card-pad quote-card">
          <h3>「${esc(f.q)}」</h3>
          <p>${esc(f.a)}</p>
        </div>`
          )
          .join('\n        ')}
      </div>
      <div class="section-foot">
        <a class="btn btn-ghost" href="help.html">更多问题进使用帮助 ${icon('arrow')}</a>
      </div>
    </div>
  </section>
</main>
${tabbar('index')}${footer()}${tail}`;
}

/* ---------------- 学习地图 ---------------- */
function buildMap() {
  return `${head({
    page: 'map',
    title: '学习地图',
    desc: '素描小院八堂课：工具、排线、方块、球体、明暗、圆柱、静物、画一朵花。每课 15–25 分钟，一周两课。',
  })}${header('map')}
<main id="main">
  <div class="container page-head">
    <p class="eyebrow">学习地图</p>
    <h1>八堂课，慢慢来</h1>
    <p class="lead">每一课都能单独画完，也都能单独练。建议一周两课，一次 15–25 分钟；累了就停，明天接着画。完成的课会自动打上勾，进度只存在你自己的手机里。</p>
    <div class="map-progress">
      <div class="progress-card map-progress-inner" style="margin-top:1.6rem">
        <div class="progress-label">已学 <b><span data-progress-text>0</span> / 8</b> 课</div>
        <div class="progress" role="progressbar" aria-label="学习进度" aria-valuemin="0" aria-valuemax="8" aria-valuenow="0"><i data-progress-bar></i></div>
        <a class="btn btn-secondary" href="lesson-1.html" data-progress-cta>从第一课开始</a>
      </div>
    </div>
  </div>
  <div class="container" style="padding-bottom:2rem">
    <ol class="path">
      ${lessons
        .map(
          (l) => `<li class="path-item" data-lesson-item="${l.num}">
        <span class="path-num" aria-hidden="true">${l.num}</span>
        <a class="card card-link path-card" href="lesson-${l.num}.html">
          <div class="top">
            <h2>${esc(l.title)}</h2>
            <span class="meta">约 ${l.minutes} 分钟</span>
          </div>
          <p>${esc(l.subtitle)}</p>
          <span class="path-action"><span data-state-text data-done-text="已完成，点开复习">开始这一课</span> ${icon('arrow')}</span>
        </a>
      </li>`
        )
        .join('\n      ')}
    </ol>
    <div class="path-end">
      <span class="path-num" aria-hidden="true">${icon('leaf')}</span>
      <div class="card card-pad">
        <h2 style="font-size:1.18rem;margin-bottom:.4rem">八课之后，接着画</h2>
        <p class="muted" style="font-size:.9rem">课是小院的课，画是自己的画。学完八课，去把这些年想画的东西找出来，慢慢画。</p>
        <div style="display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.9rem">
          <a class="btn btn-secondary" href="search.html">学会自己找教程</a>
          <a class="btn btn-secondary" href="practice.html">打印练习纸</a>
        </div>
      </div>
    </div>
  </div>
</main>
${tabbar('map')}${footer()}${tail}`;
}

/* ---------------- 课程页 ---------------- */
function buildLesson(l) {
  const fig = FIG[l.svg] || FIG.lines;
  const prev = lessons.find((x) => x.num === l.num - 1);
  const next = lessons.find((x) => x.num === l.num + 1);
  return `${head({
    page: 'lesson',
    title: `第 ${l.num} 课：${l.title}`,
    desc: `第 ${l.num} 课「${l.title}」：${l.subtitle}。约 ${l.minutes} 分钟，零基础可完成。`,
  })}${header('lesson')}
<main id="main" data-read-scope>
  <div class="container lesson-hero">
    <nav class="breadcrumb" aria-label="位置">
      <a href="map.html">学习地图</a><span aria-hidden="true">/</span><span>第 ${l.num} 课</span>
    </nav>
    <div class="lesson-label">
      <span class="no">第 ${l.num} 课</span>
      <span class="chip">约 ${l.minutes} 分钟</span>
      <span class="chip chip-line">零基础</span>
    </div>
    <h1>${esc(l.title)}</h1>
    <p class="tagline">${esc(l.tagline)}</p>
    <div class="read-row">
      <button class="btn btn-secondary" type="button" data-read>${icon('voice')} 朗读这一课</button>
      <span class="small muted">点一下开始读，再点一下停。戴上耳机，跟着听也行。</span>
    </div>
  </div>
  <div class="container lesson-body">
    <div class="lesson-layout">
      <article class="lesson-main">
        <section class="block" aria-labelledby="h-goals">
          <div class="block-num">01 / 目标</div>
          <h2 id="h-goals"><span class="h-mark" aria-hidden="true"></span>这一课你会学会</h2>
          <ul class="goal-list">
            ${l.goals.map((g) => `<li>${icon('check')}<span>${esc(g)}</span></li>`).join('\n            ')}
          </ul>
        </section>

        <section class="block" aria-labelledby="h-prep">
          <div class="block-num">02 / 准备</div>
          <h2 id="h-prep"><span class="h-mark" aria-hidden="true"></span>先准备这些</h2>
          <div class="materials">
            ${l.materials.map((m) => `<span class="chip">${esc(m)}</span>`).join('\n            ')}
          </div>
          <figure class="figure" style="margin-top:1.3rem">
            <div class="art"><a class="fig-zoom" href="assets/img/${l.svg}.svg" target="_blank" rel="noopener" aria-label="放大查看示意图（在新窗口打开）"><img src="assets/img/${l.svg}.svg" width="640" height="420" alt="${esc(fig.alt)}"></a></div>
            <figcaption>${esc(fig.cap)} · <a href="assets/img/${l.svg}.svg" target="_blank" rel="noopener">放大看</a></figcaption>
          </figure>
        </section>

        <section class="block" aria-labelledby="h-steps">
          <div class="block-num">03 / 跟着做</div>
          <h2 id="h-steps"><span class="h-mark" aria-hidden="true"></span>一步一步来</h2>
          <ol class="steps">
            ${l.steps
              .map(
                (s, i) => `<li class="step">
              <span class="step-num" aria-hidden="true">${i + 1}</span>
              <h3>${esc(s.title)}</h3>
              <p>${esc(s.text)}</p>
              ${s.tip ? `<div class="tip">${icon('bulb')}<span><b>小提示：</b>${esc(s.tip)}</span></div>` : ''}
            </li>`
              )
              .join('\n            ')}
          </ol>
        </section>

        <section class="block" aria-labelledby="h-mistakes">
          <div class="block-num">04 / 注意</div>
          <h2 id="h-mistakes"><span class="h-mark" aria-hidden="true"></span>容易犯的错</h2>
          <div class="mistakes">
            ${l.mistakes
              .map(
                (m) => `<div class="mistake">
              <div class="dont">
                <span class="label">${icon('cross')}别这样</span>
                <p>${esc(m.dont)}</p>
              </div>
              <div class="do">
                <span class="label">${icon('check')}换个做法</span>
                <p>${esc(m.do)}</p>
              </div>
            </div>`
              )
              .join('\n            ')}
          </div>
        </section>

        <section class="block" aria-labelledby="h-practice">
          <div class="block-num">05 / 今日练习</div>
          <h2 id="h-practice"><span class="h-mark" aria-hidden="true"></span>今天的小练习</h2>
          <div class="practice-card">
            <div class="practice-head">
              <h3>${esc(l.practice.title)}</h3>
              <span class="chip">约 ${l.practice.minutes} 分钟</span>
            </div>
            <p class="practice-task">${esc(l.practice.task)}</p>
            <ul class="checklist" data-persist="check.${l.num}">
              ${l.practice.check
                .map(
                  (c, i) => `<li><input type="checkbox" id="ck-${l.num}-${i}" data-ck="${i}"><label for="ck-${l.num}-${i}">${esc(c)}</label></li>`
                )
                .join('\n              ')}
            </ul>
            <div class="note-field">
              <label for="note-${l.num}">今天画的时候，想记点什么？（可以不写）</label>
              <textarea id="note-${l.num}" data-note="${l.num}" placeholder="比如：排线还是不够匀，明天再练一组。"></textarea>
            </div>
            <div class="practice-actions">
              <button class="btn btn-primary" type="button" data-complete-btn="${l.num}">画完了，标记这一课完成</button>
              <p class="save-hint">进度和笔记只存在你自己的手机里，不上传，不用注册。</p>
            </div>
          </div>
        </section>

        <section class="block" aria-labelledby="h-recap">
          <div class="block-num">06 / 记住</div>
          <h2 id="h-recap"><span class="h-mark" aria-hidden="true"></span>记住这几句话</h2>
          <div class="recap">
            ${l.recap.map((r) => `<span class="chip">${esc(r)}</span>`).join('\n            ')}
          </div>
        </section>

        <nav class="lesson-nav" aria-label="课程导航">
          ${prev ? `<a href="lesson-${prev.num}.html">${icon('arrowLeft')} 第 ${prev.num} 课：${esc(prev.title)}</a>` : '<a href="map.html">回到学习地图</a>'}
          <a href="map.html">全部八课</a>
          ${next ? `<a class="next" href="lesson-${next.num}.html">第 ${next.num} 课：${esc(next.title)} ${icon('arrow')}</a>` : `<a class="next" href="search.html">下一步：学会自己找资料 ${icon('arrow')}</a>`}
        </nav>
        <noscript><p class="small muted" style="margin-top:1rem">浏览器没有开启脚本：勾选和进度不会被记住，但不影响你阅读和照着画。</p></noscript>
      </article>

      <aside class="lesson-aside" aria-label="本课信息">
        <div class="card aside-card">
          <h3>八堂课</h3>
          <ul class="aside-list">
            ${lessons
              .map(
                (x) => `<li data-lesson-row="${x.num}"${x.num === l.num ? ' class="is-current"' : ''}>
              <span class="dot" aria-hidden="true"></span>
              <a href="lesson-${x.num}.html" style="color:inherit;text-decoration:none"${x.num === l.num ? ' aria-current="page"' : ''}>第 ${x.num} 课：${esc(x.title)}</a>
            </li>`
              )
              .join('\n            ')}
          </ul>
          <p class="aside-note">不必按顺序，想画哪课点哪课。</p>
        </div>
        <div class="card aside-card">
          <h3>本课用时</h3>
          <p style="font-family:var(--font-serif);font-size:1.5rem;margin:0 0 .3rem">约 ${l.minutes} 分钟</p>
          <p class="aside-note">一次画不完，分两次也行。画画不是任务，是休息。</p>
        </div>
        <div class="card aside-card">
          <h3>眼睛累了</h3>
          <p class="aside-note">每画 20 分钟，抬头看看远处 20 秒。用「朗读」按钮，可以一边听一边画。</p>
        </div>
      </aside>
    </div>
  </div>
</main>
${tabbar('lesson')}${footer()}${tail}`;
}

/* ---------------- 找资料页 ---------------- */
function buildSearch() {
  const shortName = (n) =>
    n.replace('哔哩哔哩（B站）', 'B站').replace('微信搜一搜', '微信');
  const platformTabs = guide.platforms.filter((p) => p.urlTemplate);
  const repQ = guide.keywords[0].items[0];
  const encode = (tpl, q) => tpl.replace('{q}', encodeURIComponent(q));
  const defaultLinks = (q) => {
    const o = {};
    platformTabs.forEach((p) => { o[p.name] = encode(p.urlTemplate, q); });
    return JSON.stringify(o);
  };
  return `${head({
    page: 'search',
    title: '学会上网找资料',
    desc: '一步一步教你在 B站、小红书、抖音、百度上找素描教程和参考图：搜什么词、怎么判断好坏、怎么保存、怎么防骗。',
  })}${header('search')}
<main id="main" data-read-scope>
  <div class="container page-head">
    <p class="eyebrow">学会找资料</p>
    <h1>学会自己找老师</h1>
    <p class="lead">${esc(guide.intro)}</p>
    <div class="read-row" style="margin-top:1.1rem">
      <button class="btn btn-secondary" type="button" data-read>${icon('voice')} 朗读这一页</button>
    </div>
  </div>

  <div class="container">
    <section class="block" aria-labelledby="h-four">
      <div class="block-num">01 / 搜索四步法</div>
      <h2 id="h-four"><span class="h-mark" aria-hidden="true"></span>找资料，就四步</h2>
      <div class="four-steps">
        ${guide.fourSteps
          .map(
            (s) => `<div class="card four-step">
          <div class="n">${s.n}</div>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
        </div>`
          )
          .join('\n        ')}
      </div>
    </section>

    <section class="block" id="keywords" aria-labelledby="h-kw">
      <div class="block-num">02 / 关键词表</div>
      <h2 id="h-kw"><span class="h-mark" aria-hidden="true"></span>不知道搜什么？照这个表打</h2>
      <p class="kw-hint">先在下面选一个平台，再点关键词，就能直接打开搜索。搜索框里已经帮你填好了字，不用自己打字。</p>
      <div class="tabs" role="tablist" aria-label="选择搜索平台">
        ${platformTabs
          .map(
            (p, i) => `<button class="tab" type="button" role="tab" id="ptab-${i}" aria-selected="${i === 0}" data-platform-tab data-platform-name="${esc(p.name)}" data-url-template="${esc(p.urlTemplate)}">${esc(shortName(p.name))}</button>`
          )
          .join('\n        ')}
      </div>
      ${guide.keywords
        .map(
          (g, gi) => `<div class="kw-stage">
        <h3><span class="badge">${esc(g.stage)}</span></h3>
        <div class="kw-list">
          ${g.items
            .map(
              (q) => `<a class="kw" href="${esc(encode(platformTabs[0].urlTemplate, q))}" target="_blank" rel="noopener" data-q="${esc(q)}" data-links="${esc(defaultLinks(q))}">${esc(q)} ${icon('search')}</a>`
            )
            .join('\n          ')}
        </div>
      </div>`
        )
        .join('\n      ')}
      <p class="kw-hint">搜不到就换个说法：把「素描 苹果」改成「苹果 素描 步骤」，或者加上「零基础」「新手」。</p>
    </section>

    <section class="block" aria-labelledby="h-platforms">
      <div class="block-num">03 / 平台怎么用</div>
      <h2 id="h-platforms"><span class="h-mark" aria-hidden="true"></span>六个地方，各有各的用法</h2>
      <div class="platform-grid">
        ${guide.platforms
          .map(
            (p) => `<div class="card platform-card">
          <div class="p-head">
            <h3>${esc(p.name)}</h3>
            <span class="best">${esc(p.best)}</span>
          </div>
          <ol>${p.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
          ${p.tip ? `<p class="p-tip">${icon('bulb')} ${esc(p.tip)}</p>` : ''}
          ${p.urlTemplate
            ? `<a class="p-link" href="${esc(encode(p.urlTemplate, repQ))}" target="_blank" rel="noopener">去 ${esc(shortName(p.name))} 搜「${esc(repQ)}」 ${icon('arrow')}</a>`
            : `<p class="p-tip" style="margin-top:.7rem">在微信里搜：点微信顶部搜索框，打上关键词，选「文章」。</p>`}
        </div>`
          )
          .join('\n        ')}
      </div>
    </section>

    <section class="block" aria-labelledby="h-judge">
      <div class="block-num">04 / 判断好坏</div>
      <h2 id="h-judge"><span class="h-mark" aria-hidden="true"></span>怎么判断一个教程好不好</h2>
      <ul class="judge-list">
        ${guide.judge
          .map(
            (j, i) => `<li class="card judge-item">
          <span class="mark" aria-hidden="true">${i + 1}</span>
          <div><h3>${esc(j.title)}</h3><p>${esc(j.text)}</p></div>
        </li>`
          )
          .join('\n        ')}
      </ul>
    </section>

    <section class="block" aria-labelledby="h-save">
      <div class="block-num">05 / 保存整理</div>
      <h2 id="h-save"><span class="h-mark" aria-hidden="true"></span>找到了，怎么存下来</h2>
      <div class="grid grid-2 grid-start">
        <ul class="save-list">
          ${guide.save
            .map(
              (s) => `<li class="card judge-item">
            <span class="mark" aria-hidden="true">${icon('book')}</span>
            <div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>
          </li>`
            )
            .join('\n          ')}
        </ul>
        <div class="card safety">
          <h2>${icon('shield')}安全提醒</h2>
          <ul class="safety-list">
            ${guide.safety.map((s) => `<li><span aria-hidden="true">·</span><span><b>${esc(s.title)}</b>：${esc(s.text)}</span></li>`).join('\n            ')}
          </ul>
        </div>
      </div>
    </section>

    <section class="block" aria-labelledby="h-tasks">
      <div class="block-num">06 / 动手练</div>
      <h2 id="h-tasks"><span class="h-mark" aria-hidden="true"></span>三个小练习，今天就试一次</h2>
      <div class="task-grid">
        ${guide.tasks
          .map(
            (t) => `<div class="card task-card">
          <h3>${esc(t.title)}</h3>
          <ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        </div>`
          )
          .join('\n        ')}
      </div>
      <div class="section-foot">
        <a class="btn btn-secondary" href="map.html">回到学习地图 ${icon('arrow')}</a>
      </div>
    </section>

    <section class="block" aria-labelledby="h-faq">
      <div class="block-num">07 / 常见问题</div>
      <h2 id="h-faq"><span class="h-mark" aria-hidden="true"></span>搜资料时最容易卡住的</h2>
      ${guide.faq
        .map(
          (f) => `<details class="faq-item">
        <summary>${esc(f.q)}</summary>
        <div class="faq-a"><p>${esc(f.a)}</p></div>
      </details>`
        )
        .join('\n      ')}
    </section>
  </div>
</main>
${tabbar('search')}${footer()}${tail}`;
}

/* ---------------- 练习纸 ---------------- */
const SHEETS = [
  {
    key: 'lines',
    title: '直线和排线',
    minutes: 10,
    notes: '<b>怎么用：</b>每条长线一口气画完，画歪也别停；三组排线换三个方向，间距尽量一样宽。',
  },
  {
    key: 'shapes',
    title: '方块和椭圆',
    minutes: 15,
    notes: '<b>怎么用：</b>先轻轻画结构线，再描出看得见的边；椭圆两边要对称，别画成鸡蛋。',
  },
  {
    key: 'values',
    title: '明暗调子',
    minutes: 15,
    notes: '<b>怎么用：</b>从最浅一格开始，一层一层叠，不要用力压；球体的暗面靠近明暗交界线的地方最黑。',
  },
  {
    key: 'apple',
    title: '一个苹果',
    minutes: 20,
    notes: '<b>怎么用：</b>先用十字线定位置，再修轮廓；苹果的窝要画进去一点，明暗交界线沿着圆的转折走。',
  },
];
function buildPractice() {
  return `${head({
    page: 'practice',
    title: '打印练习纸',
    desc: '素描小院练习纸：线条排线、方块椭圆、明暗调子、一个苹果。可以用 A4 纸打印，也可以照着屏幕画。',
  })}${header('practice')}
<main id="main">
  <div class="container page-head">
    <p class="eyebrow">练习纸</p>
    <h1>打印出来，随手就能练</h1>
    <p class="lead">这四张纸，对应前面的课。有打印机就打印，没有就照着屏幕画——横过来看，屏幕当纸用。</p>
    <div class="sheet-toolbar">
      <button class="btn btn-primary" type="button" data-print>${icon('print')} 打印全部练习纸</button>
      <span class="small muted">打印时只保留练习纸，菜单和按钮会自动隐藏。</span>
    </div>
  </div>
  <div class="container sheet-grid">
    ${SHEETS.map(
      (s) => `<section class="sheet" aria-labelledby="sheet-${s.key}">
      <div class="sheet-head">
        <h2 id="sheet-${s.key}">练习纸 ${SHEETS.indexOf(s) + 1}：${s.title}</h2>
        <span class="meta">约 ${s.minutes} 分钟</span>
        <button class="btn btn-secondary sheet-print" type="button" data-print-sheet="${s.key}">${icon('print')} 只打印这一张</button>
      </div>
      <div class="sheet-art"><a class="fig-zoom" href="assets/img/sheet-${s.key}.svg" target="_blank" rel="noopener" aria-label="放大查看练习纸（在新窗口打开）"><img src="assets/img/sheet-${s.key}.svg" width="700" height="${({lines:810,shapes:670,values:760,apple:640})[s.key] || 640}" alt="练习纸：${s.title}"></a></div>
      <p class="sheet-notes">${s.notes}</p>
    </section>`
    ).join('\n    ')}
  </div>
  <div class="container" style="margin-top:1.6rem">
    <p class="small muted">小提醒：打印用 A4 纸、竖着放，别选「缩放」，线条粗细刚好。</p>
  </div>
</main>
${tabbar('practice')}${footer()}${tail}`;
}

/* ---------------- 使用帮助 ---------------- */
function buildHelp() {
  return `${head({
    page: 'help',
    title: '使用帮助',
    desc: '素描小院使用帮助：怎么调字号、开夜间模式、听朗读、打印练习纸、把网站放到手机桌面，以及常见问题。',
  })}${header('help')}
<main id="main">
  <div class="container page-head">
    <p class="eyebrow">使用帮助</p>
    <h1>怎么用小院，不着急</h1>
    <p class="lead">这里说清楚四件事：字怎么调大、怎么听朗读、怎么打印、怎么把它放到手机桌面上。看不明白的地方，直接点开下面的问题。</p>
  </div>
  <div class="container">
    <div class="grid grid-2" style="margin-bottom:2.6rem">
      <div class="card help-card">
        <h3>${icon('eye')} 字太小，看不清</h3>
        <ol class="help-steps">
          <li>看页面最上面一行，点「字号：标准」。</li>
          <li>每点一次，字就大一号：标准 → 大 → 特大 → 标准。</li>
          <li>调到你看着舒服为止，下次打开还是这个大小。</li>
        </ol>
      </div>
      <div class="card help-card">
        <h3>${icon('moon')} 晚上看，想暗一点</h3>
        <ol class="help-steps">
          <li>点右上角的月亮图标，页面变成暖褐色，不刺眼。</li>
          <li>再点一次，回到白天的纸色。</li>
        </ol>
      </div>
      <div class="card help-card">
        <h3>${icon('voice')} 眼睛累了，想听</h3>
        <ol class="help-steps">
          <li>打开任意一节课，标题下面有「朗读这一课」。</li>
          <li>点一下就开始读，再点一下就停。</li>
          <li>朗读用的是手机自带的声音，不花流量、不收费。</li>
        </ol>
      </div>
      <div class="card help-card">
        <h3>${icon('print')} 想把练习纸打印出来</h3>
        <ol class="help-steps">
          <li>打开「练习纸」这一页。</li>
          <li>点「打印全部练习纸」，或每张纸上单独的「只打印这一张」。</li>
          <li>选 A4 纸，别勾选「缩放」，直接打印。</li>
        </ol>
      </div>
      <div class="card help-card">
        <h3>${icon('phone')} 放到手机桌面上，像 App 一样</h3>
        <ol class="help-steps">
          <li><b>苹果手机：</b>用 Safari 打开，点底部的「分享」按钮，往下找「添加到主屏幕」。</li>
          <li><b>安卓手机：</b>用浏览器打开，点右上角三个点，选「添加到主屏幕」。</li>
          <li><b>在微信里：</b>点右上角「…」，选「在浏览器打开」，再按上面做。</li>
        </ol>
      </div>
      <div class="card help-card">
        <h3>${icon('check')} 进度存在哪里？</h3>
        <ol class="help-steps">
          <li>完成的课、勾选的小练习、写下的笔记，只存在你这台手机的浏览器里。</li>
          <li>不上传，不用注册，也不会有人看到。</li>
          <li>换手机、换浏览器、清理浏览器数据，记录就会没有——没关系，从头再画一遍也很好。</li>
        </ol>
      </div>
    </div>

    <section class="block" aria-labelledby="h-faq">
      <div class="block-num">常见问题</div>
      <h2 id="h-faq"><span class="h-mark" aria-hidden="true"></span>她最想问的十个问题</h2>
      ${faq
        .map(
          (f) => `<details class="faq-item">
        <summary>${esc(f.q)}</summary>
        <div class="faq-a"><p>${esc(f.a)}</p></div>
      </details>`
        )
        .join('\n      ')}
    </section>

    <section class="block">
      <div class="card card-pad" style="text-align:center">
        <h2 style="font-size:1.24rem">还想学更多？</h2>
        <p class="muted" style="font-size:.92rem">八节课只是开头。去「学找资料」那页，学会自己找教程、找参考图。</p>
        <div style="display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center;margin-top:1rem">
          <a class="btn btn-secondary" href="search.html">学会上网找资料</a>
          <a class="btn btn-ghost" href="map.html">回到学习地图 ${icon('arrow')}</a>
        </div>
      </div>
    </section>
  </div>
</main>
${tabbar('help')}${footer()}${tail}`;
}

/* ---------------- 404 ---------------- */
function build404() {
  return `${head({ page: '404', title: '页面没找到', desc: '这个页面不在了，回首页继续画。' })}${header('')}
<main id="main">
  <div class="container page-head center" style="padding-block:4rem">
    <p class="eyebrow" style="justify-content:center">404</p>
    <h1>这一页，好像还没画</h1>
    <p class="lead" style="margin-inline:auto">可能是链接写错了，也可能是这页还没画好。</p>
    <div style="display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap;margin-top:1.6rem">
      <a class="btn btn-primary" href="index.html">回到首页</a>
      <a class="btn btn-secondary" href="map.html">看八堂课</a>
    </div>
  </div>
</main>
${tabbar('')}${footer()}${tail}`;
}

/* ---------------- 其他文件 ---------------- */
function buildMeta() {
  const pages = [
    ['index.html', '1.0'],
    ['map.html', '0.9'],
    ['search.html', '0.9'],
    ['practice.html', '0.8'],
    ['help.html', '0.6'],
    ...lessons.map((l) => [`lesson-${l.num}.html`, '0.8']),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([p, pri]) => `  <url><loc>${SITE.url}${p}</loc><priority>${pri}</priority></url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}sitemap.xml\n`);
  fs.writeFileSync(
    path.join(ROOT, 'manifest.webmanifest'),
    JSON.stringify(
      {
        name: '素描小院 · 慢慢画',
        short_name: '素描小院',
        description: SITE.desc,
        start_url: './index.html',
        scope: './',
        display: 'standalone',
        background_color: '#fbf6ec',
        theme_color: '#fbf6ec',
        lang: 'zh-CN',
        icons: [{ src: 'assets/img/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      null,
      2
    )
  );
}

/* ---------------- 输出 ---------------- */
const outputs = {
  'index.html': buildIndex(),
  'map.html': buildMap(),
  'search.html': buildSearch(),
  'practice.html': buildPractice(),
  'help.html': buildHelp(),
  '404.html': build404(),
};
lessons.forEach((l) => { outputs[`lesson-${l.num}.html`] = buildLesson(l); });

for (const [name, html] of Object.entries(outputs)) {
  fs.writeFileSync(path.join(ROOT, name), html);
}
buildMeta();

console.log(`built ${Object.keys(outputs).length} pages`);
console.log(lessons.map((l) => `lesson-${l.num}.html: ${l.title}`).join('\n'));
