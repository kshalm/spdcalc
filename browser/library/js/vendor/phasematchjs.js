/**
 * phasematchjs v0.0.1a - 2016-03-04
 *  ENTER_DESCRIPTION 
 *
 * Copyright (c) 2016 Krister Shalm <kshalm@gmail.com>
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

var window = window || self || this;
// 'use strict';
var PhaseMatch = { util: {} };

(function(){
  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
  var undefined;

  /** Used as the semantic version number. */
  var VERSION = '4.0.1';

  /** Used to compose bitmasks for wrapper metadata. */
  var BIND_FLAG = 1,
      BIND_KEY_FLAG = 2,
      CURRY_BOUND_FLAG = 4,
      CURRY_FLAG = 8,
      CURRY_RIGHT_FLAG = 16,
      PARTIAL_FLAG = 32,
      PARTIAL_RIGHT_FLAG = 64,
      ARY_FLAG = 128,
      REARG_FLAG = 256,
      FLIP_FLAG = 512;

  /** Used to detect hot functions by number of calls within a span of milliseconds. */
  var HOT_COUNT = 150,
      HOT_SPAN = 16;

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0,
      MAX_SAFE_INTEGER = 9007199254740991,
      MAX_INTEGER = 1.7976931348623157e+308,
      NAN = 0 / 0;

  /** Used as references for the maximum length and index of an array. */
  var MAX_ARRAY_LENGTH = 4294967295;

  /** Used as the internal argument placeholder. */
  var PLACEHOLDER = '__lodash_placeholder__';

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns). */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to match leading and trailing whitespace. */
  var reTrim = /^\s+|\s+$/g;

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect host constructors (Safari > 5). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
  cloneableTags[dateTag] = cloneableTags[float32Tag] =
  cloneableTags[float64Tag] = cloneableTags[int8Tag] =
  cloneableTags[int16Tag] = cloneableTags[int32Tag] =
  cloneableTags[mapTag] = cloneableTags[numberTag] =
  cloneableTags[objectTag] = cloneableTags[regexpTag] =
  cloneableTags[setTag] = cloneableTags[stringTag] =
  cloneableTags[symbolTag] = cloneableTags[uint8Tag] =
  cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] =
  cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[weakMapTag] = false;

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /** Detect free variable `exports`. */
  var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType) ? exports : null;

  /** Detect free variable `module`. */
  var freeModule = (objectTypes[typeof module] && module && !module.nodeType) ? module : null;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

  /** Detect free variable `self`. */
  var freeSelf = checkGlobal(objectTypes[typeof self] && self);

  /** Detect free variable `window`. */
  var freeWindow = checkGlobal(objectTypes[typeof window] && window);

  /** Detect `this` as the global object. */
  var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

  /**
   * Used as a reference to the global object.
   *
   * The `this` value is used if it's the global object to avoid Greasemonkey's
   * restricted `window` object, otherwise the `window` object is used.
   */
  var root = freeGlobal || ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) || freeSelf || thisGlobal || Function('return this')();

  /*--------------------------------------------------------------------------*/

  /**
   * Adds the key-value `pair` to `map`.
   *
   * @private
   * @param {Object} map The map to modify.
   * @param {Array} pair The key-value pair to add.
   * @returns {Object} Returns `map`.
   */
  function addMapEntry(map, pair) {
    map.set(pair[0], pair[1]);
    return map;
  }

  /**
   * Adds `value` to `set`.
   *
   * @private
   * @param {Object} set The set to modify.
   * @param {*} value The value to add.
   * @returns {Object} Returns `set`.
   */
  function addSetEntry(set, value) {
    set.add(value);
    return set;
  }

  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {...*} [args] The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */
  function apply(func, thisArg, args) {
    var length = args ? args.length : 0;
    switch (length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  /**
   * A specialized version of `_.reduce` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {boolean} [initAccum] Specify using the first element of `array` as the initial value.
   * @returns {*} Returns the accumulated value.
   */
  function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1,
        length = array.length;

    if (initAccum && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  /**
   * Checks if `value` is a global object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {null|Object} Returns `value` if it's a global object, else `null`.
   */
  function checkGlobal(value) {
    return (value && value.Object === Object) ? value : null;
  }

  /**
   * Checks if `value` is a host object in IE < 9.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
   */
  function isHostObject(value) {
    // Many host objects are `Object` objects that can coerce to strings
    // despite having improperly defined `toString` methods.
    var result = false;
    if (value != null && typeof value.toString != 'function') {
      try {
        result = !!(value + '');
      } catch (e) {}
    }
    return result;
  }

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return value > -1 && value % 1 == 0 && value < length;
  }

  /**
   * Converts `iterator` to an array.
   *
   * @private
   * @param {Object} iterator The iterator to convert.
   * @returns {Array} Returns the converted array.
   */
  function iteratorToArray(iterator) {
    var data,
        result = [];

    while (!(data = iterator.next()).done) {
      result.push(data.value);
    }
    return result;
  }

  /**
   * Converts `map` to an array.
   *
   * @private
   * @param {Object} map The map to convert.
   * @returns {Array} Returns the converted array.
   */
  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);

    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }

  /**
   * Replaces all `placeholder` elements in `array` with an internal placeholder
   * and returns an array of their indexes.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {*} placeholder The placeholder to replace.
   * @returns {Array} Returns the new array of placeholder indexes.
   */
  function replaceHolders(array, placeholder) {
    var index = -1,
        length = array.length,
        resIndex = -1,
        result = [];

    while (++index < length) {
      if (array[index] === placeholder) {
        array[index] = PLACEHOLDER;
        result[++resIndex] = index;
      }
    }
    return result;
  }

  /**
   * Converts `set` to an array.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the converted array.
   */
  function setToArray(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /** Used for built-in method references. */
  var arrayProto = Array.prototype,
      objectProto = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = Function.prototype.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto.toString;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /** Built-in value references. */
  var Reflect = root.Reflect,
      Symbol = root.Symbol,
      Uint8Array = root.Uint8Array,
      enumerate = Reflect ? Reflect.enumerate : undefined,
      getPrototypeOf = Object.getPrototypeOf,
      getOwnPropertySymbols = Object.getOwnPropertySymbols,
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      splice = arrayProto.splice;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys = Object.keys,
      nativeMax = Math.max,
      nativeMin = Math.min;

  /* Built-in method references that are verified to be native. */
  var Map = getNative(root, 'Map'),
      Set = getNative(root, 'Set'),
      WeakMap = getNative(root, 'WeakMap'),
      nativeCreate = getNative(Object, 'create');

  /** Used to store function metadata. */
  var metaMap = WeakMap && new WeakMap;

  /** Used to detect maps and sets. */
  var mapCtorString = Map ? funcToString.call(Map) : '',
      setCtorString = Set ? funcToString.call(Set) : '';

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol ? Symbol.prototype : undefined,
      symbolValueOf = Symbol ? symbolProto.valueOf : undefined;

  /** Used to lookup unminified function names. */
  var realNames = {};

  /*------------------------------------------------------------------------*/

  /**
   * Creates a `lodash` object which wraps `value` to enable implicit method
   * chaining. Methods that operate on and return arrays, collections, and
   * functions can be chained together. Methods that retrieve a single value or
   * may return a primitive value will automatically end the chain sequence and
   * return the unwrapped value. Otherwise, the value must be unwrapped with
   * `_#value`.
   *
   * Explicit chaining, which must be unwrapped with `_#value` in all cases,
   * may be enabled using `_.chain`.
   *
   * The execution of chained methods is lazy, that is, it's deferred until
   * `_#value` is implicitly or explicitly called.
   *
   * Lazy evaluation allows several methods to support shortcut fusion. Shortcut
   * fusion is an optimization to merge iteratee calls; this avoids the creation
   * of intermediate arrays and can greatly reduce the number of iteratee executions.
   * Sections of a chain sequence qualify for shortcut fusion if the section is
   * applied to an array of at least two hundred elements and any iteratees
   * accept only one argument. The heuristic for whether a section qualifies
   * for shortcut fusion is subject to change.
   *
   * Chaining is supported in custom builds as long as the `_#value` method is
   * directly or indirectly included in the build.
   *
   * In addition to lodash methods, wrappers have `Array` and `String` methods.
   *
   * The wrapper `Array` methods are:
   * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
   *
   * The wrapper `String` methods are:
   * `replace` and `split`
   *
   * The wrapper methods that support shortcut fusion are:
   * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
   * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
   * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
   *
   * The chainable wrapper methods are:
   * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`,
   * `at`, `before`, `bind`, `bindAll`, `bindKey`, `chain`, `chunk`, `commit`,
   * `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`, `curry`,
   * `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`, `difference`,
   * `differenceBy`, `differenceWith`, `drop`, `dropRight`, `dropRightWhile`,
   * `dropWhile`, `fill`, `filter`, `flatten`, `flattenDeep`, `flip`, `flow`,
   * `flowRight`, `fromPairs`, `functions`, `functionsIn`, `groupBy`, `initial`,
   * `intersection`, `intersectionBy`, `intersectionWith`, `invert`, `invokeMap`,
   * `iteratee`, `keyBy`, `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`,
   * `matches`, `matchesProperty`, `memoize`, `merge`, `mergeWith`, `method`,
   * `methodOf`, `mixin`, `negate`, `nthArg`, `omit`, `omitBy`, `once`, `orderBy`,
   * `over`, `overArgs`, `overEvery`, `overSome`, `partial`, `partialRight`,
   * `partition`, `pick`, `pickBy`, `plant`, `property`, `propertyOf`, `pull`,
   * `pullAll`, `pullAllBy`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`,
   * `reject`, `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`,
   * `shuffle`, `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`,
   * `takeRight`, `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`,
   * `toArray`, `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`,
   * `unary`, `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`,
   * `unset`, `unshift`, `unzip`, `unzipWith`, `values`, `valuesIn`, `without`,
   * `wrap`, `xor`, `xorBy`, `xorWith`, `zip`, `zipObject`, and `zipWith`
   *
   * The wrapper methods that are **not** chainable by default are:
   * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
   * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `deburr`, `endsWith`, `eq`,
   * `escape`, `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`,
   * `findLast`, `findLastIndex`, `findLastKey`, `floor`, `forEach`, `forEachRight`,
   * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
   * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
   * `isArguments`, `isArray`, `isArrayLike`, `isArrayLikeObject`, `isBoolean`,
   * `isDate`, `isElement`, `isEmpty`, `isEqual`, `isEqualWith`, `isError`,
   * `isFinite`, `isFunction`, `isInteger`, `isLength`, `isMatch`, `isMatchWith`,
   * `isNaN`, `isNative`, `isNil`, `isNull`, `isNumber`, `isObject`, `isObjectLike`,
   * `isPlainObject`, `isRegExp`, `isSafeInteger`, `isString`, `isUndefined`,
   * `isTypedArray`, `join`, `kebabCase`, `last`, `lastIndexOf`, `lowerCase`,
   * `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `min`, `minBy`,
   * `noConflict`, `noop`, `now`, `pad`, `padEnd`, `padStart`, `parseInt`,
   * `pop`, `random`, `reduce`, `reduceRight`, `repeat`, `result`, `round`,
   * `runInContext`, `sample`, `shift`, `size`, `snakeCase`, `some`, `sortedIndex`,
   * `sortedIndexBy`, `sortedLastIndex`, `sortedLastIndexBy`, `startCase`,
   * `startsWith`, `subtract`, `sum`, `sumBy`, `template`, `times`, `toLower`,
   * `toInteger`, `toLength`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`,
   * `trim`, `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`,
   * `upperCase`, `upperFirst`, `value`, and `words`
   *
   * @name _
   * @constructor
   * @category Seq
   * @param {*} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * function square(n) {
   *   return n * n;
   * }
   *
   * var wrapped = _([1, 2, 3]);
   *
   * // returns an unwrapped value
   * wrapped.reduce(_.add);
   * // => 6
   *
   * // returns a wrapped value
   * var squares = wrapped.map(square);
   *
   * _.isArray(squares);
   * // => false
   *
   * _.isArray(squares.value());
   * // => true
   */
  function lodash() {
    // No operation performed.
  }

  /**
   * The function whose prototype all chaining wrappers inherit from.
   *
   * @private
   */
  function baseLodash() {
    // No operation performed.
  }

  /*------------------------------------------------------------------------*/

  /**
   * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
   *
   * @private
   * @param {*} value The value to wrap.
   */
  function LazyWrapper(value) {
    this.__wrapped__ = value;
    this.__actions__ = [];
    this.__dir__ = 1;
    this.__filtered__ = false;
    this.__iteratees__ = [];
    this.__takeCount__ = MAX_ARRAY_LENGTH;
    this.__views__ = [];
  }

  /*------------------------------------------------------------------------*/

  /**
   * Creates an hash object.
   *
   * @private
   * @returns {Object} Returns the new hash object.
   */
  function Hash() {}

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(hash, key) {
    return hashHas(hash, key) && delete hash[key];
  }

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @param {Object} hash The hash to query.
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(hash, key) {
    if (nativeCreate) {
      var result = hash[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty.call(hash, key) ? hash[key] : undefined;
  }

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @param {Object} hash The hash to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(hash, key) {
    return nativeCreate ? hash[key] !== undefined : hasOwnProperty.call(hash, key);
  }

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   */
  function hashSet(hash, key, value) {
    hash[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  }

  /*------------------------------------------------------------------------*/

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @param {Array} [values] The values to cache.
   */
  function MapCache(values) {
    var index = -1,
        length = values ? values.length : 0;

    this.clear();
    while (++index < length) {
      var entry = values[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapClear() {
    this.__data__ = { 'hash': new Hash, 'map': Map ? new Map : [], 'string': new Hash };
  }

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapDelete(key) {
    var data = this.__data__;
    if (isKeyable(key)) {
      return hashDelete(typeof key == 'string' ? data.string : data.hash, key);
    }
    return Map ? data.map['delete'](key) : assocDelete(data.map, key);
  }

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapGet(key) {
    var data = this.__data__;
    if (isKeyable(key)) {
      return hashGet(typeof key == 'string' ? data.string : data.hash, key);
    }
    return Map ? data.map.get(key) : assocGet(data.map, key);
  }

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapHas(key) {
    var data = this.__data__;
    if (isKeyable(key)) {
      return hashHas(typeof key == 'string' ? data.string : data.hash, key);
    }
    return Map ? data.map.has(key) : assocHas(data.map, key);
  }

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache object.
   */
  function mapSet(key, value) {
    var data = this.__data__;
    if (isKeyable(key)) {
      hashSet(typeof key == 'string' ? data.string : data.hash, key, value);
    } else if (Map) {
      data.map.set(key, value);
    } else {
      assocSet(data.map, key, value);
    }
    return this;
  }

  /*------------------------------------------------------------------------*/

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @param {Array} [values] The values to cache.
   */
  function Stack(values) {
    var index = -1,
        length = values ? values.length : 0;

    this.clear();
    while (++index < length) {
      var entry = values[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear() {
    this.__data__ = { 'array': [], 'map': null };
  }

  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function stackDelete(key) {
    var data = this.__data__,
        array = data.array;

    return array ? assocDelete(array, key) : data.map['delete'](key);
  }

  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function stackGet(key) {
    var data = this.__data__,
        array = data.array;

    return array ? assocGet(array, key) : data.map.get(key);
  }

  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function stackHas(key) {
    var data = this.__data__,
        array = data.array;

    return array ? assocHas(array, key) : data.map.has(key);
  }

  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache object.
   */
  function stackSet(key, value) {
    var data = this.__data__,
        array = data.array;

    if (array) {
      if (array.length < (LARGE_ARRAY_SIZE - 1)) {
        assocSet(array, key, value);
      } else {
        data.array = null;
        data.map = new MapCache(array);
      }
    }
    var map = data.map;
    if (map) {
      map.set(key, value);
    }
    return this;
  }

  /*------------------------------------------------------------------------*/

  /**
   * Removes `key` and its value from the associative array.
   *
   * @private
   * @param {Array} array The array to query.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function assocDelete(array, key) {
    var index = assocIndexOf(array, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = array.length - 1;
    if (index == lastIndex) {
      array.pop();
    } else {
      splice.call(array, index, 1);
    }
    return true;
  }

  /**
   * Gets the associative array value for `key`.
   *
   * @private
   * @param {Array} array The array to query.
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function assocGet(array, key) {
    var index = assocIndexOf(array, key);
    return index < 0 ? undefined : array[index][1];
  }

  /**
   * Checks if an associative array value for `key` exists.
   *
   * @private
   * @param {Array} array The array to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function assocHas(array, key) {
    return assocIndexOf(array, key) > -1;
  }

  /**
   * Gets the index at which the first occurrence of `key` is found in `array`
   * of key-value pairs.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  /**
   * Sets the associative array `key` to `value`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   */
  function assocSet(array, key, value) {
    var index = assocIndexOf(array, key);
    if (index < 0) {
      array.push([key, value]);
    } else {
      array[index][1] = value;
    }
  }

  /*------------------------------------------------------------------------*/

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue(object, key, value) {
    var objValue = object[key];
    if ((!eq(objValue, value) ||
          (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) ||
        (value === undefined && !(key in object))) {
      object[key] = value;
    }
  }

  /**
   * The base implementation of `_.assign` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssign(object, source) {
    return object && copyObject(source, keys(source), object);
  }

  /**
   * The base implementation of `_.clone` and `_.cloneDeep` which tracks
   * traversed objects.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @param {Function} [customizer] The function to customize cloning.
   * @param {string} [key] The key of `value`.
   * @param {Object} [object] The parent object of `value`.
   * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone(value, isDeep, customizer, key, object, stack) {
    var result;
    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = getTag(value),
          isFunc = tag == funcTag || tag == genTag;

      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        if (isHostObject(value)) {
          return object ? value : {};
        }
        result = initCloneObject(isFunc ? {} : value);
        if (!isDeep) {
          return copySymbols(value, baseAssign(result, value));
        }
      } else {
        return cloneableTags[tag]
          ? initCloneByTag(value, tag, isDeep)
          : (object ? value : {});
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new Stack);
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    // Recursively populate clone (susceptible to call stack limits).
    (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
      assignValue(result, key, baseClone(subValue, isDeep, customizer, key, value, stack));
    });
    return isArr ? result : copySymbols(value, result);
  }

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} prototype The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  var baseCreate = (function() {
    function object() {}
    return function(prototype) {
      if (isObject(prototype)) {
        object.prototype = prototype;
        var result = new object;
        object.prototype = undefined;
      }
      return result || {};
    };
  }());

  /**
   * The base implementation of `_.forEach` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   */
  var baseEach = createBaseEach(baseForOwn);

  /**
   * The base implementation of `_.flatten` with support for restricting flattening.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {boolean} [isDeep] Specify a deep flatten.
   * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
   * @param {Array} [result=[]] The initial result value.
   * @returns {Array} Returns the new flattened array.
   */
  function baseFlatten(array, isDeep, isStrict, result) {
    result || (result = []);

    var index = -1,
        length = array.length;

    while (++index < length) {
      var value = array[index];
      if (isArrayLikeObject(value) &&
          (isStrict || isArray(value) || isArguments(value))) {
        if (isDeep) {
          // Recursively flatten arrays (susceptible to call stack limits).
          baseFlatten(value, isDeep, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }

  /**
   * The base implementation of `baseForIn` and `baseForOwn` which iterates
   * over `object` properties returned by `keysFunc` invoking `iteratee` for
   * each property. Iteratee functions may exit iteration early by explicitly
   * returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @returns {Object} Returns `object`.
   */
  var baseFor = createBaseFor();

  /**
   * The base implementation of `_.forOwn` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }

  /**
   * The base implementation of `_.has` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} key The key to check.
   * @returns {boolean} Returns `true` if `key` exists, else `false`.
   */
  function baseHas(object, key) {
    // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
    // that are composed entirely of index properties, return `false` for
    // `hasOwnProperty` checks of them.
    return hasOwnProperty.call(object, key) ||
      (typeof object == 'object' && key in object && getPrototypeOf(object) === null);
  }

  /**
   * The base implementation of `_.keys` which doesn't skip the constructor
   * property of prototypes or treat sparse arrays as dense.
   *
   * @private
   * @type Function
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    return nativeKeys(Object(object));
  }

  /**
   * The base implementation of `_.keysIn` which doesn't skip the constructor
   * property of prototypes or treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    object = object == null ? object : Object(object);

    var result = [];
    for (var key in object) {
      result.push(key);
    }
    return result;
  }

  // Fallback for IE < 9 with es6-shim.
  if (enumerate && !propertyIsEnumerable.call({ 'valueOf': 1 }, 'valueOf')) {
    baseKeysIn = function(object) {
      return iteratorToArray(enumerate(object));
    };
  }

  /**
   * The base implementation of `_.pick` without support for individual
   * property names.
   *
   * @private
   * @param {Object} object The source object.
   * @param {string[]} props The property names to pick.
   * @returns {Object} Returns the new object.
   */
  function basePick(object, props) {
    object = Object(object);
    return arrayReduce(props, function(result, key) {
      if (key in object) {
        result[key] = object[key];
      }
      return result;
    }, {});
  }

  /**
   * The base implementation of `_.property` without support for deep paths.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @returns {Function} Returns the new function.
   */
  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }

  /**
   * The base implementation of `setData` without support for hot loop detection.
   *
   * @private
   * @param {Function} func The function to associate metadata with.
   * @param {*} data The metadata.
   * @returns {Function} Returns `func`.
   */
  var baseSetData = !metaMap ? identity : function(func, data) {
    metaMap.set(func, data);
    return func;
  };

  /**
   * Creates a clone of `buffer`.
   *
   * @private
   * @param {ArrayBuffer} buffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function cloneBuffer(buffer) {
    var Ctor = buffer.constructor,
        result = new Ctor(buffer.byteLength),
        view = new Uint8Array(result);

    view.set(new Uint8Array(buffer));
    return result;
  }

  /**
   * Creates a clone of `map`.
   *
   * @private
   * @param {Object} map The map to clone.
   * @returns {Object} Returns the cloned map.
   */
  function cloneMap(map) {
    var Ctor = map.constructor;
    return arrayReduce(mapToArray(map), addMapEntry, new Ctor);
  }

  /**
   * Creates a clone of `regexp`.
   *
   * @private
   * @param {Object} regexp The regexp to clone.
   * @returns {Object} Returns the cloned regexp.
   */
  function cloneRegExp(regexp) {
    var Ctor = regexp.constructor,
        result = new Ctor(regexp.source, reFlags.exec(regexp));

    result.lastIndex = regexp.lastIndex;
    return result;
  }

  /**
   * Creates a clone of `set`.
   *
   * @private
   * @param {Object} set The set to clone.
   * @returns {Object} Returns the cloned set.
   */
  function cloneSet(set) {
    var Ctor = set.constructor;
    return arrayReduce(setToArray(set), addSetEntry, new Ctor);
  }

  /**
   * Creates a clone of the `symbol` object.
   *
   * @private
   * @param {Object} symbol The symbol object to clone.
   * @returns {Object} Returns the cloned symbol object.
   */
  function cloneSymbol(symbol) {
    return Symbol ? Object(symbolValueOf.call(symbol)) : {};
  }

  /**
   * Creates a clone of `typedArray`.
   *
   * @private
   * @param {Object} typedArray The typed array to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned typed array.
   */
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = typedArray.buffer,
        Ctor = typedArray.constructor;

    return new Ctor(isDeep ? cloneBuffer(buffer) : buffer, typedArray.byteOffset, typedArray.length);
  }

  /**
   * Creates an array that is the composition of partially applied arguments,
   * placeholders, and provided arguments into a single array of arguments.
   *
   * @private
   * @param {Array|Object} args The provided arguments.
   * @param {Array} partials The arguments to prepend to those provided.
   * @param {Array} holders The `partials` placeholder indexes.
   * @returns {Array} Returns the new array of composed arguments.
   */
  function composeArgs(args, partials, holders) {
    var holdersLength = holders.length,
        argsIndex = -1,
        argsLength = nativeMax(args.length - holdersLength, 0),
        leftIndex = -1,
        leftLength = partials.length,
        result = Array(leftLength + argsLength);

    while (++leftIndex < leftLength) {
      result[leftIndex] = partials[leftIndex];
    }
    while (++argsIndex < holdersLength) {
      result[holders[argsIndex]] = args[argsIndex];
    }
    while (argsLength--) {
      result[leftIndex++] = args[argsIndex++];
    }
    return result;
  }

  /**
   * This function is like `composeArgs` except that the arguments composition
   * is tailored for `_.partialRight`.
   *
   * @private
   * @param {Array|Object} args The provided arguments.
   * @param {Array} partials The arguments to append to those provided.
   * @param {Array} holders The `partials` placeholder indexes.
   * @returns {Array} Returns the new array of composed arguments.
   */
  function composeArgsRight(args, partials, holders) {
    var holdersIndex = -1,
        holdersLength = holders.length,
        argsIndex = -1,
        argsLength = nativeMax(args.length - holdersLength, 0),
        rightIndex = -1,
        rightLength = partials.length,
        result = Array(argsLength + rightLength);

    while (++argsIndex < argsLength) {
      result[argsIndex] = args[argsIndex];
    }
    var offset = argsIndex;
    while (++rightIndex < rightLength) {
      result[offset + rightIndex] = partials[rightIndex];
    }
    while (++holdersIndex < holdersLength) {
      result[offset + holders[holdersIndex]] = args[argsIndex++];
    }
    return result;
  }

  /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */
  function copyArray(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property names to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @returns {Object} Returns `object`.
   */
  function copyObject(source, props, object) {
    return copyObjectWith(source, props, object);
  }

  /**
   * This function is like `copyObject` except that it accepts a function to
   * customize copied values.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property names to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObjectWith(source, props, object, customizer) {
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index],
          newValue = customizer ? customizer(object[key], source[key], key, object, source) : source[key];

      assignValue(object, key, newValue);
    }
    return object;
  }

  /**
   * Copies own symbol properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbols(source, object) {
    return copyObject(source, getSymbols(source), object);
  }

  /**
   * Creates a function like `_.assign`.
   *
   * @private
   * @param {Function} assigner The function to assign values.
   * @returns {Function} Returns the new assigner function.
   */
  function createAssigner(assigner) {
    return rest(function(object, sources) {
      var index = -1,
          length = sources.length,
          customizer = length > 1 ? sources[length - 1] : undefined,
          guard = length > 2 ? sources[2] : undefined;

      customizer = typeof customizer == 'function' ? (length--, customizer) : undefined;
      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? undefined : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, index, customizer);
        }
      }
      return object;
    });
  }

  /**
   * Creates a `baseEach` or `baseEachRight` function.
   *
   * @private
   * @param {Function} eachFunc The function to iterate over a collection.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length,
          index = fromRight ? length : -1,
          iterable = Object(collection);

      while ((fromRight ? index-- : ++index < length)) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }

  /**
   * Creates a base function for methods like `_.forIn`.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;

      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  /**
   * Creates a function that wraps `func` to invoke it with the optional `this`
   * binding of `thisArg`.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper` for more details.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createBaseWrapper(func, bitmask, thisArg) {
    var isBind = bitmask & BIND_FLAG,
        Ctor = createCtorWrapper(func);

    function wrapper() {
      var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
      return fn.apply(isBind ? thisArg : this, arguments);
    }
    return wrapper;
  }

  /**
   * Creates a function that produces an instance of `Ctor` regardless of
   * whether it was invoked as part of a `new` expression or by `call` or `apply`.
   *
   * @private
   * @param {Function} Ctor The constructor to wrap.
   * @returns {Function} Returns the new wrapped function.
   */
  function createCtorWrapper(Ctor) {
    return function() {
      // Use a `switch` statement to work with class constructors.
      // See http://ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
      // for more details.
      var args = arguments;
      switch (args.length) {
        case 0: return new Ctor;
        case 1: return new Ctor(args[0]);
        case 2: return new Ctor(args[0], args[1]);
        case 3: return new Ctor(args[0], args[1], args[2]);
        case 4: return new Ctor(args[0], args[1], args[2], args[3]);
        case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
        case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
        case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
      }
      var thisBinding = baseCreate(Ctor.prototype),
          result = Ctor.apply(thisBinding, args);

      // Mimic the constructor's `return` behavior.
      // See https://es5.github.io/#x13.2.2 for more details.
      return isObject(result) ? result : thisBinding;
    };
  }

  /**
   * Creates a function that wraps `func` to enable currying.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper` for more details.
   * @param {number} arity The arity of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createCurryWrapper(func, bitmask, arity) {
    var Ctor = createCtorWrapper(func);

    function wrapper() {
      var length = arguments.length,
          index = length,
          args = Array(length),
          fn = (this && this !== root && this instanceof wrapper) ? Ctor : func,
          placeholder = wrapper.placeholder;

      while (index--) {
        args[index] = arguments[index];
      }
      var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
        ? []
        : replaceHolders(args, placeholder);

      length -= holders.length;
      return length < arity
        ? createRecurryWrapper(func, bitmask, createHybridWrapper, placeholder, undefined, args, holders, undefined, undefined, arity - length)
        : apply(fn, this, args);
    }
    return wrapper;
  }

  /**
   * Creates a function that wraps `func` to invoke it with optional `this`
   * binding of `thisArg`, partial application, and currying.
   *
   * @private
   * @param {Function|string} func The function or method name to wrap.
   * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper` for more details.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {Array} [partials] The arguments to prepend to those provided to the new function.
   * @param {Array} [holders] The `partials` placeholder indexes.
   * @param {Array} [partialsRight] The arguments to append to those provided to the new function.
   * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
   * @param {Array} [argPos] The argument positions of the new function.
   * @param {number} [ary] The arity cap of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
    var isAry = bitmask & ARY_FLAG,
        isBind = bitmask & BIND_FLAG,
        isBindKey = bitmask & BIND_KEY_FLAG,
        isCurry = bitmask & CURRY_FLAG,
        isCurryRight = bitmask & CURRY_RIGHT_FLAG,
        isFlip = bitmask & FLIP_FLAG,
        Ctor = isBindKey ? undefined : createCtorWrapper(func);

    function wrapper() {
      var length = arguments.length,
          index = length,
          args = Array(length);

      while (index--) {
        args[index] = arguments[index];
      }
      if (partials) {
        args = composeArgs(args, partials, holders);
      }
      if (partialsRight) {
        args = composeArgsRight(args, partialsRight, holdersRight);
      }
      if (isCurry || isCurryRight) {
        var placeholder = wrapper.placeholder,
            argsHolders = replaceHolders(args, placeholder);

        length -= argsHolders.length;
        if (length < arity) {
          return createRecurryWrapper(func, bitmask, createHybridWrapper, placeholder, thisArg, args, argsHolders, argPos, ary, arity - length);
        }
      }
      var thisBinding = isBind ? thisArg : this,
          fn = isBindKey ? thisBinding[func] : func;

      if (argPos) {
        args = reorder(args, argPos);
      } else if (isFlip && args.length > 1) {
        args.reverse();
      }
      if (isAry && ary < args.length) {
        args.length = ary;
      }
      if (this && this !== root && this instanceof wrapper) {
        fn = Ctor || createCtorWrapper(fn);
      }
      return fn.apply(thisBinding, args);
    }
    return wrapper;
  }

  /**
   * Creates a function that wraps `func` to invoke it with the optional `this`
   * binding of `thisArg` and the `partials` prepended to those provided to
   * the wrapper.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper` for more details.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} partials The arguments to prepend to those provided to the new function.
   * @returns {Function} Returns the new wrapped function.
   */
  function createPartialWrapper(func, bitmask, thisArg, partials) {
    var isBind = bitmask & BIND_FLAG,
        Ctor = createCtorWrapper(func);

    function wrapper() {
      var argsIndex = -1,
          argsLength = arguments.length,
          leftIndex = -1,
          leftLength = partials.length,
          args = Array(leftLength + argsLength),
          fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;

      while (++leftIndex < leftLength) {
        args[leftIndex] = partials[leftIndex];
      }
      while (argsLength--) {
        args[leftIndex++] = arguments[++argsIndex];
      }
      return apply(fn, isBind ? thisArg : this, args);
    }
    return wrapper;
  }

  /**
   * Creates a function that wraps `func` to continue currying.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {number} bitmask The bitmask of wrapper flags. See `createWrapper` for more details.
   * @param {Function} wrapFunc The function to create the `func` wrapper.
   * @param {*} placeholder The placeholder to replace.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {Array} [partials] The arguments to prepend to those provided to the new function.
   * @param {Array} [holders] The `partials` placeholder indexes.
   * @param {Array} [argPos] The argument positions of the new function.
   * @param {number} [ary] The arity cap of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createRecurryWrapper(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
    var isCurry = bitmask & CURRY_FLAG,
        newArgPos = argPos ? copyArray(argPos) : undefined,
        newsHolders = isCurry ? holders : undefined,
        newHoldersRight = isCurry ? undefined : holders,
        newPartials = isCurry ? partials : undefined,
        newPartialsRight = isCurry ? undefined : partials;

    bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
    bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);

    if (!(bitmask & CURRY_BOUND_FLAG)) {
      bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
    }
    var newData = [func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, arity],
        result = wrapFunc.apply(undefined, newData);

    if (isLaziable(func)) {
      setData(result, newData);
    }
    result.placeholder = placeholder;
    return result;
  }

  /**
   * Creates a function that either curries or invokes `func` with optional
   * `this` binding and partially applied arguments.
   *
   * @private
   * @param {Function|string} func The function or method name to wrap.
   * @param {number} bitmask The bitmask of wrapper flags.
   *  The bitmask may be composed of the following flags:
   *     1 - `_.bind`
   *     2 - `_.bindKey`
   *     4 - `_.curry` or `_.curryRight` of a bound function
   *     8 - `_.curry`
   *    16 - `_.curryRight`
   *    32 - `_.partial`
   *    64 - `_.partialRight`
   *   128 - `_.rearg`
   *   256 - `_.ary`
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {Array} [partials] The arguments to be partially applied.
   * @param {Array} [holders] The `partials` placeholder indexes.
   * @param {Array} [argPos] The argument positions of the new function.
   * @param {number} [ary] The arity cap of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
    var isBindKey = bitmask & BIND_KEY_FLAG;
    if (!isBindKey && typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var length = partials ? partials.length : 0;
    if (!length) {
      bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
      partials = holders = undefined;
    }
    ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
    arity = arity === undefined ? arity : toInteger(arity);
    length -= holders ? holders.length : 0;

    if (bitmask & PARTIAL_RIGHT_FLAG) {
      var partialsRight = partials,
          holdersRight = holders;

      partials = holders = undefined;
    }
    var data = isBindKey ? undefined : getData(func),
        newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];

    if (data) {
      mergeData(newData, data);
    }
    func = newData[0];
    bitmask = newData[1];
    thisArg = newData[2];
    partials = newData[3];
    holders = newData[4];
    arity = newData[9] = newData[9] == null
      ? (isBindKey ? 0 : func.length)
      : nativeMax(newData[9] - length, 0);

    if (!arity && bitmask & (CURRY_FLAG | CURRY_RIGHT_FLAG)) {
      bitmask &= ~(CURRY_FLAG | CURRY_RIGHT_FLAG);
    }
    if (!bitmask || bitmask == BIND_FLAG) {
      var result = createBaseWrapper(func, bitmask, thisArg);
    } else if (bitmask == CURRY_FLAG || bitmask == CURRY_RIGHT_FLAG) {
      result = createCurryWrapper(func, bitmask, arity);
    } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !holders.length) {
      result = createPartialWrapper(func, bitmask, thisArg, partials);
    } else {
      result = createHybridWrapper.apply(undefined, newData);
    }
    var setter = data ? baseSetData : setData;
    return setter(result, newData);
  }

  /**
   * Gets metadata for `func`.
   *
   * @private
   * @param {Function} func The function to query.
   * @returns {*} Returns the metadata for `func`.
   */
  var getData = !metaMap ? noop : function(func) {
    return metaMap.get(func);
  };

  /**
   * Gets the name of `func`.
   *
   * @private
   * @param {Function} func The function to query.
   * @returns {string} Returns the function name.
   */
  function getFuncName(func) {
    var result = (func.name + ''),
        array = realNames[result],
        length = hasOwnProperty.call(realNames, result) ? array.length : 0;

    while (length--) {
      var data = array[length],
          otherFunc = data.func;
      if (otherFunc == null || otherFunc == func) {
        return data.name;
      }
    }
    return result;
  }

  /**
   * Gets the "length" property value of `object`.
   *
   * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
   * that affects Safari on at least iOS 8.1-8.3 ARM64.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {*} Returns the "length" value.
   */
  var getLength = baseProperty('length');

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = object == null ? undefined : object[key];
    return isNative(value) ? value : undefined;
  }

  /**
   * Creates an array of the own symbol properties of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbols = getOwnPropertySymbols || function() {
    return [];
  };

  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function getTag(value) {
    return objectToString.call(value);
  }

  // Fallback for IE 11 providing `toStringTag` values for maps and sets.
  if ((Map && getTag(new Map) != mapTag) || (Set && getTag(new Set) != setTag)) {
    getTag = function(value) {
      var result = objectToString.call(value),
          Ctor = result == objectTag ? value.constructor : null,
          ctorString = typeof Ctor == 'function' ? funcToString.call(Ctor) : '';

      if (ctorString) {
        if (ctorString == mapCtorString) {
          return mapTag;
        }
        if (ctorString == setCtorString) {
          return setTag;
        }
      }
      return result;
    };
  }

  /**
   * Initializes an array clone.
   *
   * @private
   * @param {Array} array The array to clone.
   * @returns {Array} Returns the initialized clone.
   */
  function initCloneArray(array) {
    var length = array.length,
        result = array.constructor(length);

    // Add properties assigned by `RegExp#exec`.
    if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject(object) {
    var Ctor = object.constructor;
    return baseCreate(isFunction(Ctor) ? Ctor.prototype : undefined);
  }

  /**
   * Initializes an object clone based on its `toStringTag`.
   *
   * **Note:** This function only supports cloning values with tags of
   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
   *
   * @private
   * @param {Object} object The object to clone.
   * @param {string} tag The `toStringTag` of the object to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag:
        return cloneBuffer(object);

      case boolTag:
      case dateTag:
        return new Ctor(+object);

      case float32Tag: case float64Tag:
      case int8Tag: case int16Tag: case int32Tag:
      case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
        return cloneTypedArray(object, isDeep);

      case mapTag:
        return cloneMap(object);

      case numberTag:
      case stringTag:
        return new Ctor(object);

      case regexpTag:
        return cloneRegExp(object);

      case setTag:
        return cloneSet(object);

      case symbolTag:
        return cloneSymbol(object);
    }
  }

  /**
   * Creates an array of index keys for `object` values of arrays,
   * `arguments` objects, and strings, otherwise `null` is returned.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array|null} Returns index keys, else `null`.
   */
  function indexKeys(object) {
    var length = object ? object.length : undefined;
    return (isLength(length) && (isArray(object) || isString(object) || isArguments(object)))
      ? baseTimes(length, String)
      : null;
  }

  /**
   * Checks if the provided arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
   */
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)) {
      return eq(object[index], value);
    }
    return false;
  }

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value;
    return type == 'number' || type == 'boolean' ||
      (type == 'string' && value !== '__proto__') || value == null;
  }

  /**
   * Checks if `func` has a lazy counterpart.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` has a lazy counterpart, else `false`.
   */
  function isLaziable(func) {
    var funcName = getFuncName(func),
        other = lodash[funcName];

    if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
      return false;
    }
    if (func === other) {
      return true;
    }
    var data = getData(other);
    return !!data && func === data[0];
  }

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

    return value === proto;
  }

  /**
   * Merges the function metadata of `source` into `data`.
   *
   * Merging metadata reduces the number of wrappers used to invoke a function.
   * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
   * may be applied regardless of execution order. Methods like `_.ary` and `_.rearg`
   * modify function arguments, making the order in which they are executed important,
   * preventing the merging of metadata. However, we make an exception for a safe
   * combined case where curried functions have `_.ary` and or `_.rearg` applied.
   *
   * @private
   * @param {Array} data The destination metadata.
   * @param {Array} source The source metadata.
   * @returns {Array} Returns `data`.
   */
  function mergeData(data, source) {
    var bitmask = data[1],
        srcBitmask = source[1],
        newBitmask = bitmask | srcBitmask,
        isCommon = newBitmask < (BIND_FLAG | BIND_KEY_FLAG | ARY_FLAG);

    var isCombo =
      (srcBitmask == ARY_FLAG && (bitmask == CURRY_FLAG)) ||
      (srcBitmask == ARY_FLAG && (bitmask == REARG_FLAG) && (data[7].length <= source[8])) ||
      (srcBitmask == (ARY_FLAG | REARG_FLAG) && (source[7].length <= source[8]) && (bitmask == CURRY_FLAG));

    // Exit early if metadata can't be merged.
    if (!(isCommon || isCombo)) {
      return data;
    }
    // Use source `thisArg` if available.
    if (srcBitmask & BIND_FLAG) {
      data[2] = source[2];
      // Set when currying a bound function.
      newBitmask |= (bitmask & BIND_FLAG) ? 0 : CURRY_BOUND_FLAG;
    }
    // Compose partial arguments.
    var value = source[3];
    if (value) {
      var partials = data[3];
      data[3] = partials ? composeArgs(partials, value, source[4]) : copyArray(value);
      data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : copyArray(source[4]);
    }
    // Compose partial right arguments.
    value = source[5];
    if (value) {
      partials = data[5];
      data[5] = partials ? composeArgsRight(partials, value, source[6]) : copyArray(value);
      data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : copyArray(source[6]);
    }
    // Use source `argPos` if available.
    value = source[7];
    if (value) {
      data[7] = copyArray(value);
    }
    // Use source `ary` if it's smaller.
    if (srcBitmask & ARY_FLAG) {
      data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
    }
    // Use source `arity` if one is not provided.
    if (data[9] == null) {
      data[9] = source[9];
    }
    // Use source `func` and merge bitmasks.
    data[0] = source[0];
    data[1] = newBitmask;

    return data;
  }

  /**
   * Reorder `array` according to the specified indexes where the element at
   * the first index is assigned as the first element, the element at
   * the second index is assigned as the second element, and so on.
   *
   * @private
   * @param {Array} array The array to reorder.
   * @param {Array} indexes The arranged array indexes.
   * @returns {Array} Returns `array`.
   */
  function reorder(array, indexes) {
    var arrLength = array.length,
        length = nativeMin(indexes.length, arrLength),
        oldArray = copyArray(array);

    while (length--) {
      var index = indexes[length];
      array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
    }
    return array;
  }

  /**
   * Sets metadata for `func`.
   *
   * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
   * period of time, it will trip its breaker and transition to an identity function
   * to avoid garbage collection pauses in V8. See [V8 issue 2070](https://code.google.com/p/v8/issues/detail?id=2070)
   * for more details.
   *
   * @private
   * @param {Function} func The function to associate metadata with.
   * @param {*} data The metadata.
   * @returns {Function} Returns `func`.
   */
  var setData = (function() {
    var count = 0,
        lastCalled = 0;

    return function(key, value) {
      var stamp = now(),
          remaining = HOT_SPAN - (stamp - lastCalled);

      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return key;
        }
      } else {
        count = 0;
      }
      return baseSetData(key, value);
    };
  }());

  /**
   * Converts `value` to a function if it's not one.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {Function} Returns the function.
   */
  function toFunction(value) {
    return typeof value == 'function' ? value : identity;
  }

  /*------------------------------------------------------------------------*/

  /**
   * Iterates over elements of `collection` invoking `iteratee` for each element.
   * The iteratee is invoked with three arguments: (value, index|key, collection).
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * **Note:** As with other "Collections" methods, objects with a "length" property
   * are iterated like arrays. To avoid this behavior use `_.forIn` or `_.forOwn`
   * for object iteration.
   *
   * @static
   * @memberOf _
   * @alias each
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   * @example
   *
   * _([1, 2]).forEach(function(value) {
   *   console.log(value);
   * });
   * // => logs `1` then `2`
   *
   * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
   *   console.log(key);
   * });
   * // => logs 'a' then 'b' (iteration order is not guaranteed)
   */
  function forEach(collection, iteratee) {
    return (typeof iteratee == 'function' && isArray(collection))
      ? arrayEach(collection, iteratee)
      : baseEach(collection, toFunction(iteratee));
  }

  /*------------------------------------------------------------------------*/

  /**
   * Gets the timestamp of the number of milliseconds that have elapsed since
   * the Unix epoch (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Date
   * @returns {number} Returns the timestamp.
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => logs the number of milliseconds it took for the deferred function to be invoked
   */
  var now = Date.now;

  /*------------------------------------------------------------------------*/

  /**
   * Creates a function that invokes `func` with the `this` binding of `thisArg`
   * and prepends any additional `_.bind` arguments to those provided to the
   * bound function.
   *
   * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
   * may be used as a placeholder for partially applied arguments.
   *
   * **Note:** Unlike native `Function#bind` this method doesn't set the "length"
   * property of bound functions.
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {Function} func The function to bind.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {...*} [partials] The arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var greet = function(greeting, punctuation) {
   *   return greeting + ' ' + this.user + punctuation;
   * };
   *
   * var object = { 'user': 'fred' };
   *
   * var bound = _.bind(greet, object, 'hi');
   * bound('!');
   * // => 'hi fred!'
   *
   * // using placeholders
   * var bound = _.bind(greet, object, _, '!');
   * bound('hi');
   * // => 'hi fred!'
   */
  var bind = rest(function(func, thisArg, partials) {
    var bitmask = BIND_FLAG;
    if (partials.length) {
      var holders = replaceHolders(partials, bind.placeholder);
      bitmask |= PARTIAL_FLAG;
    }
    return createWrapper(func, bitmask, thisArg, partials, holders);
  });

  /**
   * Creates a function that memoizes the result of `func`. If `resolver` is
   * provided it determines the cache key for storing the result based on the
   * arguments provided to the memoized function. By default, the first argument
   * provided to the memoized function is used as the map cache key. The `func`
   * is invoked with the `this` binding of the memoized function.
   *
   * **Note:** The cache is exposed as the `cache` property on the memoized
   * function. Its creation may be customized by replacing the `_.memoize.Cache`
   * constructor with one whose instances implement the [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
   * method interface of `delete`, `get`, `has`, and `set`.
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {Function} func The function to have its output memoized.
   * @param {Function} [resolver] The function to resolve the cache key.
   * @returns {Function} Returns the new memoizing function.
   * @example
   *
   * var object = { 'a': 1, 'b': 2 };
   * var other = { 'c': 3, 'd': 4 };
   *
   * var values = _.memoize(_.values);
   * values(object);
   * // => [1, 2]
   *
   * values(other);
   * // => [3, 4]
   *
   * object.a = 2;
   * values(object);
   * // => [1, 2]
   *
   * // modifying the result cache
   * values.cache.set(object, ['a', 'b']);
   * values(object);
   * // => ['a', 'b']
   *
   * // replacing `_.memoize.Cache`
   * _.memoize.Cache = WeakMap;
   */
  function memoize(func, resolver) {
    if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments,
          key = resolver ? resolver.apply(this, args) : args[0],
          cache = memoized.cache;

      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result);
      return result;
    };
    memoized.cache = new memoize.Cache;
    return memoized;
  }

  /**
   * Creates a function that invokes `func` with the `this` binding of the
   * created function and arguments from `start` and beyond provided as an array.
   *
   * **Note:** This method is based on the [rest parameter](https://mdn.io/rest_parameters).
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var say = _.rest(function(what, names) {
   *   return what + ' ' + _.initial(names).join(', ') +
   *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
   * });
   *
   * say('hello', 'fred', 'barney', 'pebbles');
   * // => 'hello fred, barney, & pebbles'
   */
  function rest(func, start) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    start = nativeMax(start === undefined ? (func.length - 1) : toInteger(start), 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      switch (start) {
        case 0: return func.call(this, array);
        case 1: return func.call(this, args[0], array);
        case 2: return func.call(this, args[0], args[1], array);
      }
      var otherArgs = Array(start + 1);
      index = -1;
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = array;
      return apply(func, this, otherArgs);
    };
  }

  /*------------------------------------------------------------------------*/

  /**
   * Creates a shallow clone of `value`.
   *
   * **Note:** This method is loosely based on the
   * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
   * and supports cloning arrays, array buffers, booleans, date objects, maps,
   * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
   * arrays. The own enumerable properties of `arguments` objects are cloned
   * as plain objects. An empty object is returned for uncloneable values such
   * as error objects, functions, DOM nodes, and WeakMaps.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to clone.
   * @returns {*} Returns the cloned value.
   * @example
   *
   * var objects = [{ 'a': 1 }, { 'b': 2 }];
   *
   * var shallow = _.clone(objects);
   * console.log(shallow[0] === objects[0]);
   * // => true
   */
  function clone(value) {
    return baseClone(value);
  }

  /**
   * Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'user': 'fred' };
   * var other = { 'user': 'fred' };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
    return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
      (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null &&
      !(typeof value == 'function' && isFunction(value)) && isLength(getLength(value));
  }

  /**
   * This method is like `_.isArrayLike` except that it also checks if `value`
   * is an object.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array-like object, else `false`.
   * @example
   *
   * _.isArrayLikeObject([1, 2, 3]);
   * // => true
   *
   * _.isArrayLikeObject(document.body.children);
   * // => true
   *
   * _.isArrayLikeObject('abc');
   * // => false
   *
   * _.isArrayLikeObject(_.noop);
   * // => false
   */
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 8 which returns 'object' for typed array constructors, and
    // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
    var tag = isObject(value) ? objectToString.call(value) : '';
    return tag == funcTag || tag == genTag;
  }

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    // Avoid a V8 JIT bug in Chrome 19-20.
    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * Checks if `value` is a native function.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
   * @example
   *
   * _.isNative(Array.prototype.push);
   * // => true
   *
   * _.isNative(_);
   * // => false
   */
  function isNative(value) {
    if (value == null) {
      return false;
    }
    if (isFunction(value)) {
      return reIsNative.test(funcToString.call(value));
    }
    return isObjectLike(value) &&
      (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
  }

  /**
   * Checks if `value` is classified as a `String` primitive or object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isString('abc');
   * // => true
   *
   * _.isString(1);
   * // => false
   */
  function isString(value) {
    return typeof value == 'string' ||
      (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
  }

  /**
   * Converts `value` to an integer.
   *
   * **Note:** This function is loosely based on [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted integer.
   * @example
   *
   * _.toInteger(3);
   * // => 3
   *
   * _.toInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toInteger(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toInteger('3');
   * // => 3
   */
  function toInteger(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
      var sign = (value < 0 ? -1 : 1);
      return sign * MAX_INTEGER;
    }
    var remainder = value % 1;
    return value === value ? (remainder ? value - remainder : value) : 0;
  }

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3);
   * // => 3
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3');
   * // => 3
   */
  function toNumber(value) {
    if (isObject(value)) {
      var other = isFunction(value.valueOf) ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  /*------------------------------------------------------------------------*/

  /**
   * This method is like `_.assign` except that it iterates over own and
   * inherited source properties.
   *
   * **Note:** This method mutates `object`.
   *
   * @static
   * @memberOf _
   * @alias extend
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @returns {Object} Returns `object`.
   * @example
   *
   * function Foo() {
   *   this.b = 2;
   * }
   *
   * function Bar() {
   *   this.d = 4;
   * }
   *
   * Foo.prototype.c = 3;
   * Bar.prototype.e = 5;
   *
   * _.assignIn({ 'a': 1 }, new Foo, new Bar);
   * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5 }
   */
  var assignIn = createAssigner(function(object, source) {
    copyObject(source, keysIn(source), object);
  });

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    var isProto = isPrototype(object);
    if (!(isProto || isArrayLike(object))) {
      return baseKeys(object);
    }
    var indexes = indexKeys(object),
        skipIndexes = !!indexes,
        result = indexes || [],
        length = result.length;

    for (var key in object) {
      if (baseHas(object, key) &&
          !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
          !(isProto && key == 'constructor')) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn(object) {
    var index = -1,
        isProto = isPrototype(object),
        props = baseKeysIn(object),
        propsLength = props.length,
        indexes = indexKeys(object),
        skipIndexes = !!indexes,
        result = indexes || [],
        length = result.length;

    while (++index < propsLength) {
      var key = props[index];
      if (!(skipIndexes && (key == 'length' || isIndex(key, length))) &&
          !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Creates an object composed of the picked `object` properties.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The source object.
   * @param {...(string|string[])} [props] The property names to pick, specified
   *  individually or in arrays.
   * @returns {Object} Returns the new object.
   * @example
   *
   * var object = { 'a': 1, 'b': '2', 'c': 3 };
   *
   * _.pick(object, ['a', 'c']);
   * // => { 'a': 1, 'c': 3 }
   */
  var pick = rest(function(object, props) {
    return object == null ? {} : basePick(object, baseFlatten(props));
  });

  /*------------------------------------------------------------------------*/

  /**
   * This method returns the first argument provided to it.
   *
   * @static
   * @memberOf _
   * @category Util
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'user': 'fred' };
   *
   * _.identity(object) === object;
   * // => true
   */
  function identity(value) {
    return value;
  }

  /**
   * A no-operation function that returns `undefined` regardless of the
   * arguments it receives.
   *
   * @static
   * @memberOf _
   * @category Util
   * @example
   *
   * var object = { 'user': 'fred' };
   *
   * _.noop(object) === undefined;
   * // => true
   */
  function noop() {
    // No operation performed.
  }

  /*------------------------------------------------------------------------*/

  LazyWrapper.prototype = baseCreate(baseLodash.prototype);
  LazyWrapper.prototype.constructor = LazyWrapper;

  // Avoid inheriting from `Object.prototype` when possible.
  Hash.prototype = nativeCreate ? nativeCreate(null) : objectProto;

  // Add functions to the `MapCache`.
  MapCache.prototype.clear = mapClear;
  MapCache.prototype['delete'] = mapDelete;
  MapCache.prototype.get = mapGet;
  MapCache.prototype.has = mapHas;
  MapCache.prototype.set = mapSet;

  // Add functions to the `Stack` cache.
  Stack.prototype.clear = stackClear;
  Stack.prototype['delete'] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;

  // Assign cache to `_.memoize`.
  memoize.Cache = MapCache;

  // Add functions that return wrapped values when chaining.
  lodash.assignIn = assignIn;
  lodash.bind = bind;
  lodash.keys = keys;
  lodash.keysIn = keysIn;
  lodash.memoize = memoize;
  lodash.pick = pick;
  lodash.rest = rest;

  // Add aliases.
  lodash.extend = assignIn;

  /*------------------------------------------------------------------------*/

  // Add functions that return unwrapped values when chaining.
  lodash.clone = clone;
  lodash.eq = eq;
  lodash.forEach = forEach;
  lodash.identity = identity;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isArrayLike = isArrayLike;
  lodash.isArrayLikeObject = isArrayLikeObject;
  lodash.isFunction = isFunction;
  lodash.isLength = isLength;
  lodash.isNative = isNative;
  lodash.isObject = isObject;
  lodash.isObjectLike = isObjectLike;
  lodash.isString = isString;
  lodash.noop = noop;
  lodash.now = now;
  lodash.toInteger = toInteger;
  lodash.toNumber = toNumber;

  // Add aliases.
  lodash.each = forEach;

  /*------------------------------------------------------------------------*/

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type string
   */
  lodash.VERSION = VERSION;

  // Assign default placeholders.
  bind.placeholder = lodash;

  /*--------------------------------------------------------------------------*/

  // Expose lodash on the free variable `window` or `self` when available. This
  // prevents errors in cases where lodash is loaded by a script tag in the presence
  // of an AMD loader. See http://requirejs.org/docs/errors.html#mismatch for more details.
  (freeWindow || freeSelf || {})._ = lodash;
;lodash.extend(PhaseMatch.util, lodash);}());

var nm = Math.pow(10, -9);
var um = Math.pow(10, -6);
var lightspeed =  2.99792458 * Math.pow(10, 8);
var twoPI = 2 * Math.PI;

PhaseMatch.constants = {
    // user accessible constants
    um: um,
    nm: nm,
    c: lightspeed
};
PhaseMatch.Complex = (function () {

'use strict';

/*
Localize global props for better performance
 */
var PI = Math.PI
    ,cos = Math.cos
    ,sin = Math.sin
    ,sqrt = Math.sqrt
    ,pow = Math.pow
    ,log = Math.log
    ,exp = Math.exp
    ,abs = Math.abs
    ,atan2 = Math.atan2
    ;

var ArrDef = window.Float64Array || window.Array;

/*
Utility functions
 */
function sinh(x){
    return (exp(x) - exp(-x)) * 0.5;
}

function cosh(x){
    return (exp(x) + exp(-x)) * 0.5;
}

/*
Object definition
 */

function Complex(re, im){
    // allow instantiation by simply: Complex(args);
    if (!(this instanceof Complex)){ return new Complex(re, im);}

    // private properties... don't modify directly
    this._ = new ArrDef(2);

    this.set(re, im);
}

var prototype = Complex.prototype = {

    set: function( re, im ){
        if ( im || re === 0 || im === 0 ){
            this.fromRect( +re, +im );
        } else if ( re.length ){
            this.fromRect( +re[0], +re[1] );
        } else if ( re.re || re.im ){
            this.fromRect( +re.re, +re.im );
        }
        return this;
    },

    fromRect: function( re, im ){
        this._[0] = re;
        this._[1] = im;
        return this;
    },

    fromPolar: function( r, phi ){
        return this.fromRect(
            r * cos(phi),
            r * sin(phi)
        );
    },

    toPrecision: function( k ){
        return this.fromRect(
            this._[0].toPrecision(k),
            this._[1].toPrecision(k)
        );
    },

    toFixed: function( k ){
        return this.fromRect(
            this._[0].toFixed(k),
            this._[1].toFixed(k)
        );
    },

    finalize: function(){
        this.fromRect = function( re, im ){
            return new Complex( re, im );
        };
        if (Object.defineProperty){
            Object.defineProperty(this, 'real', {writable: false, value: this._[0]});
            Object.defineProperty(this, 'im', {writable: false, value: this._[1]});
        }
        return this;
    },

    magnitude: function(){
        var re = this._[0]
            ,im = this._[1]
            ;
        return sqrt(re * re + im * im);
    },

    angle: function(){
        return atan2(this._[1], this._[0]);
    },

    conjugate: function(){
        return this.fromRect(this._[0], -this._[1]);
    },

    negate: function(){
        return this.fromRect(-this._[0], -this._[1]);
    },

    multiply: function( z ){
        var re = this._[0]
            ,im = this._[1]
            ;
        return this.fromRect(
            z._[0] * re - z._[1] * im,
            im * z._[0] + z._[1] * re
        );
    },

    divide: function( z ){
        var zre = z._[0]
            ,zim = z._[1]
            ,re = this._[0]
            ,im = this._[1]
            ,invdivident = 1 / (zre * zre + zim * zim)
            ;
        return this.fromRect(
            (re * zre + im * zim) * invdivident,
            (im * zre - re * zim) * invdivident
        );
    },

    add: function( z ){
        return this.fromRect(this._[0] + z._[0], this._[1] + z._[1]);
    },

    subtract: function( z ){
        return this.fromRect(this._[0] - z._[0], this._[1] - z._[1]);
    },

    pow: function( z ){
        var result = z.multiply(this.clone().log()).exp(); // z^w = e^(w*log(z))
        return this.fromRect(result._[0], result._[1]);
    },

    sqrt: function(){
        var abs = this.magnitude()
            ,sgn = this._[1] < 0 ? -1 : 1
            ;
        return this.fromRect(
            sqrt((abs + this._[0]) * 0.5),
            sgn * sqrt((abs - this._[0]) * 0.5)
        );
    },

    log: function(k){
        if (!k){ k = 0;}
        return this.fromRect(
            log(this.magnitude()),
            this.angle() + k * 2 * PI
        );
    },

    exp: function(){
        return this.fromPolar(
            exp(this._[0]),
            this._[1]
        );
    },

    sin: function(){
        var re = this._[0]
            ,im = this._[1]
            ;
        return this.fromRect(
            sin(re) * cosh(im),
            cos(re) * sinh(im)
        );
    },

    cos: function(){
        var re = this._[0]
            ,im = this._[1]
            ;
        return this.fromRect(
            cos(re) * cosh(im),
            sin(re) * sinh(im) * -1
        );
    },

    tan: function(){
        var re = this._[0]
            ,im = this._[1]
            ,invdivident = 1 / (cos(2 * re) + cosh(2 * im))
            ;
        return this.fromRect(
            sin(2 * re) * invdivident,
            sinh(2 * im) * invdivident
        );
    },

    sinh: function(){
        var re = this._[0]
            ,im = this._[1]
            ;
        return this.fromRect(
            sinh(re) * cos(im),
            cosh(re) * sin(im)
        );
    },

    cosh: function(){
        var re = this._[0]
            ,im = this._[1]
            ;
        return this.fromRect(
            cosh(re) * cos(im),
            sinh(re) * sin(im)
        );
    },

    tanh: function(){
        var re = this._[0]
            ,im = this._[1]
            ,invdivident = 1 / (cosh(2 * re) + cos(2 * im))
            ;
        return this.fromRect(
            sinh(2 * re) * invdivident,
            sin(2 * im) * invdivident
        );
    },

    clone: function(){
        return new Complex(this._[0], this._[1]);
    },

    toString: function( polar ){
        if (polar){ return this.magnitude() + ' ' + this.angle();}

        var ret = ''
            ,re = this._[0]
            ,im = this._[1]
            ;
        if (re) {ret += re;}
        if (re && im || im < 0) {ret += im < 0 ? '-' : '+';}
        if (im){
            var absIm = abs(im);
            if (absIm !== 1) {ret += absIm;}
            ret += 'i';
        }
        return ret || '0';
    },

    equals: function( z ){
        return (z._[0] === this._[0] && z._[1] === this._[1]);
    }

};

// Disable aliases for now...
// var alias = {
//  abs: 'magnitude',
//  arg: 'angle',
//  phase: 'angle',
//  conj: 'conjugate',
//  mult: 'multiply',
//  div: 'divide',
//  sub: 'subtract'
// };

// for (var a in alias) prototype[a] = prototype[alias[a]];

var extend = {

    from: function( real, im ){
        if (real instanceof Complex) {return real.clone();}
        var type = typeof real;
        if (type === 'string'){
            if (real === 'i') {real = '0+1i';}
            var match = real.match(/(\d+)?([\+\-]\d*)[ij]/);
            if (match){
                real = match[1];
                im = (match[2] === '+' || match[2] === '-') ? match[2] + '1' : match[2];
            }
        }
        real = +real;
        im = +im;
        return new Complex(isNaN(real) ? 0 : real, isNaN(im) ? 0 : im);
    },

    fromPolar: function( r, phi ){
        return new Complex(1, 1).fromPolar(r, phi);
    },

    i: new Complex(0, 1).finalize(),

    one: new Complex(1, 0).finalize()

};

for (var e in extend) {Complex[e] = extend[e];}

return Complex;

})();

PhaseMatch.Scratchpad = (function () {
    'use strict';

    // Errors
    var SCRATCH_USAGE_ERROR = 'Error: Scratchpad used after .done() called. (Could it be unintentionally scoped?)';
    var SCRATCH_INDEX_OUT_OF_BOUNDS = 'Error: Scratchpad usage space out of bounds. (Did you forget to call .done()?)';
    var SCRATCH_MAX_REACHED = 'Error: Too many scratchpads created. (Did you forget to call .done()?)';
    var ALREADY_DEFINED_ERROR = 'Error: Object is already registered.';

    // cache previously created scratches
    var scratches = [];
    var numScratches = 0;
    var Scratch, Scratchpad;
    
    var regIndex = 0;


    // begin scratch class
    Scratch = function Scratch(){

        // private variables
        this._active = false;
        this._indexArr = [];
        
        if (++numScratches >= Scratchpad.maxScratches){
            throw SCRATCH_MAX_REACHED;
        }
    };

    Scratch.prototype = {

        /**
         * Declare that your work is finished. Release temp objects for use elsewhere. Must be called when immediate work is done.
         * @param {Mixed} val (optional) Return value to be returned by done
         * @return {Mixed} The value passed to done as an argument if applicable
         */
        done: function( val ){

            this._active = false;
            this._indexArr = [];
            // add it back to the scratch stack for future use
            scratches.push( this );
            return val;
        }
    };


    // API

    /**
     * Get a new scratchpad to work from. Call .done() when finished.
     * @param {Function} fn (optional) If a function is passed as an argument, it will be wrapped so that the scratch instance is its first parameter.
     * @return {Scratch|Function} The scratchpad OR if `fn` is specified, the wrapper function.
     */
    Scratchpad = function Scratchpad( fn ){

        if ( fn ){
            return Scratchpad.fn( fn );
        }

        var scratch = scratches.pop() || new Scratch();
        scratch._active = true;
        return scratch;
    };

    // options
    Scratchpad.maxScratches = 100; // maximum number of scratches
    Scratchpad.maxIndex = 20; // maximum number of any type of temp objects

    /**
     * Wrap a function.
     * @param {Function} fn A function that will be wrapped so that the scratch instance is its first parameter.
     * @return {Function} The wrapper function that can be reused like the original minus the first (scratch) parameter.
     */
    Scratchpad.fn = function( fn ){
        
        var args = [];
        for ( var i = 0, l = fn.length; i < l; i++ ){
            args.push( i );
        }

        args = 'a' + args.join(',a');
        /* jshint -W054 */
        var handle = new Function('fn, scratches, Scratch', 'return function('+args+'){ '+
               'var scratch = scratches.pop() || new Scratch( scratches );'+
               'scratch._active = true;'+
               'return scratch.done( fn(scratch, '+args+') );'+
           '};'
        );
        /* jshint +W054 */

        return handle(fn, scratches, Scratch);
    };

    /**
     * Register a new object to be included in scratchpads
     * @param  {String} name        Name of the object class
     * @param  {Function} constructor The object constructor
     * @param  {Object} options (optional) Config options
     * @return {void}
     */
    Scratchpad.register = function register( name, constructor, options ){

        var proto = Scratch.prototype
            ,idx = regIndex++
            ,stackname = '_' + name + 'Stack'
            ;

        if ( name in proto ) {
            throw ALREADY_DEFINED_ERROR;
        }

        proto[ name ] = function(){

            var stack = this[ stackname ] || ( this[ stackname ] = [])
                ,stackIndex = (this._indexArr[ idx ] | 0) + 1
                ,instance
                ;

            this._indexArr[ idx ] = stackIndex;

            // if used after calling done...
            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            // if too many objects created...
            if (stackIndex >= Scratchpad.maxIndex){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            // return or create new instance
            instance = stack[ stackIndex ];

            if ( !instance ){
                stack.push( instance = new constructor() );
            }

            return instance;
        };

    };

    return Scratchpad;

})();

// register scratchables
PhaseMatch.Scratchpad.register('Complex', PhaseMatch.Complex);


function sq( x ){
    return x * x;
    // return Math.pow(x,2);
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

/*
Reverses a typed array
 */
PhaseMatch.reverse = function reverse(A){
    var rev = new Float64Array(A.length);
    var l = A.length;
    for(var i=0; i<l; i++) {
        rev[i] = A[l-1-i];
    }
    return rev;
};

/* Note:
    Use: Math.max.apply(null, [1,5,2,7,8])
    instead of creating your own
 */

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


/*
* Takes an array and normalizes it using the max value in the array.
*/
PhaseMatch.normalize = function normalize(data){
    var maxval = Math.max.apply(null,data);
    var n = data.length;

    for (var i = 0; i<n; i++){
      data[i] = data[i]/maxval;
    }
    return data;
};

/*
* Takes an array and normalizes it to a given value.
*/
PhaseMatch.normalizeToVal = function normalizeToVal(data,maxval){
    // var maxval = Math.max.apply(null,data);
    var n = data.length;

    for (var i = 0; i<n; i++){
      data[i] = data[i]/maxval;
    }
    return data;
};

/*
* Faster method for finding the max from an array
*/
PhaseMatch.max = function max(data){
    var counter = data.length,
        maxd = -1*Infinity,
        member
        ;

    while (counter--) {
        member = data[counter];
        if (maxd < member) {
            maxd = member;
        }
    }
    return maxd;
};

/*
* Create a special purpose, high speed version of Simpson's rule to
* integrate the z direction in the phasematching function. The function
* returns two arguments corresponding to the real and imag components of
* the number being summed.
*/

/*
* The weights for the 1D Simpson's rule.
 */
 PhaseMatch.NintegrateWeights = function NintegrateWeights(n){
    var weights = new Array(n+1);
    weights[0] = 1;
    weights[n] = 1;
    for (var i=1; i<n; i++){
        if(i%2===0){
            //even case
            weights[i] = 2;
        }
        else{
            weights[i] = 4;
        }
    }
    return weights;
};

/*
Perform a numerical 1D integration using Simpson's rule.

f(x) is the function to be evaluated
a,b are the x start and stop points of the range

The 1D simpson's integrator has weights that are of the form
(1 4 2 4 ... 2 4 1)
 */
PhaseMatch.Nintegrate2arg = function Nintegrate2arg(f,a,b,dx,n,w){
    // we remove the check of n being even for speed. Be careful to only
    // input n that are even.

    dx = (b-a)/n;
    var result_real = 0;
    var result_imag = 0;

    for (var j=0; j<n+1; j++){
        var feval = f(a +j*dx); // f must return two element array
        result_real +=feval[0]*w[j];
        result_imag +=feval[1]*w[j];
    }

    return [result_real*dx/3, result_imag*dx/3];

};


/*
Perform a numerical 1D integration using Simpson's rule.

f(x) is the function to be evaluated
a,b are the x start and stop points of the range

The 1D simpson's integrator has weights that are of the form
(1 4 2 4 ... 2 4 1)
 */
PhaseMatch.Nintegrate = function Nintegrate(f,a,b,n){
    if (n%2 !== 0){
        n = n+1; //guarantee that n is even
    }

    var weights = new Array(n+1);
    weights[0] = 1;
    weights[n] = 1;
    for (var i=1; i<n; i++){
        if(i%2===0){
            //even case
            weights[i] = 2;
        }
        else{
            weights[i] = 4;
        }
    }

    // if (n<50){
    //     console.log(weights);
    // }

    var dx = (b-a)/n;
    var result = 0;

    for (var j=0; j<n+1; j++){
        result +=f(a +j*dx)*weights[j];
    }

    return result*dx/3;

};

/*
Perform a numerical 2D integration using Simpson's rule.
Calculate the array of weights for Simpson's rule.
 */
PhaseMatch.Nintegrate2DWeights = function Nintegrate2DWeights(n){

    if (n%2 !== 0){
        n = n+1; //guarantee that n is even
    }

    var weights = new Array(n+1);
    weights[0] = 1;
    weights[n] = 1;
    for (var i=1; i<n; i++){
        if(i%2===0){
            //even case
            weights[i] = 2;
        }
        else{
            weights[i] = 4;
        }
    }

    return weights;
};

/*
Perform a numerical 2D integration using Simpson's rule.
http://math.fullerton.edu/mathews/n2003/simpsonsrule2dmod.html
http://www.mathworks.com/matlabcentral/fileexchange/23204-2d-simpsons-integrator/content/simp2D.m

Assume a square grid of nxn points.
f(x,y) is the function to be evaluated
a,b are the x start and stop points of the range
c,d are the y start and stop points of the range
The 2D simpson's integrator has weights that are most easily determined
by taking the outer product of the vector of weights for the 1D simpson's
rule. For example let's say we have the vector (1 4 2 4 2 4 1) for 6 intervals.
In 2D we now get an array of weights that is given by:
   | 1  4  2  4  2  4  1 |
   | 4 16  8 16  8 16  4 |
   | 2  8  4  8  4  8  2 |
   | 4 16  8 16  8 16  4 |
   | 2  8  4  8  4  8  2 |
   | 4 16  8 16  8 16  4 |
   | 1  4  2  4  2  4  1 |
Notice how the usual 1D simpson's weights appear around the sides of the array
 */
PhaseMatch.Nintegrate2D = function Nintegrate2D(f,a,b,c,d,n,w){
    var weights;

    if (n%2 !== 0){
        n = n+1; //guarantee that n is even
    }

    if (w === null || w === undefined){
      weights = new Array(n+1);
      weights[0] = 1;
      weights[n] = 1;
      for (var i=1; i<n; i++){
          if(i%2===0){
              //even case
              weights[i] = 2;
          }
          else{
              weights[i] = 4;
          }
      }
  }
  else {
    weights = w;
  }

    // if (n<50){
    //     console.log(weights);
    // }

    var dx = (b-a)/n;
    var dy = (d-c)/n;
    var result = 0;

    for (var j=0; j<n+1; j++){
        for (var k=0; k<n+1; k++){
            result +=f(a +j*dx, c+k*dy)*weights[j]*weights[k];
        }
    }

    return result*dx*dy/9;

};

/*
* Special version of Simpsons 2D integral for use with the mode solver.
* Accepts a function that returns two arguments. Integrates thses two results
* separately. For speed, we strip out the weights code and assume it is provided.
 */

PhaseMatch.Nintegrate2DModeSolver = function Nintegrate2DModeSolver(f,a,b,c,d,n,w){

    var weights = w;

    var dx = (b-a)/n;
    var dy = (d-c)/n;
    var result1 = 0;
    var result2 = 0;
    var result = 0;

    for (var j=0; j<n+1; j++){
        for (var k=0; k<n+1; k++){
            // console.log(f(a +j*dx, c+k*dy)*weights[k] );
            result =f(a +j*dx, c+k*dy);
            result1 += result[0]*weights[j]*weights[k];
            result2 += result[1]*weights[j]*weights[k];
        }
    }

    return [result1*dx*dy/9, result2*dx*dy/9];

};



/*
Calculate the array of weights for Simpson's 3/8 rule.
 */
PhaseMatch.Nintegrate2DWeights_3_8 = function Nintegrate2DWeights_3_8(n){
    // if (n%3 !== 0){
    //     n = n+n%3; //guarantee that n is divisible by 3
    // }

    // n = n+(3- n%3) -3; //guarantee that n is divisible by 3

    // console.log(n);

    var weights = new Array(n+1);
    weights[0] = 1;
    weights[n+1] = 1;
    for (var i=1; i<n+1; i++){
        if(i%3===0){
            weights[i] = 2;
        }
        else{
            weights[i] = 3;
        }
    }
    return weights;
};

/*
Perform a numerical 2D integration using Simpson's 3/8 rule.

Assume a square grid of nxn points.
f(x,y) is the function to be evaluated
a,b are the x start and stop points of the range
c,d are the y start and stop points of the range
The 2D simpson's integrator has weights that are most easily determined
by taking the outer product of the vector of weights for the 1D simpson's
rule. For example let's say we have the vector (1 4 2 4 2 4 1) for 6 intervals.
In 2D we now get an array of weights that is given by:
   | 1  3  3  2  3  3  2  1 | and so on

 */
PhaseMatch.Nintegrate2D_3_8 = function Nintegrate2D_3_8(f,a,b,c,d,n,w){
    var weights;
    // n = n+(3- n%3); //guarantee that n is divisible by 3

    if (w === null || w === undefined){
      weights = PhaseMatch.Nintegrate2DWeights_3_8(n);

    }
    else {
      weights = w;
    }

    if (n<50){
        // console.log(weights);
    }

    var dx = (b-a)/n;
    var dy = (d-c)/n;
    var result = 0;

    for (var j=0; j<n+2; j++){
        for (var k=0; k<n+2; k++){
            // console.log("inside Simpsons. J: " +j.toString() + ", k:" + k.toString() + ", result:" +result.toString());
            result +=f(a +j*dx, c+k*dy)*weights[j]*weights[k];
        }
    }

    return result*dx*dy*9/64;

};

/*
A modification of Simpson's 2-Dimensional 3/8th's rule for the double integral
over length that must be done in the singles caluclation. A custom function is
being written to greatly speed up the calculation. The return is the real and
imaginary parts. Make sure N is divisible by 3.
*/
PhaseMatch.Nintegrate2D_3_8_singles = function Nintegrate2D_3_8_singles(f, fz1 ,a,b,c,d,n,w){
    var weights = w;
    // n = n+(3- n%3); //guarantee that n is divisible by 3

    var  dx = (b-a)/n
        ,dy = (d-c)/n
        ,result1 = 0
        ,result2 = 0
        ;

    for (var j=0; j<n+2; j++){
        var  x = a +j*dx
            ,Cz1 = fz1(x)
            ;

        for (var k=0; k<n+2; k++){
            var  y = c+k*dy
                ,result =f(x, y, Cz1)
                ,weight = weights[j]*weights[k]
                ;
                result1 += result[0] * weight;
                result2 += result[1] * weight;
        }
    }

    return [result1*dx*dy*9/64, result2*dx*dy*9/64];

};


PhaseMatch.RiemannSum2D = function RiemannSum2D(f, a, b, c, d, n){
    var dx = (b-a)/n;
    var dy = (d-c)/n;
    var result = 0;

    for (var j=0; j<n; j++){
        for (var k=0; k<n; k++){
            result +=f(a +j*dx, c+k*dy);
        }
    }

    return result*dx*dy;
};



// Complex number handling
PhaseMatch.cmultiplyR = function cmultiplyR(a,b,c,d){
  return a*c - b*d;
};

PhaseMatch.cmultiplyI = function cmultiplyI(a,b,c,d){
   return a*d + b*c;
};

PhaseMatch.cdivideR = function cdivideR(a,b,c,d){
  return (a*c+b*d)/(sq(c)+sq(d));
};

PhaseMatch.cdivideI = function cdivideI(a,b,c,d){
  return (b*c-a*d)/(sq(c)+sq(d));
};

PhaseMatch.caddR = function caddR(a,ai,b,bi){
  return a+b;
};

PhaseMatch.caddI = function caddI(a,ai,b,bi){
  return ai+bi;
};

// Returns real part of the principal square root of a complex number
PhaseMatch.csqrtR = function csqrtR(a,ai){
  var r = Math.sqrt(sq(a)+sq(ai));
  var arg = Math.atan2(ai,a);
  var real = Math.sqrt(r)*Math.cos(arg/2);
  // return real;
  return PhaseMatch.sign(real)*real; //returns the real value
};

// Returns imag part of the principal square root of a complex number
PhaseMatch.csqrtI = function csqrtI(a,ai){
  var r = Math.sqrt(sq(a)+sq(ai));
  var arg = Math.atan2(ai,a);
  var real = Math.sqrt(r)*Math.cos(arg/2);
  var imag = Math.sqrt(r)*Math.sin(arg/2);
  // return imag;
  return PhaseMatch.sign(real)*imag; //returns the imag value
};

// http://jsperf.com/signs/3
PhaseMatch.sign = function sign(x) {
  return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
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

    var twoPI = Math.PI*2;
    var n_p = P.n_p;
    var n_s = P.n_s;
    var n_i = P.n_i;
    var sinThetaS = Math.sin(P.theta_s);
    var sinThetaI = Math.sin(P.theta_i);
    var invLambdaS = 1 / P.lambda_s;
    var invLambdaI = 1 / P.lambda_i;

    // Directions of the signal and idler photons in the pump coordinates
    var Ss = [ sinThetaS * Math.cos(P.phi_s),  sinThetaS * Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var Si = [ sinThetaI * Math.cos(P.phi_i),  sinThetaI * Math.sin(P.phi_i), Math.cos(P.theta_i)];

    var delKx = (twoPI * ((n_s * Ss[0] * invLambdaS) + n_i * Si[0] * invLambdaI));
    var delKy = (twoPI * ((n_s * Ss[1] * invLambdaS) + n_i * Si[1] * invLambdaI));
    var delKz = (twoPI * (n_p / P.lambda_p - (n_s * Ss[2] * invLambdaS) - n_i * Si[2] * invLambdaI));

    if (P.enable_pp){
        delKz -= twoPI / (P.poling_period * P.poling_sign);
    }

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
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

    var delK = PhaseMatch.calc_delK(P);

    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;

    var arg = P.L/2*(delK[2]);

    var PMz_real = 0;
    var PMz_imag = 0;

    // var convfromFWHM = 1/(2 * Math.sqrt(2*Math.log(2))); //convert from FWHM
    // var convfromFWHM = 1/(2 * Math.sqrt(Math.log(2)));
    // Need to convert my 1/e^2 definition. I am using the definition
    // E = exp(-x^2/(sqrt(2)*W)) vs the standard E = exp(-x^2/W)).
    // Therefore W -> sqrt(2)*W
    var convtoproppergaussian = 1*Math.sqrt(2); // Use 1/e^2 in intensity.
    // var convtoFWHM = 2*(Math.sqrt(Math.log(2)/2));

    var W_s,
        W_i;

    if (P.calcfibercoupling){
        W_s = P.W_sx;
        W_i = P.W_ix;
        // W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s)));
        // W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));
    }
    else {
       W_s = Math.pow(2,20); //Arbitrary large number
       W_i = Math.pow(2,20); //Arbitrary large number
    }

    // // Setup constants
    var Wp_SQ = sq(P.W * convtoproppergaussian); // convert from FWHM to sigma
    var Ws_SQ = sq(W_s * convtoproppergaussian); // convert from FWHM to sigma
    var Wi_SQ = sq(W_i * convtoproppergaussian); // convert from FWHM to sigma @TODO: Change to P.W_i

    // // Setup constants
    // var Wp_SQ = sq(P.W * convtoFWHM); // convert from sigma to FWHM
    // var Ws_SQ = sq(W_s * convtoFWHM); // convert from sigma to FWHM
    // var Wi_SQ = sq(W_i * convtoFWHM); // convert from sigma to FWHM @TODO: Change to P.W_i

    var COS_2THETAs = Math.cos(2*P.theta_s);
    var COS_2THETAi = Math.cos(2*P.theta_i);
    var COS_2PHIs = Math.cos(2*P.phi_s);
    var COS_THETAs = Math.cos(P.theta_s);
    var COS_THETAi = Math.cos(P.theta_i);
    var COS_PHIs = Math.cos(P.phi_s);

    var SIN_2THETAs = Math.sin(2*P.theta_s);
    var SIN_2THETAi = Math.sin(2*P.theta_i);
    var SIN_2PHIs = Math.sin(2*P.phi_s);
    var SIN_THETAs = Math.sin(P.theta_s);
    var SIN_THETAi = Math.sin(P.theta_i);
    var SIN_PHIs = Math.sin(P.phi_s);
    var COS_2THETAi_minus_PHIs = Math.cos(2*(P.theta_i-P.phi_s));
    var COS_2THETAs_minus_PHIs = Math.cos(2*(P.theta_s-P.phi_s));
    var COS_2THETAs_plus_PHIs = Math.cos(2*(P.theta_s+P.phi_s));
    var COS_2THETAi_plus_PHIs = Math.cos(2*(P.theta_i+P.phi_s));
    var COS_2THETAi_plus_THETAs = Math.cos(2*(P.theta_i+P.theta_s));
    var SIN_2THETAi_plus_THETAs = Math.sin(2*(P.theta_i+P.theta_s));
    var SIN_THETAi_plus_THETAs = Math.sin(P.theta_i+P.theta_s);


    var RHOpx = P.walkoff_p; //pump walkoff angle.
    // var RHOpx = 0; //pump walkoff angle.

    RHOpx = -RHOpx; //Take the negative value. This is due to how things are defined later.

    // Deal with the constant term without z dependence
    // Expanded version where W_s does not have to equal W_i

    var Anum1a = (6 + 2*COS_2THETAi  + COS_2THETAi_minus_PHIs  - 2*COS_2PHIs + COS_2THETAi_plus_PHIs)*sq(delK[0]);
    var Anum1b = 8*sq(SIN_THETAi)*SIN_2PHIs*delK[0]*delK[1];
    var Anum1c = (6 + 2*COS_2THETAi  - COS_2THETAi_minus_PHIs  + 2*COS_2PHIs - COS_2THETAi_plus_PHIs)*sq(delK[1]);
    var Anum1 = (Anum1a + Anum1b + Anum1c);

    var Anum2a = 8*(sq(delK[0])+ sq(delK[1]));
    var Anum2b = (6 + 2*COS_2THETAs  + COS_2THETAs_minus_PHIs + COS_2THETAs_plus_PHIs - 2*COS_2PHIs)*sq(delK[0]);
    var Anum2c = 8*sq(SIN_THETAi)*SIN_2PHIs*delK[0]*delK[1];
    var Anum2d = (6 + 2*COS_2THETAs  - COS_2THETAs_minus_PHIs - COS_2THETAs_plus_PHIs + 2*COS_2PHIs)*sq(delK[1]);
    var Anum2e = (Anum2b + Anum2c + Anum2d);

    var Anum1rr = Wp_SQ*Ws_SQ*(Anum1a + Anum1b + Anum1c);
    var Anum2arr = 8*Ws_SQ*(sq(delK[0])+ sq(delK[1]));
    var Anum2rr = Wi_SQ*(Anum2arr + Wp_SQ*(Anum2e));
    var Anum = Wi_SQ*Ws_SQ*Wp_SQ*(Anum1rr + Anum2rr);

    // var Aden = 16*(Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*( sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
    // var A = Anum / Aden;

    var ki = P.n_i * 2 * Math.PI/P.lambda_i;
    var ks = P.n_s * 2 * Math.PI/P.lambda_s;
    var kp = P.n_p * 2 * Math.PI/P.lambda_p;


     // Deal with the z term coefficient. It is imaginary. Version with W_s and W_i independent
    var Bnum1 = 4*(SIN_2THETAi*SIN_PHIs*delK[0] + COS_PHIs*SIN_2THETAi*delK[1] +2*sq(COS_THETAi)*delK[2]);

    var Bnum2a = 4*((SIN_2THETAi - SIN_2THETAs)*SIN_PHIs*delK[0] +COS_PHIs*(SIN_2THETAi- SIN_2THETAs)*delK[1] + (2+COS_2THETAi+COS_2THETAs)*delK[2]);
    var Bnum2b = (4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));

    var Bnum3a1 = -4*(SIN_2THETAs*SIN_PHIs*delK[0]+COS_PHIs*SIN_2THETAs*delK[1]-2*sq(COS_THETAs)*delK[2]);
    var Bnum3a2 = 8*(delK[2]+delK[1]*RHOpx);
    var Bnum3b = (4*(3 + COS_2THETAs)*delK[2] +delK[0]*(-4*SIN_2THETAs*SIN_PHIs + (6+2*COS_2THETAs+COS_2THETAs_minus_PHIs-2*COS_2PHIs+COS_2THETAs_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAs*delK[1]*(-COS_THETAs+SIN_THETAs*SIN_PHIs*RHOpx));


    // var Bnum1 = 4*sq(Wp_SQ)*sq(Ws_SQ)*(SIN_2THETAi*SIN_PHIs*delK[0] + COS_PHIs*SIN_2THETAi*delK[1] +2*sq(COS_THETAi)*delK[2]);
    // var Bnum2a = 4*Wp_SQ*((SIN_2THETAi - SIN_2THETAs)*SIN_PHIs*delK[0] +COS_PHIs*(SIN_2THETAi- SIN_2THETAs)*delK[1] + (2+COS_2THETAi+COS_2THETAs)*delK[2]);       // var Bnum2b = Ws_SQ*(4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));
    // var Bnum2b = Ws_SQ*(4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));
    // var Bnum2 = Wi_SQ*Wp_SQ*Ws_SQ*(Bnum2a + Bnum2b);
    // var Bnum2 = Wi_SQ*Wp_SQ*Ws_SQ*(Bnum2a + Bnum2b);
    // var Bnum3a = -4*sq(Wp_SQ)*(SIN_2THETAs*SIN_PHIs*delK[0]+COS_PHIs*SIN_2THETAs*delK[1]-2*sq(COS_THETAs)*delK[2]) + 8*sq(Ws_SQ)*(delK[2]+delK[1]*RHOpx);
    // var Bnum3b = Wp_SQ* Ws_SQ*(4*(3 + COS_2THETAs)*delK[2] +delK[0]*(-4*SIN_2THETAs*SIN_PHIs + (6+2*COS_2THETAs+COS_2THETAs_minus_PHIs-2*COS_2PHIs+COS_2THETAs_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAs*delK[1]*(-COS_THETAs+SIN_THETAs*SIN_PHIs*RHOpx));
    // var Bnum3 = sq(Wi_SQ)*(Bnum3a + Bnum3b);


    // var Bnum = Bnum1 + Bnum2 +Bnum3;
    // var B = 2*Bnum / (Aden);

    //start z dependence on B
    // var Bnum1 = 4*sq(Wp_SQ)*sq(Ws_SQ)*(SIN_2THETAi*SIN_PHIs*delK[0] + COS_PHIs*SIN_2THETAi*delK[1] +2*sq(COS_THETAi)*delK[2]);


    // var B = BR;



    // Deal with the z^2 term coefficient. It is real. Drop all terms where the walkoff angle is squared (small angle approx)
    // version where W_s and W_i are different
    var Cnum = sq(SIN_THETAi_plus_THETAs)*Wp_SQ + Ws_SQ*(sq(SIN_THETAi) - SIN_2THETAi*SIN_PHIs*RHOpx)+Wi_SQ*(sq(SIN_THETAs)+SIN_2THETAs*SIN_PHIs*RHOpx);

    var Cnuma = sq(SIN_THETAi_plus_THETAs);
    var Cnumb = (sq(SIN_THETAi) - SIN_2THETAi*SIN_PHIs*RHOpx);
    var Cnumc = (sq(SIN_THETAs)+SIN_2THETAs*SIN_PHIs*RHOpx);


    // var Cden = 2*(sq(COS_THETAi)*Wp_SQ+Wi_SQ*(COS_THETAs*Wp_SQ+Ws_SQ));
    // var Cden = 2*(sq(COS_THETAi)*Wp_SQ*Ws_SQ +Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
    // var C = Cnum / Cden;


    // var Cnum = sq(SIN_THETAi_plus_THETAs)*Wp_SQ + Ws_SQ*(sq(SIN_THETAi) - SIN_2THETAi*SIN_PHIs*RHOpx)+Wi_SQ*(sq(SIN_THETAs)+SIN_2THETAs*SIN_PHIs*RHOpx);


    // // Now calculate the normalization coefficients.
    // // First the constant that remains after analytically integrating over x
    var xconst1,
        yconst1,
        yconst2,
        xconst,
        yconst,
        pi2 = 2*Math.PI,
        gaussnorm
        ;

    if (P.singles){
        xconst1 = 1/Wp_SQ;
        xconst1 += (sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs))/Ws_SQ;
        xconst = Math.sqrt(2*Math.PI)/Math.sqrt(xconst1);

        // Next the constant that remains after analytically integrating over y
        yconst1 = (Wp_SQ+Ws_SQ)*(sq(COS_THETAs)*Wp_SQ+Ws_SQ);
        yconst2 = Wp_SQ*Ws_SQ*( (sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ);
        yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);

        // Normalization from the Gaussian terms in the integral.
        gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));
    }
    else{
        xconst1 = (sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs))/Wi_SQ;
        xconst1 += 1/Wp_SQ;
        xconst1 += (sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs))/Ws_SQ;
        xconst = Math.sqrt(2*Math.PI)/Math.sqrt(xconst1);

        // Next the constant that remains after analytically integrating over y
        yconst1 = (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi))*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ );
        yconst2 = Wi_SQ*Wp_SQ*Ws_SQ*((sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs))*Wp_SQ*Ws_SQ + Wi_SQ* (( sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ));
        yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);

        // Normalization from the Gaussian terms in the integral.
        gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wi_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));
    }

    var pmzcoeff = 0,
        bw;

    if (P.calc_apodization && P.enable_pp){
        // var apodization_coeff = P.apodization_coeff;
        bw = P.apodization_FWHM  / 2.3548;
    }
    else {
        bw = Math.pow(2,20);
    }


    ///////////////////////////////////////////
    var calczterms = function(z){
        var Q_sR = Ws_SQ,
            Q_sI = -2*z/ks,
            Q_iR = Wi_SQ,
            Q_iI = -2*z/ki,
            Q_pR = Wp_SQ,
            Q_pI = 2*z/kp,
            Q_sR_SQ = PhaseMatch.cmultiplyR(Q_sR, Q_sI, Q_sR, Q_sI),
            Q_sI_SQ = PhaseMatch.cmultiplyI(Q_sR, Q_sI, Q_sR, Q_sI),
            Q_iR_SQ = PhaseMatch.cmultiplyR(Q_iR, Q_iI, Q_iR, Q_iI),
            Q_iI_SQ = PhaseMatch.cmultiplyI(Q_iR, Q_iI, Q_iR, Q_iI),
            Q_pR_SQ = PhaseMatch.cmultiplyR(Q_pR, Q_pI, Q_pR, Q_pI),
            Q_pI_SQ = PhaseMatch.cmultiplyI(Q_pR, Q_pI, Q_pR, Q_pI);

        var Q_isR = PhaseMatch.cmultiplyR(Q_iR,Q_iI,Q_sR, Q_sI);
        var Q_isI = PhaseMatch.cmultiplyI(Q_iR,Q_iI,Q_sR, Q_sI);

        var Q_ispR = PhaseMatch.cmultiplyR(Q_pR,Q_pI,Q_isR, Q_isI);
        var Q_ispI = PhaseMatch.cmultiplyI(Q_pR,Q_pI,Q_isR, Q_isI);

        var Q_ipR = PhaseMatch.cmultiplyR(Q_iR,Q_iI,Q_pR, Q_pI);
        var Q_ipI = PhaseMatch.cmultiplyI(Q_iR,Q_iI,Q_pR, Q_pI);

        var Q_spR = PhaseMatch.cmultiplyR(Q_sR,Q_sI,Q_pR, Q_pI);
        var Q_spI = PhaseMatch.cmultiplyI(Q_sR,Q_sI,Q_pR, Q_pI);



        var Anum1R = Q_spR*Anum1;
        var Anum1I = Q_spI*Anum1;
        var Anum2aR = Q_sR*Anum2a;
        var Anum2aI = Q_sI*Anum2a;
        // var Anum2 = Wi_SQ*(Anum2a + Wp_SQ*(Anum2b + Anum2c + Anum2d));
        var Anum2c1R = Q_pR*Anum2e;
        var Anum2c1I = Q_pI*Anum2e;
        var Anum2c2R = PhaseMatch.caddR(Anum2aR, Anum2aI, Anum2c1R, Anum2c1I);
        var Anum2c2I = PhaseMatch.caddI(Anum2aR, Anum2aI, Anum2c1R, Anum2c1I);
        var Anum2R = PhaseMatch.cmultiplyR(Anum2c2R, Anum2c2I, Q_iR, Q_iI);
        var Anum2I = PhaseMatch.cmultiplyI(Anum2c2R, Anum2c2I, Q_iR, Q_iI);
        // var Anum = Wi_SQ*Ws_SQ*Wp_SQ*(Anum1 + Anum2);
        var Anum12R = PhaseMatch.caddR(Anum1R, Anum1I, Anum2R, Anum2I);
        var Anum12I = PhaseMatch.caddI(Anum1R, Anum1I, Anum2R, Anum2I);
        var AnumR = PhaseMatch.cmultiplyR(Q_ispR, Q_ispI, Anum12R, Anum12I);
        var AnumI = PhaseMatch.cmultiplyI(Q_ispR, Q_ispI, Anum12R, Anum12I);
        var Anum = AnumR;

        // var Aden = 16*(Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*( sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
        var Aden1R = PhaseMatch.caddR(Q_spR,Q_spI,Q_ipR, Q_ipI);
        var Aden1I = PhaseMatch.caddI(Q_spR,Q_spI,Q_ipR, Q_ipI);
        var Aden2R = PhaseMatch.caddR(Aden1R,Aden1I,Q_isR, Q_isI);
        var Aden2I = PhaseMatch.caddI(Aden1R,Aden1I,Q_isR, Q_isI);
        var Aden3R = sq(COS_THETAi)*Q_spR;
        var Aden3I = sq(COS_THETAi)*Q_spI;
        var Aden4R = sq(COS_THETAs)*Q_ipR;
        var Aden4I = sq(COS_THETAs)*Q_ipI;
        var Aden5R = PhaseMatch.caddR(Aden3R, Aden3I, Aden4R, Aden4I);
        var Aden5I = PhaseMatch.caddI(Aden3R, Aden3I, Aden4R, Aden4I);
        var Aden6R = PhaseMatch.caddR(Aden5R, Aden5I, Q_isR, Q_isI);
        var Aden6I = PhaseMatch.caddI(Aden5R, Aden5I, Q_isR, Q_isI);
        var AdenR = 16 * PhaseMatch.cmultiplyR(Aden6R, Aden6I, Aden2R,Aden2I);
        var AdenI = 16 * PhaseMatch.cmultiplyI(Aden6R, Aden6I, Aden2R,Aden2I);

        var AR = PhaseMatch.cdivideR(AnumR, AnumI, AdenR, AdenI);
        var AI = PhaseMatch.cdivideI(AnumR, AnumI, AdenR, AdenI);


        var Bnum1aR = Q_pR_SQ * Bnum1;
        var Bnum1aI = Q_pI_SQ * Bnum1;
        var Bnum1R = PhaseMatch.cmultiplyR(Bnum1aR, Bnum1aI, Q_sR_SQ, Q_sI_SQ);
        var Bnum1I = PhaseMatch.cmultiplyI(Bnum1aR, Bnum1aI, Q_sR_SQ, Q_sI_SQ);
        // var Bnum2a = 4*Wp_SQ*((SIN_2THETAi - SIN_2THETAs)*SIN_PHIs*delK[0] +COS_PHIs*(SIN_2THETAi- SIN_2THETAs)*delK[1] + (2+COS_2THETAi+COS_2THETAs)*delK[2]);
        var Bnum2aR = Q_pR * Bnum2a;
        var Bnum2aI = Q_pI * Bnum2a;
        // var Bnum2b = Ws_SQ*(4*(3 + COS_2THETAi)*delK[2] +delK[0]*(4*SIN_2THETAi*SIN_PHIs + (6+2*COS_2THETAi+COS_2THETAi_minus_PHIs-2*COS_2PHIs+COS_2THETAi_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAi*delK[1]*(COS_THETAi+SIN_THETAi*SIN_PHIs*RHOpx));
        var Bnum2bR = Q_sR * Bnum2b;
        var Bnum2bI = Q_sI * Bnum2b;
        // var Bnum2 = Wi_SQ*Wp_SQ*Ws_SQ*(Bnum2a + Bnum2b);
        var Bnum2cR = PhaseMatch.caddR(Bnum2aR, Bnum2aI, Bnum2bR, Bnum2bI );
        var Bnum2cI = PhaseMatch.caddI(Bnum2aR, Bnum2aI, Bnum2bR, Bnum2bI );
        var Bnum2R = PhaseMatch.cmultiplyR(Bnum2cR, Bnum2cI, Q_ispR, Q_ispI);
        var Bnum2I = PhaseMatch.cmultiplyI(Bnum2cR, Bnum2cI, Q_ispR, Q_ispI);
        // var Bnum3a = -4*sq(Wp_SQ)*(SIN_2THETAs*SIN_PHIs*delK[0]+COS_PHIs*SIN_2THETAs*delK[1]-2*sq(COS_THETAs)*delK[2]) + 8*sq(Ws_SQ)*(delK[2]+delK[1]*RHOpx);
        var Bnum3a1R = Bnum3a1 * Q_pR_SQ;
        var Bnum3a1I = Bnum3a1 * Q_pI_SQ;
        var Bnum3a2R = Bnum3a2 * Q_sR_SQ;
        var Bnum3a2I = Bnum3a2 * Q_sI_SQ;
        var Bnum3aR = PhaseMatch.caddR(Bnum3a1R,Bnum3a1I,Bnum3a2R,Bnum3a2I);
        var Bnum3aI = PhaseMatch.caddI(Bnum3a1R,Bnum3a1I,Bnum3a2R,Bnum3a2I);
        // var Bnum3b = Wp_SQ* Ws_SQ*(4*(3 + COS_2THETAs)*delK[2] +delK[0]*(-4*SIN_2THETAs*SIN_PHIs + (6+2*COS_2THETAs+COS_2THETAs_minus_PHIs-2*COS_2PHIs+COS_2THETAs_plus_PHIs)*RHOpx) +8*COS_PHIs*SIN_THETAs*delK[1]*(-COS_THETAs+SIN_THETAs*SIN_PHIs*RHOpx));
        var Bnum3bR = Bnum3b * Q_spR;
        var Bnum3bI = Bnum3b * Q_spI;
        // var Bnum3 = sq(Wi_SQ)*(Bnum3a + Bnum3b);
        var Bnum3cR = PhaseMatch.caddR(Bnum3aR, Bnum3aI, Bnum3bR, Bnum3bI);
        var Bnum3cI = PhaseMatch.caddI(Bnum3aR, Bnum3aI, Bnum3bR, Bnum3bI);
        var Bnum3R = PhaseMatch.cmultiplyR(Bnum3cR, Bnum3cI, Q_iR_SQ, Q_iI_SQ);
        var Bnum3I = PhaseMatch.cmultiplyI(Bnum3cR, Bnum3cI, Q_iR_SQ, Q_iI_SQ);
        // var Bnum = Bnum1 + Bnum2 +Bnum3;
        var BnumaR = PhaseMatch.caddR(Bnum1R, Bnum1I, Bnum2R, Bnum2I);
        var BnumaI = PhaseMatch.caddI(Bnum1R, Bnum1I, Bnum2R, Bnum2I);
        var BnumR = PhaseMatch.caddR(BnumaR, BnumaI, Bnum3R, Bnum3I);
        var BnumI = PhaseMatch.caddI(BnumaR, BnumaI, Bnum3R, Bnum3I);
        // var B = 2*Bnum / (Aden);
        var BR = 2* PhaseMatch.cdivideR(BnumR, BnumI, AdenR, AdenI);
        var BI = 2* PhaseMatch.cdivideI(BnumR, BnumI, AdenR, AdenI);


        var CnumaR = Q_pR * Cnuma,
            CnumaI = Q_pI * Cnuma,
            CnumbR = Q_sR * Cnumb,
            CnumbI = Q_sI * Cnumb,
            CnumcR = Q_iR * Cnumc,
            CnumcI = Q_iI * Cnumc,
            CnumdR = PhaseMatch.caddR(CnumaR, CnumaI, CnumbR, CnumbI),
            CnumdI = PhaseMatch.caddI(CnumaR, CnumaI, CnumbR, CnumbI),
            CnumR = PhaseMatch.caddR(CnumdR, CnumdI, CnumcR, CnumcI),
            CnumI = PhaseMatch.caddI(CnumdR, CnumdI, CnumcR, CnumcI);

        // var Cden = 2*(sq(COS_THETAi)*Wp_SQ*Ws_SQ +Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
        var CdenaR = sq(COS_THETAi)*Q_spR,
            CdenaI = sq(COS_THETAi)*Q_spI,
            CdenbR = sq(COS_THETAs)*Q_ipR,
            CdenbI = sq(COS_THETAs)*Q_ipI,
            CdencR = PhaseMatch.caddR(CdenaR, CdenaI, CdenbR, CdenbI),
            CdencI = PhaseMatch.caddI(CdenaR, CdenaI, CdenbR, CdenbI),
            CdenR = 2*PhaseMatch.caddR(CdencR, CdencI, Q_isR, Q_isI),
            CdenI = 2*PhaseMatch.caddI(CdencR, CdencI, Q_isR, Q_isI);

        var CR = PhaseMatch.cdivideR(CnumR, CnumI, CdenR, CdenI),
            CI = PhaseMatch.cdivideI(CnumR, CnumI, CdenR, CdenI);

        // var coeff1R = PhaseMatch.caddR(Q_isR, Q_isI, Q_ipR, Q_ipI);
        // var coeff1I = PhaseMatch.caddI(Q_isR, Q_isI, Q_ipR, Q_ipI);

        // var coeffinvR = PhaseMatch.caddR(coeff1R, coeff1I, Q_spR, Q_spI);
        // var coeffinvI = PhaseMatch.caddI(coeff1R, coeff1I, Q_spR, Q_spI);
        // // Math.sqrt(Wp_SQ*Ws_SQ*Wi_SQ)
        // var coeffR = PhaseMatch.cdivideR(Math.sqrt(Wp_SQ*Ws_SQ*Wi_SQ), 0, coeffinvR, coeffinvI);
        // var coeffI = PhaseMatch.cdivideI(Math.sqrt(Wp_SQ*Ws_SQ*Wi_SQ), 0, coeffinvR, coeffinvI);

        // gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wi_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));
        var gN = sq(1/Math.sqrt(Math.PI*2))*1/Math.sqrt(Math.PI*2),
            gaussR = PhaseMatch.cdivideR(gN * Math.sqrt(Ws_SQ * Wi_SQ *Wp_SQ), 0 , Q_ispR,Q_ispI),
            gaussI = PhaseMatch.cdivideI(gN * Math.sqrt(Ws_SQ * Wi_SQ *Wp_SQ), 0 , Q_ispR,Q_ispI);

        // xconst1 = (sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs))/Wi_SQ;
        var xconst1R = PhaseMatch.cdivideR((sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs)), 0, Q_iR, Q_iI),
            xconst1I = PhaseMatch.cdivideI((sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs)), 0, Q_iR, Q_iI),
            // xconst1 += 1/Wp_SQ;
            xconst2R = PhaseMatch.cdivideR(1, 0, Q_pR, Q_pI),
            xconst2I = PhaseMatch.cdivideI(1, 0, Q_pR, Q_pI),
            xconst3R = PhaseMatch.caddR(xconst1R,xconst1I,xconst2R,xconst2I),
            xconst3I = PhaseMatch.caddI(xconst1R,xconst1I,xconst2R,xconst2I),
            // xconst1 += (sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs))/Ws_SQ;
            xconst4R = PhaseMatch.cdivideR(sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs), 0, Q_sR, Q_sI),
            xconst4I = PhaseMatch.cdivideI(sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs), 0, Q_sR, Q_sI),
            xconst5R = PhaseMatch.caddR(xconst3R,xconst3I,xconst4R,xconst4I),
            xconst5I = PhaseMatch.caddI(xconst3R,xconst3I,xconst4R,xconst4I),
            // Math.sqrt(xconst1);
            xconst6R = PhaseMatch.csqrtR(xconst5R, xconst5I),
            xconst6I = PhaseMatch.csqrtI(xconst5R, xconst5I),
            // xconst = Math.sqrt(2*Math.PI)/Math.sqrt(xconst1);
            xconstR = PhaseMatch.cdivideR(Math.sqrt(2*Math.PI),0,xconst6R, xconst6I),
            xconstI = PhaseMatch.cdivideI(Math.sqrt(2*Math.PI),0,xconst6R, xconst6I);

        // yconst numerator
        // yconst1 = (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ ));
        //
        // (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))
        //
        var ynum1R = PhaseMatch.caddR(Q_spR,Q_spI,Q_ipR,Q_ipI),
            ynum1I = PhaseMatch.caddI(Q_spR,Q_spI,Q_ipR,Q_ipI),
            ynum2R = PhaseMatch.caddR(ynum1R,ynum1I,Q_isR,Q_isI),
            ynum2I = PhaseMatch.caddI(ynum1R,ynum1I,Q_isR,Q_isI),
            // (sq(COS_THETAi))*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ )
            ynum3R = PhaseMatch.caddR(sq(COS_THETAs)*Q_ipR, sq(COS_THETAs)*Q_ipI, Q_isR, Q_isI),
            ynum3I = PhaseMatch.caddI(sq(COS_THETAs)*Q_ipR, sq(COS_THETAs)*Q_ipI, Q_isR, Q_isI),
            ynum4R = PhaseMatch.caddR(ynum3R, ynum3I, sq(COS_THETAi)*Q_spR, sq(COS_THETAi)*Q_spI),
            ynum4I = PhaseMatch.caddI(ynum3R, ynum3I, sq(COS_THETAi)*Q_spR, sq(COS_THETAi)*Q_spI),
            // (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ ));
            ynumR = PhaseMatch.cmultiplyR(ynum2R,ynum2I,ynum4R,ynum4I),
            ynumI = PhaseMatch.cmultiplyI(ynum2R,ynum2I,ynum4R,ynum4I);


        // // yconst denominator
        // // yconst2 = Wi_SQ*Wp_SQ*Ws_SQ*((sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs))*Wp_SQ*Ws_SQ + Wi_SQ* (( sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ));
        var c1 = (sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)),
            yden1R = PhaseMatch.caddR(c1*Q_ipR, c1*Q_ipI, Q_isR, Q_isI),
            yden1I = PhaseMatch.caddI(c1*Q_ipR, c1*Q_ipI, Q_isR, Q_isI),
            c2 = (sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs)),
            yden2R = PhaseMatch.caddR(c2*Q_spR, c2*Q_spI, yden1R, yden1I),
            yden2I = PhaseMatch.caddI(c2*Q_spR, c2*Q_spI, yden1R, yden1I),
            ydenR = PhaseMatch.cmultiplyR(Q_ispR,Q_ispI, yden2R, yden2I),
            ydenI = PhaseMatch.cmultiplyI(Q_ispR,Q_ispI, yden2R, yden2I);

        // yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);
        var yconstd1R = PhaseMatch.cdivideR(ynumR, ynumI, ydenR, ydenI),
            yconstd1I = PhaseMatch.cdivideI(ynumR, ynumI, ydenR, ydenI),
            yconstd2R = PhaseMatch.csqrtR(yconstd1R, yconstd1I),
            yconstd2I = PhaseMatch.csqrtI(yconstd1R, yconstd1I),
            yconstR = PhaseMatch.cdivideR(Math.sqrt(2*Math.PI), 0, yconstd2R, yconstd2I),
            yconstI = PhaseMatch.cdivideI(Math.sqrt(2*Math.PI), 0, yconstd2R, yconstd2I);


        var coeffaR = PhaseMatch.cmultiplyR(gaussR, gaussI, xconstR, xconstI),
            coeffaI = PhaseMatch.cmultiplyI(gaussR, gaussI, xconstR, xconstI),
            coeffR = PhaseMatch.cmultiplyR(coeffaR, coeffaI, yconstR, yconstI),
            coeffI = PhaseMatch.cmultiplyI(coeffaR, coeffaI, yconstR, yconstI);


        // // Next the constant that remains after analytically integrating over y
        // yconst1 = (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi))*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ );
        // yconst2 = Wi_SQ*Wp_SQ*Ws_SQ*((sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs))*Wp_SQ*Ws_SQ + Wi_SQ* (( sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ));
        // yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);

        // // Normalization from the Gaussian terms in the integral.
        // gaussnorm = (1/Math.sqrt(pi2 * Ws_SQ)) * (1/Math.sqrt(pi2 * Wi_SQ)) * (1/Math.sqrt(pi2 * Wp_SQ));

        return [AR, AI, BR, BI, CR, CI, coeffR, coeffI];
            // return [1,0, BR, BI, CR, CI];

    };

    ///////////////////////////////////////////
    var zintfunc = function(z){
        // var pmzcoeff = Math.exp(-sq(z)*C - 1/2*sq(z/bw));
        // var real = pmzcoeff*Math.cos(B*z);
        // var imag = pmzcoeff*Math.sin(B*z);
        // Set up waist values

        var terms = calczterms(z);

        var AR = terms[0],
            AI = terms[1],
            BR = terms[2],
            BI = terms[3],
            CR = terms[4],
            CI = terms[5],
            coeffR = terms[6],
            coeffI = terms[7];

        var pmzcoeff = Math.exp(- 1/2*sq(z/bw)); // apodization
        pmzcoeff = pmzcoeff * Math.exp(-sq(z)*CR -z*BI - AR);
        var realE = pmzcoeff*Math.cos(-sq(z)*CI +z*BR - AI);
        var imagE = pmzcoeff*Math.sin(-sq(z)*CI +z*BR - AI);

        var real = PhaseMatch.cmultiplyR(realE, imagE, coeffR,coeffI);
        var imag = PhaseMatch.cmultiplyI(realE, imagE, coeffR,coeffI);


        return [real,imag];
    };

    var PMt;
    if (P.calcfibercoupling){
        var dz = P.L/P.numzint;
        var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-P.L/2, P.L/2,dz,P.numzint,P.zweights);
        PMz_real = pmintz[0]/P.L;
        PMz_imag = pmintz[1]/P.L;
        PMt = 1;
    }
    else{
        var PMzNorm1 = Math.sin(arg)/arg;
        // var PMz_real =  PMzNorm1 * Math.cos(arg);
        // var PMz_imag = PMzNorm1 * Math.sin(arg);
        PMz_real =  PMzNorm1 ;
        PMz_imag = 0;
        PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
    }
    // var PMz_real = PhaseMatch.Nintegrate(zintReal,-P.L/2, P.L/2,numz)/P.L;
    // var PMz_imag = PhaseMatch.Nintegrate(zintImag,-P.L/2, P.L/2,numz)/P.L;

    // console.log(zintReal(0), bw);
    // console.log(PMz_real, PMz_imag);


    if (P.use_guassian_approx){
        // console.log('approx');
        PMz_real = Math.exp(-0.193*sq(arg));
        PMz_imag = 0;
    }


    // Phasematching along transverse directions
    // var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
    // console.log(A);
    // var PMt = Math.exp(-A);
    // var PMt = 1;
    // var PMt = Math.exp(-A) * xconst * yconst *gaussnorm;
    return [PMz_real, PMz_imag, PMt];
};

