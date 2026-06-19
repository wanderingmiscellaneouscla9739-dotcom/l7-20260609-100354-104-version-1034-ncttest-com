(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      const open = mobileMenu.classList.contains('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  const url = new URL(window.location.href);
  const queryValue = url.searchParams.get('q') || '';
  const queryInput = document.querySelector('[data-query-input]');

  if (queryInput && queryValue) {
    queryInput.value = queryValue;
  }

  const filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    const keywordInput = filterRoot.querySelector('[data-filter-keyword]');
    const yearSelect = filterRoot.querySelector('[data-filter-year]');
    const genreSelect = filterRoot.querySelector('[data-filter-genre]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const noResults = document.querySelector('[data-no-results]');

    if (keywordInput && queryValue) {
      keywordInput.value = queryValue;
    }

    const filterCards = function () {
      const keyword = (keywordInput ? keywordInput.value : '').trim().toLowerCase();
      const year = yearSelect ? yearSelect.value : '';
      const genre = genreSelect ? genreSelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = (card.getAttribute('data-search') || '').toLowerCase();
        const cardYear = card.getAttribute('data-year') || '';
        const cardGenre = card.getAttribute('data-genre') || '';
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchYear = !year || cardYear === year;
        const matchGenre = !genre || cardGenre.includes(genre);
        const matched = matchKeyword && matchYear && matchGenre;

        card.classList.toggle('hide-card', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle('is-visible', visible === 0);
      }
    };

    [keywordInput, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  }
})();
