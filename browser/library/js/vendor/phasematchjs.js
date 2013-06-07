/**
 * phasematchjs v0.0.1a - 2013-06-07
 *  ENTER_DESCRIPTION 
 *
 * Copyright (c) 2013 Krister Shalm <kshalm@gmail.com>
 * Licensed GPLv3
 */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals (root is window)
        root.PhaseMatch = factory();
    }
}(this, function() {

'use strict';
var PhaseMatch = { util: {} };

(function(){

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Detect free variable `global`, from Node.js or Browserified code, and use it as `window` */
  var freeGlobal = typeof global == 'object' && global;
  if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
    window = freeGlobal;
  }

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used internally to indicate various things */
  var indicatorObject = {};

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 200;

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /** Used to match HTML entities */
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-7.8.6
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to match HTML characters */
  var reUnescapedHtml = /[&<>"']/g;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to fix the JScript [[DontEnum]] bug */
  var shadowedProps = [
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
    'toLocaleString', 'toString', 'valueOf'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /*--------------------------------------------------------------------------*/

  /** Used for `Array` and `Object` method references */
  var arrayRef = Array(),
      objectRef = Object();

  /** Used to restore the original `_` reference in `noConflict` */
  var oldDash = window._;

  /** Used to detect if a method is native */
  var reNative = RegExp('^' +
    String(objectRef.valueOf)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/valueOf|for [^\]]+/g, '.+?') + '$'
  );

  /** Native method shortcuts */
  var ceil = Math.ceil,
      clearTimeout = window.clearTimeout,
      concat = arrayRef.concat,
      floor = Math.floor,
      hasOwnProperty = objectRef.hasOwnProperty,
      push = arrayRef.push,
      setTimeout = window.setTimeout,
      toString = objectRef.toString;

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeBind = reNative.test(nativeBind = toString.bind) && nativeBind,
      nativeIsArray = reNative.test(nativeIsArray = Array.isArray) && nativeIsArray,
      nativeIsFinite = window.isFinite,
      nativeIsNaN = window.isNaN,
      nativeKeys = reNative.test(nativeKeys = Object.keys) && nativeKeys,
      nativeMax = Math.max,
      nativeMin = Math.min,
      nativeRandom = Math.random,
      nativeSlice = arrayRef.slice;

  /** Detect various environments */
  var isIeOpera = reNative.test(window.attachEvent),
      isV8 = nativeBind && !/\n|true/.test(nativeBind + isIeOpera);

  /** Used to lookup a built-in constructor by [[Class]] */
  var ctorByClass = {};
  ctorByClass[arrayClass] = Array;
  ctorByClass[boolClass] = Boolean;
  ctorByClass[dateClass] = Date;
  ctorByClass[objectClass] = Object;
  ctorByClass[numberClass] = Number;
  ctorByClass[regexpClass] = RegExp;
  ctorByClass[stringClass] = String;

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a `lodash` object, which wraps the given `value`, to enable method
   * chaining.
   *
   * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
   * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
   * and `unshift`
   *
   * Chaining is supported in custom builds as long as the `value` method is
   * implicitly or explicitly included in the build.
   *
   * The chainable wrapper functions are:
   * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
   * `compose`, `concat`, `countBy`, `createCallback`, `debounce`, `defaults`,
   * `defer`, `delay`, `difference`, `filter`, `flatten`, `forEach`, `forIn`,
   * `forOwn`, `functions`, `groupBy`, `initial`, `intersection`, `invert`,
   * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
   * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `push`, `range`,
   * `reject`, `rest`, `reverse`, `shuffle`, `slice`, `sort`, `sortBy`, `splice`,
   * `tap`, `throttle`, `times`, `toArray`, `union`, `uniq`, `unshift`, `unzip`,
   * `values`, `where`, `without`, `wrap`, and `zip`
   *
   * The non-chainable wrapper functions are:
   * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `has`,
   * `identity`, `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`,
   * `isElement`, `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`,
   * `isNull`, `isNumber`, `isObject`, `isPlainObject`, `isRegExp`, `isString`,
   * `isUndefined`, `join`, `lastIndexOf`, `mixin`, `noConflict`, `parseInt`,
   * `pop`, `random`, `reduce`, `reduceRight`, `result`, `shift`, `size`, `some`,
   * `sortedIndex`, `runInContext`, `template`, `unescape`, `uniqueId`, and `value`
   *
   * The wrapper functions `first` and `last` return wrapped values when `n` is
   * passed, otherwise they return unwrapped values.
   *
   * @name _
   * @constructor
   * @category Chaining
   * @param {Mixed} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns a `lodash` instance.
   * @example
   *
   * var wrapped = _([1, 2, 3]);
   *
   * // returns an unwrapped value
   * wrapped.reduce(function(sum, num) {
   *   return sum + num;
   * });
   * // => 6
   *
   * // returns a wrapped value
   * var squares = wrapped.map(function(num) {
   *   return num * num;
   * });
   *
   * _.isArray(squares);
   * // => false
   *
   * _.isArray(squares.value());
   * // => true
   */
  function lodash() {
    // no operation performed
  }

  /**
   * An object used to flag environments features.
   *
   * @static
   * @memberOf _
   * @type Object
   */
  var support = lodash.support = {};

  (function() {
    var ctor = function() { this.x = 1; },
        props = [];

    ctor.prototype = { 'valueOf': 1, 'y': 1 };
    for (var prop in new ctor) { props.push(prop); }
    for (prop in arguments) { }

    /**
     * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);

    /**
     * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.argsClass = isArguments(arguments);

    /**
     * Detect if `prototype` properties are enumerable by default.
     *
     * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
     * (if the prototype or a property on the prototype has been set)
     * incorrectly sets a function's `prototype` property [[Enumerable]]
     * value to `true`.
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.enumPrototypes = ctor.propertyIsEnumerable('prototype');

    /**
     * Detect if `Function#bind` exists and is inferred to be fast (all but V8).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.fastBind = nativeBind && !isV8;

    /**
     * Detect if `arguments` object indexes are non-enumerable
     * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.nonEnumArgs = prop != 0;

    /**
     * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
     *
     * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
     * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.nonEnumShadows = !/valueOf/.test(props);

    /**
     * Detect lack of support for accessing string characters by index.
     *
     * IE < 8 can't access characters by index and IE 8 can only access
     * characters by index on string literals.
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';

    /**
     * Detect if a DOM node's [[Class]] is resolvable (all but IE < 9)
     * and that the JS engine errors when attempting to coerce an object to
     * a string without a `toString` function.
     *
     * @memberOf _.support
     * @type Boolean
     */
    try {
      support.nodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));
    } catch(e) {
      support.nodeClass = true;
    }
  }(1));

  /*--------------------------------------------------------------------------*/

  /**
   * The template used to create iterator functions.
   *
   * @private
   * @param {Object} data The data object used to populate the text.
   * @returns {String} Returns the interpolated text.
   */
  var iteratorTemplate = function(obj) {

    var __p = 'var index, iterable = ' +
    (obj.firstArg) +
    ', result = ' +
    (obj.init) +
    ';\nif (!iterable) return result;\n' +
    (obj.top) +
    ';\n';
     if (obj.arrays) {
    __p += 'var length = iterable.length; index = -1;\nif (' +
    (obj.arrays) +
    ') {  ';
     if (support.unindexedChars) {
    __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
     }
    __p += '\n  while (++index < length) {\n    ' +
    (obj.loop) +
    '\n  }\n}\nelse {  ';
      } else if (support.nonEnumArgs) {
    __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
    (obj.loop) +
    '\n    }\n  } else {  ';
     }

     if (support.enumPrototypes) {
    __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
     }

     if (obj.useHas && obj.useKeys) {
    __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] ? keys(iterable) : [],\n      length = ownProps.length;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n    ';
     if (support.enumPrototypes) {
    __p += 'if (!(skipProto && index == \'prototype\')) {\n  ';
     }
    __p += 
    (obj.loop);
     if (support.enumPrototypes) {
    __p += '}\n';
     }
    __p += '  }  ';
     } else {
    __p += '\n  for (index in iterable) {';
        if (support.enumPrototypes || obj.useHas) {
    __p += '\n    if (';
          if (support.enumPrototypes) {
    __p += '!(skipProto && index == \'prototype\')';
     }      if (support.enumPrototypes && obj.useHas) {
    __p += ' && ';
     }      if (obj.useHas) {
    __p += 'hasOwnProperty.call(iterable, index)';
     }
    __p += ') {    ';
     }
    __p += 
    (obj.loop) +
    ';    ';
     if (support.enumPrototypes || obj.useHas) {
    __p += '\n    }';
     }
    __p += '\n  }    ';
     if (support.nonEnumShadows) {
    __p += '\n\n  var ctor = iterable.constructor;\n      ';
     for (var k = 0; k < 7; k++) {
    __p += '\n  index = \'' +
    (obj.shadowedProps[k]) +
    '\';\n  if (';
          if (obj.shadowedProps[k] == 'constructor') {
    __p += '!(ctor && ctor.prototype === iterable) && ';
          }
    __p += 'hasOwnProperty.call(iterable, index)) {\n    ' +
    (obj.loop) +
    '\n  }      ';
     }

     }

     }

     if (obj.arrays || support.nonEnumArgs) {
    __p += '\n}';
     }
    __p += 
    (obj.bottom) +
    ';\nreturn result';

    return __p
  };

  /** Reusable iterator options for `assign` and `defaults` */
  var defaultsIteratorOptions = {
    'args': 'object, source, guard',
    'top':
      'var args = arguments,\n' +
      '    argsIndex = 0,\n' +
      "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" +
      'while (++argsIndex < argsLength) {\n' +
      '  iterable = args[argsIndex];\n' +
      '  if (iterable && objectTypes[typeof iterable]) {',
    'loop': "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
    'bottom': '  }\n}'
  };

  /** Reusable iterator options shared by `each`, `forIn`, and `forOwn` */
  var eachIteratorOptions = {
    'args': 'collection, callback, thisArg',
    'top': "callback = callback && typeof thisArg == 'undefined' ? callback : lodash.createCallback(callback, thisArg)",
    'arrays': "typeof length == 'number'",
    'loop': 'if (callback(iterable[index], index, collection) === false) return result'
  };

  /** Reusable iterator options for `forIn` and `forOwn` */
  var forOwnIteratorOptions = {
    'top': 'if (!objectTypes[typeof iterable]) return result;\n' + eachIteratorOptions.top,
    'arrays': false
  };

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a function optimized to search large arrays for a given `value`,
   * starting at `fromIndex`, using strict equality for comparisons, i.e. `===`.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {Mixed} value The value to search for.
   * @returns {Boolean} Returns `true`, if `value` is found, else `false`.
   */
  function cachedContains(array) {
    var length = array.length,
        isLarge = length >= largeArraySize;

    if (isLarge) {
      var cache = {},
          index = -1;

      while (++index < length) {
        var key = keyPrefix + array[index];
        (cache[key] || (cache[key] = [])).push(array[index]);
      }
    }
    return function(value) {
      if (isLarge) {
        var key = keyPrefix + value;
        return  cache[key] && indexOf(cache[key], value) > -1;
      }
      return indexOf(array, value) > -1;
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default `callback` when a given
   * `collection` is a string value.
   *
   * @private
   * @param {String} value The character to inspect.
   * @returns {Number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` values, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {Number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ai = a.index,
        bi = b.index;

    a = a.criteria;
    b = b.criteria;

    // ensure a stable sort in V8 and other engines
    // http://code.google.com/p/v8/issues/detail?id=90
    if (a !== b) {
      if (a > b || typeof a == 'undefined') {
        return 1;
      }
      if (a < b || typeof b == 'undefined') {
        return -1;
      }
    }
    return ai < bi ? -1 : 1;
  }

  /**
   * Creates a function that, when called, invokes `func` with the `this` binding
   * of `thisArg` and prepends any `partialArgs` to the arguments passed to the
   * bound function.
   *
   * @private
   * @param {Function|String} func The function to bind or the method name.
   * @param {Mixed} [thisArg] The `this` binding of `func`.
   * @param {Array} partialArgs An array of arguments to be partially applied.
   * @param {Object} [idicator] Used to indicate binding by key or partially
   *  applying arguments from the right.
   * @returns {Function} Returns the new bound function.
   */
  function createBound(func, thisArg, partialArgs, indicator) {
    var isFunc = isFunction(func),
        isPartial = !partialArgs,
        key = thisArg;

    // juggle arguments
    if (isPartial) {
      var rightIndicator = indicator;
      partialArgs = thisArg;
    }
    else if (!isFunc) {
      if (!indicator) {
        throw new TypeError;
      }
      thisArg = func;
    }

    function bound() {
      // `Function#bind` spec
      // http://es5.github.com/#x15.3.4.5
      var args = arguments,
          thisBinding = isPartial ? this : thisArg;

      if (!isFunc) {
        func = thisArg[key];
      }
      if (partialArgs.length) {
        args = args.length
          ? (args = nativeSlice.call(args), rightIndicator ? args.concat(partialArgs) : partialArgs.concat(args))
          : partialArgs;
      }
      if (this instanceof bound) {
        // ensure `new bound` is an instance of `func`
        noop.prototype = func.prototype;
        thisBinding = new noop;
        noop.prototype = null;

        // mimic the constructor's `return` behavior
        // http://es5.github.com/#x13.2.2
        var result = func.apply(thisBinding, args);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisBinding, args);
    }
    return bound;
  }

  /**
   * Creates compiled iteration functions.
   *
   * @private
   * @param {Object} [options1, options2, ...] The compile options object(s).
   *  arrays - A string of code to determine if the iterable is an array or array-like.
   *  useHas - A boolean to specify using `hasOwnProperty` checks in the object loop.
   *  useKeys - A boolean to specify using `_.keys` for own property iteration.
   *  args - A string of comma separated arguments the iteration function will accept.
   *  top - A string of code to execute before the iteration branches.
   *  loop - A string of code to execute in the object loop.
   *  bottom - A string of code to execute after the iteration branches.
   * @returns {Function} Returns the compiled function.
   */
  function createIterator() {
    var data = {
      // data properties
      'shadowedProps': shadowedProps,
      // iterator options
      'arrays': 'isArray(iterable)',
      'bottom': '',
      'init': 'iterable',
      'loop': '',
      'top': '',
      'useHas': true,
      'useKeys': !!keys
    };

    // merge options into a template data object
    for (var object, index = 0; object = arguments[index]; index++) {
      for (var key in object) {
        data[key] = object[key];
      }
    }
    var args = data.args;
    data.firstArg = /^[^,]+/.exec(args)[0];

    // create the function factory
    var factory = Function(
        'hasOwnProperty, isArguments, isArray, isString, keys, ' +
        'lodash, objectTypes',
      'return function(' + args + ') {\n' + iteratorTemplate(data) + '\n}'
    );
    // return the compiled function
    return factory(
      hasOwnProperty, isArguments, isArray, isString, keys,
      lodash, objectTypes
    );
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {String} match The matched character to escape.
   * @returns {String} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Used by `escape` to convert characters to HTML entities.
   *
   * @private
   * @param {String} match The matched character to escape.
   * @returns {String} Returns the escaped character.
   */
  function escapeHtmlChar(match) {
    return htmlEscapes[match];
  }

  /**
   * Checks if `value` is a DOM node in IE < 9.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a DOM node, else `false`.
   */
  function isNode(value) {
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
    // methods that are `typeof` "string" and still can coerce nodes to strings
    return typeof value.toString != 'function' && typeof (value + '') == 'string';
  }

  /**
   * A no-operation function.
   *
   * @private
   */
  function noop() {
    // no operation performed
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used, instead of `Array#slice`, to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|String} collection The collection to slice.
   * @param {Number} start The start index.
   * @param {Number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /**
   * Used by `unescape` to convert HTML entities to characters.
   *
   * @private
   * @param {String} match The matched character to unescape.
   * @returns {String} Returns the unescaped character.
   */
  function unescapeHtmlChar(match) {
    return htmlUnescapes[match];
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Checks if `value` is an `arguments` object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if the `value` is an `arguments` object, else `false`.
   * @example
   *
   * (function() { return _.isArguments(arguments); })(1, 2, 3);
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    return toString.call(value) == argsClass;
  }
  // fallback for browsers that can't detect `arguments` objects by [[Class]]
  if (!support.argsClass) {
    isArguments = function(value) {
      return value ? hasOwnProperty.call(value, 'callee') : false;
    };
  }

  /**
   * Checks if `value` is an array.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if the `value` is an array, else `false`.
   * @example
   *
   * (function() { return _.isArray(arguments); })();
   * // => false
   *
   * _.isArray([1, 2, 3]);
   * // => true
   */
  var isArray = nativeIsArray || function(value) {
    return value ? (typeof value == 'object' && toString.call(value) == arrayClass) : false;
  };

  /**
   * A fallback implementation of `Object.keys` which produces an array of the
   * given object's own enumerable property names.
   *
   * @private
   * @type Function
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns a new array of property names.
   */
  var shimKeys = createIterator({
    'args': 'object',
    'init': '[]',
    'top': 'if (!(objectTypes[typeof object])) return result',
    'loop': 'result.push(index)',
    'arrays': false
  });

  /**
   * Creates an array composed of the own enumerable property names of `object`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns a new array of property names.
   * @example
   *
   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
   * // => ['one', 'two', 'three'] (order is not guaranteed)
   */
  var keys = !nativeKeys ? shimKeys : function(object) {
    if (!isObject(object)) {
      return [];
    }
    if ((support.enumPrototypes && typeof object == 'function') ||
        (support.nonEnumArgs && object.length && isArguments(object))) {
      return shimKeys(object);
    }
    return nativeKeys(object);
  };

  /**
   * A function compiled to iterate `arguments` objects, arrays, objects, and
   * strings consistenly across environments, executing the `callback` for each
   * element in the `collection`. The `callback` is bound to `thisArg` and invoked
   * with three arguments; (value, index|key, collection). Callbacks may exit
   * iteration early by explicitly returning `false`.
   *
   * @private
   * @type Function
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Array|Object|String} Returns `collection`.
   */
  var each = createIterator(eachIteratorOptions);

  /**
   * Used to convert characters to HTML entities:
   *
   * Though the `>` character is escaped for symmetry, characters like `>` and `/`
   * don't require escaping in HTML and have no special meaning unless they're part
   * of a tag or an unquoted attribute value.
   * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
   */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  /** Used to convert HTML entities to characters */
  var htmlUnescapes = {'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#x27;':"'"};

  /*--------------------------------------------------------------------------*/

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object. Subsequent sources will overwrite property assignments of previous
   * sources. If a `callback` function is passed, it will be executed to produce
   * the assigned values. The `callback` is bound to `thisArg` and invoked with
   * two arguments; (objectValue, sourceValue).
   *
   * @static
   * @memberOf _
   * @type Function
   * @alias extend
   * @category Objects
   * @param {Object} object The destination object.
   * @param {Object} [source1, source2, ...] The source objects.
   * @param {Function} [callback] The function to customize assigning values.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * _.assign({ 'name': 'moe' }, { 'age': 40 });
   * // => { 'name': 'moe', 'age': 40 }
   *
   * var defaults = _.partialRight(_.assign, function(a, b) {
   *   return typeof a == 'undefined' ? b : a;
   * });
   *
   * var food = { 'name': 'apple' };
   * defaults(food, { 'name': 'banana', 'type': 'fruit' });
   * // => { 'name': 'apple', 'type': 'fruit' }
   */
  var assign = createIterator(defaultsIteratorOptions, {
    'top':
      defaultsIteratorOptions.top.replace(';',
        ';\n' +
        "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" +
        '  var callback = lodash.createCallback(args[--argsLength - 1], args[argsLength--], 2);\n' +
        "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" +
        '  callback = args[--argsLength];\n' +
        '}'
      ),
    'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
  });

  /**
   * Creates a clone of `value`. If `deep` is `true`, nested objects will also
   * be cloned, otherwise they will be assigned by reference. If a `callback`
   * function is passed, it will be executed to produce the cloned values. If
   * `callback` returns `undefined`, cloning will be handled by the method instead.
   * The `callback` is bound to `thisArg` and invoked with one argument; (value).
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to clone.
   * @param {Boolean} [deep=false] A flag to indicate a deep clone.
   * @param {Function} [callback] The function to customize cloning values.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @param- {Array} [stackA=[]] Tracks traversed source objects.
   * @param- {Array} [stackB=[]] Associates clones with source counterparts.
   * @returns {Mixed} Returns the cloned `value`.
   * @example
   *
   * var stooges = [
   *   { 'name': 'moe', 'age': 40 },
   *   { 'name': 'larry', 'age': 50 }
   * ];
   *
   * var shallow = _.clone(stooges);
   * shallow[0] === stooges[0];
   * // => true
   *
   * var deep = _.clone(stooges, true);
   * deep[0] === stooges[0];
   * // => false
   *
   * _.mixin({
   *   'clone': _.partialRight(_.clone, function(value) {
   *     return _.isElement(value) ? value.cloneNode(false) : undefined;
   *   })
   * });
   *
   * var clone = _.clone(document.body);
   * clone.childNodes.length;
   * // => 0
   */
  function clone(value, deep, callback, thisArg, stackA, stackB) {
    var result = value;

    // allows working with "Collections" methods without using their `callback`
    // argument, `index|key`, for this method's `callback`
    if (typeof deep == 'function') {
      thisArg = callback;
      callback = deep;
      deep = false;
    }
    if (typeof callback == 'function') {
      callback = (typeof thisArg == 'undefined')
        ? callback
        : lodash.createCallback(callback, thisArg, 1);

      result = callback(result);
      if (typeof result != 'undefined') {
        return result;
      }
      result = value;
    }
    // inspect [[Class]]
    var isObj = isObject(result);
    if (isObj) {
      var className = toString.call(result);
      if (!cloneableClasses[className] || (!support.nodeClass && isNode(result))) {
        return result;
      }
      var isArr = isArray(result);
    }
    // shallow clone
    if (!isObj || !deep) {
      return isObj
        ? (isArr ? slice(result) : assign({}, result))
        : result;
    }
    var ctor = ctorByClass[className];
    switch (className) {
      case boolClass:
      case dateClass:
        return new ctor(+result);

      case numberClass:
      case stringClass:
        return new ctor(result);

      case regexpClass:
        return ctor(result.source, reFlags.exec(result));
    }
    // check for circular references and return corresponding clone
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == value) {
        return stackB[length];
      }
    }
    // init cloned object
    result = isArr ? ctor(result.length) : {};

    // add array properties assigned by `RegExp#exec`
    if (isArr) {
      if (hasOwnProperty.call(value, 'index')) {
        result.index = value.index;
      }
      if (hasOwnProperty.call(value, 'input')) {
        result.input = value.input;
      }
    }
    // add the source value to the stack of traversed objects
    // and associate it with its clone
    stackA.push(value);
    stackB.push(result);

    // recursively populate clone (susceptible to call stack limits)
    (isArr ? forEach : forOwn)(value, function(objValue, key) {
      result[key] = clone(objValue, deep, callback, undefined, stackA, stackB);
    });

    return result;
  }

  /**
   * Iterates over `object`'s own and inherited enumerable properties, executing
   * the `callback` for each property. The `callback` is bound to `thisArg` and
   * invoked with three arguments; (value, key, object). Callbacks may exit iteration
   * early by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * function Dog(name) {
   *   this.name = name;
   * }
   *
   * Dog.prototype.bark = function() {
   *   alert('Woof, woof!');
   * };
   *
   * _.forIn(new Dog('Dagny'), function(value, key) {
   *   alert(key);
   * });
   * // => alerts 'name' and 'bark' (order is not guaranteed)
   */
  var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {
    'useHas': false
  });

  /**
   * Iterates over an object's own enumerable properties, executing the `callback`
   * for each property. The `callback` is bound to `thisArg` and invoked with three
   * arguments; (value, key, object). Callbacks may exit iteration early by explicitly
   * returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
   *   alert(key);
   * });
   * // => alerts '0', '1', and 'length' (order is not guaranteed)
   */
  var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);

  /**
   * Performs a deep comparison between two values to determine if they are
   * equivalent to each other. If `callback` is passed, it will be executed to
   * compare values. If `callback` returns `undefined`, comparisons will be handled
   * by the method instead. The `callback` is bound to `thisArg` and invoked with
   * two arguments; (a, b).
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} a The value to compare.
   * @param {Mixed} b The other value to compare.
   * @param {Function} [callback] The function to customize comparing values.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @param- {Array} [stackA=[]] Tracks traversed `a` objects.
   * @param- {Array} [stackB=[]] Tracks traversed `b` objects.
   * @returns {Boolean} Returns `true`, if the values are equivalent, else `false`.
   * @example
   *
   * var moe = { 'name': 'moe', 'age': 40 };
   * var copy = { 'name': 'moe', 'age': 40 };
   *
   * moe == copy;
   * // => false
   *
   * _.isEqual(moe, copy);
   * // => true
   *
   * var words = ['hello', 'goodbye'];
   * var otherWords = ['hi', 'goodbye'];
   *
   * _.isEqual(words, otherWords, function(a, b) {
   *   var reGreet = /^(?:hello|hi)$/i,
   *       aGreet = _.isString(a) && reGreet.test(a),
   *       bGreet = _.isString(b) && reGreet.test(b);
   *
   *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
   * });
   * // => true
   */
  function isEqual(a, b, callback, thisArg, stackA, stackB) {
    // used to indicate that when comparing objects, `a` has at least the properties of `b`
    var whereIndicator = callback === indicatorObject;
    if (typeof callback == 'function' && !whereIndicator) {
      callback = lodash.createCallback(callback, thisArg, 2);
      var result = callback(a, b);
      if (typeof result != 'undefined') {
        return !!result;
      }
    }
    // exit early for identical values
    if (a === b) {
      // treat `+0` vs. `-0` as not equal
      return a !== 0 || (1 / a == 1 / b);
    }
    var type = typeof a,
        otherType = typeof b;

    // exit early for unlike primitive values
    if (a === a &&
        (!a || (type != 'function' && type != 'object')) &&
        (!b || (otherType != 'function' && otherType != 'object'))) {
      return false;
    }
    // exit early for `null` and `undefined`, avoiding ES3's Function#call behavior
    // http://es5.github.com/#x15.3.4.4
    if (a == null || b == null) {
      return a === b;
    }
    // compare [[Class]] names
    var className = toString.call(a),
        otherClass = toString.call(b);

    if (className == argsClass) {
      className = objectClass;
    }
    if (otherClass == argsClass) {
      otherClass = objectClass;
    }
    if (className != otherClass) {
      return false;
    }
    switch (className) {
      case boolClass:
      case dateClass:
        // coerce dates and booleans to numbers, dates to milliseconds and booleans
        // to `1` or `0`, treating invalid dates coerced to `NaN` as not equal
        return +a == +b;

      case numberClass:
        // treat `NaN` vs. `NaN` as equal
        return (a != +a)
          ? b != +b
          // but treat `+0` vs. `-0` as not equal
          : (a == 0 ? (1 / a == 1 / b) : a == +b);

      case regexpClass:
      case stringClass:
        // coerce regexes to strings (http://es5.github.com/#x15.10.6.4)
        // treat string primitives and their corresponding object instances as equal
        return a == String(b);
    }
    var isArr = className == arrayClass;
    if (!isArr) {
      // unwrap any `lodash` wrapped values
      if (hasOwnProperty.call(a, '__wrapped__ ') || hasOwnProperty.call(b, '__wrapped__')) {
        return isEqual(a.__wrapped__ || a, b.__wrapped__ || b, callback, thisArg, stackA, stackB);
      }
      // exit for functions and DOM nodes
      if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
        return false;
      }
      // in older versions of Opera, `arguments` objects have `Array` constructors
      var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
          ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;

      // non `Object` object instances with different constructors are not equal
      if (ctorA != ctorB && !(
            isFunction(ctorA) && ctorA instanceof ctorA &&
            isFunction(ctorB) && ctorB instanceof ctorB
          )) {
        return false;
      }
    }
    // assume cyclic structures are equal
    // the algorithm for detecting cyclic structures is adapted from ES 5.1
    // section 15.12.3, abstract operation `JO` (http://es5.github.com/#x15.12.3)
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == a) {
        return stackB[length] == b;
      }
    }
    var size = 0;
    result = true;

    // add `a` and `b` to the stack of traversed objects
    stackA.push(a);
    stackB.push(b);

    // recursively compare objects and arrays (susceptible to call stack limits)
    if (isArr) {
      length = a.length;
      size = b.length;

      // compare lengths to determine if a deep comparison is necessary
      result = size == a.length;
      if (!result && !whereIndicator) {
        return result;
      }
      // deep compare the contents, ignoring non-numeric properties
      while (size--) {
        var index = length,
            value = b[size];

        if (whereIndicator) {
          while (index--) {
            if ((result = isEqual(a[index], value, callback, thisArg, stackA, stackB))) {
              break;
            }
          }
        } else if (!(result = isEqual(a[size], value, callback, thisArg, stackA, stackB))) {
          break;
        }
      }
      return result;
    }
    // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
    // which, in this case, is more costly
    forIn(b, function(value, key, b) {
      if (hasOwnProperty.call(b, key)) {
        // count the number of properties.
        size++;
        // deep compare each property value.
        return (result = hasOwnProperty.call(a, key) && isEqual(a[key], value, callback, thisArg, stackA, stackB));
      }
    });

    if (result && !whereIndicator) {
      // ensure both objects have the same number of properties
      forIn(a, function(value, key, a) {
        if (hasOwnProperty.call(a, key)) {
          // `size` will be `-1` if `a` has more properties than `b`
          return (result = --size > -1);
        }
      });
    }
    return result;
  }

  /**
   * Checks if `value` is a function.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if the `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   */
  function isFunction(value) {
    return typeof value == 'function';
  }
  // fallback for older versions of Chrome and Safari
  if (isFunction(/x/)) {
    isFunction = function(value) {
      return typeof value == 'function' && toString.call(value) == funcClass;
    };
  }

  /**
   * Checks if `value` is the language type of Object.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if the `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // check if the value is the ECMAScript language type of Object
    // http://es5.github.com/#x8
    // and avoid a V8 bug
    // http://code.google.com/p/v8/issues/detail?id=2291
    return value ? objectTypes[typeof value] : false;
  }

  /**
   * Checks if `value` is a string.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if the `value` is a string, else `false`.
   * @example
   *
   * _.isString('moe');
   * // => true
   */
  function isString(value) {
    return typeof value == 'string' || toString.call(value) == stringClass;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Iterates over a `collection`, executing the `callback` for each element in
   * the `collection`. The `callback` is bound to `thisArg` and invoked with three
   * arguments; (value, index|key, collection). Callbacks may exit iteration early
   * by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @alias each
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Array|Object|String} Returns `collection`.
   * @example
   *
   * _([1, 2, 3]).forEach(alert).join(',');
   * // => alerts each number and returns '1,2,3'
   *
   * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, alert);
   * // => alerts each number value (order is not guaranteed)
   */
  function forEach(collection, callback, thisArg) {
    if (callback && typeof thisArg == 'undefined' && isArray(collection)) {
      var index = -1,
          length = collection.length;

      while (++index < length) {
        if (callback(collection[index], index, collection) === false) {
          break;
        }
      }
    } else {
      each(collection, callback, thisArg);
    }
    return collection;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a function that, when called, invokes `func` with the `this`
   * binding of `thisArg` and prepends any additional `bind` arguments to those
   * passed to the bound function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to bind.
   * @param {Mixed} [thisArg] The `this` binding of `func`.
   * @param {Mixed} [arg1, arg2, ...] Arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var func = function(greeting) {
   *   return greeting + ' ' + this.name;
   * };
   *
   * func = _.bind(func, { 'name': 'moe' }, 'hi');
   * func();
   * // => 'hi moe'
   */
  function bind(func, thisArg) {
    // use `Function#bind` if it exists and is fast
    // (in V8 `Function#bind` is slower except when partially applied)
    return support.fastBind || (nativeBind && arguments.length > 2)
      ? nativeBind.call.apply(nativeBind, arguments)
      : createBound(func, thisArg, nativeSlice.call(arguments, 2));
  }

  /**
   * Produces a callback bound to an optional `thisArg`. If `func` is a property
   * name, the created callback will return the property value for a given element.
   * If `func` is an object, the created callback will return `true` for elements
   * that contain the equivalent object properties, otherwise it will return `false`.
   *
   * Note: All Lo-Dash methods, that accept a `callback` argument, use `_.createCallback`.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Mixed} [func=identity] The value to convert to a callback.
   * @param {Mixed} [thisArg] The `this` binding of the created callback.
   * @param {Number} [argCount=3] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   * @example
   *
   * var stooges = [
   *   { 'name': 'moe', 'age': 40 },
   *   { 'name': 'larry', 'age': 50 }
   * ];
   *
   * // wrap to create custom callback shorthands
   * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
   *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
   *   return !match ? func(callback, thisArg) : function(object) {
   *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
   *   };
   * });
   *
   * _.filter(stooges, 'age__gt45');
   * // => [{ 'name': 'larry', 'age': 50 }]
   *
   * // create mixins with support for "_.pluck" and "_.where" callback shorthands
   * _.mixin({
   *   'toLookup': function(collection, callback, thisArg) {
   *     callback = _.createCallback(callback, thisArg);
   *     return _.reduce(collection, function(result, value, index, collection) {
   *       return (result[callback(value, index, collection)] = value, result);
   *     }, {});
   *   }
   * });
   *
   * _.toLookup(stooges, 'name');
   * // => { 'moe': { 'name': 'moe', 'age': 40 }, 'larry': { 'name': 'larry', 'age': 50 } }
   */
  function createCallback(func, thisArg, argCount) {
    if (func == null) {
      return identity;
    }
    var type = typeof func;
    if (type != 'function') {
      if (type != 'object') {
        return function(object) {
          return object[func];
        };
      }
      var props = keys(func);
      return function(object) {
        var length = props.length,
            result = false;
        while (length--) {
          if (!(result = isEqual(object[props[length]], func[props[length]], indicatorObject))) {
            break;
          }
        }
        return result;
      };
    }
    if (typeof thisArg != 'undefined') {
      if (argCount === 1) {
        return function(value) {
          return func.call(thisArg, value);
        };
      }
      if (argCount === 2) {
        return function(a, b) {
          return func.call(thisArg, a, b);
        };
      }
      if (argCount === 4) {
        return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return function(value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
    }
    return func;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * This function returns the first argument passed to it.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Mixed} value Any value.
   * @returns {Mixed} Returns `value`.
   * @example
   *
   * var moe = { 'name': 'moe' };
   * moe === _.identity(moe);
   * // => true
   */
  function identity(value) {
    return value;
  }

  /*--------------------------------------------------------------------------*/

  lodash.assign = assign;
  lodash.bind = bind;
  lodash.createCallback = createCallback;
  lodash.forEach = forEach;
  lodash.forIn = forIn;
  lodash.forOwn = forOwn;
  lodash.keys = keys;

  lodash.each = forEach;
  lodash.extend = assign;

  /*--------------------------------------------------------------------------*/

  // add functions that return unwrapped values when chaining
  lodash.clone = clone;
  lodash.identity = identity;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isEqual = isEqual;
  lodash.isFunction = isFunction;
  lodash.isObject = isObject;
  lodash.isString = isString;

  /*--------------------------------------------------------------------------*/

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type String
   */
  lodash.VERSION = '1.2.1';

  /*--------------------------------------------------------------------------*/

;lodash.extend(PhaseMatch.util, lodash);}());
var nm = Math.pow(10, -9);
var um = Math.pow(10, -6);
var lightspeed =  2.99792458 * Math.pow(10, 8);

PhaseMatch.constants = {
    // user accessible constants
    um: um,
    nm: nm,
    c: lightspeed
};
function sq( x ){
    return x * x;
}

/*
A series of helper functions
 */
PhaseMatch.Sum = function Sum(A){
    var total=0;
    var l = A.length;
    for(var i=0; i<l; i++) { 
        total += A[i]; 
    }
    return total;
};

PhaseMatch.min = function min(A){
    var minval=A[0];
    var l = A.length;
    for(var i=0; i<l; i++) { 
        if (A[i]<minval){
          minval = A[i];
        } 
    }
    return minval;
};

PhaseMatch.Transpose = function Transpose(A, dim){
    var Trans = new Float64Array(dim*dim);
    var l = A.length;
    for(var i=0; i<l; i++) { 
        var index_c = i % dim;
        var index_r = Math.floor(i / dim);
        //swap rows with columns
        Trans[index_c * dim + index_r] = A[i];

    }
    return Trans;
};

PhaseMatch.AntiTranspose = function Transpose(A, dim){
    var Trans = new Float64Array(dim*dim);
    var l = A.length;
    for(var i=0; i<l; i++) { 
        var index_c = i % dim;
        var index_r = Math.floor(i / dim);
        //swap rows with columns
        Trans[(dim -1 - index_c) * dim + (dim - 1 -index_r)] = A[i];

    }
    return Trans;
};

PhaseMatch.linspace = function linspace(xstart,xstop,npts){
    var A = new Float64Array(npts);
    var diff = (xstop-xstart)/(npts-1);
    var curVal = 0;
    for (var i=0; i<npts; i++){
        A[i] = xstart + i*diff;
    }
    return A;
};

PhaseMatch.create_2d_array = function create_2d_array(data, dimx, dimy){
  var data2D = [];
  var index = 0;

  for (var i = 0; i<dimy; i++){
    var row = new Float64Array(dimx);
    for  (var j = 0; j<dimx; j++){
      row[j] = data[index];
      index += 1;
    }
    data2D[i] = row;
  }
  return data2D;
};

PhaseMatch.create_2d_array_view = function create_2d_array_view(data, dimx, dimy){
  var data2D = [];

  if (data.buffer && data.buffer.byteLength){

    for ( var i = 0; i < dimy; i++ ){
      
      data2D[ i ] = new Float64Array(data.buffer, i * 16, dimx);
    }

  } else {

    return null;
  }

  return data2D;
};

PhaseMatch.zeros = function zeros(dimx, dimy){
  var data2D = [];
  var index = 0;

  for (var i = 0; i<dimy; i++){
    var row = new Float64Array(dimx);
    for  (var j = 0; j<dimx; j++){
      row[j] = 0;
    }
    data2D[i] = row;
  }
  return data2D;
};


(function(){

    //Implementation of Nelder-Mead Simplex Linear Optimizer
    //  TODO: Robust Unit Test of 2D Function Optimizations
    //  TODO: Extend to support functions beyond the 2D Space

    function Simplex(vertices) {
        this.vertices = vertices;
        this.centroid = null;
        this.reflect_point = null; //Reflection point, updated on each iteration
        this.reflect_cost = null;
        this.expand_point = null;
        this.expand_cost = null;
        this.contract_point = null;
        this.contract_cost = null;
    }

    //sort the vertices of Simplex by their objective value as defined by objFunc
    Simplex.prototype.sortByCost = function (objFunc) {
        this.vertices.sort(function (a, b) {
            var a_cost = objFunc(a), b_cost = objFunc(b);
                
            if (a_cost < b_cost) {
                return -1;
            } else if (a_cost > b_cost) {
                return 1;
            } else {
                return 0;
            }
        });
    };

    //find the centroid of the simplex (ignoring the vertex with the worst objective value)
    Simplex.prototype.updateCentroid = function (objFunc) {
        this.sortByCost(objFunc); //vertices must be in order of best..worst

        var centroid_n = this.vertices.length - 1, centroid_sum = 0, i;
        for (i = 0; i < centroid_n; i += 1) {
            centroid_sum += this.vertices[i];
        }
        
        this.centroid = centroid_sum / centroid_n;
    };

    Simplex.prototype.updateReflectPoint = function (objFunc) {
        var worst_point = this.vertices[this.vertices.length - 1];
        this.reflect_point = this.centroid + (this.centroid - worst_point); // 1*(this.centroid - worst_point), 1 removed to make jslint happy
        this.reflect_cost = objFunc(this.reflect_point);
    };

    Simplex.prototype.updateExpandPoint = function (objFunc) {
        var worst_point = this.vertices[this.vertices.length - 1];
        this.expand_point = this.centroid + 2 * (this.centroid - worst_point);
        this.expand_cost = objFunc(this.expand_point);
    };

    Simplex.prototype.updateContractPoint = function (objFunc) {
        var worst_point = this.vertices[this.vertices.length - 1];
        this.contract_point = this.centroid + 0.5 * (this.centroid - worst_point);
        this.contract_cost = objFunc(this.contract_point);
    };

    //assumes sortByCost has been called prior!
    Simplex.prototype.getVertexCost = function (objFunc, option) {
        if (option === 'worst') {
            return objFunc(this.vertices[this.vertices.length - 1]);
        } else if (option === 'secondWorst') {
            return objFunc(this.vertices[this.vertices.length - 2]);
        } else if (option === 'best') {
            return objFunc(this.vertices[0]);
        }
    };

    Simplex.prototype.reflect = function () {    
        this.vertices[this.vertices.length - 1] = this.reflect_point; //replace the worst vertex with the reflect vertex
    };

    Simplex.prototype.expand = function () {
        this.vertices[this.vertices.length - 1] = this.expand_point; //replace the worst vertex with the expand vertex
    };

    Simplex.prototype.contract = function () {    
        this.vertices[this.vertices.length - 1] = this.contract_point; //replace the worst vertex with the contract vertex
    };

    Simplex.prototype.reduce = function () {    
        var best_x = this.vertices[0],  a;
        for (a = 1; a < this.vertices.length; a += 1) {
            this.vertices[a] = best_x + 0.5 * (this.vertices[a] - best_x); //0.1 + 0.5(0.1-0.1)
        }
    };

    function NM(objFunc, x0, numIters) {

        //This is our Simplex object that will mutate based on the behavior of the objective function objFunc
        var S = new Simplex([x0, x0 + 1, x0 + 2]), itr, x;

        for (itr = 0; itr < numIters; itr += 1) {
            
            S.updateCentroid(objFunc); //needs to know which objFunc to hand to sortByCost
            S.updateReflectPoint(objFunc);

            x = S.vertices[0];
            
            if (S.reflect_cost < S.getVertexCost(objFunc, 'secondWorst') && S.reflect_cost > S.getVertexCost(objFunc, 'best')) {
                S.reflect();
            } else if (S.reflect_cost < S.getVertexCost(objFunc, 'best')) { //new point is better than previous best: expand

                S.updateExpandPoint(objFunc);
               
                if (S.expand_cost < S.reflect_cost) {
                    S.expand();
                } else {           
                    S.reflect();
                }
            } else { //new point was worse than all current points: contract

                S.updateContractPoint(objFunc);

                if (S.contract_cost < S.getVertexCost(objFunc, 'worst')) {
                    S.contract();
                } else {                
                    S.reduce();            
                }
            }
        }

        return x;
    }

    PhaseMatch.nelderMead = NM;

})();


(function(){

    /*
    Copyright (c) 2012 Juan Mellado

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
    */

    /*
    References:
    - "Numerical Recipes in C - Second Edition"
      http://www.nr.com/
    */

    var pythag = function(a, b){
      var at = Math.abs(a), bt = Math.abs(b), ct;

      if (at > bt){
        ct = bt / at;
        return at * Math.sqrt(1.0 + ct * ct);
      }
        
      if (0.0 === bt){
        return 0.0;
      }

      ct = at / bt;
      return bt * Math.sqrt(1.0 + ct * ct);
    };

    var sign = function(a, b){
      return b >= 0.0? Math.abs(a): -Math.abs(a);
    };

    // PhaseMatch.svdcmp = function(a, m, n, w, v){
      PhaseMatch.svdcmp = function(a){
      var flag, i, its, j, jj, k, l, nm,
          anorm = 0.0, c, f, g = 0.0, h, s, scale = 0.0, x, y, z, rv1 = [];

          var m = a.length;  //number of rows
          var n = a[0].length; // number of cols

          var v = PhaseMatch.zeros(m,n);
          // var v = PhaseMatch.util.clone(a,true);
          var w = [];
          
      //Householder reduction to bidiagonal form
      for (i = 0; i < n; ++ i){
        l = i + 1;
        rv1[i] = scale * g;
        g = s = scale = 0.0;
        if (i < m){
          for (k = i; k < m; ++ k){
            scale += Math.abs( a[k][i] );
          }
          if (0.0 !== scale){
            for (k = i; k < m; ++ k){
              a[k][i] /= scale;
              s += a[k][i] * a[k][i];
            }
            f = a[i][i];
            g = -sign( Math.sqrt(s), f );
            h = f * g - s;
            a[i][i] = f - g;
            for (j = l; j < n; ++ j){
              for (s = 0.0, k = i; k < m; ++ k){
                s += a[k][i] * a[k][j];
              }
              f = s / h;
              for (k = i; k < m; ++ k){
                a[k][j] += f * a[k][i];
              }
            }
            for (k = i; k < m; ++ k){
              a[k][i] *= scale;
            }
          }
        }
        w[i] = scale * g;
        g = s = scale = 0.0;
        if ( (i < m) && (i !== n - 1) ){
          for (k = l; k < n; ++ k){
            scale += Math.abs( a[i][k] );
          }
          if (0.0 !== scale){
            for (k = l; k < n; ++ k){
              a[i][k] /= scale;
              s += a[i][k] * a[i][k];
            }
            f = a[i][l];
            g = -sign( Math.sqrt(s), f );
            h = f * g - s;
            a[i][l] = f - g;
            for (k = l; k < n; ++ k){
              rv1[k] = a[i][k] / h;
            }
            for (j = l; j < m; ++ j){
              for (s = 0.0, k = l; k < n; ++ k){
                s += a[j][k] * a[i][k];
              }
              for (k = l; k < n; ++ k){
                a[j][k] += s * rv1[k];
              }
            }
            for (k = l; k < n; ++ k){
              a[i][k] *= scale;
            }
          }
        }
        anorm = Math.max(anorm, ( Math.abs( w[i] ) + Math.abs( rv1[i] ) ) );
      }

      //Acumulation of right-hand transformation
      for (i = n - 1; i >= 0; -- i){
        if (i < n - 1){
          if (0.0 !== g){
            for (j = l; j < n; ++ j){
              v[j][i] = ( a[i][j] / a[i][l] ) / g;
            }
            for (j = l; j < n; ++ j){
              for (s = 0.0, k = l; k < n; ++ k){
                s += a[i][k] * v[k][j];
              }
              for (k = l; k < n; ++ k){
                v[k][j] += s * v[k][i];
              }
            }
          }
          for (j = l; j < n; ++ j){
            v[i][j] = v[j][i] = 0.0;
          }
        }
        v[i][i] = 1.0;
        g = rv1[i];
        l = i;
      }

      //Acumulation of left-hand transformation
      for (i = Math.min(n, m) - 1; i >= 0; -- i){
        l = i + 1;
        g = w[i];
        for (j = l; j < n; ++ j){
          a[i][j] = 0.0;
        }
        if (0.0 !== g){
          g = 1.0 / g;
          for (j = l; j < n; ++ j){
            for (s = 0.0, k = l; k < m; ++ k){
              s += a[k][i] * a[k][j];
            }
            f = (s / a[i][i]) * g;
            for (k = i; k < m; ++ k){
              a[k][j] += f * a[k][i];
            }
          }
          for (j = i; j < m; ++ j){
            a[j][i] *= g;
          }
        }else{
            for (j = i; j < m; ++ j){
              a[j][i] = 0.0;
            }
        }
        ++ a[i][i];
      }

      //Diagonalization of the bidiagonal form
      for (k = n - 1; k >= 0; -- k){
        for (its = 1; its <= 30; ++ its){
          flag = true;
          for (l = k; l >= 0; -- l){
            nm = l - 1;
            if ( Math.abs( rv1[l] ) + anorm === anorm ){
              flag = false;
              break;
            }
            if ( Math.abs( w[nm] ) + anorm === anorm ){
              break;
            }
          }
          if (flag){
            c = 0.0;
            s = 1.0;
            for (i = l; i <= k; ++ i){
              f = s * rv1[i];
              if ( Math.abs(f) + anorm === anorm ){
                break;
              }
              g = w[i];
              h = pythag(f, g);
              w[i] = h;
              h = 1.0 / h;
              c = g * h;
              s = -f * h;
              for (j = 0; j < m; ++ j){
                y = a[j][nm];
                z = a[j][i];
                a[j][nm] = y * c + z * s;
                a[j][i] = z * c - y * s;
              }
            }
          }

          //Convergence
          z = w[k];
          if (l === k){
            if (z < 0.0){
              w[k] = -z;
              for (j = 0; j < n; ++ j){
                v[j][k] = -v[j][k];
              }
            }
            break;
          }

          if (30 === its){
            return false;
          }

          //Shift from bottom 2-by-2 minor
          x = w[l];
          nm = k - 1;
          y = w[nm];
          g = rv1[nm];
          h = rv1[k];
          f = ( (y - z) * (y + z) + (g - h) * (g + h) ) / (2.0 * h * y);
          g = pythag( f, 1.0 );
          f = ( (x - z) * (x + z) + h * ( (y / (f + sign(g, f) ) ) - h) ) / x;

          //Next QR transformation
          c = s = 1.0;
          for (j = l; j <= nm; ++ j){
            i = j + 1;
            g = rv1[i];
            y = w[i];
            h = s * g;
            g = c * g;
            z = pythag(f, h);
            rv1[j] = z;
            c = f / z;
            s = h / z;
            f = x * c + g * s;
            g = g * c - x * s;
            h = y * s;
            y *= c;
            for (jj = 0; jj < n; ++ jj){
              x = v[jj][j];
              z = v[jj][i];
              v[jj][j] = x * c + z * s;
              v[jj][i] = z * c - x * s;
            }
            z = pythag(f, h);
            w[j] = z;
            if (0.0 !== z){
              z = 1.0 / z;
              c = f * z;
              s = h * z;
            }
            f = c * g + s * y;
            x = c * y - s * g;
            for (jj = 0; jj < m; ++ jj){
              y = a[jj][j];
              z = a[jj][i];
              a[jj][j] = y * c + z * s;
              a[jj][i] = z * c - y * s;
            }
          }
          rv1[l] = 0.0;
          rv1[k] = f;
          w[k] = x;
        }
      }

      return {U: a, W: w, V:v};
    };
})();
/*
 * calc_delK()
 * Gets the index of refraction depending on phasematching type
 * All angles in radians.
 * P is SPDC Properties object
 */

 PhaseMatch.calc_delK = function calc_delK (P){

    var n_p = P.n_p;
    var n_s = P.n_s;
    var n_i = P.n_i;

    // Directions of the signal and idler photons in the pump coordinates
    var Ss = [Math.sin(P.theta_s)*Math.cos(P.phi_s), Math.sin(P.theta_s)*Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var Si = [Math.sin(P.theta_i)*Math.cos(P.phi_i), Math.sin(P.theta_i)*Math.sin(P.phi_i), Math.cos(P.theta_i)];


    var delKx = (2*Math.PI*((n_s*Ss[0]/P.lambda_s) + n_i*Si[0]/P.lambda_i));
    var delKy = (2*Math.PI*((n_s*Ss[1]/P.lambda_s) + n_i*Si[1]/P.lambda_i));
    var delKz = (2*Math.PI*(n_p/P.lambda_p - (n_s*Ss[2]/P.lambda_s) - n_i*Si[2]/P.lambda_i));

    delKz = delKz - 2*Math.PI/(P.poling_period*P.poling_sign);
    // if (delKz>0){
    //     delKz = delKz - 2*Math.PI/P.poling_period;
    // }
    // else{
    //     delKz = delKz + 2*Math.PI/P.poling_period;
    // }

    return [delKx, delKy, delKz];

};


/*
 * calc_PM_tz
 * Returns Phasematching function for the transverse and longitudinal directions
 */
PhaseMatch.calc_PM_tz = function calc_PM_tz (P){
    var con = PhaseMatch.constants;
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;

    P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.Type, P.S_p, "pump");

    var delK = PhaseMatch.calc_delK(P);
    
    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;

    var arg = P.L/2*(delK[2]);

    //More advanced calculation of phasematching in the z direction. Don't need it now.

    // var l_range = linspace(0,L,apodization+1)
    // A = Math.exp(-sq((l_range - L/2))/2/sq(apodization_FWHM))


    // PMz = 0
    // for m in range(apodization):
    //  delL = Math.abs(l_range[m+1] - l_range[m])
    //  PMz = PMz + A[m]*1j*(Math.exp(1j*delKz*l_range[m]) - Math.exp(1j*delKz*l_range[m+1]))/delKz/(delL) #* Math.exp(1j*delKz*delL/2)

    // PMz = PMz/(apodization)#/L/delKz

    // PMz_ref = Math.sin(arg)/arg * Math.exp(-1j*arg)

    // norm = Math.max(Math.absolute(PMz_ref)) / Math.max(Math.absolute(PMz))
    // PMz = PMz*norm 

    // Phasematching along z dir
    var PMz = Math.sin(arg)/arg; //* Math.exp(1j*arg)
    var PMz_real = 0;
    var PMz_imag = 0;
    if (P.use_guassian_approx){
        // console.log('approx');
        PMz_real = Math.exp(-0.193*sq(arg));
        PMz_imag = 0;
    }
    else{
        PMz_real =  PMz * Math.cos(arg);
        PMz_imag = PMz * Math.sin(arg);
    }

    // Phasematching along transverse directions
    var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));

    return [PMz_real, PMz_imag, PMt];
}

