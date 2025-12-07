//console.log('m3u8Player content-script');

document.addEventListener('click', function(evt) {
	let link_url = evt.target?.href;
	if (link_url && link_url.split('?')[0].endsWith('m3u8') && !link_url.match('player.html#video_url=')) {
		evt.preventDefault();
		evt.stopPropagation();
		chrome.runtime.sendMessage({
			command: 'm3u8Player',
			url: link_url
		}, (response) => {});
	}
});