document.documentElement.classList.add("js-enabled");

var DB8GR_I18N = (function () {
  var lang = (document.documentElement.lang || "zh-CN").toLowerCase();
  var zh = lang.indexOf("zh") === 0;

  return zh ? {
    commands: "命令:",
    routes: "路由:",
    open: "打开",
    notFound: "未找到命令:",
    tryHelp: "试试",
    listRoutes: "列出路由",
    clearOutput: "清空输出",
    searchUsage: "用法: search <关键词>",
    searching: "检索中...",
    searchResults: "搜索结果:",
    searchEmpty: "没有搜索结果",
    openUsage: "先搜索，再执行 open <编号>",
    invalidResult: "无效结果编号:",
    searchLoadFailed: "搜索索引加载失败",
    searchCommandLabel: "搜索文章",
    openCommandLabel: "打开搜索结果",
    copyCode: "COPY",
    copiedCode: "OK",
    copyFailed: "ERR",
    collapseCode: "-",
    expandCode: "+",
    expandNav: "展开导航",
    collapseNav: "收起导航",
    routeNames: {
      home: "首页",
      posts: "文章",
      roadmap: "路线",
      archives: "归档",
      categories: "分类",
      tags: "标签",
      links: "友链",
      about: "关于"
    }
  } : {
    commands: "commands:",
    routes: "routes:",
    open: "open",
    notFound: "command not found:",
    tryHelp: "try",
    listRoutes: "list routes",
    clearOutput: "clear output",
    searchUsage: "usage: search <keyword>",
    searching: "searching...",
    searchResults: "results:",
    searchEmpty: "no results",
    openUsage: "run a search first, then use open <number>",
    invalidResult: "invalid result number:",
    searchLoadFailed: "failed to load search index",
    searchCommandLabel: "search posts",
    openCommandLabel: "open search result",
    copyCode: "COPY",
    copiedCode: "OK",
    copyFailed: "ERR",
    collapseCode: "-",
    expandCode: "+",
    expandNav: "Open navigation",
    collapseNav: "Close navigation",
    routeNames: {
      home: "home",
      posts: "posts",
      roadmap: "roadmap",
      archives: "archives",
      categories: "categories",
      tags: "tags",
      links: "links",
      about: "about"
    }
  };
})();