/*
 * pump_spectrum
 * Returns the pump mode
 */
PhaseMatch.pump_spectrum = function pump_spectrum (P){
    var con = PhaseMatch.constants;
    // @TODO: Need to move the pump bandwidth to someplace that is cached.
    var p_bw = 2*Math.PI*con.c/sq(P.lambda_p) *P.p_bw; //* n_p; //convert from wavelength to w 
    p_bw = p_bw /(2 * Math.sqrt(2*Math.log(2))); //convert from FWHM
    var alpha = Math.exp(-1*sq(2*Math.PI*con.c*( ( 1/P.lambda_s + 1/P.lambda_i - 1/P.lambda_p) )/(2*p_bw)));
    return alpha
}


/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch = function phasematch (P){

    var pm = PhaseMatch.calc_PM_tz(P);
    // Longitundinal components of PM. 
    var PMz_real = pm[0];
    var PMz_imag = pm[1];
    // Transverse component of PM
    var PMt = pm[2];
    // Pump spectrum
    var alpha = PhaseMatch.pump_spectrum(P);

    //return the real and imaginary parts of Phase matching function
    return [alpha*PMt* PMz_real, alpha*PMt* PMz_imag];
};


/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch_Int_Phase = function phasematch_Int_Phase(P){
    
    // PM is a complex array. First element is real part, second element is imaginary.
    var PM = PhaseMatch.phasematch(P);

    // var PMInt = sq(PM[0]) + sq(PM[1])

    if (P.phase){
        var PMang = Math.atan2(PM[1],PM[0]) + Math.PI;
        // need to figure out an elegant way to apodize the phase. Leave out for now
        // var x = PMInt<0.01
        // var AP = PMInt
        // var AP[x] = 0.
        // var x = PMInt >0
        // var AP[x] = 1.

        // PM = PMang * AP;
    } else {
        // console.log  ("calculating Intensity")
        PM = sq(PM[0]) + sq(PM[1]);
    }
    // console.log(PM)
    return PM;
};

