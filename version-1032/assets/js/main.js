(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      menu.hidden = expanded;
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCardFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    if (!cards.length) {
      return;
    }
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.js-card-search'));
    var yearInputs = Array.prototype.slice.call(document.querySelectorAll('.js-filter-year'));
    var regionInputs = Array.prototype.slice.call(document.querySelectorAll('.js-filter-region'));
    var genreInputs = Array.prototype.slice.call(document.querySelectorAll('.js-filter-genre'));
    var categoryInputs = Array.prototype.slice.call(document.querySelectorAll('.js-filter-category'));
    var empty = document.querySelector('.empty-state');

    function valueOf(inputs) {
      return inputs.length ? inputs[0].value.trim().toLowerCase() : '';
    }

    function textOf(card) {
      return (card.textContent || '').trim().toLowerCase();
    }

    function apply() {
      var query = valueOf(searchInputs);
      var year = valueOf(yearInputs);
      var region = valueOf(regionInputs);
      var genre = valueOf(genreInputs);
      var category = valueOf(categoryInputs);
      var visible = 0;

      cards.forEach(function (card) {
        var cardText = textOf(card);
        var ok = true;
        if (query && cardText.indexOf(query) === -1) {
          ok = false;
        }
        if (year && String(card.dataset.year || '').toLowerCase() !== year) {
          ok = false;
        }
        if (region && String(card.dataset.region || '').toLowerCase() !== region) {
          ok = false;
        }
        if (genre && String(card.dataset.genre || '').toLowerCase().indexOf(genre) === -1) {
          ok = false;
        }
        if (category && String(card.dataset.category || '').toLowerCase() !== category) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    searchInputs.concat(yearInputs, regionInputs, genreInputs, categoryInputs).forEach(function (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });

    apply();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFilters();
  });
})();
