(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function getBase() {
        return document.documentElement.getAttribute("data-base") || "./";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function bindMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function bindHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                play();
            });
        }
        play();
    }

    function bindPlayers() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play]");
            var message = player.querySelector("[data-player-message]");
            var stream = player.getAttribute("data-stream");
            var started = false;
            var hlsInstance = null;

            function setMessage(text) {
                if (message) {
                    message.textContent = text || "";
                }
            }

            function attach() {
                if (started || !video || !stream) {
                    return true;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage("播放未能启动，请稍后重试");
                        }
                    });
                    started = true;
                    return true;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    started = true;
                    return true;
                }
                setMessage("播放未能启动，请稍后重试");
                return false;
            }

            function start() {
                setMessage("");
                if (!attach()) {
                    return;
                }
                if (button) {
                    button.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    start();
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!started) {
                        start();
                    }
                });
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                });
                video.addEventListener("emptied", function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                    started = false;
                });
            }
        });
    }

    function bindLocalFilters() {
        var inputs = document.querySelectorAll("[data-local-filter]");
        inputs.forEach(function (input) {
            var target = document.querySelector(input.getAttribute("data-local-filter"));
            if (!target) {
                return;
            }
            var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-title") || "").toLowerCase();
                    card.hidden = keyword && text.indexOf(keyword) === -1;
                });
            });
        });
    }

    function bindSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.SITE_MOVIES) {
            return;
        }
        var input = page.querySelector("[data-search-input]");
        var category = page.querySelector("[data-search-category]");
        var type = page.querySelector("[data-search-type]");
        var year = page.querySelector("[data-search-year]");
        var status = page.querySelector("[data-search-status]");
        var results = page.querySelector("[data-search-results]");
        var params = new URLSearchParams(window.location.search);
        var base = getBase();

        function normalized(value) {
            return String(value || "").toLowerCase();
        }

        function imagePath(movie) {
            return base + movie.cover;
        }

        function card(movie) {
            return [
                "<article class=\"movie-card\" data-card>",
                "<a class=\"movie-card-link\" href=\"" + escapeHtml(base + movie.link) + "\">",
                "<span class=\"poster-wrap\">",
                "<img src=\"" + escapeHtml(imagePath(movie)) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "<span class=\"poster-gradient\"></span>",
                "<span class=\"play-chip\">播放</span>",
                "</span>",
                "<span class=\"movie-card-body\">",
                "<strong>" + escapeHtml(movie.title) + "</strong>",
                "<span class=\"movie-meta-line\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</span>",
                "<span class=\"movie-genre\">" + escapeHtml(movie.genre) + "</span>",
                "<span class=\"movie-one-line\">" + escapeHtml(movie.oneLine) + "</span>",
                "</span>",
                "</a>",
                "</article>"
            ].join("");
        }

        function render() {
            var keyword = normalized(input.value.trim());
            var selectedCategory = category.value;
            var selectedType = type.value;
            var selectedYear = year.value;
            var filtered = window.SITE_MOVIES.filter(function (movie) {
                var haystack = normalized([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    movie.oneLine,
                    (movie.tags || []).join(" ")
                ].join(" "));
                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }
                if (selectedCategory && movie.category !== selectedCategory) {
                    return false;
                }
                if (selectedType && movie.type.indexOf(selectedType) === -1) {
                    return false;
                }
                if (selectedYear && movie.year !== selectedYear) {
                    return false;
                }
                return true;
            });
            filtered.sort(function (a, b) {
                return b.views - a.views;
            });
            if (status) {
                status.textContent = filtered.length ? "找到相关影片" : "未找到相关影片";
            }
            if (results) {
                results.innerHTML = filtered.map(card).join("");
            }
        }

        if (input) {
            input.value = params.get("q") || "";
        }
        [input, category, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener("input", render);
                element.addEventListener("change", render);
            }
        });
        render();
    }

    ready(function () {
        bindMobileMenu();
        bindHeroSlider();
        bindPlayers();
        bindLocalFilters();
        bindSearchPage();
    });
})();