/*
 * calc_HOM_JSA()
 * Calculates the Joint Spectra Amplitude of the HOM at a particluar time delay
 * P is SPDC Properties object
 * ls_start ... li_stop are the signal/idler wavelength ranges to calculate over
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_JSA = function calc_HOM_JSA(props, ls_start, ls_stop, li_start, li_stop, delT, dim){
    var con = PhaseMatch.constants;
    var P = PhaseMatch.deep_copy(props);

    var i;
    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim); 

    var N = dim * dim;
    var THETA1_real = new Float64Array( N );
    var THETA1_imag = new Float64Array( N );
    var THETA2_real  = new Float64Array( N ); // The transposed version of THETA1
    var THETA2_imag  = new Float64Array( N ); 
    var Tosc_real = new Float64Array( N ); // Real/Imag components of phase shift
    var Tosc_imag = new Float64Array( N );
    var ARG = 0;

    var PM = new Float64Array( N );

    
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        //First calculate PM(ws,wi)
        P.lambda_s = lambda_s[index_s];
        P.lambda_i = lambda_i[index_i];
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
        P.optimum_idler(P); //Need to find the optimum idler.
        
        var PMtmp = PhaseMatch.phasematch(P);
        THETA1_real[i] = PMtmp[0];
        THETA1_imag[i] = PMtmp[1];

        //Next calculate PM(wi,ws)
        P.lambda_s = lambda_i[index_i];
        P.lambda_i = lambda_s[index_s];
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
        P.optimum_idler(P); //Need to find the optimum idler.
        
        PMtmp = PhaseMatch.phasematch(P);
        THETA2_real[i] = PMtmp[0];
        THETA2_imag[i] = PMtmp[1];

        // THETA2_real[(dim -1 - index_s) * dim + (dim - 1 -index_s)] = PMtmp[0]; //Transpose
        // THETA2_imag[(dim -1 - index_s) * dim + (dim - 1 -index_s)] = PMtmp[1];

        ARG = 2*Math.PI*con.c *(1/lambda_s[index_s] - 1/lambda_i[index_i])*delT;
        Tosc_real[i] = Math.cos(ARG);
        Tosc_imag[i] = Math.sin(ARG);
        // Tosc_real[i] = 1;
        // Tosc_imag[i] = 0;
    }

    // THETA2_real = PhaseMatch.AntiTranspose(THETA1_real,dim);
    // THETA2_imag = PhaseMatch.AntiTranspose(THETA1_imag,dim);
    var maxval = 0;
    for (i=0; i<N; i++){
        // arg2 = THETA2*Tosc. Split calculation to handle complex numbers
        var arg2_real = Tosc_real[i]*THETA2_real[i] - Tosc_imag[i]*THETA2_imag[i];
        var arg2_imag = Tosc_real[i]*THETA2_imag[i] + Tosc_imag[i]*THETA2_real[i];

        var PM_real = (THETA1_real[i] - arg2_real)/2;///Math.sqrt(2);
        var PM_imag = (THETA1_imag[i] - arg2_imag)/2; //Math.sqrt(2);

        PM[i] = sq(PM_real) + sq(PM_imag);
        if (PM[i] > maxval) {maxval = PM[i];}
    }
    // console.log("Max PM value = ", maxval);

    return PM;
};

/*
 * calc_HOM_scan()
 * Calculates the HOM probability of coincidences over range of times.
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_scan = function calc_HOM_scan(P, t_start, t_stop, ls_start, ls_stop, li_start, li_stop, dim){

    var npts = 50;  //number of points to pass to the calc_HOM_JSA

    var i;
    var delT = PhaseMatch.linspace(t_start, t_stop, dim);

    var HOM_values = PhaseMatch.linspace(t_start, t_stop, dim); 
    var PM_JSA = new Float64Array(npts*npts);

    // Calculate normalization
    var norm = new Float64Array(npts*npts);
    norm = PhaseMatch.calc_JSA(P,ls_start, ls_stop, li_start,li_stop, npts);
    var N = PhaseMatch.Sum(norm);

    for (i=0; i<dim; i++){
        PM_JSA = PhaseMatch.calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT[i], npts);
        var total = PhaseMatch.Sum(PM_JSA)/N;
        HOM_values[i] = total;
    }

    return HOM_values;
    
};

/*
 * calc_Schmidt
 * Calculates the Schmidt number for a 2D matrix
 * NOTE: The SVD routine has problems with odd dimensions
 */
