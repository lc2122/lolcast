$('.form-control').on('submit', (e) => {
	e.preventDefault();
	let video_url = $('.form-control>.url').val();
	if (video_url == '') {
		layer.msg('동영상 주소를 입력해 주세요');
		return false;
	}
	chrome.tabs.create({
		url: chrome.runtime.getURL('player.html') + '#video_url=' + encodeURIComponent(video_url)
	});
});