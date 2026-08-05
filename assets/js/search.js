/* ============================================================
   Pagefind 搜索逻辑 —— 命令面板
   ============================================================ */
(function () {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // 注入搜索 UI
  var overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-panel">
      <div class="search-input-wrap">
        <span class="search-icon"></span>
        <input type="text" class="search-input" placeholder="搜索全站内容…（页面/公告/项目）" autocomplete="off">
        <span class="search-close">ESC</span>
      </div>
      <div class="search-results" id="searchResults">
        <div class="search-empty">输入关键词开始搜索</div>
      </div>
      <div class="search-hint">
        <span><kbd>↑</kbd><kbd>↓</kbd> 选择 · <kbd>↵</kbd> 打开 · <kbd>ESC</kbd> 关闭</span>
        <span>powered by Pagefind</span>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  var input = overlay.querySelector('.search-input');
  var resultsEl = overlay.querySelector('#searchResults');
  var closeBtn = overlay.querySelector('.search-close');
  var search = null;

  // 加载 Pagefind
  function loadSearch() {
    if (search) return Promise.resolve(search);
    return window.pagefind ? window.pagefind.then(function (s) {
      search = s;
      return s;
    }) : Promise.resolve(null);
  }

  // 异步加载 pagefind-ui
  if (!window.pagefind) {
    var pf = document.createElement('script');
    pf.src = 'pagefind/pagefind-ui.js';
    pf.onload = function () {
      if (window.PagefindUI) {
        // 用 PagefindUI 的底层搜索 API
      }
    };
    document.head.appendChild(pf);
  }

  // 简易搜索：用 pagefind 的 search 接口
  async function doSearch(query) {
    if (!query.trim()) {
      resultsEl.innerHTML = '<div class="search-empty">输入关键词开始搜索</div>';
      return;
    }
    if (!window.pagefind) {
      resultsEl.innerHTML = '<div class="search-empty">搜索索引加载中…</div>';
      return;
    }
    try {
      var pf = await window.pagefind;
      var results = await pf.search(query);
      if (results.results.length === 0) {
        resultsEl.innerHTML = '<div class="search-empty">无匹配结果，换个关键词试试</div>';
        return;
      }
      var html = '';
      var top = results.results.slice(0, 8);
      for (var i = 0; i < top.length; i++) {
        var r = top[i];
        var data = await r.data();
        html += '<a class="search-result" href="' + data.url + '" data-idx="' + i + '">' +
          '<div class="sr-title">' + (data.meta.title || data.url) + '</div>' +
          '<div class="sr-excerpt">' + (data.excerpt || data.meta.description || '') + '</div>' +
          '</a>';
      }
      resultsEl.innerHTML = html;
    } catch (e) {
      resultsEl.innerHTML = '<div class="search-empty">搜索出错：' + e.message + '</div>';
    }
  }

  // 打开/关闭
  function open() {
    overlay.classList.add('visible');
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() {
    overlay.classList.remove('visible');
    input.value = '';
    resultsEl.innerHTML = '<div class="search-empty">输入关键词开始搜索</div>';
  }

  // 事件
  var debounceTimer;
  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () { doSearch(input.value); }, 200);
  });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  // 键盘：/ 打开，ESC 关闭，上下选择
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var inField = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
    if (e.key === '/' && !inField) {
      e.preventDefault();
      open();
    } else if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      close();
    } else if (overlay.classList.contains('visible') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      var items = resultsEl.querySelectorAll('.search-result');
      var cur = resultsEl.querySelector('.search-result.active');
      var idx = cur ? Array.prototype.indexOf.call(items, cur) : -1;
      if (e.key === 'ArrowDown') idx = Math.min(idx + 1, items.length - 1);
      else idx = Math.max(idx - 1, 0);
      if (cur) cur.classList.remove('active');
      if (items[idx]) {
        items[idx].classList.add('active');
        items[idx].scrollIntoView({ block: 'nearest' });
      }
    } else if (overlay.classList.contains('visible') && e.key === 'Enter') {
      var active = resultsEl.querySelector('.search-result.active');
      if (active) window.location.href = active.href;
    }
  });
})();