PhaseMatch.calc_Schmidt = function calc_Schmidt(PM){
    // var PM2D = PhaseMatch.create2Darray(PM, dim,dim);

    var svd = PhaseMatch.svdcmp(PM);
    // @TODO: add in logic to test if the SVD converged. It will return false if it did not.
    var D = svd.W;
    // console.log("D", D);
    var Norm = PhaseMatch.Sum(D); // Normalization
    // console.log("normalization", Norm);
    var l = D.length;
    var Kinv = 0;
    for (var i = 0; i<l; i++){
        Kinv += sq(D[i]/Norm); //calculate the inverse of the Schmidt number
    } 
    return 1/Kinv;
};

/**
 * The following section is where we calculate intelligent guesses for the ranges of the plots.
 */


/**
 * [autorange_lambda Calculates intelligent axes limits for lambda signal and idler]
 * @param  {[type]} props     [description]
 * @param  {[type]} threshold [description]
 * @return {[type]}           [description]
 */
PhaseMatch.autorange_lambda = function autorange_lambda(props, threshold){
    var P = PhaseMatch.deep_copy(props);
    //eliminates sinc side lobes which cause problems.
    P.use_guassian_approx = true;

    var lambda_limit = function(lambda_s){
        P.lambda_s = lambda_s;
        P.n_s = P.calc_Index_PMType(lambda_s, P.Type, P.S_s, "signal");
        P.lambda_i = 1/(1/P.lambda_p - 1/lambda_s);
        P.optimum_idler(P);

        var PM = PhaseMatch.phasematch_Int_Phase(P);
        // console.log(P.lambda_p/1e-9, P.lambda_s/1e-9, P.lambda_i/1e-9, PM)
        return Math.abs(PM - threshold);
    };

    var guess = P.lambda_s - 1e-9;
    var ans = PhaseMatch.nelderMead(lambda_limit, guess, 50);
    var ans2 = 1/(1/props.lambda_p - 1/ans);

    var l1 = Math.min(ans, ans2);
    var l2 = Math.max(ans, ans2);
    // console.log(l1/1e-9, l2/1e-9);

    var dif = Math.abs(ans-props.lambda_s);
    console.log(ans/1e-9, ans2/1e-9, P.lambda_s/1e-9, dif/1e-9);

    //Now try to find sensible limits. We want to make sure the range of values isn't too big,
    //but also ensure that if the pump bandwidth is small, that the resulting JSA is visible.
    //This is important for calculating things like the Hong-Ou-Mandel.
    var difmax = 2e-9 * P.lambda_p/775e-9 * P.p_bw/1e-9 ;

    console.log("diff = ", dif/1e-9, difmax/1e-9);
    
    if (difmax>35e-9){
        difmax = 35e-9;
    }

    if (dif>difmax){
        dif = difmax;
    }
    
    
    var ls_a = props.lambda_s - 10 * dif;
    var ls_b = props.lambda_s + 10 * dif;

    // var li_a = props.lambda_i - 3 * dif;
    // var li_b = props.lambda_i + 3 * dif;

    // var ls_a = 1/(1/l1 + 1/l2)*2 - 3 * dif;
    // var ls_b = 1/(1/l1 + 1/l2)*2 + 3 * dif;

    var li_a = 1/(1/P.lambda_p - 1/ls_b);
    var li_b = 1/(1/P.lambda_p - 1/ls_a);

    

    // la = 1500e-9;
    // lb = 1600e-9;

    // console.log(ls_a/1e-9, ls_b/1e-9);
    // l1 = l1 -2*dif;
    // l2 = l2 + 2*dif;
    
    return {
        lambda_s: {
            min: Math.min(ls_a, ls_b),
            max: Math.max(ls_a, ls_b)
        }, 
        lambda_i: {
            min: Math.min(li_a, li_b),
            max: Math.max(li_a, li_b)
        }
    };
};

