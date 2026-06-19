(function () {
  var body = document.body;
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      body.classList.toggle('menu-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var copies = Array.prototype.slice.call(hero.querySelectorAll('.hero-copy'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      copies.forEach(function (copy, copyIndex) {
        var active = copyIndex === current;
        copy.classList.toggle('is-active', active);
        copy.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function scheduleHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(current - 1);
        scheduleHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(current + 1);
        scheduleHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        scheduleHero();
      });
    });

    showHero(0);
    scheduleHero();
  }

  var filterGrid = document.querySelector('[data-filter-grid]');

  if (filterGrid) {
    var pageSearch = document.querySelector('[data-page-search]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-filter-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (pageSearch && initialQuery) {
      pageSearch.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
      var term = normalize(pageSearch ? pageSearch.value : '');
      var year = yearFilter ? yearFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.textContent);
        var matchTerm = !term || text.indexOf(term) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        var shouldShow = matchTerm && matchYear && matchType;
        card.hidden = !shouldShow;

        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [pageSearch, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
      }
    });

    runFilter();
  }

  function bindPlayer(shell) {
    var video = shell.querySelector('.video-player');
    var overlay = shell.querySelector('.play-overlay');

    if (!video || !overlay) {
      return;
    }

    var url = video.getAttribute('data-video-url');
    var initialized = false;
    var hls = null;

    function hideOverlay() {
      overlay.classList.add('is-hidden');
    }

    function beginPlayback() {
      if (!url) {
        return;
      }

      hideOverlay();

      if (initialized) {
        video.play().catch(function () {});
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = url;
      video.play().catch(function () {});
    }

    overlay.addEventListener('click', beginPlayback);

    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlayback();
      }
    });

    video.addEventListener('play', hideOverlay);

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(bindPlayer);
})();
