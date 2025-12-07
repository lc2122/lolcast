let demo_video_url = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

var art;
// var video_url = ''; // 더 이상 입력창 값을 비교할 필요가 없으므로 삭제해도 됩니다.

// --- [삭제됨] form submit 이벤트 리스너 전체 삭제 ---

$(document).ready(function() {
	let hash = window.location.hash;
	// URL 해시값(#video_url=...)이 있으면 바로 재생
	if (hash.startsWith('video_url=', 1)) {
		let temp_video_url = decodeURIComponent(hash.substr(11));
		playVideo(temp_video_url);
	} else {
		// URL이 없으면 데모 영상 재생 혹은 아무것도 안 함 (여기서는 데모 재생으로 설정)
		playVideo(demo_video_url);
	}
});

var playVideo = (videoUrl) => {
	$('.main').removeClass('ready');
	
	if (videoUrl == '') {
		videoUrl = demo_video_url;
		// 알림창이 굳이 필요 없다면 아래 layer.open 부분도 삭제 가능합니다.
		layer.open({
			icon: 5,
			time: 5 * 1000,
			title: '오류 알림',
			content: '재생할 주소가 없어 데모 동영상으로 재생됩니다.',
			btn: ['알겠습니다']
		});
	}

	if (videoUrl) {
		// --- [삭제됨] $('.form-control>.url').val(videoUrl); ---
		// 주소창(URL) 해시 업데이트
		window.location.hash = 'video_url=' + encodeURIComponent(videoUrl);
	}

	if (art?.id) {
		art.destroy();
	}
	
	try {
		art = new Artplayer({
			container: '.player',
			url: videoUrl,
			title: 'm3u8 플레이어',
			autoplay: true, // 자동 재생 추가 권장 (입력 버튼이 없으므로)
			loop: true,
			flip: true,
			playbackRate: true,
			aspectRatio: true,
			screenshot: true,
			setting: true,
			pip: true,
			fullscreenWeb: true,
			fullscreen: true,
			subtitleOffset: true,
			miniProgressBar: true,
			airplay: true,
			theme: '#23ade5',
			thumbnails: {},
			subtitle: {},
			highlight: [{
				time: 15,
				text: 'm3u8 플레이어에 오신 걸 환영합니다',
			}],
			icons: {
				loading: '<img src="images/loading.gif" width="100px" title="동영상 불러오는 중..." />'
			},
			settings: [{
				html: '컨트롤 바',
				icon: '<img width="22" heigth="22" src="images/state.svg">',
				tooltip: '열기',
				switch: true,
				onSwitch: async (item) => {
					item.tooltip = item.switch ? '닫기' : '열기';
					art.plugins.artplayerPluginControl.enable = !item.switch;
					await Artplayer.utils.sleep(300);
					art.setting.updateStyle();
					return !item.switch;
				},
			}],
			customType: {
				m3u8: playM3u8,
			},
			plugins: [
				artplayerPluginControl(),
				artplayerPluginHlsQuality({
					control: true,
					setting: false,
					title: 'Quality',
					auto: 'Auto',
				})
			],
		});
		
		art.on('ready', () => {
			setTimeout(() => {
				layer.msg('재생 시작');
				art.play();
			}, 100);
		});
	} catch (e) {
		console.error('이상 발생:', e)
	}
}

var playM3u8 = (video, url, art) => {
	if (Hls.isSupported()) {
		const hls = new Hls();

		art.hls = hls;
		art.hls.loadSource(url);
		art.hls.attachMedia(video);

		art.once('url', () => hls.destroy());
		art.once('destroy', () => hls.destroy());
	} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
		art.switchUrl(url);
		art.seek = 0;
	} else {
		art.notice.show = 'Unsupported playback format: m3u8';
	}
}