PhaseMatch.autorange_delT = function autorange_delT(props, lambda_start, lambda_stop){
    // var P = PhaseMatch.deep_copy(props);
    var con = PhaseMatch.constants;

    var gv_s = props.get_group_velocity(props.lambda_s, props.Type, props.S_s, "signal");
    var gv_i = props.get_group_velocity(props.lambda_i, props.Type, props.S_i, "idler");

    var zero_delay = props.L * (1/gv_i - 1/gv_s)/2;
    console.log("minimum of HOM dip = ", zero_delay/1e-15);

    var bw = Math.abs(lambda_stop - lambda_start);
    var coh_time = 1/ (2*Math.PI*con.c / sq(lambda_start + bw/2) * bw); 

    var t_start = zero_delay - 40*coh_time;
    var t_stop = zero_delay + 40*coh_time;

    return [zero_delay, t_start, t_stop];

};

PhaseMatch.autorange_theta = function autorange_theta(props){
    var P = PhaseMatch.deep_copy(props);
    P.update_all_angles();
    var offset = 2* Math.PI/180;
    var dif = (P.theta_s - P.theta_s*.4);
    var theta_start =dif*(1-(1e-6/P.W));
    var theta_start = Math.max(0, theta_start);
    var theta_end = P.theta_s + P.theta_s*.4;
    var theta_end = Math.max(2*Math.PI/180, theta_end);

    // console.log("optimal theta", theta_start*180/Math.PI, theta_end*theta_start*180/Math.PI);

    return [theta_start, theta_end];
};



