chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action === 'prefs') {
		var prefsString = localStorage.prefs;
		if (prefsString === undefined) {
			sendResponse(undefined);
		} else {
			sendResponse(JSON.parse(localStorage.prefs));
		}
	}
});

var active = false;
function onClick(e) {
	chrome.tabs.query({
		currentWindow: true,
		active: true
	}, function(tabs) {
		var specTab = tabs[0];

		var wasActive = active;
		if (wasActive === false || wasActive === undefined) {
			chrome.browserAction.setIcon({
				path: 'icons/ic19-active.png',
				tabId: specTab.id
			});
			active = true;
			chrome.tabs.executeScript(specTab.id, {
				file: 'js/script-load.js'
			});
		} else {
			chrome.browserAction.setIcon({
				path: 'icons/ic19.png',
				tabId: specTab.id
			});
			active = false;
			chrome.tabs.executeScript(specTab.id, {
				file: 'js/script-deactivate.js'
			});
		}
	});
}
chrome.browserAction.onClicked.addListener(onClick);