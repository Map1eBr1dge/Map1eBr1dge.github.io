/* ============================================================
   四时工坊 · MiMo 风共享动效脚本
   自定义鼠标 / 涟漪 / 骨架屏 / 打字 / 流式 / 视差 / 滚动监听 / 无限加载
   ============================================================ */

(function () {
  'use strict';
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;

  /* ============================================================
     1. 自定义鼠标：细圆环 + 中心点，hover 链接时圆环变大
     ============================================================ */
  if (!prefersReduced && !isTouch) {
    var ring = document.getElementById('cursorRing');
    var dot = document.getElementById('cursorDot');
    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });
    // 圆环用 lerp 缓动跟随，制造轻微滞后感
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    }
    loop();
    // hover 可交互元素时圆环变大
    var hoverSel = 'a, button, .list-item, .proj-card, .flagship-card, .eco-card, .hero-cta, .nav-cta';
    document.querySelectorAll(hoverSel).forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        ring.classList.add('hovering');
        dot.classList.add('hovering');
      });
      el.addEventListener('mouseleave', function () {
        ring.classList.remove('hovering');
        dot.classList.remove('hovering');
      });
    });
  }

  /* ============================================================
     2. 按钮涟漪：点击处 1px 描边圆环扩散（线框版，非墨水）
     ============================================================ */
  if (!prefersReduced) {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('a, button, .list-item, .proj-card, .flagship-card, .eco-card');
      if (!target) return;
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = (e.clientX - target.getBoundingClientRect().left) + 'px';
      ripple.style.top = (e.clientY - target.getBoundingClientRect().top) + 'px';
      // 确保父元素有定位上下文
      if (getComputedStyle(target).position === 'static') {
        target.style.position = 'relative';
      }
      target.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  }

  /* ============================================================
     3. 骨架屏：初始加载时主内容区线框占位，加载完淡出
     ============================================================ */
  // 页面加载完成后标记 loaded，触发骨架屏淡出
  window.addEventListener('load', function () {
    setTimeout(function () {
      document.body.classList.add('loaded');
    }, 300);
  });
  // 兜底：若 load 事件已触发或超时，1.5s 后强制 loaded
  setTimeout(function () {
    document.body.classList.add('loaded');
  }, 1500);

  /* ============================================================
     4. 实时打字：Hero 副标题逐字打字，光标细竖线
     ============================================================ */
  if (!prefersReduced) {
    var subEl = document.querySelector('.hero .sub');
    if (subEl) {
      var fullText = subEl.textContent.trim();
      subEl.textContent = '';
      subEl.style.opacity = '1';
      var i = 0;
      var cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      subEl.appendChild(cursor);
      function typeNext() {
        if (i < fullText.length) {
          cursor.insertAdjacentText('beforebegin', fullText[i]);
          i++;
          setTimeout(typeNext, 28 + Math.random() * 30);
        } else {
          // 打字完成后光标继续闪烁 2s 再消失
          setTimeout(function () { cursor.remove(); }, 2000);
        }
      }
      // 延迟 400ms 开始，等首屏稳定
      setTimeout(typeNext, 400);
    }
  }

  /* ============================================================
     5. 流式输出 & 滚动触发：公告/项目/scroll-reveal 等 IntersectionObserver
     ============================================================ */
  if (!prefersReduced && 'IntersectionObserver' in window) {
    // 流式元素
    var streamEls = document.querySelectorAll(
      '.bulletin-list .b-item, .voice-list .voice-item, .list-item, .proj-card, .flagship-card, .eco-card'
    );
    streamEls.forEach(function (el, idx) {
      el.classList.add('stream-in');
      el.style.transitionDelay = (idx % 6) * 60 + 'ms';
    });
    var streamObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          streamObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    streamEls.forEach(function (el) { streamObs.observe(el); });

    // 滚动触发：.scroll-reveal 元素进入视口时加 .visible
    var revealEls = document.querySelectorAll('.scroll-reveal');
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    // 减少动效或没有 IntersectionObserver 时直接显示所有 scroll-reveal
    document.querySelectorAll('.scroll-reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ============================================================
     6. 视差滚动：字母水印 + 四季同心环不同速度滚动
     ============================================================ */
  if (!prefersReduced && !isTouch) {
    var watermark = document.querySelector('.hero-watermark');
    var globe = document.querySelector('.hero-right');
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var y = window.scrollY;
          if (watermark) {
            watermark.style.transform = 'translateY(' + (y * 0.3) + 'px)';
          }
          if (globe && y < 800) {
            globe.style.transform = 'translateY(' + (y * -0.12) + 'px)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================================
     7. 滚动监听：导航高亮当前章节
     ============================================================ */
  if ('IntersectionObserver' in window) {
    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    var sections = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) sections.push({ link: link, el: sec });
    });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('is-active'); });
          var match = sections.find(function (s) { return s.el === entry.target; });
          if (match) match.link.classList.add('is-active');
        }
      });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s.el); });
  }

  /* ============================================================
     8. 无限加载：公告列表已全部写在 HTML 中，无需 JS 追加
     ============================================================ */
})();

