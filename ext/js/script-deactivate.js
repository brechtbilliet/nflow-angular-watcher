function injectScript(file, node) {
	var th = document.getElementsByTagName(node)[0];
	var s = document.createElement('script');
	s.setAttribute('type', 'text/javascript');
	s.setAttribute('src', file);
	s.setAttribute('id', 'nflow-destroy-script');
	th.appendChild(s);
}
var elemToRemove = document.getElementById('nflow-core-script');
if (elemToRemove !== null) {
	elemToRemove.parentNode.removeChild(elemToRemove);
}
injectScript(chrome.extension.getURL('/js/destroy.js'), 'body');