(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-library-filter]').forEach(function (panel) {
        var scope = panel.parentElement || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var keyword = panel.querySelector('[data-filter-keyword]');
        var region = panel.querySelector('[data-filter-region]');
        var year = panel.querySelector('[data-filter-year]');
        var category = panel.querySelector('[data-filter-category]');
        var empty = scope.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';

        if (keyword && q) {
            keyword.value = q;
        }

        function applyFilter() {
            var term = keyword ? keyword.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var yearValue = year ? year.value : '';
            var categoryValue = category ? category.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var matched = true;

                if (term && haystack.indexOf(term) === -1) {
                    matched = false;
                }
                if (regionValue && card.getAttribute('data-region') !== regionValue) {
                    matched = false;
                }
                if (yearValue && card.getAttribute('data-year') !== yearValue) {
                    matched = false;
                }
                if (categoryValue && card.getAttribute('data-category') !== categoryValue) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [keyword, region, year, category].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilter);
                field.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });

    var enginePromise = null;

    function loadEngine(done) {
        if (window.Hls) {
            done();
            return;
        }

        if (!enginePromise) {
            enginePromise = new Promise(function (resolve, reject) {
                var script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        enginePromise.then(done).catch(done);
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video[data-stream]');
        var button = player.querySelector('[data-play-button]');
        var message = player.querySelector('[data-player-message]');

        if (!video) {
            return;
        }

        function setMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text || '';
            message.classList.toggle('show', Boolean(text));
        }

        function connect(callback) {
            var stream = video.getAttribute('data-stream');

            if (!stream) {
                setMessage('播放暂时不可用，请稍后再试');
                return;
            }

            if (video.getAttribute('data-ready') === '1') {
                callback();
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.setAttribute('data-ready', '1');
                callback();
                return;
            }

            loadEngine(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.setAttribute('data-ready', '1');
                        callback();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放暂时不可用，请稍后再试');
                        }
                    });
                    video._streamEngine = hls;
                } else {
                    video.src = stream;
                    video.setAttribute('data-ready', '1');
                    callback();
                }
            });
        }

        function play() {
            setMessage('');
            connect(function () {
                var request = video.play();
                if (request && request.catch) {
                    request.catch(function () {
                        setMessage('点击视频区域即可继续播放');
                    });
                }
            });
        }

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            player.classList.add('playing');
        });

        video.addEventListener('pause', function () {
            player.classList.remove('playing');
        });
    });
})();
