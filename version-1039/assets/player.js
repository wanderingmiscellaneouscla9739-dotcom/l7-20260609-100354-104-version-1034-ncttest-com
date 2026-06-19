(function () {
  window.initMoviePlayer = function (videoUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-play-overlay]");
    if (!video || !overlay || !videoUrl) {
      return;
    }
    var loaded = false;
    var hls = null;
    var load = function () {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
      loaded = true;
    };
    var start = function () {
      load();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    };
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