(function () {
  var loader = document.getElementById("boot-loader");
  var rainCanvas = document.getElementById("matrix-rain");
  var ambientCanvas = document.getElementById("ambient-rain");
  var typed = document.getElementById("boot-type");
  var seenKey = "db8gr_terminal-loader-seen";
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stopAmbient = null;

  function onReady(callback) {
    if (document.readyState === "complete") {
      callback();
      return;
    }
    window.addEventListener("load", callback, { once: true });
  }

  function hideLoader(delay, done) {
    if (!loader) return;
    window.setTimeout(function () {
      document.body.classList.add("is-ready");
      loader.classList.add("is-hidden");
      window.setTimeout(function () {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
        if (done) done();
      }, 1020);
    }, delay || 0);
  }

  function startMatrix(canvas, options) {
    if (!canvas || reducedMotion) return function () {};

    options = options || {};
    var ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return function () {};

    var fontSize = options.fontSize || 22;
    var chars = (options.chars || "01#$%&*+-/<>[]{}rootdebu8gerINIT").split("");
    var trail = options.trail || "rgba(0, 0, 0, 0.11)";
    var mainColor = options.mainColor || "#00d7ff";
    var hotColor = options.hotColor || "#e8fdff";
    var hotChance = options.hotChance || 0.985;
    var resetChance = options.resetChance || 0.965;
    var ratioLimit = options.ratioLimit || 1.2;
    var speed = options.speed || 0.72;
    var trailLength = options.trailLength || 18;
    var tailOpacity = options.tailOpacity || 0.72;
    var fontWeight = options.fontWeight || "700";
    var shadowBlur = options.shadowBlur || 8;
    var drops = [];
    var raf = 0;
    var lastNow = 0;
    var width = 0;
    var height = 0;
    var columns = 0;
    var resizeRaf = 0;
    var running = true;

    function resize() {
      var ratio = Math.min(window.devicePixelRatio || 1, ratioLimit);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.font = fontWeight + " " + fontSize + "px Consolas, Courier New, monospace";
      ctx.textBaseline = "top";
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = shadowBlur;

      columns = Math.ceil(width / fontSize);
      drops = [];
      for (var i = 0; i < columns; i += 1) {
        drops[i] = Math.random() * -(height / fontSize);
      }
    }

    function requestResize() {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame(function () {
        resizeRaf = 0;
        resize();
      });
    }

    function draw(now) {
      if (!running) return;
      raf = window.requestAnimationFrame(draw);
      var delta = lastNow ? Math.min((now - lastNow) / 16.67, 2) : 1;
      lastNow = now;

      ctx.fillStyle = trail;
      ctx.fillRect(0, 0, width, height);

      for (var i = 0; i < columns; i += 1) {
        var x = i * fontSize;

        for (var tail = 0; tail < trailLength; tail += 1) {
          var y = (drops[i] - tail) * fontSize;
          if (y < -fontSize || y > height + fontSize) continue;

          var text = chars[(Math.random() * chars.length) | 0];
          var fade = Math.pow(1 - (tail / trailLength), 1.75);
          ctx.globalAlpha = tail === 0 ? 1 : fade * tailOpacity;
          ctx.fillStyle = tail === 0 || Math.random() > hotChance ? hotColor : mainColor;
          ctx.fillText(text, x, y);
        }

        ctx.globalAlpha = 1;

        if ((drops[i] - trailLength) * fontSize > height && Math.random() > resetChance) {
          drops[i] = Math.random() * -trailLength;
        }
        drops[i] += speed * delta;
      }
    }

    function onVisibilityChange() {
      if (document.hidden) {
        running = false;
        window.cancelAnimationFrame(raf);
        return;
      }
      if (!running) {
        running = true;
        lastNow = 0;
        raf = window.requestAnimationFrame(draw);
      }
    }

    resize();
    window.addEventListener("resize", requestResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    raf = window.requestAnimationFrame(draw);

    return function () {
      running = false;
      window.removeEventListener("resize", requestResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.cancelAnimationFrame(raf);
      window.cancelAnimationFrame(resizeRaf);
    };
  }

  function startAmbientRain() {
    if (stopAmbient) return;
    stopAmbient = startMatrix(ambientCanvas, {
      fontSize: 20,
      ratioLimit: 0.85,
      speed: 0.58,
      trail: "rgba(5, 9, 11, 0.16)",
      mainColor: "#008da8",
      hotColor: "#e8fff2",
      hotChance: 0.988,
      resetChance: 0.982,
      trailLength: 26,
      tailOpacity: 0.68,
      shadowBlur: 10,
      chars: "01abcdefABCDEF{}[]<>/\\\\|#$%&*+-=rootbashgrep"
    });
  }

  function typeBoot(done) {
    if (!typed || reducedMotion) {
      if (typed) typed.textContent = typed.getAttribute("data-text") || "initiating...";
      done();
      return;
    }

    var text = typed.getAttribute("data-text") || "initiating...";
    var i = 0;
    typed.textContent = "";

    function tick() {
      typed.textContent = text.slice(0, i);
      i += 1;
      if (i <= text.length + 1) {
        window.setTimeout(tick, 76);
      } else {
        window.setTimeout(done, 360);
      }
    }

    window.setTimeout(tick, 160);
  }

  if (loader) {
    document.body.classList.add("is-booting");
    var once = loader.getAttribute("data-once") !== "false";
    var alreadySeen = false;

    try {
      alreadySeen = once && window.sessionStorage && window.sessionStorage.getItem(seenKey) === "1";
    } catch (error) {
      alreadySeen = false;
    }

    if (alreadySeen) {
      startAmbientRain();
      hideLoader(0);
    } else {
      var stopMatrix = startMatrix(rainCanvas, {
        fontSize: 16,
        ratioLimit: 1.35,
        speed: 0.95,
        trail: "rgba(0, 0, 0, 0.095)",
        mainColor: "#00d7ff",
        hotColor: "#e8fdff",
        hotChance: 0.98,
        resetChance: 0.958,
        trailLength: 18,
        tailOpacity: 0.76
      });
      typeBoot(function () {
        onReady(function () {
          try {
            if (once && window.sessionStorage) window.sessionStorage.setItem(seenKey, "1");
          } catch (error) {}
          startAmbientRain();
          hideLoader(20, stopMatrix);
        });
      });
    }
  } else {
    document.body.classList.add("is-ready");
    startAmbientRain();
  }
})();

(function () {
  var brand = document.getElementById("brand-type");
  if (!brand) return;

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var text = brand.getAttribute("data-text") || "";

  if (reducedMotion) {
    brand.textContent = text;
    return;
  }

  var i = 0;
  brand.textContent = "";

  function tick() {
    brand.textContent = text.slice(0, i);
    i += 1;
    if (i <= text.length + 1) {
      window.setTimeout(tick, 58);
    }
  }

  window.setTimeout(tick, 180);
})();

(function () {
  var frame = document.querySelector(".ascii-frame");
  var logo = document.querySelector(".ascii-logo");
  var hero = document.querySelector(".terminal-hero");
  if (!frame || !logo || !hero) return;

  var baseFont = 16;
  var minFont = 10;
  var maxFont = 96;
  var resizeRaf = 0;

  function fitAsciiLogo() {
    resizeRaf = 0;

    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    if (!viewportWidth || !viewportHeight) return;

    var targetWidth = Math.min(viewportWidth - 28, viewportWidth * 0.82);
    var heroHeight = Math.max(hero.getBoundingClientRect().height || 0, viewportHeight);
    var targetHeight = heroHeight * 0.75;

    frame.style.width = targetWidth.toFixed(2) + "px";
    logo.style.setProperty("--ascii-logo-size", baseFont + "px");

    var naturalWidth = logo.scrollWidth || logo.getBoundingClientRect().width;
    var naturalHeight = logo.scrollHeight || logo.getBoundingClientRect().height;
    if (!naturalWidth || !naturalHeight) return;

    var fit = Math.min(targetWidth / naturalWidth, targetHeight / naturalHeight);
    var fontSize = Math.max(minFont, Math.min(maxFont, baseFont * fit));
    logo.style.setProperty("--ascii-logo-size", fontSize.toFixed(2) + "px");
  }

  function requestFit() {
    if (resizeRaf) return;
    resizeRaf = window.requestAnimationFrame(fitAsciiLogo);
  }

  requestFit();
  window.addEventListener("resize", requestFit, { passive: true });
  window.addEventListener("orientationchange", requestFit, { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(requestFit).catch(function () {});
  }
})();

(function () {
  var contentBlocks = document.querySelectorAll(".terminal-content");
  if (!contentBlocks.length) return;

  function getCodeTitle(block) {
    if (block.matches("figure.highlight")) {
      for (var i = 0; i < block.classList.length; i += 1) {
        var cls = block.classList[i];
        if (cls !== "highlight") return cls;
      }
      return "code";
    }

    var code = block.querySelector("code");
    if (code && code.className) {
      return code.className.replace(/^language-/, "") || "code";
    }

    return "code";
  }

  function wrapCodeBlock(block) {
    if (block.closest(".codeblock-shell")) return;
    if (block.closest("figure.highlight") && !block.matches("figure.highlight")) return;

    var shell = document.createElement("div");
    shell.className = "codeblock-shell";

    var header = document.createElement("div");
    header.className = "codeblock-header";
    header.innerHTML = '<span class="codeblock-dots"><span></span><span></span><span></span></span><span class="codeblock-title">' + getCodeTitle(block) + '</span>';

    var actions = document.createElement("div");
    actions.className = "codeblock-actions";

    var copyButton = document.createElement("button");
    copyButton.className = "codeblock-copy";
    copyButton.type = "button";
    copyButton.textContent = DB8GR_I18N.copyCode;

    var toggleButton = document.createElement("button");
    toggleButton.className = "codeblock-toggle";
    toggleButton.type = "button";
    toggleButton.setAttribute("aria-expanded", "true");
    toggleButton.textContent = DB8GR_I18N.collapseCode;

    function getCodeText() {
      var codeNode = block.matches("figure.highlight") ? block.querySelector(".code") : block.querySelector("code");
      return (codeNode || block).innerText || "";
    }

    function resetCopyLabel() {
      window.setTimeout(function () {
        copyButton.textContent = DB8GR_I18N.copyCode;
      }, 1200);
    }

    copyButton.addEventListener("click", function () {
      var text = getCodeText();

      function done() {
        copyButton.textContent = DB8GR_I18N.copiedCode;
        resetCopyLabel();
      }

      function fail() {
        copyButton.textContent = DB8GR_I18N.copyFailed;
        resetCopyLabel();
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fail);
        return;
      }

      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy") ? done() : fail();
      } catch (error) {
        fail();
      } finally {
        document.body.removeChild(textarea);
      }
    });

    toggleButton.addEventListener("click", function () {
      var collapsed = shell.classList.toggle("is-collapsed");
      toggleButton.setAttribute("aria-expanded", String(!collapsed));
      toggleButton.textContent = collapsed ? DB8GR_I18N.expandCode : DB8GR_I18N.collapseCode;
    });

    actions.appendChild(copyButton);
    actions.appendChild(toggleButton);
    header.appendChild(actions);
    block.parentNode.insertBefore(shell, block);
    shell.appendChild(header);
    shell.appendChild(block);
  }

  function wrapTable(table) {
    if (table.closest("figure.highlight") || table.closest(".table-shell")) return;

    var shell = document.createElement("div");
    shell.className = "table-shell";
    shell.setAttribute("role", "region");
    shell.setAttribute("aria-label", "鍙í鍚戞粴鍔ㄧ殑鏁版嵁琛ㄦ牸");

    table.parentNode.insertBefore(shell, table);
    shell.appendChild(table);
  }

  contentBlocks.forEach(function (content) {
    content.querySelectorAll("figure.highlight, pre").forEach(wrapCodeBlock);
    content.querySelectorAll("table").forEach(wrapTable);
  });
})();

(function () {
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".post-toc a[href^='#']"));
  if (!tocLinks.length) return;

  var headings = tocLinks.map(function (link) {
    var id = decodeURIComponent(link.getAttribute("href").slice(1));
    return {
      id: id,
      link: link,
      heading: document.getElementById(id)
    };
  }).filter(function (item) {
    return item.heading;
  });

  if (!headings.length) return;

  var ticking = false;

  function setActive(id) {
    headings.forEach(function (item) {
      item.link.classList.toggle("is-active", item.id === id);
    });
  }

  function updateActiveHeading() {
    var active = headings[0];
    headings.forEach(function (item) {
      if (item.heading.getBoundingClientRect().top <= 132) {
        active = item;
      }
    });
    setActive(active.id);
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateActiveHeading);
  }, { passive: true });

  updateActiveHeading();
})();