/*
 * pump_spectrum
 * Returns the pump mode
 */
PhaseMatch.pump_spectrum = function pump_spectrum (P){
    var con = PhaseMatch.constants;
    // PhaseMatch.convertToMicrons(P);
    var mu = 1;
    con.c = con.c * mu;
    // @TODO: Need to move the pump bandwidth to someplace that is cached.
    var p_bw = 2*Math.PI*con.c/sq(P.lambda_p) *P.p_bw; //* n_p; //convert from wavelength to w
    p_bw = p_bw /(2 * Math.sqrt(Math.log(2))); //convert from FWHM
    var alpha = Math.exp(-1/2*sq(2*Math.PI*con.c*( ( 1/P.lambda_s + 1/P.lambda_i - 1/P.lambda_p) )/(p_bw)));
    // PhaseMatch.convertToMeters(P);
    return alpha;
};


/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch = function phasematch (P){

    // var pm = PhaseMatch.calc_PM_tz(P);
    // var pm = PhaseMatch.calc_PM_tz_k_singles(P);
    // var todeg = 180/Math.PI;
    // console.log("Inside phasematch:  Theta_s: " + (P.theta_s*todeg).toString() + ", Theta_i: " + (P.theta_i*todeg).toString() );
    var pm = PhaseMatch.calc_PM_tz_k_coinc(P);
    // Longitundinal components of PM.
    var PMz_real = pm[0];
    var PMz_imag = pm[1];
    // Transverse component of PM
    var PMt = pm[2];

    var C_check = pm[3];
    // console.log(C_check);
    // if (C_check>0.5){
    //     console.log("approx not valid," C_check);
    // }
    // Pump spectrum
    var alpha = PhaseMatch.pump_spectrum(P);
    // var alpha = 1;

    //return the real and imaginary parts of Phase matching function
    return [alpha*PMt* PMz_real, alpha*PMt* PMz_imag, C_check];
};

