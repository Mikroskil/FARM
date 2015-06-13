(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {
  return function(deck) {
    var backdrops;

    function createBackdropForSlide(slide) {
      var backdropAttribute = slide.getAttribute('data-bespoke-backdrop');

      if (backdropAttribute) {
        var backdrop = document.createElement('div');
        backdrop.className = backdropAttribute;
        backdrop.classList.add('bespoke-backdrop');
        deck.parent.appendChild(backdrop);
        return backdrop;
      }
    }

    function updateClasses(el) {
      if (el) {
        var index = backdrops.indexOf(el),
          currentIndex = deck.slide();

        removeClass(el, 'active');
        removeClass(el, 'inactive');
        removeClass(el, 'before');
        removeClass(el, 'after');

        if (index !== currentIndex) {
          addClass(el, 'inactive');
          addClass(el, index < currentIndex ? 'before' : 'after');
        } else {
          addClass(el, 'active');
        }
      }
    }

    function removeClass(el, className) {
      el.classList.remove('bespoke-backdrop-' + className);
    }

    function addClass(el, className) {
      el.classList.add('bespoke-backdrop-' + className);
    }

    backdrops = deck.slides
      .map(createBackdropForSlide);

    deck.on('activate', function() {
      backdrops.forEach(updateClasses);
    });
  };
};

},{}],2:[function(require,module,exports){
module.exports = function(options) {
  return function(deck) {
    var activeSlideIndex,
      activeBulletIndex,

      bullets = deck.slides.map(function(slide) {
        return [].slice.call(slide.querySelectorAll((typeof options === 'string' ? options : '[data-bespoke-bullet]')), 0);
      }),

      next = function() {
        var nextSlideIndex = activeSlideIndex + 1;

        if (activeSlideHasBulletByOffset(1)) {
          activateBullet(activeSlideIndex, activeBulletIndex + 1);
          return false;
        } else if (bullets[nextSlideIndex]) {
          activateBullet(nextSlideIndex, 0);
        }
      },

      prev = function() {
        var prevSlideIndex = activeSlideIndex - 1;

        if (activeSlideHasBulletByOffset(-1)) {
          activateBullet(activeSlideIndex, activeBulletIndex - 1);
          return false;
        } else if (bullets[prevSlideIndex]) {
          activateBullet(prevSlideIndex, bullets[prevSlideIndex].length - 1);
        }
      },

      activateBullet = function(slideIndex, bulletIndex) {
        activeSlideIndex = slideIndex;
        activeBulletIndex = bulletIndex;

        bullets.forEach(function(slide, s) {
          slide.forEach(function(bullet, b) {
            bullet.classList.add('bespoke-bullet');

            if (s < slideIndex || s === slideIndex && b <= bulletIndex) {
              bullet.classList.add('bespoke-bullet-active');
              bullet.classList.remove('bespoke-bullet-inactive');
            } else {
              bullet.classList.add('bespoke-bullet-inactive');
              bullet.classList.remove('bespoke-bullet-active');
            }

            if (s === slideIndex && b === bulletIndex) {
              bullet.classList.add('bespoke-bullet-current');
            } else {
              bullet.classList.remove('bespoke-bullet-current');
            }
          });
        });
      },

      activeSlideHasBulletByOffset = function(offset) {
        return bullets[activeSlideIndex][activeBulletIndex + offset] !== undefined;
      };

    deck.on('next', next);
    deck.on('prev', prev);

    deck.on('slide', function(e) {
      activateBullet(e.index, 0);
    });

    activateBullet(0, 0);
  };
};

},{}],3:[function(require,module,exports){
module.exports = function() {
  return function(deck) {
    var parseHash = function() {
      var hash = window.location.hash.slice(1),
        slideNumberOrName = parseInt(hash, 10);

      if (hash) {
        if (slideNumberOrName) {
          activateSlide(slideNumberOrName - 1);
        } else {
          deck.slides.forEach(function(slide, i) {
            if (slide.getAttribute('data-bespoke-hash') === hash) {
              activateSlide(i);
            }
          });
        }
      }
    };

    var activateSlide = function(index) {
      var indexToActivate = -1 < index && index < deck.slides.length ? index : 0;
      if (indexToActivate !== deck.slide()) {
        deck.slide(indexToActivate);
      }
    };

    setTimeout(function() {
      parseHash();

      deck.on('activate', function(e) {
        var slideName = e.slide.getAttribute('data-bespoke-hash');
        window.location.hash = slideName || e.index + 1;
      });

      window.addEventListener('hashchange', parseHash);
    }, 0);
  };
};

},{}],4:[function(require,module,exports){
module.exports = function(options) {
  return function(deck) {
    var isHorizontal = options !== 'vertical';

    document.addEventListener('keydown', function(e) {
      if (e.which == 34 || // PAGE DOWN
        e.which == 32 || // SPACE
        (isHorizontal && e.which == 39) || // RIGHT
        (!isHorizontal && e.which == 40) // DOWN
      ) { deck.next(); }

      if (e.which == 33 || // PAGE UP
        (isHorizontal && e.which == 37) || // LEFT
        (!isHorizontal && e.which == 38) // UP
      ) { deck.prev(); }
    });
  };
};

},{}],5:[function(require,module,exports){
module.exports = function(options) {
  return function (deck) {
    var progressParent = document.createElement('div'),
      progressBar = document.createElement('div'),
      prop = options === 'vertical' ? 'height' : 'width';

    progressParent.className = 'bespoke-progress-parent';
    progressBar.className = 'bespoke-progress-bar';
    progressParent.appendChild(progressBar);
    deck.parent.appendChild(progressParent);

    deck.on('activate', function(e) {
      progressBar.style[prop] = (e.index * 100 / (deck.slides.length - 1)) + '%';
    });
  };
};

},{}],6:[function(require,module,exports){
module.exports = function(options) {
  return function(deck) {
    var parent = deck.parent,
      firstSlide = deck.slides[0],
      slideHeight = firstSlide.offsetHeight,
      slideWidth = firstSlide.offsetWidth,
      useZoom = options === 'zoom' || ('zoom' in parent.style && options !== 'transform'),

      wrap = function(element) {
        var wrapper = document.createElement('div');
        wrapper.className = 'bespoke-scale-parent';
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
        return wrapper;
      },

      elements = useZoom ? deck.slides : deck.slides.map(wrap),

      transformProperty = (function(property) {
        var prefixes = 'Moz Webkit O ms'.split(' ');
        return prefixes.reduce(function(currentProperty, prefix) {
            return prefix + property in parent.style ? prefix + property : currentProperty;
          }, property.toLowerCase());
      }('Transform')),

      scale = useZoom ?
        function(ratio, element) {
          element.style.zoom = ratio;
        } :
        function(ratio, element) {
          element.style[transformProperty] = 'scale(' + ratio + ')';
        },

      scaleAll = function() {
        var xScale = parent.offsetWidth / slideWidth,
          yScale = parent.offsetHeight / slideHeight;

        elements.forEach(scale.bind(null, Math.min(xScale, yScale)));
      };

    window.addEventListener('resize', scaleAll);
    scaleAll();
  };

};

},{}],7:[function(require,module,exports){
(function (global){
/*!
 * bespoke-theme-cube v2.0.1
 *
 * Copyright 2014, Mark Dalgleish
 * This content is released under the MIT license
 * http://mit-license.org/markdalgleish
 */

!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self);var f=o;f=f.bespoke||(f.bespoke={}),f=f.themes||(f.themes={}),f.cube=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

var classes = _dereq_('bespoke-classes');
var insertCss = _dereq_('insert-css');

module.exports = function() {
  var css = "*{-moz-box-sizing:border-box;box-sizing:border-box;margin:0;padding:0}@media print{*{-webkit-print-color-adjust:exact}}@page{size:landscape;margin:0}.bespoke-parent{-webkit-transition:background .6s ease;transition:background .6s ease;position:absolute;top:0;bottom:0;left:0;right:0;overflow:hidden}@media print{.bespoke-parent{overflow:visible;position:static}}.bespoke-theme-cube-slide-parent{position:absolute;top:0;left:0;right:0;bottom:0;-webkit-perspective:600px;perspective:600px;pointer-events:none}.bespoke-slide{pointer-events:auto;-webkit-transition:-webkit-transform .6s ease,opacity .6s ease,background .6s ease;transition:transform .6s ease,opacity .6s ease,background .6s ease;-webkit-transform-origin:50% 50% 0;transform-origin:50% 50% 0;-webkit-backface-visibility:hidden;backface-visibility:hidden;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;text-align:center;width:640px;height:480px;position:absolute;top:50%;margin-top:-240px;left:50%;margin-left:-320px;background:#eaeaea;padding:40px;border-radius:0}@media print{.bespoke-slide{zoom:1!important;height:743px;width:100%;page-break-before:always;position:static;margin:0;-webkit-transition:none;transition:none}}.bespoke-before{-webkit-transform:translateX(100px)translateX(-320px)rotateY(-90deg)translateX(-320px);transform:translateX(100px)translateX(-320px)rotateY(-90deg)translateX(-320px)}@media print{.bespoke-before{-webkit-transform:none;transform:none}}.bespoke-after{-webkit-transform:translateX(-100px)translateX(320px)rotateY(90deg)translateX(320px);transform:translateX(-100px)translateX(320px)rotateY(90deg)translateX(320px)}@media print{.bespoke-after{-webkit-transform:none;transform:none}}.bespoke-inactive{opacity:0;pointer-events:none}@media print{.bespoke-inactive{opacity:1}}.bespoke-active{opacity:1}.bespoke-bullet{-webkit-transition:all .3s ease;transition:all .3s ease}@media print{.bespoke-bullet{-webkit-transition:none;transition:none}}.bespoke-bullet-inactive{opacity:0}li.bespoke-bullet-inactive{-webkit-transform:translateX(16px);transform:translateX(16px)}@media print{li.bespoke-bullet-inactive{-webkit-transform:none;transform:none}}@media print{.bespoke-bullet-inactive{opacity:1}}.bespoke-bullet-active{opacity:1}.bespoke-scale-parent{-webkit-perspective:600px;perspective:600px;position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none}.bespoke-scale-parent .bespoke-active{pointer-events:auto}@media print{.bespoke-scale-parent{-webkit-transform:none!important;transform:none!important}}.bespoke-progress-parent{position:absolute;top:0;left:0;right:0;height:2px}@media only screen and (min-width:1366px){.bespoke-progress-parent{height:4px}}@media print{.bespoke-progress-parent{display:none}}.bespoke-progress-bar{-webkit-transition:width .6s ease;transition:width .6s ease;position:absolute;height:100%;background:#0089f3;border-radius:0 4px 4px 0}.emphatic{background:#eaeaea}.bespoke-backdrop{position:absolute;top:0;left:0;right:0;bottom:0;-webkit-transform:translateZ(0);transform:translateZ(0);-webkit-transition:opacity .6s ease;transition:opacity .6s ease;opacity:0;z-index:-1}.bespoke-backdrop-active{opacity:1}pre{padding:26px!important;border-radius:8px}body{font-family:helvetica,arial,sans-serif;font-size:18px;color:#404040}h1{font-size:72px;line-height:82px;letter-spacing:-2px;margin-bottom:16px}h2{font-size:42px;letter-spacing:-1px;margin-bottom:8px}h3{font-size:24px;font-weight:400;margin-bottom:24px;color:#606060}hr{visibility:hidden;height:20px}ul{list-style:none}li{margin-bottom:12px}p{margin:0 100px 12px;line-height:22px}a{color:#0089f3;text-decoration:none}";
  insertCss(css, { prepend: true });

  return function(deck) {
    classes()(deck);

    var wrap = function(element) {
      var wrapper = document.createElement('div');
      wrapper.className = 'bespoke-theme-cube-slide-parent';
      element.parentNode.insertBefore(wrapper, element);
      wrapper.appendChild(element);
    };

    deck.slides.forEach(wrap);
  };
};

},{"bespoke-classes":2,"insert-css":3}],2:[function(_dereq_,module,exports){
module.exports = function() {
  return function(deck) {
    var addClass = function(el, cls) {
        el.classList.add('bespoke-' + cls);
      },

      removeClass = function(el, cls) {
        el.className = el.className
          .replace(new RegExp('bespoke-' + cls +'(\\s|$)', 'g'), ' ')
          .trim();
      },

      deactivate = function(el, index) {
        var activeSlide = deck.slides[deck.slide()],
          offset = index - deck.slide(),
          offsetClass = offset > 0 ? 'after' : 'before';

        ['before(-\\d+)?', 'after(-\\d+)?', 'active', 'inactive'].map(removeClass.bind(null, el));

        if (el !== activeSlide) {
          ['inactive', offsetClass, offsetClass + '-' + Math.abs(offset)].map(addClass.bind(null, el));
        }
      };

    addClass(deck.parent, 'parent');
    deck.slides.map(function(el) { addClass(el, 'slide'); });

    deck.on('activate', function(e) {
      deck.slides.map(deactivate);
      addClass(e.slide, 'active');
      removeClass(e.slide, 'inactive');
    });
  };
};

},{}],3:[function(_dereq_,module,exports){
var inserted = {};

module.exports = function (css, options) {
    if (inserted[css]) return;
    inserted[css] = true;
    
    var elem = document.createElement('style');
    elem.setAttribute('type', 'text/css');

    if ('textContent' in elem) {
      elem.textContent = css;
    } else {
      elem.styleSheet.cssText = css;
    }
    
    var head = document.getElementsByTagName('head')[0];
    if (options && options.prepend) {
        head.insertBefore(elem, head.childNodes[0]);
    } else {
        head.appendChild(elem);
    }
};

},{}]},{},[1])
(1)
});
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
module.exports = function(options) {
  return function(deck) {
    var axis = options == 'vertical' ? 'Y' : 'X',
      startPosition,
      delta;

    deck.parent.addEventListener('touchstart', function(e) {
      if (e.touches.length == 1) {
        startPosition = e.touches[0]['page' + axis];
        delta = 0;
      }
    });

    deck.parent.addEventListener('touchmove', function(e) {
      if (e.touches.length == 1) {
        e.preventDefault();
        delta = e.touches[0]['page' + axis] - startPosition;
      }
    });

    deck.parent.addEventListener('touchend', function() {
      if (Math.abs(delta) > 50) {
        deck[delta > 0 ? 'prev' : 'next']();
      }
    });
  };
};

},{}],9:[function(require,module,exports){
var from = function(selectorOrElement, plugins) {
  var parent = selectorOrElement.nodeType === 1 ? selectorOrElement : document.querySelector(selectorOrElement),
    slides = [].filter.call(parent.children, function(el) { return el.nodeName !== 'SCRIPT'; }),
    activeSlide = slides[0],
    listeners = {},

    activate = function(index, customData) {
      if (!slides[index]) {
        return;
      }

      fire('deactivate', createEventData(activeSlide, customData));
      activeSlide = slides[index];
      fire('activate', createEventData(activeSlide, customData));
    },

    slide = function(index, customData) {
      if (arguments.length) {
        fire('slide', createEventData(slides[index], customData)) && activate(index, customData);
      } else {
        return slides.indexOf(activeSlide);
      }
    },

    step = function(offset, customData) {
      var slideIndex = slides.indexOf(activeSlide) + offset;

      fire(offset > 0 ? 'next' : 'prev', createEventData(activeSlide, customData)) && activate(slideIndex, customData);
    },

    on = function(eventName, callback) {
      (listeners[eventName] || (listeners[eventName] = [])).push(callback);

      return function() {
        listeners[eventName] = listeners[eventName].filter(function(listener) {
          return listener !== callback;
        });
      };
    },

    fire = function(eventName, eventData) {
      return (listeners[eventName] || [])
        .reduce(function(notCancelled, callback) {
          return notCancelled && callback(eventData) !== false;
        }, true);
    },

    createEventData = function(el, eventData) {
      eventData = eventData || {};
      eventData.index = slides.indexOf(el);
      eventData.slide = el;
      return eventData;
    },

    deck = {
      on: on,
      fire: fire,
      slide: slide,
      next: step.bind(null, 1),
      prev: step.bind(null, -1),
      parent: parent,
      slides: slides
    };

  (plugins || []).forEach(function(plugin) {
    plugin(deck);
  });

  activate(0);

  return deck;
};

module.exports = {
  from: from
};

},{}],10:[function(require,module,exports){
// Require Node modules in the browser thanks to Browserify: http://browserify.org
var bespoke = require('bespoke'),
  cube = require('bespoke-theme-cube'),
  keys = require('bespoke-keys'),
  touch = require('bespoke-touch'),
  bullets = require('bespoke-bullets'),
  backdrop = require('bespoke-backdrop'),
  scale = require('bespoke-scale'),
  hash = require('bespoke-hash'),
  progress = require('bespoke-progress');

// Bespoke.js
bespoke.from('article', [
  cube(),
  keys(),
  touch(),
  bullets('li, .bullet'),
  backdrop(),
  scale(),
  hash(),
  progress()
]);

},{"bespoke":9,"bespoke-backdrop":1,"bespoke-bullets":2,"bespoke-hash":3,"bespoke-keys":4,"bespoke-progress":5,"bespoke-scale":6,"bespoke-theme-cube":7,"bespoke-touch":8}]},{},[10])
<<<<<<< HEAD
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFx0a3BwbF8yXFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJEOi90a3BwbF8yL25vZGVfbW9kdWxlcy9iZXNwb2tlLWJhY2tkcm9wL2xpYi9iZXNwb2tlLWJhY2tkcm9wLmpzIiwiRDovdGtwcGxfMi9ub2RlX21vZHVsZXMvYmVzcG9rZS1idWxsZXRzL2xpYi9iZXNwb2tlLWJ1bGxldHMuanMiLCJEOi90a3BwbF8yL25vZGVfbW9kdWxlcy9iZXNwb2tlLWhhc2gvbGliL2Jlc3Bva2UtaGFzaC5qcyIsIkQ6L3RrcHBsXzIvbm9kZV9tb2R1bGVzL2Jlc3Bva2Uta2V5cy9saWIvYmVzcG9rZS1rZXlzLmpzIiwiRDovdGtwcGxfMi9ub2RlX21vZHVsZXMvYmVzcG9rZS1wcm9ncmVzcy9saWIvYmVzcG9rZS1wcm9ncmVzcy5qcyIsIkQ6L3RrcHBsXzIvbm9kZV9tb2R1bGVzL2Jlc3Bva2Utc2NhbGUvbGliL2Jlc3Bva2Utc2NhbGUuanMiLCJEOi90a3BwbF8yL25vZGVfbW9kdWxlcy9iZXNwb2tlLXRoZW1lLWN1YmUvZGlzdC9iZXNwb2tlLXRoZW1lLWN1YmUuanMiLCJEOi90a3BwbF8yL25vZGVfbW9kdWxlcy9iZXNwb2tlLXRvdWNoL2xpYi9iZXNwb2tlLXRvdWNoLmpzIiwiRDovdGtwcGxfMi9ub2RlX21vZHVsZXMvYmVzcG9rZS9saWIvYmVzcG9rZS5qcyIsIkQ6L3RrcHBsXzIvc3JjL3NjcmlwdHMvZmFrZV84YmRiNTEyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbihkZWNrKSB7XG4gICAgdmFyIGJhY2tkcm9wcztcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUJhY2tkcm9wRm9yU2xpZGUoc2xpZGUpIHtcbiAgICAgIHZhciBiYWNrZHJvcEF0dHJpYnV0ZSA9IHNsaWRlLmdldEF0dHJpYnV0ZSgnZGF0YS1iZXNwb2tlLWJhY2tkcm9wJyk7XG5cbiAgICAgIGlmIChiYWNrZHJvcEF0dHJpYnV0ZSkge1xuICAgICAgICB2YXIgYmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYmFja2Ryb3AuY2xhc3NOYW1lID0gYmFja2Ryb3BBdHRyaWJ1dGU7XG4gICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5hZGQoJ2Jlc3Bva2UtYmFja2Ryb3AnKTtcbiAgICAgICAgZGVjay5wYXJlbnQuYXBwZW5kQ2hpbGQoYmFja2Ryb3ApO1xuICAgICAgICByZXR1cm4gYmFja2Ryb3A7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQ2xhc3NlcyhlbCkge1xuICAgICAgaWYgKGVsKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGJhY2tkcm9wcy5pbmRleE9mKGVsKSxcbiAgICAgICAgICBjdXJyZW50SW5kZXggPSBkZWNrLnNsaWRlKCk7XG5cbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWwsICdhY3RpdmUnKTtcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWwsICdpbmFjdGl2ZScpO1xuICAgICAgICByZW1vdmVDbGFzcyhlbCwgJ2JlZm9yZScpO1xuICAgICAgICByZW1vdmVDbGFzcyhlbCwgJ2FmdGVyJyk7XG5cbiAgICAgICAgaWYgKGluZGV4ICE9PSBjdXJyZW50SW5kZXgpIHtcbiAgICAgICAgICBhZGRDbGFzcyhlbCwgJ2luYWN0aXZlJyk7XG4gICAgICAgICAgYWRkQ2xhc3MoZWwsIGluZGV4IDwgY3VycmVudEluZGV4ID8gJ2JlZm9yZScgOiAnYWZ0ZXInKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZGRDbGFzcyhlbCwgJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWwsIGNsYXNzTmFtZSkge1xuICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnYmVzcG9rZS1iYWNrZHJvcC0nICsgY2xhc3NOYW1lKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRDbGFzcyhlbCwgY2xhc3NOYW1lKSB7XG4gICAgICBlbC5jbGFzc0xpc3QuYWRkKCdiZXNwb2tlLWJhY2tkcm9wLScgKyBjbGFzc05hbWUpO1xuICAgIH1cblxuICAgIGJhY2tkcm9wcyA9IGRlY2suc2xpZGVzXG4gICAgICAubWFwKGNyZWF0ZUJhY2tkcm9wRm9yU2xpZGUpO1xuXG4gICAgZGVjay5vbignYWN0aXZhdGUnLCBmdW5jdGlvbigpIHtcbiAgICAgIGJhY2tkcm9wcy5mb3JFYWNoKHVwZGF0ZUNsYXNzZXMpO1xuICAgIH0pO1xuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICByZXR1cm4gZnVuY3Rpb24oZGVjaykge1xuICAgIHZhciBhY3RpdmVTbGlkZUluZGV4LFxuICAgICAgYWN0aXZlQnVsbGV0SW5kZXgsXG5cbiAgICAgIGJ1bGxldHMgPSBkZWNrLnNsaWRlcy5tYXAoZnVuY3Rpb24oc2xpZGUpIHtcbiAgICAgICAgcmV0dXJuIFtdLnNsaWNlLmNhbGwoc2xpZGUucXVlcnlTZWxlY3RvckFsbCgodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnID8gb3B0aW9ucyA6ICdbZGF0YS1iZXNwb2tlLWJ1bGxldF0nKSksIDApO1xuICAgICAgfSksXG5cbiAgICAgIG5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5leHRTbGlkZUluZGV4ID0gYWN0aXZlU2xpZGVJbmRleCArIDE7XG5cbiAgICAgICAgaWYgKGFjdGl2ZVNsaWRlSGFzQnVsbGV0QnlPZmZzZXQoMSkpIHtcbiAgICAgICAgICBhY3RpdmF0ZUJ1bGxldChhY3RpdmVTbGlkZUluZGV4LCBhY3RpdmVCdWxsZXRJbmRleCArIDEpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChidWxsZXRzW25leHRTbGlkZUluZGV4XSkge1xuICAgICAgICAgIGFjdGl2YXRlQnVsbGV0KG5leHRTbGlkZUluZGV4LCAwKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgcHJldiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJldlNsaWRlSW5kZXggPSBhY3RpdmVTbGlkZUluZGV4IC0gMTtcblxuICAgICAgICBpZiAoYWN0aXZlU2xpZGVIYXNCdWxsZXRCeU9mZnNldCgtMSkpIHtcbiAgICAgICAgICBhY3RpdmF0ZUJ1bGxldChhY3RpdmVTbGlkZUluZGV4LCBhY3RpdmVCdWxsZXRJbmRleCAtIDEpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChidWxsZXRzW3ByZXZTbGlkZUluZGV4XSkge1xuICAgICAgICAgIGFjdGl2YXRlQnVsbGV0KHByZXZTbGlkZUluZGV4LCBidWxsZXRzW3ByZXZTbGlkZUluZGV4XS5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgYWN0aXZhdGVCdWxsZXQgPSBmdW5jdGlvbihzbGlkZUluZGV4LCBidWxsZXRJbmRleCkge1xuICAgICAgICBhY3RpdmVTbGlkZUluZGV4ID0gc2xpZGVJbmRleDtcbiAgICAgICAgYWN0aXZlQnVsbGV0SW5kZXggPSBidWxsZXRJbmRleDtcblxuICAgICAgICBidWxsZXRzLmZvckVhY2goZnVuY3Rpb24oc2xpZGUsIHMpIHtcbiAgICAgICAgICBzbGlkZS5mb3JFYWNoKGZ1bmN0aW9uKGJ1bGxldCwgYikge1xuICAgICAgICAgICAgYnVsbGV0LmNsYXNzTGlzdC5hZGQoJ2Jlc3Bva2UtYnVsbGV0Jyk7XG5cbiAgICAgICAgICAgIGlmIChzIDwgc2xpZGVJbmRleCB8fCBzID09PSBzbGlkZUluZGV4ICYmIGIgPD0gYnVsbGV0SW5kZXgpIHtcbiAgICAgICAgICAgICAgYnVsbGV0LmNsYXNzTGlzdC5hZGQoJ2Jlc3Bva2UtYnVsbGV0LWFjdGl2ZScpO1xuICAgICAgICAgICAgICBidWxsZXQuY2xhc3NMaXN0LnJlbW92ZSgnYmVzcG9rZS1idWxsZXQtaW5hY3RpdmUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGJ1bGxldC5jbGFzc0xpc3QuYWRkKCdiZXNwb2tlLWJ1bGxldC1pbmFjdGl2ZScpO1xuICAgICAgICAgICAgICBidWxsZXQuY2xhc3NMaXN0LnJlbW92ZSgnYmVzcG9rZS1idWxsZXQtYWN0aXZlJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzID09PSBzbGlkZUluZGV4ICYmIGIgPT09IGJ1bGxldEluZGV4KSB7XG4gICAgICAgICAgICAgIGJ1bGxldC5jbGFzc0xpc3QuYWRkKCdiZXNwb2tlLWJ1bGxldC1jdXJyZW50Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBidWxsZXQuY2xhc3NMaXN0LnJlbW92ZSgnYmVzcG9rZS1idWxsZXQtY3VycmVudCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIGFjdGl2ZVNsaWRlSGFzQnVsbGV0QnlPZmZzZXQgPSBmdW5jdGlvbihvZmZzZXQpIHtcbiAgICAgICAgcmV0dXJuIGJ1bGxldHNbYWN0aXZlU2xpZGVJbmRleF1bYWN0aXZlQnVsbGV0SW5kZXggKyBvZmZzZXRdICE9PSB1bmRlZmluZWQ7XG4gICAgICB9O1xuXG4gICAgZGVjay5vbignbmV4dCcsIG5leHQpO1xuICAgIGRlY2sub24oJ3ByZXYnLCBwcmV2KTtcblxuICAgIGRlY2sub24oJ3NsaWRlJywgZnVuY3Rpb24oZSkge1xuICAgICAgYWN0aXZhdGVCdWxsZXQoZS5pbmRleCwgMCk7XG4gICAgfSk7XG5cbiAgICBhY3RpdmF0ZUJ1bGxldCgwLCAwKTtcbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24oZGVjaykge1xuICAgIHZhciBwYXJzZUhhc2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2guc2xpY2UoMSksXG4gICAgICAgIHNsaWRlTnVtYmVyT3JOYW1lID0gcGFyc2VJbnQoaGFzaCwgMTApO1xuXG4gICAgICBpZiAoaGFzaCkge1xuICAgICAgICBpZiAoc2xpZGVOdW1iZXJPck5hbWUpIHtcbiAgICAgICAgICBhY3RpdmF0ZVNsaWRlKHNsaWRlTnVtYmVyT3JOYW1lIC0gMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVjay5zbGlkZXMuZm9yRWFjaChmdW5jdGlvbihzbGlkZSwgaSkge1xuICAgICAgICAgICAgaWYgKHNsaWRlLmdldEF0dHJpYnV0ZSgnZGF0YS1iZXNwb2tlLWhhc2gnKSA9PT0gaGFzaCkge1xuICAgICAgICAgICAgICBhY3RpdmF0ZVNsaWRlKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBhY3RpdmF0ZVNsaWRlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHZhciBpbmRleFRvQWN0aXZhdGUgPSAtMSA8IGluZGV4ICYmIGluZGV4IDwgZGVjay5zbGlkZXMubGVuZ3RoID8gaW5kZXggOiAwO1xuICAgICAgaWYgKGluZGV4VG9BY3RpdmF0ZSAhPT0gZGVjay5zbGlkZSgpKSB7XG4gICAgICAgIGRlY2suc2xpZGUoaW5kZXhUb0FjdGl2YXRlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHBhcnNlSGFzaCgpO1xuXG4gICAgICBkZWNrLm9uKCdhY3RpdmF0ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHNsaWRlTmFtZSA9IGUuc2xpZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWJlc3Bva2UtaGFzaCcpO1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IHNsaWRlTmFtZSB8fCBlLmluZGV4ICsgMTtcbiAgICAgIH0pO1xuXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIHBhcnNlSGFzaCk7XG4gICAgfSwgMCk7XG4gIH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbihkZWNrKSB7XG4gICAgdmFyIGlzSG9yaXpvbnRhbCA9IG9wdGlvbnMgIT09ICd2ZXJ0aWNhbCc7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKGUud2hpY2ggPT0gMzQgfHwgLy8gUEFHRSBET1dOXG4gICAgICAgIGUud2hpY2ggPT0gMzIgfHwgLy8gU1BBQ0VcbiAgICAgICAgKGlzSG9yaXpvbnRhbCAmJiBlLndoaWNoID09IDM5KSB8fCAvLyBSSUdIVFxuICAgICAgICAoIWlzSG9yaXpvbnRhbCAmJiBlLndoaWNoID09IDQwKSAvLyBET1dOXG4gICAgICApIHsgZGVjay5uZXh0KCk7IH1cblxuICAgICAgaWYgKGUud2hpY2ggPT0gMzMgfHwgLy8gUEFHRSBVUFxuICAgICAgICAoaXNIb3Jpem9udGFsICYmIGUud2hpY2ggPT0gMzcpIHx8IC8vIExFRlRcbiAgICAgICAgKCFpc0hvcml6b250YWwgJiYgZS53aGljaCA9PSAzOCkgLy8gVVBcbiAgICAgICkgeyBkZWNrLnByZXYoKTsgfVxuICAgIH0pO1xuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICByZXR1cm4gZnVuY3Rpb24gKGRlY2spIHtcbiAgICB2YXIgcHJvZ3Jlc3NQYXJlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgIHByb2dyZXNzQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICBwcm9wID0gb3B0aW9ucyA9PT0gJ3ZlcnRpY2FsJyA/ICdoZWlnaHQnIDogJ3dpZHRoJztcblxuICAgIHByb2dyZXNzUGFyZW50LmNsYXNzTmFtZSA9ICdiZXNwb2tlLXByb2dyZXNzLXBhcmVudCc7XG4gICAgcHJvZ3Jlc3NCYXIuY2xhc3NOYW1lID0gJ2Jlc3Bva2UtcHJvZ3Jlc3MtYmFyJztcbiAgICBwcm9ncmVzc1BhcmVudC5hcHBlbmRDaGlsZChwcm9ncmVzc0Jhcik7XG4gICAgZGVjay5wYXJlbnQuYXBwZW5kQ2hpbGQocHJvZ3Jlc3NQYXJlbnQpO1xuXG4gICAgZGVjay5vbignYWN0aXZhdGUnLCBmdW5jdGlvbihlKSB7XG4gICAgICBwcm9ncmVzc0Jhci5zdHlsZVtwcm9wXSA9IChlLmluZGV4ICogMTAwIC8gKGRlY2suc2xpZGVzLmxlbmd0aCAtIDEpKSArICclJztcbiAgICB9KTtcbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRlY2spIHtcbiAgICB2YXIgcGFyZW50ID0gZGVjay5wYXJlbnQsXG4gICAgICBmaXJzdFNsaWRlID0gZGVjay5zbGlkZXNbMF0sXG4gICAgICBzbGlkZUhlaWdodCA9IGZpcnN0U2xpZGUub2Zmc2V0SGVpZ2h0LFxuICAgICAgc2xpZGVXaWR0aCA9IGZpcnN0U2xpZGUub2Zmc2V0V2lkdGgsXG4gICAgICB1c2Vab29tID0gb3B0aW9ucyA9PT0gJ3pvb20nIHx8ICgnem9vbScgaW4gcGFyZW50LnN0eWxlICYmIG9wdGlvbnMgIT09ICd0cmFuc2Zvcm0nKSxcblxuICAgICAgd3JhcCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgd3JhcHBlci5jbGFzc05hbWUgPSAnYmVzcG9rZS1zY2FsZS1wYXJlbnQnO1xuICAgICAgICBlbGVtZW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHdyYXBwZXIsIGVsZW1lbnQpO1xuICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gd3JhcHBlcjtcbiAgICAgIH0sXG5cbiAgICAgIGVsZW1lbnRzID0gdXNlWm9vbSA/IGRlY2suc2xpZGVzIDogZGVjay5zbGlkZXMubWFwKHdyYXApLFxuXG4gICAgICB0cmFuc2Zvcm1Qcm9wZXJ0eSA9IChmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgICAgICB2YXIgcHJlZml4ZXMgPSAnTW96IFdlYmtpdCBPIG1zJy5zcGxpdCgnICcpO1xuICAgICAgICByZXR1cm4gcHJlZml4ZXMucmVkdWNlKGZ1bmN0aW9uKGN1cnJlbnRQcm9wZXJ0eSwgcHJlZml4KSB7XG4gICAgICAgICAgICByZXR1cm4gcHJlZml4ICsgcHJvcGVydHkgaW4gcGFyZW50LnN0eWxlID8gcHJlZml4ICsgcHJvcGVydHkgOiBjdXJyZW50UHJvcGVydHk7XG4gICAgICAgICAgfSwgcHJvcGVydHkudG9Mb3dlckNhc2UoKSk7XG4gICAgICB9KCdUcmFuc2Zvcm0nKSksXG5cbiAgICAgIHNjYWxlID0gdXNlWm9vbSA/XG4gICAgICAgIGZ1bmN0aW9uKHJhdGlvLCBlbGVtZW50KSB7XG4gICAgICAgICAgZWxlbWVudC5zdHlsZS56b29tID0gcmF0aW87XG4gICAgICAgIH0gOlxuICAgICAgICBmdW5jdGlvbihyYXRpbywgZWxlbWVudCkge1xuICAgICAgICAgIGVsZW1lbnQuc3R5bGVbdHJhbnNmb3JtUHJvcGVydHldID0gJ3NjYWxlKCcgKyByYXRpbyArICcpJztcbiAgICAgICAgfSxcblxuICAgICAgc2NhbGVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHhTY2FsZSA9IHBhcmVudC5vZmZzZXRXaWR0aCAvIHNsaWRlV2lkdGgsXG4gICAgICAgICAgeVNjYWxlID0gcGFyZW50Lm9mZnNldEhlaWdodCAvIHNsaWRlSGVpZ2h0O1xuXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goc2NhbGUuYmluZChudWxsLCBNYXRoLm1pbih4U2NhbGUsIHlTY2FsZSkpKTtcbiAgICAgIH07XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2NhbGVBbGwpO1xuICAgIHNjYWxlQWxsKCk7XG4gIH07XG5cbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vKiFcbiAqIGJlc3Bva2UtdGhlbWUtY3ViZSB2Mi4wLjFcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNCwgTWFyayBEYWxnbGVpc2hcbiAqIFRoaXMgY29udGVudCBpcyByZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqIGh0dHA6Ly9taXQtbGljZW5zZS5vcmcvbWFya2RhbGdsZWlzaFxuICovXG5cbiFmdW5jdGlvbihlKXtpZihcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyltb2R1bGUuZXhwb3J0cz1lKCk7ZWxzZSBpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQpZGVmaW5lKGUpO2Vsc2V7dmFyIG87XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz9vPXdpbmRvdzpcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP289Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmJiYobz1zZWxmKTt2YXIgZj1vO2Y9Zi5iZXNwb2tlfHwoZi5iZXNwb2tlPXt9KSxmPWYudGhlbWVzfHwoZi50aGVtZXM9e30pLGYuY3ViZT1lKCl9fShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcblxudmFyIGNsYXNzZXMgPSBfZGVyZXFfKCdiZXNwb2tlLWNsYXNzZXMnKTtcbnZhciBpbnNlcnRDc3MgPSBfZGVyZXFfKCdpbnNlcnQtY3NzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjc3MgPSBcIip7LW1vei1ib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym94LXNpemluZzpib3JkZXItYm94O21hcmdpbjowO3BhZGRpbmc6MH1AbWVkaWEgcHJpbnR7Knstd2Via2l0LXByaW50LWNvbG9yLWFkanVzdDpleGFjdH19QHBhZ2V7c2l6ZTpsYW5kc2NhcGU7bWFyZ2luOjB9LmJlc3Bva2UtcGFyZW50ey13ZWJraXQtdHJhbnNpdGlvbjpiYWNrZ3JvdW5kIC42cyBlYXNlO3RyYW5zaXRpb246YmFja2dyb3VuZCAuNnMgZWFzZTtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtib3R0b206MDtsZWZ0OjA7cmlnaHQ6MDtvdmVyZmxvdzpoaWRkZW59QG1lZGlhIHByaW50ey5iZXNwb2tlLXBhcmVudHtvdmVyZmxvdzp2aXNpYmxlO3Bvc2l0aW9uOnN0YXRpY319LmJlc3Bva2UtdGhlbWUtY3ViZS1zbGlkZS1wYXJlbnR7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO3JpZ2h0OjA7Ym90dG9tOjA7LXdlYmtpdC1wZXJzcGVjdGl2ZTo2MDBweDtwZXJzcGVjdGl2ZTo2MDBweDtwb2ludGVyLWV2ZW50czpub25lfS5iZXNwb2tlLXNsaWRle3BvaW50ZXItZXZlbnRzOmF1dG87LXdlYmtpdC10cmFuc2l0aW9uOi13ZWJraXQtdHJhbnNmb3JtIC42cyBlYXNlLG9wYWNpdHkgLjZzIGVhc2UsYmFja2dyb3VuZCAuNnMgZWFzZTt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuNnMgZWFzZSxvcGFjaXR5IC42cyBlYXNlLGJhY2tncm91bmQgLjZzIGVhc2U7LXdlYmtpdC10cmFuc2Zvcm0tb3JpZ2luOjUwJSA1MCUgMDt0cmFuc2Zvcm0tb3JpZ2luOjUwJSA1MCUgMDstd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6aGlkZGVuO2JhY2tmYWNlLXZpc2liaWxpdHk6aGlkZGVuO2Rpc3BsYXk6LXdlYmtpdC1ib3g7ZGlzcGxheTotd2Via2l0LWZsZXg7ZGlzcGxheTotbXMtZmxleGJveDtkaXNwbGF5OmZsZXg7LXdlYmtpdC1ib3gtb3JpZW50OnZlcnRpY2FsOy13ZWJraXQtYm94LWRpcmVjdGlvbjpub3JtYWw7LXdlYmtpdC1mbGV4LWRpcmVjdGlvbjpjb2x1bW47LW1zLWZsZXgtZGlyZWN0aW9uOmNvbHVtbjtmbGV4LWRpcmVjdGlvbjpjb2x1bW47LXdlYmtpdC1ib3gtcGFjazpjZW50ZXI7LXdlYmtpdC1qdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOy1tcy1mbGV4LXBhY2s6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7LXdlYmtpdC1ib3gtYWxpZ246Y2VudGVyOy13ZWJraXQtYWxpZ24taXRlbXM6Y2VudGVyOy1tcy1mbGV4LWFsaWduOmNlbnRlcjthbGlnbi1pdGVtczpjZW50ZXI7dGV4dC1hbGlnbjpjZW50ZXI7d2lkdGg6NjQwcHg7aGVpZ2h0OjQ4MHB4O3Bvc2l0aW9uOmFic29sdXRlO3RvcDo1MCU7bWFyZ2luLXRvcDotMjQwcHg7bGVmdDo1MCU7bWFyZ2luLWxlZnQ6LTMyMHB4O2JhY2tncm91bmQ6I2VhZWFlYTtwYWRkaW5nOjQwcHg7Ym9yZGVyLXJhZGl1czowfUBtZWRpYSBwcmludHsuYmVzcG9rZS1zbGlkZXt6b29tOjEhaW1wb3J0YW50O2hlaWdodDo3NDNweDt3aWR0aDoxMDAlO3BhZ2UtYnJlYWstYmVmb3JlOmFsd2F5cztwb3NpdGlvbjpzdGF0aWM7bWFyZ2luOjA7LXdlYmtpdC10cmFuc2l0aW9uOm5vbmU7dHJhbnNpdGlvbjpub25lfX0uYmVzcG9rZS1iZWZvcmV7LXdlYmtpdC10cmFuc2Zvcm06dHJhbnNsYXRlWCgxMDBweCl0cmFuc2xhdGVYKC0zMjBweClyb3RhdGVZKC05MGRlZyl0cmFuc2xhdGVYKC0zMjBweCk7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoMTAwcHgpdHJhbnNsYXRlWCgtMzIwcHgpcm90YXRlWSgtOTBkZWcpdHJhbnNsYXRlWCgtMzIwcHgpfUBtZWRpYSBwcmludHsuYmVzcG9rZS1iZWZvcmV7LXdlYmtpdC10cmFuc2Zvcm06bm9uZTt0cmFuc2Zvcm06bm9uZX19LmJlc3Bva2UtYWZ0ZXJ7LXdlYmtpdC10cmFuc2Zvcm06dHJhbnNsYXRlWCgtMTAwcHgpdHJhbnNsYXRlWCgzMjBweClyb3RhdGVZKDkwZGVnKXRyYW5zbGF0ZVgoMzIwcHgpO3RyYW5zZm9ybTp0cmFuc2xhdGVYKC0xMDBweCl0cmFuc2xhdGVYKDMyMHB4KXJvdGF0ZVkoOTBkZWcpdHJhbnNsYXRlWCgzMjBweCl9QG1lZGlhIHByaW50ey5iZXNwb2tlLWFmdGVyey13ZWJraXQtdHJhbnNmb3JtOm5vbmU7dHJhbnNmb3JtOm5vbmV9fS5iZXNwb2tlLWluYWN0aXZle29wYWNpdHk6MDtwb2ludGVyLWV2ZW50czpub25lfUBtZWRpYSBwcmludHsuYmVzcG9rZS1pbmFjdGl2ZXtvcGFjaXR5OjF9fS5iZXNwb2tlLWFjdGl2ZXtvcGFjaXR5OjF9LmJlc3Bva2UtYnVsbGV0ey13ZWJraXQtdHJhbnNpdGlvbjphbGwgLjNzIGVhc2U7dHJhbnNpdGlvbjphbGwgLjNzIGVhc2V9QG1lZGlhIHByaW50ey5iZXNwb2tlLWJ1bGxldHstd2Via2l0LXRyYW5zaXRpb246bm9uZTt0cmFuc2l0aW9uOm5vbmV9fS5iZXNwb2tlLWJ1bGxldC1pbmFjdGl2ZXtvcGFjaXR5OjB9bGkuYmVzcG9rZS1idWxsZXQtaW5hY3RpdmV7LXdlYmtpdC10cmFuc2Zvcm06dHJhbnNsYXRlWCgxNnB4KTt0cmFuc2Zvcm06dHJhbnNsYXRlWCgxNnB4KX1AbWVkaWEgcHJpbnR7bGkuYmVzcG9rZS1idWxsZXQtaW5hY3RpdmV7LXdlYmtpdC10cmFuc2Zvcm06bm9uZTt0cmFuc2Zvcm06bm9uZX19QG1lZGlhIHByaW50ey5iZXNwb2tlLWJ1bGxldC1pbmFjdGl2ZXtvcGFjaXR5OjF9fS5iZXNwb2tlLWJ1bGxldC1hY3RpdmV7b3BhY2l0eToxfS5iZXNwb2tlLXNjYWxlLXBhcmVudHstd2Via2l0LXBlcnNwZWN0aXZlOjYwMHB4O3BlcnNwZWN0aXZlOjYwMHB4O3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowO3BvaW50ZXItZXZlbnRzOm5vbmV9LmJlc3Bva2Utc2NhbGUtcGFyZW50IC5iZXNwb2tlLWFjdGl2ZXtwb2ludGVyLWV2ZW50czphdXRvfUBtZWRpYSBwcmludHsuYmVzcG9rZS1zY2FsZS1wYXJlbnR7LXdlYmtpdC10cmFuc2Zvcm06bm9uZSFpbXBvcnRhbnQ7dHJhbnNmb3JtOm5vbmUhaW1wb3J0YW50fX0uYmVzcG9rZS1wcm9ncmVzcy1wYXJlbnR7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO3JpZ2h0OjA7aGVpZ2h0OjJweH1AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6MTM2NnB4KXsuYmVzcG9rZS1wcm9ncmVzcy1wYXJlbnR7aGVpZ2h0OjRweH19QG1lZGlhIHByaW50ey5iZXNwb2tlLXByb2dyZXNzLXBhcmVudHtkaXNwbGF5Om5vbmV9fS5iZXNwb2tlLXByb2dyZXNzLWJhcnstd2Via2l0LXRyYW5zaXRpb246d2lkdGggLjZzIGVhc2U7dHJhbnNpdGlvbjp3aWR0aCAuNnMgZWFzZTtwb3NpdGlvbjphYnNvbHV0ZTtoZWlnaHQ6MTAwJTtiYWNrZ3JvdW5kOiMwMDg5ZjM7Ym9yZGVyLXJhZGl1czowIDRweCA0cHggMH0uZW1waGF0aWN7YmFja2dyb3VuZDojZWFlYWVhfS5iZXNwb2tlLWJhY2tkcm9we3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowOy13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZVooMCk7dHJhbnNmb3JtOnRyYW5zbGF0ZVooMCk7LXdlYmtpdC10cmFuc2l0aW9uOm9wYWNpdHkgLjZzIGVhc2U7dHJhbnNpdGlvbjpvcGFjaXR5IC42cyBlYXNlO29wYWNpdHk6MDt6LWluZGV4Oi0xfS5iZXNwb2tlLWJhY2tkcm9wLWFjdGl2ZXtvcGFjaXR5OjF9cHJle3BhZGRpbmc6MjZweCFpbXBvcnRhbnQ7Ym9yZGVyLXJhZGl1czo4cHh9Ym9keXtmb250LWZhbWlseTpoZWx2ZXRpY2EsYXJpYWwsc2Fucy1zZXJpZjtmb250LXNpemU6MThweDtjb2xvcjojNDA0MDQwfWgxe2ZvbnQtc2l6ZTo3MnB4O2xpbmUtaGVpZ2h0OjgycHg7bGV0dGVyLXNwYWNpbmc6LTJweDttYXJnaW4tYm90dG9tOjE2cHh9aDJ7Zm9udC1zaXplOjQycHg7bGV0dGVyLXNwYWNpbmc6LTFweDttYXJnaW4tYm90dG9tOjhweH1oM3tmb250LXNpemU6MjRweDtmb250LXdlaWdodDo0MDA7bWFyZ2luLWJvdHRvbToyNHB4O2NvbG9yOiM2MDYwNjB9aHJ7dmlzaWJpbGl0eTpoaWRkZW47aGVpZ2h0OjIwcHh9dWx7bGlzdC1zdHlsZTpub25lfWxpe21hcmdpbi1ib3R0b206MTJweH1we21hcmdpbjowIDEwMHB4IDEycHg7bGluZS1oZWlnaHQ6MjJweH1he2NvbG9yOiMwMDg5ZjM7dGV4dC1kZWNvcmF0aW9uOm5vbmV9XCI7XG4gIGluc2VydENzcyhjc3MsIHsgcHJlcGVuZDogdHJ1ZSB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24oZGVjaykge1xuICAgIGNsYXNzZXMoKShkZWNrKTtcblxuICAgIHZhciB3cmFwID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHdyYXBwZXIuY2xhc3NOYW1lID0gJ2Jlc3Bva2UtdGhlbWUtY3ViZS1zbGlkZS1wYXJlbnQnO1xuICAgICAgZWxlbWVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh3cmFwcGVyLCBlbGVtZW50KTtcbiAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgfTtcblxuICAgIGRlY2suc2xpZGVzLmZvckVhY2god3JhcCk7XG4gIH07XG59O1xuXG59LHtcImJlc3Bva2UtY2xhc3Nlc1wiOjIsXCJpbnNlcnQtY3NzXCI6M31dLDI6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRlY2spIHtcbiAgICB2YXIgYWRkQ2xhc3MgPSBmdW5jdGlvbihlbCwgY2xzKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2Jlc3Bva2UtJyArIGNscyk7XG4gICAgICB9LFxuXG4gICAgICByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKGVsLCBjbHMpIHtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lXG4gICAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgnYmVzcG9rZS0nICsgY2xzICsnKFxcXFxzfCQpJywgJ2cnKSwgJyAnKVxuICAgICAgICAgIC50cmltKCk7XG4gICAgICB9LFxuXG4gICAgICBkZWFjdGl2YXRlID0gZnVuY3Rpb24oZWwsIGluZGV4KSB7XG4gICAgICAgIHZhciBhY3RpdmVTbGlkZSA9IGRlY2suc2xpZGVzW2RlY2suc2xpZGUoKV0sXG4gICAgICAgICAgb2Zmc2V0ID0gaW5kZXggLSBkZWNrLnNsaWRlKCksXG4gICAgICAgICAgb2Zmc2V0Q2xhc3MgPSBvZmZzZXQgPiAwID8gJ2FmdGVyJyA6ICdiZWZvcmUnO1xuXG4gICAgICAgIFsnYmVmb3JlKC1cXFxcZCspPycsICdhZnRlcigtXFxcXGQrKT8nLCAnYWN0aXZlJywgJ2luYWN0aXZlJ10ubWFwKHJlbW92ZUNsYXNzLmJpbmQobnVsbCwgZWwpKTtcblxuICAgICAgICBpZiAoZWwgIT09IGFjdGl2ZVNsaWRlKSB7XG4gICAgICAgICAgWydpbmFjdGl2ZScsIG9mZnNldENsYXNzLCBvZmZzZXRDbGFzcyArICctJyArIE1hdGguYWJzKG9mZnNldCldLm1hcChhZGRDbGFzcy5iaW5kKG51bGwsIGVsKSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICBhZGRDbGFzcyhkZWNrLnBhcmVudCwgJ3BhcmVudCcpO1xuICAgIGRlY2suc2xpZGVzLm1hcChmdW5jdGlvbihlbCkgeyBhZGRDbGFzcyhlbCwgJ3NsaWRlJyk7IH0pO1xuXG4gICAgZGVjay5vbignYWN0aXZhdGUnLCBmdW5jdGlvbihlKSB7XG4gICAgICBkZWNrLnNsaWRlcy5tYXAoZGVhY3RpdmF0ZSk7XG4gICAgICBhZGRDbGFzcyhlLnNsaWRlLCAnYWN0aXZlJyk7XG4gICAgICByZW1vdmVDbGFzcyhlLnNsaWRlLCAnaW5hY3RpdmUnKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbn0se31dLDM6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xudmFyIGluc2VydGVkID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzcywgb3B0aW9ucykge1xuICAgIGlmIChpbnNlcnRlZFtjc3NdKSByZXR1cm47XG4gICAgaW5zZXJ0ZWRbY3NzXSA9IHRydWU7XG4gICAgXG4gICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvY3NzJyk7XG5cbiAgICBpZiAoJ3RleHRDb250ZW50JyBpbiBlbGVtKSB7XG4gICAgICBlbGVtLnRleHRDb250ZW50ID0gY3NzO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgICB9XG4gICAgXG4gICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMucHJlcGVuZCkge1xuICAgICAgICBoZWFkLmluc2VydEJlZm9yZShlbGVtLCBoZWFkLmNoaWxkTm9kZXNbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgfVxufTtcblxufSx7fV19LHt9LFsxXSlcbigxKVxufSk7XG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICByZXR1cm4gZnVuY3Rpb24oZGVjaykge1xuICAgIHZhciBheGlzID0gb3B0aW9ucyA9PSAndmVydGljYWwnID8gJ1knIDogJ1gnLFxuICAgICAgc3RhcnRQb3NpdGlvbixcbiAgICAgIGRlbHRhO1xuXG4gICAgZGVjay5wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLnRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IGUudG91Y2hlc1swXVsncGFnZScgKyBheGlzXTtcbiAgICAgICAgZGVsdGEgPSAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZGVjay5wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRlbHRhID0gZS50b3VjaGVzWzBdWydwYWdlJyArIGF4aXNdIC0gc3RhcnRQb3NpdGlvbjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGRlY2sucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoTWF0aC5hYnMoZGVsdGEpID4gNTApIHtcbiAgICAgICAgZGVja1tkZWx0YSA+IDAgPyAncHJldicgOiAnbmV4dCddKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59O1xuIiwidmFyIGZyb20gPSBmdW5jdGlvbihzZWxlY3Rvck9yRWxlbWVudCwgcGx1Z2lucykge1xuICB2YXIgcGFyZW50ID0gc2VsZWN0b3JPckVsZW1lbnQubm9kZVR5cGUgPT09IDEgPyBzZWxlY3Rvck9yRWxlbWVudCA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JPckVsZW1lbnQpLFxuICAgIHNsaWRlcyA9IFtdLmZpbHRlci5jYWxsKHBhcmVudC5jaGlsZHJlbiwgZnVuY3Rpb24oZWwpIHsgcmV0dXJuIGVsLm5vZGVOYW1lICE9PSAnU0NSSVBUJzsgfSksXG4gICAgYWN0aXZlU2xpZGUgPSBzbGlkZXNbMF0sXG4gICAgbGlzdGVuZXJzID0ge30sXG5cbiAgICBhY3RpdmF0ZSA9IGZ1bmN0aW9uKGluZGV4LCBjdXN0b21EYXRhKSB7XG4gICAgICBpZiAoIXNsaWRlc1tpbmRleF0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBmaXJlKCdkZWFjdGl2YXRlJywgY3JlYXRlRXZlbnREYXRhKGFjdGl2ZVNsaWRlLCBjdXN0b21EYXRhKSk7XG4gICAgICBhY3RpdmVTbGlkZSA9IHNsaWRlc1tpbmRleF07XG4gICAgICBmaXJlKCdhY3RpdmF0ZScsIGNyZWF0ZUV2ZW50RGF0YShhY3RpdmVTbGlkZSwgY3VzdG9tRGF0YSkpO1xuICAgIH0sXG5cbiAgICBzbGlkZSA9IGZ1bmN0aW9uKGluZGV4LCBjdXN0b21EYXRhKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBmaXJlKCdzbGlkZScsIGNyZWF0ZUV2ZW50RGF0YShzbGlkZXNbaW5kZXhdLCBjdXN0b21EYXRhKSkgJiYgYWN0aXZhdGUoaW5kZXgsIGN1c3RvbURhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNsaWRlcy5pbmRleE9mKGFjdGl2ZVNsaWRlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RlcCA9IGZ1bmN0aW9uKG9mZnNldCwgY3VzdG9tRGF0YSkge1xuICAgICAgdmFyIHNsaWRlSW5kZXggPSBzbGlkZXMuaW5kZXhPZihhY3RpdmVTbGlkZSkgKyBvZmZzZXQ7XG5cbiAgICAgIGZpcmUob2Zmc2V0ID4gMCA/ICduZXh0JyA6ICdwcmV2JywgY3JlYXRlRXZlbnREYXRhKGFjdGl2ZVNsaWRlLCBjdXN0b21EYXRhKSkgJiYgYWN0aXZhdGUoc2xpZGVJbmRleCwgY3VzdG9tRGF0YSk7XG4gICAgfSxcblxuICAgIG9uID0gZnVuY3Rpb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgKGxpc3RlbmVyc1tldmVudE5hbWVdIHx8IChsaXN0ZW5lcnNbZXZlbnROYW1lXSA9IFtdKSkucHVzaChjYWxsYmFjayk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGlzdGVuZXJzW2V2ZW50TmFtZV0gPSBsaXN0ZW5lcnNbZXZlbnROYW1lXS5maWx0ZXIoZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICAgICAgICByZXR1cm4gbGlzdGVuZXIgIT09IGNhbGxiYWNrO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGZpcmUgPSBmdW5jdGlvbihldmVudE5hbWUsIGV2ZW50RGF0YSkge1xuICAgICAgcmV0dXJuIChsaXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXSlcbiAgICAgICAgLnJlZHVjZShmdW5jdGlvbihub3RDYW5jZWxsZWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgcmV0dXJuIG5vdENhbmNlbGxlZCAmJiBjYWxsYmFjayhldmVudERhdGEpICE9PSBmYWxzZTtcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZUV2ZW50RGF0YSA9IGZ1bmN0aW9uKGVsLCBldmVudERhdGEpIHtcbiAgICAgIGV2ZW50RGF0YSA9IGV2ZW50RGF0YSB8fCB7fTtcbiAgICAgIGV2ZW50RGF0YS5pbmRleCA9IHNsaWRlcy5pbmRleE9mKGVsKTtcbiAgICAgIGV2ZW50RGF0YS5zbGlkZSA9IGVsO1xuICAgICAgcmV0dXJuIGV2ZW50RGF0YTtcbiAgICB9LFxuXG4gICAgZGVjayA9IHtcbiAgICAgIG9uOiBvbixcbiAgICAgIGZpcmU6IGZpcmUsXG4gICAgICBzbGlkZTogc2xpZGUsXG4gICAgICBuZXh0OiBzdGVwLmJpbmQobnVsbCwgMSksXG4gICAgICBwcmV2OiBzdGVwLmJpbmQobnVsbCwgLTEpLFxuICAgICAgcGFyZW50OiBwYXJlbnQsXG4gICAgICBzbGlkZXM6IHNsaWRlc1xuICAgIH07XG5cbiAgKHBsdWdpbnMgfHwgW10pLmZvckVhY2goZnVuY3Rpb24ocGx1Z2luKSB7XG4gICAgcGx1Z2luKGRlY2spO1xuICB9KTtcblxuICBhY3RpdmF0ZSgwKTtcblxuICByZXR1cm4gZGVjaztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmcm9tOiBmcm9tXG59O1xuIiwiLy8gUmVxdWlyZSBOb2RlIG1vZHVsZXMgaW4gdGhlIGJyb3dzZXIgdGhhbmtzIHRvIEJyb3dzZXJpZnk6IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZ1xudmFyIGJlc3Bva2UgPSByZXF1aXJlKCdiZXNwb2tlJyksXG4gIGN1YmUgPSByZXF1aXJlKCdiZXNwb2tlLXRoZW1lLWN1YmUnKSxcbiAga2V5cyA9IHJlcXVpcmUoJ2Jlc3Bva2Uta2V5cycpLFxuICB0b3VjaCA9IHJlcXVpcmUoJ2Jlc3Bva2UtdG91Y2gnKSxcbiAgYnVsbGV0cyA9IHJlcXVpcmUoJ2Jlc3Bva2UtYnVsbGV0cycpLFxuICBiYWNrZHJvcCA9IHJlcXVpcmUoJ2Jlc3Bva2UtYmFja2Ryb3AnKSxcbiAgc2NhbGUgPSByZXF1aXJlKCdiZXNwb2tlLXNjYWxlJyksXG4gIGhhc2ggPSByZXF1aXJlKCdiZXNwb2tlLWhhc2gnKSxcbiAgcHJvZ3Jlc3MgPSByZXF1aXJlKCdiZXNwb2tlLXByb2dyZXNzJyk7XG5cbi8vIEJlc3Bva2UuanNcbmJlc3Bva2UuZnJvbSgnYXJ0aWNsZScsIFtcbiAgY3ViZSgpLFxuICBrZXlzKCksXG4gIHRvdWNoKCksXG4gIGJ1bGxldHMoJ2xpLCAuYnVsbGV0JyksXG4gIGJhY2tkcm9wKCksXG4gIHNjYWxlKCksXG4gIGhhc2goKSxcbiAgcHJvZ3Jlc3MoKVxuXSk7XG4iXX0=
=======
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxUVUdBU1RLUFBMXFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJEOi9UVUdBU1RLUFBML25vZGVfbW9kdWxlcy9iZXNwb2tlLWJhY2tkcm9wL2xpYi9iZXNwb2tlLWJhY2tkcm9wLmpzIiwiRDovVFVHQVNUS1BQTC9ub2RlX21vZHVsZXMvYmVzcG9rZS1idWxsZXRzL2xpYi9iZXNwb2tlLWJ1bGxldHMuanMiLCJEOi9UVUdBU1RLUFBML25vZGVfbW9kdWxlcy9iZXNwb2tlLWhhc2gvbGliL2Jlc3Bva2UtaGFzaC5qcyIsIkQ6L1RVR0FTVEtQUEwvbm9kZV9tb2R1bGVzL2Jlc3Bva2Uta2V5cy9saWIvYmVzcG9rZS1rZXlzLmpzIiwiRDovVFVHQVNUS1BQTC9ub2RlX21vZHVsZXMvYmVzcG9rZS1wcm9ncmVzcy9saWIvYmVzcG9rZS1wcm9ncmVzcy5qcyIsIkQ6L1RVR0FTVEtQUEwvbm9kZV9tb2R1bGVzL2Jlc3Bva2Utc2NhbGUvbGliL2Jlc3Bva2Utc2NhbGUuanMiLCJEOi9UVUdBU1RLUFBML25vZGVfbW9kdWxlcy9iZXNwb2tlLXRoZW1lLWN1YmUvZGlzdC9iZXNwb2tlLXRoZW1lLWN1YmUuanMiLCJEOi9UVUdBU1RLUFBML25vZGVfbW9kdWxlcy9iZXNwb2tlLXRvdWNoL2xpYi9iZXNwb2tlLXRvdWNoLmpzIiwiRDovVFVHQVNUS1BQTC9ub2RlX21vZHVsZXMvYmVzcG9rZS9saWIvYmVzcG9rZS5qcyIsIkQ6L1RVR0FTVEtQUEwvc3JjL3NjcmlwdHMvZmFrZV80MDFiODViOS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24oZGVjaykge1xuICAgIHZhciBiYWNrZHJvcHM7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVCYWNrZHJvcEZvclNsaWRlKHNsaWRlKSB7XG4gICAgICB2YXIgYmFja2Ryb3BBdHRyaWJ1dGUgPSBzbGlkZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYmVzcG9rZS1iYWNrZHJvcCcpO1xuXG4gICAgICBpZiAoYmFja2Ryb3BBdHRyaWJ1dGUpIHtcbiAgICAgICAgdmFyIGJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhY2tkcm9wLmNsYXNzTmFtZSA9IGJhY2tkcm9wQXR0cmlidXRlO1xuICAgICAgICBiYWNrZHJvcC5jbGFzc0xpc3QuYWRkKCdiZXNwb2tlLWJhY2tkcm9wJyk7XG4gICAgICAgIGRlY2sucGFyZW50LmFwcGVuZENoaWxkKGJhY2tkcm9wKTtcbiAgICAgICAgcmV0dXJuIGJhY2tkcm9wO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsYXNzZXMoZWwpIHtcbiAgICAgIGlmIChlbCkge1xuICAgICAgICB2YXIgaW5kZXggPSBiYWNrZHJvcHMuaW5kZXhPZihlbCksXG4gICAgICAgICAgY3VycmVudEluZGV4ID0gZGVjay5zbGlkZSgpO1xuXG4gICAgICAgIHJlbW92ZUNsYXNzKGVsLCAnYWN0aXZlJyk7XG4gICAgICAgIHJlbW92ZUNsYXNzKGVsLCAnaW5hY3RpdmUnKTtcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWwsICdiZWZvcmUnKTtcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWwsICdhZnRlcicpO1xuXG4gICAgICAgIGlmIChpbmRleCAhPT0gY3VycmVudEluZGV4KSB7XG4gICAgICAgICAgYWRkQ2xhc3MoZWwsICdpbmFjdGl2ZScpO1xuICAgICAgICAgIGFkZENsYXNzKGVsLCBpbmRleCA8IGN1cnJlbnRJbmRleCA/ICdiZWZvcmUnIDogJ2FmdGVyJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRkQ2xhc3MoZWwsICdhY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsLCBjbGFzc05hbWUpIHtcbiAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2Jlc3Bva2UtYmFja2Ryb3AtJyArIGNsYXNzTmFtZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkQ2xhc3MoZWwsIGNsYXNzTmFtZSkge1xuICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnYmVzcG9rZS1iYWNrZHJvcC0nICsgY2xhc3NOYW1lKTtcbiAgICB9XG5cbiAgICBiYWNrZHJvcHMgPSBkZWNrLnNsaWRlc1xuICAgICAgLm1hcChjcmVhdGVCYWNrZHJvcEZvclNsaWRlKTtcblxuICAgIGRlY2sub24oJ2FjdGl2YXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICBiYWNrZHJvcHMuZm9yRWFjaCh1cGRhdGVDbGFzc2VzKTtcbiAgICB9KTtcbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRlY2spIHtcbiAgICB2YXIgYWN0aXZlU2xpZGVJbmRleCxcbiAgICAgIGFjdGl2ZUJ1bGxldEluZGV4LFxuXG4gICAgICBidWxsZXRzID0gZGVjay5zbGlkZXMubWFwKGZ1bmN0aW9uKHNsaWRlKSB7XG4gICAgICAgIHJldHVybiBbXS5zbGljZS5jYWxsKHNsaWRlLnF1ZXJ5U2VsZWN0b3JBbGwoKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJyA/IG9wdGlvbnMgOiAnW2RhdGEtYmVzcG9rZS1idWxsZXRdJykpLCAwKTtcbiAgICAgIH0pLFxuXG4gICAgICBuZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0U2xpZGVJbmRleCA9IGFjdGl2ZVNsaWRlSW5kZXggKyAxO1xuXG4gICAgICAgIGlmIChhY3RpdmVTbGlkZUhhc0J1bGxldEJ5T2Zmc2V0KDEpKSB7XG4gICAgICAgICAgYWN0aXZhdGVCdWxsZXQoYWN0aXZlU2xpZGVJbmRleCwgYWN0aXZlQnVsbGV0SW5kZXggKyAxKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoYnVsbGV0c1tuZXh0U2xpZGVJbmRleF0pIHtcbiAgICAgICAgICBhY3RpdmF0ZUJ1bGxldChuZXh0U2xpZGVJbmRleCwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIHByZXYgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByZXZTbGlkZUluZGV4ID0gYWN0aXZlU2xpZGVJbmRleCAtIDE7XG5cbiAgICAgICAgaWYgKGFjdGl2ZVNsaWRlSGFzQnVsbGV0QnlPZmZzZXQoLTEpKSB7XG4gICAgICAgICAgYWN0aXZhdGVCdWxsZXQoYWN0aXZlU2xpZGVJbmRleCwgYWN0aXZlQnVsbGV0SW5kZXggLSAxKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoYnVsbGV0c1twcmV2U2xpZGVJbmRleF0pIHtcbiAgICAgICAgICBhY3RpdmF0ZUJ1bGxldChwcmV2U2xpZGVJbmRleCwgYnVsbGV0c1twcmV2U2xpZGVJbmRleF0ubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGFjdGl2YXRlQnVsbGV0ID0gZnVuY3Rpb24oc2xpZGVJbmRleCwgYnVsbGV0SW5kZXgpIHtcbiAgICAgICAgYWN0aXZlU2xpZGVJbmRleCA9IHNsaWRlSW5kZXg7XG4gICAgICAgIGFjdGl2ZUJ1bGxldEluZGV4ID0gYnVsbGV0SW5kZXg7XG5cbiAgICAgICAgYnVsbGV0cy5mb3JFYWNoKGZ1bmN0aW9uKHNsaWRlLCBzKSB7XG4gICAgICAgICAgc2xpZGUuZm9yRWFjaChmdW5jdGlvbihidWxsZXQsIGIpIHtcbiAgICAgICAgICAgIGJ1bGxldC5jbGFzc0xpc3QuYWRkKCdiZXNwb2tlLWJ1bGxldCcpO1xuXG4gICAgICAgICAgICBpZiAocyA8IHNsaWRlSW5kZXggfHwgcyA9PT0gc2xpZGVJbmRleCAmJiBiIDw9IGJ1bGxldEluZGV4KSB7XG4gICAgICAgICAgICAgIGJ1bGxldC5jbGFzc0xpc3QuYWRkKCdiZXNwb2tlLWJ1bGxldC1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgYnVsbGV0LmNsYXNzTGlzdC5yZW1vdmUoJ2Jlc3Bva2UtYnVsbGV0LWluYWN0aXZlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBidWxsZXQuY2xhc3NMaXN0LmFkZCgnYmVzcG9rZS1idWxsZXQtaW5hY3RpdmUnKTtcbiAgICAgICAgICAgICAgYnVsbGV0LmNsYXNzTGlzdC5yZW1vdmUoJ2Jlc3Bva2UtYnVsbGV0LWFjdGl2ZScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocyA9PT0gc2xpZGVJbmRleCAmJiBiID09PSBidWxsZXRJbmRleCkge1xuICAgICAgICAgICAgICBidWxsZXQuY2xhc3NMaXN0LmFkZCgnYmVzcG9rZS1idWxsZXQtY3VycmVudCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYnVsbGV0LmNsYXNzTGlzdC5yZW1vdmUoJ2Jlc3Bva2UtYnVsbGV0LWN1cnJlbnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICBhY3RpdmVTbGlkZUhhc0J1bGxldEJ5T2Zmc2V0ID0gZnVuY3Rpb24ob2Zmc2V0KSB7XG4gICAgICAgIHJldHVybiBidWxsZXRzW2FjdGl2ZVNsaWRlSW5kZXhdW2FjdGl2ZUJ1bGxldEluZGV4ICsgb2Zmc2V0XSAhPT0gdW5kZWZpbmVkO1xuICAgICAgfTtcblxuICAgIGRlY2sub24oJ25leHQnLCBuZXh0KTtcbiAgICBkZWNrLm9uKCdwcmV2JywgcHJldik7XG5cbiAgICBkZWNrLm9uKCdzbGlkZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGFjdGl2YXRlQnVsbGV0KGUuaW5kZXgsIDApO1xuICAgIH0pO1xuXG4gICAgYWN0aXZhdGVCdWxsZXQoMCwgMCk7XG4gIH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRlY2spIHtcbiAgICB2YXIgcGFyc2VIYXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNsaWNlKDEpLFxuICAgICAgICBzbGlkZU51bWJlck9yTmFtZSA9IHBhcnNlSW50KGhhc2gsIDEwKTtcblxuICAgICAgaWYgKGhhc2gpIHtcbiAgICAgICAgaWYgKHNsaWRlTnVtYmVyT3JOYW1lKSB7XG4gICAgICAgICAgYWN0aXZhdGVTbGlkZShzbGlkZU51bWJlck9yTmFtZSAtIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlY2suc2xpZGVzLmZvckVhY2goZnVuY3Rpb24oc2xpZGUsIGkpIHtcbiAgICAgICAgICAgIGlmIChzbGlkZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYmVzcG9rZS1oYXNoJykgPT09IGhhc2gpIHtcbiAgICAgICAgICAgICAgYWN0aXZhdGVTbGlkZShpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgYWN0aXZhdGVTbGlkZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICB2YXIgaW5kZXhUb0FjdGl2YXRlID0gLTEgPCBpbmRleCAmJiBpbmRleCA8IGRlY2suc2xpZGVzLmxlbmd0aCA/IGluZGV4IDogMDtcbiAgICAgIGlmIChpbmRleFRvQWN0aXZhdGUgIT09IGRlY2suc2xpZGUoKSkge1xuICAgICAgICBkZWNrLnNsaWRlKGluZGV4VG9BY3RpdmF0ZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBwYXJzZUhhc2goKTtcblxuICAgICAgZGVjay5vbignYWN0aXZhdGUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBzbGlkZU5hbWUgPSBlLnNsaWRlLmdldEF0dHJpYnV0ZSgnZGF0YS1iZXNwb2tlLWhhc2gnKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBzbGlkZU5hbWUgfHwgZS5pbmRleCArIDE7XG4gICAgICB9KTtcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBwYXJzZUhhc2gpO1xuICAgIH0sIDApO1xuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICByZXR1cm4gZnVuY3Rpb24oZGVjaykge1xuICAgIHZhciBpc0hvcml6b250YWwgPSBvcHRpb25zICE9PSAndmVydGljYWwnO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLndoaWNoID09IDM0IHx8IC8vIFBBR0UgRE9XTlxuICAgICAgICBlLndoaWNoID09IDMyIHx8IC8vIFNQQUNFXG4gICAgICAgIChpc0hvcml6b250YWwgJiYgZS53aGljaCA9PSAzOSkgfHwgLy8gUklHSFRcbiAgICAgICAgKCFpc0hvcml6b250YWwgJiYgZS53aGljaCA9PSA0MCkgLy8gRE9XTlxuICAgICAgKSB7IGRlY2submV4dCgpOyB9XG5cbiAgICAgIGlmIChlLndoaWNoID09IDMzIHx8IC8vIFBBR0UgVVBcbiAgICAgICAgKGlzSG9yaXpvbnRhbCAmJiBlLndoaWNoID09IDM3KSB8fCAvLyBMRUZUXG4gICAgICAgICghaXNIb3Jpem9udGFsICYmIGUud2hpY2ggPT0gMzgpIC8vIFVQXG4gICAgICApIHsgZGVjay5wcmV2KCk7IH1cbiAgICB9KTtcbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkZWNrKSB7XG4gICAgdmFyIHByb2dyZXNzUGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICBwcm9ncmVzc0JhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgcHJvcCA9IG9wdGlvbnMgPT09ICd2ZXJ0aWNhbCcgPyAnaGVpZ2h0JyA6ICd3aWR0aCc7XG5cbiAgICBwcm9ncmVzc1BhcmVudC5jbGFzc05hbWUgPSAnYmVzcG9rZS1wcm9ncmVzcy1wYXJlbnQnO1xuICAgIHByb2dyZXNzQmFyLmNsYXNzTmFtZSA9ICdiZXNwb2tlLXByb2dyZXNzLWJhcic7XG4gICAgcHJvZ3Jlc3NQYXJlbnQuYXBwZW5kQ2hpbGQocHJvZ3Jlc3NCYXIpO1xuICAgIGRlY2sucGFyZW50LmFwcGVuZENoaWxkKHByb2dyZXNzUGFyZW50KTtcblxuICAgIGRlY2sub24oJ2FjdGl2YXRlJywgZnVuY3Rpb24oZSkge1xuICAgICAgcHJvZ3Jlc3NCYXIuc3R5bGVbcHJvcF0gPSAoZS5pbmRleCAqIDEwMCAvIChkZWNrLnNsaWRlcy5sZW5ndGggLSAxKSkgKyAnJSc7XG4gICAgfSk7XG4gIH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbihkZWNrKSB7XG4gICAgdmFyIHBhcmVudCA9IGRlY2sucGFyZW50LFxuICAgICAgZmlyc3RTbGlkZSA9IGRlY2suc2xpZGVzWzBdLFxuICAgICAgc2xpZGVIZWlnaHQgPSBmaXJzdFNsaWRlLm9mZnNldEhlaWdodCxcbiAgICAgIHNsaWRlV2lkdGggPSBmaXJzdFNsaWRlLm9mZnNldFdpZHRoLFxuICAgICAgdXNlWm9vbSA9IG9wdGlvbnMgPT09ICd6b29tJyB8fCAoJ3pvb20nIGluIHBhcmVudC5zdHlsZSAmJiBvcHRpb25zICE9PSAndHJhbnNmb3JtJyksXG5cbiAgICAgIHdyYXAgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHdyYXBwZXIuY2xhc3NOYW1lID0gJ2Jlc3Bva2Utc2NhbGUtcGFyZW50JztcbiAgICAgICAgZWxlbWVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh3cmFwcGVyLCBlbGVtZW50KTtcbiAgICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgcmV0dXJuIHdyYXBwZXI7XG4gICAgICB9LFxuXG4gICAgICBlbGVtZW50cyA9IHVzZVpvb20gPyBkZWNrLnNsaWRlcyA6IGRlY2suc2xpZGVzLm1hcCh3cmFwKSxcblxuICAgICAgdHJhbnNmb3JtUHJvcGVydHkgPSAoZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICAgICAgdmFyIHByZWZpeGVzID0gJ01veiBXZWJraXQgTyBtcycuc3BsaXQoJyAnKTtcbiAgICAgICAgcmV0dXJuIHByZWZpeGVzLnJlZHVjZShmdW5jdGlvbihjdXJyZW50UHJvcGVydHksIHByZWZpeCkge1xuICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIHByb3BlcnR5IGluIHBhcmVudC5zdHlsZSA/IHByZWZpeCArIHByb3BlcnR5IDogY3VycmVudFByb3BlcnR5O1xuICAgICAgICAgIH0sIHByb3BlcnR5LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgfSgnVHJhbnNmb3JtJykpLFxuXG4gICAgICBzY2FsZSA9IHVzZVpvb20gP1xuICAgICAgICBmdW5jdGlvbihyYXRpbywgZWxlbWVudCkge1xuICAgICAgICAgIGVsZW1lbnQuc3R5bGUuem9vbSA9IHJhdGlvO1xuICAgICAgICB9IDpcbiAgICAgICAgZnVuY3Rpb24ocmF0aW8sIGVsZW1lbnQpIHtcbiAgICAgICAgICBlbGVtZW50LnN0eWxlW3RyYW5zZm9ybVByb3BlcnR5XSA9ICdzY2FsZSgnICsgcmF0aW8gKyAnKSc7XG4gICAgICAgIH0sXG5cbiAgICAgIHNjYWxlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB4U2NhbGUgPSBwYXJlbnQub2Zmc2V0V2lkdGggLyBzbGlkZVdpZHRoLFxuICAgICAgICAgIHlTY2FsZSA9IHBhcmVudC5vZmZzZXRIZWlnaHQgLyBzbGlkZUhlaWdodDtcblxuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKHNjYWxlLmJpbmQobnVsbCwgTWF0aC5taW4oeFNjYWxlLCB5U2NhbGUpKSk7XG4gICAgICB9O1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjYWxlQWxsKTtcbiAgICBzY2FsZUFsbCgpO1xuICB9O1xuXG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLyohXG4gKiBiZXNwb2tlLXRoZW1lLWN1YmUgdjIuMC4xXG4gKlxuICogQ29weXJpZ2h0IDIwMTQsIE1hcmsgRGFsZ2xlaXNoXG4gKiBUaGlzIGNvbnRlbnQgaXMgcmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiBodHRwOi8vbWl0LWxpY2Vuc2Uub3JnL21hcmtkYWxnbGVpc2hcbiAqL1xuXG4hZnVuY3Rpb24oZSl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMpbW9kdWxlLmV4cG9ydHM9ZSgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShlKTtlbHNle3ZhciBvO1widW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/bz13aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9vPWdsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZiYmKG89c2VsZik7dmFyIGY9bztmPWYuYmVzcG9rZXx8KGYuYmVzcG9rZT17fSksZj1mLnRoZW1lc3x8KGYudGhlbWVzPXt9KSxmLmN1YmU9ZSgpfX0oZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG5cbnZhciBjbGFzc2VzID0gX2RlcmVxXygnYmVzcG9rZS1jbGFzc2VzJyk7XG52YXIgaW5zZXJ0Q3NzID0gX2RlcmVxXygnaW5zZXJ0LWNzcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY3NzID0gXCIqey1tb3otYm94LXNpemluZzpib3JkZXItYm94O2JveC1zaXppbmc6Ym9yZGVyLWJveDttYXJnaW46MDtwYWRkaW5nOjB9QG1lZGlhIHByaW50eyp7LXdlYmtpdC1wcmludC1jb2xvci1hZGp1c3Q6ZXhhY3R9fUBwYWdle3NpemU6bGFuZHNjYXBlO21hcmdpbjowfS5iZXNwb2tlLXBhcmVudHstd2Via2l0LXRyYW5zaXRpb246YmFja2dyb3VuZCAuNnMgZWFzZTt0cmFuc2l0aW9uOmJhY2tncm91bmQgLjZzIGVhc2U7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7Ym90dG9tOjA7bGVmdDowO3JpZ2h0OjA7b3ZlcmZsb3c6aGlkZGVufUBtZWRpYSBwcmludHsuYmVzcG9rZS1wYXJlbnR7b3ZlcmZsb3c6dmlzaWJsZTtwb3NpdGlvbjpzdGF0aWN9fS5iZXNwb2tlLXRoZW1lLWN1YmUtc2xpZGUtcGFyZW50e3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowOy13ZWJraXQtcGVyc3BlY3RpdmU6NjAwcHg7cGVyc3BlY3RpdmU6NjAwcHg7cG9pbnRlci1ldmVudHM6bm9uZX0uYmVzcG9rZS1zbGlkZXtwb2ludGVyLWV2ZW50czphdXRvOy13ZWJraXQtdHJhbnNpdGlvbjotd2Via2l0LXRyYW5zZm9ybSAuNnMgZWFzZSxvcGFjaXR5IC42cyBlYXNlLGJhY2tncm91bmQgLjZzIGVhc2U7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjZzIGVhc2Usb3BhY2l0eSAuNnMgZWFzZSxiYWNrZ3JvdW5kIC42cyBlYXNlOy13ZWJraXQtdHJhbnNmb3JtLW9yaWdpbjo1MCUgNTAlIDA7dHJhbnNmb3JtLW9yaWdpbjo1MCUgNTAlIDA7LXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5OmhpZGRlbjtiYWNrZmFjZS12aXNpYmlsaXR5OmhpZGRlbjtkaXNwbGF5Oi13ZWJraXQtYm94O2Rpc3BsYXk6LXdlYmtpdC1mbGV4O2Rpc3BsYXk6LW1zLWZsZXhib3g7ZGlzcGxheTpmbGV4Oy13ZWJraXQtYm94LW9yaWVudDp2ZXJ0aWNhbDstd2Via2l0LWJveC1kaXJlY3Rpb246bm9ybWFsOy13ZWJraXQtZmxleC1kaXJlY3Rpb246Y29sdW1uOy1tcy1mbGV4LWRpcmVjdGlvbjpjb2x1bW47ZmxleC1kaXJlY3Rpb246Y29sdW1uOy13ZWJraXQtYm94LXBhY2s6Y2VudGVyOy13ZWJraXQtanVzdGlmeS1jb250ZW50OmNlbnRlcjstbXMtZmxleC1wYWNrOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOy13ZWJraXQtYm94LWFsaWduOmNlbnRlcjstd2Via2l0LWFsaWduLWl0ZW1zOmNlbnRlcjstbXMtZmxleC1hbGlnbjpjZW50ZXI7YWxpZ24taXRlbXM6Y2VudGVyO3RleHQtYWxpZ246Y2VudGVyO3dpZHRoOjY0MHB4O2hlaWdodDo0ODBweDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6NTAlO21hcmdpbi10b3A6LTI0MHB4O2xlZnQ6NTAlO21hcmdpbi1sZWZ0Oi0zMjBweDtiYWNrZ3JvdW5kOiNlYWVhZWE7cGFkZGluZzo0MHB4O2JvcmRlci1yYWRpdXM6MH1AbWVkaWEgcHJpbnR7LmJlc3Bva2Utc2xpZGV7em9vbToxIWltcG9ydGFudDtoZWlnaHQ6NzQzcHg7d2lkdGg6MTAwJTtwYWdlLWJyZWFrLWJlZm9yZTphbHdheXM7cG9zaXRpb246c3RhdGljO21hcmdpbjowOy13ZWJraXQtdHJhbnNpdGlvbjpub25lO3RyYW5zaXRpb246bm9uZX19LmJlc3Bva2UtYmVmb3Jley13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZVgoMTAwcHgpdHJhbnNsYXRlWCgtMzIwcHgpcm90YXRlWSgtOTBkZWcpdHJhbnNsYXRlWCgtMzIwcHgpO3RyYW5zZm9ybTp0cmFuc2xhdGVYKDEwMHB4KXRyYW5zbGF0ZVgoLTMyMHB4KXJvdGF0ZVkoLTkwZGVnKXRyYW5zbGF0ZVgoLTMyMHB4KX1AbWVkaWEgcHJpbnR7LmJlc3Bva2UtYmVmb3Jley13ZWJraXQtdHJhbnNmb3JtOm5vbmU7dHJhbnNmb3JtOm5vbmV9fS5iZXNwb2tlLWFmdGVyey13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTEwMHB4KXRyYW5zbGF0ZVgoMzIwcHgpcm90YXRlWSg5MGRlZyl0cmFuc2xhdGVYKDMyMHB4KTt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtMTAwcHgpdHJhbnNsYXRlWCgzMjBweClyb3RhdGVZKDkwZGVnKXRyYW5zbGF0ZVgoMzIwcHgpfUBtZWRpYSBwcmludHsuYmVzcG9rZS1hZnRlcnstd2Via2l0LXRyYW5zZm9ybTpub25lO3RyYW5zZm9ybTpub25lfX0uYmVzcG9rZS1pbmFjdGl2ZXtvcGFjaXR5OjA7cG9pbnRlci1ldmVudHM6bm9uZX1AbWVkaWEgcHJpbnR7LmJlc3Bva2UtaW5hY3RpdmV7b3BhY2l0eToxfX0uYmVzcG9rZS1hY3RpdmV7b3BhY2l0eToxfS5iZXNwb2tlLWJ1bGxldHstd2Via2l0LXRyYW5zaXRpb246YWxsIC4zcyBlYXNlO3RyYW5zaXRpb246YWxsIC4zcyBlYXNlfUBtZWRpYSBwcmludHsuYmVzcG9rZS1idWxsZXR7LXdlYmtpdC10cmFuc2l0aW9uOm5vbmU7dHJhbnNpdGlvbjpub25lfX0uYmVzcG9rZS1idWxsZXQtaW5hY3RpdmV7b3BhY2l0eTowfWxpLmJlc3Bva2UtYnVsbGV0LWluYWN0aXZley13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZVgoMTZweCk7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoMTZweCl9QG1lZGlhIHByaW50e2xpLmJlc3Bva2UtYnVsbGV0LWluYWN0aXZley13ZWJraXQtdHJhbnNmb3JtOm5vbmU7dHJhbnNmb3JtOm5vbmV9fUBtZWRpYSBwcmludHsuYmVzcG9rZS1idWxsZXQtaW5hY3RpdmV7b3BhY2l0eToxfX0uYmVzcG9rZS1idWxsZXQtYWN0aXZle29wYWNpdHk6MX0uYmVzcG9rZS1zY2FsZS1wYXJlbnR7LXdlYmtpdC1wZXJzcGVjdGl2ZTo2MDBweDtwZXJzcGVjdGl2ZTo2MDBweDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0OjA7cmlnaHQ6MDtib3R0b206MDtwb2ludGVyLWV2ZW50czpub25lfS5iZXNwb2tlLXNjYWxlLXBhcmVudCAuYmVzcG9rZS1hY3RpdmV7cG9pbnRlci1ldmVudHM6YXV0b31AbWVkaWEgcHJpbnR7LmJlc3Bva2Utc2NhbGUtcGFyZW50ey13ZWJraXQtdHJhbnNmb3JtOm5vbmUhaW1wb3J0YW50O3RyYW5zZm9ybTpub25lIWltcG9ydGFudH19LmJlc3Bva2UtcHJvZ3Jlc3MtcGFyZW50e3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtyaWdodDowO2hlaWdodDoycHh9QG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOjEzNjZweCl7LmJlc3Bva2UtcHJvZ3Jlc3MtcGFyZW50e2hlaWdodDo0cHh9fUBtZWRpYSBwcmludHsuYmVzcG9rZS1wcm9ncmVzcy1wYXJlbnR7ZGlzcGxheTpub25lfX0uYmVzcG9rZS1wcm9ncmVzcy1iYXJ7LXdlYmtpdC10cmFuc2l0aW9uOndpZHRoIC42cyBlYXNlO3RyYW5zaXRpb246d2lkdGggLjZzIGVhc2U7cG9zaXRpb246YWJzb2x1dGU7aGVpZ2h0OjEwMCU7YmFja2dyb3VuZDojMDA4OWYzO2JvcmRlci1yYWRpdXM6MCA0cHggNHB4IDB9LmVtcGhhdGlje2JhY2tncm91bmQ6I2VhZWFlYX0uYmVzcG9rZS1iYWNrZHJvcHtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0OjA7cmlnaHQ6MDtib3R0b206MDstd2Via2l0LXRyYW5zZm9ybTp0cmFuc2xhdGVaKDApO3RyYW5zZm9ybTp0cmFuc2xhdGVaKDApOy13ZWJraXQtdHJhbnNpdGlvbjpvcGFjaXR5IC42cyBlYXNlO3RyYW5zaXRpb246b3BhY2l0eSAuNnMgZWFzZTtvcGFjaXR5OjA7ei1pbmRleDotMX0uYmVzcG9rZS1iYWNrZHJvcC1hY3RpdmV7b3BhY2l0eToxfXByZXtwYWRkaW5nOjI2cHghaW1wb3J0YW50O2JvcmRlci1yYWRpdXM6OHB4fWJvZHl7Zm9udC1mYW1pbHk6aGVsdmV0aWNhLGFyaWFsLHNhbnMtc2VyaWY7Zm9udC1zaXplOjE4cHg7Y29sb3I6IzQwNDA0MH1oMXtmb250LXNpemU6NzJweDtsaW5lLWhlaWdodDo4MnB4O2xldHRlci1zcGFjaW5nOi0ycHg7bWFyZ2luLWJvdHRvbToxNnB4fWgye2ZvbnQtc2l6ZTo0MnB4O2xldHRlci1zcGFjaW5nOi0xcHg7bWFyZ2luLWJvdHRvbTo4cHh9aDN7Zm9udC1zaXplOjI0cHg7Zm9udC13ZWlnaHQ6NDAwO21hcmdpbi1ib3R0b206MjRweDtjb2xvcjojNjA2MDYwfWhye3Zpc2liaWxpdHk6aGlkZGVuO2hlaWdodDoyMHB4fXVse2xpc3Qtc3R5bGU6bm9uZX1saXttYXJnaW4tYm90dG9tOjEycHh9cHttYXJnaW46MCAxMDBweCAxMnB4O2xpbmUtaGVpZ2h0OjIycHh9YXtjb2xvcjojMDA4OWYzO3RleHQtZGVjb3JhdGlvbjpub25lfVwiO1xuICBpbnNlcnRDc3MoY3NzLCB7IHByZXBlbmQ6IHRydWUgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGRlY2spIHtcbiAgICBjbGFzc2VzKCkoZGVjayk7XG5cbiAgICB2YXIgd3JhcCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB3cmFwcGVyLmNsYXNzTmFtZSA9ICdiZXNwb2tlLXRoZW1lLWN1YmUtc2xpZGUtcGFyZW50JztcbiAgICAgIGVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcHBlciwgZWxlbWVudCk7XG4gICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIH07XG5cbiAgICBkZWNrLnNsaWRlcy5mb3JFYWNoKHdyYXApO1xuICB9O1xufTtcblxufSx7XCJiZXNwb2tlLWNsYXNzZXNcIjoyLFwiaW5zZXJ0LWNzc1wiOjN9XSwyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbihkZWNrKSB7XG4gICAgdmFyIGFkZENsYXNzID0gZnVuY3Rpb24oZWwsIGNscykge1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdiZXNwb2tlLScgKyBjbHMpO1xuICAgICAgfSxcblxuICAgICAgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbCwgY2xzKSB7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZVxuICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoJ2Jlc3Bva2UtJyArIGNscyArJyhcXFxcc3wkKScsICdnJyksICcgJylcbiAgICAgICAgICAudHJpbSgpO1xuICAgICAgfSxcblxuICAgICAgZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uKGVsLCBpbmRleCkge1xuICAgICAgICB2YXIgYWN0aXZlU2xpZGUgPSBkZWNrLnNsaWRlc1tkZWNrLnNsaWRlKCldLFxuICAgICAgICAgIG9mZnNldCA9IGluZGV4IC0gZGVjay5zbGlkZSgpLFxuICAgICAgICAgIG9mZnNldENsYXNzID0gb2Zmc2V0ID4gMCA/ICdhZnRlcicgOiAnYmVmb3JlJztcblxuICAgICAgICBbJ2JlZm9yZSgtXFxcXGQrKT8nLCAnYWZ0ZXIoLVxcXFxkKyk/JywgJ2FjdGl2ZScsICdpbmFjdGl2ZSddLm1hcChyZW1vdmVDbGFzcy5iaW5kKG51bGwsIGVsKSk7XG5cbiAgICAgICAgaWYgKGVsICE9PSBhY3RpdmVTbGlkZSkge1xuICAgICAgICAgIFsnaW5hY3RpdmUnLCBvZmZzZXRDbGFzcywgb2Zmc2V0Q2xhc3MgKyAnLScgKyBNYXRoLmFicyhvZmZzZXQpXS5tYXAoYWRkQ2xhc3MuYmluZChudWxsLCBlbCkpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgYWRkQ2xhc3MoZGVjay5wYXJlbnQsICdwYXJlbnQnKTtcbiAgICBkZWNrLnNsaWRlcy5tYXAoZnVuY3Rpb24oZWwpIHsgYWRkQ2xhc3MoZWwsICdzbGlkZScpOyB9KTtcblxuICAgIGRlY2sub24oJ2FjdGl2YXRlJywgZnVuY3Rpb24oZSkge1xuICAgICAgZGVjay5zbGlkZXMubWFwKGRlYWN0aXZhdGUpO1xuICAgICAgYWRkQ2xhc3MoZS5zbGlkZSwgJ2FjdGl2ZScpO1xuICAgICAgcmVtb3ZlQ2xhc3MoZS5zbGlkZSwgJ2luYWN0aXZlJyk7XG4gICAgfSk7XG4gIH07XG59O1xuXG59LHt9XSwzOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbnZhciBpbnNlcnRlZCA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MsIG9wdGlvbnMpIHtcbiAgICBpZiAoaW5zZXJ0ZWRbY3NzXSkgcmV0dXJuO1xuICAgIGluc2VydGVkW2Nzc10gPSB0cnVlO1xuICAgIFxuICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2NzcycpO1xuXG4gICAgaWYgKCd0ZXh0Q29udGVudCcgaW4gZWxlbSkge1xuICAgICAgZWxlbS50ZXh0Q29udGVudCA9IGNzcztcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gICAgfVxuICAgIFxuICAgIHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnByZXBlbmQpIHtcbiAgICAgICAgaGVhZC5pbnNlcnRCZWZvcmUoZWxlbSwgaGVhZC5jaGlsZE5vZGVzWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBoZWFkLmFwcGVuZENoaWxkKGVsZW0pO1xuICAgIH1cbn07XG5cbn0se31dfSx7fSxbMV0pXG4oMSlcbn0pO1xufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRlY2spIHtcbiAgICB2YXIgYXhpcyA9IG9wdGlvbnMgPT0gJ3ZlcnRpY2FsJyA/ICdZJyA6ICdYJyxcbiAgICAgIHN0YXJ0UG9zaXRpb24sXG4gICAgICBkZWx0YTtcblxuICAgIGRlY2sucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIHN0YXJ0UG9zaXRpb24gPSBlLnRvdWNoZXNbMF1bJ3BhZ2UnICsgYXhpc107XG4gICAgICAgIGRlbHRhID0gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGRlY2sucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLnRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkZWx0YSA9IGUudG91Y2hlc1swXVsncGFnZScgKyBheGlzXSAtIHN0YXJ0UG9zaXRpb247XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBkZWNrLnBhcmVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKE1hdGguYWJzKGRlbHRhKSA+IDUwKSB7XG4gICAgICAgIGRlY2tbZGVsdGEgPiAwID8gJ3ByZXYnIDogJ25leHQnXSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xufTtcbiIsInZhciBmcm9tID0gZnVuY3Rpb24oc2VsZWN0b3JPckVsZW1lbnQsIHBsdWdpbnMpIHtcbiAgdmFyIHBhcmVudCA9IHNlbGVjdG9yT3JFbGVtZW50Lm5vZGVUeXBlID09PSAxID8gc2VsZWN0b3JPckVsZW1lbnQgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yT3JFbGVtZW50KSxcbiAgICBzbGlkZXMgPSBbXS5maWx0ZXIuY2FsbChwYXJlbnQuY2hpbGRyZW4sIGZ1bmN0aW9uKGVsKSB7IHJldHVybiBlbC5ub2RlTmFtZSAhPT0gJ1NDUklQVCc7IH0pLFxuICAgIGFjdGl2ZVNsaWRlID0gc2xpZGVzWzBdLFxuICAgIGxpc3RlbmVycyA9IHt9LFxuXG4gICAgYWN0aXZhdGUgPSBmdW5jdGlvbihpbmRleCwgY3VzdG9tRGF0YSkge1xuICAgICAgaWYgKCFzbGlkZXNbaW5kZXhdKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZmlyZSgnZGVhY3RpdmF0ZScsIGNyZWF0ZUV2ZW50RGF0YShhY3RpdmVTbGlkZSwgY3VzdG9tRGF0YSkpO1xuICAgICAgYWN0aXZlU2xpZGUgPSBzbGlkZXNbaW5kZXhdO1xuICAgICAgZmlyZSgnYWN0aXZhdGUnLCBjcmVhdGVFdmVudERhdGEoYWN0aXZlU2xpZGUsIGN1c3RvbURhdGEpKTtcbiAgICB9LFxuXG4gICAgc2xpZGUgPSBmdW5jdGlvbihpbmRleCwgY3VzdG9tRGF0YSkge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgZmlyZSgnc2xpZGUnLCBjcmVhdGVFdmVudERhdGEoc2xpZGVzW2luZGV4XSwgY3VzdG9tRGF0YSkpICYmIGFjdGl2YXRlKGluZGV4LCBjdXN0b21EYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzbGlkZXMuaW5kZXhPZihhY3RpdmVTbGlkZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0ZXAgPSBmdW5jdGlvbihvZmZzZXQsIGN1c3RvbURhdGEpIHtcbiAgICAgIHZhciBzbGlkZUluZGV4ID0gc2xpZGVzLmluZGV4T2YoYWN0aXZlU2xpZGUpICsgb2Zmc2V0O1xuXG4gICAgICBmaXJlKG9mZnNldCA+IDAgPyAnbmV4dCcgOiAncHJldicsIGNyZWF0ZUV2ZW50RGF0YShhY3RpdmVTbGlkZSwgY3VzdG9tRGF0YSkpICYmIGFjdGl2YXRlKHNsaWRlSW5kZXgsIGN1c3RvbURhdGEpO1xuICAgIH0sXG5cbiAgICBvbiA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIChsaXN0ZW5lcnNbZXZlbnROYW1lXSB8fCAobGlzdGVuZXJzW2V2ZW50TmFtZV0gPSBbXSkpLnB1c2goY2FsbGJhY2spO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxpc3RlbmVyc1tldmVudE5hbWVdID0gbGlzdGVuZXJzW2V2ZW50TmFtZV0uZmlsdGVyKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgICAgcmV0dXJuIGxpc3RlbmVyICE9PSBjYWxsYmFjaztcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBmaXJlID0gZnVuY3Rpb24oZXZlbnROYW1lLCBldmVudERhdGEpIHtcbiAgICAgIHJldHVybiAobGlzdGVuZXJzW2V2ZW50TmFtZV0gfHwgW10pXG4gICAgICAgIC5yZWR1Y2UoZnVuY3Rpb24obm90Q2FuY2VsbGVkLCBjYWxsYmFjaykge1xuICAgICAgICAgIHJldHVybiBub3RDYW5jZWxsZWQgJiYgY2FsbGJhY2soZXZlbnREYXRhKSAhPT0gZmFsc2U7XG4gICAgICAgIH0sIHRydWUpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVFdmVudERhdGEgPSBmdW5jdGlvbihlbCwgZXZlbnREYXRhKSB7XG4gICAgICBldmVudERhdGEgPSBldmVudERhdGEgfHwge307XG4gICAgICBldmVudERhdGEuaW5kZXggPSBzbGlkZXMuaW5kZXhPZihlbCk7XG4gICAgICBldmVudERhdGEuc2xpZGUgPSBlbDtcbiAgICAgIHJldHVybiBldmVudERhdGE7XG4gICAgfSxcblxuICAgIGRlY2sgPSB7XG4gICAgICBvbjogb24sXG4gICAgICBmaXJlOiBmaXJlLFxuICAgICAgc2xpZGU6IHNsaWRlLFxuICAgICAgbmV4dDogc3RlcC5iaW5kKG51bGwsIDEpLFxuICAgICAgcHJldjogc3RlcC5iaW5kKG51bGwsIC0xKSxcbiAgICAgIHBhcmVudDogcGFyZW50LFxuICAgICAgc2xpZGVzOiBzbGlkZXNcbiAgICB9O1xuXG4gIChwbHVnaW5zIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHBsdWdpbikge1xuICAgIHBsdWdpbihkZWNrKTtcbiAgfSk7XG5cbiAgYWN0aXZhdGUoMCk7XG5cbiAgcmV0dXJuIGRlY2s7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZnJvbTogZnJvbVxufTtcbiIsIi8vIFJlcXVpcmUgTm9kZSBtb2R1bGVzIGluIHRoZSBicm93c2VyIHRoYW5rcyB0byBCcm93c2VyaWZ5OiBodHRwOi8vYnJvd3NlcmlmeS5vcmdcbnZhciBiZXNwb2tlID0gcmVxdWlyZSgnYmVzcG9rZScpLFxuICBjdWJlID0gcmVxdWlyZSgnYmVzcG9rZS10aGVtZS1jdWJlJyksXG4gIGtleXMgPSByZXF1aXJlKCdiZXNwb2tlLWtleXMnKSxcbiAgdG91Y2ggPSByZXF1aXJlKCdiZXNwb2tlLXRvdWNoJyksXG4gIGJ1bGxldHMgPSByZXF1aXJlKCdiZXNwb2tlLWJ1bGxldHMnKSxcbiAgYmFja2Ryb3AgPSByZXF1aXJlKCdiZXNwb2tlLWJhY2tkcm9wJyksXG4gIHNjYWxlID0gcmVxdWlyZSgnYmVzcG9rZS1zY2FsZScpLFxuICBoYXNoID0gcmVxdWlyZSgnYmVzcG9rZS1oYXNoJyksXG4gIHByb2dyZXNzID0gcmVxdWlyZSgnYmVzcG9rZS1wcm9ncmVzcycpO1xuXG4vLyBCZXNwb2tlLmpzXG5iZXNwb2tlLmZyb20oJ2FydGljbGUnLCBbXG4gIGN1YmUoKSxcbiAga2V5cygpLFxuICB0b3VjaCgpLFxuICBidWxsZXRzKCdsaSwgLmJ1bGxldCcpLFxuICBiYWNrZHJvcCgpLFxuICBzY2FsZSgpLFxuICBoYXNoKCksXG4gIHByb2dyZXNzKClcbl0pO1xuIl19
>>>>>>> 64c4a457c52eba91d830914358a92c8cd1372f7c