/* ============================================================
   批次3：主题切换 + 滚动进度 + 返回顶部 + 复制反馈 + 键盘导航
   ============================================================ */
(function () {
  // —— 主题切换（简约 SVG 太阳/月亮） ——
  var toggle = document.createElement('button');
  toggle.className = 'theme-toggle';
  toggle.setAttribute('aria-label', '切换主题');
  toggle.innerHTML =
    '<svg class="sun-icon" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3">' +
      '<circle cx="8" cy="8" r="3.5"/>' +
      '<line x1="8" y1=".5" x2="8" y2="2.5"/>' +
      '<line x1="8" y1="13.5" x2="8" y2="15.5"/>' +
      '<line x1=".5" y1="8" x2="2.5" y2="8"/>' +
      '<line x1="13.5" y1="8" x2="15.5" y2="8"/>' +
      '<line x1="2.2" y1="2.2" x2="3.7" y2="3.7"/>' +
      '<line x1="12.3" y1="12.3" x2="13.8" y2="13.8"/>' +
      '<line x1="2.2" y1="13.8" x2="3.7" y2="12.3"/>' +
      '<line x1="12.3" y1="3.7" x2="13.8" y2="2.2"/>' +
    '</svg>' +
    '<svg class="moon-icon" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" style="display:none">' +
      '<path d="M13.5 10.5A6 6 0 0 1 5.5 2.5 6.5 6.5 0 1 0 13.5 10.5Z"/>' +
    '</svg>';
  toggle.addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme');
    if (cur === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    }
  });
  // 恢复保存的主题，同步图标
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
  // 插入到导航 GitHub 按钮前
  var navCta = document.querySelector('.nav-cta');
  if (navCta && navCta.parentNode) {
    navCta.parentNode.insertBefore(toggle, navCta);
  }

  // —— 汉堡菜单 ——
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    // 手机菜单内的下拉按钮
    var mmDropdownBtn = mobileMenu.querySelector('.mm-dropdown-btn');
    var mmDropdownMenu = mobileMenu.querySelector('.mm-dropdown-menu');
    if (mmDropdownBtn && mmDropdownMenu) {
      mmDropdownBtn.addEventListener('click', function () {
        mmDropdownMenu.classList.toggle('open');
      });
    }
    // 点击菜单链接后自动关闭
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // —— 滚动进度条 ——
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  var ticking2 = false;
  window.addEventListener('scroll', function () {
    if (!ticking2) {
      requestAnimationFrame(function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
        progress.style.width = pct + '%';
        ticking2 = false;
      });
      ticking2 = true;
    }
  }, { passive: true });

  // —— 返回顶部 ——
  var btt = document.createElement('button');
  btt.className = 'back-to-top';
  btt.setAttribute('aria-label', '返回顶部');
  btt.textContent = '↑';
  document.body.appendChild(btt);
  btt.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', function () {
    if (window.scrollY > 600) btt.classList.add('visible');
    else btt.classList.remove('visible');
  }, { passive: true });

  // —— 复制反馈 ——
  var toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.textContent = '已复制';
  document.body.appendChild(toast);
  // 分享栏复制链接
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.share-copy-link');
    if (!btn) return;
    var url = btn.getAttribute('data-url') || window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        toast.textContent = '链接已复制';
        toast.classList.add('visible');
        setTimeout(function () { toast.classList.remove('visible'); }, 1500);
      });
    }
  });
  // 给所有 [data-copy] 元素加复制
  document.querySelectorAll('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function () {
      var text = el.getAttribute('data-copy');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          toast.classList.add('visible');
          setTimeout(function () { toast.classList.remove('visible'); }, 1500);
        });
      }
    });
  });

  // —— 键盘导航：/ 聚焦搜索（如有），g 跳项目页 ——
  var kbdHint = document.createElement('div');
  kbdHint.className = 'kbd-hint';
  kbdHint.innerHTML = '<kbd>/</kbd> 搜索 · <kbd>g</kbd> 项目 · <kbd>t</kbd> 主题';
  document.body.appendChild(kbdHint);
  setTimeout(function () { kbdHint.style.opacity = '0'; }, 5000);
  document.addEventListener('keydown', function (e) {
    // 不在输入框时才响应
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    if (e.key === '/') {
      e.preventDefault();
      var search = document.querySelector('#pagefind-search, input[type="search"], .search-input');
      if (search) search.focus();
    } else if (e.key === 'g') {
      window.location.href = 'projects.html';
    } else if (e.key === 't') {
      toggle.click();
    } else if (e.key === 'h') {
      window.location.href = 'index.html';
    }
  });

  })();