/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch_coinc = function phasematch_coinc (P){

    var pm = PhaseMatch.calc_PM_tz_k_coinc(P);
    // Longitundinal components of PM.
    var PMz_real = pm[0];
    var PMz_imag = pm[1];
    // Transverse component of PM
    var PMt = pm[2];

    var C_check = pm[3];

    // Pump spectrum
    var alpha = PhaseMatch.pump_spectrum(P);
    // var alpha = 1;

    //return the real and imaginary parts of Phase matching function
    return [alpha*PMt* PMz_real, alpha*PMt* PMz_imag, C_check];
};

/*
 * phasematch_singles()
 * Gets the index of refraction depending on phasematching type for the singles
 * Rate for the signal photon.
 * P is SPDC Properties object
 */
PhaseMatch.phasematch_singles = function phasematch_singles(P){

    var pm = PhaseMatch.calc_PM_tz_k_singles(P);
    // Longitundinal components of PM.
    var PMz_real = pm[0];
    var PMz_imag = pm[1];
    // Transverse component of PM
    var PMt = pm[2];

    var C_check = pm[3];
    // console.log(C_check);
    // if (C_check>0.5){
    //     console.log("approx not valid," C_check);
    // }
    // Pump spectrum
    var alpha = PhaseMatch.pump_spectrum(P);
    alpha = sq(alpha);
    // var alpha = 1;

    //return the real and imaginary parts of Phase matching function
    return [alpha*PMt* PMz_real, alpha*PMt* PMz_imag, C_check];
};

