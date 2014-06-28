/**
 *  License
 *  angular-slider
 *  https://github.com/usmakestwo/angular-slider
 *  License: MIT
**/

/**
 * Convert a regular element to an angular element
 * @param {object} element
 * @returns {object} the new element
*/
function angularize(element) {
	return angular.element(element);
}

/**
 * Adds 'px' to the end of a number
 * @param {(string|Number)} position
 * @returns {string}
*/
function pixelize(position) {
	return '' + position + 'px';
}

/**
 * Sets the element's opacity to 0
 * @param {object} element
 * @returns {object} the element
*/
function hide(element) {
	return element.css({
		opacity: 0
	});
}

/**
 * Sets the element's opacity to 1
 * @param {object} element
 * @returns {object} the element
*/
function show(element) {
	return element.css({
		opacity: 1
	});
}
/**
 * offsets the element from the left the given amount
 * @param {object} element
 * @param {Number|string} position
 * @returns {object} the element
*/

function offset(element, position) {
	return element.css({
		left: position
	});
}
/**
 * Determines how wide half the element is
 * @param {object} element
 * @returns {number}
*/
function halfWidth(element) {
	return element[0].offsetWidth / 2;
}

/**
 * Determine the amount of space to the left of the element
 * @param {object} element
 * @returns {Number}
*/
function offsetLeft(element) {
	return element[0].offsetLeft;
}

/**
 * Determine the width of the element
 * @param {object} element
 * @returns {Number}
*/
function width(element) {
	return element[0].offsetWidth;
}

/**
 * Compute the gap between the two given elements
 * @param {object} element1
 * @param {object} element2
 * @returns {number}
*/
function gap(element1, element2) {
	if(offsetLeft(element1) > offsetLeft(element2)) {
		return offsetLeft(element1) - offsetLeft(element2) - width(element2);
	}
	return offsetLeft(element2) - offsetLeft(element1) - width(element1);
}

/**
 * Binds the given html string to the given element
 * @param {object} element
 * @param {string} html
 * @returns {object} the element
 */
function bindHtml(element, html) {
	return element.attr('ng-bind-html-unsafe', html);
}

/**
 * Computes the nearest full step
 * @param {Number} [value = 0]
 * @param {Number} [precision = 0]
 * @param {Number} [step = 1/Math.pow(10, precision)]
 * @param {Number} [floor = 0]
 * @param {Number} [ceiling]
 * @returns {Number}
*/
function roundStep(value, precision, step, floor) {
	var decimals, remainder, roundedValue, steppedValue;
	if (floor === null) {
		floor = 0;
	}
	if (step === null) {
		step = 1 / Math.pow(10, precision);
	}
	remainder = (value - floor) % step;
	steppedValue = remainder > (step / 2) ? value + step - remainder : value - remainder;
	decimals = Math.pow(10, precision);
	roundedValue = steppedValue * decimals / decimals;
	return roundedValue.toFixed(precision);
}

var inputEvents = {
	mouse: {
		start: 'mousedown',
		move: 'mousemove',
		end: 'mouseup'
	},
	touch: {
		start: 'touchstart',
		move: 'touchmove',
		end: 'touchend'
	}
};