(function () {
  var terminal = document.getElementById("visitor-terminal");
  var form = document.getElementById("visitor-form");
  var input = document.getElementById("visitor-input");
  var output = document.getElementById("visitor-output");

  if (!terminal || !form || !input || !output) return;

  var searchUrl = terminal.getAttribute("data-search") || "/search.json";
  var searchIndex = null;
  var searchRequest = null;
  var lastResults = [];
  var routes = {
    home: terminal.getAttribute("data-home") || "/",
    posts: terminal.getAttribute("data-posts") || "/archives/",
    roadmap: terminal.getAttribute("data-roadmap") || "/roadmap/",
    archives: terminal.getAttribute("data-archives") || "/archives/",
    tags: terminal.getAttribute("data-tags") || "/tags/",
    categories: terminal.getAttribute("data-categories") || "/categories/",
    about: terminal.getAttribute("data-about") || "/about/",
    links: terminal.getAttribute("data-links") || "/links/",
    friends: terminal.getAttribute("data-links") || "/links/"
  };
  var aliases = {
    article: "posts",
    articles: "posts",
    road: "roadmap",
    route: "roadmap",
    roadmap: "roadmap",
    skill: "roadmap",
    skills: "roadmap",
    archive: "archives",
    category: "categories",
    tag: "tags",
    friend: "links"
  };

  function print(html) {
    var line = document.createElement("div");
    line.innerHTML = html;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function help() {
    var r = DB8GR_I18N.routeNames;
    print('<span class="visitor-muted">' + DB8GR_I18N.commands + '</span><div class="visitor-command-list"><span><b>home</b> - ' + r.home + '</span><span><b>posts</b> - ' + r.posts + '</span><span><b>roadmap</b> - ' + r.roadmap + '</span><span><b>archives</b> - ' + r.archives + '</span><span><b>categories</b> - ' + r.categories + '</span><span><b>tags</b> - ' + r.tags + '</span><span><b>links</b> - ' + r.links + '</span><span><b>about</b> - ' + r.about + '</span><span><b>search</b> / <b>s</b> - ' + DB8GR_I18N.searchCommandLabel + '</span><span><b>open</b> - ' + DB8GR_I18N.openCommandLabel + '</span><span><b>ls</b> - ' + DB8GR_I18N.listRoutes + '</span><span><b>pwd</b> / <b>whoami</b> / <b>date</b></span><span><b>clear</b> - ' + DB8GR_I18N.clearOutput + '</span></div>');
  }

  function listRoutes() {
    print('<span class="visitor-muted">' + DB8GR_I18N.routes + '</span><div class="visitor-command-list"><span>/home</span><span>/posts</span><span>/roadmap</span><span>/archives</span><span>/categories</span><span>/tags</span><span>/links</span><span>/about</span></div>');
  }

  function loadSearchIndex() {
    if (searchIndex) return Promise.resolve(searchIndex);
    if (searchRequest) return searchRequest;

    searchRequest = window.fetch(searchUrl, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        searchIndex = Array.isArray(data) ? data : [];
        return searchIndex;
      });

    return searchRequest;
  }

  function normalize(text) {
    return String(text || "").toLowerCase();
  }

  function scorePost(post, terms) {
    var title = normalize(post.title);
    var tags = normalize((post.tags || []).join(" "));
    var categories = normalize((post.categories || []).join(" "));
    var excerpt = normalize(post.excerpt);
    var path = normalize(post.path);
    var haystack = [title, tags, categories, excerpt, path].join(" ");
    var score = 0;

    for (var i = 0; i < terms.length; i += 1) {
      var term = terms[i];
      if (haystack.indexOf(term) === -1) return 0;
      if (title === term) score += 80;
      if (title.indexOf(term) !== -1) score += 40;
      if (tags.indexOf(term) !== -1) score += 24;
      if (categories.indexOf(term) !== -1) score += 18;
      if (excerpt.indexOf(term) !== -1) score += 8;
      if (path.indexOf(term) !== -1) score += 4;
    }

    return score;
  }

  function searchPosts(query) {
    var terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length || !searchIndex) return [];

    return searchIndex.map(function (post) {
      return {
        post: post,
        score: scorePost(post, terms)
      };
    }).filter(function (item) {
      return item.score > 0;
    }).sort(function (a, b) {
      return b.score - a.score;
    }).slice(0, 8).map(function (item) {
      return item.post;
    });
  }

  function renderSearchResults(results) {
    lastResults = results;
    if (!results.length) {
      print('<span class="visitor-muted">' + DB8GR_I18N.searchEmpty + '</span>');
      return;
    }

    var html = '<span class="visitor-muted">' + DB8GR_I18N.searchResults + '</span><div class="visitor-search-results">';
    results.forEach(function (post, index) {
      var meta = [post.date].concat(post.tags || []).filter(Boolean).join(" / ");
      html += '<span><b>' + (index + 1) + '</b> <span class="visitor-result-title">' + escapeHtml(post.title) + '</span>';
      if (meta) html += '<small>' + escapeHtml(meta) + '</small>';
      html += '</span>';
    });
    html += '</div><span class="visitor-muted">open &lt;number&gt;</span>';
    print(html);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var raw = input.value.trim();
    var parts = raw.toLowerCase().split(/\s+/);
    var command = parts[0];
    if (!raw || !command) return;

    print('<span class="visitor-prompt">guest@visitor:</span><span class="visitor-path">~$</span> ' + escapeHtml(raw));
    input.value = "";

    if (command === "cd" && parts[1]) {
      command = parts[1].replace(/^\/+|\/+$/g, "");
    }

    command = aliases[command] || command;

    if (command === "help" || command === "?") {
      help();
      return;
    }

    if (command === "ls" || command === "dir") {
      listRoutes();
      return;
    }

    if (command === "search" || command === "s") {
      var query = raw.slice(raw.indexOf(" ") + 1).trim();
      if (!query || query === raw) {
        print('<span class="visitor-muted">' + DB8GR_I18N.searchUsage + '</span>');
        return;
      }

      print('<span class="visitor-muted">' + DB8GR_I18N.searching + '</span> <span class="visitor-command">' + escapeHtml(query) + '</span>');
      loadSearchIndex().then(function () {
        renderSearchResults(searchPosts(query));
      }).catch(function () {
        print('<span class="visitor-muted">' + DB8GR_I18N.searchLoadFailed + '</span>');
      });
      return;
    }

    if (command === "open") {
      if (!lastResults.length) {
        print('<span class="visitor-muted">' + DB8GR_I18N.openUsage + '</span>');
        return;
      }

      var resultIndex = parseInt(parts[1], 10);
      var result = lastResults[resultIndex - 1];
      if (!result) {
        print('<span class="visitor-muted">' + DB8GR_I18N.invalidResult + '</span> ' + escapeHtml(parts[1] || ""));
        return;
      }

      print('<span class="visitor-muted">' + DB8GR_I18N.open + '</span> <span class="visitor-command">' + escapeHtml(result.path) + "</span>");
      window.setTimeout(function () {
        window.location.href = result.path;
      }, 20);
      return;
    }

    if (command === "pwd") {
      print('<span class="visitor-muted">/srv/db8gr-blog</span>');
      return;
    }

    if (command === "whoami") {
      print('<span class="visitor-muted">guest@visitor</span>');
      return;
    }

    if (command === "date") {
      print('<span class="visitor-muted">' + escapeHtml(new Date().toLocaleString()) + "</span>");
      return;
    }

    if (command === "clear" || command === "cls") {
      output.innerHTML = "";
      lastResults = [];
      return;
    }

    var target = routes[command];

    if (target) {
      print('<span class="visitor-muted">' + DB8GR_I18N.open + '</span> <span class="visitor-command">' + escapeHtml(target) + "</span>");
      window.setTimeout(function () {
        window.location.href = target;
      }, 20);
      return;
    }

    print('<span class="visitor-muted">' + DB8GR_I18N.notFound + '</span> ' + escapeHtml(raw) + ' <span class="visitor-muted">' + DB8GR_I18N.tryHelp + '</span> <span class="visitor-command">help</span>');
  });
})();

