(function () {
  const root = document.querySelector('[data-player-root]');

  if (!root) {
    return;
  }

  const video = root.querySelector('video');
  const cover = root.querySelector('[data-player-cover]');
  const sourceNode = document.getElementById('movie-source');
  let hls = null;
  let ready = false;

  const readSource = function () {
    if (!sourceNode) {
      return '';
    }

    try {
      const data = JSON.parse(sourceNode.textContent || '{}');
      return data.url || '';
    } catch (error) {
      return '';
    }
  };

  const attachSource = function () {
    if (ready || !video) {
      return;
    }

    const source = readSource();

    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }

    ready = true;
  };

  const startPlayback = function () {
    attachSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    const playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  };

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!ready) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
