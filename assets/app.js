/* 素描小院 · 交互
   原则：没有脚本也能读、能看；有脚本才记进度、朗读、切换。
   所有记录只存在 localStorage，不上传。 */
(function () {
  'use strict';
  var doc = document.documentElement;
  var P = 'smxy.';
  var TOTAL = 8;

  /* ---------- 小工具 ---------- */
  function getRaw(k) { try { return localStorage.getItem(P + k); } catch (e) { return null; } }
  function setRaw(k, v) { try { localStorage.setItem(P + k, v); } catch (e) {} }
  function getJSON(k, d) {
    try { var raw = localStorage.getItem(P + k); return raw ? JSON.parse(raw) : d; } catch (e) { return d; }
  }
  function setJSON(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} }

  var toastTimer = null;
  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-show'); }, 2800);
  }

  /* ---------- 字号 ---------- */
  var FS = ['normal', 'large', 'xlarge'];
  var FS_NAME = { normal: '标准', large: '大', xlarge: '特大' };
  var fsBtn = document.querySelector('[data-fs-toggle]');
  var fsLabel = document.querySelector('[data-fs-label]');
  function applyFs(v) {
    if (FS.indexOf(v) < 0) v = 'normal';
    doc.setAttribute('data-fs', v);
    if (fsLabel) fsLabel.textContent = FS_NAME[v];
    if (fsBtn) {
      fsBtn.setAttribute('aria-label', '当前字号：' + FS_NAME[v] + '，点一下切换');
      fsBtn.setAttribute('title', '点一下换字号');
    }
  }
  applyFs(getRaw('fs') || 'normal');
  if (fsBtn) {
    fsBtn.addEventListener('click', function () {
      var cur = doc.getAttribute('data-fs') || 'normal';
      var next = FS[(FS.indexOf(cur) + 1) % FS.length];
      applyFs(next);
      setRaw('fs', next);
    });
  }

  /* ---------- 夜间模式 ---------- */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  function applyTheme(t) {
    if (t === 'dark') doc.setAttribute('data-theme', 'dark');
    else doc.removeAttribute('data-theme');
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
      themeBtn.setAttribute('aria-label', t === 'dark' ? '夜间模式已开启，点一下回到白天' : '切换到夜间模式');
    }
  }
  var theme = getRaw('theme') === 'dark' ? 'dark' : 'light';
  applyTheme(theme);
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      applyTheme(theme);
      setRaw('theme', theme);
    });
  }

  /* ---------- 进度 ---------- */
  function getProgress() {
    var p = getJSON('progress', { done: [], updated: 0 });
    if (!p || !Array.isArray(p.done)) p = { done: [], updated: 0 };
    return p;
  }
  function isDone(n) { return getProgress().done.indexOf(n) >= 0; }
  function setDone(n, on) {
    var p = getProgress();
    var i = p.done.indexOf(n);
    if (on && i < 0) p.done.push(n);
    if (!on && i >= 0) p.done.splice(i, 1);
    p.updated = Date.now();
    setJSON('progress', p);
  }

  function refreshProgress() {
    var p = getProgress();
    var count = p.done.length;
    var pct = Math.round((count / TOTAL) * 100);

    document.querySelectorAll('[data-progress-text]').forEach(function (el) { el.textContent = count; });
    document.querySelectorAll('[data-progress-bar]').forEach(function (el) { el.style.width = pct + '%'; });
    document.querySelectorAll('.progress[role="progressbar"]').forEach(function (el) {
      el.setAttribute('aria-valuenow', String(count));
      el.setAttribute('aria-valuetext', '已学 ' + count + ' / ' + TOTAL + ' 课');
    });

    document.querySelectorAll('[data-lesson-item],[data-lesson-row],[data-lesson-mini]').forEach(function (el) {
      var n = parseInt(el.getAttribute('data-lesson-item') || el.getAttribute('data-lesson-row') || el.getAttribute('data-lesson-mini'), 10);
      el.classList.toggle('is-done', p.done.indexOf(n) >= 0);
    });

    document.querySelectorAll('[data-state-text]').forEach(function (el) {
      if (!el.dataset.orig) el.dataset.orig = el.textContent.trim();
      var holder = el.closest('[data-lesson-item],[data-lesson-mini]');
      var n = holder ? parseInt(holder.getAttribute('data-lesson-item') || holder.getAttribute('data-lesson-mini'), 10) : NaN;
      var done = !isNaN(n) && p.done.indexOf(n) >= 0;
      el.textContent = done ? (el.dataset.doneText || '已完成 ✓') : el.dataset.orig;
    });

    var cta = document.querySelector('[data-progress-cta]');
    if (cta) {
      var next = 0;
      for (var i = 1; i <= TOTAL; i++) { if (p.done.indexOf(i) < 0) { next = i; break; } }
      if (next) { cta.setAttribute('href', 'lesson-' + next + '.html'); cta.textContent = count ? '继续第 ' + next + ' 课' : '从第一课开始'; }
      else { cta.setAttribute('href', 'map.html'); cta.textContent = '八课学完了，去复习'; }
    }

    document.querySelectorAll('[data-complete-btn]').forEach(function (btn) {
      var n = parseInt(btn.getAttribute('data-complete-btn'), 10);
      var done = p.done.indexOf(n) >= 0;
      btn.classList.toggle('btn-primary', !done);
      btn.classList.toggle('btn-secondary', done);
      btn.textContent = done ? '✓ 已完成（点一下取消）' : '画完了，标记这一课完成';
      btn.setAttribute('aria-pressed', String(done));
    });
  }
  refreshProgress();

  document.querySelectorAll('[data-complete-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var n = parseInt(btn.getAttribute('data-complete-btn'), 10);
      if (isDone(n)) { setDone(n, false); toast('已取消第 ' + n + ' 课的完成记录'); }
      else { setDone(n, true); toast('第 ' + n + ' 课完成。今天这一笔，已经比昨天好了。'); }
      refreshProgress();
    });
  });

  /* ---------- 小练习勾选 ---------- */
  document.querySelectorAll('[data-persist]').forEach(function (box) {
    var key = 'data.' + box.getAttribute('data-persist');
    var saved = getJSON(key, {});
    box.querySelectorAll('input[data-ck]').forEach(function (inp) {
      var i = inp.getAttribute('data-ck');
      inp.checked = !!saved[i];
      inp.addEventListener('change', function () {
        var s = getJSON(key, {});
        s[i] = inp.checked;
        setJSON(key, s);
      });
    });
  });

  /* ---------- 笔记 ---------- */
  document.querySelectorAll('textarea[data-note]').forEach(function (ta) {
    var key = 'note.' + ta.getAttribute('data-note');
    ta.value = getRaw(key) || '';
    var timer = null;
    ta.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { setRaw(key, ta.value); }, 350);
    });
  });

  /* ---------- 朗读 ---------- */
  var synth = window.speechSynthesis;
  var speakingBtn = null;
  var chunks = [];
  var chunkIndex = 0;

  function resetSpeak() {
    if (speakingBtn) {
      speakingBtn.dataset.speaking = '0';
      speakingBtn.classList.remove('is-speaking');
      speakingBtn.innerHTML = speakingBtn.dataset.label || '朗读';
    }
    speakingBtn = null;
    chunks = [];
    chunkIndex = 0;
  }
  function speakText(list) {
    if (!synth) { toast('这个浏览器不支持朗读，换苹果自带浏览器或 Chrome 试试'); resetSpeak(); return; }
    if (chunkIndex >= list.length) { resetSpeak(); return; }
    var u = new SpeechSynthesisUtterance(list[chunkIndex++]);
    u.lang = 'zh-CN';
    u.rate = 0.92;
    u.pitch = 1;
    u.onend = function () { speakText(list); };
    u.onerror = function () { resetSpeak(); };
    synth.speak(u);
  }
  document.querySelectorAll('[data-read]').forEach(function (btn) {
    btn.dataset.label = btn.innerHTML;
    btn.addEventListener('click', function () {
      if (!synth) { toast('这个浏览器不支持朗读，换苹果自带浏览器或 Chrome 试试'); return; }
      if (btn === speakingBtn && synth.speaking) {
        synth.cancel();
        resetSpeak();
        return;
      }
      synth.cancel();
      resetSpeak();
      var scope = document.querySelector(btn.getAttribute('data-read-scope-target') || '[data-read-scope]');
      var text = scope ? (scope.innerText || '').replace(/[ \t\u00a0]+/g, ' ').trim() : '';
      chunks = text.split(/\n+/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 1; });
      if (!chunks.length) return;
      speakingBtn = btn;
      btn.dataset.speaking = '1';
      btn.classList.add('is-speaking');
      btn.innerHTML = '⏹ 停止朗读';
      chunkIndex = 0;
      toast('开始朗读，再点一下可以停。');
      speakText(chunks);
    });
  });
  window.addEventListener('pagehide', function () { if (synth) synth.cancel(); });

  /* ---------- 找资料页：平台切换 ---------- */
  var platformTabs = document.querySelectorAll('[data-platform-tab]');
  if (platformTabs.length) {
    var setPlatform = function (tab) {
      platformTabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t === tab)); });
      var name = tab.getAttribute('data-platform-name');
      document.querySelectorAll('[data-q]').forEach(function (a) {
        var links;
        try { links = JSON.parse(a.getAttribute('data-links') || '{}'); } catch (e) { links = {}; }
        if (links[name]) a.setAttribute('href', links[name]);
      });
    };
    platformTabs.forEach(function (tab) {
      tab.addEventListener('click', function () { setPlatform(tab); });
      tab.addEventListener('keydown', function (e) {
        var list = Array.prototype.slice.call(platformTabs);
        var i = list.indexOf(tab);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); var n = list[(i + 1) % list.length]; n.focus(); setPlatform(n); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); var p = list[(i - 1 + list.length) % list.length]; p.focus(); setPlatform(p); }
      });
    });
  }

  /* ---------- 打印 ---------- */
  document.querySelectorAll('[data-print]').forEach(function (btn) {
    btn.addEventListener('click', function () { window.print(); });
  });
  document.querySelectorAll('[data-print-sheet]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sheet = btn.closest('.sheet');
      document.body.classList.add('print-one');
      document.querySelectorAll('.sheet').forEach(function (s) { s.classList.toggle('is-target', s === sheet); });
      window.print();
    });
  });
  window.addEventListener('afterprint', function () {
    document.body.classList.remove('print-one');
    document.querySelectorAll('.sheet').forEach(function (s) { s.classList.remove('is-target'); });
  });
})();
