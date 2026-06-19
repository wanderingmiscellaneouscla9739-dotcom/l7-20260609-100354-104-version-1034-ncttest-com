(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startSlideTimer() {
        if (slides.length < 2) {
            return;
        }

        slideTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = Number(dot.getAttribute('data-hero-dot')) || 0;
            window.clearInterval(slideTimer);
            showSlide(index);
            startSlideTimer();
        });
    });

    startSlideTimer();

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-pill]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var resultCount = document.querySelector('[data-result-count]');
    var activeFilter = '';

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function getQuery() {
        if (!searchInputs.length) {
            return '';
        }

        return normalize(searchInputs[0].value);
    }

    function updateResultCount(visibleCount) {
        if (resultCount) {
            resultCount.textContent = '共 ' + visibleCount + ' 部影片';
        }
    }

    function filterCards() {
        var query = getQuery();
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var filterText = normalize(card.getAttribute('data-filter'));
            var queryMatched = !query || text.indexOf(query) !== -1;
            var filterMatched = !activeFilter || text.indexOf(activeFilter) !== -1 || filterText.indexOf(activeFilter) !== -1;
            var matched = queryMatched && filterMatched;

            card.hidden = !matched;

            if (matched) {
                visibleCount += 1;
            }
        });

        updateResultCount(visibleCount);
    }

    function applyUrlQuery() {
        if (!searchInputs.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            searchInputs.forEach(function (input) {
                input.value = query;
            });
        }
    }

    applyUrlQuery();

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            var value = input.value;
            searchInputs.forEach(function (otherInput) {
                if (otherInput !== input) {
                    otherInput.value = value;
                }
            });
            filterCards();
        });
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = normalize(button.getAttribute('data-filter-pill'));

            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });

            filterCards();
        });
    });

    if (cards.length) {
        filterCards();
    }

    Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
        image.addEventListener('error', function () {
            var holder = image.closest('.poster-frame, .category-overview-cover, .detail-poster');

            if (holder) {
                holder.classList.add('poster-missing');
            }
        });
    });

    function attachHls(video, src) {
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });

            hls.loadSource(src);
            hls.attachMedia(video);
            return hls;
        }

        video.src = src;
        return null;
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var src = player.getAttribute('data-video-src');
        var poster = player.getAttribute('data-poster');
        var hlsInstance = null;

        if (!video || !src) {
            return;
        }

        if (poster) {
            video.setAttribute('poster', poster);
        }

        function playVideo() {
            if (!hlsInstance && !video.getAttribute('src')) {
                hlsInstance = attachHls(video, src);
            }

            player.classList.add('is-playing');

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
    });
})();
