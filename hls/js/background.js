chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.command == 'm3u8Player') {
		let playerUrl = chrome.runtime.getURL('player.html') + '#video_url=' + encodeURIComponent(request.url)
		chrome.tabs.create({
			url: playerUrl
		}, () => {});
	}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'loading' && tab.url && tab.url.split('?')[0].endsWith('.m3u8') && !tab.url.match('player.html#video_url=')) {
		let playerUrl = chrome.runtime.getURL('player.html') + '#video_url=' + encodeURIComponent(tab.url);
		chrome.tabs.update(tab.id, {
			url: playerUrl,
			selected: true
		}, () => {});
		return;
	}
});

chrome.runtime.onInstalled.addListener(() => {
	chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [1],
		addRules: [{
			id: 1,
			priority: 1,
			condition: {
				regexFilter: '^(http.*\\.m3u8.*?)',
				resourceTypes: ['main_frame']
			},
			action: {
				type: 'redirect',
				redirect: {
					regexSubstitution: 'chrome-extension://' + chrome.runtime.id + '/player.html#video_url=\\1'
				}
			}
		}]
	});
});