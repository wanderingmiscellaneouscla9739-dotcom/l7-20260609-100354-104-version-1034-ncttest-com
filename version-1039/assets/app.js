(function () {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function safe(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (mark) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[mark];
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function bindMenu() {
    var button = $(".menu-toggle");
    var panel = $(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
        button.textContent = "×";
      } else {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
        button.textContent = "☰";
      }
    });
  }

  function bindSearchForms() {
    $all(".search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
      });
    });
  }

  function bindHero() {
    var slides = $all(".hero-slide");
    var dots = $all(".hero-dot");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function bindFilters() {
    var grid = $("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var input = $("[data-filter-keyword]");
    var year = $("[data-filter-year]");
    var region = $("[data-filter-region]");
    var type = $("[data-filter-type]");
    var empty = $(".filter-empty");
    var cards = $all(".movie-card", grid);
    var apply = function () {
      var key = normalize(input && input.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type")
        ].join(" "));
        var matched = true;
        if (key && text.indexOf(key) === -1) {
          matched = false;
        }
        if (y && normalize(card.getAttribute("data-year")) !== y) {
          matched = false;
        }
        if (r && normalize(card.getAttribute("data-region")) !== r) {
          matched = false;
        }
        if (t && normalize(card.getAttribute("data-type")) !== t) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    };
    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function cardMarkup(movie) {
    return [
      '<a class="movie-card" href="./' + safe(movie.url) + '">',
      '<div class="movie-thumb">',
      '<img src="' + safe(movie.image) + '" alt="' + safe(movie.title) + '" loading="lazy">',
      '<span class="movie-badge">' + safe(movie.mainGenre) + '</span>',
      '<span class="movie-time">' + safe(movie.duration) + '</span>',
      '</div>',
      '<div class="movie-info">',
      '<h2>' + safe(movie.title) + '</h2>',
      '<p>' + safe(movie.oneLine) + '</p>',
      '<div class="movie-meta"><span>' + safe(movie.year) + '</span><span>' + safe(movie.region) + '</span><span>' + safe(movie.type) + '</span></div>',
      '<div class="tag-row">' + movie.tags.slice(0, 4).map(function (tag) { return '<span>' + safe(tag) + '</span>'; }).join('') + '</div>',
      '</div>',
      '</a>'
    ].join('');
  }

  function renderSearch() {
    var target = $("[data-search-results]");
    if (!target || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q") || "");
    var input = $("[data-search-input]");
    if (input && query) {
      input.value = params.get("q") || "";
    }
    var source = window.SEARCH_INDEX;
    var results = source.filter(function (movie) {
      if (!query) {
        return movie.hot;
      }
      var text = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags.join(" "),
        movie.oneLine,
        movie.category
      ].join(" "));
      return text.indexOf(query) !== -1;
    }).slice(0, 120);
    if (!results.length) {
      target.innerHTML = '<div class="filter-empty" style="display:block">未找到相关影片</div>';
      return;
    }
    target.innerHTML = results.map(cardMarkup).join('');
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindMenu();
    bindSearchForms();
    bindHero();
    bindFilters();
    renderSearch();
  });
})();