(function () {
  var feed = document.querySelector(".home-feed");
  var column = document.querySelector(".post-column");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".post-card"));
  if (!feed || !column || !cards.length) return;

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lastY = window.scrollY || 0;
  var direction = "down";
  var ticking = false;

  function reveal(card) {
    card.classList.add("is-revealed");
  }

  function hide(card) {
    card.classList.remove("is-revealed");
  }

  function openFeed() {
    column.classList.add("is-terminal-output");
  }

  function closeFeed() {
    column.classList.remove("is-terminal-output");
  }

  function updateDirection() {
    var y = window.scrollY || 0;
    direction = y < lastY ? "up" : "down";
    lastY = y;
  }

  function updateReverseState() {
    updateDirection();
    if (direction !== "up") return;

    var height = window.innerHeight || document.documentElement.clientHeight;
    var feedRect = feed.getBoundingClientRect();

    if (feedRect.top > height * 0.72) {
      closeFeed();
    }

    cards.forEach(function (card) {
      var rect = card.getBoundingClientRect();
      if (rect.top > height * 0.92) {
        hide(card);
      }
    });
  }

  if (reducedMotion || !("IntersectionObserver" in window)) {
    openFeed();
    cards.forEach(reveal);
    return;
  }

  var feedObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) openFeed();
    });
  }, {
    root: null,
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.08
  });

  var cardObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        reveal(entry.target);
        return;
      }

      if (entry.boundingClientRect.top > window.innerHeight * 0.92) {
        hide(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.14
  });

  cards.forEach(function (card, index) {
    card.style.transitionDelay = Math.min(index * 36, 144) + "ms";
    cardObserver.observe(card);
  });

  feedObserver.observe(feed);

  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateReverseState();
      ticking = false;
    });
  }, { passive: true });
})();

