(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var opened = mobilePanel.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }

        window.clearInterval(slideTimer);
        slideTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-slide')) || 0);
            startSlider();
        });
    });

    startSlider();

    var filterInput = document.querySelector('.page-filter');
    var filterItems = Array.prototype.slice.call(document.querySelectorAll('.filter-list [data-title]'));
    var yearButtons = Array.prototype.slice.call(document.querySelectorAll('.year-filter button'));
    var activeYear = 'all';

    function normalizeText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        if (!filterItems.length) {
            return;
        }

        var keyword = normalizeText(filterInput ? filterInput.value : '');

        filterItems.forEach(function (item) {
            var haystack = normalizeText([
                item.getAttribute('data-title'),
                item.getAttribute('data-region'),
                item.getAttribute('data-type'),
                item.getAttribute('data-year'),
                item.getAttribute('data-tags')
            ].join(' '));
            var yearMatched = activeYear === 'all' || item.getAttribute('data-year') === activeYear;
            var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;

            item.classList.toggle('hidden-by-filter', !(yearMatched && keywordMatched));
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }

    yearButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeYear = button.getAttribute('data-year') || 'all';
            yearButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilter();
        });
    });

    var playerShells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    playerShells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-start');
        var url = shell.getAttribute('data-hls');
        var ready = false;
        var hlsObject = null;

        function attachVideo() {
            if (!video || !url || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsObject = new window.Hls();
                hlsObject.loadSource(url);
                hlsObject.attachMedia(video);
            } else {
                video.src = url;
            }

            ready = true;
        }

        function startVideo() {
            if (!video) {
                return;
            }

            attachVideo();
            shell.classList.add('is-playing');
            video.setAttribute('controls', 'controls');

            var playResult = video.play();

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', startVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo();
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsObject && typeof hlsObject.destroy === 'function') {
                    hlsObject.destroy();
                }
            });
        }
    });
})();