(function(){

    var con = PhaseMatch.constants;
    var spdcDefaults = {
        lambda_p: 775 * con.nm,
        lambda_s: 1500 * con.nm,
        lambda_i: 1600 * con.nm,
        Type: [
            "o -> o + o", 
            "e -> o + o", 
            "e -> e + o", 
            "e -> o + e"
        ],
        theta: 19.8371104525 * Math.PI / 180,
        phi: 0,
        theta_s: 0, // * Math.PI / 180,
        theta_i: 0,
        phi_s: 0,
        phi_i: 0,
        poling_period: 1000000,
        L: 2000 * con.um,
        W: 500 * con.um,
        p_bw: 1 * con.nm,
        phase: false,
        apodization: 1,
        apodization_FWHM: 1000 * con.um
    };

    /**
     * SPDCprop
     */
    var SPDCprop = function( cfg ){
        this.init( cfg || spdcDefaults );
    };

    SPDCprop.prototype = {

        init:function(){
            var con = PhaseMatch.constants;
            this.lambda_p = 785 * con.nm;
            this.lambda_s = 1570 * con.nm;
            this.lambda_i = 1/(1/this.lambda_p - 1/this.lambda_s);
            this.PM_type_names = ["Type 0:   o -> o + o", "Type 1:   e -> o + o", "Type 2:   e -> e + o", "Type 2:   e -> o + e"];
            this.Type = this.PM_type_names[2];
            this.theta = 90 *Math.PI / 180;
            // this.theta = 19.2371104525 *Math.PI / 180;
            this.phi = 0 * Math.PI/ 180;
            this.theta_s = 0 * Math.PI / 180;
            this.theta_i = this.theta_s;
            this.phi_s = 0;
            this.phi_i = this.phi_s + Math.PI;
            this.L = 2000 * con.um;
            this.W = 500* con.um;
            this.p_bw = 5.35 * con.nm;
            this.W_sx = .01*Math.PI/180;
            this.W_sy = this.W_sx;
            this.phase = false;
            this.brute_force = true;
            this.brute_dim = 50;
            this.autocalctheta = false;
            this.autocalcpp = true;
            this.poling_period = 1000000;
            this.poling_sign = 1;
            this.apodization = 1;
            this.apodization_FWHM = 1000 * con.um;
            this.use_guassian_approx = false;
            this.crystaldb = PhaseMatch.Crystals;
            this.crystal = PhaseMatch.Crystals('KTP-3');
            this.temp = 20;
            //Other functions that do not need to be included in the default init
            this.S_p = this.calc_Coordinate_Transform(this.theta, this.phi, 0, 0);
            this.S_s = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_s, this.phi_s);
            this.S_i = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_i, this.phi_i);

            this.n_p = this.calc_Index_PMType(this.lambda_p, this.Type, this.S_p, "pump");
            this.n_s = this.calc_Index_PMType(this.lambda_s, this.Type, this.S_s, "signal");
            this.n_i = this.calc_Index_PMType(this.lambda_i, this.Type, this.S_i, "idler");

            this.msg = "";

        },
            // this.autocalcTheta = false;
            // this.calc_theta= function(){
            //     //unconstrained minimization
            //     if this.autocalcTheta{}
            //     return this.theta = answer
            // }
        calc_Coordinate_Transform : function (theta, phi, theta_s, phi_s){
            //Should save some calculation time by defining these variables.
            var SIN_THETA = Math.sin(theta);
            var COS_THETA = Math.cos(theta);
            var SIN_THETA_S = Math.sin(theta_s);
            var COS_THETA_S = Math.cos(theta_s);
            var SIN_PHI = Math.sin(phi);
            var COS_PHI = Math.cos(phi);
            var SIN_PHI_S = Math.sin(phi_s);
            var COS_PHI_S = Math.cos(phi_s);


            var S_x = SIN_THETA_S*COS_PHI_S;
            var S_y = SIN_THETA_S*SIN_PHI_S;
            var S_z = COS_THETA_S;

            // Transform from the lambda_p coordinates to crystal coordinates
            var SR_x = COS_THETA*COS_PHI*S_x - SIN_PHI*S_y + SIN_THETA*COS_PHI*S_z;
            var SR_y = COS_THETA*SIN_PHI*S_x + COS_PHI*S_y + SIN_THETA*SIN_PHI*S_z;
            var SR_z = -SIN_THETA*S_x                      + COS_THETA*S_z;
            
            // Normalambda_ize the unit vector
            // @TODO: When theta = 0, Norm goes to infinity. This messes up the rest of the calculations. In this
            // case I think the correct behaviour is for Norm = 1 ?
            var Norm =  Math.sqrt(sq(S_x) + sq(S_y) + sq(S_z));
            var Sx = SR_x/(Norm);
            var Sy = SR_y/(Norm);
            var Sz = SR_z/(Norm);

            return [Sx, Sy, Sz];
        },

        calc_Index_PMType : function (lambda, Type, S, photon){
            var ind = this.crystal.indicies(lambda, this.temp);

            var nx_squared_inv = 1/sq( ind[0] );
            var ny_squared_inv = 1/sq( ind[1] );
            var nz_squared_inv = 1/sq( ind[2] );

            var Sx_squared = sq( S[0] );
            var Sy_squared = sq( S[1] );
            var Sz_squared = sq( S[2] );

            var B = Sx_squared * (ny_squared_inv + nz_squared_inv) + Sy_squared * (nx_squared_inv + nz_squared_inv) + Sz_squared * (nx_squared_inv + ny_squared_inv);
            var C = Sx_squared * (ny_squared_inv * nz_squared_inv) + Sy_squared * (nx_squared_inv * nz_squared_inv) + Sz_squared * (nx_squared_inv * ny_squared_inv);
            var D = sq(B) - 4 * C;

            var nslow = Math.sqrt(2/ (B + Math.sqrt(D)));
            var nfast = Math.sqrt(2/ (B - Math.sqrt(D)));

            var n = 1;

            switch (Type){
                case "Type 0:   o -> o + o":
                    n = nfast;
                break;
                case "Type 1:   e -> o + o":
                    if (photon === "pump") { n = nslow;}
                    else { n = nfast;}
                break;
                case "Type 2:   e -> e + o":
                    if (photon === "idler") { n = nfast;}
                    else {n = nslow;}
                break;
                case "Type 2:   e -> o + e":
                    if (photon === "signal") { n = nfast;}
                    else {n = nslow;}
                break;
                default:
                    throw "Error: bad PMType specified";
            }

            return n ;
        },

        set_crystal : function ( key ){
            
            this.crystal = PhaseMatch.Crystals( key );
            // var ind = this.crystal.indicies(this.lambda_p, this.temp);
        },

        update_all_angles : function (){
            var props = this;
            // console.log("old pump index", props.n_p);

            props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
            props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);

            props.n_p = props.calc_Index_PMType(props.lambda_p, props.Type, props.S_p, "pump");
            props.n_s = props.calc_Index_PMType(props.lambda_s, props.Type, props.S_s, "signal");
            // console.log("new pump index", props.n_p);

            props.optimum_idler();
            // props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);

           
            // props.n_i = props.calc_Index_PMType(props.lambda_i, props.Type, props.S_i, "idler");

        },

        get_group_velocity : function(lambda, Type, S, photon){
            // var props = this;
            var con = PhaseMatch.constants;
            var bw = 1e-11; 
            // var P = PhaseMatch.deep_copy(props);
            
            var n1 = this.calc_Index_PMType(lambda - bw, Type, S, photon);
            var n2 = this.calc_Index_PMType(lambda + bw, Type, S, photon);
            
            var dn = (n2 - n1)/(2*bw);

            var gv = con.c/(n1 - lambda*dn);

            return gv;
        },

        auto_calc_Theta : function (){
            this.lambda_i = 1/(1/this.lambda_p - 1/this.lambda_s);
            var props = this;
            var min_delK = function(x){
                if (x>Math.PI/2 || x<0){return 1e12;}
                props.theta = x;
                props.update_all_angles(props);
                var delK =  PhaseMatch.calc_delK(props);

                return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
            };

            var guess = Math.PI/8;
            var startTime = new Date();

            var ans = PhaseMatch.nelderMead(min_delK, guess, 1000);
            var endTime = new Date();
            

            var timeDiff = (endTime - startTime)/1000;
            // console.log("Theta autocalc = ", timeDiff);
            props.theta = ans;
        },


        calc_poling_period : function (){
            var props = this;
            this.lambda_i = 1/(1/this.lambda_p - 1/this.lambda_s);
            props.poling_period = 1e12;  // Set this to a large number 
            props.update_all_angles(props);
            var P = PhaseMatch.deep_copy(props);

            var find_pp = function(x){
                // if (x<0){ return 1e12;}  // arbitrary large number
                P.poling_period = x;
                // Calculate the angle for the idler photon
                P.optimum_idler();
                var delK = PhaseMatch.calc_delK(P);
                return Math.sqrt(sq(delK[2]) +sq(delK[0])+ sq(delK[1]));
            };

            var delK_guess = (PhaseMatch.calc_delK(P)[2]);
            var guess = 2*Math.PI/delK_guess;

            if (guess<0){
                P.poling_sign = -1;
                guess = guess*-1;
            }
            else{
                P.poling_sign = 1;
            }

            //finds the minimum theta
            var startTime = new Date();
            PhaseMatch.nelderMead(find_pp, guess, 100);
            var endTime = new Date();
            // console.log("calculation time for periodic poling calc", endTime - startTime);

            props.poling_period = P.poling_period;
            props.poling_sign = P.poling_sign;
        },

        optimum_idler : function (){
            var P = this;

            var delKpp = P.lambda_s/(P.poling_period*P.poling_sign);

            var arg = sq(P.n_s) + sq(P.n_p*P.lambda_s/P.lambda_p);    
            arg += -2*P.n_s*P.n_p*(P.lambda_s/P.lambda_p)*Math.cos(P.theta_s) - 2*P.n_p*P.lambda_s/P.lambda_p*delKpp;
            arg += 2*P.n_s*Math.cos(P.theta_s)*delKpp + sq(delKpp);
            arg = Math.sqrt(arg);

            var arg2 = P.n_s*Math.sin(P.theta_s)/arg;

            var theta_i = Math.asin(arg2);
            // return theta_i;
            P.theta_i = theta_i;
            //Update the index of refraction for the idler
            P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");
        },

        optimum_signal : function (){
            var P = this;

            var delKpp = P.lambda_i/(P.poling_period*P.poling_sign);

            var arg = sq(P.n_i) + sq(P.n_p*P.lambda_i/P.lambda_p);    
            arg += -2*P.n_i*P.n_p*(P.lambda_i/P.lambda_p)*Math.cos(P.theta_i) - 2*P.n_p*P.lambda_i/P.lambda_p*delKpp;
            arg += 2*P.n_i*Math.cos(P.theta_i)*delKpp + sq(delKpp);
            arg = Math.sqrt(arg);

            var arg2 = P.n_i*Math.sin(P.theta_i)/arg;

            var theta_s = Math.asin(arg2);
            // return theta_i;
            P.theta_s = theta_s;
            //Update the index of refraction for the idler
            P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
            P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
        },

        brute_force_theta_i : function (){
            var props = this;

            var min_PM = function(x){
                if (x>Math.PI/2 || x<0){return 1e12;}
                props.theta_i = x;

                props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);
                props.n_i = props.calc_Index_PMType(props.lambda_i, props.Type, props.S_i, "idler");

                var PMtmp =  PhaseMatch.phasematch_Int_Phase(props);
                return 1-PMtmp;
            };

            //Initial guess
            props.optimum_idler();
            var guess = props.theta_i;
            // var startTime = new Date();

            var ans = PhaseMatch.nelderMead(min_PM, guess, 25);
        },


        set: function( name, val ){

            // set the value
            this[ name ] = val;

            switch ( name ){

                case 'theta':
                case 'phi':
                case 'theta_s':
                case 'phi_s':

                    // update rotation object
                    this.S.set( this.theta, this.phi, this.theta_s, this.phi_s );
                break;
            }

            // for chaining calls
            return this;
        }
    };

    PhaseMatch.SPDCprop = SPDCprop;


    PhaseMatch.deep_copy = function deep_copy(props){
        var P = new PhaseMatch.SPDCprop();
        P.crystal = props.crystal;
        P.temp = PhaseMatch.util.clone(props.temp,true);
        P.lambda_p = PhaseMatch.util.clone(props.lambda_p,true);
        P.lambda_s = PhaseMatch.util.clone(props.lambda_s,true);
        P.lambda_i = PhaseMatch.util.clone(props.lambda_i,true);
        P.Type = PhaseMatch.util.clone(props.Type,true);
        P.theta = PhaseMatch.util.clone(props.theta,true);
        P.phi = PhaseMatch.util.clone(props.phi,true);
        P.theta_s = PhaseMatch.util.clone(props.theta_s,true);
        P.theta_i = PhaseMatch.util.clone(props.theta_i,true);
        P.phi_s = PhaseMatch.util.clone(props.phi_s,true);
        P.phi_i = PhaseMatch.util.clone(props.phi_i,true);
        P.poling_period = PhaseMatch.util.clone(props.poling_period,true);
        P.poling_sign = PhaseMatch.util.clone(props.poling_sign,true);
        P.L = PhaseMatch.util.clone(props.L,true);
        P.W = PhaseMatch.util.clone(props.W,true);
        P.p_bw = PhaseMatch.util.clone(props.p_bw,true);
        P.phase = PhaseMatch.util.clone(props.phase,true);
        P.apodization = PhaseMatch.util.clone(props.apodization,true);
        P.apodization_FWHM = PhaseMatch.util.clone(props.apodization_FWHM,true);
        P.S_p = PhaseMatch.util.clone(props.S_p,true);
        P.S_s = PhaseMatch.util.clone(props.S_s,true);
        P.S_i = PhaseMatch.util.clone(props.S_i,true);
        P.n_p = PhaseMatch.util.clone(props.n_p,true);
        P.n_s = PhaseMatch.util.clone(props.n_s,true);
        P.n_i = PhaseMatch.util.clone(props.n_i,true);
        
        return P;
    };

})();