(function () {
  var page = document.querySelector(".roadmap-page");
  if (!page) return;

  var filters = Array.prototype.slice.call(page.querySelectorAll("[data-roadmap-filter]"));
  var tracks = Array.prototype.slice.call(page.querySelectorAll(".roadmap-track"));
  var visibleCount = page.querySelector(".roadmap-visible-count");

  function setFilter(filter) {
    var visible = 0;

    filters.forEach(function (button) {
      var active = button.getAttribute("data-roadmap-filter") === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    tracks.forEach(function (track) {
      var match = filter === "all" || track.getAttribute("data-track") === filter;
      track.hidden = !match;
      if (match) visible += 1;
    });

    if (visibleCount) visibleCount.textContent = visible;
  }

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      setFilter(button.getAttribute("data-roadmap-filter") || "all");
    });
  });

  Array.prototype.slice.call(page.querySelectorAll(".roadmap-node")).forEach(function (node) {
    node.addEventListener("toggle", function () {
      node.classList.toggle("is-open", node.open);
    });
  });

  setFilter("all");
})();

(function () {
  var nav = document.getElementById("db8gr-nav");
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (!nav || !toggle || !menu) return;

  function setOpen(open) {
    nav.classList.toggle("is-menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? DB8GR_I18N.collapseNav : DB8GR_I18N.expandNav);
  }

  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("is-menu-open"));
  });

  menu.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 820) setOpen(false);
  });
})();

