(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setStatus(player, message) {
    var status = player.querySelector('.player-status');
    if (status) {
      status.textContent = message || '';
    }
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-hls-loader="true"]');
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }
      var script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.setAttribute('data-hls-loader', 'true');
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function getHlsConstructor() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (window.__siteHlsPromise) {
      return window.__siteHlsPromise;
    }
    window.__siteHlsPromise = import('./hls.js').then(function (module) {
      return module.H || module.default;
    }).catch(function () {
      return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js');
    });
    return window.__siteHlsPromise;
  }

  function attachHls(player, video, source) {
    if (!source) {
      setStatus(player, '视频暂时无法播放');
      return;
    }
    setStatus(player, '正在加载');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
      setStatus(player, '');
      return;
    }
    getHlsConstructor().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        setStatus(player, '视频暂时无法播放');
        return;
      }
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus(player, '');
        video.play().catch(function () {});
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          setStatus(player, '正在重新加载');
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          setStatus(player, '正在恢复播放');
        } else {
          setStatus(player, '视频暂时无法播放');
          hls.destroy();
        }
      });
      player.__hls = hls;
    }).catch(function () {
      setStatus(player, '视频暂时无法播放');
    });
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.video-start');
    var source = player.getAttribute('data-video-url') || '';
    var started = false;

    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (button) {
        button.classList.add('is-hidden');
      }
      attachHls(player, video, source);
    }

    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(setupPlayer);
  });
})();