/*
 * phasematch_Int_Phase()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch_Int_Phase = function phasematch_Int_Phase(P){

    // PM is a complex array. First element is real part, second element is imaginary.
    var PM = PhaseMatch.phasematch(P);

    var C_check = PM[2];

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
        PM= PMang*180/Math.PI;
    } else {
        // console.log  ("calculating Intensity")
        PM = sq(PM[0]) + sq(PM[1]);
    }
    // console.log(PM)
    return {"phasematch":PM};
};

/*
 * phasematch_Int_Phase()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch_Int_Phase_Singles = function phasematch_Int_Phase_Singles(P){

    // PM is a complex array. First element is real part, second element is imaginary.
    var PM = PhaseMatch.phasematch_singles(P);

    var C_check = PM[2];

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
        PM= PMang*180/Math.PI;
    } else {
        // console.log  ("calculating Intensity")
        PM = sq(PM[0]) + sq(PM[1]);
    }
    // console.log(PM)
    return {"phasematch":PM};
};

/*
 * calc_HOM_JSA()
 * Calculates the Joint Spectra Amplitude of the HOM at a particluar time delay
 * P is SPDC Properties object
 * ls_start ... li_stop are the signal/idler wavelength ranges to calculate over
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_rate = function calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT, JSA, dim){
    var con = PhaseMatch.constants;

    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

    var rate = 0;

    var PM_JSA1_real = JSA['PM_JSA1_real'];
    var PM_JSA1_imag = JSA['PM_JSA1_imag'];
    var PM_JSA2_real = JSA['PM_JSA2_real'];
    var PM_JSA2_imag = JSA['PM_JSA2_imag'];

    var N = dim*dim;
    var JSI = new Float64Array(N);

    for (var i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        var ARG = 2*Math.PI*con.c *(1/lambda_s[index_s] - 1/lambda_i[index_i])*delT;
        var Tosc_real = Math.cos(ARG);
        var Tosc_imag = Math.sin(ARG);

        var arg2_real = Tosc_real*PM_JSA2_real[index_s][index_i] - Tosc_imag*PM_JSA2_imag[index_s][index_i];
        // rate = arg2_real;
        var arg2_imag = Tosc_real*PM_JSA2_imag[index_s][index_i] + Tosc_imag*PM_JSA2_real[index_s][index_i];

        var PM_real = (PM_JSA1_real[index_s][index_i] - arg2_real)/2;///Math.sqrt(2);
        var PM_imag = (PM_JSA1_imag[index_s][index_i] - arg2_imag)/2; //Math.sqrt(2);

        var val= sq(PM_real) + sq(PM_imag);
        JSI[i] = val;
        rate +=val;
    }

    return {"rate":rate, "JSI":JSI};
};


/*
 * calc_HOM_bunch_JSA()
 * Calculates the Joint Spectra Amplitude of the HOM at a particluar time delay
 * P is SPDC Properties object
 * ls_start ... li_stop are the signal/idler wavelength ranges to calculate over
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_bunch_rate = function calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT, JSA, dim){
    var con = PhaseMatch.constants;

    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

    var rate = 0;

    var PM_JSA1_real = JSA['PM_JSA1_real'];
    var PM_JSA1_imag = JSA['PM_JSA1_imag'];
    var PM_JSA2_real = JSA['PM_JSA2_real'];
    var PM_JSA2_imag = JSA['PM_JSA2_imag'];

    var N = dim*dim;
    var JSI = new Float64Array(N);

    for (var i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        var ARG = 2*Math.PI*con.c *(1/lambda_s[index_s] - 1/lambda_i[index_i])*delT;
        var Tosc_real = Math.cos(ARG);
        var Tosc_imag = Math.sin(ARG);

        var arg2_real = Tosc_real*PM_JSA2_real[index_s][index_i] - Tosc_imag*PM_JSA2_imag[index_s][index_i];
        // rate = arg2_real;
        var arg2_imag = Tosc_real*PM_JSA2_imag[index_s][index_i] + Tosc_imag*PM_JSA2_real[index_s][index_i];

        var PM_real = (PM_JSA1_real[index_s][index_i] + arg2_real)/2;///Math.sqrt(2);
        var PM_imag = (PM_JSA1_imag[index_s][index_i] + arg2_imag)/2; //Math.sqrt(2);

        var val= sq(PM_real) + sq(PM_imag);
        JSI[i] = val;
        rate +=val;
    }

    return {"rate":rate, "JSI":JSI};
};
/*
 * calc_HOM_scan()
 * Calculates the HOM probability of coincidences over range of times.
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_scan = function calc_HOM_scan(P, t_start, t_stop, ls_start, ls_stop, li_start, li_stop, dim, dip){
    // console.log(dip);
    // dip = dip || true;
    // console.log(dip);


    var npts = 100;  //number of points to pass to the calc_HOM_JSA

    var delT = PhaseMatch.linspace(t_start, t_stop, dim);

    var HOM_values = PhaseMatch.linspace(t_start, t_stop, dim);
    var PM_JSA1 = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts);
    var PM_JSA2 = PhaseMatch.calc_JSA(P, li_start, li_stop, ls_start, ls_stop, npts);

    var PM_JSA1_real = PhaseMatch.create_2d_array(PM_JSA1[0], npts,npts);
    var PM_JSA1_imag = PhaseMatch.create_2d_array(PM_JSA1[1], npts,npts);
    var PM_JSA2_real = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[0],npts), npts,npts);
    var PM_JSA2_imag = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[1],npts), npts,npts);

    var JSA = {
        'PM_JSA1_real': PM_JSA1_real
        ,'PM_JSA1_imag': PM_JSA1_imag
        ,'PM_JSA2_real': PM_JSA2_real
        ,'PM_JSA2_imag': PM_JSA2_imag
        };

    var PM_JSI = PhaseMatch.calc_JSI(P, ls_start, ls_stop, li_start, li_stop, npts);

    // Calculate normalization
    var N = PhaseMatch.Sum(PM_JSI),
        rate;

    for (var i=0; i<dim; i++){
        if (dip){
            rate = PhaseMatch.calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
        }
        else {
            rate = PhaseMatch.calc_HOM_bunch_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
        }

        HOM_values[i] = (rate["rate"])/N;
    }
    return HOM_values;

};


/*
 * calc_HOM_scan()
 * Calculates the HOM probability of coincidences over range of times.
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_scan_p = function calc_HOM_scan(P, delT, ls_start, ls_stop, li_start, li_stop, npts, dip){
    // console.log(dip);
    // dip = dip || true;
    // console.log(dip);


    // var npts = 50;  //number of points to pass to the calc_HOM_JSA
    var dim = delT.length;

    // var delT = PhaseMatch.linspace(t_start, t_stop, dim);

    var HOM_values = new Float64Array(dim);
    var PM_JSA1 = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts);
    var PM_JSA2 = PhaseMatch.calc_JSA(P, li_start, li_stop, ls_start, ls_stop, npts);

    var PM_JSA1_real = PhaseMatch.create_2d_array(PM_JSA1[0], npts,npts);
    var PM_JSA1_imag = PhaseMatch.create_2d_array(PM_JSA1[1], npts,npts);
    var PM_JSA2_real = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[0],npts), npts,npts);
    var PM_JSA2_imag = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[1],npts), npts,npts);

    var JSA = {
        'PM_JSA1_real': PM_JSA1_real
        ,'PM_JSA1_imag': PM_JSA1_imag
        ,'PM_JSA2_real': PM_JSA2_real
        ,'PM_JSA2_imag': PM_JSA2_imag
        };

    var PM_JSI = PhaseMatch.calc_JSI(P, ls_start, ls_stop, li_start, li_stop, npts);

    // Calculate normalization
    var N = PhaseMatch.Sum(PM_JSI),
        rate;

    for (var i=0; i<dim; i++){
        if (dip){
            rate = PhaseMatch.calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
        }
        else {
            rate = PhaseMatch.calc_HOM_bunch_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
        }

        HOM_values[i] = (rate["rate"])/N;
    }
    return HOM_values;

};

/*
 * calc_HOM_JSA()
 * Calculates the Joint Spectra Amplitude of the HOM at a particluar time delay
 * P is SPDC Properties object
 * ls_start ... li_stop are the signal/idler wavelength ranges to calculate over
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_HOM_JSA = function calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT, dim, dip){
    var PM_JSA1 = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, dim);
    var PM_JSA2 = PhaseMatch.calc_JSA(P, li_start, li_stop, ls_start, ls_stop, dim);

    var PM_JSA1_real = PhaseMatch.create_2d_array(PM_JSA1[0], dim,dim);
    var PM_JSA1_imag = PhaseMatch.create_2d_array(PM_JSA1[1], dim,dim);
    var PM_JSA2_real = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[0],dim), dim,dim);
    var PM_JSA2_imag = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[1],dim), dim,dim);

    var JSA = {
        'PM_JSA1_real': PM_JSA1_real
        ,'PM_JSA1_imag': PM_JSA1_imag
        ,'PM_JSA2_real': PM_JSA2_real
        ,'PM_JSA2_imag': PM_JSA2_imag
        };

    var JSI;

    if (dip){
        JSI = PhaseMatch.calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT, JSA, dim);
    }
    else {
        JSI = PhaseMatch.calc_HOM_bunch_rate(ls_start, ls_stop, li_start, li_stop, delT, JSA, dim);
    }

    return JSI["JSI"];
};


/*
 * calc_2HOM_rate()
 * Calculates the coincidence rate for two source HOM at a given time value
 * P is SPDC Properties object
 * PM_JSA is the joint spectral amplitude:
 */
PhaseMatch.calc_2HOM_rate = function calc_HOM_rate(delT, ls_start, ls_stop, li_start, li_stop, PM_JSA_real, PM_JSA_imag, dim){
    var con = PhaseMatch.constants;

    var lambda_s = PhaseMatch.linspace(ls_start,ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_start,li_stop, dim);
    var rate_ss = 0;
    var rate_ii = 0;
    var rate_si = 0;

    // var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], dim, dim);
    // var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], dim, dim);

    // Now create the ws, wi arrays for the two crystals. Because the crystals are identical, we can get away with
    // using just one array for both ws and wi.

    // loop over ws1
    for (var j=0; j<dim; j++){

        // loop over wi1
        for (var k=0; k<dim; k++){
            var A_real = PM_JSA_real[j][k];
            var A_imag = PM_JSA_imag[j][k];

            // loop over ws2
            for (var l=0; l<dim; l++){
                var C_real = PM_JSA_real[l][k];
                var C_imag = PM_JSA_imag[l][k];

                // loop over wi2
                for (var m=0; m<dim; m++){

                    // for the signal signal phase
                    var ARG_ss = 2*Math.PI*con.c *(1/lambda_s[j] - 1/lambda_i[l])*delT;
                    var Phase_ss_real = Math.cos(ARG_ss);
                    var Phase_ss_imag = Math.sin(ARG_ss);

                    // for the idler idler phase
                    var ARG_ii = 2*Math.PI*con.c *(1/lambda_s[k] - 1/lambda_i[m])*delT;
                    var Phase_ii_real = Math.cos(ARG_ii);
                    var Phase_ii_imag = Math.sin(ARG_ii);

                    // for the signal/idler phase
                    var ARG_si = 2*Math.PI*con.c *(1/lambda_s[j] - 1/lambda_i[m])*delT;
                    var Phase_si_real = Math.cos(ARG_si);
                    var Phase_si_imag = Math.sin(ARG_si);

                    var B_real = PM_JSA_real[l][m];
                    var B_imag = PM_JSA_imag[l][m];

                    var D_real = PM_JSA_real[j][m];
                    var D_imag = PM_JSA_imag[j][m];

                    var Arg1_real = A_real*B_real - A_imag*B_imag;
                    var Arg1_imag = A_real*B_imag + A_imag*B_real; //minus here b/c of complex conjugate

                    var Arg2_real = C_real*D_real - C_imag*D_imag;
                    var Arg2_imag = C_real*D_imag + C_imag*D_real; //minus here b/c of complex conjugate

                    var Intf_ss_real = (Arg1_real - (Phase_ss_real * Arg2_real - Phase_ss_imag*Arg2_imag))/2;
                    var Intf_ss_imag = (Arg1_imag - (Phase_ss_real * Arg2_imag + Phase_ss_imag * Arg2_real))/2;

                    var Intf_ii_real = (Arg1_real - (Phase_ii_real * Arg2_real - Phase_ii_imag*Arg2_imag))/2;
                    var Intf_ii_imag = (Arg1_imag - (Phase_ii_real * Arg2_imag + Phase_ii_imag * Arg2_real))/2;

                    var Intf_si_real = (Arg1_real - (Phase_si_real * Arg2_real - Phase_si_imag*Arg2_imag))/2;
                    var Intf_si_imag = (Arg1_imag - (Phase_si_real * Arg2_imag + Phase_si_imag * Arg2_real))/2;

                    rate_ss += sq(Intf_ss_real) + sq(Intf_ss_imag);
                    rate_ii += sq(Intf_ii_real) + sq(Intf_ii_imag);
                    rate_si += sq(Intf_si_real) + sq(Intf_si_imag);
                    // rate += HOM_real;

                }
            }
        }
    }
    return {"ii":rate_ss, "ss":rate_ii, "si":rate_si};
};

/*
 * calc_2HOM_norm()
 * Calculates the normalization value
 * P is SPDC Properties object
 */
PhaseMatch.calc_2HOM_norm = function calc_HOM_norm(PM_JSA_real, PM_JSA_imag, dim){
    var rate = 0;

    // var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], dim, dim);
    // var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], dim, dim);

    // Now create the ws, wi arrays for the two crystals. Because the crystals are identical, we can get away with
    // using just one array for both ws and wi.
    // loop over ws1
    for (var j=0; j<dim; j++){

        // loop over wi1
        for (var k=0; k<dim; k++){
            var A_real = PM_JSA_real[j][k];
            var A_imag = PM_JSA_imag[j][k];

            // loop over ws2
            for (var l=0; l<dim; l++){
                // var C_real = PM_JSA_real[l][k];
                // var C_imag = PM_JSA_imag[l][k];

                // loop over wi2
                for (var m=0; m<dim; m++){

                    var B_real = PM_JSA_real[l][m];
                    var B_imag = PM_JSA_imag[l][m];

                    var Arg1_real = A_real*B_real - A_imag*B_imag;
                    var Arg1_imag = A_real*B_imag + A_imag*B_real;

                    rate += sq(Arg1_real) + sq(Arg1_imag);

                }
            }
        }
    }
    return rate;
};

/*
 * calc_2HOM_scan()
 * Calculates the HOM probability of coincidences over range of times for two identical sources.
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_2HOM_scan = function calc_HOM_scan(P, t_start, t_stop, ls_start, ls_stop, li_start, li_stop, dim){

    var npts = 30;  //number of points to pass to calc_JSA()
    // dim = 20;
    var delT = PhaseMatch.linspace(t_start, t_stop, dim);

    var HOM_values_ss =new Float64Array(dim);
    var HOM_values_ii =new Float64Array(dim);
    var HOM_values_si =new Float64Array(dim);

    var PM_JSA = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts); // Returns the complex JSA

    var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], npts, npts);
    var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], npts, npts);

    // Calculate normalization
    var N = PhaseMatch.calc_2HOM_norm(PM_JSA_real, PM_JSA_imag, npts);
    // var N = 1;

    for (var i=0; i<dim; i++){
        // PM_JSA = PhaseMatch.calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT[i], npts);
        // var total = PhaseMatch.Sum(PM_JSA)/N;
        var rates = PhaseMatch.calc_2HOM_rate(delT[i], ls_start, ls_stop, li_start, li_stop, PM_JSA_real, PM_JSA_imag, npts);
        HOM_values_ss[i] = rates["ss"]/N;
        HOM_values_ii[i] = rates["ii"]/N;
        HOM_values_si[i] = rates["si"]/N;
    }

    return {"ss":HOM_values_ss, "ii":HOM_values_ii, "si":HOM_values_si};

};

/*
 * calc_2HOM_scan()
 * Calculates the HOM probability of coincidences over range of times for two identical sources.
 * P is SPDC Properties object
 * delT is the time delay between signal and idler
 */
PhaseMatch.calc_2HOM_scan_p = function calc_HOM_scan(P, delT, ls_start, ls_stop, li_start, li_stop, dim){

    var npts = 30;  //number of points to pass to calc_JSA()
    // dim = 20;
    // var delT = PhaseMatch.linspace(t_start, t_stop, dim);
    dim = delT.length;

    var HOM_values_ss =new Float64Array(dim);
    var HOM_values_ii =new Float64Array(dim);
    var HOM_values_si =new Float64Array(dim);

    var PM_JSA = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts); // Returns the complex JSA

    var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], npts, npts);
    var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], npts, npts);

    // Calculate normalization
    var N = PhaseMatch.calc_2HOM_norm(PM_JSA_real, PM_JSA_imag, npts);
    // var N = 1;

    for (var i=0; i<dim; i++){
        // PM_JSA = PhaseMatch.calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT[i], npts);
        // var total = PhaseMatch.Sum(PM_JSA)/N;
        var rates = PhaseMatch.calc_2HOM_rate(delT[i], ls_start, ls_stop, li_start, li_stop, PM_JSA_real, PM_JSA_imag, npts);
        HOM_values_ss[i] = rates["ss"]/N;
        HOM_values_ii[i] = rates["ii"]/N;
        HOM_values_si[i] = rates["si"]/N;
    }

    // return {"ss":HOM_values_ss, "ii":HOM_values_ii, "si":HOM_values_si};
    return [HOM_values_ss, HOM_values_ii,HOM_values_si];

};

/*
 * calc_Schmidt
 * Calculates the Schmidt number for a 2D matrix
 * NOTE: The SVD routine has problems with odd dimensions
 */