(function () {
  var nav = document.getElementById("db8gr-nav");
  var progressBar = document.getElementById("scroll-progress-bar");
  var percentText = document.getElementById("scroll-percent");
  var topButton = document.getElementById("back-to-top");
  if (!nav && !progressBar && !percentText && !topButton) return;

  var lastY = window.scrollY || 0;
  var ticking = false;

  function showNav() {
    if (!nav) return;
    nav.style.opacity = "1";
    nav.style.transform = "translateY(0)";
  }

  function getScrollPercent(y) {
    var doc = document.documentElement;
    var max = Math.max(doc.scrollHeight - window.innerHeight, 1);
    return Math.min(Math.max(y / max, 0), 1);
  }

  function updateScrollUI() {
    var y = window.scrollY || 0;
    var delta = y - lastY;
    var percent = getScrollPercent(y);

    if (nav) {
      if (nav.classList.contains("is-menu-open")) {
        showNav();
      } else if (y <= 8 || delta < -2) {
        showNav();
      } else if (delta > 0 && y > 24) {
        var fade = Math.min((y - 24) / 260, 1);
        nav.style.opacity = String(Math.max(0, 1 - fade));
        nav.style.transform = "translateY(-" + Math.min(fade * 110, 110) + "%)";
      }
    }

    if (progressBar) {
      progressBar.style.width = (percent * 100).toFixed(1) + "%";
    }

    if (percentText) {
      percentText.textContent = Math.round(percent * 100) + "%";
    }

    lastY = y;
    ticking = false;
  }

  if (topButton) {
    topButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollUI);
  }, { passive: true });

  updateScrollUI();
})();
