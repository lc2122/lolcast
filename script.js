document.addEventListener('DOMContentLoaded', () => {
  const m3u8Input = document.getElementById('m3u8Input');
  const video = document.querySelector('video');

  const defaultOptions = {};

  m3u8Input.addEventListener('change', () => {
    const source = m3u8Input.value;
    
    if (!Hls.isSupported()) {
      video.src = source;
      var player = new Plyr(video, defaultOptions);
    } else {
      const hls = new Hls();
      hls.loadSource(source);

      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        const availableQualities = hls.levels.map((l) => l.height);
        availableQualities.unshift(0); //prepend 0 to quality array

        defaultOptions.quality = {
          default: 0, //Default - AUTO
          options: availableQualities,
          forced: true,
          onChange: (e) => updateQuality(e),
        };
        // Add Auto Label 
        defaultOptions.i18n = {
          qualityLabel: {
            0: 'Auto',
          },
        };

        hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
          var span = document.querySelector(".plyr__menu__container [data-plyr='quality'][value='0'] span")
          if (hls.autoLevelEnabled) {
            span.innerHTML = `AUTO (${hls.levels[data.level].height}p)`
          } else {
            span.innerHTML = `AUTO`
          }
        })

        var player = new Plyr(video, defaultOptions);
      });

      hls.attachMedia(video);
      window.hls = hls;
    }
  });
});

function updateQuality(newQuality) {
  if (newQuality === 0) {
    window.hls.currentLevel = -1; //Enable AUTO quality if option.value = 0
  } else {
    window.hls.levels.forEach((level, levelIndex) => {
      if (level.height === newQuality) {
        console.log("Found quality match with " + newQuality);
        window.hls.currentLevel = levelIndex;
      }
    });
  }
}
