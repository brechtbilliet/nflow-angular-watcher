var NgWatchHelper = function() {
	if (window.angular === undefined) {
		alert('This is not an angular application!');
		return;
	}
	var interval, miliseconds = 300,
		previousLength = 0,
		previousHtml = '',
		maxZIndex = 9999999,
		normalZIndex = 99999,
		colors = generateRandomColors(10000),
		scopeElements = [];
	return {
		start: start,
		stop: stop
	};

	function start() {
		angular.element('div').on('scroll', function() {
				previousHtml = ''; // reset
		});
		interval = setInterval(function() {
			render();
		}, miliseconds);
	}

	function stop() {
		clearInterval(interval);
		angular.element('.ng-scope').off('mouseover');
		angular.element('.ng-scope').off('mouseout');
		angular.element('.nflow-watcher-generated').remove();
	}

	function generateRandomColors(n) {
		var colors = [];
		for (var i = 0; i < n; i++) {
			colors.push('#' + ((1 << 24) * Math.random() | 0).toString(16));
		}
		return colors;
	}

	function getColorById(id) {
		var color = '';
		angular.forEach(scopeElements, function(overlay) {
			if (overlay.id === id) {
				color = overlay.color;
			}
		});
		return color;
	}

	function getScopeElementById(id) {
		var scopeElement = '';
		angular.forEach(scopeElements, function(scElement) {
			if (scElement.id === id) {
				scopeElement = scElement;
			}
		});
		return scopeElement;
	}

	function handleEvents() {
		function highlightOverlay(evt) {
			evt.stopPropagation();
			var id = Number(angular.element(this).attr('data-nflow-watcher-id'));
			var scopeElement = getScopeElementById(id);
			var previousColor = scopeElement.color;
			var overlay = angular.element('#nflow-watcher-overlay-' + id);
			var label = angular.element('#nflow-watcher-label-' + id);
			// set the highlight css of the overlay
			overlay.css('border', '3px solid ' + previousColor);
			overlay.css('background', 'rgba(255,0,0, 0.1)');
			overlay.css('z-index', maxZIndex);
			// set the highlight css of the label
			label.css('background-color', previousColor);
			label.css('border', '5px dotted ' + previousColor);
			label.css('z-index', maxZIndex);
			var detailHtml = '<div class="nflow-watcher-detail" style="border: 3px solid ' + previousColor + ';padding: 10px; background: #fff; z-index:' + maxZIndex + '; position: absolute; left:' + Number(evt.clientX + 50) + 'px; top: ' + scopeElement.top + 'px;">';
			detailHtml += '<strong>Scope id: ' + scopeElement.$scopeId + '</strong><br/>';
			detailHtml += '<strong>Number of watchers: ' + scopeElement.specificWatches.length + '</strong>';
			angular.forEach(scopeElement.specificWatches, function(watch) {
				detailHtml += '<ul>';
				detailHtml += '<li><strong>expression: </strong>' + (watch.exp.name|| watch.exp) + ' </li>';
				detailHtml += '<li><strong>function: </strong>' + (watch.fn.name|| watch.exp) + ' </li>';
				detailHtml += '</ul>';
			});
			detailHtml += '<br/>';
			detailHtml += '</div>';
			angular.element('.nflow-watcher-generated .nflow-watcher-detail').remove();
			angular.element('.nflow-watcher-generated').append(detailHtml);
		}

		function unhighlightOverlay() {
			var thisElement = angular.element(this);
			var id = Number($(this).attr('data-nflow-watcher-id'));
			var previousColor = getColorById(id);
			var overlay = angular.element('#nflow-watcher-overlay-' + id);
			var label = angular.element('#nflow-watcher-label-' + id);
			// set the unhighlighted css for the overlay
			overlay.css('border', '1px solid ' + previousColor);
			overlay.css('background', 'none');
			overlay.css('z-index', normalZIndex);
			// set the unhighlighted css for the label
			label.css('background-color', 'rgba(255, 0, 0, 0.4)');
			label.css('border', 'none');
			angular.element('.nflow-watcher-generated .nflow-watcher-detail').remove();
			label.css('z-index', normalZIndex);
		}
		angular.element('.ng-scope').on('mouseover', highlightOverlay);
		angular.element('.ng-scope').on('mouseout', unhighlightOverlay);
	}

	function render() {
		function draw() {
			angular.element('.nflow-watcher-overlay, .nflow-watcher-watch-overlay').remove();
			previousLength = _len;
			var htmlLabels = '';
			for (i = 0; i < _len; i++) {
				var el = elementsWithScope[i];
				var $el = angular.element(el);
				var offset = $el.offset();
				var rect = el.getBoundingClientRect();
				var width = $el.outerWidth();
				$el.attr('data-nflow-watcher-id', i);
				var height = $el.outerHeight();
				scope = $el.scope();
				var specificWatches = 0;
				if (scope.$$watchers !== null) {
					specificWatches = scope.$$watchers.length;
					watchers += specificWatches;
				}
				scopeElements.push({
					top: offset.top,
					left: offset.left,
					width: width,
					height: height,
					id: i,
					color: colors[i],
					$scopeId: scope.$id,
					specificWatches: scope.$$watchers
				});
				var html = '<div class="nflow-watcher-label" id="nflow-watcher-label-' + i + '" style="';
				html += 'pointer-events: none; font-size: 12px; font-weight:bold; position:absolute; border-radius: 5px;';
				html += 'background-color: rgba(255, 0, 0, 0.4); padding: 5px; text-align:center;';
				html += 'width: 30px; height: 30px;top:' + offset.top + 'px; z-index:' + normalZIndex + ';';
				html += 'left: ' + offset.left + 'px;">' + specificWatches + '</div>';
				htmlLabels += html;
			}
			var htmlStr = '',
				htmlStrAllWatches = '';
			angular.forEach(scopeElements, function(overlay) {
				htmlStr += '<div class="nflow-watcher-overlay" id="nflow-watcher-overlay-' + overlay.id + '" style="background: none; pointer-events: none; display: block; position: absolute; border: 1px solid ' + overlay.color + '; top: ' + overlay.top + 'px; left: ' + overlay.left + 'px; width: ' + overlay.width + 'px; height: ' + overlay.height + 'px;"></div>';
			});
			htmlStrAllWatches = '<div class="nflow-watcher-watch-overlay" style="color: #ff0000; pointer-events: none; margin-left: 50px;; z-index: ' + normalZIndex + '; background: #000; padding: 10px; font-size: 14px; position: absolute; top: 0px; left: 0px;">' + watchers + ' watchers</div>';
			handleEvents();
			angular.element('body').append('<div class="nflow-watcher-generated">' + htmlStrAllWatches + htmlStr + htmlLabels + '</div>');
		}
		var watchers = 0,
			elementsWithScope, scope, i, _len;
		elementsWithScope = document.querySelectorAll('.ng-scope');
		_len = elementsWithScope.length;
		// if something changed
		var currentHtml = '';
		angular.element('body').find('div').not('.nflow-watcher-generated, .nflow-watcher-detail, .nflow-watcher-overlay, .nflow-watcher-label').each(function() {
			currentHtml += angular.element(this).html();
		});

		if (previousHtml !== currentHtml) {
			previousHtml = currentHtml;
			scopeElements.length = 0;
			angular.element('.ng-scope').off('mouseover');
			angular.element('.ng-scope').off('mouseout');
			angular.element('.nflow-watcher-generated').remove();
			draw();
		}
	}
};
var helper = new NgWatchHelper();
helper.start();