PhaseMatch.calc_JSA = function calc_JSA(props, ls_start, ls_stop, li_start, li_stop, dim){
    // PhaseMatch.updateallangles(props);
    // console.log("Calculating JSA", props.temp);
    var P = PhaseMatch.deep_copy(props);
    props.update_all_angles(P);

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var i;
    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );

    var maxpm = 0;
    
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.lambda_i = lambda_i[index_i];
        
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        // P.optimum_idler(P); //Need to find the optimum idler for each angle.
        if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming. 
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);

        if (PM[i]>maxpm){maxpm = PM[i];}
    }
    
    // console.log("max pm value = ", maxpm);
    // console.log("");
    // console.log("HOM dip = ",PhaseMatch.calc_HOM_JSA(P, 0e-15));
    
    return PM;

};

PhaseMatch.calc_XY = function calc_XY(props, x_start, x_stop, y_start, y_stop, dim){

    var P = PhaseMatch.deep_copy(props);
    props.update_all_angles(P);

    P.phi_i = (P.phi_s + Math.PI);

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var i;
    var X = PhaseMatch.linspace(x_start, x_stop, dim);
    var Y = PhaseMatch.linspace(y_start, y_stop, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_s = Math.atan2(Y[index_y],X[index_x]);

        // if (X[index_x] < 0){ P.phi_s += Math.PI;}
        // if (P.phi_s<0){ P.phi_s += 2*Math.PI;}

        // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
        P.phi_i = (P.phi_s + Math.PI);
        
        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming. 
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};

PhaseMatch.calc_lambda_s_vs_theta_s = function calc_lambda_s_vs_theta_s(props, l_start, l_stop, t_start, t_stop, dim){

    var P = PhaseMatch.deep_copy(props);
    props.update_all_angles(P);

    P.phi_i = (P.phi_s + Math.PI);

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var i;
    var lambda_s = PhaseMatch.linspace(l_start, l_stop, dim);
    var theta_s = PhaseMatch.linspace(t_stop, t_start, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.theta_s = theta_s[index_i];
        P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);
        
        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

         if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming. 
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }

        // P.optimum_idler(P); //Need to find the optimum idler for each angle.
        // P.calc_wbar();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};

PhaseMatch.calc_theta_phi = function calc_theta_phi(props, t_start, t_stop, p_start, p_stop, dim){

    var P = PhaseMatch.deep_copy(props);
    props.update_all_angles(P);

    P.phi_i = (P.phi_s + Math.PI);

    var i;
    var theta = PhaseMatch.linspace(t_start, t_stop, dim);
    var phi = PhaseMatch.linspace(p_start, p_stop, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta = theta[index_x];
        P.phi = phi[index_y];

        
        P.S_p = P.calc_Coordinate_Transform(P.theta, P.phi, 0, 0);
        P.n_p = P.calc_Index_PMType(P.lambda_p, P.Type, P.S_p, "pump");

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        //calcualte the correct idler angle analytically.
        P.optimum_idler(P);
        // P.calc_wbar();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P);

    }
    return PM;

};

PhaseMatch.calc_signal_theta_phi = function calc_calc_signal_theta_phi(props, x_start, x_stop, y_start, y_stop, dim){

    var P = PhaseMatch.deep_copy(props);
    props.update_all_angles(P);

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var i;
    var X = PhaseMatch.linspace(x_start, x_stop, dim);
    var Y = PhaseMatch.linspace(y_start, y_stop, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_s = X[index_x];
        P.phi_s =Y[index_y];


        // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
        P.phi_i = (P.phi_s + Math.PI);
        
        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming. 
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};


PhaseMatch.calc_signal_theta_vs_idler_theta = function calc_signal_theta_vs_idler_theta(props, x_start, x_stop, y_start, y_stop, dim){

    var P = PhaseMatch.deep_copy(props);
    props.update_all_angles(P);

    var i;
    var X = PhaseMatch.linspace(x_start, x_stop, dim);
    var Y = PhaseMatch.linspace(y_stop, y_start, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_s = X[index_x];
        P.theta_i =Y[index_y];


        // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
        P.phi_i = (P.phi_s + Math.PI);
        
        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");

        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};

/* calc_schmidt_plot
* Params is a JSON string of the form { x: "L/W/BW", y:"L/W/BW"}
*/
PhaseMatch.calc_schmidt_plot = function calc_schmidt_plot(props, x_start, x_stop, y_start, y_stop, ls_start, ls_stop, li_start, li_stop, dim, params){

    var P = PhaseMatch.deep_copy(props);
    props.update_all_angles(P);


    if (P.brute_force && dim>P.brute_dim){
        dim = P.brute_dim;
    }

    var xrange = PhaseMatch.linspace(x_start, x_stop, dim);
    var yrange = PhaseMatch.linspace(y_stop, y_start, dim); 
    var i;
    var N = dim*dim;
    var S = new Float64Array( N );

    var dimjsa = 50; //make sure this is even

    var maxpm = 0;

    
    
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        // Figure out what to plot in the x dimension
        switch (params.x){
            case "L":
                P.L = xrange[index_s];
            break;
            case "W":
                P.W = xrange[index_s];
            break;
            case "BW":
                P.p_bw = xrange[index_s];
            break;
            default:
                throw "Error: x input type";
        }

        // Figure out what to plot in the y dimension
        switch (params.y){
            case "L":
                P.L = yrange[index_i];
            break;
            case "W":
                P.W = yrange[index_i];
            break;
            case "BW":
                P.p_bw = yrange[index_i];
            break;
            default:
                throw "Error: y input type";
        }
        
        //now calculate the JSA for these values
        var jsa = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, dimjsa);
        var jsa2d = PhaseMatch.create_2d_array(jsa, dimjsa, dimjsa);
        S[i] = PhaseMatch.calc_Schmidt(jsa2d);

        // P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        // // P.optimum_idler(P); //Need to find the optimum idler for each angle.
        // if (P.brute_force) {
        //    P.brute_force_theta_i(P); //use a search. could be time consuming. 
        // }
        // else {
        //     //calculate the correct idler angle analytically.
        //     P.optimum_idler(P);
        // }
        
        // PM[i] = PhaseMatch.phasematch_Int_Phase(P);
    }
    
    // console.log("max pm value = ", maxpm);
    console.log("");
    // console.log("HOM dip = ",PhaseMatch.calc_HOM_JSA(P, 0e-15));
    
    return S;

};

PhaseMatch.calc_XY_fixed_idler = function calc_XY_fixed_idler(props, x_start, x_stop, y_start, y_stop, dim){

    var P = PhaseMatch.deep_copy(props);
    props.update_all_angles(P);


    //temporarily setup the idler angle

    // P.theta_i = P.theta_s;
    P.optimum_idler(P);
    P.phi_i = P.phi_s + Math.PI;

    // console.log('setting idler phi to: ', P.phi_i*180/Math.PI);
        
    P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
    P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");


    var i;
    var X = PhaseMatch.linspace(x_start, x_stop, dim);
    var Y = PhaseMatch.linspace(y_start, y_stop, dim);

    var BW = 1e-9;
    var dim_lambda = 20; 

    var lambda_s = PhaseMatch.linspace(P.lambda_s - BW/2, P.lambda_s + BW/2, dim_lambda);
    var lambda_i = PhaseMatch.linspace(P.lambda_i - BW/2, P.lambda_i + BW/2, dim_lambda);

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_s = Math.atan2(Y[index_y],X[index_x]);

        var maxval = 0;

        for (var j=0; j<dim_lambda; j++){
            P.lambda_s = lambda_s[j];
            // P.lambda_i = lambda_i[j];
            P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);

            P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
            P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");

            var PM_tmp = PhaseMatch.phasematch_Int_Phase(P);
            if (PM_tmp>maxval){
                maxval = PM_tmp;
            }
        }
        PM[i] = maxval;
    }
    return PM;

};