angular.module('ui-slider', []).directive('slider', ['$timeout', function($timeout) {
	return {
		restrict: 'EA',
		scope: {
					floor   : '@',  	// the minimum possible value
					ceiling   : '@',  	// the maximum possible value
					step    : '@',  	// how wide is each step, omit or set to 0 for no steps
					precision : '@',  	// how many decimal places do we care about
					ngModel   : '=?', 	// single knob value binding
					ngModelLow  : '=?', // dual knob low value binding
					ngModelHigh : '=?', // dual knob high value binding
					translate : '&' 	// how to translate the values displayed in the bubbles
		},
		template: // bar background
					'<span class="bar"></span><span class="fill"></span>' +
					'<span class="bar selection"></span><span class="pointer"></span><span class="pointer"></span><span class="bubble selection"></span>' +
					'<span ng-bind-html-unsafe="translate({value: floor})" class="bubble limit"></span><span ng-bind-html-unsafe="translate({value: ceiling})"'+
          'class="bubble   limit"></span>' + '<span class="bubble"></span><span class="bubble"></span><span class="bubble"></span>',
		compile: function(element, attributes) {
					var ceilBub, cmbBub, e, flrBub, fullBar,
						highBub, lowBub, maxPtr, minPtr,
						range, refHigh, refLow, selBar, selBub,
						watchables, _i, _len, _ref, _ref1;

					if (attributes.translate) {
						attributes.$set('translate', '' + attributes.translate + '(value)');
					}

					range = (attributes.ngModel === null) && ((attributes.ngModelLow !== null) && (attributes.ngModelHigh !== null));
					_ref = (function() {
						var _i, _len, _ref, _results;

						_ref = element.children();
						_results = [];
						for (_i = 0, _len = _ref.length; _i < _len; _i++) {
							e = _ref[_i];
							_results.push(angularize(e));
						}
						return _results;
					})(),
					fullBar = _ref[0],    // background bar
					fillBar = _ref[1],    // fill bar
					selBar = _ref[2],     // step bubble
					minPtr = _ref[3],     // single knob
					maxPtr = _ref[4],     // dual knob
					selBub = _ref[5],     // dual knob: the range width bubble
					flrBub = _ref[6],     // the lower limit bubble
					ceilBub = _ref[7],    // the upper limit bubble
					lowBub = _ref[8],     // single knob: the value bubble, dual knob: the low value bubble
					highBub = _ref[9],    // dual knob: the high value bubble
					cmbBub = _ref[10],    // dual knob: the range values bubble
					refLow = range ? 'ngModelLow' : 'ngModel';
					refHigh = 'ngModelHigh';
					bindHtml(selBub, '"Range: " + translate({value: diff})');
					bindHtml(lowBub, 'translate({value: ' + refLow + '})');
					bindHtml(highBub, 'translate({value: ' + refHigh + '})');
					bindHtml(cmbBub, 'translate({value: ' + refLow + '}) + ' - ' + translate({value: ' + refHigh + '})');
					if (!range) {
						_ref1 = [selBar, maxPtr, selBub, highBub, cmbBub];
						for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
							element = _ref1[_i];
							element.remove();
						}
					}
					watchables = [refLow, 'floor', 'ceiling'];
					if (range) {
						watchables.push(refHigh);
					}
					return {
						post: function(scope, element, attributes) {
							var barWidth, boundToInputs, dimensions,
								maxOffset, maxValue, minOffset, minValue, ngDocument,
								offsetRange, pointerHalfWidth, updateDOM, valueRange,
								w, _j, _len1;

							element.addClass('slider');

							boundToInputs = false;
							ngDocument = angularize(document);
							if (!attributes.translate) {
								scope.translate = function(value) {
									return value.value;
								};
							}
							pointerHalfWidth = barWidth = minOffset = maxOffset = minValue = maxValue = valueRange = offsetRange = void 0;
							dimensions = function() {
								var value, _j, _len1, _ref2, _ref3;

								if ((_ref2 = scope.precision) === undefined) {
									scope.precision = 0;
								}
								if ((_ref3 = scope.step) === null) {
									scope.step = 1;
								}
								for (_j = 0, _len1 = watchables.length; _j < _len1; _j++) {
									value = watchables[_j];
									scope[value] = roundStep(parseFloat(scope[value]), parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
								}
								scope.diff = roundStep(scope[refHigh] - scope[refLow], parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
								pointerHalfWidth = halfWidth(minPtr);
								barWidth = width(fullBar);
								minOffset = 0;
								maxOffset = barWidth - width(minPtr);
								minValue = parseFloat(attributes.floor);
								maxValue = parseFloat(attributes.ceiling);
								valueRange = maxValue - minValue;
                offsetRange = maxOffset - minOffset;
								return offsetRange;
							};
							updateDOM = function() {
								var adjustBubbles, bindToInputEvents,
									fitToBar, percentOffset, percentToOffset,
									percentValue, setBindings, setPointers,
									fill = element[0].querySelector('.fill').style,
									bar = element[0].querySelector('.bar');

								dimensions();
								percentOffset = function(offset) {
									return ((offset - minOffset) / offsetRange) * 100;
								};
								percentValue = function(value) {
									return ((value - minValue) / valueRange) * 100;
								};
								percentToOffset = function(percent) {
									return pixelize(percent * offsetRange / 100);
								};
								fitToBar = function(element) {
									return offset(element, pixelize(Math.min(Math.max(0, offsetLeft(element)), barWidth - width(element))));
								};
								setPointers = function() {
									var newHighValue, newLowValue;

									offset(ceilBub, pixelize(barWidth - width(ceilBub)));
									newLowValue = percentValue(scope[refLow]);
									offset(minPtr, percentToOffset(newLowValue));
									offset(lowBub, pixelize(offsetLeft(minPtr) - (halfWidth(lowBub)) + pointerHalfWidth));
									if (range) {
										newHighValue = percentValue(scope[refHigh]);
										offset(maxPtr, percentToOffset(newHighValue));
										offset(highBub, pixelize(offsetLeft(maxPtr) - (halfWidth(highBub)) + pointerHalfWidth));
										offset(selBar, pixelize(offsetLeft(minPtr) + pointerHalfWidth));
										selBar.css({
											width: percentToOffset(newHighValue - newLowValue)
										});
										offset(selBub, pixelize(offsetLeft(selBar) + halfWidth(selBar) - halfWidth(selBub)));
										return offset(cmbBub, pixelize(offsetLeft(selBar) + halfWidth(selBar) - halfWidth(cmbBub)));
									}
								};
								adjustBubbles = function() {
									var bubToAdjust;

									fitToBar(lowBub);
									bubToAdjust = highBub;
									if (range) {
										fitToBar(highBub);
										fitToBar(selBub);
										if (gap(lowBub, highBub) < 10) {
											hide(lowBub);
											hide(highBub);
											fitToBar(cmbBub);
											show(cmbBub);
											bubToAdjust = cmbBub;
										} else {
											show(lowBub);
											show(highBub);
											hide(cmbBub);
											bubToAdjust = highBub;
										}
									}
									if (gap(flrBub, lowBub) < 5) {
										hide(flrBub);
									} else {
										if (range) {
											if (gap(flrBub, bubToAdjust) < 5) {
												hide(flrBub);
											} else {
												show(flrBub);
											}
										} else {
											show(flrBub);
										}
									}
									if (gap(lowBub, ceilBub) < 5) {
										return hide(ceilBub);
									} else {
										if (range) {
											if (gap(bubToAdjust, ceilBub) < 5) {
												return hide(ceilBub);
											} else {
												return show(ceilBub);
											}
										} else {
											return show(ceilBub);
										}
									}
								};
								bindToInputEvents = function(pointer, ref, events) {
									var onEnd, onMove, onStart;

									onEnd = function() {
										pointer.removeClass('active');
										ngDocument.unbind(events.move);
										return ngDocument.unbind(events.end);
									};
									onMove = function(event) {
										var eventX, newOffset, newPercent, newValue;

										eventX = event.clientX;
										newOffset = eventX - element[0].getBoundingClientRect().left - pointerHalfWidth;
										newOffset = Math.max(Math.min(newOffset, maxOffset), minOffset);
										newPercent = percentOffset(newOffset);
										newValue = minValue + (valueRange * newPercent / 100.0);
										if (range) {
											if (ref === refLow) {
												if (newValue > scope[refHigh]) {
													ref = refHigh;
													minPtr.removeClass('active');
													maxPtr.addClass('active');
												}
											} else {
												if (newValue < scope[refLow]) {
													ref = refLow;
													maxPtr.removeClass('active');
													minPtr.addClass('active');
												}
											}
										}
										newValue = roundStep(newValue, parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
										scope[ref] = newValue;
										return scope.$parent.$apply(attributes.ngChange);
									};
									onStart = function(event) {
										pointer.addClass('active');
										dimensions();
										event.stopPropagation();
										event.preventDefault();
										ngDocument.bind(events.move, onMove);
										return ngDocument.bind(events.end, onEnd);
									};
									return pointer.bind(events.start, onStart);
								};
								setBindings = function() {
									var bind, inputMethod, _j, _len1, _ref2, _results;

									boundToInputs = true;
									bind = function(method) {
										bindToInputEvents(minPtr, refLow, inputEvents[method]);
										return bindToInputEvents(maxPtr, refHigh, inputEvents[method]);
									};
									_ref2 = ['touch', 'mouse'];
									_results = [];
									for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
										inputMethod = _ref2[_j];
										_results.push(bind(inputMethod));
									}
									return _results;
								};
								animateSlider = function(){
								var newVal = Math.min(scope.ngModel, scope.ceiling),
									newWidth = newVal / scope.ceiling;
									fill.width = (newWidth * bar.offsetWidth) + 'px';
								};
								setPointers();
								adjustBubbles();
								animateSlider();
								if (!boundToInputs) {
									return setBindings();
								}
							};
							$timeout(updateDOM);
							for (_j = 0, _len1 = watchables.length; _j < _len1; _j++) {
								w = watchables[_j];
								scope.$watch(w, updateDOM);
							}
							return window.addEventListener('resize', updateDOM);
						}
					};
		}
	};
}]);