PhaseMatch.calc_Schmidt = function calc_Schmidt(PM){
    // var PM2D = PhaseMatch.create2Darray(PM, dim,dim);

    var l = PM.length;
    var PMsqrt = new Array(l),
        j,
        i;

    for (i = 0; i<l; i++){
        PMsqrt[i]= new Array(l);
        for (j = 0; j<l; j++){
            PMsqrt[i][j] = Math.sqrt(PM[i][j]);
        }

    }
    // console.log(PMsqrt);

    var svd = PhaseMatch.svdcmp(PMsqrt);
    // @TODO: add in logic to test if the SVD converged. It will return false if it did not.
    var D = svd.W;
    // console.log("D", D);
    l = D.length;
    //do the Normalization
    var Norm = 0;
    for (j=0; j<l; j++){
        Norm += sq(D[j]);
    }

    // var Norm = PhaseMatch.Sum(D); // Normalization
    // console.log("normalization", Norm);

    var Kinv = 0;
    for (i = 0; i<l; i++){
        Kinv += sq(sq(D[i])/Norm); //calculate the inverse of the Schmidt number
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
    var P = props.clone();
    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    //eliminates sinc side lobes which cause problems.
    P.use_guassian_approx = true;

    var PMmax = PhaseMatch.phasematch_Int_Phase(P);
    // console.log("PMax : ",Math.sqrt(PMmax['phasematch']));
    // threshold = PMmax*threshold*20;
    // threshold = threshold;
    //


    threshold = threshold*PMmax['phasematch'];
    // console.log(th)

    var lambda_limit = function(lambda_s){
        P.lambda_s = lambda_s;
        P.n_s = P.calc_Index_PMType(lambda_s, P.type, P.S_s, "signal");
        P.lambda_i = 1/(1/P.lambda_p - 1/lambda_s);
        P.optimum_idler(P);

        var PM = PhaseMatch.phasematch_Int_Phase(P);
        // console.log(P.lambda_p/1e-9, P.lambda_s/1e-9, P.lambda_i/1e-9, PM)
        return Math.abs(PM["phasematch"] - threshold);
    };

    var guess = P.lambda_s - 1e-9;
    var ans = PhaseMatch.nelderMead(lambda_limit, guess, 50);
    var ans2 = 1/(1/props.lambda_p - 1/ans);

    var l1 = Math.min(ans, ans2);
    var l2 = Math.max(ans, ans2);
    // console.log(l1/1e-9, l2/1e-9);

    var dif = Math.abs(ans-props.lambda_s);
    // console.log(PMmax,threshold,ans/1e-9, ans2/1e-9, P.lambda_s/1e-9, dif/1e-9);

    //Now try to find sensible limits. We want to make sure the range of values isn't too big,
    //but also ensure that if the pump bandwidth is small, that the resulting JSA is visible.
    //This is important for calculating things like the Hong-Ou-Mandel.
    var difmax = 2e-9 * P.lambda_p/775e-9 * P.p_bw/1e-9 ;

    // console.log("diff = ", dif/1e-9, difmax/1e-9);

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
    // var P = props.clone();
    var con = PhaseMatch.constants;

    var gv_s = props.get_group_velocity(props.lambda_s, props.type, props.S_s, "signal");
    var gv_i = props.get_group_velocity(props.lambda_i, props.type, props.S_i, "idler");

    // var zero_delay = props.L * (1/gv_i - 1/gv_s)/2;
    var zero_delay = 0;
    // console.log("minimum of HOM dip = ", zero_delay/1e-15);

    var bw = Math.abs(lambda_stop - lambda_start);
    var coh_time = 1/ (2*Math.PI*con.c / sq(lambda_start + bw/2) * bw);

    var t_start = zero_delay - 40*coh_time;
    var t_stop = zero_delay + 40*coh_time;

    return [zero_delay, t_start, t_stop];

};

PhaseMatch.autorange_delT_2crystal = function autorange_delT_2crystal(props, lambda_start, lambda_stop){
    // var P = props.clone();
    var con = PhaseMatch.constants;

    var gv_s = props.get_group_velocity(props.lambda_s, props.type, props.S_s, "signal");
    var gv_i = props.get_group_velocity(props.lambda_i, props.type, props.S_i, "idler");

    // var zero_delay = props.L * (1/gv_i - 1/gv_s)/2;
    var zero_delay = 0;
    // console.log("minimum of HOM dip = ", zero_delay/1e-15);

    var bw = Math.abs(lambda_stop - lambda_start);
    var coh_time = 1/ (2*Math.PI*con.c / sq(lambda_start + bw/2) * bw);

    var t_start = zero_delay - 40*coh_time;
    var t_stop = zero_delay + 40*coh_time;

    return [zero_delay, t_start, t_stop];

};

PhaseMatch.autorange_theta = function autorange_theta(props){
    var P = props.clone();
    P.update_all_angles();
    var offset = 2* Math.PI/180;
    var dif = (P.theta_s - P.theta_s*0.3);
    var theta_start =dif*(1-(1e-6/P.W));
    theta_start = Math.max(0, theta_start);
    // var theta_end = P.theta_s + P.theta_s*0.4;
    var theta_end = P.theta_s + (P.theta_s - theta_start);
    theta_end = Math.max(2*Math.PI/180, theta_end);
    // console.log("Before", theta_start*180/Math.PI, theta_end*180/Math.PI);
    P.theta_s = theta_start;
    P.update_all_angles();
    theta_start = PhaseMatch.find_external_angle(P,"signal");

    P.theta_s = theta_end;
    P.update_all_angles();
    theta_end = PhaseMatch.find_external_angle(P,"signal");
    // console.log("after", theta_start*180/Math.PI, theta_end*180/Math.PI);

    // console.log("optimal theta", theta_start*180/Math.PI, theta_end*theta_start*180/Math.PI);

    return [theta_start, theta_end];
};


PhaseMatch.autorange_poling_period = function autorange_poling_period(props){
    var P = props.clone();
    P.theta = Math.PI/2; //set the angle to 0
    P.update_all_angles();
    P.calc_poling_period();
    var diff = 50e-6;
    var poling_start = P.poling_period - diff;
    var poling_end = P.poling_period +diff;

    if (poling_start<0){poling_start = 1e-6;}

    return [poling_start, poling_end];
};


PhaseMatch.find_internal_angle = function find_internal_angle (props, photon){
    var P = props.clone(),
        snell_external,
        guess,
        min_snells_law;

    if (photon === 'signal'){
        snell_external = (Math.sin(props.theta_s_e));

        min_snells_law = function(theta_internal){
            if (theta_internal>Math.PI/2 || theta_internal<0){return 1e12;}
            P.theta_s = theta_internal;

            P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

            return Math.abs(snell_external - P.n_s*Math.sin(P.theta_s));
        };

        //Initial guess
        guess = props.theta_s;
        // guess = 16*Math.PI/180;
    }
    if (photon === 'idler'){
        // var offset = 0.45/180*Math.PI;
        // props.theta_i_e = props.theta_i_e + offset;

        snell_external = (Math.sin(props.theta_i_e));

        min_snells_law = function(theta_internal){
            if (theta_internal>Math.PI/2 || theta_internal<0){return 1e12;}
            P.theta_i = theta_internal;

            P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

            return Math.abs(snell_external - P.n_i*Math.sin(P.theta_i));
        };

        //Initial guess
        guess = props.theta_i;
        // guess = 45*Math.PI/180;
    }
    var ans = PhaseMatch.nelderMead(min_snells_law, guess, 40);
    // console.log("Internal angle is: ", ans*180/Math.PI, props.theta_s*180/Math.PI );
    return ans;
};

PhaseMatch.find_external_angle = function find_external_angle (props, photon){
    var theta_external = 0,
        arg;

    if (photon === 'signal'){
        arg = (props.n_s * Math.sin(props.theta_s));
        theta_external = Math.asin(arg);
    }
    if (photon === 'idler'){
        arg = (props.n_i * Math.sin(props.theta_i));
        theta_external = Math.asin(arg);

    }

    // console.log("External angle is: ", theta_external*180/Math.PI, props.theta_s*180/Math.PI );
    return theta_external;


};

PhaseMatch.swap_signal_idler = function swap_signal_idler(P){
            // Swap role of signal and idler. Useful for calculating Idler properties
            var  tempLambda = P.lambda_s
                ,tempTheta = P.theta_s
                ,tempPhis = P.phi_s
                ,tempNs = P.n_s
                ,tempSs = P.S_s
                ,tempW_sx = P.W_sx
                ,tempW_sy = P.W_sy
                ,tempTheta_se = P.theta_s_e
                ;

            // Swap signal with Idler
            P.lambda_s = P.lambda_i;
            P.theta_s = P.theta_i;
            P.phi_s = P.phi_i;
            P.n_s = P.n_i;
            P.S_s = P.S_i;
            P.W_sx = P.W_ix;
            P.W_sy = P.W_iy;
            P.theta_s_e = PhaseMatch.find_external_angle(P, "signal");

            // Now replace Idler values with Signal values
            P.lambda_i = tempLambda;
            P.theta_i = tempTheta;
            P.phi_i = tempPhis;
            P.n_i = tempNs;
            P.S_i = tempSs;
            P.W_ix = tempW_sx;
            P.W_iy = tempW_sy;
            // P.theta_i_e = tempTheta_se;

            P.update_all_angles();
            return P;
};

/*
 * Get the constants and terms used in the calculation of the momentum
 * space joint spectrum for the coincidences.
 */
PhaseMatch.calc_PM_tz_k_coinc = function calc_PM_tz_k_coinc (P){
    // console.log("hi");
    // console.log("\n");
    // var todeg = 180/Math.PI;
    // console.log("Inside calc_PM_tz_k_coinc:  Theta_s: " + (P.theta_s*todeg).toString() + ", Theta_i: " + (P.theta_i*todeg).toString() );
    var toMicrons= 1;
    // var toMicrons= 1;
    var con = PhaseMatch.constants;
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;

    var twoPI = 2*Math.PI,
        twoPIc = twoPI*con.c*toMicrons
        ;

    var  z0 = P.z0p //put pump in middle of the crystal
        ,z0s = P.z0s //-P.L/(2*Math.cos(P.theta_s_e))
        ,z0i = P.z0i //-P.L/(2*Math.cos(P.theta_i_e))
        ;

    // Get the pump index corresponding to the crystal phasematching function
    // to calculate the K vector mismatch
    P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

    // P.calc_walkoff_angles();
    var RHOpx = P.walkoff_p; //pump walkoff angle.
    // var RHOpx  = 0;


    PhaseMatch.convertToMicrons(P);

    var omega_s = twoPIc / (P.lambda_s ),
        omega_i = twoPIc / (P.lambda_i),
        omega_p = omega_s + omega_i
        // omega_p = twoPIc / P.lambda_p
        ;

    // console.log("frequencies2:" + (P.lambda_p*1E9).toString() + ", " + (omega_p/twoPI*1E-9).toString() + ", " + (omega_s*1E-9).toString() + ", " + (omega_i*1E-9).toString() + ", ")
    // PhaseMatch.convertToMicrons(P);

    var delK = PhaseMatch.calc_delK(P);
    var delKx = delK[0],
        delKy = delK[1],
        delKz = delK[2]
        ;


    // console.log("deltaK:" + delKx.toString() + ", " + delKy.toString() + ", " + delKz.toString() + ", ")
    var toDeg = 180/Math.PI;
    // console.log("angles in calc:", P.theta_s*toDeg, P.theta_s_e*toDeg, P.phi_s*toDeg);
    // Height of the collected spots from the axis.
    var hs = Math.tan(P.theta_s)*P.L*0.5 *Math.cos(P.phi_s),
        hi = Math.tan(P.theta_i)*P.L*0.5 * Math.cos(P.phi_i);


    var PMz_real = 0;
    var PMz_imag = 0;

    // var convfromFWHM = 1*Math.sqrt(2); // Use 1/e^2 in intensity.
    var convfromFWHM = 1; // Use 1/e^2 in intensity.


    // var W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s))),
    //     W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));


    // Setup constants
    var Wp_SQ = sq(P.W * convfromFWHM), // convert from FWHM to sigma
        Ws_SQ = sq(P.W_sx  * convfromFWHM), // convert from FWHM to sigma
        Wi_SQ = sq(P.W_sx  * convfromFWHM) // convert from FWHM to sigma @TODO: Change to P.W_i
        // Ws_SQ = sq(W_s * convfromFWHM), // convert from FWHM to sigma
        // Wi_SQ = sq(W_i * convfromFWHM) // convert from FWHM to sigma @TODO: Change to P.W_i
        ;

    // Is this the k vector along the direction of propagation?
    var k_p = twoPI*P.n_p / P.lambda_p,
        k_s = twoPI*P.n_s / P.lambda_s, //  * Math.cos(P.theta_s),
        k_i = twoPI*P.n_i / P.lambda_i  // * Math.cos(P.theta_i)
        ;

    //     var Ss = [ sinThetaS * Math.cos(P.phi_s),  sinThetaS * Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var PHI_s = sq(1/Math.cos(P.theta_s_e)), // External angle for the signal???? Is PHI_s z component?
        PHI_i = sq(1/Math.cos(P.theta_i_e)), // External angle for the idler????
        PSI_s = (k_s/P.n_s) * Math.sin(P.theta_s_e) * Math.cos(P.phi_s), // Looks to be the y component of the ks,i
        PSI_i = (k_i/P.n_i) * Math.sin(P.theta_i_e) * Math.cos(P.phi_i)
        ;

    var bw;  // Apodization 1/e^2

    // Take into account apodized crystals
    if (P.calc_apodization && P.enable_pp){
        bw = P.apodization_FWHM  / 2.3548;
        bw = 2* bw / P.L; // convert from 0->L to -1 -> 1 for the integral over z
    }
    else {
        bw = Math.pow(2,20);
    }

    // Now put the waist of the signal & idler at the center fo the crystal.
    // W = Wfi.*sqrt( 1 + 2.*1i.*(zi+hi.*sin(thetai_f))./(kif.*Wfi^2));
    var  Ws_r = Ws_SQ
        ,Ws_i = 2/(k_s/P.n_s) * (z0s + hs * Math.sin(P.theta_s_e)*Math.cos(P.phi_s) )
        ,Wi_r = Wi_SQ
        ,Wi_i = 2/(k_i/P.n_i) * (z0i + hi * Math.sin(P.theta_i_e)*Math.cos(P.phi_i) )
        ;

    // console.log("Signal WAIST:",Ws_r,Ws_i);
    // console.log('SIGNAL CALCULATIONS:', hs * Math.sin(P.theta_s_e)*Math.cos(P.phi_s), hi * Math.sin(P.theta_i_e)*Math.cos(P.phi_i) );
    // console.log("EXTERNAL ANGLES:", P.theta_s_e * toDeg, P.theta_i_e * toDeg);

    // console.log("Theta_s: " + (P.theta_s * 180 / Math.PI).toString() + ", Theta_i: " + (P.theta_i * 180 / Math.PI).toString(), ", PHI_I: " + PHI_i.toString() + ", Psi_I: " + PSI_i.toString() + ", PHI_s: " + PHI_s.toString() + ", Psi_s: " + PSI_s.toString());
    // console.log("Ks: " + k_s.toString() + "Ki: " + k_i.toString() + "Kp: " + k_p.toString() + "PHI_s: " + PHI_s.toString() + "PSIs: " + PSI_s.toString() );
    // Now calculate the the coeficients that get repeatedly used. This is from
    // Karina's code. Assume a symmetric pump waist (Wx = Wy)

    var  ks_f = (k_s/P.n_s)
        ,ki_f = (k_i/P.n_i)
        ,SIN_THETA_s_e = Math.sin(P.theta_s_e)
        ,SIN_THETA_i_e = Math.sin(P.theta_i_e)
        ,COS_THETA_s_e = Math.cos(P.theta_s_e)
        ,COS_THETA_i_e = Math.cos(P.theta_i_e)
        ,TAN_THETA_s_e = Math.tan(P.theta_s_e)
        ,TAN_THETA_i_e = Math.tan(P.theta_i_e)
        ,COS_PHI_s = Math.cos(P.phi_s)
        ,COS_PHI_i = Math.cos(P.phi_i)
        ,GAM2s = -0.25 * Ws_SQ
        ,GAM2i = -0.25 * Wi_SQ
        ,GAM1s = GAM2s *PHI_s
        ,GAM1i = GAM2i *PHI_i
        ,GAM3s = -2 * ks_f * GAM1s * SIN_THETA_s_e * COS_PHI_s
        ,GAM3i = -2 * ki_f * GAM1i * SIN_THETA_i_e * COS_PHI_i
        ,GAM4s = -0.5 * ks_f * SIN_THETA_s_e * COS_PHI_s * GAM3s
        ,GAM4i = -0.5 * ki_f * SIN_THETA_i_e * COS_PHI_i * GAM3i
        ,zhs = z0s + hs * SIN_THETA_s_e * COS_PHI_s
        ,zhi = z0i + hi * SIN_THETA_i_e * COS_PHI_i
        ,DEL2s = 0.5 / ks_f * zhs
        ,DEL2i = 0.5 / ki_f * zhi
        ,DEL1s = DEL2s * PHI_s
        ,DEL1i = DEL2i * PHI_i
        ,DEL3s = -hs - zhs * PHI_s * SIN_THETA_s_e * COS_PHI_s
        ,DEL3i = -hi - zhi * PHI_i * SIN_THETA_i_e * COS_PHI_i
        ,DEL4s = 0.5*ks_f * zhs * sq(TAN_THETA_s_e) - ks_f * z0s
        ,DEL4i = 0.5*ki_f * zhi * sq(TAN_THETA_i_e) - ki_f * z0i


        ,As_r = -0.25 * Wp_SQ + GAM1s
        ,As_i = -DEL1s
        ,Ai_r = -0.25 * Wp_SQ + GAM1i
        ,Ai_i = -DEL1i
        ,Bs_r = -0.25 * Wp_SQ + GAM2s
        ,Bs_i = -DEL2s
        ,Bi_r = -0.25 * Wp_SQ + GAM2i
        ,Bi_i = -DEL2i
        ,Cs = -0.25 * (P.L  / k_s - 2*z0/k_p)
        ,Ci = -0.25 * (P.L  / k_i - 2*z0/k_p)
        ,Ds =  0.25 * P.L  * (1/k_s - 1/k_p)
        ,Di =  0.25 * P.L  * (1/k_i - 1/k_p)
        // ,Es_r =  0.50 * (Ws_r*PHI_s * PSI_s)
        // ,Es_i =  0.50 * (Ws_i*PHI_i * PSI_s)
        // ,Ei_r =  0.50 * (Wi_r*PHI_i * PSI_i)
        // ,Ei_i =  0.50 * (Wi_i*PHI_i * PSI_i)
        ,mx_real = -0.50 * Wp_SQ
        ,mx_imag = z0/k_p
        ,my_real = mx_real // Pump waist is symmetric
        ,my_imag = mx_imag
        ,m  = P.L  / (2*k_p)
        ,n  = 0.5 * P.L  * Math.tan(RHOpx)
        ,ee = 0.5 * P.L  * (k_p + k_s + k_i + twoPI / (P.poling_period  * P.poling_sign))
        ,ff = 0.5 * P.L  * (k_p - k_s - k_i - twoPI / (P.poling_period  * P.poling_sign))
        // ,hh_r = -0.25 * (Wi_r * PHI_i * sq(PSI_i) + Ws_r * PHI_s * sq(PSI_s))
        // ,hh_i = -0.25 * (Wi_i * PHI_i * sq(PSI_i) + Ws_i * PHI_s * sq(PSI_s))
        ,hh_r = GAM4s + GAM4i
        ,hh_i = -(DEL4s + DEL4i)
        ;

    // console.log("INSIDE COINCIDENCES");

    // console.log("GAM1s:", GAM1s);
    // console.log("GAM2s:", GAM2s);
    // console.log("GAM3s:", GAM3s);
    // console.log("GAM4s:", GAM4s);
    // console.log("DEL1s:", DEL1s);
    // console.log("DEL2s:", DEL2s);
    // console.log("DEL3s:", DEL3s);
    // console.log("DEL4s:", DEL4s);

    // console.log("GAM1i:", GAM1i);
    // console.log("GAM2i:", GAM2i);
    // console.log("GAM3i:", GAM3i);
    // console.log("GAM4i:", GAM4i);
    // console.log("DEL1i:", DEL1i);
    // console.log("DEL2i:", DEL2i);
    // console.log("DEL3i:", DEL3i);
    // console.log("DEL4i:", DEL4i);

    // console.log("hs:", hs, hi, zhs, zhi);

    // As a function of z along the crystal, calculate the z-dependent coefficients
    var calczterms = function(z){
        // console.log("inside calczterms");
        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
        var A1 = [ As_r, As_i + Cs + Ds * z],
            A3 = [ Ai_r, Ai_i + Ci + Di * z],
            A2 = [ Bs_r, Bs_i + Cs + Ds * z],
            A4 = [ Bi_r, Bi_i + Ci + Di * z],
            // A5 = [ Es_r, Es_i + hs],
            // A7 = [ Ei_r, Ei_i + hi],
            A5 = [ GAM3s, -DEL3s],
            A7 = [ GAM3i, -DEL3i],
            //1i*0.5.*L.*(1 + Xi).*tan(Rho);
            A6 = [ 0, n*(1+z)],
            A8 = [ mx_real, mx_imag - m * z],
            A9 = A8, //Pump waist is symmetric
            A10 = [hh_r, hh_i + ee + ff * z]
            ;

        // console.log("Terms in Karina's order going from A1-A11");

        // console.log("A1:", A1);
        // console.log("A2:", A2);
        // console.log("A3:", A3);
        // console.log("A4:", A4);
        // console.log("A5:", A5);
        // console.log("A6:", A6);
        // console.log("A7:", A7);
        // console.log("A8:", A8);
        // console.log("A9:", A9);
        // console.log("A10:", A10);

        // OK A
        return [A1, A2, A3, A4, A5, A6, A7, A8, A9, A10];
    };

    var zintfunc = function(z){
        // z = 0;
        var terms = calczterms(z);
        var A1R = terms[0][0],
            A1I = terms[0][1],
            A2R = terms[1][0],
            A2I = terms[1][1],
            A3R = terms[2][0],
            A3I = terms[2][1],
            A4R = terms[3][0],
            A4I = terms[3][1],
            A5R = terms[4][0],
            A5I = terms[4][1],
            A6R = terms[5][0],
            A6I = terms[5][1],
            A7R = terms[6][0],
            A7I = terms[6][1],
            A8R = terms[7][0],
            A8I = terms[7][1],
            A9R = terms[8][0],
            A9I = terms[8][1],
            A10R = terms[9][0],
            A10I = terms[9][1]
            ;
        // (-4 A3 + A8^2/A1)
        // console.log("hello");
        // console.log("A1R: " + A1R.toString() + "   A2R: " + A2R.toString()+"A3R: " + A3R.toString() + "   A4R: " + A4R.toString()+"A5R: " + A5R.toString() + "   A6R: " + A6R.toString()+"A7R: " + A7R.toString() + "   A8R: " + A8R.toString()+"A9R: " + A9R.toString() + "   A10R: " + A10R.toString());
        // First calculate terms in the exponential of the integral
        //   E^(1/4 (4 A10 - A5^2/A1 - A6^2/A2 - (-2 A1 A7 + A5 A8)^2/(A1 (4 A1 A3 - A8^2)) - (A6^2 (-2 A2 + A9)^2)/(A2 (4 A2 A4 - A9^2)))
        // )

        // From Karina's code
//         % z = (exp((4.*A11 - A2.^2./A1 - A4.^2./A3 - (A10.*A4 - 2.*A3.*A8).^2./(A3.*(-A10.^2 + 4.*A3.*A7)) - (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2)))./4.)./...
// %
        // Kr -> Ka
        // A1 -> A1
        // A2 -> A3
        // A3 -> A5
        // A4 -> A7
        // A5 -> A2
        // A6 -> A4
        // A6 -> A8
        // A7 -> A6
        // A8 -> A9
        // A9 -> A10
        // A10 -> A11

        // Ka -> Kr
        // A1 -> A1
        // A2 -> A5
        // A3 -> A2
        // A4 -> A6
        // A5 -> A3
        // A6 -> A7
        // A7 -> A4
        // A8 -> A6
        // A9 -> A8
        // A10 -> A9
        // A11 -> A10

            // 4 A10
        var EXP1R = A10R*4,
            EXP1I = A10I*4,

            // A5^2/A1
            EXP2R_a = PhaseMatch.cmultiplyR(A5R, A5I, A5R, A5I ),
            EXP2I_a = PhaseMatch.cmultiplyI(A5R, A5I, A5R, A5I ),
            EXP2R = PhaseMatch.cdivideR(EXP2R_a, EXP2I_a, A1R, A1I),
            EXP2I = PhaseMatch.cdivideI(EXP2R_a, EXP2I_a, A1R, A1I),

            // A6^2/A2
            EXP3R_a = PhaseMatch.cmultiplyR(A6R, A6I, A6R, A6I ),
            EXP3I_a = PhaseMatch.cmultiplyI(A6R, A6I, A6R, A6I ),
            EXP3R = PhaseMatch.cdivideR(EXP3R_a, EXP3I_a, A2R, A2I),
            EXP3I = PhaseMatch.cdivideI(EXP3R_a, EXP3I_a, A2R, A2I),

            // (-2 A1 A7 + A5 A8)^2/ (A1 (4 A1 A3 - A8^2))
            EXP4Ra_num = -2 * PhaseMatch.cmultiplyR( A1R, A1I, A7R, A7I),
            EXP4Ia_num = -2 * PhaseMatch.cmultiplyI( A1R, A1I, A7R, A7I),
            EXP4Rb_num = PhaseMatch.cmultiplyR( A5R, A5I, A8R, A8I),
            EXP4Ib_num = PhaseMatch.cmultiplyI( A5R, A5I, A8R, A8I),
            EXP4Rc_num  = PhaseMatch.caddR(EXP4Ra_num, EXP4Ia_num, EXP4Rb_num, EXP4Ib_num),
            EXP4Ic_num  = PhaseMatch.caddI(EXP4Ra_num, EXP4Ia_num, EXP4Rb_num, EXP4Ib_num),
            EXP4R_num   = PhaseMatch.cmultiplyR(EXP4Rc_num, EXP4Ic_num, EXP4Rc_num, EXP4Ic_num),
            EXP4I_num   = PhaseMatch.cmultiplyI(EXP4Rc_num, EXP4Ic_num, EXP4Rc_num, EXP4Ic_num),
            // Denominator
            EXP4Ra_den = -1 * PhaseMatch.cmultiplyR(A8R, A8I, A8R, A8I),
            EXP4Ia_den = -1 * PhaseMatch.cmultiplyI(A8R, A8I, A8R, A8I),
            EXP4Rb_den =  4 * PhaseMatch.cmultiplyR( A1R, A1I, A3R, A3I),
            EXP4Ib_den =  4 * PhaseMatch.cmultiplyI( A1R, A1I, A3R, A3I),
            EXP4Rc_den =  PhaseMatch.caddR( EXP4Ra_den, EXP4Ia_den, EXP4Rb_den, EXP4Ib_den ),
            EXP4Ic_den =  PhaseMatch.caddI( EXP4Ra_den, EXP4Ia_den, EXP4Rb_den, EXP4Ib_den ),
            EXP4R_den = PhaseMatch.cmultiplyR(A1R, A1I, EXP4Rc_den, EXP4Ic_den),
            EXP4I_den = PhaseMatch.cmultiplyI(A1R, A1I, EXP4Rc_den, EXP4Ic_den),
            EXP4R     = PhaseMatch.cdivideR(EXP4R_num, EXP4I_num, EXP4R_den, EXP4I_den),
            EXP4I     = PhaseMatch.cdivideI(EXP4R_num, EXP4I_num, EXP4R_den, EXP4I_den),

            // A6^2 (-2 A2 + A9)^2)/(A2 (4 A2 A4 - A9^2)))
            EXP5Rb_num = PhaseMatch.caddR( -2*A2R, -2*A2I, A9R, A9I),
            EXP5Ib_num = PhaseMatch.caddI( -2*A2R, -2*A2I, A9R, A9I),
            EXP5Rc_num = PhaseMatch.cmultiplyR( EXP5Rb_num, EXP5Ib_num,EXP5Rb_num, EXP5Ib_num),
            EXP5Ic_num = PhaseMatch.cmultiplyI( EXP5Rb_num, EXP5Ib_num,EXP5Rb_num, EXP5Ib_num),
            EXP5R_num  = PhaseMatch.cmultiplyR( EXP3R, EXP3I ,EXP5Rc_num, EXP5Ic_num),
            EXP5I_num  = PhaseMatch.cmultiplyI( EXP3R, EXP3I ,EXP5Rc_num, EXP5Ic_num),
            // EXP5R_num  = PhaseMatch.cmultiplyR( EXP5Rd_num, EXP5Id_num, EXP5Rd_num, EXP5Id_num),
            // EXP5I_num  = PhaseMatch.cmultiplyI( EXP5Rd_num, EXP5Id_num, EXP5Rd_num, EXP5Id_num),
            // Denominator
            EXP5Ra_den = -1 * PhaseMatch.cmultiplyR(A9R, A9I, A9R, A9I),
            EXP5Ia_den = -1 * PhaseMatch.cmultiplyI(A9R, A9I, A9R, A9I),
            EXP5Rb_den =  4 * PhaseMatch.cmultiplyR( A2R, A2I, A4R, A4I),
            EXP5Ib_den =  4 * PhaseMatch.cmultiplyI( A2R, A2I, A4R, A4I),
            EXP5R_den =  PhaseMatch.caddR( EXP5Ra_den, EXP5Ia_den, EXP5Rb_den, EXP5Ib_den ),
            EXP5I_den =  PhaseMatch.caddI( EXP5Ra_den, EXP5Ia_den, EXP5Rb_den, EXP5Ib_den ),
            // expression for fifth term
            EXP5R     = PhaseMatch.cdivideR(EXP5R_num, EXP5I_num, EXP5R_den, EXP5I_den),
            EXP5I     = PhaseMatch.cdivideI(EXP5R_num, EXP5I_num, EXP5R_den, EXP5I_den),

            // Full expression for term in the exponential
            EXP6R_a = PhaseMatch.caddR(EXP1R, EXP1I, -1*EXP2R, -1*EXP2I),
            EXP6I_a = PhaseMatch.caddI(EXP1R, EXP1I, -1*EXP2R, -1*EXP2I),
            EXP6R_b = PhaseMatch.caddR(EXP6R_a, EXP6I_a, -1*EXP3R, -1*EXP3I),
            EXP6I_b = PhaseMatch.caddI(EXP6R_a, EXP6I_a, -1*EXP3R, -1*EXP3I),
            EXP6R_c = PhaseMatch.caddR(EXP6R_b, EXP6I_b, -1*EXP4R, -1*EXP4I),
            EXP6I_c = PhaseMatch.caddI(EXP6R_b, EXP6I_b, -1*EXP4R, -1*EXP4I),
            EXPR = 0.25 * PhaseMatch.caddR(EXP6R_c, EXP6I_c, -1*EXP5R, -1*EXP5I),
            EXPI = 0.25 * PhaseMatch.caddI(EXP6R_c, EXP6I_c, -1*EXP5R, -1*EXP5I),


            //////////////////////////////////////////////////////////////////////////////
            // Now deal with the denominator in the integral:
            // Sqrt[A1 A2 (-4 A3 + A8^2/A1) (-4 A4 + A9^2/A2)]

            // A1 A2
            DEN1R = PhaseMatch.cmultiplyR(A1R, A1I, A2R, A2I),
            DEN1I = PhaseMatch.cmultiplyI(A1R, A1I, A2R, A2I),

            // (-4 A3 + A8^2/A1) //Matlab (-4 A7 + A10^2/A3)
            DEN2R_a = PhaseMatch.cdivideR(-1*EXP4Ra_den, -1*EXP4Ia_den, A1R, A1I),
            DEN2I_a = PhaseMatch.cdivideI(-1*EXP4Ra_den, -1*EXP4Ia_den, A1R, A1I),
            DEN2R = PhaseMatch.caddR(-4*A3R, -4*A3I, DEN2R_a, DEN2I_a),
            DEN2I = PhaseMatch.caddI(-4*A3R, -4*A3I, DEN2R_a, DEN2I_a),

            // (-4 A4 + A9^2/A2)
            DEN3R_a = PhaseMatch.cdivideR(-1*EXP5Ra_den, -1*EXP5Ia_den, A2R, A2I),
            DEN3I_a = PhaseMatch.cdivideI(-1*EXP5Ra_den, -1*EXP5Ia_den, A2R, A2I),
            DEN3R = PhaseMatch.caddR(-4*A4R, -4*A4I, DEN3R_a, DEN3I_a),
            DEN3I = PhaseMatch.caddI(-4*A4R, -4*A4I, DEN3R_a, DEN3I_a),

            // full expression for denominator
            DEN4R_a = PhaseMatch.cmultiplyR(DEN1R, DEN1I, DEN2R, DEN2I),
            DEN4I_a = PhaseMatch.cmultiplyI(DEN1R, DEN1I, DEN2R, DEN2I),
            DEN4R_b = PhaseMatch.cmultiplyR(DEN4R_a, DEN4I_a, DEN3R, DEN3I),
            DEN4I_b = PhaseMatch.cmultiplyI(DEN4R_a, DEN4I_a, DEN3R, DEN3I),
            DENR     = PhaseMatch.csqrtR(DEN4R_b, DEN4I_b),
            DENI     = PhaseMatch.csqrtI(DEN4R_b, DEN4I_b),

            // Now calculate the full term in the integral.
            pmzcoeff = Math.exp(- 1/2*sq(z/bw)), // apodization
            // pmzcoeff = 1,
            // Exponential using Euler's formula
            coeffR = Math.exp(EXPR),
            // coeffR = 1,
            EReal = coeffR * pmzcoeff*Math.cos(EXPI),
            EImag = coeffR * pmzcoeff*Math.sin(EXPI),
            real = PhaseMatch.cdivideR(EReal, EImag, DENR, DENI),
            imag = PhaseMatch.cdivideI(EReal, EImag, DENR, DENI)
            ;
            var EXPRadd = (EXP1R -EXP2R -EXP3R -EXP4R -EXP5R)/4;


            // console.log("Exponent: ", EXPR, EXPI);
            // // console.log("4A10: ", EXP1R, EXP1I);
            // // console.log("A5^2/A1: ", EXP2R, EXP2I);
            // // console.log("A6^2/A2: ", EXP3R, EXP3I);
            // // console.log("(-2 A1 A7 + A5 A8)^2:", EXP4R, EXP4I);
            // // console.log("A6^2 (-2 A2 + A9)^2):", EXP5R, EXP5I);
            // console.log("Den1: ", DEN1R, DEN1I);
            // console.log("DEN2: ", DEN2R, DEN2I);
            // console.log("DEN3: ", DEN3R, DEN3I);
            // console.log("C9squaredA2:", DEN3R_a, DEN3I_a);
            // console.log("Denominator: ", DENR, DENI);
            // console.log("RESULT: ", (0.5*real).toExponential(), (0.5*imag).toExponential());
            /////////////////////////////////////////////////////////////////
            // console.log("real: " + EXPR.toString() + "   ExpImag: " + EXPI.toString() + "   DenR: " + DENR.toString() + "   DENI: " + DENI.toString() + " Den1I: " +DEN1I.toString() + " DEN2I: " + DEN2I.toString() + " DEN3I: " + DEN3I.toString() + " A1I: " + A1I.toString() + " A2I: " + A2I.toString() + " A8I: " + A8I.toString() + " A1I: " + A1I.toString() + " A3I: " + A3I.toString());
            // console.log("real: " + EXPR.toString() + "   ExpImag: " + EXPI.toString() + "   DenR: " + DENR.toString() + "   DENI: " + DENI.toString() + " Den1R: " +DEN1R.toString() + " DEN2R: " + DEN2R.toString() + " DEN3R: " + DEN3R.toString() + " A1R: " + A1R.toString() + " A2R: " + A2R.toString() + " A8R: " + A8R.toString() + " A1R: " + A1R.toString() + " A3R: " + A3R.toString());
            // console.log("real: " + EXPR.toString() + "   ExpImag: " + EXPI.toString() + " EXP1R: " + EXP1R.toString() + ", EXP2R: " + EXP2R.toString()+ ", EXP3R: " + EXP3R.toString()+ ", EXP4R: " + EXP4R.toString()+ ", EXP5R: " + EXP5R.toString() + " A1R: " + A1R.toString() + " A3R: " + A3R.toString() + "    A5I: " + A5I.toString() + ",    A7I: " + A7I.toString() + " A8R: " + A8R.toString() + ", Exp4R_num: " + EXP4R_num.toString() + ", Exp4I_num: " + EXP4I_num.toString() + ", Exp4R_den: " + EXP4R_den.toString() + ", Exp4I_den: " + EXP4I_den.toString() );
            // console.log("real: " + real.toString() + " Imag: " + imag.toString());

        return [real, imag];
    };

    var arg = P.L/2*(delKz);
    var PMt = 1;

    if (P.calcfibercoupling){
        var dz = 2/P.numzint;
        var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-1, 1,dz,P.numzint,P.zweights);
        // var pmintz = zintfunc(0.5);

        // var dz = 1;
        // var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-1, 1,dz,1,P.zweights);
        // PMz_real = pmintz[0]/P.L ;
        // PMz_imag = pmintz[1]/P.L ;
        PMz_real = pmintz[0]/2;
        PMz_imag = pmintz[1]/2;
        // var coeff = (Math.sqrt(omega_s * omega_i)/ (P.n_s * P.n_i));
        var coeff = 1;
        PMz_real = PMz_real * coeff;
        PMz_imag = PMz_imag * coeff;
    }
    else{
        var PMzNorm1 = Math.sin(arg)/arg;
        // var PMz_real =  PMzNorm1 * Math.cos(arg);
        // var PMz_imag = PMzNorm1 * Math.sin(arg);
        PMz_real =  PMzNorm1 ;
        PMz_imag = 0;
        PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
    }


    if (P.use_guassian_approx){
        // console.log('approx');
        PMz_real = Math.exp(-0.193*sq(arg));
        PMz_imag = 0;
    }

    PhaseMatch.convertToMeters(P);
    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;
    // console.log(PMz_real.toString());
    return [PMz_real, PMz_imag, PMt];

};