PhaseMatch.calc_XY_mode_solver = function calc_XY_mode_solver(props, x_start, x_stop, y_start, y_stop, BW, dim){
    // dim = 50;
    var P = PhaseMatch.deep_copy(props);
    props.update_all_angles(P);

    P.optimum_idler(P);
    P.phi_i = P.phi_s + Math.PI;
    var X_0 = Math.sin(P.theta_s)* Math.cos(P.phi_s);
    var Y_0 = Math.sin(P.theta_s)* Math.sin(P.phi_s);

    var i;
    var X = PhaseMatch.linspace(x_start, x_stop, dim);
    var Y = PhaseMatch.linspace(y_start, y_stop, dim);

    // var BW = 1e-9;
    var dim_lambda = 10; 
    var lambda_s = PhaseMatch.linspace(P.lambda_s - BW/2, P.lambda_s + BW/2, dim_lambda);
    var lambda_i = PhaseMatch.linspace(P.lambda_i - BW/2, P.lambda_i + BW/2, dim_lambda);
   
    var dim_theta = dim*10;
    var scale = 10;

    var theta_s = PhaseMatch.linspace(P.theta_s - scale*P.W_sx/2, P.theta_s + scale*P.W_sx/2, dim_theta);
    var phi_s = PhaseMatch.linspace(P.phi_s - scale*P.W_sy/2, P.phi_s + scale*P.W_sy/2, dim_theta);

    var dtheta_s = (theta_s[1] - theta_s[0])/dim_theta;

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_i = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_i = Math.atan2(Y[index_y],X[index_x]);
        P.phi_s = P.phi_i + Math.PI;

        var maxval = 0;

        var min_theta_s = function(ts){
            P.theta_s = ts;                
            iterate_theta();
            return 1 - maxval;
        };

        var iterate_theta = function(){
            P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
            P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);

            var x = Math.sin(P.theta_s)*Math.cos(P.phi_s);
            var y = Math.sin(P.theta_s)*Math.sin(P.phi_s);
            var alpha_i = Math.exp(-1*sq((X_0 - x )/(2*P.W_sx)) - sq((Y_0 - y)/(2*P.W_sy)));

            for (var j=0; j<dim_lambda; j++){
                P.lambda_s = lambda_s[j];
                // P.lambda_s = 1500e-9;
                P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);

                P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");
                P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");

                var PM_tmp_complex = PhaseMatch.phasematch(P); //complex

                var PM_tmp = sq(PM_tmp_complex[0]*alpha_i) + sq(PM_tmp_complex[1]*alpha_i);
                if (PM_tmp>maxval){
                    maxval = PM_tmp;
                }
            }
        };

        
        // if (P.brute_force){
        if (true){
            var guess = P.theta_i;
            var ans = PhaseMatch.nelderMead(min_theta_s, guess, 20);
        }
        else{
            for (var j=0; j<dim_lambda; j++){
                P.lambda_s = lambda_s[j];
                // P.lambda_s = 1500e-9;
                P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);

                P.optimum_signal;
                P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
                // P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
                P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");

                var x = Math.sin(P.theta_s)*Math.cos(P.phi_s);
                var y = Math.sin(P.theta_s)*Math.sin(P.phi_s);
                var alpha_i = Math.exp(-1*sq((X_0 - x )/(2*P.W_sx)) - sq((Y_0 - y)/(2*P.W_sy)));


                // P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

                var PM_tmp_complex = PhaseMatch.phasematch(P); //complex

                var PM_tmp = sq(PM_tmp_complex[0]*alpha_i) + sq(PM_tmp_complex[1]*alpha_i);
                if (PM_tmp>maxval){
                    maxval = PM_tmp;
                }
            }
        }
        PM[i] = maxval;

    }
    // console.log("bloop", P.lambda_s*1e9, P.lambda_i*1e9);
    return PM;
};


            // var props = this;
            // var min_delK = function(x){
            //     if (x>Math.PI/2 || x<0){return 1e12;}
            //     props.theta = x;
            //     props.update_all_angles(props);
            //     var delK =  PhaseMatch.calc_delK(props);

            //     return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
            // };

            // var guess = Math.PI/8;
            // var startTime = new Date();

            // var ans = PhaseMatch.nelderMead(min_delK, guess, 1000);
(function(){

    var crystals = {};

    // defaults defined for every crystal
    var defaults = {

        name: 'Unnamed Crystal',
        temp: 20,
        info: '',

        indicies: function(){ return [1, 1, 1]; }
    };

    // get and set crystal db entries

    PhaseMatch.Crystals = function( key, create ){

        // invalid args
        if ( !key ) {return null;}

        if ( !create && !( key in crystals ) ){

            throw 'Crystal type "' + key + ' not yet defined.';
        }

        if ( create ){

            if ( key in crystals ){

                throw 'Crystal type "' + key + ' already defined.';
            }

            crystals[ key ] = PhaseMatch.util.extend({}, defaults, create, { id: key });
        }

        return PhaseMatch.util.clone( crystals[ key ], true );
    };

    // get all crystal keynames
    PhaseMatch.Crystals.keys = function(){

        return PhaseMatch.util.keys( crystals );
    };

})();


/**
 * These are the properties that are used to calculate phasematching
 */


/**
 * BBO indicies. 
 */
PhaseMatch.Crystals('BBO-1', {
    name: 'BBO ref 1',
    // info: '',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        // http://www.newlightphotonics.com/bbo-properties.html & Alan Migdall
        var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
        var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

        //from Newlight Photonics
        var dno= -9.3e-6;
        var dne = -16.6e-6;

        no = no + (temp -20.0)*dno;
        ne = ne + (temp -20.0)*dne;

        return [no, no, ne];
    }
});

/**
 * KTP indicies.
 */
PhaseMatch.Crystals('KTP-1', {
    name: 'KTP ref 1',
    // info: 'H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)',
    info: 'http://www.redoptronics.com/KTP-crystal.html',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

        // http://www.redoptronics.com/KTP-crystal.html
        var nx= Math.sqrt(2.10468 + 0.89342*sq(lambda)/(sq(lambda)-0.04438)-0.01036*sq(lambda)); 
        var ny= Math.sqrt(2.14559 + 0.87629*sq(lambda)/(sq(lambda)-0.0485)-0.01173*sq(lambda));
        var nz= Math.sqrt(1.9446 + 1.3617*sq(lambda)/(sq(lambda)-0.047)-0.01491* sq(lambda));


        // H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)
        // var nx = Math.sqrt( 2.1146 + 0.89188/(1 - (0.20861/sq(lambda))) - (0.01320* sq(lambda)) );
        // var ny = Math.sqrt( 2.1518 + 0.87862/(1 - (0.21801/sq(lambda))) - (0.01327* sq(lambda)) );
        // var nz = Math.sqrt( 2.3136 + 1.00012/(1 - (0.23831/sq(lambda))) - (0.01679* sq(lambda)) );

        // http://www.castech-us.com/casktp.htm & Newlight Photonics
        // var nx= Math.sqrt(3.0065+0.03901/(sq(lambda)-0.04251)-0.01327*sq(lambda));
        // var ny= Math.sqrt(3.0333+0.04154/(sq(lambda)-0.04547)-0.01408*sq(lambda));
        // var nz= Math.sqrt(3.0065+0.05694/(sq(lambda)-0.05658)-0.01682*sq(lambda));


        var dnx= 1.1e-5;
        var dny= 1.3e-5;
        var dnz= 1.6e-5;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;

        // var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
        // var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

        return [nx, ny, nz];
    }
});

/**
 * KTP Ref 2 indicies.
 */
PhaseMatch.Crystals('KTP-2', {
    name: 'KTP ref 2',
    // info: 'H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)',
    info: 'http://www.castech-us.com/casktp.htm & Newlight Photonics',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

        // http://www.redoptronics.com/KTP-crystal.html
        // var nx= Math.sqrt(2.10468 + 0.89342*sq(lambda)/(sq(lambda)-0.04438)-0.01036*sq(lambda)); 
        // var ny= Math.sqrt(2.14559 + 0.87629*sq(lambda)/(sq(lambda)-0.0485)-0.01173*sq(lambda));
        // var nz= Math.sqrt(1.9446 + 1.3617*sq(lambda)/(sq(lambda)-0.047)-0.01491* sq(lambda));


        // H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)
        // var nx = Math.sqrt( 2.1146 + 0.89188/(1 - (0.20861/sq(lambda))) - (0.01320* sq(lambda)) );
        // var ny = Math.sqrt( 2.1518 + 0.87862/(1 - (0.21801/sq(lambda))) - (0.01327* sq(lambda)) );
        // var nz = Math.sqrt( 2.3136 + 1.00012/(1 - (0.23831/sq(lambda))) - (0.01679* sq(lambda)) );

        // http://www.castech-us.com/casktp.htm & Newlight Photonics
        var nx= Math.sqrt(3.0065+0.03901/(sq(lambda)-0.04251)-0.01327*sq(lambda));
        var ny= Math.sqrt(3.0333+0.04154/(sq(lambda)-0.04547)-0.01408*sq(lambda));
        var nz= Math.sqrt(3.0065+0.05694/(sq(lambda)-0.05658)-0.01682*sq(lambda));


        var dnx= 1.1e-5;
        var dny= 1.3e-5;
        var dnz= 1.6e-5;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;

        // var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
        // var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

        return [nx, ny, nz];
    }
});

/**
 * KTP indicies.
 */
PhaseMatch.Crystals('KTP-3', {
    name: 'KTP ref 3',
    // info: 'H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)',
    info: 'Includes Franco Wong"s modificatin.  http://dx.doi.org/10.1063/1.1668320, http://www.redoptronics.com/KTP-crystal.html',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

        // http://www.redoptronics.com/KTP-crystal.html
        var nx= Math.sqrt(2.10468 + 0.89342*sq(lambda)/(sq(lambda)-0.04438)-0.01036*sq(lambda));

        if (lambda< 1.2){
            var ny= Math.sqrt(2.14559 + 0.87629*sq(lambda)/(sq(lambda)-0.0485)-0.01173*sq(lambda));
        }
        else {
            var ny= Math.sqrt(2.0993 + 0.922683*sq(lambda)/(sq(lambda)-0.0467695)-0.0138408*sq(lambda));
        }
        
        var nz= Math.sqrt(1.9446 + 1.3617*sq(lambda)/(sq(lambda)-0.047)-0.01491* sq(lambda));

        var dnx= 1.1e-5;
        var dny= 1.3e-5;
        var dnz= 1.6e-5;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;

        // var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
        // var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

        return [nx, ny, nz];
    }
});



/**
 * BiBO indicies.
 */
PhaseMatch.Crystals('BiBO-1', {
    name: 'BiBO ref 1',
    info: 'http://www.newlightphotonics.com/bibo-properties.html',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        //Alan Migdal's program
        // var nx = Math.sqrt(3.0740 + 0.0323/(sq(lambda)-0.0316) - 0.01337*sq(lambda) );
        // var ny = Math.sqrt(3.1685 + 0.0373/(sq(lambda)-0.0346) - 0.01750*sq(lambda) );
        // var nz = Math.sqrt(3.6545 + 0.0511/(sq(lambda)-0.0371) - 0.0226*sq(lambda)  );

        //http://www.crystech.com/products/crystals/nlocrystals/BIBO.htm
        // var nx = Math.sqrt(3.0740+0.0323/(sq(lambda)-0.0316)-0.01337*sq(lambda));
        // var ny = Math.sqrt(3.1685+0.0373/(sq(lambda)-0.0346)-0.01750*sq(lambda));
        // var nz = Math.sqrt(3.6545+0.0511/(sq(lambda)-0.0371)-0.0226*sq(lambda));

        // http://www.newlightphotonics.com/bibo-properties.html
        var nx = (3.0740 + 0.0323/(sq(lambda)-0.0316)-0.01337*sq(lambda));
        var ny = (3.1685 + 0.0373/(sq(lambda)-0.0346)-0.01750*sq(lambda));
        var nz = (3.6545 + 0.0511/(sq(lambda)-0.0371)-0.0226*sq(lambda));

        // var dnx = 4.8e-5;
        // var dny = 4.4e-6;
        // var dnz = -2.69e-5;
        // nx = nx + (temp -20.0)*dnx;
        // ny = ny + (temp -20.0)*dny;
        // nz = nz + (temp -20.0)*dnz;
        return [nx, ny, nz];
    }
});


/**
 * LiNbO3 indicies.
 */
PhaseMatch.Crystals('LiNbO3-1', {
    name: 'LiNbO3 ref 1',
    info: 'http://www.newlightphotonics.com/bibo-properties.html',
    type: 'Negative Uniaxial',
    cls: 'class_3m',
    lambda_min: 0.4*1e-9,
    lambda_max: 3.4*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        //Alan Migdal's program & http://www.redoptronics.com/linbo3-crystals.html
        var nx = Math.sqrt( 4.9048 - 0.11768/(0.04750 - sq(lambda)) - 0.027169*sq(lambda) );
        var ny = nx;
        var nz = Math.sqrt( 4.5820 - 0.099169/(0.044432 - sq(lambda)) -  0.021950*sq(lambda) );

        // http://www.redoptronics.com/linbo3-crystals.html
        // var nx = Math.sqrt(4.9048+0.11768/(sq(lambda) - 0.04750) - 0.027169 * sq(lambda));
        // var ny = nx
        // var nz = Math.sqrt(4.5820+0.099169/(sq(lambda)- 0.04443) - 0.021950 * sq(lambda));

        //http://www.newlightphotonics.com/LN-crystal.html
        var dnx = -0.874e-6;
        var dny = dnx;
        var dnz = 39.073e-6;



        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;

        return [nx, ny, nz];
    }
});




return PhaseMatch;
}));