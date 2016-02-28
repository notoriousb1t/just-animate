/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var AnimationManager_1 = __webpack_require__(1);
	var animations = __webpack_require__(4);
	angular.module('just.animate', [])
	    .service('just', function () {
	    var animationManager = new AnimationManager_1.AnimationManager();
	    for (var animationName in animations) {
	        var animationOptions = animations[animationName];
	        animationManager.register(animationName, animationOptions);
	    }
	    return animationManager;
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var helpers_1 = __webpack_require__(2);
	var AnimationRelay_1 = __webpack_require__(3);
	function getElements(source) {
	    if (!source) {
	        throw Error("Cannot find elements.  Source is undefined");
	    }
	    if (source instanceof Element) {
	        return [source];
	    }
	    if (typeof source === 'string') {
	        return helpers_1.toArray(document.querySelectorAll(source));
	    }
	    if (helpers_1.isArray(source) || (typeof jQuery === 'function' && source instanceof jQuery)) {
	        var elements = [];
	        helpers_1.each(source, function (i) {
	            elements.push.apply(elements, getElements(i));
	        });
	        return elements;
	    }
	    if (helpers_1.isFunction(source)) {
	        var provider = source;
	        var result = provider();
	        return getElements(result);
	    }
	    return [];
	}
	var AnimationManager = (function () {
	    function AnimationManager() {
	        this._definitions = {};
	        this._timings = {
	            duration: 1000,
	            fill: "both"
	        };
	    }
	    AnimationManager.prototype.animate = function (name, el, timings) {
	        if (typeof name === 'undefined') {
	            return;
	        }
	        var definition = this._definitions[name];
	        if (typeof definition === 'undefined') {
	            return;
	        }
	        var timings2 = helpers_1.extend({}, definition.timings);
	        if (timings) {
	            timings2 = helpers_1.extend(timings2, timings);
	        }
	        var keyframes = definition.keyframes;
	        var elements = getElements(el);
	        var players = helpers_1.multiapply(elements, 'animate', [keyframes, timings2]);
	        return new AnimationRelay_1.AnimationRelay(players);
	    };
	    AnimationManager.prototype.configure = function (timings) {
	        helpers_1.extend(this._timings, timings);
	    };
	    AnimationManager.prototype.register = function (name, animationOptions) {
	        this._definitions[name] = animationOptions;
	        var self = this;
	        self[name] = function (el, timings) {
	            return self.animate(name, el, timings);
	        };
	        return self;
	    };
	    return AnimationManager;
	})();
	exports.AnimationManager = AnimationManager;


/***/ },
/* 2 */
/***/ function(module, exports) {

	var ostring = Object.prototype.toString;
	var slice = Array.prototype.slice;
	function isArray(a) {
	    return a !== undefined && typeof a !== 'string' && typeof a.length === 'number';
	}
	exports.isArray = isArray;
	function isFunction(a) {
	    return ostring.call(a) === '[object Function]';
	}
	exports.isFunction = isFunction;
	function toArray(indexed) {
	    return slice.call(indexed, 0);
	}
	exports.toArray = toArray;
	function each(items, fn) {
	    for (var i = 0, len = items.length; i < len; i++) {
	        fn(items[i]);
	    }
	}
	exports.each = each;
	function map(items, fn) {
	    var results = [];
	    for (var i = 0, len = items.length; i < len; i++) {
	        var result = fn(items[i]);
	        if (result !== undefined) {
	            results.push(result);
	        }
	    }
	    return results;
	}
	exports.map = map;
	function extend(target) {
	    var sources = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        sources[_i - 1] = arguments[_i];
	    }
	    for (var i = 1, len = arguments.length; i < len; i++) {
	        var source = arguments[i];
	        for (var propName in source) {
	            if (source.hasOwnProperty(propName)) {
	                target[propName] = source[propName];
	            }
	        }
	    }
	    return target;
	}
	exports.extend = extend;
	function multiapply(targets, fnName, args, cb) {
	    var errors = [];
	    var results = [];
	    for (var i = 0, len = targets.length; i < len; i++) {
	        try {
	            var target = targets[i];
	            var result = target[fnName].apply(target, args);
	            if (result !== undefined) {
	                results.push(result);
	            }
	        }
	        catch (err) {
	            errors.push(err);
	        }
	    }
	    if (typeof cb === 'function') {
	        cb(errors);
	    }
	    return results;
	}
	exports.multiapply = multiapply;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var helpers_1 = __webpack_require__(2);
	var AnimationRelay = (function () {
	    function AnimationRelay(animations) {
	        this.animations = animations;
	    }
	    AnimationRelay.prototype.finish = function (fn) {
	        helpers_1.multiapply(this.animations, 'finish', [], fn);
	        return this;
	    };
	    AnimationRelay.prototype.play = function (fn) {
	        helpers_1.multiapply(this.animations, 'play', [], fn);
	        return this;
	    };
	    AnimationRelay.prototype.pause = function (fn) {
	        helpers_1.multiapply(this.animations, 'pause', [], fn);
	        return this;
	    };
	    AnimationRelay.prototype.reverse = function (fn) {
	        helpers_1.multiapply(this.animations, 'reverse', [], fn);
	        return this;
	    };
	    AnimationRelay.prototype.cancel = function (fn) {
	        helpers_1.multiapply(this.animations, 'cancel', [], fn);
	        return this;
	    };
	    return AnimationRelay;
	})();
	exports.AnimationRelay = AnimationRelay;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	exports.bounce = __webpack_require__(5);
	exports.bounceIn = __webpack_require__(6);
	exports.bounceInDown = __webpack_require__(7);
	exports.bounceInLeft = __webpack_require__(8);
	exports.bounceInRight = __webpack_require__(9);
	exports.bounceInUp = __webpack_require__(10);
	exports.bounceOut = __webpack_require__(11);
	exports.bounceOutDown = __webpack_require__(12);
	exports.bounceOutLeft = __webpack_require__(13);
	exports.bounceOutRight = __webpack_require__(14);
	exports.bounceOutUp = __webpack_require__(15);
	exports.fadeIn = __webpack_require__(16);
	exports.fadeInDown = __webpack_require__(17);
	exports.fadeInDownBig = __webpack_require__(18);
	exports.fadeInLeft = __webpack_require__(19);
	exports.fadeInLeftBig = __webpack_require__(20);
	exports.fadeInRight = __webpack_require__(21);
	exports.fadeInRightBig = __webpack_require__(22);
	exports.fadeInUp = __webpack_require__(23);
	exports.fadeInUpBig = __webpack_require__(24);
	exports.fadeOut = __webpack_require__(25);
	exports.fadeOutDown = __webpack_require__(26);
	exports.fadeOutDownBig = __webpack_require__(27);
	exports.fadeOutLeft = __webpack_require__(28);
	exports.fadeOutLeftBig = __webpack_require__(29);
	exports.fadeOutRight = __webpack_require__(30);
	exports.fadeOutRightBig = __webpack_require__(31);
	exports.fadeOutUp = __webpack_require__(32);
	exports.fadeOutUpBig = __webpack_require__(33);
	exports.flash = __webpack_require__(34);
	exports.flip = __webpack_require__(35);
	exports.flipInX = __webpack_require__(36);
	exports.flipInY = __webpack_require__(37);
	exports.flipOutX = __webpack_require__(38);
	exports.flipOutY = __webpack_require__(39);
	exports.headShake = __webpack_require__(40);
	exports.hinge = __webpack_require__(41);
	exports.jello = __webpack_require__(42);
	exports.lightSpeedIn = __webpack_require__(43);
	exports.lightSpeedOut = __webpack_require__(44);
	exports.pulse = __webpack_require__(45);
	exports.rollIn = __webpack_require__(46);
	exports.rollOut = __webpack_require__(47);
	exports.rotateIn = __webpack_require__(48);
	exports.rotateInDownLeft = __webpack_require__(49);
	exports.rotateInDownRight = __webpack_require__(50);
	exports.rotateInUpLeft = __webpack_require__(51);
	exports.rotateInUpRight = __webpack_require__(52);
	exports.rotateOut = __webpack_require__(53);
	exports.rotateOutDownLeft = __webpack_require__(54);
	exports.rotateOutDownRight = __webpack_require__(55);
	exports.rotateOutUpLeft = __webpack_require__(56);
	exports.rotateOutUpRight = __webpack_require__(57);
	exports.rubberBand = __webpack_require__(58);
	exports.shake = __webpack_require__(59);
	exports.slideInDown = __webpack_require__(60);
	exports.slideInLeft = __webpack_require__(61);
	exports.slideInRight = __webpack_require__(62);
	exports.slideInUp = __webpack_require__(63);
	exports.slideOutDown = __webpack_require__(64);
	exports.slideOutLeft = __webpack_require__(65);
	exports.slideOutRight = __webpack_require__(66);
	exports.slideOutUp = __webpack_require__(67);
	exports.swing = __webpack_require__(68);
	exports.tada = __webpack_require__(69);
	exports.wobble = __webpack_require__(70);
	exports.zoomIn = __webpack_require__(71);
	exports.zoomInDown = __webpack_require__(72);
	exports.zoomInLeft = __webpack_require__(73);
	exports.zoomInRight = __webpack_require__(74);
	exports.zoomInUp = __webpack_require__(75);
	exports.zoomOut = __webpack_require__(76);
	exports.zoomOutDown = __webpack_require__(77);
	exports.zoomOutLeft = __webpack_require__(78);
	exports.zoomOutRight = __webpack_require__(79);
	exports.zoomOutUp = __webpack_require__(80);


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"transform": "translate3d(0, 0, 0)"
			},
			{
				"offset": 0.2,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"transform": "translate3d(0, 0, 0)"
			},
			{
				"offset": 0.4,
				"easing": "cubic-bezier(0.755, 0.050, 0.855, 0.060)",
				"transform": "translate3d(0, -30px, 0)"
			},
			{
				"offset": 0.43,
				"easing": "cubic-bezier(0.755, 0.050, 0.855, 0.060)",
				"transform": "translate3d(0, -30px, 0)"
			},
			{
				"offset": 0.53,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"transform": "translate3d(0, 0, 0)"
			},
			{
				"offset": 0.7,
				"easing": "cubic-bezier(0.755, 0.050, 0.855, 0.060)",
				"transform": "translate3d(0, -15px, 0)"
			},
			{
				"offset": 0.8,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"transform": "translate3d(0, 0, 0)"
			},
			{
				"offset": 0.9,
				"transform": "translate3d(0, -4px, 0)"
			},
			{
				"offset": 1,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"transform": "translate3d(0, 0, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "bounce"
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
			},
			{
				"offset": 0,
				"opacity": 0,
				"transform": "scale3d(.3, .3, .3)"
			},
			{
				"offset": 0.2,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
			},
			{
				"offset": 0.2,
				"transform": "scale3d(1.1, 1.1, 1.1)"
			},
			{
				"offset": 0.4,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
			},
			{
				"offset": 0.4,
				"transform": "scale3d(.9, .9, .9)"
			},
			{
				"offset": 0.6,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
			},
			{
				"offset": 0.6,
				"opacity": 1,
				"transform": "scale3d(1.03, 1.03, 1.03)"
			},
			{
				"offset": 0.8,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
			},
			{
				"offset": 0.8,
				"transform": "scale3d(.97, .97, .97)"
			},
			{
				"offset": 1,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "scale3d(1, 1, 1)"
			}
		],
		"timings": {
			"duration": 750,
			"fill": "both"
		},
		"name": "bounceIn"
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"opacity": 0,
				"transform": "translate3d(0, -3000px, 0)"
			},
			{
				"offset": 0.6,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"opacity": 1,
				"transform": "translate3d(0, 25px, 0)"
			},
			{
				"offset": 0.75,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"opacity": 1,
				"transform": "translate3d(0, -10px, 0)"
			},
			{
				"offset": 0.9,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"opacity": 1,
				"transform": "translate3d(0, 5px, 0)"
			},
			{
				"offset": 1,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "bounceInDown"
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
			},
			{
				"offset": 0,
				"opacity": 0,
				"transform": "translate3d(-3000px, 0, 0)"
			},
			{
				"offset": 0.6,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
			},
			{
				"offset": 0.6,
				"opacity": 1,
				"transform": "translate3d(25px, 0, 0)"
			},
			{
				"offset": 0.75,
				"opacity": 1,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
			},
			{
				"offset": 0.75,
				"opacity": 1,
				"transform": "translate3d(-10px, 0, 0)"
			},
			{
				"offset": 0.9,
				"opacity": 1,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
			},
			{
				"offset": 0.9,
				"opacity": 1,
				"transform": "translate3d(5px, 0, 0)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "bounceInLeft"
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"transform": "translate3d(3000px, 0, 0)"
			},
			{
				"offset": 0.6,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"opacity": 1,
				"transform": "translate3d(-25px, 0, 0)"
			},
			{
				"offset": 0.75,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"transform": "translate3d(10px, 0, 0)"
			},
			{
				"offset": 0.9,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"transform": "translate3d(-5px, 0, 0)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "bounceInRight"
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"transform": "translate3d(0, 3000px, 0)"
			},
			{
				"offset": 0.6,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"opacity": 1,
				"transform": "translate3d(0, -20px, 0)"
			},
			{
				"offset": 0.75,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"opacity": 1,
				"transform": "translate3d(0, 10px, 0)"
			},
			{
				"offset": 0.9,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"opacity": 1,
				"transform": "translate3d(0, -5px, 0)"
			},
			{
				"offset": 1,
				"easing": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
				"opacity": 1,
				"transform": "translate3d(0, 0, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "bounceInUp"
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 0.2,
				"transform": "scale3d(.9, .9, .9)"
			},
			{
				"offset": 0.5,
				"opacity": 1,
				"transform": "scale3d(1.1, 1.1, 1.1)"
			},
			{
				"offset": 0.55,
				"opacity": 1,
				"transform": "scale3d(1.1, 1.1, 1.1)"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "scale3d(.3, .3, .3)"
			}
		],
		"timings": {
			"duration": 750,
			"fill": "both"
		},
		"name": "bounceOut"
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 0.2,
				"transform": "translate3d(0, 10px, 0)"
			},
			{
				"offset": 0.4,
				"opacity": 1,
				"transform": "translate3d(0, -20px, 0)"
			},
			{
				"offset": 0.45,
				"opacity": 1,
				"transform": "translate3d(0, -20px, 0)"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(0, 2000px, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "bounceOutDown"
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 0.2,
				"opacity": 1,
				"transform": "translate3d(20px, 0, 0)"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(-2000px, 0, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "bounceOutLeft"
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 0.2,
				"opacity": 1,
				"transform": "translate3d(-20px, 0, 0)"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(2000px, 0, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "bounceOutRight"
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 0.2,
				"opacity": 1,
				"transform": "translate3d(0, -10px, 0)"
			},
			{
				"offset": 0.4,
				"opacity": 1,
				"transform": "translate3d(0, 20px, 0)"
			},
			{
				"offset": 0.45,
				"opacity": 1,
				"transform": "translate3d(0, 20px, 0)"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(0, -2000px, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "bounceOutUp"
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0
			},
			{
				"offset": 1,
				"opacity": 1
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeIn"
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "translate3d(0, -100%, 0)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeInDown"
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "translate3d(0, -2000px, 0)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeInDownBig"
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "translate3d(-100%, 0, 0)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeInLeft"
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "translate3d(-2000px, 0, 0)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeInLeftBig"
	};

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "translate3d(100%, 0, 0)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeInRight"
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "translate3d(2000px, 0, 0)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeInRightBig"
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "translate3d(0, 100%, 0)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeInUp"
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "translate3d(0, 2000px, 0)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeInUpBig"
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1
			},
			{
				"offset": 1,
				"opacity": 0
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeOut"
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(0, 100%, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeOutDown"
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(0, 2000px, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeOutDownBig"
	};

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(-100%, 0, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeOutLeft"
	};

/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(-2000px, 0, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeOutLeftBig"
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(100%, 0, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeOutRight"
	};

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(2000px, 0, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeOutRightBig"
	};

/***/ },
/* 32 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(0, -100%, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeOutUp"
	};

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(0, -2000px, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "fadeOutUpBig"
	};

/***/ },
/* 34 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1
			},
			{
				"offset": 0.25,
				"opacity": 0
			},
			{
				"offset": 0.5,
				"opacity": 1
			},
			{
				"offset": 0.75,
				"opacity": 0
			},
			{
				"offset": 1,
				"opacity": 1
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "flash"
	};

/***/ },
/* 35 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "perspective(400px) rotate3d(0, 1, 0, -360deg)",
				"easing": "ease-out"
			},
			{
				"offset": 0.4,
				"transform": "perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -190deg)",
				"easing": "ease-out"
			},
			{
				"offset": 0.5,
				"transform": "perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -170deg)",
				"easing": "ease-in "
			},
			{
				"offset": 0.8,
				"transform": "perspective(400px) scale3d(.95, .95, .95)",
				"easing": "ease-in "
			},
			{
				"offset": 1,
				"transform": "perspective(400px)",
				"easing": "ease-in "
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "flip"
	};

/***/ },
/* 36 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "perspective(400px) rotate3d(1, 0, 0, 90deg)",
				"easing": "ease-in ",
				"opacity": 0
			},
			{
				"offset": 0.4,
				"transform": "perspective(400px) rotate3d(1, 0, 0, -20deg)",
				"easing": "ease-in "
			},
			{
				"offset": 0.6,
				"transform": "perspective(400px) rotate3d(1, 0, 0, 10deg)",
				"opacity": 1
			},
			{
				"offset": 0.8,
				"transform": "perspective(400px) rotate3d(1, 0, 0, -5deg)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "perspective(400px)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "flipInX"
	};

/***/ },
/* 37 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "perspective(400px) rotate3d(0, 1, 0, 90deg)",
				"easing": "ease-in ",
				"opacity": 0
			},
			{
				"offset": 0.4,
				"transform": "perspective(400px) rotate3d(0, 1, 0, -20deg)",
				"easing": "ease-in "
			},
			{
				"offset": 0.6,
				"transform": "perspective(400px) rotate3d(0, 1, 0, 10deg)",
				"opacity": 1
			},
			{
				"offset": 0.8,
				"transform": "perspective(400px) rotate3d(0, 1, 0, -5deg)"
			},
			{
				"offset": 1,
				"transform": "perspective(400px)",
				"opacity": 1
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "flipInY"
	};

/***/ },
/* 38 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "perspective(400px)",
				"opacity": 1
			},
			{
				"offset": 0.3,
				"transform": "perspective(400px) rotate3d(1, 0, 0, -20deg)",
				"opacity": 1
			},
			{
				"offset": 1,
				"transform": "perspective(400px) rotate3d(1, 0, 0, 90deg)",
				"opacity": 0
			}
		],
		"timings": {
			"duration": 750,
			"fill": "both"
		},
		"name": "flipOutX"
	};

/***/ },
/* 39 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "perspective(400px)",
				"opacity": 1
			},
			{
				"offset": 0.3,
				"transform": "perspective(400px) rotate3d(0, 1, 0, -15deg)",
				"opacity": 1
			},
			{
				"offset": 1,
				"transform": "perspective(400px) rotate3d(0, 1, 0, 90deg)",
				"opacity": 0
			}
		],
		"timings": {
			"duration": 750,
			"fill": "both"
		},
		"name": "flipOutY"
	};

/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "translateX(0)"
			},
			{
				"offset": 0.065,
				"transform": "translateX(-6px) rotateY(-9deg)"
			},
			{
				"offset": 0.185,
				"transform": "translateX(5px) rotateY(7deg)"
			},
			{
				"offset": 0.315,
				"transform": "translateX(-3px) rotateY(-5deg)"
			},
			{
				"offset": 0.435,
				"transform": "translateX(2px) rotateY(3deg)"
			},
			{
				"offset": 0.5,
				"transform": "translateX(0)"
			},
			{
				"offset": 1,
				"transform": "translateX(0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both",
			"ease": "ease-in-out"
		},
		"name": "headShake"
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "none",
				"transform-origin": "top left",
				"easing": "ease-in -out",
				"opacity": 1
			},
			{
				"offset": 0.2,
				"transform": "rotate3d(0, 0, 1, 80deg)",
				"transform-origin": "top left",
				"easing": "ease-in -out",
				"opacity": 1
			},
			{
				"offset": 0.4,
				"transform": "rotate3d(0, 0, 1, 60deg)",
				"transform-origin": "top left",
				"easing": "ease-in -out",
				"opacity": 1
			},
			{
				"offset": 0.6,
				"transform": "rotate3d(0, 0, 1, 80deg)",
				"transform-origin": "top left",
				"easing": "ease-in -out",
				"opacity": 0
			},
			{
				"offset": 0.8,
				"transform": "rotate3d(0, 0, 1, 60deg)",
				"transform-origin": "top left",
				"easing": "ease-in -out",
				"opacity": 1
			},
			{
				"offset": 1,
				"transform": "translate3d(0, 700px, 0)",
				"transform-origin": "top left",
				"easing": "ease-in -out",
				"opacity": 0
			}
		],
		"timings": {
			"duration": 2000,
			"fill": "both"
		},
		"name": "hinge"
	};

/***/ },
/* 42 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "none"
			},
			{
				"offset": 0.111,
				"transform": "none"
			},
			{
				"offset": 0.222,
				"transform": "skewX(-12.5deg) skewY(-12.5deg)"
			},
			{
				"offset": 0.33299999999999996,
				"transform": "skewX(6.25deg) skewY(6.25deg)"
			},
			{
				"offset": 0.444,
				"transform": "skewX(-3.125deg) skewY(-3.125deg)"
			},
			{
				"offset": 0.555,
				"transform": "skewX(1.5625deg) skewY(1.5625deg)"
			},
			{
				"offset": 0.6659999999999999,
				"transform": "skewX(-0.78125deg) skewY(-0.78125deg)"
			},
			{
				"offset": 0.777,
				"transform": "skewX(0.390625deg) skewY(0.390625deg)"
			},
			{
				"offset": 0.888,
				"transform": "skewX(-0.1953125deg) skewY(-0.1953125deg)"
			},
			{
				"offset": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "jello"
	};

/***/ },
/* 43 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "translate3d(100%, 0, 0) skewX(-30deg)",
				"opacity": 0
			},
			{
				"offset": 0.6,
				"transform": "skewX(20deg)",
				"opacity": 1
			},
			{
				"offset": 0.8,
				"transform": "skewX(-5deg)",
				"opacity": 1
			},
			{
				"offset": 1,
				"transform": "none",
				"opacity": 1
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "lightSpeedIn"
	};

/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "none",
				"opacity": 1
			},
			{
				"offset": 1,
				"transform": "translate3d(100%, 0, 0) skewX(30deg)",
				"opacity": 0
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "lightSpeedOut"
	};

/***/ },
/* 45 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "scale3d(1, 1, 1)"
			},
			{
				"offset": 0.5,
				"transform": "scale3d(1.05, 1.05, 1.05)"
			},
			{
				"offset": 1,
				"transform": "scale3d(1, 1, 1)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "pulse"
	};

/***/ },
/* 46 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rollIn"
	};

/***/ },
/* 47 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rollOut"
	};

/***/ },
/* 48 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform-origin": "center",
				"transform": "rotate3d(0, 0, 1, -200deg)",
				"opacity": 0
			},
			{
				"offset": 1,
				"transform-origin": "center",
				"transform": "none",
				"opacity": 1
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rotateIn"
	};

/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform-origin": "left bottom",
				"transform": "rotate3d(0, 0, 1, -45deg)",
				"opacity": 0
			},
			{
				"offset": 1,
				"transform-origin": "left bottom",
				"transform": "none",
				"opacity": 1
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rotateInDownLeft"
	};

/***/ },
/* 50 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform-origin": "right bottom",
				"transform": "rotate3d(0, 0, 1, 45deg)",
				"opacity": 0
			},
			{
				"offset": 1,
				"transform-origin": "right bottom",
				"transform": "none",
				"opacity": 1
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rotateInDownRight"
	};

/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform-origin": "left bottom",
				"transform": "rotate3d(0, 0, 1, 45deg)",
				"opacity": 0
			},
			{
				"offset": 1,
				"transform-origin": "left bottom",
				"transform": "none",
				"opacity": 1
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rotateInUpLeft"
	};

/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform-origin": "right bottom",
				"transform": "rotate3d(0, 0, 1, -90deg)",
				"opacity": 0
			},
			{
				"offset": 1,
				"transform-origin": "right bottom",
				"transform": "none",
				"opacity": 1
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rotateInUpRight"
	};

/***/ },
/* 53 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform-origin": "center",
				"transform": "none",
				"opacity": 1
			},
			{
				"offset": 1,
				"transform-origin": "center",
				"transform": "rotate3d(0, 0, 1, 200deg)",
				"opacity": 0
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rotateOut"
	};

/***/ },
/* 54 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform-origin": "left bottom",
				"transform": "none",
				"opacity": 1
			},
			{
				"offset": 1,
				"transform-origin": "left bottom",
				"transform": "rotate3d(0, 0, 1, 45deg)",
				"opacity": 0
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rotateOutDownLeft"
	};

/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform-origin": "right bottom",
				"transform": "none",
				"opacity": 1
			},
			{
				"offset": 1,
				"transform-origin": "right bottom",
				"transform": "rotate3d(0, 0, 1, -45deg)",
				"opacity": 0
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rotateOutDownRight"
	};

/***/ },
/* 56 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform-origin": "left bottom",
				"transform": "none",
				"opacity": 1
			},
			{
				"offset": 1,
				"transform-origin": "left bottom",
				"transform": "rotate3d(0, 0, 1, -45deg)",
				"opacity": 0
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rotateOutUpLeft"
	};

/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform-origin": "right bottom",
				"transform": "none",
				"opacity": 1
			},
			{
				"offset": 1,
				"transform-origin": "right bottom",
				"transform": "rotate3d(0, 0, 1, 90deg)",
				"opacity": 0
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rotateOutUpRight"
	};

/***/ },
/* 58 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "scale3d(1, 1, 1)"
			},
			{
				"offset": 0.3,
				"transform": "scale3d(1.25, 0.75, 1)"
			},
			{
				"offset": 0.4,
				"transform": "scale3d(0.75, 1.25, 1)"
			},
			{
				"offset": 0.5,
				"transform": "scale3d(1.15, 0.85, 1)"
			},
			{
				"offset": 0.65,
				"transform": "scale3d(.95, 1.05, 1)"
			},
			{
				"offset": 0.75,
				"transform": "scale3d(1.05, .95, 1)"
			},
			{
				"offset": 1,
				"transform": "scale3d(1, 1, 1)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "rubberBand"
	};

/***/ },
/* 59 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "translate3d(0, 0, 0)"
			},
			{
				"offset": 0.1,
				"transform": "translate3d(-10px, 0, 0)"
			},
			{
				"offset": 0.2,
				"transform": "translate3d(10px, 0, 0)"
			},
			{
				"offset": 0.3,
				"transform": "translate3d(-10px, 0, 0)"
			},
			{
				"offset": 0.4,
				"transform": "translate3d(10px, 0, 0)"
			},
			{
				"offset": 0.5,
				"transform": "translate3d(-10px, 0, 0)"
			},
			{
				"offset": 0.6,
				"transform": "translate3d(10px, 0, 0)"
			},
			{
				"offset": 0.7,
				"transform": "translate3d(-10px, 0, 0)"
			},
			{
				"offset": 0.8,
				"transform": "translate3d(10px, 0, 0)"
			},
			{
				"offset": 0.9,
				"transform": "translate3d(-10px, 0, 0)"
			},
			{
				"offset": 1,
				"transform": "translate3d(0, 0, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "shake"
	};

/***/ },
/* 60 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "translate3d(0, -100%, 0)",
				"visibility": "hidden"
			},
			{
				"offset": 1,
				"transform": "translate3d(0, 0, 0)",
				"visibility": "visible"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "slideInDown"
	};

/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "translate3d(-100%, 0, 0)",
				"visibility": "hidden"
			},
			{
				"offset": 1,
				"transform": "translate3d(0, 0, 0)",
				"visibility": "visible"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "slideInLeft"
	};

/***/ },
/* 62 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "translate3d(100%, 0, 0)",
				"visibility": "hidden"
			},
			{
				"offset": 1,
				"transform": "translate3d(0, 0, 0)",
				"visibility": "visible"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "slideInRight"
	};

/***/ },
/* 63 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "translate3d(0, 100%, 0)",
				"visibility": "hidden"
			},
			{
				"offset": 1,
				"transform": "translate3d(0, 0, 0)",
				"visibility": "visible"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "slideInUp"
	};

/***/ },
/* 64 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "translate3d(0, 0, 0)",
				"visibility": "visible"
			},
			{
				"offset": 1,
				"visibility": "hidden",
				"transform": "translate3d(0, 100%, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "slideOutDown"
	};

/***/ },
/* 65 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"visibility": "visible",
				"transform": "translate3d(0, 0, 0)"
			},
			{
				"offset": 1,
				"visibility": "hidden",
				"transform": "translate3d(-100%, 0, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "slideOutLeft"
	};

/***/ },
/* 66 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"visibility": "visible",
				"transform": "translate3d(0, 0, 0)"
			},
			{
				"offset": 1,
				"visibility": "hidden",
				"transform": "translate3d(100%, 0, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "slideOutRight"
	};

/***/ },
/* 67 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"visibility": "visible",
				"transform": "translate3d(0, 0, 0)"
			},
			{
				"offset": 1,
				"visibility": "hidden",
				"transform": "translate3d(0, -100%, 0)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "slideOutUp"
	};

/***/ },
/* 68 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "none"
			},
			{
				"offset": 0.2,
				"transform": "rotate3d(0, 0, 1, 15deg)"
			},
			{
				"offset": 0.4,
				"transform": "rotate3d(0, 0, 1, -10deg)"
			},
			{
				"offset": 0.6,
				"transform": "rotate3d(0, 0, 1, 5deg)"
			},
			{
				"offset": 0.8,
				"transform": "rotate3d(0, 0, 1, -5deg)"
			},
			{
				"offset": 1,
				"transform": "rotate3d(0, 0, 1, 0deg)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "swing"
	};

/***/ },
/* 69 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "scale3d(1, 1, 1)"
			},
			{
				"offset": 0.1,
				"transform": "scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg)"
			},
			{
				"offset": 0.2,
				"transform": "scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg)"
			},
			{
				"offset": 0.3,
				"transform": "scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)"
			},
			{
				"offset": 0.4,
				"transform": "scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)"
			},
			{
				"offset": 0.5,
				"transform": "scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)"
			},
			{
				"offset": 0.6,
				"transform": "scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)"
			},
			{
				"offset": 0.7,
				"transform": "scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)"
			},
			{
				"offset": 0.8,
				"transform": "scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)"
			},
			{
				"offset": 0.9,
				"transform": "scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)"
			},
			{
				"offset": 1,
				"transform": "scale3d(1, 1, 1)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "tada"
	};

/***/ },
/* 70 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"transform": "none"
			},
			{
				"offset": 0.15,
				"transform": "translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg)"
			},
			{
				"offset": 0.3,
				"transform": "translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg)"
			},
			{
				"offset": 0.45,
				"transform": "translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg)"
			},
			{
				"offset": 0.6,
				"transform": "translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg)"
			},
			{
				"offset": 0.75,
				"transform": "translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg)"
			},
			{
				"offset": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "wobble"
	};

/***/ },
/* 71 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "scale3d(.3, .3, .3)"
			},
			{
				"offset": 0.5,
				"opacity": 1
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "zoomIn"
	};

/***/ },
/* 72 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "scale3d(.1, .1, .1) translate3d(0, -1000px, 0)",
				"easing": "cubic-bezier(0.550, 0.055, 0.675, 0.190)"
			},
			{
				"offset": 0.6,
				"opacity": 1,
				"transform": "scale3d(.475, .475, .475) translate3d(0, 60px, 0)",
				"easing": "cubic-bezier(0.175, 0.885, 0.320, 1)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "zoomInDown"
	};

/***/ },
/* 73 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "scale3d(.1, .1, .1) translate3d(-1000px, 0, 0)",
				"easing": "cubic-bezier(0.550, 0.055, 0.675, 0.190)"
			},
			{
				"offset": 0.6,
				"opacity": 1,
				"transform": "scale3d(.475, .475, .475) translate3d(10px, 0, 0)",
				"easing": "cubic-bezier(0.175, 0.885, 0.320, 1)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "zoomInLeft"
	};

/***/ },
/* 74 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "scale3d(.1, .1, .1) translate3d(1000px, 0, 0)",
				"easing": "cubic-bezier(0.550, 0.055, 0.675, 0.190)"
			},
			{
				"offset": 0.6,
				"opacity": 1,
				"transform": "scale3d(.475, .475, .475) translate3d(-10px, 0, 0)",
				"easing": "cubic-bezier(0.175, 0.885, 0.320, 1)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "zoomInRight"
	};

/***/ },
/* 75 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 0,
				"transform": "scale3d(.1, .1, .1) translate3d(0, 1000px, 0)",
				"easing": "cubic-bezier(0.550, 0.055, 0.675, 0.190)"
			},
			{
				"offset": 0.6,
				"opacity": 1,
				"transform": "scale3d(.475, .475, .475) translate3d(0, -60px, 0)",
				"easing": "cubic-bezier(0.175, 0.885, 0.320, 1)"
			},
			{
				"offset": 1,
				"opacity": 1,
				"transform": "none"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "zoomInUp"
	};

/***/ },
/* 76 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none",
				"transform-origin": "center middle"
			},
			{
				"offset": 0.5,
				"opacity": 0,
				"transform": "scale3d(.3, .3, .3)",
				"transform-origin": "center middle"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "none",
				"transform-origin": "center middle"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "zoomOut"
	};

/***/ },
/* 77 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none",
				"transform-origin": "center bottom"
			},
			{
				"offset": 0.4,
				"opacity": 1,
				"transform": "scale3d(.475, .475, .475) translate3d(0, -60px, 0)",
				"transform-origin": "center bottom",
				"easing": "cubic-bezier(0.550, 0.055, 0.675, 0.190)"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "scale3d(.1, .1, .1) translate3d(0, 2000px, 0)",
				"transform-origin": "center bottom",
				"easing": "cubic-bezier(0.175, 0.885, 0.320, 1)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "zoomOutDown"
	};

/***/ },
/* 78 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none",
				"transform-origin": "left center"
			},
			{
				"offset": 0.4,
				"opacity": 1,
				"transform": "scale3d(.475, .475, .475) translate3d(42px, 0, 0)"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "scale(.1) translate3d(-2000px, 0, 0)",
				"transform-origin": "left center"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "zoomOutLeft"
	};

/***/ },
/* 79 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none",
				"transform-origin": "right center"
			},
			{
				"offset": 0.4,
				"opacity": 1,
				"transform": "scale3d(.475, .475, .475) translate3d(-42px, 0, 0)"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "scale(.1) translate3d(2000px, 0, 0)",
				"transform-origin": "right center"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "zoomOutRight"
	};

/***/ },
/* 80 */
/***/ function(module, exports) {

	module.exports = {
		"keyframes": [
			{
				"offset": 0,
				"opacity": 1,
				"transform": "none",
				"transform-origin": "center bottom"
			},
			{
				"offset": 0.4,
				"opacity": 1,
				"transform": "scale3d(.475, .475, .475) translate3d(0, 60px, 0)",
				"easing": "cubic-bezier(0.550, 0.055, 0.675, 0.190)"
			},
			{
				"offset": 1,
				"opacity": 0,
				"transform": "scale3d(.1, .1, .1) translate3d(0, -2000px, 0)",
				"transform-origin": "center bottom",
				"easing": "cubic-bezier(0.175, 0.885, 0.320, 1)"
			}
		],
		"timings": {
			"duration": 1000,
			"fill": "both"
		},
		"name": "zoomOutUp"
	};

/***/ }
/******/ ]);