/**********************************************************************
 * Get the constants and terms used in the calculation of the momentum
 * space joint spectrum for the singles counts from the Idler.
 */
PhaseMatch.calc_PM_tz_k_singles = function calc_PM_tz_k_singles (P){
    // console.log("hi");
    // console.log("\n");
    var toMicrons= 1;
    var con = PhaseMatch.constants;
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;

    // console.log("");
    // console.log("Inside Singles");
    // console.log(P.lambda_s.toString());

    // // For testing purposes
    // P.lambda_s = 2 * lambda_p;
    // P.lambda_i = 2 * lambda_p;
    // P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
    // P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");


    var twoPI = 2*Math.PI,
        twoPIc = twoPI*con.c*toMicrons
        ;

    var z0 = P.z0p //put pump in middle of the crystal
        ,z0s = P.z0s// -P.L/(2*Math.cos(P.theta_s_e))
        ;

    // Get the pump index corresponding to the crystal phasematching function
    // to calculate the K vector mismatch
    P.lambda_p =1/(1/P.lambda_s + 1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

    // P.calc_walkoff_angles();
    var RHOpx = P.walkoff_p; //pump walkoff angle.
    // var RHOpx = 0

    PhaseMatch.convertToMicrons(P);
    var omega_s = twoPIc / (P.lambda_s ),
        omega_i = twoPIc / (P.lambda_i),
        omega_p = omega_s + omega_i
        // omega_p = twoPIc / P.lambda_p
        ;

    // Height of the collected spots from the axis.
    var hs = Math.tan(P.theta_s)*P.L*0.5 *Math.cos(P.phi_s),
        hi = Math.tan(P.theta_i)*P.L*0.5 * Math.cos(P.phi_i);

    var PMz_real = 0;
    var PMz_imag = 0;

    // // Location of the waist for the signal and idler
    // var z0s = P.L/2;
    // var z0s = 0;

    // var convfromFWHM = 1*Math.sqrt(2); // Use 1/e^2 in intensity.
    var convfromFWHM = 1; // Use 1/e^2 in intensity.


    // var W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s))),
    //     W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));


    // Setup constants
    var Wp_SQ = sq(P.W * convfromFWHM), // convert from FWHM to sigma
        Ws_SQ = sq(P.W_sx  * convfromFWHM), // convert from FWHM to sigma
        Wi_SQ = sq(P.W_sx  * convfromFWHM), // convert from FWHM to sigma @TODO: Change to P.W_i
        // Ws_SQ = sq(W_s * convfromFWHM), // convert from FWHM to sigma
        // Wi_SQ = sq(W_i * convfromFWHM) // convert from FWHM to sigma @TODO: Change to P.W_i
        // Set Wx = Wy for the pump.
        Wx_SQ = Wp_SQ ,
        Wy_SQ = Wp_SQ
        ;

    // Is this the k vector along the direction of propagation?
    var k_p = twoPI*P.n_p / P.lambda_p,
        k_s = twoPI*P.n_s / P.lambda_s, //  * Math.cos(P.theta_s),
        k_i = twoPI*P.n_i / P.lambda_i  // * Math.cos(P.theta_i)
        ;

    //     var Ss = [ sinThetaS * Math.cos(P.phi_s),  sinThetaS * Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var PHI_s = sq(1/Math.cos(P.theta_s_e)), // External angle for the signal???? Is PHI_s z component?
        // PSI_s = (k_s/P.n_s) * Math.sin(P.theta_s_e) * Math.cos(P.phi_s) // Looks to be the y component of the ks,i
        PSI_s = 1 * Math.sin(P.theta_s_e) * Math.cos(P.phi_s) // Looks to be the y component of the ks,i
        ;

    // Now put the waist of the signal & idler at the center fo the crystal.
    // W = Wfi.*sqrt( 1 + 2.*1i.*(zi+hi.*sin(thetai_f))./(kif.*Wfi^2));
    // var  Ws_r = Ws_SQ
    //     ,Ws_i = -2/(omega_s/con.c) * (z0s + hs * Math.sin(P.theta_s_e) )
    //     ;

    var  Ws_r = Ws_SQ
        ,Ws_i = 2/(k_s/P.n_s) * (z0s + hs * Math.sin(P.theta_s_e)*Math.cos(P.phi_s) )
        ;

    // console.log("WAIST Imag:", Ws_i);

    var bw;  // Apodization 1/e^2

    // Take into account apodized crystals
    if (P.calc_apodization && P.enable_pp){
        bw = P.apodization_FWHM  / 2.3548;
        bw = 2* bw / P.L; // convert from 0->L to -1 -> 1 for the integral over z
    }
    else {
        bw = Math.pow(2,20);
    }

    // Now calculate the the coeficients that get repeatedly used. This is from
    // Karina's code. Do not assume a symmetric pump waist (Wx = Wy) here. This is inserted in the code above.

    // var  ks_f = (k_s/P.n_s)
    //     ,SIN_THETA_s_e = Math.sin(P.theta_s_e)
    //     ,SIN_THETA_i_e = Math.sin(P.theta_i_e)
    //     ,COS_THETA_s_e = Math.cos(P.theta_s_e)
    //     ,COS_THETA_i_e = Math.cos(P.theta_i_e)
    //     ,TAN_THETA_s_e = Math.tan(P.theta_s_e)
    //     ,TAN_THETA_i_e = Math.tan(P.theta_i_e)
    //     ,GAM2s = -0.25 * Ws_SQ
    //     ,GAM1s = GAM2s *PHI_s
    //     ,GAM3s = -2 * ks_f * GAM1s * SIN_THETA_s_e
    //     ,GAM4s = -0.5 * ks_f * SIN_THETA_s_e
    //     ,zhs = z0s + hs * SIN_THETA_s_e
    //     ,DEL2s = 0.5 / ks_f * zhs
    //     ,DEL1s = DEL2s * PHI_s
    //     ,DEL3s = hs - zhs * PHI_s * SIN_THETA_s_e
    //     ,DEL4s = 0.5*ks_f * zhs * SIN_THETA_s_e * sq(TAN_THETA_s_e) - ks_f * z0s


    var  ks_f = (k_s/P.n_s)
        ,SIN_THETA_s_e = Math.sin(P.theta_s_e)
        ,COS_THETA_s_e = Math.cos(P.theta_s_e)
        ,TAN_THETA_s_e = Math.tan(P.theta_s_e)
        ,COS_PHI_s = Math.cos(P.phi_s)
        ,GAM2s = -0.25 * Ws_SQ
        ,GAM1s = GAM2s *PHI_s
        ,GAM3s = -2 * ks_f * GAM1s * SIN_THETA_s_e * COS_PHI_s
        ,GAM4s = -0.5 * ks_f * SIN_THETA_s_e * COS_PHI_s * GAM3s
        ,zhs = z0s + hs * SIN_THETA_s_e * COS_PHI_s
        ,DEL2s = 0.5 / ks_f * zhs
        ,DEL1s = DEL2s * PHI_s
        ,DEL3s = -hs - zhs * PHI_s * SIN_THETA_s_e * COS_PHI_s
        ,DEL4s = 0.5*ks_f * zhs * sq(TAN_THETA_s_e) - ks_f * z0s
        ,KpKs = k_p * k_s
        ,L  = P.L
        // ,C0 = Ws_SQ * PHI_s

        // ,C0_r = -4 * GAM1s
        // ,C0_i = 4 * DEL1s
        // ,C1_r = KpKs * (Wx_SQ + C0_r)
        // ,C1_i = KpKs * (C0_i)
        // ,C2_r = C0_r * PSI_s
        // ,C2_i = C0_i * PSI_s
        ,C7 = (k_p - k_s - k_i - twoPI / (P.poling_period  * P.poling_sign))
        ,C3 = P.L * C7
        ,C4 = P.L * (1/k_i - 1/k_p)
        ,C5 = k_s/k_p
        // ,C6_r = KpKs * (Ws_r + Wy_SQ)
        // ,C6_i = KpKs * Ws_i
        // ,C6_r = KpKs * (Wy_SQ -4*GAM2s)
        // ,C6_i = 4*KpKs * GAM2s
        ,C9 = k_p * Wx_SQ
        ,C10 = k_p * Wy_SQ
        ,LRho = L * RHOpx
        ,LRho_sq = sq(LRho)
        ;
    // Imaginary Terms
    var  alpha1R = 4*KpKs * GAM1s
        ,alpha1I = - 4*KpKs * DEL1s
        ,alpha2R = 4*KpKs * GAM2s
        ,alpha2I = - 4*KpKs * DEL2s
        ,alpha3R = GAM3s
        ,alpha3I = - DEL3s
        // Complex conjugates
        ,alpha1cR = alpha1R
        ,alpha1cI =  - alpha1I
        ,alpha2cR = alpha2R
        ,alpha2cI = - alpha2I
        ,alpha3cR = alpha3R
        ,alpha3cI = - alpha3I
        ;

            // M1R = -2 * DEL3s
    //     ,M1I = -2 * GAM3s
    //     ,M2R = M1R //M2 is the complex conjugate of M1
    //     ,M2I = -M2I
    // //      M1R = 2*hs + C2_i
    // //     ,M1I = -C2_r
    // //     ,M2R = 2*hs - C2_i
    // //     ,M2I = C2_r
    //     ,M1_SQR = PhaseMatch.cmultiplyR( M1R, M1I, M1R, M1I)
    //     ,M1_SQI = PhaseMatch.cmultiplyI( M1R, M1I, M1R, M1I)
    //     ,M2_SQR = PhaseMatch.cmultiplyR( M2R, M2I, M2R, M2I)
    //     ,M2_SQI = PhaseMatch.cmultiplyI( M2R, M2I, M2R, M2I)
    //     ;

    // As a function of z1 along the crystal, calculate the z1-dependent coefficients
    var calcz1terms = function(z1){
        // z1=0;
        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
        var  A1 = 2 * z0 - L*z1
            ,B1 = (1 - z1)
            ,B3 = (1 + z1)
        ;
        return [A1, B1, B3];

        // return [D1R, D1I, D3R, D3I, H1R, H1I, H3R, H3I, P1R, P1I, P3R, P3I, Q1R, Q1I, Q3R, Q3I, A1, B1, B3];
    };

    // As a function of z2 along the crystal, calculate the z2-dependent coefficients
    var calcz2terms = function(z2){
        // z2 = 0;
        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
        var  A2 = 2 * z0 - L*z2
            ,B2 = (1 - z2)
            ,B4 = (1 + z2)
        ;
        return [A2, B2, B4];
        // return [D2R, D2I, D4R, D4I, H2R, H2I, H4R, H4I, P2R, P2I, P4R, P4I, Q2R, Q2I, Q4R, Q4I, A2, B2, B4];
    };

    var zintfunc = function(z1, z2, Cz1){
        // z1 = 0;
        // z2 =0;
        // Get the terms that depend only on z2. We already have the terms depending only on z1 in Cz1
        var  Cz2 = calcz2terms(z2)
            ,B0 = z1-z2
            // From Cz1
            ,A1 = Cz1[0]
            ,B1 = Cz1[1]
            ,B3 = Cz1[2]

            // From Cz2
            ,A2 = Cz2[0]
            ,B2 = Cz2[1]
            ,B4 = Cz2[2]

            // Now terms that depend on both z1 and z2
            ,B6a = C4 * B0


            ,gamma1I = -k_p*L*B1 + k_s * A1
            ,gamma2I = (-k_p*L*B2 + k_s * A2)
            ,HaR = alpha1R
            ,HaI = alpha1I + gamma1I
            ,HbR = alpha2R
            ,HbI = alpha2I + gamma1I
            ,HcR = alpha1cR
            ,HcI = alpha1cI - gamma2I
            ,HdR = alpha2cR
            ,HdI = alpha2cI - gamma2I

            ,AA1R = (HaR - C9*k_s)/(4*KpKs)
            ,AA1I = (HaI)/(4*KpKs)
            ,AA2R = (HcR - C9*k_s)/(4*KpKs)
            ,AA2I = (HcI)/(4*KpKs)
            ,BB1R = (HbR - C10*k_s)/(4*KpKs)
            ,BB1I = (HbI)/(4*KpKs)
            ,BB2R = (HdR - C10*k_s)/(4*KpKs)
            ,BB2I = (HdI)/(4*KpKs)

            // Now for the denominators that show up in EE, FF, GG, HH, and II
            ,X11R = (C9*k_s - HaR)
            ,X11I = -HaI
            ,X12R = -HcI
            ,X12I = HcR - C9*k_s
            ,Y21R = (C10*k_s - HbR)
            ,Y21I = -HbI
            ,Y22R = -HdI
            ,Y22I = HdR - C10*k_s

            //Now to calculate the term EE
            // EE = 1/4*(-  2*Wx^2 + I B6a + C5/X11*(C9 - I A1)^2 - I C5/X12*(C9 + I A2)^2  )
            // ,EE1R = PhaseMatch.cmultiplyR(C9, -A1, C9, -A1)
            // ,EE1I = PhaseMatch.cmultiplyI(C9, -A1, C9, -A1)
            // ,EE2R = PhaseMatch.cmultiplyR(C9, A2, C9, A2)
            // ,EE2I = PhaseMatch.cmultiplyI(C9, A2, C9, A2)
            // ,EE3R = C5 * PhaseMatch.cdivideR(EE1R, EE1I, X11R, X11I)
            // ,EE3I = C5 * PhaseMatch.cdivideI(EE1R, EE1I, X11R, X11I)
            // ,EE4R = C5 * PhaseMatch.cdivideR(EE2R, EE2I, X12R, X12I)
            // ,EE4I = C5 * PhaseMatch.cdivideI(EE2R, EE2I, X12R, X12I)
            // ,EE5R = PhaseMatch.cmultiplyR(0, 1, EE4R, EE4I)
            // ,EE5I = PhaseMatch.cmultiplyI(0, 1, EE4R, EE4I)
            // ,EER = 0.25 * (-2*Wx_SQ + EE3R - EE5R)
            // ,EEI = 0.25 * (B6a + EE3I - EE5I)

            ,EE1R = PhaseMatch.cmultiplyR(A1, C9, A1, C9)
            ,EE1I = PhaseMatch.cmultiplyI(A1, C9, A1, C9)
            ,EE2R = PhaseMatch.cmultiplyR(A2, -C9, A2, -C9)
            ,EE2I = PhaseMatch.cmultiplyI(A2, -C9, A2, -C9)
            ,EE3R = C5 * PhaseMatch.cdivideR(EE1R, EE1I, X11R, X11I)
            ,EE3I = C5 * PhaseMatch.cdivideI(EE1R, EE1I, X11R, X11I)
            ,EE4R = C5 * PhaseMatch.cdivideR(EE2R, EE2I, X12R, X12I)
            ,EE4I = C5 * PhaseMatch.cdivideI(EE2R, EE2I, X12R, X12I)
            ,EE5R = PhaseMatch.cmultiplyR(0, 1, EE4R, EE4I)
            ,EE5I = PhaseMatch.cmultiplyI(0, 1, EE4R, EE4I)
            ,EER = 0.25 * (-2*Wx_SQ - EE3R + EE5R)
            ,EEI = 0.25 * (B6a - EE3I + EE5I)


            //Now to calculate the term FF
            // FF = 1/4*(-2*Wy^2 + I B6a - C5/Y21 *(I C10 + A1)^2 + I C5/Y22 *(-I C10 + A2)^2)
            ,FF1R = PhaseMatch.cmultiplyR(A1, C10, A1, C10)
            ,FF1I = PhaseMatch.cmultiplyI(A1, C10, A1, C10)
            ,FF2R = PhaseMatch.cmultiplyR(A2, -C10, A2, -C10)
            ,FF2I = PhaseMatch.cmultiplyI(A2, -C10, A2, -C10)
            ,FF3R = C5 * PhaseMatch.cdivideR(FF1R, FF1I, Y21R, Y21I)
            ,FF3I = C5 * PhaseMatch.cdivideI(FF1R, FF1I, Y21R, Y21I)
            ,FF4R = C5 * PhaseMatch.cdivideR(FF2R, FF2I, Y22R, Y22I)
            ,FF4I = C5 * PhaseMatch.cdivideI(FF2R, FF2I, Y22R, Y22I)
            ,FF5R = PhaseMatch.cmultiplyR(0, 1, FF4R, FF4I)
            ,FF5I = PhaseMatch.cmultiplyI(0, 1, FF4R, FF4I)
            ,FFR = 0.25 * (-2*Wy_SQ - FF3R + FF5R)
            ,FFI = 0.25 * (B6a - FF3I + FF5I)

            //Now to calculate the term GG
            // GG = ks*( \[Alpha]3c/X12 *(I C9 - A2)  +  \[Alpha]3/X11 *(-C9 + I A1));
            ,GG1R = PhaseMatch.cmultiplyR(-C9, A1, alpha3R, alpha3I)
            ,GG1I = PhaseMatch.cmultiplyI(-C9, A1, alpha3R, alpha3I)
            ,GG2R = PhaseMatch.cdivideR(GG1R, GG1I, X11R, X11I)
            ,GG2I = PhaseMatch.cdivideI(GG1R, GG1I, X11R, X11I)
            ,GG3R = PhaseMatch.cmultiplyR(-A2, C9, alpha3cR, alpha3cI)
            ,GG3I = PhaseMatch.cmultiplyI(-A2, C9, alpha3cR, alpha3cI)
            ,GG4R = PhaseMatch.cdivideR(GG3R, GG3I, X12R, X12I)
            ,GG4I = PhaseMatch.cdivideI(GG3R, GG3I, X12R, X12I)
            ,GGR = k_s * ( GG2R + GG4R)
            ,GGI = k_s * ( GG2I + GG4I)

            //Now to calculate the term HH
            // HH = L * \[Rho]/2 *(I B0 + ks*(B3/Y21 *(-I C10 - A1)  +  B4/Y22 *(C10 + I A2)));
            // HH = L * \[Rho]/2 *(I B0 + ks*(B3/Y21 *(-I C10 - A1)  +  B4/Y22 *(C10 + I A2)));
            ,HH2R = B4 * PhaseMatch.cdivideR(C10, A2, Y22R, Y22I)
            ,HH2I = B4 * PhaseMatch.cdivideI(C10, A2, Y22R, Y22I)
            ,HH4R = B3 * PhaseMatch.cdivideR(-A1, -C10, Y21R, Y21I)
            ,HH4I = B3 * PhaseMatch.cdivideI(-A1, -C10, Y21R, Y21I)
            ,HHR = 0.5 * LRho * (k_s * (HH2R + HH4R))
            ,HHI = 0.5 * LRho * (B0 + k_s * (HH2I + HH4I))

            //Now to calculate the term II
            // II = IIrho + IIgam + IIdelk
            // IIrho = 1/4* ks*kp*L^2*\[Rho]^2 ( -B3^2/Y21 +I B4^2/Y22)
            // IIgam = kp*ks*(\[Alpha]3^2/X11 - I \[Alpha]3c^2/X12)
            // IIdelk = 2 \[CapitalGamma]4s + 0.5 I (C3*B0)

            ,IIrho1R = sq(B4) * PhaseMatch.cdivideR(0, 1, Y22R, Y22I)
            ,IIrho1I = sq(B4) * PhaseMatch.cdivideI(0, 1, Y22R, Y22I)
            ,IIrho2R = sq(B3) * PhaseMatch.cdivideR(1, 0, Y21R, Y21I)
            ,IIrho2I = sq(B3) * PhaseMatch.cdivideI(1, 0, Y21R, Y21I)
            ,IIrhoR = 0.25 * LRho_sq * (IIrho1R - IIrho2R)
            ,IIrhoI = 0.25 * LRho_sq * (IIrho1I - IIrho2I)
            ,IIgam1R = PhaseMatch.cmultiplyR(alpha3R, alpha3I, alpha3R, alpha3I)
            ,IIgam1I = PhaseMatch.cmultiplyI(alpha3R, alpha3I, alpha3R, alpha3I)
            ,IIgam2R = PhaseMatch.cdivideR(IIgam1R, IIgam1I, X11R, X11I)
            ,IIgam2I = PhaseMatch.cdivideI(IIgam1R, IIgam1I, X11R, X11I)
            ,IIgam3R = PhaseMatch.cmultiplyR(alpha3cR, alpha3cI, alpha3cR, alpha3cI)
            ,IIgam3I = PhaseMatch.cmultiplyI(alpha3cR, alpha3cI, alpha3cR, alpha3cI)
            ,IIgam4R = PhaseMatch.cdivideR(IIgam3R, IIgam3I, X12R, X12I)
            ,IIgam4I = PhaseMatch.cdivideI(IIgam3R, IIgam3I, X12R, X12I)
            ,IIgamR = IIgam2R + IIgam4I
            ,IIgamI = IIgam2I - IIgam4R
            ,IIR = 2*GAM4s + KpKs * (IIrhoR + IIgamR)
            ,III = 0.5*(C3 * B0) + KpKs * (IIrhoI + IIgamI)

            // ,IIR = 0
            // ,III = 0
            // ,HHR = 0
            // ,HHI = 0
            // ,GGR = 0
            // ,GGI = 0
            // // ,II2R = PhaseMatch.cmultiplyR(B6, 0, 0, 2*C7)
            // ,II2I = PhaseMatch.cmultiplyI(B6, 0, 0, 2*C7)
            // ,IIR = 0.25 * PhaseMatch.caddR(II1R, II1I, II2R, II2I)
            // ,III = 0.25 * PhaseMatch.caddI(II1R, II1I, II2R, II2I)

            // Now calculate terms in the numerator
            // Exp(-(GG^2/(4 EE)) - HH^2/(4 FF) + II)
            ,EXP1R = PhaseMatch.cmultiplyR(GGR, GGI, GGR, GGI)
            ,EXP1I = PhaseMatch.cmultiplyI(GGR, GGI, GGR, GGI)
            ,EXP2R = - PhaseMatch.cdivideR(EXP1R, EXP1I, EER, EEI) /4
            ,EXP2I = - PhaseMatch.cdivideI(EXP1R, EXP1I, EER, EEI) /4
            ,EXP3R = PhaseMatch.cmultiplyR(HHR, HHI, HHR, HHI)
            ,EXP3I = PhaseMatch.cmultiplyI(HHR, HHI, HHR, HHI)
            ,EXP4R = PhaseMatch.cdivideR(EXP3R, EXP3I, -4*FFR, -4*FFI)
            ,EXP4I = PhaseMatch.cdivideI(EXP3R, EXP3I, -4*FFR, -4*FFI)
            ,EXPR  = EXP2R + EXP4R + IIR
            ,EXPI  = EXP2I + EXP4I + III

            // Now calculate terms in the DENominator
            // 8 * Sqrt[AA1 BB1 AA2 BB2 EE FF]
            ,Den1R = PhaseMatch.cmultiplyR(AA1R, AA1I, BB1R, BB1I)
            ,Den1I = PhaseMatch.cmultiplyI(AA1R, AA1I, BB1R, BB1I)
            ,Den2R = PhaseMatch.cmultiplyR(AA2R, AA2I, BB2R, BB2I)
            ,Den2I = PhaseMatch.cmultiplyI(AA2R, AA2I, BB2R, BB2I)
            ,Den3R = PhaseMatch.cmultiplyR(EER, EEI, FFR, FFI)
            ,Den3I = PhaseMatch.cmultiplyI(EER, EEI, FFR, FFI)
            ,Den4R = PhaseMatch.cmultiplyR(Den1R, Den1I, Den2R, Den2I)
            ,Den4I = PhaseMatch.cmultiplyI(Den1R, Den1I, Den2R, Den2I)
            ,Den5R = PhaseMatch.cmultiplyR(Den4R, Den4I, Den3R, Den3I)
            ,Den5I = PhaseMatch.cmultiplyI(Den4R, Den4I, Den3R, Den3I)
            ,DenR  = 8 * PhaseMatch.csqrtR(Den5R, Den5I)
            ,DenI  = 8 * PhaseMatch.csqrtI(Den5R, Den5I)

            // Now calculate the full term in the integral.
            // @TODO: Not sure how to correctly handle the apodization in the double length integral
            ,pmzcoeff = Math.exp(- 1/2*sq(z1/bw)) * Math.exp(- 1/2*sq(z2/bw))// apodization
            // ,pmzcoeff = 1
            // Exponential using Euler's formula
            ,coeffR = Math.exp(EXPR)
            // ,coeffR = 1
            ,EReal = coeffR * pmzcoeff*Math.cos(EXPI)
            ,EImag = coeffR * pmzcoeff*Math.sin(EXPI)

            // ,real = coeffR
            // ,imag = 0

            ,real = 0.5* PhaseMatch.cdivideR(EReal, EImag, DenR, DenI)
            ,imag = 0.5* PhaseMatch.cdivideI(EReal, EImag, DenR, DenI)

            // console.log("Int: " + IIR.toString() + ", " + III.toString() + ", " + EReal.toString() + ", " + EImag.toString());

            // ,real = 1 * EReal
            // ,imag = 1 * EImag
            ;

        // console.log("X11:", X11R, X11I);
        // console.log("X12:", X12R, X12I);
        // console.log("Y21:", Y21R, Y21I);
        // console.log("Y22:", Y22R, Y22I);
        // console.log("Gamma1 ", gamma1I);
        // console.log("Gamma2 ", gamma2I);
        // console.log("AA1:", AA1R, AA1I);
        // console.log("BB1:",BB1R, BB1I);
        // console.log("AA2:", AA2R, AA2I);
        // console.log("BB2:",BB2R, BB2I);
        // console.log("EE: ", EER, EEI);
        // console.log("FF: ", FFR, FFI);
        // console.log("GG: ", GGR, GGI);
        // console.log("HH: ", HHR, HHI);
        // console.log("II: ", IIR, III);
        // console.log("Exponent: ", EXPR, EXPI);
        // console.log("Denominator: ", DenR, DenI);
        // console.log("RESULT: ", real*0.5, imag*0.5);
        // console.log("Den4 ", Den4R, Den4I);
        // console.log("Den3 ", Den3R, Den3I);
        // console.log("Den5 ", Den5R, Den5I);
        // console.log("Wx_2 ", Wx_SQ, Wy_SQ);
        // console.log("A1, A2", A1, A2);
        // console.log("C9", C9, C9*k_s);
        // console.log("C5", C5);
        // console.log("FF4:", FF4R, FF4I);
        // console.log("FF5:", FF5R, FF5I);
        // console.log("FF3:", FF3R, FF3I);
        // console.log("Y21:", Y21R, Y21I);
        // console.log("Y21+Y22:", -2*Wy_SQ - FF3R + FF5R, B6a - FF3I + FF5I);
        // console.log("FFother:", -2*Wy_SQ, B6a);




        // console.log("B1, B2: ", B1, B2);
        // console.log("A1, A2: ", A1, A2);

        // console.log("GG^2/4EE", -EXP2R, -EXP2I);
        // console.log("HH^2/4FF", -EXP4R, -EXP4I);
        // // console.log("Rho: ", RHOpx);

        // // ,IIR = 0.25 * (-2*C2_r*PSI_s - KpKs*(RHOpx*RHOpx*(Q3R + Q4R) + Q1R + Q2R))
        // //  III = 0.25 * (-2*C2_i*PSI_s + 2*C7*B6 - KpKs*(RHOpx*RHOpx*(Q3I + Q4I) + Q1I + Q2I))
        // console.log("C2_i:", C2_i);
        // console.log("C7:", C7);
        // console.log("B6:", B6);
        // // console.log("Q1I:", Q1I);
        // // console.log("Q2I:", Q2I);
        // // console.log("Q3I:", Q3I);
        // // console.log("Q4I:", Q4I);
        // // console.log("B3,B4:", B3, B4, B1, B2);
        // // console.log("H3:", H3R, H3I);
        // // console.log("H1:", H1R, H1I);
        // console.log(P.theta*180/Math.PI);

        // console.log("numerator: " + EReal.toString() + " , " + EImag.toString() +' , ' + coeffR.toString() + ' , ' + EXPI.toString());
        // console.log("denominator: " + DenR.toString() + " , " + DenI.toString() );
        // console.log("1: " + A1R.toString() + "   2: " + A2R.toString() + "   3: " + A3R.toString() + "   4: " + A7R.toString() + "   5: " + A8R.toString() + "   6: " + A9R.toString() );

        // real = 1;
        // real = 0;
        return [real, imag];
    };

    var delK = PhaseMatch.calc_delK(P);
    var delKx = delK[0],
        delKy = delK[1],
        delKz = delK[2]
        ;

    var arg = P.L/2*(delKz);

    var PMt = 1;
    if (P.calcfibercoupling){
        var dz = 2/P.numz2Dint;
        var pmintz = PhaseMatch.Nintegrate2D_3_8_singles(zintfunc, calcz1terms, -1, 1, -1, 1, P.numz2Dint, P.z2Dweights);
        // var  z1 = 0
        //     ,z2 = 0.5
        // var z1 = 0.5
        //     ,z2 = -0.7
        //     ;
        // var pmintz = zintfunc(z1,z2, calcz1terms(z1));

        // console.log("Int: " + pmintz[0].toString() + ", " + pmintz[1].toString() + ", " + P.z2Dweights.length.toString());
        // var dz = 1;
        // var pmintz = PhaseMatch.Nintegrate2arg(zintfunc,-1, 1,dz,1,P.zweights);
        // PMz_real = pmintz[0]/P.L ;
        // PMz_imag = pmintz[1]/P.L ;
        PMz_real = pmintz[0]/2;
        PMz_imag = pmintz[1]/2;
        // var coeff = ((omega_s * omega_i)/ (P.n_s * P.n_i));
        var coeff = 1;
        PMz_real = PMz_real * coeff;
        PMz_imag = PMz_imag * coeff;
    }
    else{
        var PMzNorm1 = Math.sin(arg)/arg;
        // var PMz_real =  PMzNorm1 * Math.cos(arg);
        // var PMz_imag = PMzNorm1 * Math.sin(arg);
        PMz_real =  PMzNorm1 ;
        PMz_imag = 0;
        PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));
    }
    // console.log("Inside calculation");
    // console.log("Int: " + PMz_real.toString() + ", " + PMz_imag.toString());

    if (P.use_guassian_approx){
        PMz_real = Math.exp(-0.193*sq(arg));
        PMz_imag = 0;
    }
    PhaseMatch.convertToMeters(P);
    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;

    // console.log("real: " + PMz_real.toString() + " imag: " + PMz_imag.toString());


    return [PMz_real, PMz_imag, PMt];

};


/*
 * Normalization function for the joint spectrums
 */
PhaseMatch.normalize_joint_spectrum = function normalize_joint_spectrum (props){
    // Find the optimum phase matching condition. This will be when delK = 0 and everything is collinear.
    // Need to calculate optimum poling period and crystal angle.
    var P = props.clone();
    P.theta_s = 0;
    P.theta_i = 0;
    P.theta_s_e = 0;
    P.theta_i_e = 0;
    P.update_all_angles();

    if (props.enable_pp){
        P.calc_poling_period();
    }
    else{
        P.auto_calc_Theta();
    }

    var norm = PhaseMatch.phasematch_Int_Phase(P)['phasematch'];
    return norm;

};

/*
 * Normalization function for the joint spectrum of the Singles rate
 */
PhaseMatch.normalize_joint_spectrum_singles = function normalize_joint_spectrum_singles (props){
    // Find the optimum phase matching condition. This will be when delK = 0 and everything is collinear.
    // Need to calculate optimum poling period and crystal angle.
    var P = props.clone();
    P.theta_s = 0;
    P.theta_i = 0;
    P.theta_s_e = 0;
    P.theta_i_e = 0;
    P.update_all_angles();

    if (props.enable_pp){
        P.calc_poling_period();
    }
    else{
        P.auto_calc_Theta();
    }

    var convfromFWHM = Math.sqrt(2) // Use 1/e^2 in intensity.
        ,Wi_SQ = Math.pow(P.W_sx  * convfromFWHM,2) // convert from FWHM to sigma @TODO: Change to P.W_i
        ,PHI_s = 1/Math.cos(P.theta_s_e)
        ;

    //console.log("Wi squared: ", Wi_SQ*PHI_s);

    var norm = PhaseMatch.phasematch_Int_Phase_Singles(P)['phasematch'];//*(Wi_SQ*PHI_s);
    return norm;

};

/*
 * To deal with possible floating point errors, convert from meters to microns before performing the calculations.
 */
PhaseMatch.convertToMicrons = function convertToMicrons (props){
    var  P = props
        // ,mu = 1E6
        ,mu = 1
        ;

    // // P.L = P.L*mu;
    // console.log("Length: " + (P.L * mu).toString());
    P.lambda_p = P.lambda_p * mu;
    P.lambda_s = P.lambda_s * mu;
    P.lambda_i = P.lambda_i * mu;
    P.W = P.W * mu;
    P.p_bw = P.p_bw * mu;
    P.W_sx = P.W_sx * mu;
    P.W_ix = P.W_ix * mu;
    // console.log("P.L about to set");
    P.L = P.L * mu;
    // // console.log("set P.L");
    // P.poling_period = P.poling_period * mu;
    // P.apodization_FWHM = P.apodization_FWHM * mu;

    // P.update_all_angles();
    // P.set_apodization_L();
    // P.set_apodization_coeff();
    // P.set_zint();

    return P;

};

