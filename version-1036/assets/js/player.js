(function () {
  function attachStream(video, streamUrl) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      return new Promise(function (resolve) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = streamUrl;
    return Promise.resolve();
  }

  window.initMoviePlayer = function (videoId, layerId, streamUrl) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var ready = false;

    if (!video || !streamUrl) {
      return;
    }

    function start() {
      if (layer) {
        layer.classList.add('is-hidden');
      }

      if (!ready) {
        ready = true;
        attachStream(video, streamUrl).then(function () {
          return video.play();
        }).catch(function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });
  };
})();