PhaseMatch.convertToMeters = function convertToMeters (props){
    var  P = props
        // ,mu = 1E-6
        ,mu = 1
        ;

    // // P.L = P.L*mu;
    // console.log("Length: " + (P.L * mu).toString());
    P.lambda_p = P.lambda_p * mu;
    P.lambda_s = P.lambda_s * mu;
    P.lambda_i = P.lambda_i * mu;
    P.W = P.W * mu;
    P.p_bw = P.p_bw * mu;
    P.W_sx = P.W_sx * mu;
    P.W_ix = P.W_ix * mu;
    // console.log("P.L about to set");
    P.L = P.L * mu;
    // // console.log("set P.L");
    // P.poling_period = P.poling_period * mu;
    // P.apodization_FWHM = P.apodization_FWHM * mu;

    // P.update_all_angles();
    // P.set_apodization_L();
    // P.set_apodization_coeff();
    // P.set_zint();

    return P;

};

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
        var lambda_sq = sq(lambda);
        // http://www.newlightphotonics.com/bbo-properties.html & Alan Migdall
        var no = Math.sqrt(2.7359 + 0.01878/ (lambda_sq - 0.01822) - 0.01354*lambda_sq);
        var ne = Math.sqrt(2.3753 + 0.01224 / (lambda_sq - 0.01667) - 0.01516*lambda_sq);

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
PhaseMatch.Crystals('KTP-3', {
    name: 'KTP ref 1',
    // info: 'H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)',
    info: 'Includes Franco Wong"s modificatin.  http://dx.doi.org/10.1063/1.1668320, http://www.redoptronics.com/KTP-crystal.html',
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);

        // http://www.redoptronics.com/KTP-crystal.html
        var nx= Math.sqrt(2.10468 + 0.89342*lambda_sq/(lambda_sq-0.04438)-0.01036*lambda_sq);
        var ny;

        if (lambda< 1.2){
            ny= Math.sqrt(2.14559 + 0.87629*lambda_sq/(lambda_sq-0.0485)-0.01173*lambda_sq);
        }
        else {
            ny= Math.sqrt(2.0993 + 0.922683*lambda_sq/(lambda_sq-0.0467695)-0.0138408*lambda_sq);
        }

        var nz= Math.sqrt(1.9446 + 1.3617*lambda_sq/(lambda_sq-0.047)-0.01491* lambda_sq);

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
        var lambda_sq = sq(lambda);
        //Alan Migdal's program
        // var nx = Math.sqrt(3.0740 + 0.0323/(sq(lambda)-0.0316) - 0.01337*sq(lambda) );
        // var ny = Math.sqrt(3.1685 + 0.0373/(sq(lambda)-0.0346) - 0.01750*sq(lambda) );
        // var nz = Math.sqrt(3.6545 + 0.0511/(sq(lambda)-0.0371) - 0.0226*sq(lambda)  );

        //http://www.crystech.com/products/crystals/nlocrystals/BIBO.htm
        // var nx = Math.sqrt(3.0740+0.0323/(sq(lambda)-0.0316)-0.01337*sq(lambda));
        // var ny = Math.sqrt(3.1685+0.0373/(sq(lambda)-0.0346)-0.01750*sq(lambda));
        // var nz = Math.sqrt(3.6545+0.0511/(sq(lambda)-0.0371)-0.0226*sq(lambda));

        // http://www.newlightphotonics.com/bibo-properties.html
        var nx = Math.sqrt(3.0740 + 0.0323/(lambda_sq-0.0316)-0.01337*lambda_sq);
        var ny = Math.sqrt(3.1685 + 0.0373/(lambda_sq-0.0346)-0.01750*lambda_sq);
        var nz = Math.sqrt(3.6545 + 0.0511/(lambda_sq-0.0371)-0.0226*lambda_sq);

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
        var lambda_sq = sq(lambda);
        //Alan Migdal's program & http://www.redoptronics.com/linbo3-crystals.html
        var nx = Math.sqrt( 4.9048 - 0.11768/(0.04750 - lambda_sq) - 0.027169*lambda_sq );
        var ny = nx;
        var nz = Math.sqrt( 4.5820 - 0.099169/(0.044432 - lambda_sq) -  0.021950*lambda_sq );

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

/**
 * LiNbO3 MGO doped indicies.
 */
PhaseMatch.Crystals('LiNB-MgO', {
    name: 'LiNbO3 (5% MgO doped)',
    info: 'Applied Physics B May 2008,Volume 91,Issue 2,pp 343-348',
    type: '',
    cls: '',
    lambda_min: 440*1e-9,
    lambda_max: 4000*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var F = (temp - 24.5)*(temp+570.82);

        // Coefficients for the extraordinary index
        var  a1 = 5.756
            ,a2 = 0.0983
            ,a3 = 0.2020
            ,a4 = 189.32
            ,a5 = 12.52
            ,a6 = 1.32e-2
            ,b1 = 2.86e-6
            ,b2 = 4.7e-8
            ,b3 = 6.113e-8
            ,b4 = 1.516e-4
            ;
        var l2 = lambda*lambda;
        var nz = Math.sqrt( a1 + b1*F + (a2 + b2*F)/(l2 - sq(a3+b3*F)) + (a4+b4*F)/(l2 -sq(a5)) - a6*l2 );

         // Coefficients for the oridnary index
        a1 = 5.653;
        a2 = 0.1185;
        a3 = 0.2091;
        a4 = 89.61;
        a5 = 10.85;
        a6 = 1.97e-2;
        b1 = 7.941e-7;
        b2 = 3.134e-8;
        b3 = -4.641e-9;
        b4 = -2.188e-6;

        var nx = Math.sqrt( a1 + b1*F + (a2 + b2*F)/(l2 - sq(a3+b3*F)) + (a4+b4*F)/(l2 -sq(a5)) - a6*l2 );
        var ny = nx;

        return [nx, ny, nz];
    }
});

/**
 * LiNbO3 indicies.
 */
PhaseMatch.Crystals('KDP-1', {
    name: 'KDP ref 1',
    info: 'http://www.newlightphotonics.com/KDP-crystal.html',
    type: 'Negative Uniaxial',
    cls: 'class_3m',
    lambda_min: 200*1e-9,
    lambda_max: 1500*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);

        //Alan Migdal's program & http://www.redoptronics.com/linbo3-crystals.html
        // var nx = Math.sqrt( 4.9048 - 0.11768/(0.04750 - sq(lambda)) - 0.027169*sq(lambda) );
        var nx = Math.sqrt(2.259276 + 13.005522 * lambda_sq/(lambda_sq - 400)+0.01008956/(lambda_sq - 0.012942625));
        var ny = nx;
        // var nz = Math.sqrt( 4.5820 - 0.099169/(0.044432 - lambda_sq) -  0.021950*lambda_sq );
        var nz = Math.sqrt(2.132668 +3.2279924 * lambda_sq/(lambda_sq - 400) + 0.008637494/(lambda_sq- 0.012281043));

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


/**
 * AGGaSe2
 */
PhaseMatch.Crystals('AgGaSe2-1', {
    name: 'AgGaSe2 Ref 1',
    info: 'H. Kildal, J. Mikkelsen, Opt. Commun. 9, 315 (1973)',
    type: '',
    cls: '',
    lambda_min: 1000*1e-9,
    lambda_max: 13500*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

        var  nx = Math.sqrt(3.9362 + 2.9113/(1-sq(0.38821/lambda)) + 1.7954/ (1-sq(40/lambda)) )
            ,ny = nx
            ,nz = Math.sqrt(3.3132 + 3.3616/(1-sq(0.38201/lambda)) + 1.7677/ (1-sq(40/lambda)) )
            ;


        // http://www.redoptronics.com/AgGaS2-AgGaSe2.html
        var  dnx = 15e-5
            ,dny = dnx
            ,dnz = 15e-5
            ;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;
        return [nx, ny, nz];
    }
});


/**
 * AGGaSe2
 */
PhaseMatch.Crystals('AgGaSe2-2', {
    name: 'AgGaSe2 Ref 2',
    info: 'G. C. Bhar, Appl. Opt., 15, 305 (1976)',
    type: '',
    cls: '',
    lambda_min: 1000*1e-9,
    lambda_max: 13500*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

        var  nx = Math.sqrt(4.6453 + 2.2057/(1-sq(0.43347/lambda)) + 1.8377/ (1-sq(40/lambda)) )
            ,ny = nx
            ,nz = Math.sqrt(5.2912 + 1.3970/(1-sq(0.53339/lambda)) + 1.9282/ (1-sq(40/lambda)) )
            ;


        // Got temperature coefficients fro:
        // http://www.redoptronics.com/AgGaS2-AgGaSe2.html
        var  dnx = 15e-5
            ,dny = dnx
            ,dnz = 15e-5
            ;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;
        return [nx, ny, nz];
    }
});

/**
 * AgGaS2
 */
PhaseMatch.Crystals('AgGaS2-1', {
    name: 'AgGaS2 Ref 1',
    info: 'G. C. Bhar, Appl. Opt., 15, 305 (1976)',
    type: '',
    cls: '',
    lambda_min: 500*1e-9,
    lambda_max: 13000*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);

        var  nx = Math.sqrt(3.628 + 2.1686*lambda_sq/(lambda_sq-0.1003) + 2.1753*lambda_sq/ (lambda_sq-950) )
            ,ny = nx
            ,nz =Math.sqrt(4.0172 + 1.5274*lambda_sq/(lambda_sq-0.131) + 2.1699*lambda_sq/ (lambda_sq-950) )
            ;


        // Got temperature coefficients fro:
        // http://www.redoptronics.com/AgGaS2-AgGaSe2.html
        var  dnx = 15.4e-5
            ,dny = dnx
            ,dnz = 15.5e-5;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;
        return [nx, ny, nz];
    }
});

/**
 * LiIO3 ref 1
 */
PhaseMatch.Crystals('LiIO3-1', {
    name: 'LiIO3 Ref 1',
    info: 'B. F. Levine, C. G. Bethea: Appl. Phys. Lett. 20, 272 (1972)',
    type: 'Negative Uniaxial',
    cls: 'Class 6',
    lambda_min: 300*1e-9,
    lambda_max: 5000*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);

        var  nx = Math.sqrt(2.03132 + 1.37623/(1 - (0.0350832/lambda_sq)) + 1.06745/ (1 - (169/lambda_sq)) )
            ,ny = nx
            ,nz =Math.sqrt( 1.83086 + 1.08807/(1.0 - (0.031381 / lambda_sq)) + 0.554582/(1.0 - (158.76/lambda_sq)) )
            ;
        return [nx, ny, nz];
    }
});

/**
 * LiIO3 ref 2
 */
PhaseMatch.Crystals('LiIO3-2', {
    name: 'LiIO3 Ref 2',
    info: 'K. Takizawa, M. Okada, S. Leiri, Opt. Commun., 23, 279 (1977)',
    type: 'Negative Uniaxial',
    cls: 'Class 6',
    lambda_min: 300*1e-9,
    lambda_max: 5000*1e-9,
    indicies: function(lambda, temp){
        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
        var lambda_sq = sq(lambda);

        var  nx = Math.sqrt(3.4095 + 0.047664/(lambda_sq - 0.033991) )
            ,ny = nx
            ,nz = Math.sqrt(2.9163 + 0.034514/(lambda_sq - 0.031034) )
            ;
        return [nx, ny, nz];
    }
});

(function(){

    // These are the names associated with the types
    // The "type" property is stored as an integer
    PhaseMatch.PMTypes = [
        "Type 0:   o -> o + o",
        "Type 0:   e -> e + e",
        "Type 1:   e -> o + o",
        "Type 2:   e -> e + o",
        "Type 2:   e -> o + e"
    ];

    PhaseMatch.apodization_L = [];
    PhaseMatch.apodization_coeff = [];
    // PhaseMatch.zweights = [];

    var con = PhaseMatch.constants;
    var spdcDefaults = {
        lambda_p: 785 * con.nm,
        lambda_s: 1570 * con.nm,
        lambda_i: 1570 * 785 * con.nm / ( 1570 -  785 ),
        type: "Type 2:   e -> e + o",
        theta: 90 *Math.PI / 180,
        phi: 0,
        theta_s: 0,
        theta_i: 0,
        theta_s_e: 0 *Math.PI / 180,
        theta_i_e: 0,
        phi_s: 0,
        phi_i: Math.PI ,
        L: 2000 * con.um,
        W: 100 * con.um,
        p_bw: 5.35 * con.nm,
        walkoff_p: 0,
        // W_sx: .2 * Math.PI/180,
        W_sx: 100 * con.um,
        W_sy: 100 * con.um,
        W_ix: 100 * con.um,
        // W_ix: 100 * con.um,
        phase: false,
        brute_force: false,
        brute_dim: 50,
        autocalctheta: false,
        autocalcpp: true,
        poling_period: 1000000,
        poling_sign: 1,
        calc_apodization: false,
        apodization: 30,
        apodization_FWHM: 1600 * con.um,
        use_guassian_approx: false,
        crystal: PhaseMatch.Crystals('KTP-3'),
        temp: 20,
        enable_pp: true,
        calcfibercoupling: true,
        singles: false,
        z0s: -2000/2 * con.um,
        z0: 2000/2 * con.um
    };

    var spdcDefaultKeys = PhaseMatch.util.keys( spdcDefaults );

    // deep copy callback to extend deeper into object
    var cloneCallback = function( a, b ){

        var type = typeof b;

        if ( type === 'object' || type === 'array' ){

            return PhaseMatch.util.clone( b, true );
        }

        return b !== undefined ? b : a;
    };

    /**
     * SPDCprop
     */
    var SPDCprop = function( cfg ){
        this.init( cfg );
    };

    SPDCprop.prototype = {

        init: function( cfg ){

            // set properties or fall back to defaults
            this.set( PhaseMatch.util.extend({}, spdcDefaults, cfg) );
            this.update_all_angles();

            // Find internal angles for signal and idler
            this.theta_s = PhaseMatch.find_internal_angle(this, "signal");
            this.theta_i = PhaseMatch.find_internal_angle(this, "idler");
            // console.log("Angle diff at beginning: ", (this.theta_s - this.theta_i)*180/Math.PI);
            // this.theta_s = 0;

            // //Other functions that do not need to be included in the default init
            // this.S_p = this.calc_Coordinate_Transform(this.theta, this.phi, 0, 0);
            // this.S_s = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_s, this.phi_s);
            // this.S_i = this.calc_Coordinate_Transform(this.theta, this.phi, this.theta_i, this.phi_i);

            // this.n_p = this.calc_Index_PMType(this.lambda_p, this.type, this.S_p, "pump");
            // this.n_s = this.calc_Index_PMType(this.lambda_s, this.type, this.S_s, "signal");
            // this.n_i = this.calc_Index_PMType(this.lambda_i, this.type, this.S_i, "idler");

            // this.optimum_idler();
            this.update_all_angles();

            // set the external angle of the idler
            // this.theta_i_e = PhaseMatch.find_external_angle(this, "idler");
            // console.log("From init external angle is: ", this.theta_i_e *180/Math.PI, this.theta_s_e *180/Math.PI, this.theta_i *180/Math.PI, this.theta_s *180/Math.PI);

            //set the apodization length and Gaussian profile
            this.set_apodization_L();
            this.set_apodization_coeff();

            // this.numzint = 16;
            // this.zweights = PhaseMatch.NintegrateWeights(this.numzint);

            this.set_zint();

            // this.auto_calc_Theta();
            // this.theta_s = 8.624324930009333* Math.PI/180;
            if (this.autocalctheta){
                this.auto_calc_Theta();
            }

            // Set the positions of the signal, idler, pump waists
            this.z0p = 0;
            // this.z0s = -1*this.L/2;
            this.z0i = this.z0s;

            // console.log(this.zweights);

        },

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
            // console.log(PhaseMatch.PMTypes[0]);
            var ind = this.crystal.indicies(lambda, this.temp); //can I move this out to speed it up?

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

            // var phit= this.phi*180/Math.PI;

            var n = 1;

            switch (Type){
                case PhaseMatch.PMTypes[0]:
                    n = nfast;
                break;
                case PhaseMatch.PMTypes[1]:
                    n= nslow;
                break;
                case PhaseMatch.PMTypes[2]:
                    if (photon === "pump") { n = nslow;}
                    else { n = nfast;}
                break;
                case PhaseMatch.PMTypes[3]:
                    if (photon === "idler") { n = nfast;}
                    else {n = nslow;}
                break;
                case PhaseMatch.PMTypes[4]:
                    if (photon === "signal") { n = nfast;}
                    else {n = nslow;}
                break;
                default:
                    throw "Error: bad PMType specified";
            }

            return n ;
        },

        update_all_angles : function (){
            var props = this;
            // console.log("old pump index", props.n_p);

            props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
            props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);

            props.n_p = props.calc_Index_PMType(props.lambda_p, props.type, props.S_p, "pump");
            props.n_s = props.calc_Index_PMType(props.lambda_s, props.type, props.S_s, "signal");
            // console.log("new pump index", props.n_p);

            props.optimum_idler();
            // set the external idler angle
            props.theta_i_e = PhaseMatch.find_external_angle(props,"idler");
            // props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);
            // props.n_i = props.calc_Index_PMType(props.lambda_i, props.type, props.S_i, "idler");
            // console.log(props.n_s, props.n_s, props.n_i);
            // props.calc_walkoff_angles();
        },

        get_group_velocity : function(lambda, Type, S, photon){
            // var props = this;
            var con = PhaseMatch.constants;
            var bw = 1e-11;
            // var P = props.clone();

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
                props.theta_s = PhaseMatch.find_internal_angle(props, "signal");
                props.update_all_angles(props);
                var delK =  PhaseMatch.calc_delK(props);
                // Returning all 3 delK components can lead to errors in the search
                // return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
                return Math.sqrt(sq(delK[2]) );
            };

            var guess = Math.PI/6;
            var startTime = new Date();
            // var theta_s = props.theta_s;
            // var theta_s_e = props.theta_s_e;
            // props.theta_s_e = theta_s_e +0.01;
            // PhaseMatch.find_internal_angle(props, "signal");
            // props.theta_s = theta_s + 0.01;
            var ans = PhaseMatch.nelderMead(min_delK, guess, 30);
            // props.theta = ans;
            // props.theta_s_e = theta_s_e;
            // PhaseMatch.find_internal_angle(props, "signal");
            // props.theta_s = theta_s;
            // Run again wiht better initial conditions based on previous optimization
            ans = PhaseMatch.nelderMead(min_delK, ans, 30);
            var endTime = new Date();


            var timeDiff = (endTime - startTime)/1000;
            // console.log("Theta autocalc = ", timeDiff, ans);
            // props.theta = ans;
            // console.log("After autocalc: ", props.theta_i * 180/Math.PI);
            props.update_all_angles(props);

            // props.calcfibercoupling = fiber;
            // calculate the walkoff angle
            this.calc_walkoff_angles();
            // console.log("Walkoff:", this.walkoff_p*180/Math.PI);
        },


        calc_poling_period : function (){
            var props = this;
            this.lambda_i = 1/(1/this.lambda_p - 1/this.lambda_s);
            props.poling_period = Math.pow(2,30);  // Set this to a large number
            props.update_all_angles(props);
            if (props.enable_pp){
                var P = props.clone();

                var find_pp = function(x){
                    // if (x<0){ return 1e12;}  // arbitrary large number
                    P.poling_period = x;
                    // Calculate the angle for the idler photon
                    P.optimum_idler();
                    var delK = PhaseMatch.calc_delK(P);
                    return Math.sqrt(sq(delK[2]) );
                    // return Math.sqrt(sq(delK[2]) +sq(delK[0])+ sq(delK[1]));
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
                //console.log("calculation time for periodic poling calc", endTime - startTime, props.poling_period);

                props.poling_period = P.poling_period;
                props.poling_sign = P.poling_sign;
                props.calc_walkoff_angles();
            }
        },

        optimum_idler : function (){
            var P = this;

            var delKpp = P.lambda_s/(P.poling_period*P.poling_sign);

            P.phi_i = P.phi_s + Math.PI;

            var arg = sq(P.n_s) + sq(P.n_p*P.lambda_s/P.lambda_p);
            arg += -2*P.n_s*P.n_p*(P.lambda_s/P.lambda_p)*Math.cos(P.theta_s) - 2*P.n_p*P.lambda_s/P.lambda_p*delKpp;
            arg += 2*P.n_s*Math.cos(P.theta_s)*delKpp + sq(delKpp);
            arg = Math.sqrt(arg);

            var arg2 = P.n_s*Math.sin(P.theta_s)/arg;

            var theta_i = Math.asin(arg2);

            // Test without the PP

            // arg = sq(P.n_s) + sq(P.n_p*P.lambda_s/P.lambda_p);
            // arg += -2*P.n_s*P.n_p*(P.lambda_s/P.lambda_p)*Math.cos(P.theta_s);
            // arg = Math.sqrt(arg);
            // arg2 = P.n_s*Math.sin(P.theta_s)/arg;
            // theta_i = Math.asin(arg2);


            // return theta_i;

            P.theta_i = theta_i;
            //Update the index of refraction for the idler
            P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");
            // console.log("External angle of the idler is:", PhaseMatch.find_external_angle(P,"idler")*180/Math.PI );
            // P.theta_i_e = PhaseMatch.find_external_angle(P,"idler");
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
            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        },

        brute_force_theta_i : function (){
            var props = this;

            var min_PM = function(x){
                if (x>Math.PI/2 || x<0){return 1e12;}
                props.theta_i = x;

                props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);
                props.n_i = props.calc_Index_PMType(props.lambda_i, props.type, props.S_i, "idler");

                var PMtmp =  PhaseMatch.phasematch_Int_Phase(props);
                return 1-PMtmp[0];
            };

            //Initial guess
            props.optimum_idler();
            var guess = props.theta_i;
            // var startTime = new Date();

            var ans = PhaseMatch.nelderMead(min_PM, guess, 25);
        },

        brute_force_theta_s : function (){
            var props = this;

            var min_PM = function(x){
                if (x>Math.PI/2 || x<0){return 1e12;}
                props.theta_s = x;

                props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);
                props.n_s = props.calc_Index_PMType(props.lambda_s, props.type, props.S_s, "signal");

                var PMtmp =  PhaseMatch.phasematch_Int_Phase(props);
                return 1-PMtmp[0];
            };

            //Initial guess
            props.optimum_signal();
            var guess = props.theta_s;

            var ans = PhaseMatch.nelderMead(min_PM, guess, 25);
        },


        set_apodization_L : function (){
            this.apodization_L = PhaseMatch.linspace(-this.L/2,this.L/2,this.apodization+1);
        },

        set_apodization_coeff : function (){
            // var bw = this.apodization_FWHM /(2 * Math.sqrt(2*Math.log(2))); //convert from FWHM
            var bw = this.apodization_FWHM  / 2.3548;
            var dim = this.apodization_L.length;
            this.apodization_coeff = [];
            var delL = Math.abs(this.apodization_L[0] - this.apodization_L[1]);
            for (var i=0; i<dim; i++){
                this.apodization_coeff[i] =  Math.exp(-sq((this.apodization_L[i] )/(bw))/2);
            }

            var total = PhaseMatch.Sum(this.apodization_coeff);

            //normalize
            // for (i=0; i<dim; i++){
            //     this.apodization_coeff[i] = this.apodization_coeff[i]/total;
            // }

        },

        set_zint : function (){
            var zslice = 100e-6; //length of each crystal slice
            var nslices = Math.round(this.L/zslice);
            if (nslices < 4){
                nslices = 4;
            }

            if (nslices>30){
                nslices = 30;
            }
            nslices =nslices*1;
            if (nslices%2 !== 0){
                nslices +=1;
            }
            this.numzint = nslices;
            // this.numzint = 10;

            this.zweights = PhaseMatch.NintegrateWeights(this.numzint);
            var n = this.numzint;
            // var n = 3;
            n = n+(3- n%3); //guarantee that n is divisible by 3
            this.z2Dweights = PhaseMatch.Nintegrate2DWeights_3_8(n);
            this.numz2Dint = n;
            // console.log(nslices);
        },


         calc_walkoff_angles: function(){
            // Calculate the pump walkoff angle
            var P = this;
            var ne_p = this.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");
            var origin_theta = P.theta;

            //calculate the derivative
            var deltheta = 0.1*Math.PI/180;

            var theta = P.theta - deltheta/2;
            this.S_p = this.calc_Coordinate_Transform(theta,this.phi, this.theta_s, this.theta_i);
            var ne1_p = this.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

            theta = theta + deltheta;
            this.S_p = this.calc_Coordinate_Transform(theta,this.phi, this.theta_s, this.theta_i);
            var ne2_p = this.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

            //set back to original theta
            theta = origin_theta;
            this.S_p = this.calc_Coordinate_Transform(theta,this.phi, this.theta_s, this.theta_i);

            this.walkoff_p = -1/ne_p *(ne1_p - ne2_p)/deltheta;
            // console.log("Walkoff:", this.walkoff_p*180/Math.PI);
            // this.walkoff_p = 0;
         },

          swap_signal_idler: function(){
            // Swap role of signal and idler. Useful for calculating Idler properties
            // this.update_all_angles();
            // @ToDO: Do not swap the role of the signal/idler waists. In the code the idler waist
            // is always set to be 100 um and is never updated to be equal to the signal waist until
            // the actual phasematching function is called. Therefore switching the waists will yield
            // the wrong result here. Need to fix this if we ever decide to handle asymmetric coupling
            // geometries where the signal and idler can have different waists.
            var P = this
                ,tempLambda = P.lambda_s
                ,tempTheta = P.theta_s
                ,tempPhis = P.phi_s
                ,tempNs = P.n_s
                ,tempSs = P.S_s
                // ,tempW_sx = P.W_sx
                // ,tempW_sy = P.W_sy
                ,tempTheta_se = P.theta_s_e
                ;

                // Swap signal with Idler
                P.lambda_s = P.lambda_i;
                P.theta_s = P.theta_i;
                P.phi_s = P.phi_i;
                P.n_s = P.n_i;
                P.S_s = P.S_i;
                // P.W_sx = P.W_ix;
                // P.W_sy = P.W_iy;
                // console.log("Theta external before swap: ", P.theta_s_e * 180/Math.PI);
                // P.theta_s_e = PhaseMatch.find_external_angle(P, "signal");
                P.theta_s_e = P.theta_i_e;
                // console.log("Theta external after swap: ", P.theta_s_e * 180/Math.PI);
                // console.log("");


                // Now replace Idler values with Signal values
                P.lambda_i = tempLambda;
                P.theta_i = tempTheta;
                P.phi_i = tempPhis;
                P.n_i = tempNs;
                P.S_i = tempSs;
                // P.W_ix = tempW_sx;
                // P.W_iy = tempW_sy;
                P.theta_i_e = tempTheta_se;

                // Is this the right thing to do? Do I need to do this?
                // Change the phasematching type if it is type II
                if (P.type ===  "Type 2:   e -> e + o"){
                    // console.log("switching");
                    P.type =  "Type 2:   e -> o + e";
                }
                 else if (P.type ===  "Type 2:   e -> o + e"){
                    // console.log("other way");
                    P.type = "Type 2:   e -> e + o";
                }

                // P.update_all_angles();
         },

        /**
         * Set config value or many values that are allowed (ie: defined in spdcDefaults )
         * @param {String|Object} name The key name to set, or a config object with key: value pairs
         * @param {Mixed} val  The value to set
         */
        set: function( name, val ){

            if ( typeof name === 'object' ){

                PhaseMatch.util.each( name, function(val, name){this.set(name, val);}, this );
                return this;

            } else {

                // set the value
                if ( name in spdcDefaults ){

                    if ( name === 'type' ){

                        val = val;

                    } else if ( name === 'crystal' && typeof val !== 'object' ){

                        val = PhaseMatch.Crystals( val );
                        // this.calc_walkoff_angles();
                    }

                    if (name === 'poling_period'){
                        if (val===0 || isNaN(val)){
                            val = Math.pow(2,30);
                        }
                    }

                    if (name === 'apodization'){
                        if (val < 31){
                            val = 31;
                        }
                        // val = 25;
                    }

                    // if (name === 'poling_period'){
                    //     if (isNaN(val)){
                    //         val = Math.pow(2,30);
                    //     }
                    // }

                    if (name === 'z0'){
                        // Match the idler waist position to that of the signal
                        this.z0s = val - this.L;
                        this.z0i = val - this.L;
                    }

                    this[ name ] = val;


                    if (name === 'apodization' || name === 'apodization_FWHM' || name === 'L'){//} || name = 'calc_apodization')){
                        if (isNaN(this["apodization"]) || isNaN(this["apodization_FWHM"])  || isNaN(this["L"])){
                            return;
                        }
                        this.set_apodization_L();
                        this.set_apodization_coeff();
                    }

                    // if (name === "L"){
                    //     this.set_zint();
                    // }



                    // if (name === 'L'){
                    //     this.set
                    // }



                }
            }

            // @TODO: add logic for refreshing autocalc values?

            // for chaining calls
            return this;
        },

        /**
         * Gets all, or single property
         * @param {String} key (optional) key name of single property to return
         * @return {Mixed} Property value (if specified) or object containing all setable properties
         */
        get: function( key ){

            if ( key ){

                return (key in spdcDefaults) ? PhaseMatch.util.clone(this[ key ], true) : undefined;
            }

            var vals = PhaseMatch.util.clone( PhaseMatch.util.pick( this, spdcDefaultKeys ), true );
            vals.crystal = vals.crystal.id;
            return vals;
        },

        /**
         * Create a clone of self
         * @return {SPDCprop} The cloned properties object
         */
        clone: function(){

            var clone = Object.create( SPDCprop.prototype );

            PhaseMatch.util.extend( clone, this, cloneCallback );

            return clone;
        }
    };

    PhaseMatch.SPDCprop = SPDCprop;

})();

PhaseMatch.calc_JSA = function calc_JSA(props, ls_start, ls_stop, li_start, li_stop, dim){

    props.update_all_angles();
    // // console.log(props.lambda_i/1e-9, props.lambda_s/1e-9, props.theta_s*180/Math.PI, props.theta_i*180/Math.PI);
    var P = props.clone();
    // // console.log(P.theta_i*180/Math.PI, P.phi_i*180/Math.PI);
    // P.theta_i = 0.6*Math.PI/180;
    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    P.optimum_idler(P);

    // P.S_p = P.calc_Coordinate_Transform(P.theta, P.phi, 0, 0);
    // P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");


    var todeg = 180/Math.PI;
    // // console.log(P.phi_i*todeg, P.phi_s*todeg);
    // P.theta_i = P.theta_s;
    // var centerpm = PhaseMatch.phasematch(P);
    // // console.log(sq(centerpm[0]) + sq(centerpm[1]));


    var i;
    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

    var N = dim * dim;
    var PMreal = new Float64Array( N );
    var PMimag = new Float64Array( N );

    var maxpm = 0;

    // calculate normalization
    var PMN = PhaseMatch.phasematch(P);
    var norm = Math.sqrt(sq(PMN[0]) + sq(PMN[1]));


    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.lambda_i = lambda_i[index_i];

        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

        var PM = PhaseMatch.phasematch(P);
        PMreal[i] = PM[0]/norm;
        PMimag[i] = PM[1]/norm;
        // C_check = PM[2];
        // if (PM[i]>maxpm){maxpm = PM[i];}
    }



    // // console.log("Approx Check, ", C_check);
    return [PMreal, PMimag];

};


PhaseMatch.calc_JSI = function calc_JSI(props, ls_start, ls_stop, li_start, li_stop, dim){
    var N = dim * dim;

    var JSI = new Float64Array( N );

    var JSA = PhaseMatch.calc_JSA(props, ls_start, ls_stop, li_start, li_stop, dim);

    for (var i=0; i<N; i++){

        JSI[i] = sq(JSA[0][i]) + sq(JSA[1][i]);
    }
    JSI = PhaseMatch.normalize(JSI);
    return JSI;

};

PhaseMatch.calc_JSA_p = function calc_JSA_p(props, lambda_s,lambda_i, dim, norm){
    // norm = 1;
    props.update_all_angles();
    // // console.log(props.lambda_i/1e-9, props.lambda_s/1e-9, props.theta_s*180/Math.PI, props.theta_i*180/Math.PI);
    var P = props.clone();
    // // console.log(P.theta_i*180/Math.PI, P.phi_i*180/Math.PI);
    // P.theta_i = 0.6*Math.PI/180;
    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    P.optimum_idler(P);

    // P = PhaseMatch.convertToMicrons(P);

    // P.S_p = P.calc_Coordinate_Transform(P.theta, P.phi, 0, 0);
    // P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");


    var todeg = 180/Math.PI;

    // // console.log("Inside JSA_p:  Theta_s: " + (P.theta_s*todeg).toString() + ", Theta_i: " + (P.theta_i*todeg).toString() );
    // // console.log(P.phi_i*todeg, P.phi_s*todeg);
    // P.theta_i = P.theta_s;
    // var centerpm = PhaseMatch.phasematch(P);
    // // console.log(sq(centerpm[0]) + sq(centerpm[1]));


    var i;
    // var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
    // var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

    var N = lambda_s.length * (lambda_i.length);
    var PMreal = new Float64Array( N );
    var PMimag = new Float64Array( N );

    var maxpm = 0;

    // calculate normalization
    // var PMN = PhaseMatch.phasematch(P);
    // var norm = Math.sqrt(sq(PMN[0]) + sq(PMN[1]));


    for (var j=0; j<lambda_i.length; j++){
        for (i=0; i<lambda_s.length; i++){
            var index_s = i;
            var index_i = j;

            P.lambda_s = lambda_s[index_s];
            P.lambda_i = lambda_i[index_i];

            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

            // P.lambda_s = P.lambda_s *1E6;
            // P.lambda_i = P.lambda_i *1E6;

            var PM = PhaseMatch.phasematch(P);
            PMreal[i + lambda_s.length*j] = PM[0]/norm;
            PMimag[i + lambda_s.length*j] = PM[1]/norm;
        }
    }


    // // console.log("JSA coinc Max: " + PhaseMatch.max(PMreal).toString());
    // // console.log("Approx Check, ", C_check);
    return [PMreal, PMimag];

};



PhaseMatch.calc_JSI_p = function calc_JSI_p(props, lambda_s, lambda_i, dim, norm){
    var N = lambda_s.length * (lambda_i.length);
    var JSI = new Float64Array( N );
    var JSA = PhaseMatch.calc_JSA_p(props, lambda_s,lambda_i, dim, norm);

    for (var i=0; i<N; i++){

        JSI[i] = sq(JSA[0][i]) + sq(JSA[1][i]);
    }
    // JSI = PhaseMatch.normalize(JSI);

    return JSI;

};

PhaseMatch.calc_JSI_Singles_p = function calc_JSI_Singles_p(props, lambda_s,lambda_i, dim, norm){

    props.update_all_angles();
    // // console.log(props.lambda_i/1e-9, props.lambda_s/1e-9, props.theta_s*180/Math.PI, props.theta_i*180/Math.PI);
    var P = props.clone();
    // // console.log(P.theta_i*180/Math.PI, P.phi_i*180/Math.PI);
    // P.theta_i = 0.6*Math.PI/180;
    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    P.optimum_idler(P);


    var todeg = 180/Math.PI;


    var i;
    var N = lambda_s.length * (lambda_i.length);
    var PMreal_s = new Float64Array( N );
    var PMimag_s = new Float64Array( N );
    var PMmag_s = new Float64Array( N );

    var PMreal_i = new Float64Array( N );
    var PMimag_i = new Float64Array( N );
    var PMmag_i = new Float64Array( N );


    var maxpm = 0;

    var  Ws_SQ = Math.pow(P.W_sx,2) // convert from FWHM to sigma @TODO: Change to P.W_i
        ,PHI_s = 1/Math.cos(P.theta_s_e)
        ,PHI_i = 1/Math.cos(P.theta_i_e)
        ,con = PhaseMatch.constants
        ,twoPIc = 2*Math.PI*con.c
        ,omega_s = twoPIc / (P.lambda_s )
        ,omega_i = twoPIc / (P.lambda_i )
        ,hs = Math.tan(P.theta_s)*P.L*0.5 *Math.cos(P.phi_s)
        ,hi = Math.tan(P.theta_i)*P.L*0.5 * Math.cos(P.phi_i)
        ,Ws_r = Ws_SQ
        // ,Ws_i = -2/(omega_s/con.c) * (P.z0s + hs * Math.sin(P.theta_s_e) )
        ,Ws_i = 0
        ,absWs_sq = Math.sqrt(Ws_r*Ws_r + Ws_i*Ws_i)
        ,Wi_r = Ws_SQ
        // ,Wi_i = -2/(omega_i/con.c) * (P.z0i + hi * Math.sin(P.theta_i_e) )
        ,Wi_i = 0
        ,absWi_sq = Math.sqrt(Wi_r*Wi_r + Wi_i*Wi_i)
        ,scale_s = (absWs_sq * PHI_s)
        ,scale_i =(absWi_sq * PHI_i) //assume symmetric coupling geometry
        ;

    // calculate normalization
    // var PMN = PhaseMatch.phasematch(P);
    // var norm = Math.sqrt(sq(PMN[0]) + sq(PMN[1]));


    for (var j=0; j<lambda_i.length; j++){
        for (i=0; i<lambda_s.length; i++){
            var index_s = i;
            var index_i = j;

            P.lambda_s = lambda_s[index_s];
            P.lambda_i = lambda_i[index_i];

            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

            // var P_i = P.clone();
            var PM = PhaseMatch.phasematch_singles(P);
            PMreal_s[i + lambda_s.length*j] = ( PM[0]/norm ) ;
            PMimag_s[i + lambda_s.length*j] = ( PM[1]/norm ) ;
            PMmag_s[i + lambda_s.length*j] = (Math.sqrt(sq(PMreal_s[i + lambda_s.length*j]) + sq(PMimag_s[i + lambda_s.length*j]))) /scale_s;

            // Now calculate the Idler JSI
            // The role of the signal and idler get swapped in the calculation
            // but the signal and idler wavelengths and other properties stay the same
            // so there is no need to transpose the PMmag_i array.
            P.swap_signal_idler();
            var PM_i = PhaseMatch.phasematch_singles(P);
            P.swap_signal_idler();
            PMreal_i[i + lambda_s.length*j] = ( PM_i[0]/norm );
            PMimag_i[i + lambda_s.length*j] = ( PM_i[1]/norm );
            PMmag_i[i + lambda_s.length*j] = (Math.sqrt(sq(PMreal_i[i + lambda_s.length*j]) + sq(PMimag_i[i + lambda_s.length*j]))) /scale_i;


        }
    }

    // // console.log("Approx Check, ", C_check);
    // return [PMreal, PMimag];
    // // console.log(PMmag_i.toString());
    return [PMmag_s, PMmag_i];

};

/* This plots the phasematching curve for the signal/idler vs the pump wavelength. It is simialar to the JSA calcualtion.
*
*
*/
PhaseMatch.calc_PM_Curves = function calc_PM_Curves(props, l_start, l_stop, lp_start, lp_stop, type, dim){

    props.update_all_angles();
    var P = props.clone();

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var i;
    var lambda_p = PhaseMatch.linspace(lp_start, lp_stop, dim);
    // lambda_s is either the signal or idler wavelength
    var lambda_s = PhaseMatch.linspace(l_stop, l_start, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );

    if (type === 'signal'){
        for (i=0; i<N; i++){
            var index_p = i % dim;
            var index_s = Math.floor(i / dim);

            P.lambda_s = lambda_s[index_s];
            P.lambda_p = lambda_p[index_p];
            P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);

            // P.S_p = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_p, P.phi_p);
            // P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
            // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);

            P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");
            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

            PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
        }
    }
    // // console.log(P.lambda_p, P.lambda_s, P.lambda_i);

    return PM;

};


/* The crystal theta vs signal wavelength. Somewhat redundant.
*/
PhaseMatch.calc_PM_Crystal_Tilt = function calc_PM_Crystal_Tilt(props, ls_start, ls_stop, theta_start, theta_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    // if (P.brute_force){
    //     dim = P.brute_dim;
    // }

    var i;
    // lambda_s is either the signal or idler wavelength
    var lambda_s = PhaseMatch.linspace(ls_stop, ls_start, dim);
    // internal angle of the optic axis wrt to the pump direction.
    var theta = PhaseMatch.linspace(theta_start, theta_stop, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );


    for (i=0; i<N; i++){
        var index_theta = i % dim;
        var index_s = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.theta = theta[index_theta];
        P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);

        //crystal has changed angle, so update all angles and indices
        P.update_all_angles();

        PM[i] = "phasematch";
    }

    return PM;

};

/* This plots the phasematching curve for crystal theta and phi.
*/
PhaseMatch.calc_PM_Pump_Theta_Phi = function calc_PM_Pump_Theta_Phi(props, theta_start, theta_stop, phi_start, phi_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    // if (P.brute_force){
    //     dim = P.brute_dim;
    // }

    var i;
    var theta = PhaseMatch.linspace(theta_start, theta_stop, dim);
    var phi = PhaseMatch.linspace(phi_stop, phi_start, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );


    for (i=0; i<N; i++){
        var index_theta = i % dim;
        var index_phi = Math.floor(i / dim);

        P.theta = theta[index_theta];
        P.phi = phi[index_phi];

        //crystal has changed angle, so update all angles and indices
        P.update_all_angles();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
        // if (isNaN(PM[i])){
        //     // // console.log("theta", P.theta*180/Math.PI, P.phi*180/Math.PI);
        // }

    }
    return PM;
};

/* This plots the phasematching curve for Poling Period vs crystal theta.
*/
PhaseMatch.calc_PM_Pump_Theta_Poling = function calc_PM_Pump_Theta_Poling(props, poling_start, poling_stop, theta_start, theta_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    // if (P.brute_force){
    //     dim = P.brute_dim;
    // }

    var i;
    var poling = PhaseMatch.linspace(poling_start, poling_stop, dim);
    var theta = PhaseMatch.linspace(theta_stop, theta_start, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );


    for (i=0; i<N; i++){
        var index_poling = i % dim;
        var index_theta = Math.floor(i / dim);

        P.poling_period = poling[index_poling];
        P.theta = theta[index_theta];

        //crystal has changed angle, so update all angles and indices
        P.update_all_angles();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
    }
    return PM;
};

// /* Plot the indicies of refraction of the signal, idler, and pump
// */
// PhaseMatch.calc_indicies = function calc_indicies(props, dim){

//     props.update_all_angles();
//     var P = props.clone();

//     // if (P.brute_force){
//     //     dim = P.brute_dim;
//     // }

//     var i;
//     var poling = PhaseMatch.linspace(poling_start, poling_stop, dim);
//     var theta = PhaseMatch.linspace(theta_stop, theta_start, dim);

//     var N = dim * dim;
//     var PM = new Float64Array( N );


//     for (i=0; i<N; i++){
//         var index_poling = i % dim;
//         var index_theta = Math.floor(i / dim);

//         P.poling_period = poling[index_poling];
//         P.theta = theta[index_theta];

//         //crystal has changed angle, so update all angles and indices
//         P.update_all_angles();

//         PM[i] = PhaseMatch.phasematch_Int_Phase(P);
//     }
//     return PM;
// };


PhaseMatch.calc_XY = function calc_XY(props, x_start, x_stop, y_start, y_stop, dim){
    // // console.log('inside calc_xy',props.phi*180/Math.PI);
    props.update_all_angles();
    var P = props.clone();
    P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);
    // // console.log(P.lambda_i);
    // P.update_all_angles();
    // // console.log(P);
    // // console.log('After clone',props.phi*180/Math.PI);

    P.phi_i = (P.phi_s + Math.PI);
    P.brute_force = true;
    if (P.brute_force){
        // Check to see if the Rayleigh range is shorter than the crystal.
        // If so, set the lenght of the crystal to be equal to 2* Rayleigh rang
        var z0 = Math.PI * P.W *P.W / P.lambda_p;
    //     //console.log("Rayleigh Range: " + (z0*1e6).toString());
        if (10*z0 < P.L){
            P.L = 10 *z0;
        }
        // dim = P.brute_dim;
        // dim = 5;
    }


    // Find the stopping angle to integrate over
    var int_angles = PhaseMatch.autorange_theta(P);
    var tstart = int_angles[0];
    var tstop  = int_angles[1];
    if (P.theta_s*180/Math.PI < 4){
        tstart = 0;
    }

    if (tstop < x_stop){
        tstop = x_stop;
    }

    if (tstop < P.theta_i){
        tstop = P.theta_i;
    }
    // if (tstop < P.theta_s_e){
    //     tstop =
    // }
    // int_angles[1] = (P.theta_s_e - int_angles[0]) + P.theta_s_e;
    var num_pts_per_deg = 20;
    var numint = Math.round((tstop - tstart)*180/Math.PI*num_pts_per_deg);
    // if (numint < 100){
    //     numint = 100;
    // };
//     //console.log("number of integration points: " + numint.toString());

    P.theta_s_e = x_stop;
    var theta_stop  = PhaseMatch.find_internal_angle(P,"signal");
    var int_weights = PhaseMatch.NintegrateWeights(numint),
        diff   = (tstop - tstart),
        dtheta = (diff/numint)
    ;
    tstart = 0;
    tstop  = theta_stop;


    // // console.log("theta_stop: " + (theta_stop*180/Math.PI).toString() +', ' + numint.toString() +', ' + diff.toString() +', ' +dtheta.toString() );
    var i;

    var theta_x_e = PhaseMatch.linspace(x_start, x_stop, dim);
    var theta_y_e = PhaseMatch.linspace(y_stop, y_start, dim);
    var X = theta_x_e;
    var Y = theta_y_e;

    for (var k = 0; k<dim; k++){
        if (theta_x_e[k] < 0){
            P.theta_s_e = -1*theta_x_e[k];
            X[k] = -1*PhaseMatch.find_internal_angle(P,"signal");
            Y[dim - k -1] = X[k];
        }
        else {
            P.theta_s_e = theta_x_e[k];
            X[k] = PhaseMatch.find_internal_angle(P,"signal");
            Y[dim - k -1] = X[k];
        }
    }


    var N = dim * dim;
    var PM = new Float64Array( N );
    var PM_int_results = new Float64Array( numint );

    var startTime = new Date();

    var angintfunct = function(theta_i){
        // Set theta_i to the input theta, then update the coordinates + the index
        P.theta_i = theta_i;
        P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");
        // Now calculate the PM function
        var pm_result = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
        // return [pm_result,0];

        // var pm_result = PhaseMatch.phasematch(P);
        return pm_result;
    };


    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_s = Math.atan2(Y[index_y],X[index_x]);

        // if (X[index_x] < 0){ P.phi_s += Math.PI;}
        // if (P.phi_s<0){ P.phi_s += 2*Math.PI;}

        // // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
        P.phi_i = (P.phi_s + Math.PI);

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        // P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");


        if (P.brute_force) {
            // P.brute_force_theta_i(P); //use a search. could be time consuming.
            // var angintfunct = function(theta_i){
            //     // Set theta_i to the input theta, then update the coordinates + the index
            //     P.theta_i = theta_i;
            //     P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
            //     P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");
            //     // Now calculate the PM function
            //     var pm_result = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
            //     // return [pm_result,0];
            //
            //     // var pm_result = PhaseMatch.phasematch(P);
            //     return pm_result;

            for (var j=0; j<numint; j++){
                PM_int_results[j] = angintfunct(tstart + dtheta*j);
            }

            // PM[i] = Math.max.apply(Math, PM_int_results);
            PM[i] = PhaseMatch.max(PM_int_results);
            // var pm_int_ang = PhaseMatch.Nintegrate2arg(angintfunct,tstart, tstop, dtheta,numint,int_weights);
            // // console.log("int result: " + pm_int_ang[0].toString());
            // PM[i] = Math.sqrt(pm_int_ang[0]*pm_int_ang[0] + pm_int_ang[1]*pm_int_ang[1])/diff;
        }
        else {
            //calculate the correct idler angle analytically.
            // // console.log('hello');
            P.optimum_idler(P);
            PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
        }




        // // console.log('inside !',props.phi*180/Math.PI);

    }
    P.brute_force = false;
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    //console.log("return" + timeDiff.toString());
    return PM;

};

PhaseMatch.calc_XY_both = function calc_XY_both(props, x_start, x_stop, y_start, y_stop, dim){
    // // console.log('inside calc_xy',props.phi*180/Math.PI);

    props.update_all_angles();
    var P = props.clone();
    P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);
    // // console.log(P.lambda_i);
    // P.update_all_angles();
    // // console.log(P);
    // // console.log('After clone',props.phi*180/Math.PI);

    P.phi_i = (P.phi_s + Math.PI);

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var i;

    var theta_x_e = PhaseMatch.linspace(x_start, x_stop, dim);
    var theta_y_e = PhaseMatch.linspace(y_stop, y_start, dim);
    var X = theta_x_e;
    var Y = theta_y_e;

    for (var k = 0; k<dim; k++){
        if (theta_x_e[k] < 0){
            P.theta_s_e = -1*theta_x_e[k];
            X[k] = -1*PhaseMatch.find_internal_angle(P,"signal");
            Y[dim - k -1] = X[k];
        }
        else {
            P.theta_s_e = theta_x_e[k];
            X[k] = PhaseMatch.find_internal_angle(P,"signal");
            Y[dim - k -1] = X[k];
        }

    }

    var N = dim * dim;
    var PM = new Float64Array( N ),
        index_x,
        index_y;

    // Find Signal distribution
    for (i=0; i<N; i++){
        index_x = i % dim;
        index_y = Math.floor(i / dim);

        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_s = Math.atan2(Y[index_y],X[index_x]);
        P.phi_i = (P.phi_s + Math.PI);

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

        if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming.
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }


        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];

    }

     // "Type 0:   o -> o + o",
     //    "Type 0:   e -> e + e",
     //    "Type 1:   e -> o + o",
     //    "Type 2:   e -> e + o",
     //    "Type 2:   e -> o + e"

    // Find Idler distribution
    if (P.type === "Type 0:   o -> o + o" || P.type === "Type 1:   e -> o + o" || P.type === "Type 0:   e -> e + e"){
        //swap signal and idler frequencies.
        var lambda_s = P.lambda_s;
        P.lambda_s = P.lambda_i;
        P.lambda_i = lambda_s;
    }
    if (P.type ===  "Type 2:   e -> e + o"){
        // // console.log("switching");
        P.type =  "Type 2:   e -> o + e";
    }
    else if (P.type ===  "Type 2:   e -> o + e"){
        // // console.log("other way");
        P.type = "Type 2:   e -> e + o";
    }

    for (i=0; i<N; i++){
        index_x = i % dim;
        index_y = Math.floor(i / dim);

        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_s = Math.atan2(Y[index_y],X[index_x]);
        P.phi_i = (P.phi_s + Math.PI);

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

        if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming.
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }

        PM[i] += PhaseMatch.phasematch_Int_Phase(P)["phasematch"];

    }

    return PM;

};

PhaseMatch.calc_lambda_s_vs_theta_s = function calc_lambda_s_vs_theta_s(props, l_start, l_stop, t_start, t_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    P.phi_i = (P.phi_s + Math.PI);

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var theta_s_e = PhaseMatch.linspace(t_stop, t_start, dim);
    var theta_s = theta_s_e;

    for (var k = 0; k<dim; k++){
        P.theta_s_e = theta_s_e[k];
        theta_s[k] = PhaseMatch.find_internal_angle(P,"signal");
    }
    var i;
    var lambda_s = PhaseMatch.linspace(l_start, l_stop, dim);
    // var theta_s_e = [];

    var N = dim * dim;
    var PM = new Float64Array( N );
    var radtodeg = 180/Math.PI;

    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.theta_s = theta_s[index_i];
        P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

         if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming.
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }

        // if (i%dim === 0){
        //     theta_s_e[dim - index_i -1] = PhaseMatch.find_external_angle(P,"signal")*radtodeg;
        // }
        // theta_s_e[index_i] = PhaseMatch.find_external_angle(P,"signal")*radtodeg;

        // P.optimum_idler(P); //Need to find the optimum idler for each angle.
        // P.calc_wbar();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return {data:PM};

};

PhaseMatch.calc_theta_phi = function calc_theta_phi(props, t_start, t_stop, p_start, p_stop, dim){

    props.update_all_angles();
    var P = props.clone();
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
        P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

        //calcualte the correct idler angle analytically.
        P.optimum_idler(P);
        // P.calc_wbar();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];

    }
    return PM;

};

PhaseMatch.calc_signal_theta_phi = function calc_calc_signal_theta_phi(props, x_start, x_stop, y_start, y_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    if (P.brute_force){
        dim = P.brute_dim;
    }

    var theta_s_e = PhaseMatch.linspace(x_start, x_stop, dim);
    var X = theta_s_e;

    for (var k = 0; k<dim; k++){
        P.theta_s_e = theta_s_e[k];
        X[k] = PhaseMatch.find_internal_angle(P,"signal");
    }

    var i;
    // var X = PhaseMatch.linspace(x_start, x_stop, dim);
    var Y = PhaseMatch.linspace(y_start, y_stop, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );

    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_s = X[index_x];
        P.phi_s =Y[index_y];


        // // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
        P.phi_i = (P.phi_s + Math.PI);

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

        if (P.brute_force) {
           P.brute_force_theta_i(P); //use a search. could be time consuming.
        }
        else {
            //calculate the correct idler angle analytically.
            P.optimum_idler(P);
        }

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};


PhaseMatch.calc_signal_theta_vs_idler_theta = function calc_signal_theta_vs_idler_theta(props, x_start, x_stop, y_start, y_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    var i;

    var theta_s_e = PhaseMatch.linspace(x_start, x_stop, dim);
    var theta_i_e = PhaseMatch.linspace(y_stop, y_start, dim);
    var X = theta_s_e;
    var Y = theta_i_e;

    for (var k = 0; k<dim; k++){
        P.theta_s_e = theta_s_e[k];
        X[k] = PhaseMatch.find_internal_angle(P,"signal");
        P.theta_i_e = theta_i_e[k];
        Y[k] = PhaseMatch.find_internal_angle(P,"idler");
        // Y[k] = X[k];
    }

    // var X = PhaseMatch.linspace(x_start, x_stop, dim);
    // var Y = PhaseMatch.linspace(y_stop, y_start, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );

    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_s = X[index_x];
        P.theta_i =Y[index_y];


        // // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
        P.phi_i = (P.phi_s + Math.PI);

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");


        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};

PhaseMatch.calc_signal_phi_vs_idler_phi = function calc_signal_phi_vs_idler_phi(props, x_start, x_stop, y_start, y_stop, dim){

    props.update_all_angles();
    var P = props.clone();

    var i;
    var X = PhaseMatch.linspace(x_start, x_stop, dim);
    var Y = PhaseMatch.linspace(y_stop, y_start, dim);

    var N = dim * dim;
    var PM = new Float64Array( N );

    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.phi_s = X[index_x];
        P.phi_i =Y[index_y];

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];

    }

    return PM;

};

/* calc_schmidt_plot
* Params is a JSON string of the form { x: "L/W/BW", y:"L/W/BW"}
*/
PhaseMatch.calc_schmidt_plot = function calc_schmidt_plot(props, x_start, x_stop, y_start, y_stop, ls_start, ls_stop, li_start, li_stop, dim, params){

    props.update_all_angles();
    var P = props.clone();


    // if (P.brute_force && dim>P.brute_dim){
    //     dim = P.brute_dim;
    // }

    var xrange = PhaseMatch.linspace(x_start, x_stop, dim);
    var yrange = PhaseMatch.linspace(y_stop, y_start, dim);
    var i;
    var N = dim*dim;
    var S = new Float64Array( N );

    var dimjsa = 50; //make sure this is even

    var maxpm = 0;
    var maxschmidt = 10;
    var x_ideal = 0;
    var y_ideal = 0;



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

        //now calculate the JSI for these values
        var jsa = PhaseMatch.calc_JSI(P, ls_start, ls_stop, li_start, li_stop, dimjsa);
        var jsa2d = PhaseMatch.create_2d_array(jsa, dimjsa, dimjsa);
        S[i] = PhaseMatch.calc_Schmidt(jsa2d);

        if (S[i]<maxschmidt){
            maxschmidt = S[i];
            x_ideal = xrange[index_s];
            y_ideal = yrange[index_i];
        }

    }

    // // console.log("max pm value = ", maxpm);
    // // console.log("Lowest Schmidt = ", maxschmidt, " , X = ", x_ideal, ", Y = ", y_ideal);
    // // console.log("HOM dip = ",PhaseMatch.calc_HOM_JSA(P, 0e-15));

    return S;

};

/*
* calc_schmidt_plot_p
* Params is a JSON string of the form { x: "L/W/BW", y:"L/W/BW"}
*/
PhaseMatch.calc_schmidt_plot_p = function calc_schmidt_plot(props, xrange, yrange, ls_start, ls_stop, li_start, li_stop, dim, params){
    props.update_all_angles();
    var P = props.clone();


    // if (P.brute_force && dim>P.brute_dim){
    //     dim = P.brute_dim;
    // }

    // var xrange = PhaseMatch.linspace(x_start, x_stop, dim);
    // var yrange = PhaseMatch.linspace(y_stop, y_start, dim);
    var i;
    var N = xrange.length*yrange.length;
    var S = new Float64Array( N );

    var dimjsa = 50; //make sure this is even

    var maxpm = 0;
    var maxschmidt = 10;
    var x_ideal = 0;
    var y_ideal = 0;


    for (i=0; i<N; i++){
        var index_x = i % xrange.length;
        var index_y = Math.floor(i / xrange.length);

        // Figure out what to plot in the x dimension
        switch (params.x){
            case "L":
                P.L = xrange[index_x];
            break;
            case "W":
                P.W = xrange[index_x];
            break;
            case "BW":
                P.p_bw = xrange[index_x];
            break;
            default:
                throw "Error: x input type";
        }

        // Figure out what to plot in the y dimension
        switch (params.y){
            case "L":
                P.L = yrange[index_y];
            break;
            case "W":
                P.W = yrange[index_y];
            break;
            case "BW":
                P.p_bw = yrange[index_y];
            break;
            default:
                throw "Error: y input type";
        }

        //now calculate the JSI for these values
        var jsa = PhaseMatch.calc_JSI(P, ls_start, ls_stop, li_start, li_stop, dimjsa);
        var jsa2d = PhaseMatch.create_2d_array(jsa, dimjsa, dimjsa);
        S[i] = PhaseMatch.calc_Schmidt(jsa2d);
        // // console.log(S[i]);

        if (S[i]<maxschmidt){
            maxschmidt = S[i];
            x_ideal = xrange[index_x];
            y_ideal = yrange[index_y];
        }


    }

    // // console.log("max pm value = ", maxpm);
    // // console.log("Lowest Schmidt = ", maxschmidt, " , X = ", x_ideal, ", Y = ", y_ideal);
    // // console.log("HOM dip = ",PhaseMatch.calc_HOM_JSA(P, 0e-15));
    // // console.log(S[0]);
    return S;

};



/*
* calc_heralding_plot_p
*/
PhaseMatch.calc_heralding_plot_p = function calc_heralding_plot_p(props, WpRange, WsRange, ls_start, ls_stop, li_start, li_stop, n){
    props.update_all_angles();
    var P = props.clone()
        ,i
        ,N = WpRange.length*WsRange.length
        ,eff_s = new Float64Array( N )
        ,eff_i = new Float64Array( N )
        ,singles_s = new Float64Array( N )
        ,singles_i = new Float64Array( N )
        ,coinc = new Float64Array( N )
        ,dim = 15
        ,maxeEff = 0
        ,Ws_ideal = 0
        ,Wp_ideal = 0
        ,Wi_SQ = Math.pow(P.W_sx,2)
        ,PHI_s = 1/Math.cos(P.theta_s_e)
        // ,PHI_i = 1/Math.cos(P.theta_s_i)
        // ,n = n+(3- n%3) //guarantee that n is divisible by 3
        ,lambdaWeights = PhaseMatch.Nintegrate2DWeights_3_8(n)
        // @@@@@@ For testing purposes
        ,lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim)
        ,lambda_i = PhaseMatch.linspace(li_stop, li_start, dim)
        // ,lambda_s = PhaseMatch.linspace(P.lambda_p *2, P.lambda_p *2, dim)
        // ,lambda_i = PhaseMatch.linspace(P.lambda_p *2, P.lambda_p *2, dim)
        ;
    n = 15; //make sure this is even


    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    P.optimum_idler(P);

    var P_i = P.clone();
    P_i.swap_signal_idler();
    var PHI_i = 1/Math.cos(P_i.theta_s_e);

    ///////////////////////////////////////////////////
    // function calc_singles_rate(lambda_s, lambda_i ){

    //     // P.update_all_angles();
    //     // var P = props;
    //     // P.swap_signal_idler();
    //     // P.swap_signal_idler();
    //     P.lambda_s = lambda_s;
    //     P.lambda_i = lambda_i;

    //     P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
    //     P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

    //     var PM = PhaseMatch.phasematch_singles(P);
    //     // P.swap_signal_idler();
    //     // // console.log("inside singles: " + PM[0].toString() + ", i*" + PM[1].toString() + " P.n_p: " +P.n_p.toString() + ", Weights:" + lambdaWeights[0].toString());
    //     return Math.sqrt(sq(PM[0]) + sq(PM[1]));
    // };

    // function calc_singles_rate_i(lambda_s, lambda_i ){

    //     // P.update_all_angles();
    //     // var P = props;
    //     P_i.lambda_s = lambda_s;
    //     P_i.lambda_i = lambda_i;

    //     P_i.n_s = P_i.calc_Index_PMType(P_i.lambda_s, P_i.type, P_i.S_s, "signal");
    //     P_i.n_i = P_i.calc_Index_PMType(P_i.lambda_i, P_i.type, P_i.S_i, "idler");

    //     var PM = PhaseMatch.phasematch_singles(P_i);
    //     // // console.log("inside singles: " + PM[0].toString() + ", i*" + PM[1].toString() + " P_i.n_p: " +P.n_p.toString() + ", Weights:" + lambdaWeights[0].toString());
    //     return Math.sqrt(sq(PM[0]) + sq(PM[1]));
    // };

    // function calc_coinc_rate(lambda_s, lambda_i ){

    //     // P.update_all_angles();
    //     // var P = props;
    //     P.lambda_s = lambda_s;
    //     P.lambda_i = lambda_i;

    //     P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
    //     P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

    //     var PM = PhaseMatch.phasematch(P);
    //     return (sq(PM[0]) + sq(PM[1]));
    // };


    function calc_singles_rate( ){
        var JSI_singles = PhaseMatch.calc_JSI_Singles_p(P, lambda_s,lambda_i, dim, 1);
        // // console.log(PhaseMatch.Sum(JSI_singles[0]).toString());
        return [PhaseMatch.Sum(JSI_singles[0]), PhaseMatch.Sum(JSI_singles[1])];
    }

    function calc_coinc_rate( ){
        var JSI_coinc = PhaseMatch.calc_JSI_p(P, lambda_s,lambda_i, dim, 1);
        return PhaseMatch.Sum(JSI_coinc);
    }

    for (i=0; i<N; i++){
        var index_x = i % WpRange.length;
        var index_y = Math.floor(i / WpRange.length);
        P.W_sx = WsRange[index_y];
        P.W_sy = P.W_sx;
        P.W_ix = WsRange[index_y];
        P.W_iy = P.W_ix;
        P.W = WpRange[index_x];

        P_i.W_sx = WsRange[index_y];
        P_i.W_sy = P_i.W_sx;
        P_i.W_ix = WsRange[index_y];
        P_i.W_iy = P_i.W_ix;

        // // Testing out values
        // P.W_sx = WsRange[index_y];
        // P.W_sy = P.W_sx;
        // P.W_ix = WsRange[index_y];
        // P.W_iy = P.W_ix;
        // P.W = WpRange[index_x];

        // P_i.W_sx = WsRange[index_y];
        // P_i.W_sy = P_i.W_sx;
        // P_i.W_ix = WsRange[index_y];
        // P_i.W_iy = P_i.W_ix;

        // var singlesRate = PhaseMatch.Nintegrate2D_3_8(calc_singles_rate, ls_start, ls_stop, li_start, li_stop, n, lambdaWeights)
        //     ,coincRate = PhaseMatch.Nintegrate2D_3_8(calc_coinc_rate, ls_start, ls_stop, li_start, li_stop, n, lambdaWeights)
        //     ;

        var  singRate = calc_singles_rate()
            ,coincRate = calc_coinc_rate()
            ,singlesRate = singRate[0]
            ,idlerSinglesRate = singRate[1]
            ;

        // // coincRate = coincRate ;
        // P.swap_signal_idler();
        // // var PHI_i = 1/Math.cos(P_i.theta_s_e);
        // // var idlerSinglesRate = PhaseMatch.Nintegrate2D_3_8(calc_singles_rate, li_start, li_stop, ls_start, ls_stop, n, lambdaWeights);
        // var idlerSinglesRate = calc_singles_rate();
        // P.swap_signal_idler();
        // P.swap_signal_idler();
        // // console.log("singles: " + singlesRate.toString() + ", coinc:" + coincRate.toString());
        singles_s[i] = singlesRate; // / ( sq(P.W_sx) * PHI_s);
        singles_i[i] = idlerSinglesRate; // / ( sq(P.W_sx) * PHI_i);
        coinc[i] = coincRate;
        eff_i[i] = coincRate / singlesRate; //*( sq(P.W_sx) * PHI_s);
        eff_s[i] = coincRate / idlerSinglesRate;//  *( sq(P.W_sx) * PHI_i);
        // // console.log(coincRate.toString() + ', ' + singlesRate.toString());



    }
    return [eff_i, eff_s, singles_s, singles_i, coinc];
    // return eff;

};



/*
* calc_heralding_plot_focus_position_p
*/
PhaseMatch.calc_heralding_plot_focus_position_p = function calc_heralding_plot_focus_position_p(props, WsRange, ls_start, ls_stop, li_start, li_stop, n){
    props.update_all_angles();
    var WpRange = [props.W];
    var P = props.clone()
        // ,WpRange = [props.W]
        ,i
        ,N = WpRange.length*WsRange.length
        ,eff_s = new Float64Array( N )
        ,eff_i = new Float64Array( N )
        ,singles_s = new Float64Array( N )
        ,singles_i = new Float64Array( N )
        ,coinc = new Float64Array( N )
        ,dim = 15
        ,maxeEff = 0
        ,Ws_ideal = 0
        ,Wp_ideal = 0
        ,Wi_SQ = Math.pow(P.W_sx,2)
        ,PHI_s = 1/Math.cos(P.theta_s_e)
        // ,PHI_i = 1/Math.cos(P.theta_s_i)
        // ,n = n+(3- n%3) //guarantee that n is divisible by 3
        ,lambdaWeights = PhaseMatch.Nintegrate2DWeights_3_8(n)
        // @@@@@@ For testing purposes
        ,lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim)
        ,lambda_i = PhaseMatch.linspace(li_stop, li_start, dim)
        // ,lambda_s = PhaseMatch.linspace(P.lambda_p *2, P.lambda_p *2, dim)
        // ,lambda_i = PhaseMatch.linspace(P.lambda_p *2, P.lambda_p *2, dim)
        ;
    n = 16; //make sure this is even
    // // console.log("NNNNNNNN: " + WsRange.toString());
    P.phi_i = P.phi_s + Math.PI;
    P.update_all_angles();
    P.optimum_idler(P);

    var P_i = P.clone();
    P_i.swap_signal_idler();
    var PHI_i = 1/Math.cos(P_i.theta_s_e);

    function calc_singles_rate( ){
        var JSI_singles = PhaseMatch.calc_JSI_Singles_p(P, lambda_s,lambda_i, dim, 1);
        // // console.log(PhaseMatch.Sum(JSI_singles[0]).toString());
        return [PhaseMatch.Sum(JSI_singles[0]), PhaseMatch.Sum(JSI_singles[1])];
    }

    function calc_coinc_rate( ){
        var JSI_coinc = PhaseMatch.calc_JSI_p(P, lambda_s,lambda_i, dim, 1);
        return PhaseMatch.Sum(JSI_coinc);
    }

    for (i=0; i<N; i++){
        // var index_x = i % WpRange.length;
        // var index_y = Math.floor(i / WpRange.length);
        // P.W_sx = WsRange[index_y];
        // P.W_sy = P.W_sx;
        // P.W_ix = WsRange[index_y];
        // P.W_iy = P.W_ix;
        // P.W = WpRange[index_x];

        // P_i.W_sx = WsRange[index_y];
        // P_i.W_sy = P_i.W_sx;
        // P_i.W_ix = WsRange[index_y];
        // P_i.W_iy = P_i.W_ix;

        P.z0s = WsRange[i];
        P.z0i = WsRange[i];

        P_i.z0s = WsRange[i];
        P_i.z0i = WsRange[i];


        var  singRate = calc_singles_rate()
            ,coincRate = calc_coinc_rate()
            ,singlesRate = singRate[0]
            ,idlerSinglesRate = singRate[1]
            ;

        singles_s[i] = singlesRate; // / ( sq(P.W_sx) * PHI_s);
        singles_i[i] = idlerSinglesRate; // / ( sq(P.W_sx) * PHI_i);
        coinc[i] = coincRate;
        eff_i[i] = coincRate / singlesRate; //*( sq(P.W_sx) * PHI_s);
        eff_s[i] = coincRate / idlerSinglesRate;//  *( sq(P.W_sx) * PHI_i);
        // // console.log(coincRate.toString() + ', ' + singlesRate.toString());



    }
    return [eff_i, eff_s, singles_s, singles_i, coinc];
    // return eff;

};


return PhaseMatch;
}));