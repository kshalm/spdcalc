/**
 * phasematchjs v0.0.1a - 2016-09-20
 *  ENTER_DESCRIPTION 
 *
 * Copyright (c) 2016 Krister Shalm <kshalm@gmail.com>
 * Licensed GPL-3.0
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

;(function() {

  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
  var undefined;

  /** Used as the semantic version number. */
  var VERSION = '4.16.1';

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /** Used as the maximum memoize cache size. */
  var MAX_MEMOIZE_SIZE = 500;

  /** Used as the internal argument placeholder. */
  var PLACEHOLDER = '__lodash_placeholder__';

  /** Used to compose bitmasks for function metadata. */
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

  /** Used to compose bitmasks for comparison styles. */
  var UNORDERED_COMPARE_FLAG = 1,
      PARTIAL_COMPARE_FLAG = 2;

  /** Used as default options for `_.truncate`. */
  var DEFAULT_TRUNC_LENGTH = 30,
      DEFAULT_TRUNC_OMISSION = '...';

  /** Used to detect hot functions by number of calls within a span of milliseconds. */
  var HOT_COUNT = 500,
      HOT_SPAN = 16;

  /** Used to indicate the type of lazy iteratees. */
  var LAZY_FILTER_FLAG = 1,
      LAZY_MAP_FLAG = 2,
      LAZY_WHILE_FLAG = 3;

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0,
      MAX_SAFE_INTEGER = 9007199254740991,
      MAX_INTEGER = 1.7976931348623157e+308,
      NAN = 0 / 0;

  /** Used as references for the maximum length and index of an array. */
  var MAX_ARRAY_LENGTH = 4294967295,
      MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
      HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

  /** Used to associate wrap methods with their bit flags. */
  var wrapFlags = [
    ['ary', ARY_FLAG],
    ['bind', BIND_FLAG],
    ['bindKey', BIND_KEY_FLAG],
    ['curry', CURRY_FLAG],
    ['curryRight', CURRY_RIGHT_FLAG],
    ['flip', FLIP_FLAG],
    ['partial', PARTIAL_FLAG],
    ['partialRight', PARTIAL_RIGHT_FLAG],
    ['rearg', REARG_FLAG]
  ];

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
      promiseTag = '[object Promise]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]',
      weakMapTag = '[object WeakMap]',
      weakSetTag = '[object WeakSet]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to match empty string literals in compiled template source. */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /** Used to match HTML entities and HTML characters. */
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g,
      reUnescapedHtml = /[&<>"']/g,
      reHasEscapedHtml = RegExp(reEscapedHtml.source),
      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

  /** Used to match template delimiters. */
  var reEscape = /<%-([\s\S]+?)%>/g,
      reEvaluate = /<%([\s\S]+?)%>/g,
      reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match property names within property paths. */
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      reIsPlainProp = /^\w*$/,
      reLeadingDot = /^\./,
      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
      reHasRegExpChar = RegExp(reRegExpChar.source);

  /** Used to match leading and trailing whitespace. */
  var reTrim = /^\s+|\s+$/g,
      reTrimStart = /^\s+/,
      reTrimEnd = /\s+$/;

  /** Used to match wrap detail comments. */
  var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
      reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/,
      reSplitDetails = /,? & /;

  /** Used to match words composed of alphanumeric characters. */
  var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

  /** Used to match backslashes in property paths. */
  var reEscapeChar = /\\(\\)?/g;

  /**
   * Used to match
   * [ES template delimiters](http://ecma-international.org/ecma-262/7.0/#sec-template-literal-lexical-components).
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /** Used to match Latin Unicode letters (excluding mathematical operators). */
  var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

  /** Used to ensure capturing order of template delimiters. */
  var reNoMatch = /($^)/;

  /** Used to match unescaped characters in compiled string literals. */
  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

  /** Used to compose unicode character classes. */
  var rsAstralRange = '\\ud800-\\udfff',
      rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
      rsComboSymbolsRange = '\\u20d0-\\u20f0',
      rsDingbatRange = '\\u2700-\\u27bf',
      rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
      rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
      rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
      rsPunctuationRange = '\\u2000-\\u206f',
      rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
      rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
      rsVarRange = '\\ufe0e\\ufe0f',
      rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

  /** Used to compose unicode capture groups. */
  var rsApos = "['\u2019]",
      rsAstral = '[' + rsAstralRange + ']',
      rsBreak = '[' + rsBreakRange + ']',
      rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']',
      rsDigits = '\\d+',
      rsDingbat = '[' + rsDingbatRange + ']',
      rsLower = '[' + rsLowerRange + ']',
      rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
      rsFitz = '\\ud83c[\\udffb-\\udfff]',
      rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
      rsNonAstral = '[^' + rsAstralRange + ']',
      rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
      rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
      rsUpper = '[' + rsUpperRange + ']',
      rsZWJ = '\\u200d';

  /** Used to compose unicode regexes. */
  var rsLowerMisc = '(?:' + rsLower + '|' + rsMisc + ')',
      rsUpperMisc = '(?:' + rsUpper + '|' + rsMisc + ')',
      rsOptLowerContr = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
      rsOptUpperContr = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
      reOptMod = rsModifier + '?',
      rsOptVar = '[' + rsVarRange + ']?',
      rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
      rsSeq = rsOptVar + reOptMod + rsOptJoin,
      rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq,
      rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

  /** Used to match apostrophes. */
  var reApos = RegExp(rsApos, 'g');

  /**
   * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
   * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
   */
  var reComboMark = RegExp(rsCombo, 'g');

  /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
  var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

  /** Used to match complex or compound words. */
  var reUnicodeWord = RegExp([
    rsUpper + '?' + rsLower + '+' + rsOptLowerContr + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
    rsUpperMisc + '+' + rsOptUpperContr + '(?=' + [rsBreak, rsUpper + rsLowerMisc, '$'].join('|') + ')',
    rsUpper + '?' + rsLowerMisc + '+' + rsOptLowerContr,
    rsUpper + '+' + rsOptUpperContr,
    rsDigits,
    rsEmoji
  ].join('|'), 'g');

  /** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
  var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');

  /** Used to detect strings that need a more robust regexp to match words. */
  var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

  /** Used to assign default `context` object properties. */
  var contextProps = [
    'Array', 'Buffer', 'DataView', 'Date', 'Error', 'Float32Array', 'Float64Array',
    'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Map', 'Math', 'Object',
    'Promise', 'RegExp', 'Set', 'String', 'Symbol', 'TypeError', 'Uint8Array',
    'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap',
    '_', 'clearTimeout', 'isFinite', 'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify. */
  var templateCounter = -1;

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
  typedArrayTags[errorTag] = typedArrayTags[funcTag] =
  typedArrayTags[mapTag] = typedArrayTags[numberTag] =
  typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
  typedArrayTags[setTag] = typedArrayTags[stringTag] =
  typedArrayTags[weakMapTag] = false;

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
  cloneableTags[boolTag] = cloneableTags[dateTag] =
  cloneableTags[float32Tag] = cloneableTags[float64Tag] =
  cloneableTags[int8Tag] = cloneableTags[int16Tag] =
  cloneableTags[int32Tag] = cloneableTags[mapTag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[setTag] =
  cloneableTags[stringTag] = cloneableTags[symbolTag] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[weakMapTag] = false;

  /** Used to map Latin Unicode letters to basic Latin letters. */
  var deburredLetters = {
    // Latin-1 Supplement block.
    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
    '\xc7': 'C',  '\xe7': 'c',
    '\xd0': 'D',  '\xf0': 'd',
    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
    '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
    '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
    '\xd1': 'N',  '\xf1': 'n',
    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
    '\xc6': 'Ae', '\xe6': 'ae',
    '\xde': 'Th', '\xfe': 'th',
    '\xdf': 'ss',
    // Latin Extended-A block.
    '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
    '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
    '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
    '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
    '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
    '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
    '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
    '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
    '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
    '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
    '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
    '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
    '\u0134': 'J',  '\u0135': 'j',
    '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
    '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
    '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
    '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
    '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
    '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
    '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
    '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
    '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
    '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
    '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
    '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
    '\u0163': 't',  '\u0165': 't', '\u0167': 't',
    '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
    '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
    '\u0174': 'W',  '\u0175': 'w',
    '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
    '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
    '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
    '\u0132': 'IJ', '\u0133': 'ij',
    '\u0152': 'Oe', '\u0153': 'oe',
    '\u0149': "'n", '\u017f': 's'
  };

  /** Used to map characters to HTML entities. */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  /** Used to map HTML entities to characters. */
  var htmlUnescapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };

  /** Used to escape characters for inclusion in compiled string literals. */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Built-in method references without a dependency on `root`. */
  var freeParseFloat = parseFloat,
      freeParseInt = parseInt;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /** Detect free variable `exports`. */
  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports && freeGlobal.process;

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function() {
    try {
      return freeProcess && freeProcess.binding('util');
    } catch (e) {}
  }());

  /* Node.js helper references. */
  var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer,
      nodeIsDate = nodeUtil && nodeUtil.isDate,
      nodeIsMap = nodeUtil && nodeUtil.isMap,
      nodeIsRegExp = nodeUtil && nodeUtil.isRegExp,
      nodeIsSet = nodeUtil && nodeUtil.isSet,
      nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

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
    // Don't return `map.set` because it's not chainable in IE 11.
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
    // Don't return `set.add` because it's not chainable in IE 11.
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
   * @param {Array} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  /**
   * A specialized version of `baseAggregator` for arrays.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} setter The function to set `accumulator` values.
   * @param {Function} iteratee The iteratee to transform keys.
   * @param {Object} accumulator The initial aggregated object.
   * @returns {Function} Returns `accumulator`.
   */
  function arrayAggregator(array, setter, iteratee, accumulator) {
    var index = -1,
        length = array ? array.length : 0;

    while (++index < length) {
      var value = array[index];
      setter(accumulator, value, iteratee(value), array);
    }
    return accumulator;
  }

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * A specialized version of `_.forEachRight` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEachRight(array, iteratee) {
    var length = array ? array.length : 0;

    while (length--) {
      if (iteratee(array[length], length, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * A specialized version of `_.every` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if all elements pass the predicate check,
   *  else `false`.
   */
  function arrayEvery(array, predicate) {
    var index = -1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (!predicate(array[index], index, array)) {
        return false;
      }
    }
    return true;
  }

  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function arrayFilter(array, predicate) {
    var index = -1,
        length = array ? array.length : 0,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  /**
   * A specialized version of `_.includes` for arrays without support for
   * specifying an index to search from.
   *
   * @private
   * @param {Array} [array] The array to inspect.
   * @param {*} target The value to search for.
   * @returns {boolean} Returns `true` if `target` is found, else `false`.
   */
  function arrayIncludes(array, value) {
    var length = array ? array.length : 0;
    return !!length && baseIndexOf(array, value, 0) > -1;
  }

  /**
   * This function is like `arrayIncludes` except that it accepts a comparator.
   *
   * @private
   * @param {Array} [array] The array to inspect.
   * @param {*} target The value to search for.
   * @param {Function} comparator The comparator invoked per element.
   * @returns {boolean} Returns `true` if `target` is found, else `false`.
   */
  function arrayIncludesWith(array, value, comparator) {
    var index = -1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (comparator(value, array[index])) {
        return true;
      }
    }
    return false;
  }

  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function arrayMap(array, iteratee) {
    var index = -1,
        length = array ? array.length : 0,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
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
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {boolean} [initAccum] Specify using the first element of `array` as
   *  the initial value.
   * @returns {*} Returns the accumulated value.
   */
  function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1,
        length = array ? array.length : 0;

    if (initAccum && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }

  /**
   * A specialized version of `_.reduceRight` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {boolean} [initAccum] Specify using the last element of `array` as
   *  the initial value.
   * @returns {*} Returns the accumulated value.
   */
  function arrayReduceRight(array, iteratee, accumulator, initAccum) {
    var length = array ? array.length : 0;
    if (initAccum && length) {
      accumulator = array[--length];
    }
    while (length--) {
      accumulator = iteratee(accumulator, array[length], length, array);
    }
    return accumulator;
  }

  /**
   * A specialized version of `_.some` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */
  function arraySome(array, predicate) {
    var index = -1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets the size of an ASCII `string`.
   *
   * @private
   * @param {string} string The string inspect.
   * @returns {number} Returns the string size.
   */
  var asciiSize = baseProperty('length');

  /**
   * Converts an ASCII `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */
  function asciiToArray(string) {
    return string.split('');
  }

  /**
   * Splits an ASCII `string` into an array of its words.
   *
   * @private
   * @param {string} The string to inspect.
   * @returns {Array} Returns the words of `string`.
   */
  function asciiWords(string) {
    return string.match(reAsciiWord) || [];
  }

  /**
   * The base implementation of methods like `_.findKey` and `_.findLastKey`,
   * without support for iteratee shorthands, which iterates over `collection`
   * using `eachFunc`.
   *
   * @private
   * @param {Array|Object} collection The collection to inspect.
   * @param {Function} predicate The function invoked per iteration.
   * @param {Function} eachFunc The function to iterate over `collection`.
   * @returns {*} Returns the found element or its key, else `undefined`.
   */
  function baseFindKey(collection, predicate, eachFunc) {
    var result;
    eachFunc(collection, function(value, key, collection) {
      if (predicate(value, key, collection)) {
        result = key;
        return false;
      }
    });
    return result;
  }

  /**
   * The base implementation of `_.findIndex` and `_.findLastIndex` without
   * support for iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} predicate The function invoked per iteration.
   * @param {number} fromIndex The index to search from.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 1 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    return value === value
      ? strictIndexOf(array, value, fromIndex)
      : baseFindIndex(array, baseIsNaN, fromIndex);
  }

  /**
   * This function is like `baseIndexOf` except that it accepts a comparator.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @param {Function} comparator The comparator invoked per element.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseIndexOfWith(array, value, fromIndex, comparator) {
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (comparator(array[index], value)) {
        return index;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.isNaN` without support for number objects.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
   */
  function baseIsNaN(value) {
    return value !== value;
  }

  /**
   * The base implementation of `_.mean` and `_.meanBy` without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {number} Returns the mean.
   */
  function baseMean(array, iteratee) {
    var length = array ? array.length : 0;
    return length ? (baseSum(array, iteratee) / length) : NAN;
  }

  /**
   * The base implementation of `_.property` without support for deep paths.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @returns {Function} Returns the new accessor function.
   */
  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }

  /**
   * The base implementation of `_.propertyOf` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Function} Returns the new accessor function.
   */
  function basePropertyOf(object) {
    return function(key) {
      return object == null ? undefined : object[key];
    };
  }

  /**
   * The base implementation of `_.reduce` and `_.reduceRight`, without support
   * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} accumulator The initial value.
   * @param {boolean} initAccum Specify using the first or last element of
   *  `collection` as the initial value.
   * @param {Function} eachFunc The function to iterate over `collection`.
   * @returns {*} Returns the accumulated value.
   */
  function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
    eachFunc(collection, function(value, index, collection) {
      accumulator = initAccum
        ? (initAccum = false, value)
        : iteratee(accumulator, value, index, collection);
    });
    return accumulator;
  }

  /**
   * The base implementation of `_.sortBy` which uses `comparer` to define the
   * sort order of `array` and replaces criteria objects with their corresponding
   * values.
   *
   * @private
   * @param {Array} array The array to sort.
   * @param {Function} comparer The function to define sort order.
   * @returns {Array} Returns `array`.
   */
  function baseSortBy(array, comparer) {
    var length = array.length;

    array.sort(comparer);
    while (length--) {
      array[length] = array[length].value;
    }
    return array;
  }

  /**
   * The base implementation of `_.sum` and `_.sumBy` without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {number} Returns the sum.
   */
  function baseSum(array, iteratee) {
    var result,
        index = -1,
        length = array.length;

    while (++index < length) {
      var current = iteratee(array[index]);
      if (current !== undefined) {
        result = result === undefined ? current : (result + current);
      }
    }
    return result;
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
   * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
   * of key-value pairs for `object` corresponding to the property names of `props`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} props The property names to get values for.
   * @returns {Object} Returns the key-value pairs.
   */
  function baseToPairs(object, props) {
    return arrayMap(props, function(key) {
      return [key, object[key]];
    });
  }

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  /**
   * The base implementation of `_.values` and `_.valuesIn` which creates an
   * array of `object` property values corresponding to the property names
   * of `props`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} props The property names to get values for.
   * @returns {Object} Returns the array of property values.
   */
  function baseValues(object, props) {
    return arrayMap(props, function(key) {
      return object[key];
    });
  }

  /**
   * Checks if a `cache` value for `key` exists.
   *
   * @private
   * @param {Object} cache The cache to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function cacheHas(cache, key) {
    return cache.has(key);
  }

  /**
   * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
   * that is not found in the character symbols.
   *
   * @private
   * @param {Array} strSymbols The string symbols to inspect.
   * @param {Array} chrSymbols The character symbols to find.
   * @returns {number} Returns the index of the first unmatched string symbol.
   */
  function charsStartIndex(strSymbols, chrSymbols) {
    var index = -1,
        length = strSymbols.length;

    while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
    return index;
  }

  /**
   * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
   * that is not found in the character symbols.
   *
   * @private
   * @param {Array} strSymbols The string symbols to inspect.
   * @param {Array} chrSymbols The character symbols to find.
   * @returns {number} Returns the index of the last unmatched string symbol.
   */
  function charsEndIndex(strSymbols, chrSymbols) {
    var index = strSymbols.length;

    while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
    return index;
  }

  /**
   * Gets the number of `placeholder` occurrences in `array`.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} placeholder The placeholder to search for.
   * @returns {number} Returns the placeholder count.
   */
  function countHolders(array, placeholder) {
    var length = array.length,
        result = 0;

    while (length--) {
      if (array[length] === placeholder) {
        ++result;
      }
    }
    return result;
  }

  /**
   * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
   * letters to basic Latin letters.
   *
   * @private
   * @param {string} letter The matched letter to deburr.
   * @returns {string} Returns the deburred letter.
   */
  var deburrLetter = basePropertyOf(deburredLetters);

  /**
   * Used by `_.escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  var escapeHtmlChar = basePropertyOf(htmlEscapes);

  /**
   * Used by `_.template` to escape characters for inclusion in compiled string literals.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(chr) {
    return '\\' + stringEscapes[chr];
  }

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Checks if `string` contains Unicode symbols.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {boolean} Returns `true` if a symbol is found, else `false`.
   */
  function hasUnicode(string) {
    return reHasUnicode.test(string);
  }

  /**
   * Checks if `string` contains a word composed of Unicode symbols.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {boolean} Returns `true` if a word is found, else `false`.
   */
  function hasUnicodeWord(string) {
    return reHasUnicodeWord.test(string);
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
   * Converts `map` to its key-value pairs.
   *
   * @private
   * @param {Object} map The map to convert.
   * @returns {Array} Returns the key-value pairs.
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
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
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
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (value === placeholder || value === PLACEHOLDER) {
        array[index] = PLACEHOLDER;
        result[resIndex++] = index;
      }
    }
    return result;
  }

  /**
   * Converts `set` to an array of its values.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the values.
   */
  function setToArray(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }

  /**
   * Converts `set` to its value-value pairs.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the value-value pairs.
   */
  function setToPairs(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function(value) {
      result[++index] = [value, value];
    });
    return result;
  }

  /**
   * A specialized version of `_.indexOf` which performs strict equality
   * comparisons of values, i.e. `===`.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function strictIndexOf(array, value, fromIndex) {
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * A specialized version of `_.lastIndexOf` which performs strict equality
   * comparisons of values, i.e. `===`.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function strictLastIndexOf(array, value, fromIndex) {
    var index = fromIndex + 1;
    while (index--) {
      if (array[index] === value) {
        return index;
      }
    }
    return index;
  }

  /**
   * Gets the number of symbols in `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the string size.
   */
  function stringSize(string) {
    return hasUnicode(string)
      ? unicodeSize(string)
      : asciiSize(string);
  }

  /**
   * Converts `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */
  function stringToArray(string) {
    return hasUnicode(string)
      ? unicodeToArray(string)
      : asciiToArray(string);
  }

  /**
   * Used by `_.unescape` to convert HTML entities to characters.
   *
   * @private
   * @param {string} chr The matched character to unescape.
   * @returns {string} Returns the unescaped character.
   */
  var unescapeHtmlChar = basePropertyOf(htmlUnescapes);

  /**
   * Gets the size of a Unicode `string`.
   *
   * @private
   * @param {string} string The string inspect.
   * @returns {number} Returns the string size.
   */
  function unicodeSize(string) {
    var result = reUnicode.lastIndex = 0;
    while (reUnicode.test(string)) {
      ++result;
    }
    return result;
  }

  /**
   * Converts a Unicode `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */
  function unicodeToArray(string) {
    return string.match(reUnicode) || [];
  }

  /**
   * Splits a Unicode `string` into an array of its words.
   *
   * @private
   * @param {string} The string to inspect.
   * @returns {Array} Returns the words of `string`.
   */
  function unicodeWords(string) {
    return string.match(reUnicodeWord) || [];
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new pristine `lodash` function using the `context` object.
   *
   * @static
   * @memberOf _
   * @since 1.1.0
   * @category Util
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns a new `lodash` function.
   * @example
   *
   * _.mixin({ 'foo': _.constant('foo') });
   *
   * var lodash = _.runInContext();
   * lodash.mixin({ 'bar': lodash.constant('bar') });
   *
   * _.isFunction(_.foo);
   * // => true
   * _.isFunction(_.bar);
   * // => false
   *
   * lodash.isFunction(lodash.foo);
   * // => false
   * lodash.isFunction(lodash.bar);
   * // => true
   *
   * // Create a suped-up `defer` in Node.js.
   * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;
   */
  var runInContext = (function runInContext(context) {
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Built-in constructor references. */
    var Array = context.Array,
        Date = context.Date,
        Error = context.Error,
        Function = context.Function,
        Math = context.Math,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /** Used for built-in method references. */
    var arrayProto = Array.prototype,
        funcProto = Function.prototype,
        objectProto = Object.prototype;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = context['__core-js_shared__'];

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /** Used to generate unique IDs. */
    var idCounter = 0;

    /** Used to infer the `Object` constructor. */
    var objectCtorString = funcToString.call(Object);

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString = objectProto.toString;

    /** Used to restore the original `_` reference in `_.noConflict`. */
    var oldDash = root._;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /** Built-in value references. */
    var Buffer = moduleExports ? context.Buffer : undefined,
        Symbol = context.Symbol,
        Uint8Array = context.Uint8Array,
        defineProperty = Object.defineProperty,
        getPrototype = overArg(Object.getPrototypeOf, Object),
        iteratorSymbol = Symbol ? Symbol.iterator : undefined,
        objectCreate = Object.create,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        splice = arrayProto.splice,
        spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

    /** Mocked built-ins. */
    var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout,
        ctxNow = Date && Date.now !== root.Date.now && Date.now,
        ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeCeil = Math.ceil,
        nativeFloor = Math.floor,
        nativeGetSymbols = Object.getOwnPropertySymbols,
        nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
        nativeIsFinite = context.isFinite,
        nativeJoin = arrayProto.join,
        nativeKeys = overArg(Object.keys, Object),
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeNow = Date.now,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random,
        nativeReverse = arrayProto.reverse;

    /* Built-in method references that are verified to be native. */
    var DataView = getNative(context, 'DataView'),
        Map = getNative(context, 'Map'),
        Promise = getNative(context, 'Promise'),
        Set = getNative(context, 'Set'),
        WeakMap = getNative(context, 'WeakMap'),
        nativeCreate = getNative(Object, 'create'),
        nativeDefineProperty = getNative(Object, 'defineProperty');

    /** Used to store function metadata. */
    var metaMap = WeakMap && new WeakMap;

    /** Used to lookup unminified function names. */
    var realNames = {};

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView),
        mapCtorString = toSource(Map),
        promiseCtorString = toSource(Promise),
        setCtorString = toSource(Set),
        weakMapCtorString = toSource(WeakMap);

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = Symbol ? Symbol.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined,
        symbolToString = symbolProto ? symbolProto.toString : undefined;

    /*------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps `value` to enable implicit method
     * chain sequences. Methods that operate on and return arrays, collections,
     * and functions can be chained together. Methods that retrieve a single value
     * or may return a primitive value will automatically end the chain sequence
     * and return the unwrapped value. Otherwise, the value must be unwrapped
     * with `_#value`.
     *
     * Explicit chain sequences, which must be unwrapped with `_#value`, may be
     * enabled using `_.chain`.
     *
     * The execution of chained methods is lazy, that is, it's deferred until
     * `_#value` is implicitly or explicitly called.
     *
     * Lazy evaluation allows several methods to support shortcut fusion.
     * Shortcut fusion is an optimization to merge iteratee calls; this avoids
     * the creation of intermediate arrays and can greatly reduce the number of
     * iteratee executions. Sections of a chain sequence qualify for shortcut
     * fusion if the section is applied to an array of at least `200` elements
     * and any iteratees accept only one argument. The heuristic for whether a
     * section qualifies for shortcut fusion is subject to change.
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
     * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
     * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
     * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
     * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
     * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
     * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
     * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
     * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
     * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
     * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
     * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
     * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
     * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
     * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
     * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
     * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
     * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
     * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
     * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
     * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
     * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
     * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
     * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
     * `zipObject`, `zipObjectDeep`, and `zipWith`
     *
     * The wrapper methods that are **not** chainable by default are:
     * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
     * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `conformsTo`, `deburr`,
     * `defaultTo`, `divide`, `each`, `eachRight`, `endsWith`, `eq`, `escape`,
     * `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`, `findLast`,
     * `findLastIndex`, `findLastKey`, `first`, `floor`, `forEach`, `forEachRight`,
     * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
     * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
     * `isArguments`, `isArray`, `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`,
     * `isBoolean`, `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`,
     * `isEqualWith`, `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`,
     * `isMap`, `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
     * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
     * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
     * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
     * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
     * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
     * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
     * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
     * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
     * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
     * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
     * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
     * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
     * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
     * `upperFirst`, `value`, and `words`
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
     * // Returns an unwrapped value.
     * wrapped.reduce(_.add);
     * // => 6
     *
     * // Returns a wrapped value.
     * var squares = wrapped.map(square);
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
        if (value instanceof LodashWrapper) {
          return value;
        }
        if (hasOwnProperty.call(value, '__wrapped__')) {
          return wrapperClone(value);
        }
      }
      return new LodashWrapper(value);
    }

    /**
     * The function whose prototype chain sequence wrappers inherit from.
     *
     * @private
     */
    function baseLodash() {
      // No operation performed.
    }

    /**
     * The base constructor for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap.
     * @param {boolean} [chainAll] Enable explicit method chain sequences.
     */
    function LodashWrapper(value, chainAll) {
      this.__wrapped__ = value;
      this.__actions__ = [];
      this.__chain__ = !!chainAll;
      this.__index__ = 0;
      this.__values__ = undefined;
    }

    /**
     * By default, the template delimiters used by lodash are like those in
     * embedded Ruby (ERB). Change the following template settings to use
     * alternative delimiters.
     *
     * @static
     * @memberOf _
     * @type {Object}
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type {RegExp}
       */
      'escape': reEscape,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type {RegExp}
       */
      'evaluate': reEvaluate,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type {RegExp}
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type {string}
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type {Object}
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type {Function}
         */
        '_': lodash
      }
    };

    // Ensure wrappers are instances of `baseLodash`.
    lodash.prototype = baseLodash.prototype;
    lodash.prototype.constructor = lodash;

    LodashWrapper.prototype = baseCreate(baseLodash.prototype);
    LodashWrapper.prototype.constructor = LodashWrapper;

    /*------------------------------------------------------------------------*/

    /**
     * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
     *
     * @private
     * @constructor
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

    /**
     * Creates a clone of the lazy wrapper object.
     *
     * @private
     * @name clone
     * @memberOf LazyWrapper
     * @returns {Object} Returns the cloned `LazyWrapper` object.
     */
    function lazyClone() {
      var result = new LazyWrapper(this.__wrapped__);
      result.__actions__ = copyArray(this.__actions__);
      result.__dir__ = this.__dir__;
      result.__filtered__ = this.__filtered__;
      result.__iteratees__ = copyArray(this.__iteratees__);
      result.__takeCount__ = this.__takeCount__;
      result.__views__ = copyArray(this.__views__);
      return result;
    }

    /**
     * Reverses the direction of lazy iteration.
     *
     * @private
     * @name reverse
     * @memberOf LazyWrapper
     * @returns {Object} Returns the new reversed `LazyWrapper` object.
     */
    function lazyReverse() {
      if (this.__filtered__) {
        var result = new LazyWrapper(this);
        result.__dir__ = -1;
        result.__filtered__ = true;
      } else {
        result = this.clone();
        result.__dir__ *= -1;
      }
      return result;
    }

    /**
     * Extracts the unwrapped value from its lazy wrapper.
     *
     * @private
     * @name value
     * @memberOf LazyWrapper
     * @returns {*} Returns the unwrapped value.
     */
    function lazyValue() {
      var array = this.__wrapped__.value(),
          dir = this.__dir__,
          isArr = isArray(array),
          isRight = dir < 0,
          arrLength = isArr ? array.length : 0,
          view = getView(0, arrLength, this.__views__),
          start = view.start,
          end = view.end,
          length = end - start,
          index = isRight ? end : (start - 1),
          iteratees = this.__iteratees__,
          iterLength = iteratees.length,
          resIndex = 0,
          takeCount = nativeMin(length, this.__takeCount__);

      if (!isArr || arrLength < LARGE_ARRAY_SIZE ||
          (arrLength == length && takeCount == length)) {
        return baseWrapperValue(array, this.__actions__);
      }
      var result = [];

      outer:
      while (length-- && resIndex < takeCount) {
        index += dir;

        var iterIndex = -1,
            value = array[index];

        while (++iterIndex < iterLength) {
          var data = iteratees[iterIndex],
              iteratee = data.iteratee,
              type = data.type,
              computed = iteratee(value);

          if (type == LAZY_MAP_FLAG) {
            value = computed;
          } else if (!computed) {
            if (type == LAZY_FILTER_FLAG) {
              continue outer;
            } else {
              break outer;
            }
          }
        }
        result[resIndex++] = value;
      }
      return result;
    }

    // Ensure `LazyWrapper` is an instance of `baseLodash`.
    LazyWrapper.prototype = baseCreate(baseLodash.prototype);
    LazyWrapper.prototype.constructor = LazyWrapper;

    /*------------------------------------------------------------------------*/

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
    }

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
      return this;
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /*------------------------------------------------------------------------*/

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /*------------------------------------------------------------------------*/

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
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
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map || ListCache),
        'string': new Hash
      };
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
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
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
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
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
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /*------------------------------------------------------------------------*/

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values ? values.length : 0;

      this.__data__ = new MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;

    /*------------------------------------------------------------------------*/

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
      this.size = 0;
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
          result = data['delete'](key);

      this.size = data.size;
      return result;
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
      return this.__data__.get(key);
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
      return this.__data__.has(key);
    }

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /*------------------------------------------------------------------------*/

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
      // Safari 9 makes `arguments.length` enumerable in strict mode.
      var result = (isArray(value) || isArguments(value))
        ? baseTimes(value.length, String)
        : [];

      var length = result.length,
          skipIndexes = !!length;

      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) &&
            !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * A specialized version of `_.sample` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} array The array to sample.
     * @returns {*} Returns the random element.
     */
    function arraySample(array) {
      var length = array.length;
      return length ? array[baseRandom(0, length - 1)] : undefined;
    }

    /**
     * A specialized version of `_.sampleSize` for arrays.
     *
     * @private
     * @param {Array} array The array to sample.
     * @param {number} n The number of elements to sample.
     * @returns {Array} Returns the random elements.
     */
    function arraySampleSize(array, n) {
      var result = arrayShuffle(array);
      result.length = baseClamp(n, 0, result.length);
      return result;
    }

    /**
     * A specialized version of `_.shuffle` for arrays.
     *
     * @private
     * @param {Array} array The array to shuffle.
     * @returns {Array} Returns the new shuffled array.
     */
    function arrayShuffle(array) {
      return shuffleSelf(copyArray(array));
    }

    /**
     * Used by `_.defaults` to customize its `_.assignIn` use.
     *
     * @private
     * @param {*} objValue The destination value.
     * @param {*} srcValue The source value.
     * @param {string} key The key of the property to assign.
     * @param {Object} object The parent object of `objValue`.
     * @returns {*} Returns the value to assign.
     */
    function assignInDefaults(objValue, srcValue, key, object) {
      if (objValue === undefined ||
          (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) {
        return srcValue;
      }
      return objValue;
    }

    /**
     * This function is like `assignValue` except that it doesn't assign
     * `undefined` values.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignMergeValue(object, key, value) {
      if ((value !== undefined && !eq(object[key], value)) ||
          (typeof key == 'number' && value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
          (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
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
     * Aggregates elements of `collection` on `accumulator` with keys transformed
     * by `iteratee` and values set by `setter`.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} setter The function to set `accumulator` values.
     * @param {Function} iteratee The iteratee to transform keys.
     * @param {Object} accumulator The initial aggregated object.
     * @returns {Function} Returns `accumulator`.
     */
    function baseAggregator(collection, setter, iteratee, accumulator) {
      baseEach(collection, function(value, key, collection) {
        setter(accumulator, value, iteratee(value), collection);
      });
      return accumulator;
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
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && defineProperty) {
        defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    /**
     * The base implementation of `_.at` without support for individual paths.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {string[]} paths The property paths of elements to pick.
     * @returns {Array} Returns the picked elements.
     */
    function baseAt(object, paths) {
      var index = -1,
          isNil = object == null,
          length = paths.length,
          result = Array(length);

      while (++index < length) {
        result[index] = isNil ? undefined : get(object, paths[index]);
      }
      return result;
    }

    /**
     * The base implementation of `_.clamp` which doesn't coerce arguments.
     *
     * @private
     * @param {number} number The number to clamp.
     * @param {number} [lower] The lower bound.
     * @param {number} upper The upper bound.
     * @returns {number} Returns the clamped number.
     */
    function baseClamp(number, lower, upper) {
      if (number === number) {
        if (upper !== undefined) {
          number = number <= upper ? number : upper;
        }
        if (lower !== undefined) {
          number = number >= lower ? number : lower;
        }
      }
      return number;
    }

    /**
     * The base implementation of `_.clone` and `_.cloneDeep` which tracks
     * traversed objects.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @param {boolean} [isFull] Specify a clone including symbols.
     * @param {Function} [customizer] The function to customize cloning.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The parent object of `value`.
     * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
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

        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
          result = initCloneObject(isFunc ? {} : value);
          if (!isDeep) {
            return copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, baseClone, isDeep);
        }
      }
      // Check for circular references and return its corresponding clone.
      stack || (stack = new Stack);
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);

      if (!isArr) {
        var props = isFull ? getAllKeys(value) : keys(value);
      }
      arrayEach(props || value, function(subValue, key) {
        if (props) {
          key = subValue;
          subValue = value[key];
        }
        // Recursively populate clone (susceptible to call stack limits).
        assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
      });
      return result;
    }

    /**
     * The base implementation of `_.conforms` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property predicates to conform to.
     * @returns {Function} Returns the new spec function.
     */
    function baseConforms(source) {
      var props = keys(source);
      return function(object) {
        return baseConformsTo(object, source, props);
      };
    }

    /**
     * The base implementation of `_.conformsTo` which accepts `props` to check.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property predicates to conform to.
     * @returns {boolean} Returns `true` if `object` conforms, else `false`.
     */
    function baseConformsTo(object, source, props) {
      var length = props.length;
      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (length--) {
        var key = props[length],
            predicate = source[key],
            value = object[key];

        if ((value === undefined && !(key in object)) || !predicate(value)) {
          return false;
        }
      }
      return true;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(proto) {
      return isObject(proto) ? objectCreate(proto) : {};
    }

    /**
     * The base implementation of `_.delay` and `_.defer` which accepts `args`
     * to provide to `func`.
     *
     * @private
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay invocation.
     * @param {Array} args The arguments to provide to `func`.
     * @returns {number|Object} Returns the timer id or timeout object.
     */
    function baseDelay(func, wait, args) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * The base implementation of methods like `_.difference` without support
     * for excluding multiple arrays or iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Array} values The values to exclude.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of filtered values.
     */
    function baseDifference(array, values, iteratee, comparator) {
      var index = -1,
          includes = arrayIncludes,
          isCommon = true,
          length = array.length,
          result = [],
          valuesLength = values.length;

      if (!length) {
        return result;
      }
      if (iteratee) {
        values = arrayMap(values, baseUnary(iteratee));
      }
      if (comparator) {
        includes = arrayIncludesWith;
        isCommon = false;
      }
      else if (values.length >= LARGE_ARRAY_SIZE) {
        includes = cacheHas;
        isCommon = false;
        values = new SetCache(values);
      }
      outer:
      while (++index < length) {
        var value = array[index],
            computed = iteratee ? iteratee(value) : value;

        value = (comparator || value !== 0) ? value : 0;
        if (isCommon && computed === computed) {
          var valuesIndex = valuesLength;
          while (valuesIndex--) {
            if (values[valuesIndex] === computed) {
              continue outer;
            }
          }
          result.push(value);
        }
        else if (!includes(values, computed, comparator)) {
          result.push(value);
        }
      }
      return result;
    }

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
     * The base implementation of `_.forEachRight` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     */
    var baseEachRight = createBaseEach(baseForOwnRight, true);

    /**
     * The base implementation of `_.every` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`
     */
    function baseEvery(collection, predicate) {
      var result = true;
      baseEach(collection, function(value, index, collection) {
        result = !!predicate(value, index, collection);
        return result;
      });
      return result;
    }

    /**
     * The base implementation of methods like `_.max` and `_.min` which accepts a
     * `comparator` to determine the extremum value.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The iteratee invoked per iteration.
     * @param {Function} comparator The comparator used to compare values.
     * @returns {*} Returns the extremum value.
     */
    function baseExtremum(array, iteratee, comparator) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        var value = array[index],
            current = iteratee(value);

        if (current != null && (computed === undefined
              ? (current === current && !isSymbol(current))
              : comparator(current, computed)
            )) {
          var computed = current,
              result = value;
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.fill` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to fill.
     * @param {*} value The value to fill `array` with.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns `array`.
     */
    function baseFill(array, value, start, end) {
      var length = array.length;

      start = toInteger(start);
      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = (end === undefined || end > length) ? length : toInteger(end);
      if (end < 0) {
        end += length;
      }
      end = start > end ? 0 : toLength(end);
      while (start < end) {
        array[start++] = value;
      }
      return array;
    }

    /**
     * The base implementation of `_.filter` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function baseFilter(collection, predicate) {
      var result = [];
      baseEach(collection, function(value, index, collection) {
        if (predicate(value, index, collection)) {
          result.push(value);
        }
      });
      return result;
    }

    /**
     * The base implementation of `_.flatten` with support for restricting flattening.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {number} depth The maximum recursion depth.
     * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
     * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
     * @param {Array} [result=[]] The initial result value.
     * @returns {Array} Returns the new flattened array.
     */
    function baseFlatten(array, depth, predicate, isStrict, result) {
      var index = -1,
          length = array.length;

      predicate || (predicate = isFlattenable);
      result || (result = []);

      while (++index < length) {
        var value = array[index];
        if (depth > 0 && predicate(value)) {
          if (depth > 1) {
            // Recursively flatten arrays (susceptible to call stack limits).
            baseFlatten(value, depth - 1, predicate, isStrict, result);
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
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = createBaseFor();

    /**
     * This function is like `baseFor` except that it iterates over properties
     * in the opposite order.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseForRight = createBaseFor(true);

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
     * The base implementation of `_.forOwnRight` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwnRight(object, iteratee) {
      return object && baseForRight(object, iteratee, keys);
    }

    /**
     * The base implementation of `_.functions` which creates an array of
     * `object` function property names filtered from `props`.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Array} props The property names to filter.
     * @returns {Array} Returns the function names.
     */
    function baseFunctions(object, props) {
      return arrayFilter(props, function(key) {
        return isFunction(object[key]);
      });
    }

    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path) {
      path = isKey(path, object) ? [path] : castPath(path);

      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return (index && index == length) ? object : undefined;
    }

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }

    /**
     * The base implementation of `getTag`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      return objectToString.call(value);
    }

    /**
     * The base implementation of `_.gt` which doesn't coerce arguments.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is greater than `other`,
     *  else `false`.
     */
    function baseGt(value, other) {
      return value > other;
    }

    /**
     * The base implementation of `_.has` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHas(object, key) {
      return object != null && hasOwnProperty.call(object, key);
    }

    /**
     * The base implementation of `_.hasIn` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }

    /**
     * The base implementation of `_.inRange` which doesn't coerce arguments.
     *
     * @private
     * @param {number} number The number to check.
     * @param {number} start The start of the range.
     * @param {number} end The end of the range.
     * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
     */
    function baseInRange(number, start, end) {
      return number >= nativeMin(start, end) && number < nativeMax(start, end);
    }

    /**
     * The base implementation of methods like `_.intersection`, without support
     * for iteratee shorthands, that accepts an array of arrays to inspect.
     *
     * @private
     * @param {Array} arrays The arrays to inspect.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of shared values.
     */
    function baseIntersection(arrays, iteratee, comparator) {
      var includes = comparator ? arrayIncludesWith : arrayIncludes,
          length = arrays[0].length,
          othLength = arrays.length,
          othIndex = othLength,
          caches = Array(othLength),
          maxLength = Infinity,
          result = [];

      while (othIndex--) {
        var array = arrays[othIndex];
        if (othIndex && iteratee) {
          array = arrayMap(array, baseUnary(iteratee));
        }
        maxLength = nativeMin(array.length, maxLength);
        caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120))
          ? new SetCache(othIndex && array)
          : undefined;
      }
      array = arrays[0];

      var index = -1,
          seen = caches[0];

      outer:
      while (++index < length && result.length < maxLength) {
        var value = array[index],
            computed = iteratee ? iteratee(value) : value;

        value = (comparator || value !== 0) ? value : 0;
        if (!(seen
              ? cacheHas(seen, computed)
              : includes(result, computed, comparator)
            )) {
          othIndex = othLength;
          while (--othIndex) {
            var cache = caches[othIndex];
            if (!(cache
                  ? cacheHas(cache, computed)
                  : includes(arrays[othIndex], computed, comparator))
                ) {
              continue outer;
            }
          }
          if (seen) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.invert` and `_.invertBy` which inverts
     * `object` with values transformed by `iteratee` and set by `setter`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} setter The function to set `accumulator` values.
     * @param {Function} iteratee The iteratee to transform values.
     * @param {Object} accumulator The initial inverted object.
     * @returns {Function} Returns `accumulator`.
     */
    function baseInverter(object, setter, iteratee, accumulator) {
      baseForOwn(object, function(value, key, object) {
        setter(accumulator, iteratee(value), key, object);
      });
      return accumulator;
    }

    /**
     * The base implementation of `_.invoke` without support for individual
     * method arguments.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the method to invoke.
     * @param {Array} args The arguments to invoke the method with.
     * @returns {*} Returns the result of the invoked method.
     */
    function baseInvoke(object, path, args) {
      if (!isKey(path, object)) {
        path = castPath(path);
        object = parent(object, path);
        path = last(path);
      }
      var func = object == null ? object : object[toKey(path)];
      return func == null ? undefined : apply(func, object, args);
    }

    /**
     * The base implementation of `_.isArrayBuffer` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
     */
    function baseIsArrayBuffer(value) {
      return isObjectLike(value) && objectToString.call(value) == arrayBufferTag;
    }

    /**
     * The base implementation of `_.isDate` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
     */
    function baseIsDate(value) {
      return isObjectLike(value) && objectToString.call(value) == dateTag;
    }

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {boolean} [bitmask] The bitmask of comparison flags.
     *  The bitmask may be composed of the following flags:
     *     1 - Unordered comparison
     *     2 - Partial comparison
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, customizer, bitmask, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
    }

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = arrayTag,
          othTag = arrayTag;

      if (!objIsArr) {
        objTag = getTag(object);
        objTag = objTag == argsTag ? objectTag : objTag;
      }
      if (!othIsArr) {
        othTag = getTag(other);
        othTag = othTag == argsTag ? objectTag : othTag;
      }
      var objIsObj = objTag == objectTag,
          othIsObj = othTag == objectTag,
          isSameTag = objTag == othTag;

      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack);
        return (objIsArr || isTypedArray(object))
          ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
          : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
      }
      if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new Stack);
          return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack);
      return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
    }

    /**
     * The base implementation of `_.isMap` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     */
    function baseIsMap(value) {
      return isObjectLike(value) && getTag(value) == mapTag;
    }

    /**
     * The base implementation of `_.isMatch` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Array} matchData The property names, values, and compare flags to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;

      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if ((noCustomizer && data[2])
              ? data[1] !== object[data[0]]
              : !(data[0] in object)
            ) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];

        if (noCustomizer && data[2]) {
          if (objValue === undefined && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack;
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === undefined
                ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
                : result
              )) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * The base implementation of `_.isRegExp` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
     */
    function baseIsRegExp(value) {
      return isObject(value) && objectToString.call(value) == regexpTag;
    }

    /**
     * The base implementation of `_.isSet` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     */
    function baseIsSet(value) {
      return isObjectLike(value) && getTag(value) == setTag;
    }

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
    }

    /**
     * The base implementation of `_.iteratee`.
     *
     * @private
     * @param {*} [value=_.identity] The value to convert to an iteratee.
     * @returns {Function} Returns the iteratee.
     */
    function baseIteratee(value) {
      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
      if (typeof value == 'function') {
        return value;
      }
      if (value == null) {
        return identity;
      }
      if (typeof value == 'object') {
        return isArray(value)
          ? baseMatchesProperty(value[0], value[1])
          : baseMatches(value);
      }
      return property(value);
    }

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object),
          result = [];

      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.lt` which doesn't coerce arguments.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is less than `other`,
     *  else `false`.
     */
    function baseLt(value, other) {
      return value < other;
    }

    /**
     * The base implementation of `_.map` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function baseMap(collection, iteratee) {
      var index = -1,
          result = isArrayLike(collection) ? Array(collection.length) : [];

      baseEach(collection, function(value, key, collection) {
        result[++index] = iteratee(value, key, collection);
      });
      return result;
    }

    /**
     * The base implementation of `_.matches` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatches(source) {
      var matchData = getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || baseIsMatch(object, source, matchData);
      };
    }

    /**
     * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatchesProperty(path, srcValue) {
      if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get(object, path);
        return (objValue === undefined && objValue === srcValue)
          ? hasIn(object, path)
          : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
      };
    }

    /**
     * The base implementation of `_.merge` without support for multiple sources.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {number} srcIndex The index of `source`.
     * @param {Function} [customizer] The function to customize merged values.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     */
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      if (!(isArray(source) || isTypedArray(source))) {
        var props = baseKeysIn(source);
      }
      arrayEach(props || source, function(srcValue, key) {
        if (props) {
          key = srcValue;
          srcValue = source[key];
        }
        if (isObject(srcValue)) {
          stack || (stack = new Stack);
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        }
        else {
          var newValue = customizer
            ? customizer(object[key], srcValue, (key + ''), object, source, stack)
            : undefined;

          if (newValue === undefined) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      });
    }

    /**
     * A specialized version of `baseMerge` for arrays and objects which performs
     * deep merges and tracks traversed objects enabling objects with circular
     * references to be merged.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {string} key The key of the value to merge.
     * @param {number} srcIndex The index of `source`.
     * @param {Function} mergeFunc The function to merge values.
     * @param {Function} [customizer] The function to customize assigned values.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     */
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = object[key],
          srcValue = source[key],
          stacked = stack.get(srcValue);

      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer
        ? customizer(objValue, srcValue, (key + ''), object, source, stack)
        : undefined;

      var isCommon = newValue === undefined;

      if (isCommon) {
        newValue = srcValue;
        if (isArray(srcValue) || isTypedArray(srcValue)) {
          if (isArray(objValue)) {
            newValue = objValue;
          }
          else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          }
          else {
            isCommon = false;
            newValue = baseClone(srcValue, true);
          }
        }
        else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          }
          else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
            isCommon = false;
            newValue = baseClone(srcValue, true);
          }
          else {
            newValue = objValue;
          }
        }
        else {
          isCommon = false;
        }
      }
      if (isCommon) {
        // Recursively merge objects and arrays (susceptible to call stack limits).
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack['delete'](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }

    /**
     * The base implementation of `_.nth` which doesn't coerce arguments.
     *
     * @private
     * @param {Array} array The array to query.
     * @param {number} n The index of the element to return.
     * @returns {*} Returns the nth element of `array`.
     */
    function baseNth(array, n) {
      var length = array.length;
      if (!length) {
        return;
      }
      n += n < 0 ? length : 0;
      return isIndex(n, length) ? array[n] : undefined;
    }

    /**
     * The base implementation of `_.orderBy` without param guards.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
     * @param {string[]} orders The sort orders of `iteratees`.
     * @returns {Array} Returns the new sorted array.
     */
    function baseOrderBy(collection, iteratees, orders) {
      var index = -1;
      iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(getIteratee()));

      var result = baseMap(collection, function(value, key, collection) {
        var criteria = arrayMap(iteratees, function(iteratee) {
          return iteratee(value);
        });
        return { 'criteria': criteria, 'index': ++index, 'value': value };
      });

      return baseSortBy(result, function(object, other) {
        return compareMultiple(object, other, orders);
      });
    }

    /**
     * The base implementation of `_.pick` without support for individual
     * property identifiers.
     *
     * @private
     * @param {Object} object The source object.
     * @param {string[]} props The property identifiers to pick.
     * @returns {Object} Returns the new object.
     */
    function basePick(object, props) {
      object = Object(object);
      return basePickBy(object, props, function(value, key) {
        return key in object;
      });
    }

    /**
     * The base implementation of  `_.pickBy` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The source object.
     * @param {string[]} props The property identifiers to pick from.
     * @param {Function} predicate The function invoked per property.
     * @returns {Object} Returns the new object.
     */
    function basePickBy(object, props, predicate) {
      var index = -1,
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index],
            value = object[key];

        if (predicate(value, key)) {
          baseAssignValue(result, key, value);
        }
      }
      return result;
    }

    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyDeep(path) {
      return function(object) {
        return baseGet(object, path);
      };
    }

    /**
     * The base implementation of `_.pullAllBy` without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to remove.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns `array`.
     */
    function basePullAll(array, values, iteratee, comparator) {
      var indexOf = comparator ? baseIndexOfWith : baseIndexOf,
          index = -1,
          length = values.length,
          seen = array;

      if (array === values) {
        values = copyArray(values);
      }
      if (iteratee) {
        seen = arrayMap(array, baseUnary(iteratee));
      }
      while (++index < length) {
        var fromIndex = 0,
            value = values[index],
            computed = iteratee ? iteratee(value) : value;

        while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
          if (seen !== array) {
            splice.call(seen, fromIndex, 1);
          }
          splice.call(array, fromIndex, 1);
        }
      }
      return array;
    }

    /**
     * The base implementation of `_.pullAt` without support for individual
     * indexes or capturing the removed elements.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {number[]} indexes The indexes of elements to remove.
     * @returns {Array} Returns `array`.
     */
    function basePullAt(array, indexes) {
      var length = array ? indexes.length : 0,
          lastIndex = length - 1;

      while (length--) {
        var index = indexes[length];
        if (length == lastIndex || index !== previous) {
          var previous = index;
          if (isIndex(index)) {
            splice.call(array, index, 1);
          }
          else if (!isKey(index, array)) {
            var path = castPath(index),
                object = parent(array, path);

            if (object != null) {
              delete object[toKey(last(path))];
            }
          }
          else {
            delete array[toKey(index)];
          }
        }
      }
      return array;
    }

    /**
     * The base implementation of `_.random` without support for returning
     * floating-point numbers.
     *
     * @private
     * @param {number} lower The lower bound.
     * @param {number} upper The upper bound.
     * @returns {number} Returns the random number.
     */
    function baseRandom(lower, upper) {
      return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
    }

    /**
     * The base implementation of `_.range` and `_.rangeRight` which doesn't
     * coerce arguments.
     *
     * @private
     * @param {number} start The start of the range.
     * @param {number} end The end of the range.
     * @param {number} step The value to increment or decrement by.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Array} Returns the range of numbers.
     */
    function baseRange(start, end, step, fromRight) {
      var index = -1,
          length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
          result = Array(length);

      while (length--) {
        result[fromRight ? length : ++index] = start;
        start += step;
      }
      return result;
    }

    /**
     * The base implementation of `_.repeat` which doesn't coerce arguments.
     *
     * @private
     * @param {string} string The string to repeat.
     * @param {number} n The number of times to repeat the string.
     * @returns {string} Returns the repeated string.
     */
    function baseRepeat(string, n) {
      var result = '';
      if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
        return result;
      }
      // Leverage the exponentiation by squaring algorithm for a faster repeat.
      // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
      do {
        if (n % 2) {
          result += string;
        }
        n = nativeFloor(n / 2);
        if (n) {
          string += string;
        }
      } while (n);

      return result;
    }

    /**
     * The base implementation of `_.rest` which doesn't validate or coerce arguments.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     */
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + '');
    }

    /**
     * The base implementation of `_.set`.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @param {Function} [customizer] The function to customize path creation.
     * @returns {Object} Returns `object`.
     */
    function baseSet(object, path, value, customizer) {
      if (!isObject(object)) {
        return object;
      }
      path = isKey(path, object) ? [path] : castPath(path);

      var index = -1,
          length = path.length,
          lastIndex = length - 1,
          nested = object;

      while (nested != null && ++index < length) {
        var key = toKey(path[index]),
            newValue = value;

        if (index != lastIndex) {
          var objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : undefined;
          if (newValue === undefined) {
            newValue = isObject(objValue)
              ? objValue
              : (isIndex(path[index + 1]) ? [] : {});
          }
        }
        assignValue(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }

    /**
     * The base implementation of `setData` without support for hot loop shorting.
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
     * The base implementation of `setToString` without support for hot loop shorting.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var baseSetToString = !nativeDefineProperty ? identity : function(func, string) {
      return nativeDefineProperty(func, 'toString', {
        'configurable': true,
        'enumerable': false,
        'value': constant(string),
        'writable': true
      });
    };

    /**
     * The base implementation of `_.slice` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */
    function baseSlice(array, start, end) {
      var index = -1,
          length = array.length;

      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : ((end - start) >>> 0);
      start >>>= 0;

      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }

    /**
     * The base implementation of `_.some` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function baseSome(collection, predicate) {
      var result;

      baseEach(collection, function(value, index, collection) {
        result = predicate(value, index, collection);
        return !result;
      });
      return !!result;
    }

    /**
     * The base implementation of `_.sortedIndex` and `_.sortedLastIndex` which
     * performs a binary search of `array` to determine the index at which `value`
     * should be inserted into `array` in order to maintain its sort order.
     *
     * @private
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {boolean} [retHighest] Specify returning the highest qualified index.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     */
    function baseSortedIndex(array, value, retHighest) {
      var low = 0,
          high = array ? array.length : low;

      if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
        while (low < high) {
          var mid = (low + high) >>> 1,
              computed = array[mid];

          if (computed !== null && !isSymbol(computed) &&
              (retHighest ? (computed <= value) : (computed < value))) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return high;
      }
      return baseSortedIndexBy(array, value, identity, retHighest);
    }

    /**
     * The base implementation of `_.sortedIndexBy` and `_.sortedLastIndexBy`
     * which invokes `iteratee` for `value` and each element of `array` to compute
     * their sort ranking. The iteratee is invoked with one argument; (value).
     *
     * @private
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function} iteratee The iteratee invoked per element.
     * @param {boolean} [retHighest] Specify returning the highest qualified index.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     */
    function baseSortedIndexBy(array, value, iteratee, retHighest) {
      value = iteratee(value);

      var low = 0,
          high = array ? array.length : 0,
          valIsNaN = value !== value,
          valIsNull = value === null,
          valIsSymbol = isSymbol(value),
          valIsUndefined = value === undefined;

      while (low < high) {
        var mid = nativeFloor((low + high) / 2),
            computed = iteratee(array[mid]),
            othIsDefined = computed !== undefined,
            othIsNull = computed === null,
            othIsReflexive = computed === computed,
            othIsSymbol = isSymbol(computed);

        if (valIsNaN) {
          var setLow = retHighest || othIsReflexive;
        } else if (valIsUndefined) {
          setLow = othIsReflexive && (retHighest || othIsDefined);
        } else if (valIsNull) {
          setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
        } else if (valIsSymbol) {
          setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
        } else if (othIsNull || othIsSymbol) {
          setLow = false;
        } else {
          setLow = retHighest ? (computed <= value) : (computed < value);
        }
        if (setLow) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return nativeMin(high, MAX_ARRAY_INDEX);
    }

    /**
     * The base implementation of `_.sortedUniq` and `_.sortedUniqBy` without
     * support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     */
    function baseSortedUniq(array, iteratee) {
      var index = -1,
          length = array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index],
            computed = iteratee ? iteratee(value) : value;

        if (!index || !eq(computed, seen)) {
          var seen = computed;
          result[resIndex++] = value === 0 ? 0 : value;
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.toNumber` which doesn't ensure correct
     * conversions of binary, hexadecimal, or octal string values.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     */
    function baseToNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      return +value;
    }

    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    /**
     * The base implementation of `_.uniqBy` without support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     */
    function baseUniq(array, iteratee, comparator) {
      var index = -1,
          includes = arrayIncludes,
          length = array.length,
          isCommon = true,
          result = [],
          seen = result;

      if (comparator) {
        isCommon = false;
        includes = arrayIncludesWith;
      }
      else if (length >= LARGE_ARRAY_SIZE) {
        var set = iteratee ? null : createSet(array);
        if (set) {
          return setToArray(set);
        }
        isCommon = false;
        includes = cacheHas;
        seen = new SetCache;
      }
      else {
        seen = iteratee ? [] : result;
      }
      outer:
      while (++index < length) {
        var value = array[index],
            computed = iteratee ? iteratee(value) : value;

        value = (comparator || value !== 0) ? value : 0;
        if (isCommon && computed === computed) {
          var seenIndex = seen.length;
          while (seenIndex--) {
            if (seen[seenIndex] === computed) {
              continue outer;
            }
          }
          if (iteratee) {
            seen.push(computed);
          }
          result.push(value);
        }
        else if (!includes(seen, computed, comparator)) {
          if (seen !== result) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.unset`.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to unset.
     * @returns {boolean} Returns `true` if the property is deleted, else `false`.
     */
    function baseUnset(object, path) {
      path = isKey(path, object) ? [path] : castPath(path);
      object = parent(object, path);

      var key = toKey(last(path));
      return !(object != null && hasOwnProperty.call(object, key)) || delete object[key];
    }

    /**
     * The base implementation of `_.update`.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to update.
     * @param {Function} updater The function to produce the updated value.
     * @param {Function} [customizer] The function to customize path creation.
     * @returns {Object} Returns `object`.
     */
    function baseUpdate(object, path, updater, customizer) {
      return baseSet(object, path, updater(baseGet(object, path)), customizer);
    }

    /**
     * The base implementation of methods like `_.dropWhile` and `_.takeWhile`
     * without support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to query.
     * @param {Function} predicate The function invoked per iteration.
     * @param {boolean} [isDrop] Specify dropping elements instead of taking them.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Array} Returns the slice of `array`.
     */
    function baseWhile(array, predicate, isDrop, fromRight) {
      var length = array.length,
          index = fromRight ? length : -1;

      while ((fromRight ? index-- : ++index < length) &&
        predicate(array[index], index, array)) {}

      return isDrop
        ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
        : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
    }

    /**
     * The base implementation of `wrapperValue` which returns the result of
     * performing a sequence of actions on the unwrapped `value`, where each
     * successive action is supplied the return value of the previous.
     *
     * @private
     * @param {*} value The unwrapped value.
     * @param {Array} actions Actions to perform to resolve the unwrapped value.
     * @returns {*} Returns the resolved value.
     */
    function baseWrapperValue(value, actions) {
      var result = value;
      if (result instanceof LazyWrapper) {
        result = result.value();
      }
      return arrayReduce(actions, function(result, action) {
        return action.func.apply(action.thisArg, arrayPush([result], action.args));
      }, result);
    }

    /**
     * The base implementation of methods like `_.xor`, without support for
     * iteratee shorthands, that accepts an array of arrays to inspect.
     *
     * @private
     * @param {Array} arrays The arrays to inspect.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of values.
     */
    function baseXor(arrays, iteratee, comparator) {
      var index = -1,
          length = arrays.length;

      while (++index < length) {
        var result = result
          ? arrayPush(
              baseDifference(result, arrays[index], iteratee, comparator),
              baseDifference(arrays[index], result, iteratee, comparator)
            )
          : arrays[index];
      }
      return (result && result.length) ? baseUniq(result, iteratee, comparator) : [];
    }

    /**
     * This base implementation of `_.zipObject` which assigns values using `assignFunc`.
     *
     * @private
     * @param {Array} props The property identifiers.
     * @param {Array} values The property values.
     * @param {Function} assignFunc The function to assign values.
     * @returns {Object} Returns the new object.
     */
    function baseZipObject(props, values, assignFunc) {
      var index = -1,
          length = props.length,
          valsLength = values.length,
          result = {};

      while (++index < length) {
        var value = index < valsLength ? values[index] : undefined;
        assignFunc(result, props[index], value);
      }
      return result;
    }

    /**
     * Casts `value` to an empty array if it's not an array like object.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {Array|Object} Returns the cast array-like object.
     */
    function castArrayLikeObject(value) {
      return isArrayLikeObject(value) ? value : [];
    }

    /**
     * Casts `value` to `identity` if it's not a function.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {Function} Returns cast function.
     */
    function castFunction(value) {
      return typeof value == 'function' ? value : identity;
    }

    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {Array} Returns the cast property path array.
     */
    function castPath(value) {
      return isArray(value) ? value : stringToPath(value);
    }

    /**
     * A `baseRest` alias which can be replaced with `identity` by module
     * replacement plugins.
     *
     * @private
     * @type {Function}
     * @param {Function} func The function to apply a rest parameter to.
     * @returns {Function} Returns the new function.
     */
    var castRest = baseRest;

    /**
     * Casts `array` to a slice if it's needed.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {number} start The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the cast slice.
     */
    function castSlice(array, start, end) {
      var length = array.length;
      end = end === undefined ? length : end;
      return (!start && end >= length) ? array : baseSlice(array, start, end);
    }

    /**
     * A simple wrapper around the global [`clearTimeout`](https://mdn.io/clearTimeout).
     *
     * @private
     * @param {number|Object} id The timer id or timeout object of the timer to clear.
     */
    var clearTimeout = ctxClearTimeout || function(id) {
      return root.clearTimeout(id);
    };

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var result = new buffer.constructor(buffer.length);
      buffer.copy(result);
      return result;
    }

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array(result).set(new Uint8Array(arrayBuffer));
      return result;
    }

    /**
     * Creates a clone of `dataView`.
     *
     * @private
     * @param {Object} dataView The data view to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned data view.
     */
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }

    /**
     * Creates a clone of `map`.
     *
     * @private
     * @param {Object} map The map to clone.
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned map.
     */
    function cloneMap(map, isDeep, cloneFunc) {
      var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
      return arrayReduce(array, addMapEntry, new map.constructor);
    }

    /**
     * Creates a clone of `regexp`.
     *
     * @private
     * @param {Object} regexp The regexp to clone.
     * @returns {Object} Returns the cloned regexp.
     */
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }

    /**
     * Creates a clone of `set`.
     *
     * @private
     * @param {Object} set The set to clone.
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned set.
     */
    function cloneSet(set, isDeep, cloneFunc) {
      var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
      return arrayReduce(array, addSetEntry, new set.constructor);
    }

    /**
     * Creates a clone of the `symbol` object.
     *
     * @private
     * @param {Object} symbol The symbol object to clone.
     * @returns {Object} Returns the cloned symbol object.
     */
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
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
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    /**
     * Compares values to sort them in ascending order.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {number} Returns the sort order indicator for `value`.
     */
    function compareAscending(value, other) {
      if (value !== other) {
        var valIsDefined = value !== undefined,
            valIsNull = value === null,
            valIsReflexive = value === value,
            valIsSymbol = isSymbol(value);

        var othIsDefined = other !== undefined,
            othIsNull = other === null,
            othIsReflexive = other === other,
            othIsSymbol = isSymbol(other);

        if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
            (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
            (valIsNull && othIsDefined && othIsReflexive) ||
            (!valIsDefined && othIsReflexive) ||
            !valIsReflexive) {
          return 1;
        }
        if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
            (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
            (othIsNull && valIsDefined && valIsReflexive) ||
            (!othIsDefined && valIsReflexive) ||
            !othIsReflexive) {
          return -1;
        }
      }
      return 0;
    }

    /**
     * Used by `_.orderBy` to compare multiple properties of a value to another
     * and stable sort them.
     *
     * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
     * specify an order of "desc" for descending or "asc" for ascending sort order
     * of corresponding values.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {boolean[]|string[]} orders The order to sort by for each property.
     * @returns {number} Returns the sort order indicator for `object`.
     */
    function compareMultiple(object, other, orders) {
      var index = -1,
          objCriteria = object.criteria,
          othCriteria = other.criteria,
          length = objCriteria.length,
          ordersLength = orders.length;

      while (++index < length) {
        var result = compareAscending(objCriteria[index], othCriteria[index]);
        if (result) {
          if (index >= ordersLength) {
            return result;
          }
          var order = orders[index];
          return result * (order == 'desc' ? -1 : 1);
        }
      }
      // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
      // that causes it, under certain circumstances, to provide the same value for
      // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
      // for more details.
      //
      // This also ensures a stable sort in V8 and other engines.
      // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
      return object.index - other.index;
    }

    /**
     * Creates an array that is the composition of partially applied arguments,
     * placeholders, and provided arguments into a single array of arguments.
     *
     * @private
     * @param {Array} args The provided arguments.
     * @param {Array} partials The arguments to prepend to those provided.
     * @param {Array} holders The `partials` placeholder indexes.
     * @params {boolean} [isCurried] Specify composing for a curried function.
     * @returns {Array} Returns the new array of composed arguments.
     */
    function composeArgs(args, partials, holders, isCurried) {
      var argsIndex = -1,
          argsLength = args.length,
          holdersLength = holders.length,
          leftIndex = -1,
          leftLength = partials.length,
          rangeLength = nativeMax(argsLength - holdersLength, 0),
          result = Array(leftLength + rangeLength),
          isUncurried = !isCurried;

      while (++leftIndex < leftLength) {
        result[leftIndex] = partials[leftIndex];
      }
      while (++argsIndex < holdersLength) {
        if (isUncurried || argsIndex < argsLength) {
          result[holders[argsIndex]] = args[argsIndex];
        }
      }
      while (rangeLength--) {
        result[leftIndex++] = args[argsIndex++];
      }
      return result;
    }

    /**
     * This function is like `composeArgs` except that the arguments composition
     * is tailored for `_.partialRight`.
     *
     * @private
     * @param {Array} args The provided arguments.
     * @param {Array} partials The arguments to append to those provided.
     * @param {Array} holders The `partials` placeholder indexes.
     * @params {boolean} [isCurried] Specify composing for a curried function.
     * @returns {Array} Returns the new array of composed arguments.
     */
    function composeArgsRight(args, partials, holders, isCurried) {
      var argsIndex = -1,
          argsLength = args.length,
          holdersIndex = -1,
          holdersLength = holders.length,
          rightIndex = -1,
          rightLength = partials.length,
          rangeLength = nativeMax(argsLength - holdersLength, 0),
          result = Array(rangeLength + rightLength),
          isUncurried = !isCurried;

      while (++argsIndex < rangeLength) {
        result[argsIndex] = args[argsIndex];
      }
      var offset = argsIndex;
      while (++rightIndex < rightLength) {
        result[offset + rightIndex] = partials[rightIndex];
      }
      while (++holdersIndex < holdersLength) {
        if (isUncurried || argsIndex < argsLength) {
          result[offset + holders[holdersIndex]] = args[argsIndex++];
        }
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
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        if (newValue === undefined) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
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
     * Creates a function like `_.groupBy`.
     *
     * @private
     * @param {Function} setter The function to set accumulator values.
     * @param {Function} [initializer] The accumulator object initializer.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter, initializer) {
      return function(collection, iteratee) {
        var func = isArray(collection) ? arrayAggregator : baseAggregator,
            accumulator = initializer ? initializer() : {};

        return func(collection, setter, getIteratee(iteratee, 2), accumulator);
      };
    }

    /**
     * Creates a function like `_.assign`.
     *
     * @private
     * @param {Function} assigner The function to assign values.
     * @returns {Function} Returns the new assigner function.
     */
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1,
            length = sources.length,
            customizer = length > 1 ? sources[length - 1] : undefined,
            guard = length > 2 ? sources[2] : undefined;

        customizer = (assigner.length > 3 && typeof customizer == 'function')
          ? (length--, customizer)
          : undefined;

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
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
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
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createBind(func, bitmask, thisArg) {
      var isBind = bitmask & BIND_FLAG,
          Ctor = createCtor(func);

      function wrapper() {
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return fn.apply(isBind ? thisArg : this, arguments);
      }
      return wrapper;
    }

    /**
     * Creates a function like `_.lowerFirst`.
     *
     * @private
     * @param {string} methodName The name of the `String` case method to use.
     * @returns {Function} Returns the new case function.
     */
    function createCaseFirst(methodName) {
      return function(string) {
        string = toString(string);

        var strSymbols = hasUnicode(string)
          ? stringToArray(string)
          : undefined;

        var chr = strSymbols
          ? strSymbols[0]
          : string.charAt(0);

        var trailing = strSymbols
          ? castSlice(strSymbols, 1).join('')
          : string.slice(1);

        return chr[methodName]() + trailing;
      };
    }

    /**
     * Creates a function like `_.camelCase`.
     *
     * @private
     * @param {Function} callback The function to combine each word.
     * @returns {Function} Returns the new compounder function.
     */
    function createCompounder(callback) {
      return function(string) {
        return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
      };
    }

    /**
     * Creates a function that produces an instance of `Ctor` regardless of
     * whether it was invoked as part of a `new` expression or by `call` or `apply`.
     *
     * @private
     * @param {Function} Ctor The constructor to wrap.
     * @returns {Function} Returns the new wrapped function.
     */
    function createCtor(Ctor) {
      return function() {
        // Use a `switch` statement to work with class constructors. See
        // http://ecma-international.org/ecma-262/7.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
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
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @param {number} arity The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createCurry(func, bitmask, arity) {
      var Ctor = createCtor(func);

      function wrapper() {
        var length = arguments.length,
            args = Array(length),
            index = length,
            placeholder = getHolder(wrapper);

        while (index--) {
          args[index] = arguments[index];
        }
        var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
          ? []
          : replaceHolders(args, placeholder);

        length -= holders.length;
        if (length < arity) {
          return createRecurry(
            func, bitmask, createHybrid, wrapper.placeholder, undefined,
            args, holders, undefined, undefined, arity - length);
        }
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return apply(fn, this, args);
      }
      return wrapper;
    }

    /**
     * Creates a `_.find` or `_.findLast` function.
     *
     * @private
     * @param {Function} findIndexFunc The function to find the collection index.
     * @returns {Function} Returns the new find function.
     */
    function createFind(findIndexFunc) {
      return function(collection, predicate, fromIndex) {
        var iterable = Object(collection);
        if (!isArrayLike(collection)) {
          var iteratee = getIteratee(predicate, 3);
          collection = keys(collection);
          predicate = function(key) { return iteratee(iterable[key], key, iterable); };
        }
        var index = findIndexFunc(collection, predicate, fromIndex);
        return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
      };
    }

    /**
     * Creates a `_.flow` or `_.flowRight` function.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new flow function.
     */
    function createFlow(fromRight) {
      return flatRest(function(funcs) {
        var length = funcs.length,
            index = length,
            prereq = LodashWrapper.prototype.thru;

        if (fromRight) {
          funcs.reverse();
        }
        while (index--) {
          var func = funcs[index];
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          if (prereq && !wrapper && getFuncName(func) == 'wrapper') {
            var wrapper = new LodashWrapper([], true);
          }
        }
        index = wrapper ? index : length;
        while (++index < length) {
          func = funcs[index];

          var funcName = getFuncName(func),
              data = funcName == 'wrapper' ? getData(func) : undefined;

          if (data && isLaziable(data[0]) &&
                data[1] == (ARY_FLAG | CURRY_FLAG | PARTIAL_FLAG | REARG_FLAG) &&
                !data[4].length && data[9] == 1
              ) {
            wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
          } else {
            wrapper = (func.length == 1 && isLaziable(func))
              ? wrapper[funcName]()
              : wrapper.thru(func);
          }
        }
        return function() {
          var args = arguments,
              value = args[0];

          if (wrapper && args.length == 1 &&
              isArray(value) && value.length >= LARGE_ARRAY_SIZE) {
            return wrapper.plant(value).value();
          }
          var index = 0,
              result = length ? funcs[index].apply(this, args) : value;

          while (++index < length) {
            result = funcs[index].call(this, result);
          }
          return result;
        };
      });
    }

    /**
     * Creates a function that wraps `func` to invoke it with optional `this`
     * binding of `thisArg`, partial application, and currying.
     *
     * @private
     * @param {Function|string} func The function or method name to wrap.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {Array} [partials] The arguments to prepend to those provided to
     *  the new function.
     * @param {Array} [holders] The `partials` placeholder indexes.
     * @param {Array} [partialsRight] The arguments to append to those provided
     *  to the new function.
     * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
     * @param {Array} [argPos] The argument positions of the new function.
     * @param {number} [ary] The arity cap of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
      var isAry = bitmask & ARY_FLAG,
          isBind = bitmask & BIND_FLAG,
          isBindKey = bitmask & BIND_KEY_FLAG,
          isCurried = bitmask & (CURRY_FLAG | CURRY_RIGHT_FLAG),
          isFlip = bitmask & FLIP_FLAG,
          Ctor = isBindKey ? undefined : createCtor(func);

      function wrapper() {
        var length = arguments.length,
            args = Array(length),
            index = length;

        while (index--) {
          args[index] = arguments[index];
        }
        if (isCurried) {
          var placeholder = getHolder(wrapper),
              holdersCount = countHolders(args, placeholder);
        }
        if (partials) {
          args = composeArgs(args, partials, holders, isCurried);
        }
        if (partialsRight) {
          args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
        }
        length -= holdersCount;
        if (isCurried && length < arity) {
          var newHolders = replaceHolders(args, placeholder);
          return createRecurry(
            func, bitmask, createHybrid, wrapper.placeholder, thisArg,
            args, newHolders, argPos, ary, arity - length
          );
        }
        var thisBinding = isBind ? thisArg : this,
            fn = isBindKey ? thisBinding[func] : func;

        length = args.length;
        if (argPos) {
          args = reorder(args, argPos);
        } else if (isFlip && length > 1) {
          args.reverse();
        }
        if (isAry && ary < length) {
          args.length = ary;
        }
        if (this && this !== root && this instanceof wrapper) {
          fn = Ctor || createCtor(fn);
        }
        return fn.apply(thisBinding, args);
      }
      return wrapper;
    }

    /**
     * Creates a function like `_.invertBy`.
     *
     * @private
     * @param {Function} setter The function to set accumulator values.
     * @param {Function} toIteratee The function to resolve iteratees.
     * @returns {Function} Returns the new inverter function.
     */
    function createInverter(setter, toIteratee) {
      return function(object, iteratee) {
        return baseInverter(object, setter, toIteratee(iteratee), {});
      };
    }

    /**
     * Creates a function that performs a mathematical operation on two values.
     *
     * @private
     * @param {Function} operator The function to perform the operation.
     * @param {number} [defaultValue] The value used for `undefined` arguments.
     * @returns {Function} Returns the new mathematical operation function.
     */
    function createMathOperation(operator, defaultValue) {
      return function(value, other) {
        var result;
        if (value === undefined && other === undefined) {
          return defaultValue;
        }
        if (value !== undefined) {
          result = value;
        }
        if (other !== undefined) {
          if (result === undefined) {
            return other;
          }
          if (typeof value == 'string' || typeof other == 'string') {
            value = baseToString(value);
            other = baseToString(other);
          } else {
            value = baseToNumber(value);
            other = baseToNumber(other);
          }
          result = operator(value, other);
        }
        return result;
      };
    }

    /**
     * Creates a function like `_.over`.
     *
     * @private
     * @param {Function} arrayFunc The function to iterate over iteratees.
     * @returns {Function} Returns the new over function.
     */
    function createOver(arrayFunc) {
      return flatRest(function(iteratees) {
        iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
        return baseRest(function(args) {
          var thisArg = this;
          return arrayFunc(iteratees, function(iteratee) {
            return apply(iteratee, thisArg, args);
          });
        });
      });
    }

    /**
     * Creates the padding for `string` based on `length`. The `chars` string
     * is truncated if the number of characters exceeds `length`.
     *
     * @private
     * @param {number} length The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padding for `string`.
     */
    function createPadding(length, chars) {
      chars = chars === undefined ? ' ' : baseToString(chars);

      var charsLength = chars.length;
      if (charsLength < 2) {
        return charsLength ? baseRepeat(chars, length) : chars;
      }
      var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
      return hasUnicode(chars)
        ? castSlice(stringToArray(result), 0, length).join('')
        : result.slice(0, length);
    }

    /**
     * Creates a function that wraps `func` to invoke it with the `this` binding
     * of `thisArg` and `partials` prepended to the arguments it receives.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} partials The arguments to prepend to those provided to
     *  the new function.
     * @returns {Function} Returns the new wrapped function.
     */
    function createPartial(func, bitmask, thisArg, partials) {
      var isBind = bitmask & BIND_FLAG,
          Ctor = createCtor(func);

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
     * Creates a `_.range` or `_.rangeRight` function.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new range function.
     */
    function createRange(fromRight) {
      return function(start, end, step) {
        if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
          end = step = undefined;
        }
        // Ensure the sign of `-0` is preserved.
        start = toFinite(start);
        if (end === undefined) {
          end = start;
          start = 0;
        } else {
          end = toFinite(end);
        }
        step = step === undefined ? (start < end ? 1 : -1) : toFinite(step);
        return baseRange(start, end, step, fromRight);
      };
    }

    /**
     * Creates a function that performs a relational operation on two values.
     *
     * @private
     * @param {Function} operator The function to perform the operation.
     * @returns {Function} Returns the new relational operation function.
     */
    function createRelationalOperation(operator) {
      return function(value, other) {
        if (!(typeof value == 'string' && typeof other == 'string')) {
          value = toNumber(value);
          other = toNumber(other);
        }
        return operator(value, other);
      };
    }

    /**
     * Creates a function that wraps `func` to continue currying.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @param {Function} wrapFunc The function to create the `func` wrapper.
     * @param {*} placeholder The placeholder value.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {Array} [partials] The arguments to prepend to those provided to
     *  the new function.
     * @param {Array} [holders] The `partials` placeholder indexes.
     * @param {Array} [argPos] The argument positions of the new function.
     * @param {number} [ary] The arity cap of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
      var isCurry = bitmask & CURRY_FLAG,
          newHolders = isCurry ? holders : undefined,
          newHoldersRight = isCurry ? undefined : holders,
          newPartials = isCurry ? partials : undefined,
          newPartialsRight = isCurry ? undefined : partials;

      bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
      bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);

      if (!(bitmask & CURRY_BOUND_FLAG)) {
        bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
      }
      var newData = [
        func, bitmask, thisArg, newPartials, newHolders, newPartialsRight,
        newHoldersRight, argPos, ary, arity
      ];

      var result = wrapFunc.apply(undefined, newData);
      if (isLaziable(func)) {
        setData(result, newData);
      }
      result.placeholder = placeholder;
      return setWrapToString(result, func, bitmask);
    }

    /**
     * Creates a function like `_.round`.
     *
     * @private
     * @param {string} methodName The name of the `Math` method to use when rounding.
     * @returns {Function} Returns the new round function.
     */
    function createRound(methodName) {
      var func = Math[methodName];
      return function(number, precision) {
        number = toNumber(number);
        precision = nativeMin(toInteger(precision), 292);
        if (precision) {
          // Shift with exponential notation to avoid floating-point issues.
          // See [MDN](https://mdn.io/round#Examples) for more details.
          var pair = (toString(number) + 'e').split('e'),
              value = func(pair[0] + 'e' + (+pair[1] + precision));

          pair = (toString(value) + 'e').split('e');
          return +(pair[0] + 'e' + (+pair[1] - precision));
        }
        return func(number);
      };
    }

    /**
     * Creates a set object of `values`.
     *
     * @private
     * @param {Array} values The values to add to the set.
     * @returns {Object} Returns the new set.
     */
    var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
      return new Set(values);
    };

    /**
     * Creates a `_.toPairs` or `_.toPairsIn` function.
     *
     * @private
     * @param {Function} keysFunc The function to get the keys of a given object.
     * @returns {Function} Returns the new pairs function.
     */
    function createToPairs(keysFunc) {
      return function(object) {
        var tag = getTag(object);
        if (tag == mapTag) {
          return mapToArray(object);
        }
        if (tag == setTag) {
          return setToPairs(object);
        }
        return baseToPairs(object, keysFunc(object));
      };
    }

    /**
     * Creates a function that either curries or invokes `func` with optional
     * `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to wrap.
     * @param {number} bitmask The bitmask flags.
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
     *   512 - `_.flip`
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {Array} [partials] The arguments to be partially applied.
     * @param {Array} [holders] The `partials` placeholder indexes.
     * @param {Array} [argPos] The argument positions of the new function.
     * @param {number} [ary] The arity cap of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
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
      var data = isBindKey ? undefined : getData(func);

      var newData = [
        func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
        argPos, ary, arity
      ];

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
        var result = createBind(func, bitmask, thisArg);
      } else if (bitmask == CURRY_FLAG || bitmask == CURRY_RIGHT_FLAG) {
        result = createCurry(func, bitmask, arity);
      } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !holders.length) {
        result = createPartial(func, bitmask, thisArg, partials);
      } else {
        result = createHybrid.apply(undefined, newData);
      }
      var setter = data ? baseSetData : setData;
      return setWrapToString(setter(result, newData), func, bitmask);
    }

    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(array);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var index = -1,
          result = true,
          seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;

      stack.set(array, other);
      stack.set(other, array);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!arraySome(other, function(othValue, othIndex) {
                if (!cacheHas(seen, othIndex) &&
                    (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
                  return seen.push(othIndex);
                }
              })) {
            result = false;
            break;
          }
        } else if (!(
              arrValue === othValue ||
                equalFunc(arrValue, othValue, customizer, bitmask, stack)
            )) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      stack['delete'](other);
      return result;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
      switch (tag) {
        case dataViewTag:
          if ((object.byteLength != other.byteLength) ||
              (object.byteOffset != other.byteOffset)) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag:
          if ((object.byteLength != other.byteLength) ||
              !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
            return false;
          }
          return true;

        case boolTag:
        case dateTag:
        case numberTag:
          // Coerce booleans to `1` or `0` and dates to milliseconds.
          // Invalid dates are coerced to `NaN`.
          return eq(+object, +other);

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case regexpTag:
        case stringTag:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == (other + '');

        case mapTag:
          var convert = mapToArray;

        case setTag:
          var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
          convert || (convert = setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= UNORDERED_COMPARE_FLAG;

          // Recursively compare objects (susceptible to call stack limits).
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
          stack['delete'](object);
          return result;

        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
          objProps = keys(object),
          objLength = objProps.length,
          othProps = keys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
          return false;
        }
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined
              ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
              : compared
            )) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      stack['delete'](other);
      return result;
    }

    /**
     * A specialized version of `baseRest` which flattens the rest array.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @returns {Function} Returns the new function.
     */
    function flatRest(func) {
      return setToString(overRest(func, undefined, flatten), func + '');
    }

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }

    /**
     * Creates an array of own and inherited enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeysIn(object) {
      return baseGetAllKeys(object, keysIn, getSymbolsIn);
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
     * Gets the argument placeholder value for `func`.
     *
     * @private
     * @param {Function} func The function to inspect.
     * @returns {*} Returns the placeholder value.
     */
    function getHolder(func) {
      var object = hasOwnProperty.call(lodash, 'placeholder') ? lodash : func;
      return object.placeholder;
    }

    /**
     * Gets the appropriate "iteratee" function. If `_.iteratee` is customized,
     * this function returns the custom method, otherwise it returns `baseIteratee`.
     * If arguments are provided, the chosen function is invoked with them and
     * its result is returned.
     *
     * @private
     * @param {*} [value] The value to convert to an iteratee.
     * @param {number} [arity] The arity of the created iteratee.
     * @returns {Function} Returns the chosen function or its result.
     */
    function getIteratee() {
      var result = lodash.iteratee || iteratee;
      result = result === iteratee ? baseIteratee : result;
      return arguments.length ? result(arguments[0], arguments[1]) : result;
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Gets the property names, values, and compare flags of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the match data of `object`.
     */
    function getMatchData(object) {
      var result = keys(object),
          length = result.length;

      while (length--) {
        var key = result[length],
            value = object[key];

        result[length] = [key, value, isStrictComparable(value)];
      }
      return result;
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /**
     * Creates an array of the own enumerable symbol properties of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

    /**
     * Creates an array of the own and inherited enumerable symbol properties
     * of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
      var result = [];
      while (object) {
        arrayPush(result, getSymbols(object));
        object = getPrototype(object);
      }
      return result;
    };

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
        (Map && getTag(new Map) != mapTag) ||
        (Promise && getTag(Promise.resolve()) != promiseTag) ||
        (Set && getTag(new Set) != setTag) ||
        (WeakMap && getTag(new WeakMap) != weakMapTag)) {
      getTag = function(value) {
        var result = objectToString.call(value),
            Ctor = result == objectTag ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : undefined;

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag;
            case mapCtorString: return mapTag;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag;
            case weakMapCtorString: return weakMapTag;
          }
        }
        return result;
      };
    }

    /**
     * Gets the view, applying any `transforms` to the `start` and `end` positions.
     *
     * @private
     * @param {number} start The start of the view.
     * @param {number} end The end of the view.
     * @param {Array} transforms The transformations to apply to the view.
     * @returns {Object} Returns an object containing the `start` and `end`
     *  positions of the view.
     */
    function getView(start, end, transforms) {
      var index = -1,
          length = transforms.length;

      while (++index < length) {
        var data = transforms[index],
            size = data.size;

        switch (data.type) {
          case 'drop':      start += size; break;
          case 'dropRight': end -= size; break;
          case 'take':      end = nativeMin(end, start + size); break;
          case 'takeRight': start = nativeMax(start, end - size); break;
        }
      }
      return { 'start': start, 'end': end };
    }

    /**
     * Extracts wrapper details from the `source` body comment.
     *
     * @private
     * @param {string} source The source to inspect.
     * @returns {Array} Returns the wrapper details.
     */
    function getWrapDetails(source) {
      var match = source.match(reWrapDetails);
      return match ? match[1].split(reSplitDetails) : [];
    }

    /**
     * Checks if `path` exists on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @param {Function} hasFunc The function to check properties.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     */
    function hasPath(object, path, hasFunc) {
      path = isKey(path, object) ? [path] : castPath(path);

      var index = -1,
          length = path.length,
          result = false;

      while (++index < length) {
        var key = toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result || ++index != length) {
        return result;
      }
      length = object ? object.length : 0;
      return !!length && isLength(length) && isIndex(key, length) &&
        (isArray(object) || isArguments(object));
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
      return (typeof object.constructor == 'function' && !isPrototype(object))
        ? baseCreate(getPrototype(object))
        : {};
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
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, cloneFunc, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return cloneArrayBuffer(object);

        case boolTag:
        case dateTag:
          return new Ctor(+object);

        case dataViewTag:
          return cloneDataView(object, isDeep);

        case float32Tag: case float64Tag:
        case int8Tag: case int16Tag: case int32Tag:
        case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
          return cloneTypedArray(object, isDeep);

        case mapTag:
          return cloneMap(object, isDeep, cloneFunc);

        case numberTag:
        case stringTag:
          return new Ctor(object);

        case regexpTag:
          return cloneRegExp(object);

        case setTag:
          return cloneSet(object, isDeep, cloneFunc);

        case symbolTag:
          return cloneSymbol(object);
      }
    }

    /**
     * Inserts wrapper `details` in a comment at the top of the `source` body.
     *
     * @private
     * @param {string} source The source to modify.
     * @returns {Array} details The details to insert.
     * @returns {string} Returns the modified source.
     */
    function insertWrapDetails(source, details) {
      var length = details.length;
      if (!length) {
        return source;
      }
      var lastIndex = length - 1;
      details[lastIndex] = (length > 1 ? '& ' : '') + details[lastIndex];
      details = details.join(length > 2 ? ', ' : ' ');
      return source.replace(reWrapComment, '{\n/* [wrapped with ' + details + '] */\n');
    }

    /**
     * Checks if `value` is a flattenable `arguments` object or array.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
     */
    function isFlattenable(value) {
      return isArray(value) || isArguments(value) ||
        !!(spreadableSymbol && value && value[spreadableSymbol]);
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
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length &&
        (typeof value == 'number' || reIsUint.test(value)) &&
        (value > -1 && value % 1 == 0 && value < length);
    }

    /**
     * Checks if the given arguments are from an iteratee call.
     *
     * @private
     * @param {*} value The potential iteratee value argument.
     * @param {*} index The potential iteratee index or key argument.
     * @param {*} object The potential iteratee object argument.
     * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
     *  else `false`.
     */
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == 'number'
            ? (isArrayLike(object) && isIndex(index, object.length))
            : (type == 'string' && index in object)
          ) {
        return eq(object[index], value);
      }
      return false;
    }

    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
          value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
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
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Checks if `func` has a lazy counterpart.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
     *  else `false`.
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
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /**
     * Checks if `func` is capable of being masked.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `func` is maskable, else `false`.
     */
    var isMaskable = coreJsData ? isFunction : stubFalse;

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
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */
    function isStrictComparable(value) {
      return value === value && !isObject(value);
    }

    /**
     * A specialized version of `matchesProperty` for source values suitable
     * for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue &&
          (srcValue !== undefined || (key in Object(object)));
      };
    }

    /**
     * A specialized version of `_.memoize` which clears the memoized function's
     * cache when it exceeds `MAX_MEMOIZE_SIZE`.
     *
     * @private
     * @param {Function} func The function to have its output memoized.
     * @returns {Function} Returns the new memoized function.
     */
    function memoizeCapped(func) {
      var result = memoize(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });

      var cache = result.cache;
      return result;
    }

    /**
     * Merges the function metadata of `source` into `data`.
     *
     * Merging metadata reduces the number of wrappers used to invoke a function.
     * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
     * may be applied regardless of execution order. Methods like `_.ary` and
     * `_.rearg` modify function arguments, making the order in which they are
     * executed important, preventing the merging of metadata. However, we make
     * an exception for a safe combined case where curried functions have `_.ary`
     * and or `_.rearg` applied.
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
        ((srcBitmask == ARY_FLAG) && (bitmask == CURRY_FLAG)) ||
        ((srcBitmask == ARY_FLAG) && (bitmask == REARG_FLAG) && (data[7].length <= source[8])) ||
        ((srcBitmask == (ARY_FLAG | REARG_FLAG)) && (source[7].length <= source[8]) && (bitmask == CURRY_FLAG));

      // Exit early if metadata can't be merged.
      if (!(isCommon || isCombo)) {
        return data;
      }
      // Use source `thisArg` if available.
      if (srcBitmask & BIND_FLAG) {
        data[2] = source[2];
        // Set when currying a bound function.
        newBitmask |= bitmask & BIND_FLAG ? 0 : CURRY_BOUND_FLAG;
      }
      // Compose partial arguments.
      var value = source[3];
      if (value) {
        var partials = data[3];
        data[3] = partials ? composeArgs(partials, value, source[4]) : value;
        data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
      }
      // Compose partial right arguments.
      value = source[5];
      if (value) {
        partials = data[5];
        data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
        data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
      }
      // Use source `argPos` if available.
      value = source[7];
      if (value) {
        data[7] = value;
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
     * Used by `_.defaultsDeep` to customize its `_.merge` use.
     *
     * @private
     * @param {*} objValue The destination value.
     * @param {*} srcValue The source value.
     * @param {string} key The key of the property to merge.
     * @param {Object} object The parent object of `objValue`.
     * @param {Object} source The parent object of `srcValue`.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     * @returns {*} Returns the value to assign.
     */
    function mergeDefaults(objValue, srcValue, key, object, source, stack) {
      if (isObject(objValue) && isObject(srcValue)) {
        // Recursively merge objects and arrays (susceptible to call stack limits).
        stack.set(srcValue, objValue);
        baseMerge(objValue, srcValue, undefined, mergeDefaults, stack);
        stack['delete'](srcValue);
      }
      return objValue;
    }

    /**
     * This function is like
     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * except that it includes inherited enumerable properties.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * A specialized version of `baseRest` which transforms the rest array.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @param {Function} transform The rest array transform.
     * @returns {Function} Returns the new function.
     */
    function overRest(func, start, transform) {
      start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);

        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }

    /**
     * Gets the parent value at `path` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} path The path to get the parent value of.
     * @returns {*} Returns the parent value.
     */
    function parent(object, path) {
      return path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
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
     * period of time, it will trip its breaker and transition to an identity
     * function to avoid garbage collection pauses in V8. See
     * [V8 issue 2070](https://bugs.chromium.org/p/v8/issues/detail?id=2070)
     * for more details.
     *
     * @private
     * @param {Function} func The function to associate metadata with.
     * @param {*} data The metadata.
     * @returns {Function} Returns `func`.
     */
    var setData = shortOut(baseSetData);

    /**
     * A simple wrapper around the global [`setTimeout`](https://mdn.io/setTimeout).
     *
     * @private
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay invocation.
     * @returns {number|Object} Returns the timer id or timeout object.
     */
    var setTimeout = ctxSetTimeout || function(func, wait) {
      return root.setTimeout(func, wait);
    };

    /**
     * Sets the `toString` method of `func` to return `string`.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var setToString = shortOut(baseSetToString);

    /**
     * Sets the `toString` method of `wrapper` to mimic the source of `reference`
     * with wrapper details in a comment at the top of the source body.
     *
     * @private
     * @param {Function} wrapper The function to modify.
     * @param {Function} reference The reference function.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @returns {Function} Returns `wrapper`.
     */
    function setWrapToString(wrapper, reference, bitmask) {
      var source = (reference + '');
      return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
    }

    /**
     * Creates a function that'll short out and invoke `identity` instead
     * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
     * milliseconds.
     *
     * @private
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new shortable function.
     */
    function shortOut(func) {
      var count = 0,
          lastCalled = 0;

      return function() {
        var stamp = nativeNow(),
            remaining = HOT_SPAN - (stamp - lastCalled);

        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(undefined, arguments);
      };
    }

    /**
     * A specialized version of `arrayShuffle` which mutates `array`.
     *
     * @private
     * @param {Array} array The array to shuffle.
     * @returns {Array} Returns `array`.
     */
    function shuffleSelf(array) {
      var index = -1,
          length = array.length,
          lastIndex = length - 1;

      while (++index < length) {
        var rand = baseRandom(index, lastIndex),
            value = array[rand];

        array[rand] = array[index];
        array[index] = value;
      }
      return array;
    }

    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */
    var stringToPath = memoizeCapped(function(string) {
      string = toString(string);

      var result = [];
      if (reLeadingDot.test(string)) {
        result.push('');
      }
      string.replace(rePropName, function(match, number, quote, string) {
        result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    });

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to process.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Updates wrapper `details` based on `bitmask` flags.
     *
     * @private
     * @returns {Array} details The details to modify.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @returns {Array} Returns `details`.
     */
    function updateWrapDetails(details, bitmask) {
      arrayEach(wrapFlags, function(pair) {
        var value = '_.' + pair[0];
        if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {
          details.push(value);
        }
      });
      return details.sort();
    }

    /**
     * Creates a clone of `wrapper`.
     *
     * @private
     * @param {Object} wrapper The wrapper to clone.
     * @returns {Object} Returns the cloned wrapper.
     */
    function wrapperClone(wrapper) {
      if (wrapper instanceof LazyWrapper) {
        return wrapper.clone();
      }
      var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
      result.__actions__ = copyArray(wrapper.__actions__);
      result.__index__  = wrapper.__index__;
      result.__values__ = wrapper.__values__;
      return result;
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates an array of elements split into groups the length of `size`.
     * If `array` can't be split evenly, the final chunk will be the remaining
     * elements.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to process.
     * @param {number} [size=1] The length of each chunk
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the new array of chunks.
     * @example
     *
     * _.chunk(['a', 'b', 'c', 'd'], 2);
     * // => [['a', 'b'], ['c', 'd']]
     *
     * _.chunk(['a', 'b', 'c', 'd'], 3);
     * // => [['a', 'b', 'c'], ['d']]
     */
    function chunk(array, size, guard) {
      if ((guard ? isIterateeCall(array, size, guard) : size === undefined)) {
        size = 1;
      } else {
        size = nativeMax(toInteger(size), 0);
      }
      var length = array ? array.length : 0;
      if (!length || size < 1) {
        return [];
      }
      var index = 0,
          resIndex = 0,
          result = Array(nativeCeil(length / size));

      while (index < length) {
        result[resIndex++] = baseSlice(array, index, (index += size));
      }
      return result;
    }

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are falsey.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to compact.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    /**
     * Creates a new array concatenating `array` with any additional arrays
     * and/or values.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to concatenate.
     * @param {...*} [values] The values to concatenate.
     * @returns {Array} Returns the new concatenated array.
     * @example
     *
     * var array = [1];
     * var other = _.concat(array, 2, [3], [[4]]);
     *
     * console.log(other);
     * // => [1, 2, 3, [4]]
     *
     * console.log(array);
     * // => [1]
     */
    function concat() {
      var length = arguments.length;
      if (!length) {
        return [];
      }
      var args = Array(length - 1),
          array = arguments[0],
          index = length;

      while (index--) {
        args[index - 1] = arguments[index];
      }
      return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
    }

    /**
     * Creates an array of `array` values not included in the other given arrays
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons. The order and references of result values are
     * determined by the first array.
     *
     * **Note:** Unlike `_.pullAll`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {...Array} [values] The values to exclude.
     * @returns {Array} Returns the new array of filtered values.
     * @see _.without, _.xor
     * @example
     *
     * _.difference([2, 1], [2, 3]);
     * // => [1]
     */
    var difference = baseRest(function(array, values) {
      return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
        : [];
    });

    /**
     * This method is like `_.difference` except that it accepts `iteratee` which
     * is invoked for each element of `array` and `values` to generate the criterion
     * by which they're compared. The order and references of result values are
     * determined by the first array. The iteratee is invoked with one argument:
     * (value).
     *
     * **Note:** Unlike `_.pullAllBy`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {...Array} [values] The values to exclude.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor);
     * // => [1.2]
     *
     * // The `_.property` iteratee shorthand.
     * _.differenceBy([{ 'x': 2 }, { 'x': 1 }], [{ 'x': 1 }], 'x');
     * // => [{ 'x': 2 }]
     */
    var differenceBy = baseRest(function(array, values) {
      var iteratee = last(values);
      if (isArrayLikeObject(iteratee)) {
        iteratee = undefined;
      }
      return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), getIteratee(iteratee, 2))
        : [];
    });

    /**
     * This method is like `_.difference` except that it accepts `comparator`
     * which is invoked to compare elements of `array` to `values`. The order and
     * references of result values are determined by the first array. The comparator
     * is invoked with two arguments: (arrVal, othVal).
     *
     * **Note:** Unlike `_.pullAllWith`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {...Array} [values] The values to exclude.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
     *
     * _.differenceWith(objects, [{ 'x': 1, 'y': 2 }], _.isEqual);
     * // => [{ 'x': 2, 'y': 1 }]
     */
    var differenceWith = baseRest(function(array, values) {
      var comparator = last(values);
      if (isArrayLikeObject(comparator)) {
        comparator = undefined;
      }
      return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined, comparator)
        : [];
    });

    /**
     * Creates a slice of `array` with `n` elements dropped from the beginning.
     *
     * @static
     * @memberOf _
     * @since 0.5.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to drop.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.drop([1, 2, 3]);
     * // => [2, 3]
     *
     * _.drop([1, 2, 3], 2);
     * // => [3]
     *
     * _.drop([1, 2, 3], 5);
     * // => []
     *
     * _.drop([1, 2, 3], 0);
     * // => [1, 2, 3]
     */
    function drop(array, n, guard) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      n = (guard || n === undefined) ? 1 : toInteger(n);
      return baseSlice(array, n < 0 ? 0 : n, length);
    }

    /**
     * Creates a slice of `array` with `n` elements dropped from the end.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to drop.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.dropRight([1, 2, 3]);
     * // => [1, 2]
     *
     * _.dropRight([1, 2, 3], 2);
     * // => [1]
     *
     * _.dropRight([1, 2, 3], 5);
     * // => []
     *
     * _.dropRight([1, 2, 3], 0);
     * // => [1, 2, 3]
     */
    function dropRight(array, n, guard) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      n = (guard || n === undefined) ? 1 : toInteger(n);
      n = length - n;
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` excluding elements dropped from the end.
     * Elements are dropped until `predicate` returns falsey. The predicate is
     * invoked with three arguments: (value, index, array).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * _.dropRightWhile(users, function(o) { return !o.active; });
     * // => objects for ['barney']
     *
     * // The `_.matches` iteratee shorthand.
     * _.dropRightWhile(users, { 'user': 'pebbles', 'active': false });
     * // => objects for ['barney', 'fred']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.dropRightWhile(users, ['active', false]);
     * // => objects for ['barney']
     *
     * // The `_.property` iteratee shorthand.
     * _.dropRightWhile(users, 'active');
     * // => objects for ['barney', 'fred', 'pebbles']
     */
    function dropRightWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3), true, true)
        : [];
    }

    /**
     * Creates a slice of `array` excluding elements dropped from the beginning.
     * Elements are dropped until `predicate` returns falsey. The predicate is
     * invoked with three arguments: (value, index, array).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function} [predicate=_.identity]
     *  The function invoked per iteration.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * _.dropWhile(users, function(o) { return !o.active; });
     * // => objects for ['pebbles']
     *
     * // The `_.matches` iteratee shorthand.
     * _.dropWhile(users, { 'user': 'barney', 'active': false });
     * // => objects for ['fred', 'pebbles']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.dropWhile(users, ['active', false]);
     * // => objects for ['pebbles']
     *
     * // The `_.property` iteratee shorthand.
     * _.dropWhile(users, 'active');
     * // => objects for ['barney', 'fred', 'pebbles']
     */
    function dropWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3), true)
        : [];
    }

    /**
     * Fills elements of `array` with `value` from `start` up to, but not
     * including, `end`.
     *
     * **Note:** This method mutates `array`.
     *
     * @static
     * @memberOf _
     * @since 3.2.0
     * @category Array
     * @param {Array} array The array to fill.
     * @param {*} value The value to fill `array` with.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3];
     *
     * _.fill(array, 'a');
     * console.log(array);
     * // => ['a', 'a', 'a']
     *
     * _.fill(Array(3), 2);
     * // => [2, 2, 2]
     *
     * _.fill([4, 6, 8, 10], '*', 1, 3);
     * // => [4, '*', '*', 10]
     */
    function fill(array, value, start, end) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
        start = 0;
        end = length;
      }
      return baseFill(array, value, start, end);
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element `predicate` returns truthy for instead of the element itself.
     *
     * @static
     * @memberOf _
     * @since 1.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [predicate=_.identity]
     *  The function invoked per iteration.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * _.findIndex(users, function(o) { return o.user == 'barney'; });
     * // => 0
     *
     * // The `_.matches` iteratee shorthand.
     * _.findIndex(users, { 'user': 'fred', 'active': false });
     * // => 1
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.findIndex(users, ['active', false]);
     * // => 0
     *
     * // The `_.property` iteratee shorthand.
     * _.findIndex(users, 'active');
     * // => 2
     */
    function findIndex(array, predicate, fromIndex) {
      var length = array ? array.length : 0;
      if (!length) {
        return -1;
      }
      var index = fromIndex == null ? 0 : toInteger(fromIndex);
      if (index < 0) {
        index = nativeMax(length + index, 0);
      }
      return baseFindIndex(array, getIteratee(predicate, 3), index);
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [predicate=_.identity]
     *  The function invoked per iteration.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * _.findLastIndex(users, function(o) { return o.user == 'pebbles'; });
     * // => 2
     *
     * // The `_.matches` iteratee shorthand.
     * _.findLastIndex(users, { 'user': 'barney', 'active': true });
     * // => 0
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.findLastIndex(users, ['active', false]);
     * // => 2
     *
     * // The `_.property` iteratee shorthand.
     * _.findLastIndex(users, 'active');
     * // => 0
     */
    function findLastIndex(array, predicate, fromIndex) {
      var length = array ? array.length : 0;
      if (!length) {
        return -1;
      }
      var index = length - 1;
      if (fromIndex !== undefined) {
        index = toInteger(fromIndex);
        index = fromIndex < 0
          ? nativeMax(length + index, 0)
          : nativeMin(index, length - 1);
      }
      return baseFindIndex(array, getIteratee(predicate, 3), index, true);
    }

    /**
     * Flattens `array` a single level deep.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to flatten.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * _.flatten([1, [2, [3, [4]], 5]]);
     * // => [1, 2, [3, [4]], 5]
     */
    function flatten(array) {
      var length = array ? array.length : 0;
      return length ? baseFlatten(array, 1) : [];
    }

    /**
     * Recursively flattens `array`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to flatten.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * _.flattenDeep([1, [2, [3, [4]], 5]]);
     * // => [1, 2, 3, 4, 5]
     */
    function flattenDeep(array) {
      var length = array ? array.length : 0;
      return length ? baseFlatten(array, INFINITY) : [];
    }

    /**
     * Recursively flatten `array` up to `depth` times.
     *
     * @static
     * @memberOf _
     * @since 4.4.0
     * @category Array
     * @param {Array} array The array to flatten.
     * @param {number} [depth=1] The maximum recursion depth.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * var array = [1, [2, [3, [4]], 5]];
     *
     * _.flattenDepth(array, 1);
     * // => [1, 2, [3, [4]], 5]
     *
     * _.flattenDepth(array, 2);
     * // => [1, 2, 3, [4], 5]
     */
    function flattenDepth(array, depth) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      depth = depth === undefined ? 1 : toInteger(depth);
      return baseFlatten(array, depth);
    }

    /**
     * The inverse of `_.toPairs`; this method returns an object composed
     * from key-value `pairs`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} pairs The key-value pairs.
     * @returns {Object} Returns the new object.
     * @example
     *
     * _.fromPairs([['a', 1], ['b', 2]]);
     * // => { 'a': 1, 'b': 2 }
     */
    function fromPairs(pairs) {
      var index = -1,
          length = pairs ? pairs.length : 0,
          result = {};

      while (++index < length) {
        var pair = pairs[index];
        result[pair[0]] = pair[1];
      }
      return result;
    }

    /**
     * Gets the first element of `array`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @alias first
     * @category Array
     * @param {Array} array The array to query.
     * @returns {*} Returns the first element of `array`.
     * @example
     *
     * _.head([1, 2, 3]);
     * // => 1
     *
     * _.head([]);
     * // => undefined
     */
    function head(array) {
      return (array && array.length) ? array[0] : undefined;
    }

    /**
     * Gets the index at which the first occurrence of `value` is found in `array`
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons. If `fromIndex` is negative, it's used as the
     * offset from the end of `array`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.indexOf([1, 2, 1, 2], 2);
     * // => 1
     *
     * // Search from the `fromIndex`.
     * _.indexOf([1, 2, 1, 2], 2, 2);
     * // => 3
     */
    function indexOf(array, value, fromIndex) {
      var length = array ? array.length : 0;
      if (!length) {
        return -1;
      }
      var index = fromIndex == null ? 0 : toInteger(fromIndex);
      if (index < 0) {
        index = nativeMax(length + index, 0);
      }
      return baseIndexOf(array, value, index);
    }

    /**
     * Gets all but the last element of `array`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to query.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     */
    function initial(array) {
      var length = array ? array.length : 0;
      return length ? baseSlice(array, 0, -1) : [];
    }

    /**
     * Creates an array of unique values that are included in all given arrays
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons. The order and references of result values are
     * determined by the first array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of intersecting values.
     * @example
     *
     * _.intersection([2, 1], [2, 3]);
     * // => [2]
     */
    var intersection = baseRest(function(arrays) {
      var mapped = arrayMap(arrays, castArrayLikeObject);
      return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped)
        : [];
    });

    /**
     * This method is like `_.intersection` except that it accepts `iteratee`
     * which is invoked for each element of each `arrays` to generate the criterion
     * by which they're compared. The order and references of result values are
     * determined by the first array. The iteratee is invoked with one argument:
     * (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {Array} Returns the new array of intersecting values.
     * @example
     *
     * _.intersectionBy([2.1, 1.2], [2.3, 3.4], Math.floor);
     * // => [2.1]
     *
     * // The `_.property` iteratee shorthand.
     * _.intersectionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }]
     */
    var intersectionBy = baseRest(function(arrays) {
      var iteratee = last(arrays),
          mapped = arrayMap(arrays, castArrayLikeObject);

      if (iteratee === last(mapped)) {
        iteratee = undefined;
      } else {
        mapped.pop();
      }
      return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped, getIteratee(iteratee, 2))
        : [];
    });

    /**
     * This method is like `_.intersection` except that it accepts `comparator`
     * which is invoked to compare elements of `arrays`. The order and references
     * of result values are determined by the first array. The comparator is
     * invoked with two arguments: (arrVal, othVal).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of intersecting values.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
     * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
     *
     * _.intersectionWith(objects, others, _.isEqual);
     * // => [{ 'x': 1, 'y': 2 }]
     */
    var intersectionWith = baseRest(function(arrays) {
      var comparator = last(arrays),
          mapped = arrayMap(arrays, castArrayLikeObject);

      if (comparator === last(mapped)) {
        comparator = undefined;
      } else {
        mapped.pop();
      }
      return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped, undefined, comparator)
        : [];
    });

    /**
     * Converts all elements in `array` into a string separated by `separator`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to convert.
     * @param {string} [separator=','] The element separator.
     * @returns {string} Returns the joined string.
     * @example
     *
     * _.join(['a', 'b', 'c'], '~');
     * // => 'a~b~c'
     */
    function join(array, separator) {
      return array ? nativeJoin.call(array, separator) : '';
    }

    /**
     * Gets the last element of `array`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to query.
     * @returns {*} Returns the last element of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     */
    function last(array) {
      var length = array ? array.length : 0;
      return length ? array[length - 1] : undefined;
    }

    /**
     * This method is like `_.indexOf` except that it iterates over elements of
     * `array` from right to left.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 1, 2], 2);
     * // => 3
     *
     * // Search from the `fromIndex`.
     * _.lastIndexOf([1, 2, 1, 2], 2, 2);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var length = array ? array.length : 0;
      if (!length) {
        return -1;
      }
      var index = length;
      if (fromIndex !== undefined) {
        index = toInteger(fromIndex);
        index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
      }
      return value === value
        ? strictLastIndexOf(array, value, index)
        : baseFindIndex(array, baseIsNaN, index, true);
    }

    /**
     * Gets the element at index `n` of `array`. If `n` is negative, the nth
     * element from the end is returned.
     *
     * @static
     * @memberOf _
     * @since 4.11.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=0] The index of the element to return.
     * @returns {*} Returns the nth element of `array`.
     * @example
     *
     * var array = ['a', 'b', 'c', 'd'];
     *
     * _.nth(array, 1);
     * // => 'b'
     *
     * _.nth(array, -2);
     * // => 'c';
     */
    function nth(array, n) {
      return (array && array.length) ? baseNth(array, toInteger(n)) : undefined;
    }

    /**
     * Removes all given values from `array` using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * **Note:** Unlike `_.without`, this method mutates `array`. Use `_.remove`
     * to remove elements from an array by predicate.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {...*} [values] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
     *
     * _.pull(array, 'a', 'c');
     * console.log(array);
     * // => ['b', 'b']
     */
    var pull = baseRest(pullAll);

    /**
     * This method is like `_.pull` except that it accepts an array of values to remove.
     *
     * **Note:** Unlike `_.difference`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {Array} values The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
     *
     * _.pullAll(array, ['a', 'c']);
     * console.log(array);
     * // => ['b', 'b']
     */
    function pullAll(array, values) {
      return (array && array.length && values && values.length)
        ? basePullAll(array, values)
        : array;
    }

    /**
     * This method is like `_.pullAll` except that it accepts `iteratee` which is
     * invoked for each element of `array` and `values` to generate the criterion
     * by which they're compared. The iteratee is invoked with one argument: (value).
     *
     * **Note:** Unlike `_.differenceBy`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {Array} values The values to remove.
     * @param {Function} [iteratee=_.identity]
     *  The iteratee invoked per element.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [{ 'x': 1 }, { 'x': 2 }, { 'x': 3 }, { 'x': 1 }];
     *
     * _.pullAllBy(array, [{ 'x': 1 }, { 'x': 3 }], 'x');
     * console.log(array);
     * // => [{ 'x': 2 }]
     */
    function pullAllBy(array, values, iteratee) {
      return (array && array.length && values && values.length)
        ? basePullAll(array, values, getIteratee(iteratee, 2))
        : array;
    }

    /**
     * This method is like `_.pullAll` except that it accepts `comparator` which
     * is invoked to compare elements of `array` to `values`. The comparator is
     * invoked with two arguments: (arrVal, othVal).
     *
     * **Note:** Unlike `_.differenceWith`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @since 4.6.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {Array} values The values to remove.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [{ 'x': 1, 'y': 2 }, { 'x': 3, 'y': 4 }, { 'x': 5, 'y': 6 }];
     *
     * _.pullAllWith(array, [{ 'x': 3, 'y': 4 }], _.isEqual);
     * console.log(array);
     * // => [{ 'x': 1, 'y': 2 }, { 'x': 5, 'y': 6 }]
     */
    function pullAllWith(array, values, comparator) {
      return (array && array.length && values && values.length)
        ? basePullAll(array, values, undefined, comparator)
        : array;
    }

    /**
     * Removes elements from `array` corresponding to `indexes` and returns an
     * array of removed elements.
     *
     * **Note:** Unlike `_.at`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {...(number|number[])} [indexes] The indexes of elements to remove.
     * @returns {Array} Returns the new array of removed elements.
     * @example
     *
     * var array = ['a', 'b', 'c', 'd'];
     * var pulled = _.pullAt(array, [1, 3]);
     *
     * console.log(array);
     * // => ['a', 'c']
     *
     * console.log(pulled);
     * // => ['b', 'd']
     */
    var pullAt = flatRest(function(array, indexes) {
      var length = array ? array.length : 0,
          result = baseAt(array, indexes);

      basePullAt(array, arrayMap(indexes, function(index) {
        return isIndex(index, length) ? +index : index;
      }).sort(compareAscending));

      return result;
    });

    /**
     * Removes all elements from `array` that `predicate` returns truthy for
     * and returns an array of the removed elements. The predicate is invoked
     * with three arguments: (value, index, array).
     *
     * **Note:** Unlike `_.filter`, this method mutates `array`. Use `_.pull`
     * to pull elements from an array by value.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {Function} [predicate=_.identity]
     *  The function invoked per iteration.
     * @returns {Array} Returns the new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4];
     * var evens = _.remove(array, function(n) {
     *   return n % 2 == 0;
     * });
     *
     * console.log(array);
     * // => [1, 3]
     *
     * console.log(evens);
     * // => [2, 4]
     */
    function remove(array, predicate) {
      var result = [];
      if (!(array && array.length)) {
        return result;
      }
      var index = -1,
          indexes = [],
          length = array.length;

      predicate = getIteratee(predicate, 3);
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result.push(value);
          indexes.push(index);
        }
      }
      basePullAt(array, indexes);
      return result;
    }

    /**
     * Reverses `array` so that the first element becomes the last, the second
     * element becomes the second to last, and so on.
     *
     * **Note:** This method mutates `array` and is based on
     * [`Array#reverse`](https://mdn.io/Array/reverse).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3];
     *
     * _.reverse(array);
     * // => [3, 2, 1]
     *
     * console.log(array);
     * // => [3, 2, 1]
     */
    function reverse(array) {
      return array ? nativeReverse.call(array) : array;
    }

    /**
     * Creates a slice of `array` from `start` up to, but not including, `end`.
     *
     * **Note:** This method is used instead of
     * [`Array#slice`](https://mdn.io/Array/slice) to ensure dense arrays are
     * returned.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */
    function slice(array, start, end) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
        start = 0;
        end = length;
      }
      else {
        start = start == null ? 0 : toInteger(start);
        end = end === undefined ? length : toInteger(end);
      }
      return baseSlice(array, start, end);
    }

    /**
     * Uses a binary search to determine the lowest index at which `value`
     * should be inserted into `array` in order to maintain its sort order.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([30, 50], 40);
     * // => 1
     */
    function sortedIndex(array, value) {
      return baseSortedIndex(array, value);
    }

    /**
     * This method is like `_.sortedIndex` except that it accepts `iteratee`
     * which is invoked for `value` and each element of `array` to compute their
     * sort ranking. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function} [iteratee=_.identity]
     *  The iteratee invoked per element.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * var objects = [{ 'x': 4 }, { 'x': 5 }];
     *
     * _.sortedIndexBy(objects, { 'x': 4 }, function(o) { return o.x; });
     * // => 0
     *
     * // The `_.property` iteratee shorthand.
     * _.sortedIndexBy(objects, { 'x': 4 }, 'x');
     * // => 0
     */
    function sortedIndexBy(array, value, iteratee) {
      return baseSortedIndexBy(array, value, getIteratee(iteratee, 2));
    }

    /**
     * This method is like `_.indexOf` except that it performs a binary
     * search on a sorted `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.sortedIndexOf([4, 5, 5, 5, 6], 5);
     * // => 1
     */
    function sortedIndexOf(array, value) {
      var length = array ? array.length : 0;
      if (length) {
        var index = baseSortedIndex(array, value);
        if (index < length && eq(array[index], value)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.sortedIndex` except that it returns the highest
     * index at which `value` should be inserted into `array` in order to
     * maintain its sort order.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedLastIndex([4, 5, 5, 5, 6], 5);
     * // => 4
     */
    function sortedLastIndex(array, value) {
      return baseSortedIndex(array, value, true);
    }

    /**
     * This method is like `_.sortedLastIndex` except that it accepts `iteratee`
     * which is invoked for `value` and each element of `array` to compute their
     * sort ranking. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function} [iteratee=_.identity]
     *  The iteratee invoked per element.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * var objects = [{ 'x': 4 }, { 'x': 5 }];
     *
     * _.sortedLastIndexBy(objects, { 'x': 4 }, function(o) { return o.x; });
     * // => 1
     *
     * // The `_.property` iteratee shorthand.
     * _.sortedLastIndexBy(objects, { 'x': 4 }, 'x');
     * // => 1
     */
    function sortedLastIndexBy(array, value, iteratee) {
      return baseSortedIndexBy(array, value, getIteratee(iteratee, 2), true);
    }

    /**
     * This method is like `_.lastIndexOf` except that it performs a binary
     * search on a sorted `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.sortedLastIndexOf([4, 5, 5, 5, 6], 5);
     * // => 3
     */
    function sortedLastIndexOf(array, value) {
      var length = array ? array.length : 0;
      if (length) {
        var index = baseSortedIndex(array, value, true) - 1;
        if (eq(array[index], value)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.uniq` except that it's designed and optimized
     * for sorted arrays.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * _.sortedUniq([1, 1, 2]);
     * // => [1, 2]
     */
    function sortedUniq(array) {
      return (array && array.length)
        ? baseSortedUniq(array)
        : [];
    }

    /**
     * This method is like `_.uniqBy` except that it's designed and optimized
     * for sorted arrays.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * _.sortedUniqBy([1.1, 1.2, 2.3, 2.4], Math.floor);
     * // => [1.1, 2.3]
     */
    function sortedUniqBy(array, iteratee) {
      return (array && array.length)
        ? baseSortedUniq(array, getIteratee(iteratee, 2))
        : [];
    }

    /**
     * Gets all but the first element of `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.tail([1, 2, 3]);
     * // => [2, 3]
     */
    function tail(array) {
      var length = array ? array.length : 0;
      return length ? baseSlice(array, 1, length) : [];
    }

    /**
     * Creates a slice of `array` with `n` elements taken from the beginning.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to take.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.take([1, 2, 3]);
     * // => [1]
     *
     * _.take([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.take([1, 2, 3], 5);
     * // => [1, 2, 3]
     *
     * _.take([1, 2, 3], 0);
     * // => []
     */
    function take(array, n, guard) {
      if (!(array && array.length)) {
        return [];
      }
      n = (guard || n === undefined) ? 1 : toInteger(n);
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` with `n` elements taken from the end.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to take.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.takeRight([1, 2, 3]);
     * // => [3]
     *
     * _.takeRight([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.takeRight([1, 2, 3], 5);
     * // => [1, 2, 3]
     *
     * _.takeRight([1, 2, 3], 0);
     * // => []
     */
    function takeRight(array, n, guard) {
      var length = array ? array.length : 0;
      if (!length) {
        return [];
      }
      n = (guard || n === undefined) ? 1 : toInteger(n);
      n = length - n;
      return baseSlice(array, n < 0 ? 0 : n, length);
    }

    /**
     * Creates a slice of `array` with elements taken from the end. Elements are
     * taken until `predicate` returns falsey. The predicate is invoked with
     * three arguments: (value, index, array).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function} [predicate=_.identity]
     *  The function invoked per iteration.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * _.takeRightWhile(users, function(o) { return !o.active; });
     * // => objects for ['fred', 'pebbles']
     *
     * // The `_.matches` iteratee shorthand.
     * _.takeRightWhile(users, { 'user': 'pebbles', 'active': false });
     * // => objects for ['pebbles']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.takeRightWhile(users, ['active', false]);
     * // => objects for ['fred', 'pebbles']
     *
     * // The `_.property` iteratee shorthand.
     * _.takeRightWhile(users, 'active');
     * // => []
     */
    function takeRightWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3), false, true)
        : [];
    }

    /**
     * Creates a slice of `array` with elements taken from the beginning. Elements
     * are taken until `predicate` returns falsey. The predicate is invoked with
     * three arguments: (value, index, array).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function} [predicate=_.identity]
     *  The function invoked per iteration.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false},
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * _.takeWhile(users, function(o) { return !o.active; });
     * // => objects for ['barney', 'fred']
     *
     * // The `_.matches` iteratee shorthand.
     * _.takeWhile(users, { 'user': 'barney', 'active': false });
     * // => objects for ['barney']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.takeWhile(users, ['active', false]);
     * // => objects for ['barney', 'fred']
     *
     * // The `_.property` iteratee shorthand.
     * _.takeWhile(users, 'active');
     * // => []
     */
    function takeWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3))
        : [];
    }

    /**
     * Creates an array of unique values, in order, from all given arrays using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of combined values.
     * @example
     *
     * _.union([2], [1, 2]);
     * // => [2, 1]
     */
    var union = baseRest(function(arrays) {
      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
    });

    /**
     * This method is like `_.union` except that it accepts `iteratee` which is
     * invoked for each element of each `arrays` to generate the criterion by
     * which uniqueness is computed. Result values are chosen from the first
     * array in which the value occurs. The iteratee is invoked with one argument:
     * (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [iteratee=_.identity]
     *  The iteratee invoked per element.
     * @returns {Array} Returns the new array of combined values.
     * @example
     *
     * _.unionBy([2.1], [1.2, 2.3], Math.floor);
     * // => [2.1, 1.2]
     *
     * // The `_.property` iteratee shorthand.
     * _.unionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    var unionBy = baseRest(function(arrays) {
      var iteratee = last(arrays);
      if (isArrayLikeObject(iteratee)) {
        iteratee = undefined;
      }
      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee, 2));
    });

    /**
     * This method is like `_.union` except that it accepts `comparator` which
     * is invoked to compare elements of `arrays`. Result values are chosen from
     * the first array in which the value occurs. The comparator is invoked
     * with two arguments: (arrVal, othVal).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of combined values.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
     * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
     *
     * _.unionWith(objects, others, _.isEqual);
     * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
     */
    var unionWith = baseRest(function(arrays) {
      var comparator = last(arrays);
      if (isArrayLikeObject(comparator)) {
        comparator = undefined;
      }
      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined, comparator);
    });

    /**
     * Creates a duplicate-free version of an array, using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons, in which only the first occurrence of each element
     * is kept. The order of result values is determined by the order they occur
     * in the array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * _.uniq([2, 1, 2]);
     * // => [2, 1]
     */
    function uniq(array) {
      return (array && array.length)
        ? baseUniq(array)
        : [];
    }

    /**
     * This method is like `_.uniq` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the criterion by which
     * uniqueness is computed. The order of result values is determined by the
     * order they occur in the array. The iteratee is invoked with one argument:
     * (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee=_.identity]
     *  The iteratee invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * _.uniqBy([2.1, 1.2, 2.3], Math.floor);
     * // => [2.1, 1.2]
     *
     * // The `_.property` iteratee shorthand.
     * _.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniqBy(array, iteratee) {
      return (array && array.length)
        ? baseUniq(array, getIteratee(iteratee, 2))
        : [];
    }

    /**
     * This method is like `_.uniq` except that it accepts `comparator` which
     * is invoked to compare elements of `array`. The order of result values is
     * determined by the order they occur in the array.The comparator is invoked
     * with two arguments: (arrVal, othVal).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 2 }];
     *
     * _.uniqWith(objects, _.isEqual);
     * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
     */
    function uniqWith(array, comparator) {
      return (array && array.length)
        ? baseUniq(array, undefined, comparator)
        : [];
    }

    /**
     * This method is like `_.zip` except that it accepts an array of grouped
     * elements and creates an array regrouping the elements to their pre-zip
     * configuration.
     *
     * @static
     * @memberOf _
     * @since 1.2.0
     * @category Array
     * @param {Array} array The array of grouped elements to process.
     * @returns {Array} Returns the new array of regrouped elements.
     * @example
     *
     * var zipped = _.zip(['a', 'b'], [1, 2], [true, false]);
     * // => [['a', 1, true], ['b', 2, false]]
     *
     * _.unzip(zipped);
     * // => [['a', 'b'], [1, 2], [true, false]]
     */
    function unzip(array) {
      if (!(array && array.length)) {
        return [];
      }
      var length = 0;
      array = arrayFilter(array, function(group) {
        if (isArrayLikeObject(group)) {
          length = nativeMax(group.length, length);
          return true;
        }
      });
      return baseTimes(length, function(index) {
        return arrayMap(array, baseProperty(index));
      });
    }

    /**
     * This method is like `_.unzip` except that it accepts `iteratee` to specify
     * how regrouped values should be combined. The iteratee is invoked with the
     * elements of each group: (...group).
     *
     * @static
     * @memberOf _
     * @since 3.8.0
     * @category Array
     * @param {Array} array The array of grouped elements to process.
     * @param {Function} [iteratee=_.identity] The function to combine
     *  regrouped values.
     * @returns {Array} Returns the new array of regrouped elements.
     * @example
     *
     * var zipped = _.zip([1, 2], [10, 20], [100, 200]);
     * // => [[1, 10, 100], [2, 20, 200]]
     *
     * _.unzipWith(zipped, _.add);
     * // => [3, 30, 300]
     */
    function unzipWith(array, iteratee) {
      if (!(array && array.length)) {
        return [];
      }
      var result = unzip(array);
      if (iteratee == null) {
        return result;
      }
      return arrayMap(result, function(group) {
        return apply(iteratee, undefined, group);
      });
    }

    /**
     * Creates an array excluding all given values using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * **Note:** Unlike `_.pull`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {...*} [values] The values to exclude.
     * @returns {Array} Returns the new array of filtered values.
     * @see _.difference, _.xor
     * @example
     *
     * _.without([2, 1, 2, 3], 1, 2);
     * // => [3]
     */
    var without = baseRest(function(array, values) {
      return isArrayLikeObject(array)
        ? baseDifference(array, values)
        : [];
    });

    /**
     * Creates an array of unique values that is the
     * [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
     * of the given arrays. The order of result values is determined by the order
     * they occur in the arrays.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of filtered values.
     * @see _.difference, _.without
     * @example
     *
     * _.xor([2, 1], [2, 3]);
     * // => [1, 3]
     */
    var xor = baseRest(function(arrays) {
      return baseXor(arrayFilter(arrays, isArrayLikeObject));
    });

    /**
     * This method is like `_.xor` except that it accepts `iteratee` which is
     * invoked for each element of each `arrays` to generate the criterion by
     * which by which they're compared. The order of result values is determined
     * by the order they occur in the arrays. The iteratee is invoked with one
     * argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [iteratee=_.identity]
     *  The iteratee invoked per element.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.xorBy([2.1, 1.2], [2.3, 3.4], Math.floor);
     * // => [1.2, 3.4]
     *
     * // The `_.property` iteratee shorthand.
     * _.xorBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 2 }]
     */
    var xorBy = baseRest(function(arrays) {
      var iteratee = last(arrays);
      if (isArrayLikeObject(iteratee)) {
        iteratee = undefined;
      }
      return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee, 2));
    });

    /**
     * This method is like `_.xor` except that it accepts `comparator` which is
     * invoked to compare elements of `arrays`. The order of result values is
     * determined by the order they occur in the arrays. The comparator is invoked
     * with two arguments: (arrVal, othVal).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
     * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
     *
     * _.xorWith(objects, others, _.isEqual);
     * // => [{ 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
     */
    var xorWith = baseRest(function(arrays) {
      var comparator = last(arrays);
      if (isArrayLikeObject(comparator)) {
        comparator = undefined;
      }
      return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined, comparator);
    });

    /**
     * Creates an array of grouped elements, the first of which contains the
     * first elements of the given arrays, the second of which contains the
     * second elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {...Array} [arrays] The arrays to process.
     * @returns {Array} Returns the new array of grouped elements.
     * @example
     *
     * _.zip(['a', 'b'], [1, 2], [true, false]);
     * // => [['a', 1, true], ['b', 2, false]]
     */
    var zip = baseRest(unzip);

    /**
     * This method is like `_.fromPairs` except that it accepts two arrays,
     * one of property identifiers and one of corresponding values.
     *
     * @static
     * @memberOf _
     * @since 0.4.0
     * @category Array
     * @param {Array} [props=[]] The property identifiers.
     * @param {Array} [values=[]] The property values.
     * @returns {Object} Returns the new object.
     * @example
     *
     * _.zipObject(['a', 'b'], [1, 2]);
     * // => { 'a': 1, 'b': 2 }
     */
    function zipObject(props, values) {
      return baseZipObject(props || [], values || [], assignValue);
    }

    /**
     * This method is like `_.zipObject` except that it supports property paths.
     *
     * @static
     * @memberOf _
     * @since 4.1.0
     * @category Array
     * @param {Array} [props=[]] The property identifiers.
     * @param {Array} [values=[]] The property values.
     * @returns {Object} Returns the new object.
     * @example
     *
     * _.zipObjectDeep(['a.b[0].c', 'a.b[1].d'], [1, 2]);
     * // => { 'a': { 'b': [{ 'c': 1 }, { 'd': 2 }] } }
     */
    function zipObjectDeep(props, values) {
      return baseZipObject(props || [], values || [], baseSet);
    }

    /**
     * This method is like `_.zip` except that it accepts `iteratee` to specify
     * how grouped values should be combined. The iteratee is invoked with the
     * elements of each group: (...group).
     *
     * @static
     * @memberOf _
     * @since 3.8.0
     * @category Array
     * @param {...Array} [arrays] The arrays to process.
     * @param {Function} [iteratee=_.identity] The function to combine grouped values.
     * @returns {Array} Returns the new array of grouped elements.
     * @example
     *
     * _.zipWith([1, 2], [10, 20], [100, 200], function(a, b, c) {
     *   return a + b + c;
     * });
     * // => [111, 222]
     */
    var zipWith = baseRest(function(arrays) {
      var length = arrays.length,
          iteratee = length > 1 ? arrays[length - 1] : undefined;

      iteratee = typeof iteratee == 'function' ? (arrays.pop(), iteratee) : undefined;
      return unzipWith(arrays, iteratee);
    });

    /*------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` wrapper instance that wraps `value` with explicit method
     * chain sequences enabled. The result of such sequences must be unwrapped
     * with `_#value`.
     *
     * @static
     * @memberOf _
     * @since 1.3.0
     * @category Seq
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36 },
     *   { 'user': 'fred',    'age': 40 },
     *   { 'user': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _
     *   .chain(users)
     *   .sortBy('age')
     *   .map(function(o) {
     *     return o.user + ' is ' + o.age;
     *   })
     *   .head()
     *   .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      var result = lodash(value);
      result.__chain__ = true;
      return result;
    }

    /**
     * This method invokes `interceptor` and returns `value`. The interceptor
     * is invoked with one argument; (value). The purpose of this method is to
     * "tap into" a method chain sequence in order to modify intermediate results.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Seq
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3])
     *  .tap(function(array) {
     *    // Mutate input array.
     *    array.pop();
     *  })
     *  .reverse()
     *  .value();
     * // => [2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * This method is like `_.tap` except that it returns the result of `interceptor`.
     * The purpose of this method is to "pass thru" values replacing intermediate
     * results in a method chain sequence.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Seq
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns the result of `interceptor`.
     * @example
     *
     * _('  abc  ')
     *  .chain()
     *  .trim()
     *  .thru(function(value) {
     *    return [value];
     *  })
     *  .value();
     * // => ['abc']
     */
    function thru(value, interceptor) {
      return interceptor(value);
    }

    /**
     * This method is the wrapper version of `_.at`.
     *
     * @name at
     * @memberOf _
     * @since 1.0.0
     * @category Seq
     * @param {...(string|string[])} [paths] The property paths of elements to pick.
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }, 4] };
     *
     * _(object).at(['a[0].b.c', 'a[1]']).value();
     * // => [3, 4]
     */
    var wrapperAt = flatRest(function(paths) {
      var length = paths.length,
          start = length ? paths[0] : 0,
          value = this.__wrapped__,
          interceptor = function(object) { return baseAt(object, paths); };

      if (length > 1 || this.__actions__.length ||
          !(value instanceof LazyWrapper) || !isIndex(start)) {
        return this.thru(interceptor);
      }
      value = value.slice(start, +start + (length ? 1 : 0));
      value.__actions__.push({
        'func': thru,
        'args': [interceptor],
        'thisArg': undefined
      });
      return new LodashWrapper(value, this.__chain__).thru(function(array) {
        if (length && !array.length) {
          array.push(undefined);
        }
        return array;
      });
    });

    /**
     * Creates a `lodash` wrapper instance with explicit method chain sequences enabled.
     *
     * @name chain
     * @memberOf _
     * @since 0.1.0
     * @category Seq
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * // A sequence without explicit chaining.
     * _(users).head();
     * // => { 'user': 'barney', 'age': 36 }
     *
     * // A sequence with explicit chaining.
     * _(users)
     *   .chain()
     *   .head()
     *   .pick('user')
     *   .value();
     * // => { 'user': 'barney' }
     */
    function wrapperChain() {
      return chain(this);
    }

    /**
     * Executes the chain sequence and returns the wrapped result.
     *
     * @name commit
     * @memberOf _
     * @since 3.2.0
     * @category Seq
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var array = [1, 2];
     * var wrapped = _(array).push(3);
     *
     * console.log(array);
     * // => [1, 2]
     *
     * wrapped = wrapped.commit();
     * console.log(array);
     * // => [1, 2, 3]
     *
     * wrapped.last();
     * // => 3
     *
     * console.log(array);
     * // => [1, 2, 3]
     */
    function wrapperCommit() {
      return new LodashWrapper(this.value(), this.__chain__);
    }

    /**
     * Gets the next value on a wrapped object following the
     * [iterator protocol](https://mdn.io/iteration_protocols#iterator).
     *
     * @name next
     * @memberOf _
     * @since 4.0.0
     * @category Seq
     * @returns {Object} Returns the next iterator value.
     * @example
     *
     * var wrapped = _([1, 2]);
     *
     * wrapped.next();
     * // => { 'done': false, 'value': 1 }
     *
     * wrapped.next();
     * // => { 'done': false, 'value': 2 }
     *
     * wrapped.next();
     * // => { 'done': true, 'value': undefined }
     */
    function wrapperNext() {
      if (this.__values__ === undefined) {
        this.__values__ = toArray(this.value());
      }
      var done = this.__index__ >= this.__values__.length,
          value = done ? undefined : this.__values__[this.__index__++];

      return { 'done': done, 'value': value };
    }

    /**
     * Enables the wrapper to be iterable.
     *
     * @name Symbol.iterator
     * @memberOf _
     * @since 4.0.0
     * @category Seq
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var wrapped = _([1, 2]);
     *
     * wrapped[Symbol.iterator]() === wrapped;
     * // => true
     *
     * Array.from(wrapped);
     * // => [1, 2]
     */
    function wrapperToIterator() {
      return this;
    }

    /**
     * Creates a clone of the chain sequence planting `value` as the wrapped value.
     *
     * @name plant
     * @memberOf _
     * @since 3.2.0
     * @category Seq
     * @param {*} value The value to plant.
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var wrapped = _([1, 2]).map(square);
     * var other = wrapped.plant([3, 4]);
     *
     * other.value();
     * // => [9, 16]
     *
     * wrapped.value();
     * // => [1, 4]
     */
    function wrapperPlant(value) {
      var result,
          parent = this;

      while (parent instanceof baseLodash) {
        var clone = wrapperClone(parent);
        clone.__index__ = 0;
        clone.__values__ = undefined;
        if (result) {
          previous.__wrapped__ = clone;
        } else {
          result = clone;
        }
        var previous = clone;
        parent = parent.__wrapped__;
      }
      previous.__wrapped__ = value;
      return result;
    }

    /**
     * This method is the wrapper version of `_.reverse`.
     *
     * **Note:** This method mutates the wrapped array.
     *
     * @name reverse
     * @memberOf _
     * @since 0.1.0
     * @category Seq
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var array = [1, 2, 3];
     *
     * _(array).reverse().value()
     * // => [3, 2, 1]
     *
     * console.log(array);
     * // => [3, 2, 1]
     */
    function wrapperReverse() {
      var value = this.__wrapped__;
      if (value instanceof LazyWrapper) {
        var wrapped = value;
        if (this.__actions__.length) {
          wrapped = new LazyWrapper(this);
        }
        wrapped = wrapped.reverse();
        wrapped.__actions__.push({
          'func': thru,
          'args': [reverse],
          'thisArg': undefined
        });
        return new LodashWrapper(wrapped, this.__chain__);
      }
      return this.thru(reverse);
    }

    /**
     * Executes the chain sequence to resolve the unwrapped value.
     *
     * @name value
     * @memberOf _
     * @since 0.1.0
     * @alias toJSON, valueOf
     * @category Seq
     * @returns {*} Returns the resolved unwrapped value.
     * @example
     *
     * _([1, 2, 3]).value();
     * // => [1, 2, 3]
     */
    function wrapperValue() {
      return baseWrapperValue(this.__wrapped__, this.__actions__);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` thru `iteratee`. The corresponding value of
     * each key is the number of times the key was returned by `iteratee`. The
     * iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 0.5.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity]
     *  The iteratee to transform keys.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([6.1, 4.2, 6.3], Math.floor);
     * // => { '4': 1, '6': 2 }
     *
     * // The `_.property` iteratee shorthand.
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      if (hasOwnProperty.call(result, key)) {
        ++result[key];
      } else {
        baseAssignValue(result, key, 1);
      }
    });

    /**
     * Checks if `predicate` returns truthy for **all** elements of `collection`.
     * Iteration is stopped once `predicate` returns falsey. The predicate is
     * invoked with three arguments: (value, index|key, collection).
     *
     * **Note:** This method returns `true` for
     * [empty collections](https://en.wikipedia.org/wiki/Empty_set) because
     * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
     * elements of empty collections.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity]
     *  The function invoked per iteration.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes'], Boolean);
     * // => false
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': false },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * // The `_.matches` iteratee shorthand.
     * _.every(users, { 'user': 'barney', 'active': false });
     * // => false
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.every(users, ['active', false]);
     * // => true
     *
     * // The `_.property` iteratee shorthand.
     * _.every(users, 'active');
     * // => false
     */
    function every(collection, predicate, guard) {
      var func = isArray(collection) ? arrayEvery : baseEvery;
      if (guard && isIterateeCall(collection, predicate, guard)) {
        predicate = undefined;
      }
      return func(collection, getIteratee(predicate, 3));
    }

    /**
     * Iterates over elements of `collection`, returning an array of all elements
     * `predicate` returns truthy for. The predicate is invoked with three
     * arguments: (value, index|key, collection).
     *
     * **Note:** Unlike `_.remove`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity]
     *  The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     * @see _.reject
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * _.filter(users, function(o) { return !o.active; });
     * // => objects for ['fred']
     *
     * // The `_.matches` iteratee shorthand.
     * _.filter(users, { 'age': 36, 'active': true });
     * // => objects for ['barney']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.filter(users, ['active', false]);
     * // => objects for ['fred']
     *
     * // The `_.property` iteratee shorthand.
     * _.filter(users, 'active');
     * // => objects for ['barney']
     */
    function filter(collection, predicate) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      return func(collection, getIteratee(predicate, 3));
    }

    /**
     * Iterates over elements of `collection`, returning the first element
     * `predicate` returns truthy for. The predicate is invoked with three
     * arguments: (value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to inspect.
     * @param {Function} [predicate=_.identity]
     *  The function invoked per iteration.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36, 'active': true },
     *   { 'user': 'fred',    'age': 40, 'active': false },
     *   { 'user': 'pebbles', 'age': 1,  'active': true }
     * ];
     *
     * _.find(users, function(o) { return o.age < 40; });
     * // => object for 'barney'
     *
     * // The `_.matches` iteratee shorthand.
     * _.find(users, { 'age': 1, 'active': true });
     * // => object for 'pebbles'
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.find(users, ['active', false]);
     * // => object for 'fred'
     *
     * // The `_.property` iteratee shorthand.
     * _.find(users, 'active');
     * // => object for 'barney'
     */
    var find = createFind(findIndex);

    /**
     * This method is like `_.find` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to inspect.
     * @param {Function} [predicate=_.identity]
     *  The function invoked per iteration.
     * @param {number} [fromIndex=collection.length-1] The index to search from.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(n) {
     *   return n % 2 == 1;
     * });
     * // => 3
     */
    var findLast = createFind(findLastIndex);

    /**
     * Creates a flattened array of values by running each element in `collection`
     * thru `iteratee` and flattening the mapped results. The iteratee is invoked
     * with three arguments: (value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity]
     *  The function invoked per iteration.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * function duplicate(n) {
     *   return [n, n];
     * }
     *
     * _.flatMap([1, 2], duplicate);
     * // => [1, 1, 2, 2]
     */
    function flatMap(collection, iteratee) {
      return baseFlatten(map(collection, iteratee), 1);
    }

    /**
     * This method is like `_.flatMap` except that it recursively flattens the
     * mapped results.
     *
     * @static
     * @memberOf _
     * @since 4.7.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity]
     *  The function invoked per iteration.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * function duplicate(n) {
     *   return [[[n, n]]];
     * }
     *
     * _.flatMapDeep([1, 2], duplicate);
     * // => [1, 1, 2, 2]
     */
    function flatMapDeep(collection, iteratee) {
      return baseFlatten(map(collection, iteratee), INFINITY);
    }

    /**
     * This method is like `_.flatMap` except that it recursively flattens the
     * mapped results up to `depth` times.
     *
     * @static
     * @memberOf _
     * @since 4.7.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity]
     *  The function invoked per iteration.
     * @param {number} [depth=1] The maximum recursion depth.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * function duplicate(n) {
     *   return [[[n, n]]];
     * }
     *
     * _.flatMapDepth([1, 2], duplicate, 2);
     * // => [[1, 1], [2, 2]]
     */
    function flatMapDepth(collection, iteratee, depth) {
      depth = depth === undefined ? 1 : toInteger(depth);
      return baseFlatten(map(collection, iteratee), depth);
    }

    /**
     * Iterates over elements of `collection` and invokes `iteratee` for each element.
     * The iteratee is invoked with three arguments: (value, index|key, collection).
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * **Note:** As with other "Collections" methods, objects with a "length"
     * property are iterated like arrays. To avoid this behavior use `_.forIn`
     * or `_.forOwn` for object iteration.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @alias each
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     * @see _.forEachRight
     * @example
     *
     * _.forEach([1, 2], function(value) {
     *   console.log(value);
     * });
     * // => Logs `1` then `2`.
     *
     * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
     */
    function forEach(collection, iteratee) {
      var func = isArray(collection) ? arrayEach : baseEach;
      return func(collection, getIteratee(iteratee, 3));
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @alias eachRight
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     * @see _.forEach
     * @example
     *
     * _.forEachRight([1, 2], function(value) {
     *   console.log(value);
     * });
     * // => Logs `2` then `1`.
     */
    function forEachRight(collection, iteratee) {
      var func = isArray(collection) ? arrayEachRight : baseEachRight;
      return func(collection, getIteratee(iteratee, 3));
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` thru `iteratee`. The order of grouped values
     * is determined by the order they occur in `collection`. The corresponding
     * value of each key is an array of elements responsible for generating the
     * key. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity]
     *  The iteratee to transform keys.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([6.1, 4.2, 6.3], Math.floor);
     * // => { '4': [4.2], '6': [6.1, 6.3] }
     *
     * // The `_.property` iteratee shorthand.
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      if (hasOwnProperty.call(result, key)) {
        result[key].push(value);
      } else {
        baseAssignValue(result, key, [value]);
      }
    });

    /**
     * Checks if `value` is in `collection`. If `collection` is a string, it's
     * checked for a substring of `value`, otherwise
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * is used for equality comparisons. If `fromIndex` is negative, it's used as
     * the offset from the end of `collection`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
     * @returns {boolean} Returns `true` if `value` is found, else `false`.
     * @example
     *
     * _.includes([1, 2, 3], 1);
     * // => true
     *
     * _.includes([1, 2, 3], 1, 2);
     * // => false
     *
     * _.includes({ 'a': 1, 'b': 2 }, 1);
     * // => true
     *
     * _.includes('abcd', 'bc');
     * // => true
     */
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike(collection) ? collection : values(collection);
      fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax(length + fromIndex, 0);
      }
      return isString(collection)
        ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
        : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
    }

    /**
     * Invokes the method at `path` of each element in `collection`, returning
     * an array of the results of each invoked method. Any additional arguments
     * are provided to each invoked method. If `path` is a function, it's invoked
     * for, and `this` bound to, each element in `collection`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Array|Function|string} path The path of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [args] The arguments to invoke each method with.
     * @returns {Array} Returns the array of results.
     * @example
     *
     * _.invokeMap([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invokeMap([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    var invokeMap = baseRest(function(collection, path, args) {
      var index = -1,
          isFunc = typeof path == 'function',
          isProp = isKey(path),
          result = isArrayLike(collection) ? Array(collection.length) : [];

      baseEach(collection, function(value) {
        var func = isFunc ? path : ((isProp && value != null) ? value[path] : undefined);
        result[++index] = func ? apply(func, value, args) : baseInvoke(value, path, args);
      });
      return result;
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` thru `iteratee`. The corresponding value of
     * each key is the last element responsible for generating the key. The
     * iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity]
     *  The iteratee to transform keys.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var array = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.keyBy(array, function(o) {
     *   return String.fromCharCode(o.code);
     * });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.keyBy(array, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     */
    var keyBy = createAggregator(function(result, value, key) {
      baseAssignValue(result, key, value);
    });

    /**
     * Creates an array of values by running each element in `collection` thru
     * `iteratee`. The iteratee is invoked with three arguments:
     * (value, index|key, collection).
     *
     * Many lodash methods are guarded to work as iteratees for methods like
     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
     *
     * The guarded methods are:
     * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
     * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
     * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
     * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * _.map([4, 8], square);
     * // => [16, 64]
     *
     * _.map({ 'a': 4, 'b': 8 }, square);
     * // => [16, 64] (iteration order is not guaranteed)
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * // The `_.property` iteratee shorthand.
     * _.map(users, 'user');
     * // => ['barney', 'fred']
     */
    function map(collection, iteratee) {
      var func = isArray(collection) ? arrayMap : baseMap;
      return func(collection, getIteratee(iteratee, 3));
    }

    /**
     * This method is like `_.sortBy` except that it allows specifying the sort
     * orders of the iteratees to sort by. If `orders` is unspecified, all values
     * are sorted in ascending order. Otherwise, specify an order of "desc" for
     * descending or "asc" for ascending sort order of corresponding values.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Array[]|Function[]|Object[]|string[]} [iteratees=[_.identity]]
     *  The iteratees to sort by.
     * @param {string[]} [orders] The sort orders of `iteratees`.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
     * @returns {Array} Returns the new sorted array.
     * @example
     *
     * var users = [
     *   { 'user': 'fred',   'age': 48 },
     *   { 'user': 'barney', 'age': 34 },
     *   { 'user': 'fred',   'age': 40 },
     *   { 'user': 'barney', 'age': 36 }
     * ];
     *
     * // Sort by `user` in ascending order and by `age` in descending order.
     * _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
     * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
     */
    function orderBy(collection, iteratees, orders, guard) {
      if (collection == null) {
        return [];
      }
      if (!isArray(iteratees)) {
        iteratees = iteratees == null ? [] : [iteratees];
      }
      orders = guard ? undefined : orders;
      if (!isArray(orders)) {
        orders = orders == null ? [] : [orders];
      }
      return baseOrderBy(collection, iteratees, orders);
    }

    /**
     * Creates an array of elements split into two groups, the first of which
     * contains elements `predicate` returns truthy for, the second of which
     * contains elements `predicate` returns falsey for. The predicate is
     * invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the array of grouped elements.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36, 'active': false },
     *   { 'user': 'fred',    'age': 40, 'active': true },
     *   { 'user': 'pebbles', 'age': 1,  'active': false }
     * ];
     *
     * _.partition(users, function(o) { return o.active; });
     * // => objects for [['fred'], ['barney', 'pebbles']]
     *
     * // The `_.matches` iteratee shorthand.
     * _.partition(users, { 'age': 1, 'active': false });
     * // => objects for [['pebbles'], ['barney', 'fred']]
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.partition(users, ['active', false]);
     * // => objects for [['barney', 'pebbles'], ['fred']]
     *
     * // The `_.property` iteratee shorthand.
     * _.partition(users, 'active');
     * // => objects for [['fred'], ['barney', 'pebbles']]
     */
    var partition = createAggregator(function(result, value, key) {
      result[key ? 0 : 1].push(value);
    }, function() { return [[], []]; });

    /**
     * Reduces `collection` to a value which is the accumulated result of running
     * each element in `collection` thru `iteratee`, where each successive
     * invocation is supplied the return value of the previous. If `accumulator`
     * is not given, the first element of `collection` is used as the initial
     * value. The iteratee is invoked with four arguments:
     * (accumulator, value, index|key, collection).
     *
     * Many lodash methods are guarded to work as iteratees for methods like
     * `_.reduce`, `_.reduceRight`, and `_.transform`.
     *
     * The guarded methods are:
     * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
     * and `sortBy`
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @returns {*} Returns the accumulated value.
     * @see _.reduceRight
     * @example
     *
     * _.reduce([1, 2], function(sum, n) {
     *   return sum + n;
     * }, 0);
     * // => 3
     *
     * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
     *   (result[value] || (result[value] = [])).push(key);
     *   return result;
     * }, {});
     * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
     */
    function reduce(collection, iteratee, accumulator) {
      var func = isArray(collection) ? arrayReduce : baseReduce,
          initAccum = arguments.length < 3;

      return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEach);
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @returns {*} Returns the accumulated value.
     * @see _.reduce
     * @example
     *
     * var array = [[0, 1], [2, 3], [4, 5]];
     *
     * _.reduceRight(array, function(flattened, other) {
     *   return flattened.concat(other);
     * }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, iteratee, accumulator) {
      var func = isArray(collection) ? arrayReduceRight : baseReduce,
          initAccum = arguments.length < 3;

      return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
    }

    /**
     * The opposite of `_.filter`; this method returns the elements of `collection`
     * that `predicate` does **not** return truthy for.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     * @see _.filter
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': false },
     *   { 'user': 'fred',   'age': 40, 'active': true }
     * ];
     *
     * _.reject(users, function(o) { return !o.active; });
     * // => objects for ['fred']
     *
     * // The `_.matches` iteratee shorthand.
     * _.reject(users, { 'age': 40, 'active': true });
     * // => objects for ['barney']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.reject(users, ['active', false]);
     * // => objects for ['fred']
     *
     * // The `_.property` iteratee shorthand.
     * _.reject(users, 'active');
     * // => objects for ['barney']
     */
    function reject(collection, predicate) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      return func(collection, negate(getIteratee(predicate, 3)));
    }

    /**
     * Gets a random element from `collection`.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to sample.
     * @returns {*} Returns the random element.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     */
    function sample(collection) {
      return arraySample(isArrayLike(collection) ? collection : values(collection));
    }

    /**
     * Gets `n` random elements at unique keys from `collection` up to the
     * size of `collection`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to sample.
     * @param {number} [n=1] The number of elements to sample.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the random elements.
     * @example
     *
     * _.sampleSize([1, 2, 3], 2);
     * // => [3, 1]
     *
     * _.sampleSize([1, 2, 3], 4);
     * // => [2, 3, 1]
     */
    function sampleSize(collection, n, guard) {
      if ((guard ? isIterateeCall(collection, n, guard) : n === undefined)) {
        n = 1;
      } else {
        n = toInteger(n);
      }
      return arraySampleSize(isArrayLike(collection) ? collection : values(collection), n);
    }

    /**
     * Creates an array of shuffled values, using a version of the
     * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to shuffle.
     * @returns {Array} Returns the new shuffled array.
     * @example
     *
     * _.shuffle([1, 2, 3, 4]);
     * // => [4, 1, 3, 2]
     */
    function shuffle(collection) {
      return shuffleSelf(isArrayLike(collection)
        ? copyArray(collection)
        : values(collection)
      );
    }

    /**
     * Gets the size of `collection` by returning its length for array-like
     * values or the number of own enumerable string keyed properties for objects.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns the collection size.
     * @example
     *
     * _.size([1, 2, 3]);
     * // => 3
     *
     * _.size({ 'a': 1, 'b': 2 });
     * // => 2
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      if (collection == null) {
        return 0;
      }
      if (isArrayLike(collection)) {
        return isString(collection) ? stringSize(collection) : collection.length;
      }
      var tag = getTag(collection);
      if (tag == mapTag || tag == setTag) {
        return collection.size;
      }
      return baseKeys(collection).length;
    }

    /**
     * Checks if `predicate` returns truthy for **any** element of `collection`.
     * Iteration is stopped once `predicate` returns truthy. The predicate is
     * invoked with three arguments: (value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var users = [
     *   { 'user': 'barney', 'active': true },
     *   { 'user': 'fred',   'active': false }
     * ];
     *
     * // The `_.matches` iteratee shorthand.
     * _.some(users, { 'user': 'barney', 'active': false });
     * // => false
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.some(users, ['active', false]);
     * // => true
     *
     * // The `_.property` iteratee shorthand.
     * _.some(users, 'active');
     * // => true
     */
    function some(collection, predicate, guard) {
      var func = isArray(collection) ? arraySome : baseSome;
      if (guard && isIterateeCall(collection, predicate, guard)) {
        predicate = undefined;
      }
      return func(collection, getIteratee(predicate, 3));
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection thru each iteratee. This method
     * performs a stable sort, that is, it preserves the original sort order of
     * equal elements. The iteratees are invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {...(Function|Function[])} [iteratees=[_.identity]]
     *  The iteratees to sort by.
     * @returns {Array} Returns the new sorted array.
     * @example
     *
     * var users = [
     *   { 'user': 'fred',   'age': 48 },
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 },
     *   { 'user': 'barney', 'age': 34 }
     * ];
     *
     * _.sortBy(users, [function(o) { return o.user; }]);
     * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
     *
     * _.sortBy(users, ['user', 'age']);
     * // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]
     */
    var sortBy = baseRest(function(collection, iteratees) {
      if (collection == null) {
        return [];
      }
      var length = iteratees.length;
      if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
        iteratees = [];
      } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
        iteratees = [iteratees[0]];
      }
      return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
    });

    /*------------------------------------------------------------------------*/

    /**
     * Gets the timestamp of the number of milliseconds that have elapsed since
     * the Unix epoch (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Date
     * @returns {number} Returns the timestamp.
     * @example
     *
     * _.defer(function(stamp) {
     *   console.log(_.now() - stamp);
     * }, _.now());
     * // => Logs the number of milliseconds it took for the deferred invocation.
     */
    var now = ctxNow || function() {
      return root.Date.now();
    };

    /*------------------------------------------------------------------------*/

    /**
     * The opposite of `_.before`; this method creates a function that invokes
     * `func` once it's called `n` or more times.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {number} n The number of calls before `func` is invoked.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => Logs 'done saving!' after the two async saves have completed.
     */
    function after(n, func) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      n = toInteger(n);
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that invokes `func`, with up to `n` arguments,
     * ignoring any additional arguments.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Function
     * @param {Function} func The function to cap arguments for.
     * @param {number} [n=func.length] The arity cap.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Function} Returns the new capped function.
     * @example
     *
     * _.map(['6', '8', '10'], _.ary(parseInt, 1));
     * // => [6, 8, 10]
     */
    function ary(func, n, guard) {
      n = guard ? undefined : n;
      n = (func && n == null) ? func.length : n;
      return createWrap(func, ARY_FLAG, undefined, undefined, undefined, undefined, n);
    }

    /**
     * Creates a function that invokes `func`, with the `this` binding and arguments
     * of the created function, while it's called less than `n` times. Subsequent
     * calls to the created function return the result of the last `func` invocation.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Function
     * @param {number} n The number of calls at which `func` is no longer invoked.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * jQuery(element).on('click', _.before(5, addContactToList));
     * // => Allows adding up to 4 contacts to the list.
     */
    function before(n, func) {
      var result;
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      n = toInteger(n);
      return function() {
        if (--n > 0) {
          result = func.apply(this, arguments);
        }
        if (n <= 1) {
          func = undefined;
        }
        return result;
      };
    }

    /**
     * Creates a function that invokes `func` with the `this` binding of `thisArg`
     * and `partials` prepended to the arguments it receives.
     *
     * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
     * may be used as a placeholder for partially applied arguments.
     *
     * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
     * property of bound functions.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to bind.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * function greet(greeting, punctuation) {
     *   return greeting + ' ' + this.user + punctuation;
     * }
     *
     * var object = { 'user': 'fred' };
     *
     * var bound = _.bind(greet, object, 'hi');
     * bound('!');
     * // => 'hi fred!'
     *
     * // Bound with placeholders.
     * var bound = _.bind(greet, object, _, '!');
     * bound('hi');
     * // => 'hi fred!'
     */
    var bind = baseRest(function(func, thisArg, partials) {
      var bitmask = BIND_FLAG;
      if (partials.length) {
        var holders = replaceHolders(partials, getHolder(bind));
        bitmask |= PARTIAL_FLAG;
      }
      return createWrap(func, bitmask, thisArg, partials, holders);
    });

    /**
     * Creates a function that invokes the method at `object[key]` with `partials`
     * prepended to the arguments it receives.
     *
     * This method differs from `_.bind` by allowing bound functions to reference
     * methods that may be redefined or don't yet exist. See
     * [Peter Michaux's article](http://peter.michaux.ca/articles/lazy-function-definition-pattern)
     * for more details.
     *
     * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * @static
     * @memberOf _
     * @since 0.10.0
     * @category Function
     * @param {Object} object The object to invoke the method on.
     * @param {string} key The key of the method.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'user': 'fred',
     *   'greet': function(greeting, punctuation) {
     *     return greeting + ' ' + this.user + punctuation;
     *   }
     * };
     *
     * var bound = _.bindKey(object, 'greet', 'hi');
     * bound('!');
     * // => 'hi fred!'
     *
     * object.greet = function(greeting, punctuation) {
     *   return greeting + 'ya ' + this.user + punctuation;
     * };
     *
     * bound('!');
     * // => 'hiya fred!'
     *
     * // Bound with placeholders.
     * var bound = _.bindKey(object, 'greet', _, '!');
     * bound('hi');
     * // => 'hiya fred!'
     */
    var bindKey = baseRest(function(object, key, partials) {
      var bitmask = BIND_FLAG | BIND_KEY_FLAG;
      if (partials.length) {
        var holders = replaceHolders(partials, getHolder(bindKey));
        bitmask |= PARTIAL_FLAG;
      }
      return createWrap(key, bitmask, object, partials, holders);
    });

    /**
     * Creates a function that accepts arguments of `func` and either invokes
     * `func` returning its result, if at least `arity` number of arguments have
     * been provided, or returns a function that accepts the remaining `func`
     * arguments, and so on. The arity of `func` may be specified if `func.length`
     * is not sufficient.
     *
     * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,
     * may be used as a placeholder for provided arguments.
     *
     * **Note:** This method doesn't set the "length" property of curried functions.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Function
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var abc = function(a, b, c) {
     *   return [a, b, c];
     * };
     *
     * var curried = _.curry(abc);
     *
     * curried(1)(2)(3);
     * // => [1, 2, 3]
     *
     * curried(1, 2)(3);
     * // => [1, 2, 3]
     *
     * curried(1, 2, 3);
     * // => [1, 2, 3]
     *
     * // Curried with placeholders.
     * curried(1)(_, 3)(2);
     * // => [1, 2, 3]
     */
    function curry(func, arity, guard) {
      arity = guard ? undefined : arity;
      var result = createWrap(func, CURRY_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
      result.placeholder = curry.placeholder;
      return result;
    }

    /**
     * This method is like `_.curry` except that arguments are applied to `func`
     * in the manner of `_.partialRight` instead of `_.partial`.
     *
     * The `_.curryRight.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for provided arguments.
     *
     * **Note:** This method doesn't set the "length" property of curried functions.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Function
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var abc = function(a, b, c) {
     *   return [a, b, c];
     * };
     *
     * var curried = _.curryRight(abc);
     *
     * curried(3)(2)(1);
     * // => [1, 2, 3]
     *
     * curried(2, 3)(1);
     * // => [1, 2, 3]
     *
     * curried(1, 2, 3);
     * // => [1, 2, 3]
     *
     * // Curried with placeholders.
     * curried(3)(1, _)(2);
     * // => [1, 2, 3]
     */
    function curryRight(func, arity, guard) {
      arity = guard ? undefined : arity;
      var result = createWrap(func, CURRY_RIGHT_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
      result.placeholder = curryRight.placeholder;
      return result;
    }

    /**
     * Creates a debounced function that delays invoking `func` until after `wait`
     * milliseconds have elapsed since the last time the debounced function was
     * invoked. The debounced function comes with a `cancel` method to cancel
     * delayed `func` invocations and a `flush` method to immediately invoke them.
     * Provide `options` to indicate whether `func` should be invoked on the
     * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
     * with the last arguments provided to the debounced function. Subsequent
     * calls to the debounced function return the result of the last `func`
     * invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is
     * invoked on the trailing edge of the timeout only if the debounced function
     * is invoked more than once during the `wait` timeout.
     *
     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
     *
     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
     * for details over the differences between `_.debounce` and `_.throttle`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to debounce.
     * @param {number} [wait=0] The number of milliseconds to delay.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.leading=false]
     *  Specify invoking on the leading edge of the timeout.
     * @param {number} [options.maxWait]
     *  The maximum time `func` is allowed to be delayed before it's invoked.
     * @param {boolean} [options.trailing=true]
     *  Specify invoking on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // Avoid costly calculations while the window size is in flux.
     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
     *
     * // Invoke `sendMail` when clicked, debouncing subsequent calls.
     * jQuery(element).on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * }));
     *
     * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
     * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
     * var source = new EventSource('/stream');
     * jQuery(source).on('message', debounced);
     *
     * // Cancel the trailing debounced invocation.
     * jQuery(window).on('popstate', debounced.cancel);
     */
    function debounce(func, wait, options) {
      var lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime,
          lastInvokeTime = 0,
          leading = false,
          maxing = false,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }

      function invokeFunc(time) {
        var args = lastArgs,
            thisArg = lastThis;

        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }

      function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time;
        // Start the timer for the trailing edge.
        timerId = setTimeout(timerExpired, wait);
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result;
      }

      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime,
            result = wait - timeSinceLastCall;

        return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
      }

      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime;

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
          (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
      }

      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        // Restart the timer.
        timerId = setTimeout(timerExpired, remainingWait(time));
      }

      function trailingEdge(time) {
        timerId = undefined;

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
      }

      function cancel() {
        if (timerId !== undefined) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
      }

      function flush() {
        return timerId === undefined ? result : trailingEdge(now());
      }

      function debounced() {
        var time = now(),
            isInvoking = shouldInvoke(time);

        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
          if (timerId === undefined) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            // Handle invocations in a tight loop.
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === undefined) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }

    /**
     * Defers invoking the `func` until the current call stack has cleared. Any
     * additional arguments are provided to `func` when it's invoked.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to defer.
     * @param {...*} [args] The arguments to invoke `func` with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) {
     *   console.log(text);
     * }, 'deferred');
     * // => Logs 'deferred' after one millisecond.
     */
    var defer = baseRest(function(func, args) {
      return baseDelay(func, 1, args);
    });

    /**
     * Invokes `func` after `wait` milliseconds. Any additional arguments are
     * provided to `func` when it's invoked.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay invocation.
     * @param {...*} [args] The arguments to invoke `func` with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) {
     *   console.log(text);
     * }, 1000, 'later');
     * // => Logs 'later' after one second.
     */
    var delay = baseRest(function(func, wait, args) {
      return baseDelay(func, toNumber(wait) || 0, args);
    });

    /**
     * Creates a function that invokes `func` with arguments reversed.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Function
     * @param {Function} func The function to flip arguments for.
     * @returns {Function} Returns the new flipped function.
     * @example
     *
     * var flipped = _.flip(function() {
     *   return _.toArray(arguments);
     * });
     *
     * flipped('a', 'b', 'c', 'd');
     * // => ['d', 'c', 'b', 'a']
     */
    function flip(func) {
      return createWrap(func, FLIP_FLAG);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
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
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
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
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache);
      return memoized;
    }

    // Expose `MapCache`.
    memoize.Cache = MapCache;

    /**
     * Creates a function that negates the result of the predicate `func`. The
     * `func` predicate is invoked with the `this` binding and arguments of the
     * created function.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Function
     * @param {Function} predicate The predicate to negate.
     * @returns {Function} Returns the new negated function.
     * @example
     *
     * function isEven(n) {
     *   return n % 2 == 0;
     * }
     *
     * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
     * // => [1, 3, 5]
     */
    function negate(predicate) {
      if (typeof predicate != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return function() {
        var args = arguments;
        switch (args.length) {
          case 0: return !predicate.call(this);
          case 1: return !predicate.call(this, args[0]);
          case 2: return !predicate.call(this, args[0], args[1]);
          case 3: return !predicate.call(this, args[0], args[1], args[2]);
        }
        return !predicate.apply(this, args);
      };
    }

    /**
     * Creates a function that is restricted to invoking `func` once. Repeat calls
     * to the function return the value of the first invocation. The `func` is
     * invoked with the `this` binding and arguments of the created function.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // => `createApplication` is invoked once
     */
    function once(func) {
      return before(2, func);
    }

    /**
     * Creates a function that invokes `func` with its arguments transformed.
     *
     * @static
     * @since 4.0.0
     * @memberOf _
     * @category Function
     * @param {Function} func The function to wrap.
     * @param {...(Function|Function[])} [transforms=[_.identity]]
     *  The argument transforms.
     * @returns {Function} Returns the new function.
     * @example
     *
     * function doubled(n) {
     *   return n * 2;
     * }
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var func = _.overArgs(function(x, y) {
     *   return [x, y];
     * }, [square, doubled]);
     *
     * func(9, 3);
     * // => [81, 6]
     *
     * func(10, 5);
     * // => [100, 10]
     */
    var overArgs = castRest(function(func, transforms) {
      transforms = (transforms.length == 1 && isArray(transforms[0]))
        ? arrayMap(transforms[0], baseUnary(getIteratee()))
        : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));

      var funcsLength = transforms.length;
      return baseRest(function(args) {
        var index = -1,
            length = nativeMin(args.length, funcsLength);

        while (++index < length) {
          args[index] = transforms[index].call(this, args[index]);
        }
        return apply(func, this, args);
      });
    });

    /**
     * Creates a function that invokes `func` with `partials` prepended to the
     * arguments it receives. This method is like `_.bind` except it does **not**
     * alter the `this` binding.
     *
     * The `_.partial.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * **Note:** This method doesn't set the "length" property of partially
     * applied functions.
     *
     * @static
     * @memberOf _
     * @since 0.2.0
     * @category Function
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * function greet(greeting, name) {
     *   return greeting + ' ' + name;
     * }
     *
     * var sayHelloTo = _.partial(greet, 'hello');
     * sayHelloTo('fred');
     * // => 'hello fred'
     *
     * // Partially applied with placeholders.
     * var greetFred = _.partial(greet, _, 'fred');
     * greetFred('hi');
     * // => 'hi fred'
     */
    var partial = baseRest(function(func, partials) {
      var holders = replaceHolders(partials, getHolder(partial));
      return createWrap(func, PARTIAL_FLAG, undefined, partials, holders);
    });

    /**
     * This method is like `_.partial` except that partially applied arguments
     * are appended to the arguments it receives.
     *
     * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * **Note:** This method doesn't set the "length" property of partially
     * applied functions.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Function
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * function greet(greeting, name) {
     *   return greeting + ' ' + name;
     * }
     *
     * var greetFred = _.partialRight(greet, 'fred');
     * greetFred('hi');
     * // => 'hi fred'
     *
     * // Partially applied with placeholders.
     * var sayHelloTo = _.partialRight(greet, 'hello', _);
     * sayHelloTo('fred');
     * // => 'hello fred'
     */
    var partialRight = baseRest(function(func, partials) {
      var holders = replaceHolders(partials, getHolder(partialRight));
      return createWrap(func, PARTIAL_RIGHT_FLAG, undefined, partials, holders);
    });

    /**
     * Creates a function that invokes `func` with arguments arranged according
     * to the specified `indexes` where the argument value at the first index is
     * provided as the first argument, the argument value at the second index is
     * provided as the second argument, and so on.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Function
     * @param {Function} func The function to rearrange arguments for.
     * @param {...(number|number[])} indexes The arranged argument indexes.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var rearged = _.rearg(function(a, b, c) {
     *   return [a, b, c];
     * }, [2, 0, 1]);
     *
     * rearged('b', 'c', 'a')
     * // => ['a', 'b', 'c']
     */
    var rearg = flatRest(function(func, indexes) {
      return createWrap(func, REARG_FLAG, undefined, undefined, undefined, indexes);
    });

    /**
     * Creates a function that invokes `func` with the `this` binding of the
     * created function and arguments from `start` and beyond provided as
     * an array.
     *
     * **Note:** This method is based on the
     * [rest parameter](https://mdn.io/rest_parameters).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
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
      start = start === undefined ? start : toInteger(start);
      return baseRest(func, start);
    }

    /**
     * Creates a function that invokes `func` with the `this` binding of the
     * create function and an array of arguments much like
     * [`Function#apply`](http://www.ecma-international.org/ecma-262/7.0/#sec-function.prototype.apply).
     *
     * **Note:** This method is based on the
     * [spread operator](https://mdn.io/spread_operator).
     *
     * @static
     * @memberOf _
     * @since 3.2.0
     * @category Function
     * @param {Function} func The function to spread arguments over.
     * @param {number} [start=0] The start position of the spread.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var say = _.spread(function(who, what) {
     *   return who + ' says ' + what;
     * });
     *
     * say(['fred', 'hello']);
     * // => 'fred says hello'
     *
     * var numbers = Promise.all([
     *   Promise.resolve(40),
     *   Promise.resolve(36)
     * ]);
     *
     * numbers.then(_.spread(function(x, y) {
     *   return x + y;
     * }));
     * // => a Promise of 76
     */
    function spread(func, start) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      start = start === undefined ? 0 : nativeMax(toInteger(start), 0);
      return baseRest(function(args) {
        var array = args[start],
            otherArgs = castSlice(args, 0, start);

        if (array) {
          arrayPush(otherArgs, array);
        }
        return apply(func, this, otherArgs);
      });
    }

    /**
     * Creates a throttled function that only invokes `func` at most once per
     * every `wait` milliseconds. The throttled function comes with a `cancel`
     * method to cancel delayed `func` invocations and a `flush` method to
     * immediately invoke them. Provide `options` to indicate whether `func`
     * should be invoked on the leading and/or trailing edge of the `wait`
     * timeout. The `func` is invoked with the last arguments provided to the
     * throttled function. Subsequent calls to the throttled function return the
     * result of the last `func` invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is
     * invoked on the trailing edge of the timeout only if the throttled function
     * is invoked more than once during the `wait` timeout.
     *
     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
     *
     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
     * for details over the differences between `_.throttle` and `_.debounce`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to throttle.
     * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.leading=true]
     *  Specify invoking on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true]
     *  Specify invoking on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // Avoid excessively updating the position while scrolling.
     * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
     *
     * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
     * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
     * jQuery(element).on('click', throttled);
     *
     * // Cancel the trailing throttled invocation.
     * jQuery(window).on('popstate', throttled.cancel);
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (isObject(options)) {
        leading = 'leading' in options ? !!options.leading : leading;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }
      return debounce(func, wait, {
        'leading': leading,
        'maxWait': wait,
        'trailing': trailing
      });
    }

    /**
     * Creates a function that accepts up to one argument, ignoring any
     * additional arguments.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Function
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     * @example
     *
     * _.map(['6', '8', '10'], _.unary(parseInt));
     * // => [6, 8, 10]
     */
    function unary(func) {
      return ary(func, 1);
    }

    /**
     * Creates a function that provides `value` to `wrapper` as its first
     * argument. Any additional arguments provided to the function are appended
     * to those provided to the `wrapper`. The wrapper is invoked with the `this`
     * binding of the created function.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {*} value The value to wrap.
     * @param {Function} [wrapper=identity] The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('fred, barney, & pebbles');
     * // => '<p>fred, barney, &amp; pebbles</p>'
     */
    function wrap(value, wrapper) {
      wrapper = wrapper == null ? identity : wrapper;
      return partial(wrapper, value);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Casts `value` as an array if it's not one.
     *
     * @static
     * @memberOf _
     * @since 4.4.0
     * @category Lang
     * @param {*} value The value to inspect.
     * @returns {Array} Returns the cast array.
     * @example
     *
     * _.castArray(1);
     * // => [1]
     *
     * _.castArray({ 'a': 1 });
     * // => [{ 'a': 1 }]
     *
     * _.castArray('abc');
     * // => ['abc']
     *
     * _.castArray(null);
     * // => [null]
     *
     * _.castArray(undefined);
     * // => [undefined]
     *
     * _.castArray();
     * // => []
     *
     * var array = [1, 2, 3];
     * console.log(_.castArray(array) === array);
     * // => true
     */
    function castArray() {
      if (!arguments.length) {
        return [];
      }
      var value = arguments[0];
      return isArray(value) ? value : [value];
    }

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
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to clone.
     * @returns {*} Returns the cloned value.
     * @see _.cloneDeep
     * @example
     *
     * var objects = [{ 'a': 1 }, { 'b': 2 }];
     *
     * var shallow = _.clone(objects);
     * console.log(shallow[0] === objects[0]);
     * // => true
     */
    function clone(value) {
      return baseClone(value, false, true);
    }

    /**
     * This method is like `_.clone` except that it accepts `customizer` which
     * is invoked to produce the cloned value. If `customizer` returns `undefined`,
     * cloning is handled by the method instead. The `customizer` is invoked with
     * up to four arguments; (value [, index|key, object, stack]).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to clone.
     * @param {Function} [customizer] The function to customize cloning.
     * @returns {*} Returns the cloned value.
     * @see _.cloneDeepWith
     * @example
     *
     * function customizer(value) {
     *   if (_.isElement(value)) {
     *     return value.cloneNode(false);
     *   }
     * }
     *
     * var el = _.cloneWith(document.body, customizer);
     *
     * console.log(el === document.body);
     * // => false
     * console.log(el.nodeName);
     * // => 'BODY'
     * console.log(el.childNodes.length);
     * // => 0
     */
    function cloneWith(value, customizer) {
      return baseClone(value, false, true, customizer);
    }

    /**
     * This method is like `_.clone` except that it recursively clones `value`.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Lang
     * @param {*} value The value to recursively clone.
     * @returns {*} Returns the deep cloned value.
     * @see _.clone
     * @example
     *
     * var objects = [{ 'a': 1 }, { 'b': 2 }];
     *
     * var deep = _.cloneDeep(objects);
     * console.log(deep[0] === objects[0]);
     * // => false
     */
    function cloneDeep(value) {
      return baseClone(value, true, true);
    }

    /**
     * This method is like `_.cloneWith` except that it recursively clones `value`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to recursively clone.
     * @param {Function} [customizer] The function to customize cloning.
     * @returns {*} Returns the deep cloned value.
     * @see _.cloneWith
     * @example
     *
     * function customizer(value) {
     *   if (_.isElement(value)) {
     *     return value.cloneNode(true);
     *   }
     * }
     *
     * var el = _.cloneDeepWith(document.body, customizer);
     *
     * console.log(el === document.body);
     * // => false
     * console.log(el.nodeName);
     * // => 'BODY'
     * console.log(el.childNodes.length);
     * // => 20
     */
    function cloneDeepWith(value, customizer) {
      return baseClone(value, true, true, customizer);
    }

    /**
     * Checks if `object` conforms to `source` by invoking the predicate
     * properties of `source` with the corresponding property values of `object`.
     *
     * **Note:** This method is equivalent to `_.conforms` when `source` is
     * partially applied.
     *
     * @static
     * @memberOf _
     * @since 4.14.0
     * @category Lang
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property predicates to conform to.
     * @returns {boolean} Returns `true` if `object` conforms, else `false`.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     *
     * _.conformsTo(object, { 'b': function(n) { return n > 1; } });
     * // => true
     *
     * _.conformsTo(object, { 'b': function(n) { return n > 2; } });
     * // => false
     */
    function conformsTo(object, source) {
      return source == null || baseConformsTo(object, source, keys(source));
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
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
     * Checks if `value` is greater than `other`.
     *
     * @static
     * @memberOf _
     * @since 3.9.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is greater than `other`,
     *  else `false`.
     * @see _.lt
     * @example
     *
     * _.gt(3, 1);
     * // => true
     *
     * _.gt(3, 3);
     * // => false
     *
     * _.gt(1, 3);
     * // => false
     */
    var gt = createRelationalOperation(baseGt);

    /**
     * Checks if `value` is greater than or equal to `other`.
     *
     * @static
     * @memberOf _
     * @since 3.9.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is greater than or equal to
     *  `other`, else `false`.
     * @see _.lte
     * @example
     *
     * _.gte(3, 1);
     * // => true
     *
     * _.gte(3, 3);
     * // => true
     *
     * _.gte(1, 3);
     * // => false
     */
    var gte = createRelationalOperation(function(value, other) {
      return value >= other;
    });

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
      return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
        (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
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
     * Checks if `value` is classified as an `ArrayBuffer` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
     * @example
     *
     * _.isArrayBuffer(new ArrayBuffer(2));
     * // => true
     *
     * _.isArrayBuffer(new Array(2));
     * // => false
     */
    var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
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
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
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
     * Checks if `value` is classified as a boolean primitive or object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
     * @example
     *
     * _.isBoolean(false);
     * // => true
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        (isObjectLike(value) && objectToString.call(value) == boolTag);
    }

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse;

    /**
     * Checks if `value` is classified as a `Date` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     *
     * _.isDate('Mon April 23 2012');
     * // => false
     */
    var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;

    /**
     * Checks if `value` is likely a DOM element.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     *
     * _.isElement('<body>');
     * // => false
     */
    function isElement(value) {
      return value != null && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value);
    }

    /**
     * Checks if `value` is an empty object, collection, map, or set.
     *
     * Objects are considered empty if they have no own enumerable string keyed
     * properties.
     *
     * Array-like values such as `arguments` objects, arrays, buffers, strings, or
     * jQuery-like collections are considered empty if they have a `length` of `0`.
     * Similarly, maps and sets are considered empty if they have a `size` of `0`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty(null);
     * // => true
     *
     * _.isEmpty(true);
     * // => true
     *
     * _.isEmpty(1);
     * // => true
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({ 'a': 1 });
     * // => false
     */
    function isEmpty(value) {
      if (isArrayLike(value) &&
          (isArray(value) || typeof value == 'string' ||
            typeof value.splice == 'function' || isBuffer(value) || isArguments(value))) {
        return !value.length;
      }
      var tag = getTag(value);
      if (tag == mapTag || tag == setTag) {
        return !value.size;
      }
      if (isPrototype(value)) {
        return !nativeKeys(value).length;
      }
      for (var key in value) {
        if (hasOwnProperty.call(value, key)) {
          return false;
        }
      }
      return true;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent.
     *
     * **Note:** This method supports comparing arrays, array buffers, booleans,
     * date objects, error objects, maps, numbers, `Object` objects, regexes,
     * sets, strings, symbols, and typed arrays. `Object` objects are compared
     * by their own, not inherited, enumerable properties. Functions and DOM
     * nodes are **not** supported.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.isEqual(object, other);
     * // => true
     *
     * object === other;
     * // => false
     */
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }

    /**
     * This method is like `_.isEqual` except that it accepts `customizer` which
     * is invoked to compare values. If `customizer` returns `undefined`, comparisons
     * are handled by the method instead. The `customizer` is invoked with up to
     * six arguments: (objValue, othValue [, index|key, object, other, stack]).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * function isGreeting(value) {
     *   return /^h(?:i|ello)$/.test(value);
     * }
     *
     * function customizer(objValue, othValue) {
     *   if (isGreeting(objValue) && isGreeting(othValue)) {
     *     return true;
     *   }
     * }
     *
     * var array = ['hello', 'goodbye'];
     * var other = ['hi', 'goodbye'];
     *
     * _.isEqualWith(array, other, customizer);
     * // => true
     */
    function isEqualWith(value, other, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined;
      var result = customizer ? customizer(value, other) : undefined;
      return result === undefined ? baseIsEqual(value, other, customizer) : !!result;
    }

    /**
     * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
     * `SyntaxError`, `TypeError`, or `URIError` object.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
     * @example
     *
     * _.isError(new Error);
     * // => true
     *
     * _.isError(Error);
     * // => false
     */
    function isError(value) {
      if (!isObjectLike(value)) {
        return false;
      }
      return (objectToString.call(value) == errorTag) ||
        (typeof value.message == 'string' && typeof value.name == 'string');
    }

    /**
     * Checks if `value` is a finite primitive number.
     *
     * **Note:** This method is based on
     * [`Number.isFinite`](https://mdn.io/Number/isFinite).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
     * @example
     *
     * _.isFinite(3);
     * // => true
     *
     * _.isFinite(Number.MIN_VALUE);
     * // => true
     *
     * _.isFinite(Infinity);
     * // => false
     *
     * _.isFinite('3');
     * // => false
     */
    function isFinite(value) {
      return typeof value == 'number' && nativeIsFinite(value);
    }

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
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
      // in Safari 8-9 which returns 'object' for typed array and other constructors.
      var tag = isObject(value) ? objectToString.call(value) : '';
      return tag == funcTag || tag == genTag;
    }

    /**
     * Checks if `value` is an integer.
     *
     * **Note:** This method is based on
     * [`Number.isInteger`](https://mdn.io/Number/isInteger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an integer, else `false`.
     * @example
     *
     * _.isInteger(3);
     * // => true
     *
     * _.isInteger(Number.MIN_VALUE);
     * // => false
     *
     * _.isInteger(Infinity);
     * // => false
     *
     * _.isInteger('3');
     * // => false
     */
    function isInteger(value) {
      return typeof value == 'number' && value == toInteger(value);
    }

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
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
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
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
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
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
      return value != null && typeof value == 'object';
    }

    /**
     * Checks if `value` is classified as a `Map` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     * @example
     *
     * _.isMap(new Map);
     * // => true
     *
     * _.isMap(new WeakMap);
     * // => false
     */
    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

    /**
     * Performs a partial deep comparison between `object` and `source` to
     * determine if `object` contains equivalent property values.
     *
     * **Note:** This method is equivalent to `_.matches` when `source` is
     * partially applied.
     *
     * Partial comparisons will match empty array and empty object `source`
     * values against any array or object value, respectively. See `_.isEqual`
     * for a list of supported value comparisons.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     *
     * _.isMatch(object, { 'b': 2 });
     * // => true
     *
     * _.isMatch(object, { 'b': 1 });
     * // => false
     */
    function isMatch(object, source) {
      return object === source || baseIsMatch(object, source, getMatchData(source));
    }

    /**
     * This method is like `_.isMatch` except that it accepts `customizer` which
     * is invoked to compare values. If `customizer` returns `undefined`, comparisons
     * are handled by the method instead. The `customizer` is invoked with five
     * arguments: (objValue, srcValue, index|key, object, source).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     * @example
     *
     * function isGreeting(value) {
     *   return /^h(?:i|ello)$/.test(value);
     * }
     *
     * function customizer(objValue, srcValue) {
     *   if (isGreeting(objValue) && isGreeting(srcValue)) {
     *     return true;
     *   }
     * }
     *
     * var object = { 'greeting': 'hello' };
     * var source = { 'greeting': 'hi' };
     *
     * _.isMatchWith(object, source, customizer);
     * // => true
     */
    function isMatchWith(object, source, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined;
      return baseIsMatch(object, source, getMatchData(source), customizer);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * **Note:** This method is based on
     * [`Number.isNaN`](https://mdn.io/Number/isNaN) and is not the same as
     * global [`isNaN`](https://mdn.io/isNaN) which returns `true` for
     * `undefined` and other non-number values.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // An `NaN` primitive is the only value that is not equal to itself.
      // Perform the `toStringTag` check first to avoid errors with some
      // ActiveX objects in IE.
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is a pristine native function.
     *
     * **Note:** This method can't reliably detect native functions in the presence
     * of the core-js package because core-js circumvents this kind of detection.
     * Despite multiple requests, the core-js maintainer has made it clear: any
     * attempt to fix the detection will be obstructed. As a result, we're left
     * with little choice but to throw an error. Unfortunately, this also affects
     * packages, like [babel-polyfill](https://www.npmjs.com/package/babel-polyfill),
     * which rely on core-js.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     * @example
     *
     * _.isNative(Array.prototype.push);
     * // => true
     *
     * _.isNative(_);
     * // => false
     */
    function isNative(value) {
      if (isMaskable(value)) {
        throw new Error('This method is not supported with core-js. Try https://github.com/es-shims.');
      }
      return baseIsNative(value);
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(void 0);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is `null` or `undefined`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
     * @example
     *
     * _.isNil(null);
     * // => true
     *
     * _.isNil(void 0);
     * // => true
     *
     * _.isNil(NaN);
     * // => false
     */
    function isNil(value) {
      return value == null;
    }

    /**
     * Checks if `value` is classified as a `Number` primitive or object.
     *
     * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
     * classified as numbers, use the `_.isFinite` method.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(3);
     * // => true
     *
     * _.isNumber(Number.MIN_VALUE);
     * // => true
     *
     * _.isNumber(Infinity);
     * // => true
     *
     * _.isNumber('3');
     * // => false
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        (isObjectLike(value) && objectToString.call(value) == numberTag);
    }

    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * @static
     * @memberOf _
     * @since 0.8.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    function isPlainObject(value) {
      if (!isObjectLike(value) || objectToString.call(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
      return (typeof Ctor == 'function' &&
        Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
    }

    /**
     * Checks if `value` is classified as a `RegExp` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
     * @example
     *
     * _.isRegExp(/abc/);
     * // => true
     *
     * _.isRegExp('/abc/');
     * // => false
     */
    var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;

    /**
     * Checks if `value` is a safe integer. An integer is safe if it's an IEEE-754
     * double precision number which isn't the result of a rounded unsafe integer.
     *
     * **Note:** This method is based on
     * [`Number.isSafeInteger`](https://mdn.io/Number/isSafeInteger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a safe integer, else `false`.
     * @example
     *
     * _.isSafeInteger(3);
     * // => true
     *
     * _.isSafeInteger(Number.MIN_VALUE);
     * // => false
     *
     * _.isSafeInteger(Infinity);
     * // => false
     *
     * _.isSafeInteger('3');
     * // => false
     */
    function isSafeInteger(value) {
      return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is classified as a `Set` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     * @example
     *
     * _.isSet(new Set);
     * // => true
     *
     * _.isSet(new WeakSet);
     * // => false
     */
    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a string, else `false`.
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
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && objectToString.call(value) == symbolTag);
    }

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     *
     * _.isUndefined(null);
     * // => false
     */
    function isUndefined(value) {
      return value === undefined;
    }

    /**
     * Checks if `value` is classified as a `WeakMap` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a weak map, else `false`.
     * @example
     *
     * _.isWeakMap(new WeakMap);
     * // => true
     *
     * _.isWeakMap(new Map);
     * // => false
     */
    function isWeakMap(value) {
      return isObjectLike(value) && getTag(value) == weakMapTag;
    }

    /**
     * Checks if `value` is classified as a `WeakSet` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a weak set, else `false`.
     * @example
     *
     * _.isWeakSet(new WeakSet);
     * // => true
     *
     * _.isWeakSet(new Set);
     * // => false
     */
    function isWeakSet(value) {
      return isObjectLike(value) && objectToString.call(value) == weakSetTag;
    }

    /**
     * Checks if `value` is less than `other`.
     *
     * @static
     * @memberOf _
     * @since 3.9.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is less than `other`,
     *  else `false`.
     * @see _.gt
     * @example
     *
     * _.lt(1, 3);
     * // => true
     *
     * _.lt(3, 3);
     * // => false
     *
     * _.lt(3, 1);
     * // => false
     */
    var lt = createRelationalOperation(baseLt);

    /**
     * Checks if `value` is less than or equal to `other`.
     *
     * @static
     * @memberOf _
     * @since 3.9.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is less than or equal to
     *  `other`, else `false`.
     * @see _.gte
     * @example
     *
     * _.lte(1, 3);
     * // => true
     *
     * _.lte(3, 3);
     * // => true
     *
     * _.lte(3, 1);
     * // => false
     */
    var lte = createRelationalOperation(function(value, other) {
      return value <= other;
    });

    /**
     * Converts `value` to an array.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {Array} Returns the converted array.
     * @example
     *
     * _.toArray({ 'a': 1, 'b': 2 });
     * // => [1, 2]
     *
     * _.toArray('abc');
     * // => ['a', 'b', 'c']
     *
     * _.toArray(1);
     * // => []
     *
     * _.toArray(null);
     * // => []
     */
    function toArray(value) {
      if (!value) {
        return [];
      }
      if (isArrayLike(value)) {
        return isString(value) ? stringToArray(value) : copyArray(value);
      }
      if (iteratorSymbol && value[iteratorSymbol]) {
        return iteratorToArray(value[iteratorSymbol]());
      }
      var tag = getTag(value),
          func = tag == mapTag ? mapToArray : (tag == setTag ? setToArray : values);

      return func(value);
    }

    /**
     * Converts `value` to a finite number.
     *
     * @static
     * @memberOf _
     * @since 4.12.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted number.
     * @example
     *
     * _.toFinite(3.2);
     * // => 3.2
     *
     * _.toFinite(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toFinite(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toFinite('3.2');
     * // => 3.2
     */
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = (value < 0 ? -1 : 1);
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }

    /**
     * Converts `value` to an integer.
     *
     * **Note:** This method is loosely based on
     * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toInteger(3.2);
     * // => 3
     *
     * _.toInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toInteger(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toInteger('3.2');
     * // => 3
     */
    function toInteger(value) {
      var result = toFinite(value),
          remainder = result % 1;

      return result === result ? (remainder ? result - remainder : result) : 0;
    }

    /**
     * Converts `value` to an integer suitable for use as the length of an
     * array-like object.
     *
     * **Note:** This method is based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toLength(3.2);
     * // => 3
     *
     * _.toLength(Number.MIN_VALUE);
     * // => 0
     *
     * _.toLength(Infinity);
     * // => 4294967295
     *
     * _.toLength('3.2');
     * // => 3
     */
    function toLength(value) {
      return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
    }

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
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

    /**
     * Converts `value` to a plain object flattening inherited enumerable string
     * keyed properties of `value` to own properties of the plain object.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {Object} Returns the converted plain object.
     * @example
     *
     * function Foo() {
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.assign({ 'a': 1 }, new Foo);
     * // => { 'a': 1, 'b': 2 }
     *
     * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
     * // => { 'a': 1, 'b': 2, 'c': 3 }
     */
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }

    /**
     * Converts `value` to a safe integer. A safe integer can be compared and
     * represented correctly.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toSafeInteger(3.2);
     * // => 3
     *
     * _.toSafeInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toSafeInteger(Infinity);
     * // => 9007199254740991
     *
     * _.toSafeInteger('3.2');
     * // => 3
     */
    function toSafeInteger(value) {
      return baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
    }

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString(value) {
      return value == null ? '' : baseToString(value);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable string keyed properties of source objects to the
     * destination object. Source objects are applied from left to right.
     * Subsequent sources overwrite property assignments of previous sources.
     *
     * **Note:** This method mutates `object` and is loosely based on
     * [`Object.assign`](https://mdn.io/Object/assign).
     *
     * @static
     * @memberOf _
     * @since 0.10.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @see _.assignIn
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * function Bar() {
     *   this.c = 3;
     * }
     *
     * Foo.prototype.b = 2;
     * Bar.prototype.d = 4;
     *
     * _.assign({ 'a': 0 }, new Foo, new Bar);
     * // => { 'a': 1, 'c': 3 }
     */
    var assign = createAssigner(function(object, source) {
      if (isPrototype(source) || isArrayLike(source)) {
        copyObject(source, keys(source), object);
        return;
      }
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          assignValue(object, key, source[key]);
        }
      }
    });

    /**
     * This method is like `_.assign` except that it iterates over own and
     * inherited source properties.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @alias extend
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @see _.assign
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * function Bar() {
     *   this.c = 3;
     * }
     *
     * Foo.prototype.b = 2;
     * Bar.prototype.d = 4;
     *
     * _.assignIn({ 'a': 0 }, new Foo, new Bar);
     * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }
     */
    var assignIn = createAssigner(function(object, source) {
      copyObject(source, keysIn(source), object);
    });

    /**
     * This method is like `_.assignIn` except that it accepts `customizer`
     * which is invoked to produce the assigned values. If `customizer` returns
     * `undefined`, assignment is handled by the method instead. The `customizer`
     * is invoked with five arguments: (objValue, srcValue, key, object, source).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @alias extendWith
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @param {Function} [customizer] The function to customize assigned values.
     * @returns {Object} Returns `object`.
     * @see _.assignWith
     * @example
     *
     * function customizer(objValue, srcValue) {
     *   return _.isUndefined(objValue) ? srcValue : objValue;
     * }
     *
     * var defaults = _.partialRight(_.assignInWith, customizer);
     *
     * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
     * // => { 'a': 1, 'b': 2 }
     */
    var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
      copyObject(source, keysIn(source), object, customizer);
    });

    /**
     * This method is like `_.assign` except that it accepts `customizer`
     * which is invoked to produce the assigned values. If `customizer` returns
     * `undefined`, assignment is handled by the method instead. The `customizer`
     * is invoked with five arguments: (objValue, srcValue, key, object, source).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @param {Function} [customizer] The function to customize assigned values.
     * @returns {Object} Returns `object`.
     * @see _.assignInWith
     * @example
     *
     * function customizer(objValue, srcValue) {
     *   return _.isUndefined(objValue) ? srcValue : objValue;
     * }
     *
     * var defaults = _.partialRight(_.assignWith, customizer);
     *
     * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
     * // => { 'a': 1, 'b': 2 }
     */
    var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
      copyObject(source, keys(source), object, customizer);
    });

    /**
     * Creates an array of values corresponding to `paths` of `object`.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {...(string|string[])} [paths] The property paths of elements to pick.
     * @returns {Array} Returns the picked values.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }, 4] };
     *
     * _.at(object, ['a[0].b.c', 'a[1]']);
     * // => [3, 4]
     */
    var at = flatRest(baseAt);

    /**
     * Creates an object that inherits from the `prototype` object. If a
     * `properties` object is given, its own enumerable string keyed properties
     * are assigned to the created object.
     *
     * @static
     * @memberOf _
     * @since 2.3.0
     * @category Object
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, {
     *   'constructor': Circle
     * });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? baseAssign(result, properties) : result;
    }

    /**
     * Assigns own and inherited enumerable string keyed properties of source
     * objects to the destination object for all destination properties that
     * resolve to `undefined`. Source objects are applied from left to right.
     * Once a property is set, additional values of the same property are ignored.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @see _.defaultsDeep
     * @example
     *
     * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
     * // => { 'a': 1, 'b': 2 }
     */
    var defaults = baseRest(function(args) {
      args.push(undefined, assignInDefaults);
      return apply(assignInWith, undefined, args);
    });

    /**
     * This method is like `_.defaults` except that it recursively assigns
     * default properties.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 3.10.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @see _.defaults
     * @example
     *
     * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
     * // => { 'a': { 'b': 2, 'c': 3 } }
     */
    var defaultsDeep = baseRest(function(args) {
      args.push(undefined, mergeDefaults);
      return apply(mergeWith, undefined, args);
    });

    /**
     * This method is like `_.find` except that it returns the key of the first
     * element `predicate` returns truthy for instead of the element itself.
     *
     * @static
     * @memberOf _
     * @since 1.1.0
     * @category Object
     * @param {Object} object The object to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {string|undefined} Returns the key of the matched element,
     *  else `undefined`.
     * @example
     *
     * var users = {
     *   'barney':  { 'age': 36, 'active': true },
     *   'fred':    { 'age': 40, 'active': false },
     *   'pebbles': { 'age': 1,  'active': true }
     * };
     *
     * _.findKey(users, function(o) { return o.age < 40; });
     * // => 'barney' (iteration order is not guaranteed)
     *
     * // The `_.matches` iteratee shorthand.
     * _.findKey(users, { 'age': 1, 'active': true });
     * // => 'pebbles'
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.findKey(users, ['active', false]);
     * // => 'fred'
     *
     * // The `_.property` iteratee shorthand.
     * _.findKey(users, 'active');
     * // => 'barney'
     */
    function findKey(object, predicate) {
      return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements of
     * a collection in the opposite order.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Object
     * @param {Object} object The object to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {string|undefined} Returns the key of the matched element,
     *  else `undefined`.
     * @example
     *
     * var users = {
     *   'barney':  { 'age': 36, 'active': true },
     *   'fred':    { 'age': 40, 'active': false },
     *   'pebbles': { 'age': 1,  'active': true }
     * };
     *
     * _.findLastKey(users, function(o) { return o.age < 40; });
     * // => returns 'pebbles' assuming `_.findKey` returns 'barney'
     *
     * // The `_.matches` iteratee shorthand.
     * _.findLastKey(users, { 'age': 36, 'active': true });
     * // => 'barney'
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.findLastKey(users, ['active', false]);
     * // => 'fred'
     *
     * // The `_.property` iteratee shorthand.
     * _.findLastKey(users, 'active');
     * // => 'pebbles'
     */
    function findLastKey(object, predicate) {
      return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
    }

    /**
     * Iterates over own and inherited enumerable string keyed properties of an
     * object and invokes `iteratee` for each property. The iteratee is invoked
     * with three arguments: (value, key, object). Iteratee functions may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @since 0.3.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns `object`.
     * @see _.forInRight
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forIn(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a', 'b', then 'c' (iteration order is not guaranteed).
     */
    function forIn(object, iteratee) {
      return object == null
        ? object
        : baseFor(object, getIteratee(iteratee, 3), keysIn);
    }

    /**
     * This method is like `_.forIn` except that it iterates over properties of
     * `object` in the opposite order.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns `object`.
     * @see _.forIn
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forInRight(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'c', 'b', then 'a' assuming `_.forIn` logs 'a', 'b', then 'c'.
     */
    function forInRight(object, iteratee) {
      return object == null
        ? object
        : baseForRight(object, getIteratee(iteratee, 3), keysIn);
    }

    /**
     * Iterates over own enumerable string keyed properties of an object and
     * invokes `iteratee` for each property. The iteratee is invoked with three
     * arguments: (value, key, object). Iteratee functions may exit iteration
     * early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @since 0.3.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns `object`.
     * @see _.forOwnRight
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forOwn(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
     */
    function forOwn(object, iteratee) {
      return object && baseForOwn(object, getIteratee(iteratee, 3));
    }

    /**
     * This method is like `_.forOwn` except that it iterates over properties of
     * `object` in the opposite order.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns `object`.
     * @see _.forOwn
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forOwnRight(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'b' then 'a' assuming `_.forOwn` logs 'a' then 'b'.
     */
    function forOwnRight(object, iteratee) {
      return object && baseForOwnRight(object, getIteratee(iteratee, 3));
    }

    /**
     * Creates an array of function property names from own enumerable properties
     * of `object`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns the function names.
     * @see _.functionsIn
     * @example
     *
     * function Foo() {
     *   this.a = _.constant('a');
     *   this.b = _.constant('b');
     * }
     *
     * Foo.prototype.c = _.constant('c');
     *
     * _.functions(new Foo);
     * // => ['a', 'b']
     */
    function functions(object) {
      return object == null ? [] : baseFunctions(object, keys(object));
    }

    /**
     * Creates an array of function property names from own and inherited
     * enumerable properties of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns the function names.
     * @see _.functions
     * @example
     *
     * function Foo() {
     *   this.a = _.constant('a');
     *   this.b = _.constant('b');
     * }
     *
     * Foo.prototype.c = _.constant('c');
     *
     * _.functionsIn(new Foo);
     * // => ['a', 'b', 'c']
     */
    function functionsIn(object) {
      return object == null ? [] : baseFunctions(object, keysIn(object));
    }

    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is returned in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    /**
     * Checks if `path` is a direct property of `object`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = { 'a': { 'b': 2 } };
     * var other = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.has(object, 'a');
     * // => true
     *
     * _.has(object, 'a.b');
     * // => true
     *
     * _.has(object, ['a', 'b']);
     * // => true
     *
     * _.has(other, 'a');
     * // => false
     */
    function has(object, path) {
      return object != null && hasPath(object, path, baseHas);
    }

    /**
     * Checks if `path` is a direct or inherited property of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.hasIn(object, 'a');
     * // => true
     *
     * _.hasIn(object, 'a.b');
     * // => true
     *
     * _.hasIn(object, ['a', 'b']);
     * // => true
     *
     * _.hasIn(object, 'b');
     * // => false
     */
    function hasIn(object, path) {
      return object != null && hasPath(object, path, baseHasIn);
    }

    /**
     * Creates an object composed of the inverted keys and values of `object`.
     * If `object` contains duplicate values, subsequent values overwrite
     * property assignments of previous values.
     *
     * @static
     * @memberOf _
     * @since 0.7.0
     * @category Object
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the new inverted object.
     * @example
     *
     * var object = { 'a': 1, 'b': 2, 'c': 1 };
     *
     * _.invert(object);
     * // => { '1': 'c', '2': 'b' }
     */
    var invert = createInverter(function(result, value, key) {
      result[value] = key;
    }, constant(identity));

    /**
     * This method is like `_.invert` except that the inverted object is generated
     * from the results of running each element of `object` thru `iteratee`. The
     * corresponding inverted value of each inverted key is an array of keys
     * responsible for generating the inverted value. The iteratee is invoked
     * with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.1.0
     * @category Object
     * @param {Object} object The object to invert.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {Object} Returns the new inverted object.
     * @example
     *
     * var object = { 'a': 1, 'b': 2, 'c': 1 };
     *
     * _.invertBy(object);
     * // => { '1': ['a', 'c'], '2': ['b'] }
     *
     * _.invertBy(object, function(value) {
     *   return 'group' + value;
     * });
     * // => { 'group1': ['a', 'c'], 'group2': ['b'] }
     */
    var invertBy = createInverter(function(result, value, key) {
      if (hasOwnProperty.call(result, value)) {
        result[value].push(key);
      } else {
        result[value] = [key];
      }
    }, getIteratee);

    /**
     * Invokes the method at `path` of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the method to invoke.
     * @param {...*} [args] The arguments to invoke the method with.
     * @returns {*} Returns the result of the invoked method.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': [1, 2, 3, 4] } }] };
     *
     * _.invoke(object, 'a[0].b.c.slice', 1, 3);
     * // => [2, 3]
     */
    var invoke = baseRest(baseInvoke);

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
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
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
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
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }

    /**
     * The opposite of `_.mapValues`; this method creates an object with the
     * same values as `object` and keys generated by running each own enumerable
     * string keyed property of `object` thru `iteratee`. The iteratee is invoked
     * with three arguments: (value, key, object).
     *
     * @static
     * @memberOf _
     * @since 3.8.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns the new mapped object.
     * @see _.mapValues
     * @example
     *
     * _.mapKeys({ 'a': 1, 'b': 2 }, function(value, key) {
     *   return key + value;
     * });
     * // => { 'a1': 1, 'b2': 2 }
     */
    function mapKeys(object, iteratee) {
      var result = {};
      iteratee = getIteratee(iteratee, 3);

      baseForOwn(object, function(value, key, object) {
        baseAssignValue(result, iteratee(value, key, object), value);
      });
      return result;
    }

    /**
     * Creates an object with the same keys as `object` and values generated
     * by running each own enumerable string keyed property of `object` thru
     * `iteratee`. The iteratee is invoked with three arguments:
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns the new mapped object.
     * @see _.mapKeys
     * @example
     *
     * var users = {
     *   'fred':    { 'user': 'fred',    'age': 40 },
     *   'pebbles': { 'user': 'pebbles', 'age': 1 }
     * };
     *
     * _.mapValues(users, function(o) { return o.age; });
     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
     *
     * // The `_.property` iteratee shorthand.
     * _.mapValues(users, 'age');
     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
     */
    function mapValues(object, iteratee) {
      var result = {};
      iteratee = getIteratee(iteratee, 3);

      baseForOwn(object, function(value, key, object) {
        baseAssignValue(result, key, iteratee(value, key, object));
      });
      return result;
    }

    /**
     * This method is like `_.assign` except that it recursively merges own and
     * inherited enumerable string keyed properties of source objects into the
     * destination object. Source properties that resolve to `undefined` are
     * skipped if a destination value exists. Array and plain object properties
     * are merged recursively. Other objects and value types are overridden by
     * assignment. Source objects are applied from left to right. Subsequent
     * sources overwrite property assignments of previous sources.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 0.5.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = {
     *   'a': [{ 'b': 2 }, { 'd': 4 }]
     * };
     *
     * var other = {
     *   'a': [{ 'c': 3 }, { 'e': 5 }]
     * };
     *
     * _.merge(object, other);
     * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
     */
    var merge = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });

    /**
     * This method is like `_.merge` except that it accepts `customizer` which
     * is invoked to produce the merged values of the destination and source
     * properties. If `customizer` returns `undefined`, merging is handled by the
     * method instead. The `customizer` is invoked with six arguments:
     * (objValue, srcValue, key, object, source, stack).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @param {Function} customizer The function to customize assigned values.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function customizer(objValue, srcValue) {
     *   if (_.isArray(objValue)) {
     *     return objValue.concat(srcValue);
     *   }
     * }
     *
     * var object = { 'a': [1], 'b': [2] };
     * var other = { 'a': [3], 'b': [4] };
     *
     * _.mergeWith(object, other, customizer);
     * // => { 'a': [1, 3], 'b': [2, 4] }
     */
    var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
      baseMerge(object, source, srcIndex, customizer);
    });

    /**
     * The opposite of `_.pick`; this method creates an object composed of the
     * own and inherited enumerable string keyed properties of `object` that are
     * not omitted.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The source object.
     * @param {...(string|string[])} [props] The property identifiers to omit.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'a': 1, 'b': '2', 'c': 3 };
     *
     * _.omit(object, ['a', 'c']);
     * // => { 'b': '2' }
     */
    var omit = flatRest(function(object, props) {
      if (object == null) {
        return {};
      }
      props = arrayMap(props, toKey);
      return basePick(object, baseDifference(getAllKeysIn(object), props));
    });

    /**
     * The opposite of `_.pickBy`; this method creates an object composed of
     * the own and inherited enumerable string keyed properties of `object` that
     * `predicate` doesn't return truthy for. The predicate is invoked with two
     * arguments: (value, key).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The source object.
     * @param {Function} [predicate=_.identity] The function invoked per property.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'a': 1, 'b': '2', 'c': 3 };
     *
     * _.omitBy(object, _.isNumber);
     * // => { 'b': '2' }
     */
    function omitBy(object, predicate) {
      return pickBy(object, negate(getIteratee(predicate)));
    }

    /**
     * Creates an object composed of the picked `object` properties.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The source object.
     * @param {...(string|string[])} [props] The property identifiers to pick.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'a': 1, 'b': '2', 'c': 3 };
     *
     * _.pick(object, ['a', 'c']);
     * // => { 'a': 1, 'c': 3 }
     */
    var pick = flatRest(function(object, props) {
      return object == null ? {} : basePick(object, arrayMap(props, toKey));
    });

    /**
     * Creates an object composed of the `object` properties `predicate` returns
     * truthy for. The predicate is invoked with two arguments: (value, key).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The source object.
     * @param {Function} [predicate=_.identity] The function invoked per property.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'a': 1, 'b': '2', 'c': 3 };
     *
     * _.pickBy(object, _.isNumber);
     * // => { 'a': 1, 'c': 3 }
     */
    function pickBy(object, predicate) {
      return object == null ? {} : basePickBy(object, getAllKeysIn(object), getIteratee(predicate));
    }

    /**
     * This method is like `_.get` except that if the resolved value is a
     * function it's invoked with the `this` binding of its parent object and
     * its result is returned.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to resolve.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
     *
     * _.result(object, 'a[0].b.c1');
     * // => 3
     *
     * _.result(object, 'a[0].b.c2');
     * // => 4
     *
     * _.result(object, 'a[0].b.c3', 'default');
     * // => 'default'
     *
     * _.result(object, 'a[0].b.c3', _.constant('default'));
     * // => 'default'
     */
    function result(object, path, defaultValue) {
      path = isKey(path, object) ? [path] : castPath(path);

      var index = -1,
          length = path.length;

      // Ensure the loop is entered when path is empty.
      if (!length) {
        object = undefined;
        length = 1;
      }
      while (++index < length) {
        var value = object == null ? undefined : object[toKey(path[index])];
        if (value === undefined) {
          index = length;
          value = defaultValue;
        }
        object = isFunction(value) ? value.call(object) : value;
      }
      return object;
    }

    /**
     * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
     * it's created. Arrays are created for missing index properties while objects
     * are created for all other missing properties. Use `_.setWith` to customize
     * `path` creation.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.set(object, 'a[0].b.c', 4);
     * console.log(object.a[0].b.c);
     * // => 4
     *
     * _.set(object, ['x', '0', 'y', 'z'], 5);
     * console.log(object.x[0].y.z);
     * // => 5
     */
    function set(object, path, value) {
      return object == null ? object : baseSet(object, path, value);
    }

    /**
     * This method is like `_.set` except that it accepts `customizer` which is
     * invoked to produce the objects of `path`.  If `customizer` returns `undefined`
     * path creation is handled by the method instead. The `customizer` is invoked
     * with three arguments: (nsValue, key, nsObject).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @param {Function} [customizer] The function to customize assigned values.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = {};
     *
     * _.setWith(object, '[0][1]', 'a', Object);
     * // => { '0': { '1': 'a' } }
     */
    function setWith(object, path, value, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined;
      return object == null ? object : baseSet(object, path, value, customizer);
    }

    /**
     * Creates an array of own enumerable string keyed-value pairs for `object`
     * which can be consumed by `_.fromPairs`. If `object` is a map or set, its
     * entries are returned.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @alias entries
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the key-value pairs.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.toPairs(new Foo);
     * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
     */
    var toPairs = createToPairs(keys);

    /**
     * Creates an array of own and inherited enumerable string keyed-value pairs
     * for `object` which can be consumed by `_.fromPairs`. If `object` is a map
     * or set, its entries are returned.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @alias entriesIn
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the key-value pairs.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.toPairsIn(new Foo);
     * // => [['a', 1], ['b', 2], ['c', 3]] (iteration order is not guaranteed)
     */
    var toPairsIn = createToPairs(keysIn);

    /**
     * An alternative to `_.reduce`; this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable string keyed properties thru `iteratee`, with each invocation
     * potentially mutating the `accumulator` object. If `accumulator` is not
     * provided, a new object with the same `[[Prototype]]` will be used. The
     * iteratee is invoked with four arguments: (accumulator, value, key, object).
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @since 1.3.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * _.transform([2, 3, 4], function(result, n) {
     *   result.push(n *= n);
     *   return n % 2 == 0;
     * }, []);
     * // => [4, 9]
     *
     * _.transform({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
     *   (result[value] || (result[value] = [])).push(key);
     * }, {});
     * // => { '1': ['a', 'c'], '2': ['b'] }
     */
    function transform(object, iteratee, accumulator) {
      var isArr = isArray(object) || isTypedArray(object);
      iteratee = getIteratee(iteratee, 4);

      if (accumulator == null) {
        if (isArr || isObject(object)) {
          var Ctor = object.constructor;
          if (isArr) {
            accumulator = isArray(object) ? new Ctor : [];
          } else {
            accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
          }
        } else {
          accumulator = {};
        }
      }
      (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {
        return iteratee(accumulator, value, index, object);
      });
      return accumulator;
    }

    /**
     * Removes the property at `path` of `object`.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to unset.
     * @returns {boolean} Returns `true` if the property is deleted, else `false`.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 7 } }] };
     * _.unset(object, 'a[0].b.c');
     * // => true
     *
     * console.log(object);
     * // => { 'a': [{ 'b': {} }] };
     *
     * _.unset(object, ['a', '0', 'b', 'c']);
     * // => true
     *
     * console.log(object);
     * // => { 'a': [{ 'b': {} }] };
     */
    function unset(object, path) {
      return object == null ? true : baseUnset(object, path);
    }

    /**
     * This method is like `_.set` except that accepts `updater` to produce the
     * value to set. Use `_.updateWith` to customize `path` creation. The `updater`
     * is invoked with one argument: (value).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.6.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {Function} updater The function to produce the updated value.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.update(object, 'a[0].b.c', function(n) { return n * n; });
     * console.log(object.a[0].b.c);
     * // => 9
     *
     * _.update(object, 'x[0].y.z', function(n) { return n ? n + 1 : 0; });
     * console.log(object.x[0].y.z);
     * // => 0
     */
    function update(object, path, updater) {
      return object == null ? object : baseUpdate(object, path, castFunction(updater));
    }

    /**
     * This method is like `_.update` except that it accepts `customizer` which is
     * invoked to produce the objects of `path`.  If `customizer` returns `undefined`
     * path creation is handled by the method instead. The `customizer` is invoked
     * with three arguments: (nsValue, key, nsObject).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.6.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {Function} updater The function to produce the updated value.
     * @param {Function} [customizer] The function to customize assigned values.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = {};
     *
     * _.updateWith(object, '[0][1]', _.constant('a'), Object);
     * // => { '0': { '1': 'a' } }
     */
    function updateWith(object, path, updater, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined;
      return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
    }

    /**
     * Creates an array of the own enumerable string keyed property values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.values(new Foo);
     * // => [1, 2] (iteration order is not guaranteed)
     *
     * _.values('hi');
     * // => ['h', 'i']
     */
    function values(object) {
      return object ? baseValues(object, keys(object)) : [];
    }

    /**
     * Creates an array of the own and inherited enumerable string keyed property
     * values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.valuesIn(new Foo);
     * // => [1, 2, 3] (iteration order is not guaranteed)
     */
    function valuesIn(object) {
      return object == null ? [] : baseValues(object, keysIn(object));
    }

    /*------------------------------------------------------------------------*/

    /**
     * Clamps `number` within the inclusive `lower` and `upper` bounds.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Number
     * @param {number} number The number to clamp.
     * @param {number} [lower] The lower bound.
     * @param {number} upper The upper bound.
     * @returns {number} Returns the clamped number.
     * @example
     *
     * _.clamp(-10, -5, 5);
     * // => -5
     *
     * _.clamp(10, -5, 5);
     * // => 5
     */
    function clamp(number, lower, upper) {
      if (upper === undefined) {
        upper = lower;
        lower = undefined;
      }
      if (upper !== undefined) {
        upper = toNumber(upper);
        upper = upper === upper ? upper : 0;
      }
      if (lower !== undefined) {
        lower = toNumber(lower);
        lower = lower === lower ? lower : 0;
      }
      return baseClamp(toNumber(number), lower, upper);
    }

    /**
     * Checks if `n` is between `start` and up to, but not including, `end`. If
     * `end` is not specified, it's set to `start` with `start` then set to `0`.
     * If `start` is greater than `end` the params are swapped to support
     * negative ranges.
     *
     * @static
     * @memberOf _
     * @since 3.3.0
     * @category Number
     * @param {number} number The number to check.
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
     * @see _.range, _.rangeRight
     * @example
     *
     * _.inRange(3, 2, 4);
     * // => true
     *
     * _.inRange(4, 8);
     * // => true
     *
     * _.inRange(4, 2);
     * // => false
     *
     * _.inRange(2, 2);
     * // => false
     *
     * _.inRange(1.2, 2);
     * // => true
     *
     * _.inRange(5.2, 4);
     * // => false
     *
     * _.inRange(-3, -2, -6);
     * // => true
     */
    function inRange(number, start, end) {
      start = toFinite(start);
      if (end === undefined) {
        end = start;
        start = 0;
      } else {
        end = toFinite(end);
      }
      number = toNumber(number);
      return baseInRange(number, start, end);
    }

    /**
     * Produces a random number between the inclusive `lower` and `upper` bounds.
     * If only one argument is provided a number between `0` and the given number
     * is returned. If `floating` is `true`, or either `lower` or `upper` are
     * floats, a floating-point number is returned instead of an integer.
     *
     * **Note:** JavaScript follows the IEEE-754 standard for resolving
     * floating-point values which can produce unexpected results.
     *
     * @static
     * @memberOf _
     * @since 0.7.0
     * @category Number
     * @param {number} [lower=0] The lower bound.
     * @param {number} [upper=1] The upper bound.
     * @param {boolean} [floating] Specify returning a floating-point number.
     * @returns {number} Returns the random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(lower, upper, floating) {
      if (floating && typeof floating != 'boolean' && isIterateeCall(lower, upper, floating)) {
        upper = floating = undefined;
      }
      if (floating === undefined) {
        if (typeof upper == 'boolean') {
          floating = upper;
          upper = undefined;
        }
        else if (typeof lower == 'boolean') {
          floating = lower;
          lower = undefined;
        }
      }
      if (lower === undefined && upper === undefined) {
        lower = 0;
        upper = 1;
      }
      else {
        lower = toFinite(lower);
        if (upper === undefined) {
          upper = lower;
          lower = 0;
        } else {
          upper = toFinite(upper);
        }
      }
      if (lower > upper) {
        var temp = lower;
        lower = upper;
        upper = temp;
      }
      if (floating || lower % 1 || upper % 1) {
        var rand = nativeRandom();
        return nativeMin(lower + (rand * (upper - lower + freeParseFloat('1e-' + ((rand + '').length - 1)))), upper);
      }
      return baseRandom(lower, upper);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the camel cased string.
     * @example
     *
     * _.camelCase('Foo Bar');
     * // => 'fooBar'
     *
     * _.camelCase('--foo-bar--');
     * // => 'fooBar'
     *
     * _.camelCase('__FOO_BAR__');
     * // => 'fooBar'
     */
    var camelCase = createCompounder(function(result, word, index) {
      word = word.toLowerCase();
      return result + (index ? capitalize(word) : word);
    });

    /**
     * Converts the first character of `string` to upper case and the remaining
     * to lower case.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to capitalize.
     * @returns {string} Returns the capitalized string.
     * @example
     *
     * _.capitalize('FRED');
     * // => 'Fred'
     */
    function capitalize(string) {
      return upperFirst(toString(string).toLowerCase());
    }

    /**
     * Deburrs `string` by converting
     * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
     * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
     * letters to basic Latin letters and removing
     * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to deburr.
     * @returns {string} Returns the deburred string.
     * @example
     *
     * _.deburr('déjà vu');
     * // => 'deja vu'
     */
    function deburr(string) {
      string = toString(string);
      return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
    }

    /**
     * Checks if `string` ends with the given target string.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to inspect.
     * @param {string} [target] The string to search for.
     * @param {number} [position=string.length] The position to search up to.
     * @returns {boolean} Returns `true` if `string` ends with `target`,
     *  else `false`.
     * @example
     *
     * _.endsWith('abc', 'c');
     * // => true
     *
     * _.endsWith('abc', 'b');
     * // => false
     *
     * _.endsWith('abc', 'b', 2);
     * // => true
     */
    function endsWith(string, target, position) {
      string = toString(string);
      target = baseToString(target);

      var length = string.length;
      position = position === undefined
        ? length
        : baseClamp(toInteger(position), 0, length);

      var end = position;
      position -= target.length;
      return position >= 0 && string.slice(position, end) == target;
    }

    /**
     * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
     * corresponding HTML entities.
     *
     * **Note:** No other characters are escaped. To escape additional
     * characters use a third-party library like [_he_](https://mths.be/he).
     *
     * Though the ">" character is escaped for symmetry, characters like
     * ">" and "/" don't need escaping in HTML and have no special meaning
     * unless they're part of a tag or unquoted attribute value. See
     * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
     * (under "semi-related fun fact") for more details.
     *
     * When working with HTML you should always
     * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
     * XSS vectors.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('fred, barney, & pebbles');
     * // => 'fred, barney, &amp; pebbles'
     */
    function escape(string) {
      string = toString(string);
      return (string && reHasUnescapedHtml.test(string))
        ? string.replace(reUnescapedHtml, escapeHtmlChar)
        : string;
    }

    /**
     * Escapes the `RegExp` special characters "^", "$", "\", ".", "*", "+",
     * "?", "(", ")", "[", "]", "{", "}", and "|" in `string`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escapeRegExp('[lodash](https://lodash.com/)');
     * // => '\[lodash\]\(https://lodash\.com/\)'
     */
    function escapeRegExp(string) {
      string = toString(string);
      return (string && reHasRegExpChar.test(string))
        ? string.replace(reRegExpChar, '\\$&')
        : string;
    }

    /**
     * Converts `string` to
     * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the kebab cased string.
     * @example
     *
     * _.kebabCase('Foo Bar');
     * // => 'foo-bar'
     *
     * _.kebabCase('fooBar');
     * // => 'foo-bar'
     *
     * _.kebabCase('__FOO_BAR__');
     * // => 'foo-bar'
     */
    var kebabCase = createCompounder(function(result, word, index) {
      return result + (index ? '-' : '') + word.toLowerCase();
    });

    /**
     * Converts `string`, as space separated words, to lower case.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the lower cased string.
     * @example
     *
     * _.lowerCase('--Foo-Bar--');
     * // => 'foo bar'
     *
     * _.lowerCase('fooBar');
     * // => 'foo bar'
     *
     * _.lowerCase('__FOO_BAR__');
     * // => 'foo bar'
     */
    var lowerCase = createCompounder(function(result, word, index) {
      return result + (index ? ' ' : '') + word.toLowerCase();
    });

    /**
     * Converts the first character of `string` to lower case.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.lowerFirst('Fred');
     * // => 'fred'
     *
     * _.lowerFirst('FRED');
     * // => 'fRED'
     */
    var lowerFirst = createCaseFirst('toLowerCase');

    /**
     * Pads `string` on the left and right sides if it's shorter than `length`.
     * Padding characters are truncated if they can't be evenly divided by `length`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.pad('abc', 8);
     * // => '  abc   '
     *
     * _.pad('abc', 8, '_-');
     * // => '_-abc_-_'
     *
     * _.pad('abc', 3);
     * // => 'abc'
     */
    function pad(string, length, chars) {
      string = toString(string);
      length = toInteger(length);

      var strLength = length ? stringSize(string) : 0;
      if (!length || strLength >= length) {
        return string;
      }
      var mid = (length - strLength) / 2;
      return (
        createPadding(nativeFloor(mid), chars) +
        string +
        createPadding(nativeCeil(mid), chars)
      );
    }

    /**
     * Pads `string` on the right side if it's shorter than `length`. Padding
     * characters are truncated if they exceed `length`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.padEnd('abc', 6);
     * // => 'abc   '
     *
     * _.padEnd('abc', 6, '_-');
     * // => 'abc_-_'
     *
     * _.padEnd('abc', 3);
     * // => 'abc'
     */
    function padEnd(string, length, chars) {
      string = toString(string);
      length = toInteger(length);

      var strLength = length ? stringSize(string) : 0;
      return (length && strLength < length)
        ? (string + createPadding(length - strLength, chars))
        : string;
    }

    /**
     * Pads `string` on the left side if it's shorter than `length`. Padding
     * characters are truncated if they exceed `length`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.padStart('abc', 6);
     * // => '   abc'
     *
     * _.padStart('abc', 6, '_-');
     * // => '_-_abc'
     *
     * _.padStart('abc', 3);
     * // => 'abc'
     */
    function padStart(string, length, chars) {
      string = toString(string);
      length = toInteger(length);

      var strLength = length ? stringSize(string) : 0;
      return (length && strLength < length)
        ? (createPadding(length - strLength, chars) + string)
        : string;
    }

    /**
     * Converts `string` to an integer of the specified radix. If `radix` is
     * `undefined` or `0`, a `radix` of `10` is used unless `value` is a
     * hexadecimal, in which case a `radix` of `16` is used.
     *
     * **Note:** This method aligns with the
     * [ES5 implementation](https://es5.github.io/#x15.1.2.2) of `parseInt`.
     *
     * @static
     * @memberOf _
     * @since 1.1.0
     * @category String
     * @param {string} string The string to convert.
     * @param {number} [radix=10] The radix to interpret `value` by.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     *
     * _.map(['6', '08', '10'], _.parseInt);
     * // => [6, 8, 10]
     */
    function parseInt(string, radix, guard) {
      if (guard || radix == null) {
        radix = 0;
      } else if (radix) {
        radix = +radix;
      }
      return nativeParseInt(toString(string), radix || 0);
    }

    /**
     * Repeats the given string `n` times.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to repeat.
     * @param {number} [n=1] The number of times to repeat the string.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {string} Returns the repeated string.
     * @example
     *
     * _.repeat('*', 3);
     * // => '***'
     *
     * _.repeat('abc', 2);
     * // => 'abcabc'
     *
     * _.repeat('abc', 0);
     * // => ''
     */
    function repeat(string, n, guard) {
      if ((guard ? isIterateeCall(string, n, guard) : n === undefined)) {
        n = 1;
      } else {
        n = toInteger(n);
      }
      return baseRepeat(toString(string), n);
    }

    /**
     * Replaces matches for `pattern` in `string` with `replacement`.
     *
     * **Note:** This method is based on
     * [`String#replace`](https://mdn.io/String/replace).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to modify.
     * @param {RegExp|string} pattern The pattern to replace.
     * @param {Function|string} replacement The match replacement.
     * @returns {string} Returns the modified string.
     * @example
     *
     * _.replace('Hi Fred', 'Fred', 'Barney');
     * // => 'Hi Barney'
     */
    function replace() {
      var args = arguments,
          string = toString(args[0]);

      return args.length < 3 ? string : string.replace(args[1], args[2]);
    }

    /**
     * Converts `string` to
     * [snake case](https://en.wikipedia.org/wiki/Snake_case).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the snake cased string.
     * @example
     *
     * _.snakeCase('Foo Bar');
     * // => 'foo_bar'
     *
     * _.snakeCase('fooBar');
     * // => 'foo_bar'
     *
     * _.snakeCase('--FOO-BAR--');
     * // => 'foo_bar'
     */
    var snakeCase = createCompounder(function(result, word, index) {
      return result + (index ? '_' : '') + word.toLowerCase();
    });

    /**
     * Splits `string` by `separator`.
     *
     * **Note:** This method is based on
     * [`String#split`](https://mdn.io/String/split).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to split.
     * @param {RegExp|string} separator The separator pattern to split by.
     * @param {number} [limit] The length to truncate results to.
     * @returns {Array} Returns the string segments.
     * @example
     *
     * _.split('a-b-c', '-', 2);
     * // => ['a', 'b']
     */
    function split(string, separator, limit) {
      if (limit && typeof limit != 'number' && isIterateeCall(string, separator, limit)) {
        separator = limit = undefined;
      }
      limit = limit === undefined ? MAX_ARRAY_LENGTH : limit >>> 0;
      if (!limit) {
        return [];
      }
      string = toString(string);
      if (string && (
            typeof separator == 'string' ||
            (separator != null && !isRegExp(separator))
          )) {
        separator = baseToString(separator);
        if (!separator && hasUnicode(string)) {
          return castSlice(stringToArray(string), 0, limit);
        }
      }
      return string.split(separator, limit);
    }

    /**
     * Converts `string` to
     * [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
     *
     * @static
     * @memberOf _
     * @since 3.1.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the start cased string.
     * @example
     *
     * _.startCase('--foo-bar--');
     * // => 'Foo Bar'
     *
     * _.startCase('fooBar');
     * // => 'Foo Bar'
     *
     * _.startCase('__FOO_BAR__');
     * // => 'FOO BAR'
     */
    var startCase = createCompounder(function(result, word, index) {
      return result + (index ? ' ' : '') + upperFirst(word);
    });

    /**
     * Checks if `string` starts with the given target string.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to inspect.
     * @param {string} [target] The string to search for.
     * @param {number} [position=0] The position to search from.
     * @returns {boolean} Returns `true` if `string` starts with `target`,
     *  else `false`.
     * @example
     *
     * _.startsWith('abc', 'a');
     * // => true
     *
     * _.startsWith('abc', 'b');
     * // => false
     *
     * _.startsWith('abc', 'b', 1);
     * // => true
     */
    function startsWith(string, target, position) {
      string = toString(string);
      position = baseClamp(toInteger(position), 0, string.length);
      target = baseToString(target);
      return string.slice(position, position + target.length) == target;
    }

    /**
     * Creates a compiled template function that can interpolate data properties
     * in "interpolate" delimiters, HTML-escape interpolated data properties in
     * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
     * properties may be accessed as free variables in the template. If a setting
     * object is given, it takes precedence over `_.templateSettings` values.
     *
     * **Note:** In the development build `_.template` utilizes
     * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
     * for easier debugging.
     *
     * For more information on precompiling templates see
     * [lodash's custom builds documentation](https://lodash.com/custom-builds).
     *
     * For more information on Chrome extension sandboxes see
     * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category String
     * @param {string} [string=''] The template string.
     * @param {Object} [options={}] The options object.
     * @param {RegExp} [options.escape=_.templateSettings.escape]
     *  The HTML "escape" delimiter.
     * @param {RegExp} [options.evaluate=_.templateSettings.evaluate]
     *  The "evaluate" delimiter.
     * @param {Object} [options.imports=_.templateSettings.imports]
     *  An object to import into the template as free variables.
     * @param {RegExp} [options.interpolate=_.templateSettings.interpolate]
     *  The "interpolate" delimiter.
     * @param {string} [options.sourceURL='lodash.templateSources[n]']
     *  The sourceURL of the compiled template.
     * @param {string} [options.variable='obj']
     *  The data object variable name.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Function} Returns the compiled template function.
     * @example
     *
     * // Use the "interpolate" delimiter to create a compiled template.
     * var compiled = _.template('hello <%= user %>!');
     * compiled({ 'user': 'fred' });
     * // => 'hello fred!'
     *
     * // Use the HTML "escape" delimiter to escape data property values.
     * var compiled = _.template('<b><%- value %></b>');
     * compiled({ 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
     * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
     * compiled({ 'users': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // Use the internal `print` function in "evaluate" delimiters.
     * var compiled = _.template('<% print("hello " + user); %>!');
     * compiled({ 'user': 'barney' });
     * // => 'hello barney!'
     *
     * // Use the ES template literal delimiter as an "interpolate" delimiter.
     * // Disable support by replacing the "interpolate" delimiter.
     * var compiled = _.template('hello ${ user }!');
     * compiled({ 'user': 'pebbles' });
     * // => 'hello pebbles!'
     *
     * // Use backslashes to treat delimiters as plain text.
     * var compiled = _.template('<%= "\\<%- value %\\>" %>');
     * compiled({ 'value': 'ignored' });
     * // => '<%- value %>'
     *
     * // Use the `imports` option to import `jQuery` as `jq`.
     * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
     * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
     * compiled({ 'users': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // Use the `sourceURL` option to specify a custom sourceURL for the template.
     * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => Find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector.
     *
     * // Use the `variable` option to ensure a with-statement isn't used in the compiled template.
     * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     * //   var __t, __p = '';
     * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
     * //   return __p;
     * // }
     *
     * // Use custom template delimiters.
     * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
     * var compiled = _.template('hello {{ user }}!');
     * compiled({ 'user': 'mustache' });
     * // => 'hello mustache!'
     *
     * // Use the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and stack traces.
     * fs.writeFileSync(path.join(process.cwd(), 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(string, options, guard) {
      // Based on John Resig's `tmpl` implementation
      // (http://ejohn.org/blog/javascript-micro-templating/)
      // and Laura Doktorova's doT.js (https://github.com/olado/doT).
      var settings = lodash.templateSettings;

      if (guard && isIterateeCall(string, options, guard)) {
        options = undefined;
      }
      string = toString(string);
      options = assignInWith({}, options, settings, assignInDefaults);

      var imports = assignInWith({}, options.imports, settings.imports, assignInDefaults),
          importsKeys = keys(imports),
          importsValues = baseValues(imports, importsKeys);

      var isEscaping,
          isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // Compile the regexp to match each delimiter.
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      // Use a sourceURL for easier debugging.
      var sourceURL = '//# sourceURL=' +
        ('sourceURL' in options
          ? options.sourceURL
          : ('lodash.templateSources[' + (++templateCounter) + ']')
        ) + '\n';

      string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // Escape characters that can't be included in string literals.
        source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // Replace delimiters with snippets.
        if (escapeValue) {
          isEscaping = true;
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // The JS engine embedded in Adobe products needs `match` returned in
        // order to produce the correct `offset` value.
        return match;
      });

      source += "';\n";

      // If `variable` is not specified wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain.
      var variable = options.variable;
      if (!variable) {
        source = 'with (obj) {\n' + source + '\n}\n';
      }
      // Cleanup code by stripping empty strings.
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // Frame code as the function body.
      source = 'function(' + (variable || 'obj') + ') {\n' +
        (variable
          ? ''
          : 'obj || (obj = {});\n'
        ) +
        "var __t, __p = ''" +
        (isEscaping
           ? ', __e = _.escape'
           : ''
        ) +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      var result = attempt(function() {
        return Function(importsKeys, sourceURL + 'return ' + source)
          .apply(undefined, importsValues);
      });

      // Provide the compiled function's source by its `toString` method or
      // the `source` property as a convenience for inlining compiled templates.
      result.source = source;
      if (isError(result)) {
        throw result;
      }
      return result;
    }

    /**
     * Converts `string`, as a whole, to lower case just like
     * [String#toLowerCase](https://mdn.io/toLowerCase).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the lower cased string.
     * @example
     *
     * _.toLower('--Foo-Bar--');
     * // => '--foo-bar--'
     *
     * _.toLower('fooBar');
     * // => 'foobar'
     *
     * _.toLower('__FOO_BAR__');
     * // => '__foo_bar__'
     */
    function toLower(value) {
      return toString(value).toLowerCase();
    }

    /**
     * Converts `string`, as a whole, to upper case just like
     * [String#toUpperCase](https://mdn.io/toUpperCase).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the upper cased string.
     * @example
     *
     * _.toUpper('--foo-bar--');
     * // => '--FOO-BAR--'
     *
     * _.toUpper('fooBar');
     * // => 'FOOBAR'
     *
     * _.toUpper('__foo_bar__');
     * // => '__FOO_BAR__'
     */
    function toUpper(value) {
      return toString(value).toUpperCase();
    }

    /**
     * Removes leading and trailing whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trim('  abc  ');
     * // => 'abc'
     *
     * _.trim('-_-abc-_-', '_-');
     * // => 'abc'
     *
     * _.map(['  foo  ', '  bar  '], _.trim);
     * // => ['foo', 'bar']
     */
    function trim(string, chars, guard) {
      string = toString(string);
      if (string && (guard || chars === undefined)) {
        return string.replace(reTrim, '');
      }
      if (!string || !(chars = baseToString(chars))) {
        return string;
      }
      var strSymbols = stringToArray(string),
          chrSymbols = stringToArray(chars),
          start = charsStartIndex(strSymbols, chrSymbols),
          end = charsEndIndex(strSymbols, chrSymbols) + 1;

      return castSlice(strSymbols, start, end).join('');
    }

    /**
     * Removes trailing whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trimEnd('  abc  ');
     * // => '  abc'
     *
     * _.trimEnd('-_-abc-_-', '_-');
     * // => '-_-abc'
     */
    function trimEnd(string, chars, guard) {
      string = toString(string);
      if (string && (guard || chars === undefined)) {
        return string.replace(reTrimEnd, '');
      }
      if (!string || !(chars = baseToString(chars))) {
        return string;
      }
      var strSymbols = stringToArray(string),
          end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;

      return castSlice(strSymbols, 0, end).join('');
    }

    /**
     * Removes leading whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trimStart('  abc  ');
     * // => 'abc  '
     *
     * _.trimStart('-_-abc-_-', '_-');
     * // => 'abc-_-'
     */
    function trimStart(string, chars, guard) {
      string = toString(string);
      if (string && (guard || chars === undefined)) {
        return string.replace(reTrimStart, '');
      }
      if (!string || !(chars = baseToString(chars))) {
        return string;
      }
      var strSymbols = stringToArray(string),
          start = charsStartIndex(strSymbols, stringToArray(chars));

      return castSlice(strSymbols, start).join('');
    }

    /**
     * Truncates `string` if it's longer than the given maximum string length.
     * The last characters of the truncated string are replaced with the omission
     * string which defaults to "...".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to truncate.
     * @param {Object} [options={}] The options object.
     * @param {number} [options.length=30] The maximum string length.
     * @param {string} [options.omission='...'] The string to indicate text is omitted.
     * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
     * @returns {string} Returns the truncated string.
     * @example
     *
     * _.truncate('hi-diddly-ho there, neighborino');
     * // => 'hi-diddly-ho there, neighbo...'
     *
     * _.truncate('hi-diddly-ho there, neighborino', {
     *   'length': 24,
     *   'separator': ' '
     * });
     * // => 'hi-diddly-ho there,...'
     *
     * _.truncate('hi-diddly-ho there, neighborino', {
     *   'length': 24,
     *   'separator': /,? +/
     * });
     * // => 'hi-diddly-ho there...'
     *
     * _.truncate('hi-diddly-ho there, neighborino', {
     *   'omission': ' [...]'
     * });
     * // => 'hi-diddly-ho there, neig [...]'
     */
    function truncate(string, options) {
      var length = DEFAULT_TRUNC_LENGTH,
          omission = DEFAULT_TRUNC_OMISSION;

      if (isObject(options)) {
        var separator = 'separator' in options ? options.separator : separator;
        length = 'length' in options ? toInteger(options.length) : length;
        omission = 'omission' in options ? baseToString(options.omission) : omission;
      }
      string = toString(string);

      var strLength = string.length;
      if (hasUnicode(string)) {
        var strSymbols = stringToArray(string);
        strLength = strSymbols.length;
      }
      if (length >= strLength) {
        return string;
      }
      var end = length - stringSize(omission);
      if (end < 1) {
        return omission;
      }
      var result = strSymbols
        ? castSlice(strSymbols, 0, end).join('')
        : string.slice(0, end);

      if (separator === undefined) {
        return result + omission;
      }
      if (strSymbols) {
        end += (result.length - end);
      }
      if (isRegExp(separator)) {
        if (string.slice(end).search(separator)) {
          var match,
              substring = result;

          if (!separator.global) {
            separator = RegExp(separator.source, toString(reFlags.exec(separator)) + 'g');
          }
          separator.lastIndex = 0;
          while ((match = separator.exec(substring))) {
            var newEnd = match.index;
          }
          result = result.slice(0, newEnd === undefined ? end : newEnd);
        }
      } else if (string.indexOf(baseToString(separator), end) != end) {
        var index = result.lastIndexOf(separator);
        if (index > -1) {
          result = result.slice(0, index);
        }
      }
      return result + omission;
    }

    /**
     * The inverse of `_.escape`; this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to
     * their corresponding characters.
     *
     * **Note:** No other HTML entities are unescaped. To unescape additional
     * HTML entities use a third-party library like [_he_](https://mths.be/he).
     *
     * @static
     * @memberOf _
     * @since 0.6.0
     * @category String
     * @param {string} [string=''] The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('fred, barney, &amp; pebbles');
     * // => 'fred, barney, & pebbles'
     */
    function unescape(string) {
      string = toString(string);
      return (string && reHasEscapedHtml.test(string))
        ? string.replace(reEscapedHtml, unescapeHtmlChar)
        : string;
    }

    /**
     * Converts `string`, as space separated words, to upper case.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the upper cased string.
     * @example
     *
     * _.upperCase('--foo-bar');
     * // => 'FOO BAR'
     *
     * _.upperCase('fooBar');
     * // => 'FOO BAR'
     *
     * _.upperCase('__foo_bar__');
     * // => 'FOO BAR'
     */
    var upperCase = createCompounder(function(result, word, index) {
      return result + (index ? ' ' : '') + word.toUpperCase();
    });

    /**
     * Converts the first character of `string` to upper case.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.upperFirst('fred');
     * // => 'Fred'
     *
     * _.upperFirst('FRED');
     * // => 'FRED'
     */
    var upperFirst = createCaseFirst('toUpperCase');

    /**
     * Splits `string` into an array of its words.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to inspect.
     * @param {RegExp|string} [pattern] The pattern to match words.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the words of `string`.
     * @example
     *
     * _.words('fred, barney, & pebbles');
     * // => ['fred', 'barney', 'pebbles']
     *
     * _.words('fred, barney, & pebbles', /[^, ]+/g);
     * // => ['fred', 'barney', '&', 'pebbles']
     */
    function words(string, pattern, guard) {
      string = toString(string);
      pattern = guard ? undefined : pattern;

      if (pattern === undefined) {
        return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
      }
      return string.match(pattern) || [];
    }

    /*------------------------------------------------------------------------*/

    /**
     * Attempts to invoke `func`, returning either the result or the caught error
     * object. Any additional arguments are provided to `func` when it's invoked.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Util
     * @param {Function} func The function to attempt.
     * @param {...*} [args] The arguments to invoke `func` with.
     * @returns {*} Returns the `func` result or error object.
     * @example
     *
     * // Avoid throwing errors for invalid selectors.
     * var elements = _.attempt(function(selector) {
     *   return document.querySelectorAll(selector);
     * }, '>_>');
     *
     * if (_.isError(elements)) {
     *   elements = [];
     * }
     */
    var attempt = baseRest(function(func, args) {
      try {
        return apply(func, undefined, args);
      } catch (e) {
        return isError(e) ? e : new Error(e);
      }
    });

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method.
     *
     * **Note:** This method doesn't set the "length" property of bound functions.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...(string|string[])} methodNames The object method names to bind.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'click': function() {
     *     console.log('clicked ' + this.label);
     *   }
     * };
     *
     * _.bindAll(view, ['click']);
     * jQuery(element).on('click', view.click);
     * // => Logs 'clicked docs' when clicked.
     */
    var bindAll = flatRest(function(object, methodNames) {
      arrayEach(methodNames, function(key) {
        key = toKey(key);
        baseAssignValue(object, key, bind(object[key], object));
      });
      return object;
    });

    /**
     * Creates a function that iterates over `pairs` and invokes the corresponding
     * function of the first predicate to return truthy. The predicate-function
     * pairs are invoked with the `this` binding and arguments of the created
     * function.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {Array} pairs The predicate-function pairs.
     * @returns {Function} Returns the new composite function.
     * @example
     *
     * var func = _.cond([
     *   [_.matches({ 'a': 1 }),           _.constant('matches A')],
     *   [_.conforms({ 'b': _.isNumber }), _.constant('matches B')],
     *   [_.stubTrue,                      _.constant('no match')]
     * ]);
     *
     * func({ 'a': 1, 'b': 2 });
     * // => 'matches A'
     *
     * func({ 'a': 0, 'b': 1 });
     * // => 'matches B'
     *
     * func({ 'a': '1', 'b': '2' });
     * // => 'no match'
     */
    function cond(pairs) {
      var length = pairs ? pairs.length : 0,
          toIteratee = getIteratee();

      pairs = !length ? [] : arrayMap(pairs, function(pair) {
        if (typeof pair[1] != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        return [toIteratee(pair[0]), pair[1]];
      });

      return baseRest(function(args) {
        var index = -1;
        while (++index < length) {
          var pair = pairs[index];
          if (apply(pair[0], this, args)) {
            return apply(pair[1], this, args);
          }
        }
      });
    }

    /**
     * Creates a function that invokes the predicate properties of `source` with
     * the corresponding property values of a given object, returning `true` if
     * all predicates return truthy, else `false`.
     *
     * **Note:** The created function is equivalent to `_.conformsTo` with
     * `source` partially applied.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {Object} source The object of property predicates to conform to.
     * @returns {Function} Returns the new spec function.
     * @example
     *
     * var objects = [
     *   { 'a': 2, 'b': 1 },
     *   { 'a': 1, 'b': 2 }
     * ];
     *
     * _.filter(objects, _.conforms({ 'b': function(n) { return n > 1; } }));
     * // => [{ 'a': 1, 'b': 2 }]
     */
    function conforms(source) {
      return baseConforms(baseClone(source, true));
    }

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new constant function.
     * @example
     *
     * var objects = _.times(2, _.constant({ 'a': 1 }));
     *
     * console.log(objects);
     * // => [{ 'a': 1 }, { 'a': 1 }]
     *
     * console.log(objects[0] === objects[1]);
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Checks `value` to determine whether a default value should be returned in
     * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
     * or `undefined`.
     *
     * @static
     * @memberOf _
     * @since 4.14.0
     * @category Util
     * @param {*} value The value to check.
     * @param {*} defaultValue The default value.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * _.defaultTo(1, 10);
     * // => 1
     *
     * _.defaultTo(undefined, 10);
     * // => 10
     */
    function defaultTo(value, defaultValue) {
      return (value == null || value !== value) ? defaultValue : value;
    }

    /**
     * Creates a function that returns the result of invoking the given functions
     * with the `this` binding of the created function, where each successive
     * invocation is supplied the return value of the previous.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Util
     * @param {...(Function|Function[])} [funcs] The functions to invoke.
     * @returns {Function} Returns the new composite function.
     * @see _.flowRight
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var addSquare = _.flow([_.add, square]);
     * addSquare(1, 2);
     * // => 9
     */
    var flow = createFlow();

    /**
     * This method is like `_.flow` except that it creates a function that
     * invokes the given functions from right to left.
     *
     * @static
     * @since 3.0.0
     * @memberOf _
     * @category Util
     * @param {...(Function|Function[])} [funcs] The functions to invoke.
     * @returns {Function} Returns the new composite function.
     * @see _.flow
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var addSquare = _.flowRight([square, _.add]);
     * addSquare(1, 2);
     * // => 9
     */
    var flowRight = createFlow(true);

    /**
     * This method returns the first argument it receives.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'a': 1 };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Creates a function that invokes `func` with the arguments of the created
     * function. If `func` is a property name, the created function returns the
     * property value for a given element. If `func` is an array or object, the
     * created function returns `true` for elements that contain the equivalent
     * source properties, otherwise it returns `false`.
     *
     * @static
     * @since 4.0.0
     * @memberOf _
     * @category Util
     * @param {*} [func=_.identity] The value to convert to a callback.
     * @returns {Function} Returns the callback.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * // The `_.matches` iteratee shorthand.
     * _.filter(users, _.iteratee({ 'user': 'barney', 'active': true }));
     * // => [{ 'user': 'barney', 'age': 36, 'active': true }]
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.filter(users, _.iteratee(['user', 'fred']));
     * // => [{ 'user': 'fred', 'age': 40 }]
     *
     * // The `_.property` iteratee shorthand.
     * _.map(users, _.iteratee('user'));
     * // => ['barney', 'fred']
     *
     * // Create custom iteratee shorthands.
     * _.iteratee = _.wrap(_.iteratee, function(iteratee, func) {
     *   return !_.isRegExp(func) ? iteratee(func) : function(string) {
     *     return func.test(string);
     *   };
     * });
     *
     * _.filter(['abc', 'def'], /ef/);
     * // => ['def']
     */
    function iteratee(func) {
      return baseIteratee(typeof func == 'function' ? func : baseClone(func, true));
    }

    /**
     * Creates a function that performs a partial deep comparison between a given
     * object and `source`, returning `true` if the given object has equivalent
     * property values, else `false`.
     *
     * **Note:** The created function is equivalent to `_.isMatch` with `source`
     * partially applied.
     *
     * Partial comparisons will match empty array and empty object `source`
     * values against any array or object value, respectively. See `_.isEqual`
     * for a list of supported value comparisons.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Util
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     * @example
     *
     * var objects = [
     *   { 'a': 1, 'b': 2, 'c': 3 },
     *   { 'a': 4, 'b': 5, 'c': 6 }
     * ];
     *
     * _.filter(objects, _.matches({ 'a': 4, 'c': 6 }));
     * // => [{ 'a': 4, 'b': 5, 'c': 6 }]
     */
    function matches(source) {
      return baseMatches(baseClone(source, true));
    }

    /**
     * Creates a function that performs a partial deep comparison between the
     * value at `path` of a given object to `srcValue`, returning `true` if the
     * object value is equivalent, else `false`.
     *
     * **Note:** Partial comparisons will match empty array and empty object
     * `srcValue` values against any array or object value, respectively. See
     * `_.isEqual` for a list of supported value comparisons.
     *
     * @static
     * @memberOf _
     * @since 3.2.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     * @example
     *
     * var objects = [
     *   { 'a': 1, 'b': 2, 'c': 3 },
     *   { 'a': 4, 'b': 5, 'c': 6 }
     * ];
     *
     * _.find(objects, _.matchesProperty('a', 4));
     * // => { 'a': 4, 'b': 5, 'c': 6 }
     */
    function matchesProperty(path, srcValue) {
      return baseMatchesProperty(path, baseClone(srcValue, true));
    }

    /**
     * Creates a function that invokes the method at `path` of a given object.
     * Any additional arguments are provided to the invoked method.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Util
     * @param {Array|string} path The path of the method to invoke.
     * @param {...*} [args] The arguments to invoke the method with.
     * @returns {Function} Returns the new invoker function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': _.constant(2) } },
     *   { 'a': { 'b': _.constant(1) } }
     * ];
     *
     * _.map(objects, _.method('a.b'));
     * // => [2, 1]
     *
     * _.map(objects, _.method(['a', 'b']));
     * // => [2, 1]
     */
    var method = baseRest(function(path, args) {
      return function(object) {
        return baseInvoke(object, path, args);
      };
    });

    /**
     * The opposite of `_.method`; this method creates a function that invokes
     * the method at a given path of `object`. Any additional arguments are
     * provided to the invoked method.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Util
     * @param {Object} object The object to query.
     * @param {...*} [args] The arguments to invoke the method with.
     * @returns {Function} Returns the new invoker function.
     * @example
     *
     * var array = _.times(3, _.constant),
     *     object = { 'a': array, 'b': array, 'c': array };
     *
     * _.map(['a[2]', 'c[0]'], _.methodOf(object));
     * // => [2, 0]
     *
     * _.map([['a', '2'], ['c', '0']], _.methodOf(object));
     * // => [2, 0]
     */
    var methodOf = baseRest(function(object, args) {
      return function(path) {
        return baseInvoke(object, path, args);
      };
    });

    /**
     * Adds all own enumerable string keyed function properties of a source
     * object to the destination object. If `object` is a function, then methods
     * are added to its prototype as well.
     *
     * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
     * avoid conflicts caused by modifying the original.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {Function|Object} [object=lodash] The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.chain=true] Specify whether mixins are chainable.
     * @returns {Function|Object} Returns `object`.
     * @example
     *
     * function vowels(string) {
     *   return _.filter(string, function(v) {
     *     return /[aeiou]/i.test(v);
     *   });
     * }
     *
     * _.mixin({ 'vowels': vowels });
     * _.vowels('fred');
     * // => ['e']
     *
     * _('fred').vowels().value();
     * // => ['e']
     *
     * _.mixin({ 'vowels': vowels }, { 'chain': false });
     * _('fred').vowels();
     * // => ['e']
     */
    function mixin(object, source, options) {
      var props = keys(source),
          methodNames = baseFunctions(source, props);

      if (options == null &&
          !(isObject(source) && (methodNames.length || !props.length))) {
        options = source;
        source = object;
        object = this;
        methodNames = baseFunctions(source, keys(source));
      }
      var chain = !(isObject(options) && 'chain' in options) || !!options.chain,
          isFunc = isFunction(object);

      arrayEach(methodNames, function(methodName) {
        var func = source[methodName];
        object[methodName] = func;
        if (isFunc) {
          object.prototype[methodName] = function() {
            var chainAll = this.__chain__;
            if (chain || chainAll) {
              var result = object(this.__wrapped__),
                  actions = result.__actions__ = copyArray(this.__actions__);

              actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
              result.__chain__ = chainAll;
              return result;
            }
            return func.apply(object, arrayPush([this.value()], arguments));
          };
        }
      });

      return object;
    }

    /**
     * Reverts the `_` variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      if (root._ === this) {
        root._ = oldDash;
      }
      return this;
    }

    /**
     * This method returns `undefined`.
     *
     * @static
     * @memberOf _
     * @since 2.3.0
     * @category Util
     * @example
     *
     * _.times(2, _.noop);
     * // => [undefined, undefined]
     */
    function noop() {
      // No operation performed.
    }

    /**
     * Creates a function that gets the argument at index `n`. If `n` is negative,
     * the nth argument from the end is returned.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {number} [n=0] The index of the argument to return.
     * @returns {Function} Returns the new pass-thru function.
     * @example
     *
     * var func = _.nthArg(1);
     * func('a', 'b', 'c', 'd');
     * // => 'b'
     *
     * var func = _.nthArg(-2);
     * func('a', 'b', 'c', 'd');
     * // => 'c'
     */
    function nthArg(n) {
      n = toInteger(n);
      return baseRest(function(args) {
        return baseNth(args, n);
      });
    }

    /**
     * Creates a function that invokes `iteratees` with the arguments it receives
     * and returns their results.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {...(Function|Function[])} [iteratees=[_.identity]]
     *  The iteratees to invoke.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var func = _.over([Math.max, Math.min]);
     *
     * func(1, 2, 3, 4);
     * // => [4, 1]
     */
    var over = createOver(arrayMap);

    /**
     * Creates a function that checks if **all** of the `predicates` return
     * truthy when invoked with the arguments it receives.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {...(Function|Function[])} [predicates=[_.identity]]
     *  The predicates to check.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var func = _.overEvery([Boolean, isFinite]);
     *
     * func('1');
     * // => true
     *
     * func(null);
     * // => false
     *
     * func(NaN);
     * // => false
     */
    var overEvery = createOver(arrayEvery);

    /**
     * Creates a function that checks if **any** of the `predicates` return
     * truthy when invoked with the arguments it receives.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {...(Function|Function[])} [predicates=[_.identity]]
     *  The predicates to check.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var func = _.overSome([Boolean, isFinite]);
     *
     * func('1');
     * // => true
     *
     * func(null);
     * // => true
     *
     * func(NaN);
     * // => false
     */
    var overSome = createOver(arraySome);

    /**
     * Creates a function that returns the value at `path` of a given object.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': 2 } },
     *   { 'a': { 'b': 1 } }
     * ];
     *
     * _.map(objects, _.property('a.b'));
     * // => [2, 1]
     *
     * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
     * // => [1, 2]
     */
    function property(path) {
      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
    }

    /**
     * The opposite of `_.property`; this method creates a function that returns
     * the value at a given path of `object`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Util
     * @param {Object} object The object to query.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var array = [0, 1, 2],
     *     object = { 'a': array, 'b': array, 'c': array };
     *
     * _.map(['a[2]', 'c[0]'], _.propertyOf(object));
     * // => [2, 0]
     *
     * _.map([['a', '2'], ['c', '0']], _.propertyOf(object));
     * // => [2, 0]
     */
    function propertyOf(object) {
      return function(path) {
        return object == null ? undefined : baseGet(object, path);
      };
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to, but not including, `end`. A step of `-1` is used if a negative
     * `start` is specified without an `end` or `step`. If `end` is not specified,
     * it's set to `start` with `start` then set to `0`.
     *
     * **Note:** JavaScript follows the IEEE-754 standard for resolving
     * floating-point values which can produce unexpected results.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns the range of numbers.
     * @see _.inRange, _.rangeRight
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(-4);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    var range = createRange();

    /**
     * This method is like `_.range` except that it populates values in
     * descending order.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns the range of numbers.
     * @see _.inRange, _.range
     * @example
     *
     * _.rangeRight(4);
     * // => [3, 2, 1, 0]
     *
     * _.rangeRight(-4);
     * // => [-3, -2, -1, 0]
     *
     * _.rangeRight(1, 5);
     * // => [4, 3, 2, 1]
     *
     * _.rangeRight(0, 20, 5);
     * // => [15, 10, 5, 0]
     *
     * _.rangeRight(0, -4, -1);
     * // => [-3, -2, -1, 0]
     *
     * _.rangeRight(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.rangeRight(0);
     * // => []
     */
    var rangeRight = createRange(true);

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    /**
     * This method returns a new empty object.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Object} Returns the new empty object.
     * @example
     *
     * var objects = _.times(2, _.stubObject);
     *
     * console.log(objects);
     * // => [{}, {}]
     *
     * console.log(objects[0] === objects[1]);
     * // => false
     */
    function stubObject() {
      return {};
    }

    /**
     * This method returns an empty string.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {string} Returns the empty string.
     * @example
     *
     * _.times(2, _.stubString);
     * // => ['', '']
     */
    function stubString() {
      return '';
    }

    /**
     * This method returns `true`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `true`.
     * @example
     *
     * _.times(2, _.stubTrue);
     * // => [true, true]
     */
    function stubTrue() {
      return true;
    }

    /**
     * Invokes the iteratee `n` times, returning an array of the results of
     * each invocation. The iteratee is invoked with one argument; (index).
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     * @example
     *
     * _.times(3, String);
     * // => ['0', '1', '2']
     *
     *  _.times(4, _.constant(0));
     * // => [0, 0, 0, 0]
     */
    function times(n, iteratee) {
      n = toInteger(n);
      if (n < 1 || n > MAX_SAFE_INTEGER) {
        return [];
      }
      var index = MAX_ARRAY_LENGTH,
          length = nativeMin(n, MAX_ARRAY_LENGTH);

      iteratee = getIteratee(iteratee);
      n -= MAX_ARRAY_LENGTH;

      var result = baseTimes(length, iteratee);
      while (++index < n) {
        iteratee(index);
      }
      return result;
    }

    /**
     * Converts `value` to a property path array.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {*} value The value to convert.
     * @returns {Array} Returns the new property path array.
     * @example
     *
     * _.toPath('a.b.c');
     * // => ['a', 'b', 'c']
     *
     * _.toPath('a[0].b.c');
     * // => ['a', '0', 'b', 'c']
     */
    function toPath(value) {
      if (isArray(value)) {
        return arrayMap(value, toKey);
      }
      return isSymbol(value) ? [value] : copyArray(stringToPath(value));
    }

    /**
     * Generates a unique ID. If `prefix` is given, the ID is appended to it.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {string} [prefix=''] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return toString(prefix) + id;
    }

    /*------------------------------------------------------------------------*/

    /**
     * Adds two numbers.
     *
     * @static
     * @memberOf _
     * @since 3.4.0
     * @category Math
     * @param {number} augend The first number in an addition.
     * @param {number} addend The second number in an addition.
     * @returns {number} Returns the total.
     * @example
     *
     * _.add(6, 4);
     * // => 10
     */
    var add = createMathOperation(function(augend, addend) {
      return augend + addend;
    }, 0);

    /**
     * Computes `number` rounded up to `precision`.
     *
     * @static
     * @memberOf _
     * @since 3.10.0
     * @category Math
     * @param {number} number The number to round up.
     * @param {number} [precision=0] The precision to round up to.
     * @returns {number} Returns the rounded up number.
     * @example
     *
     * _.ceil(4.006);
     * // => 5
     *
     * _.ceil(6.004, 2);
     * // => 6.01
     *
     * _.ceil(6040, -2);
     * // => 6100
     */
    var ceil = createRound('ceil');

    /**
     * Divide two numbers.
     *
     * @static
     * @memberOf _
     * @since 4.7.0
     * @category Math
     * @param {number} dividend The first number in a division.
     * @param {number} divisor The second number in a division.
     * @returns {number} Returns the quotient.
     * @example
     *
     * _.divide(6, 4);
     * // => 1.5
     */
    var divide = createMathOperation(function(dividend, divisor) {
      return dividend / divisor;
    }, 1);

    /**
     * Computes `number` rounded down to `precision`.
     *
     * @static
     * @memberOf _
     * @since 3.10.0
     * @category Math
     * @param {number} number The number to round down.
     * @param {number} [precision=0] The precision to round down to.
     * @returns {number} Returns the rounded down number.
     * @example
     *
     * _.floor(4.006);
     * // => 4
     *
     * _.floor(0.046, 2);
     * // => 0.04
     *
     * _.floor(4060, -2);
     * // => 4000
     */
    var floor = createRound('floor');

    /**
     * Computes the maximum value of `array`. If `array` is empty or falsey,
     * `undefined` is returned.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Math
     * @param {Array} array The array to iterate over.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * _.max([]);
     * // => undefined
     */
    function max(array) {
      return (array && array.length)
        ? baseExtremum(array, identity, baseGt)
        : undefined;
    }

    /**
     * This method is like `_.max` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the criterion by which
     * the value is ranked. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * var objects = [{ 'n': 1 }, { 'n': 2 }];
     *
     * _.maxBy(objects, function(o) { return o.n; });
     * // => { 'n': 2 }
     *
     * // The `_.property` iteratee shorthand.
     * _.maxBy(objects, 'n');
     * // => { 'n': 2 }
     */
    function maxBy(array, iteratee) {
      return (array && array.length)
        ? baseExtremum(array, getIteratee(iteratee, 2), baseGt)
        : undefined;
    }

    /**
     * Computes the mean of the values in `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @returns {number} Returns the mean.
     * @example
     *
     * _.mean([4, 2, 8, 6]);
     * // => 5
     */
    function mean(array) {
      return baseMean(array, identity);
    }

    /**
     * This method is like `_.mean` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the value to be averaged.
     * The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.7.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {number} Returns the mean.
     * @example
     *
     * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
     *
     * _.meanBy(objects, function(o) { return o.n; });
     * // => 5
     *
     * // The `_.property` iteratee shorthand.
     * _.meanBy(objects, 'n');
     * // => 5
     */
    function meanBy(array, iteratee) {
      return baseMean(array, getIteratee(iteratee, 2));
    }

    /**
     * Computes the minimum value of `array`. If `array` is empty or falsey,
     * `undefined` is returned.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Math
     * @param {Array} array The array to iterate over.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * _.min([]);
     * // => undefined
     */
    function min(array) {
      return (array && array.length)
        ? baseExtremum(array, identity, baseLt)
        : undefined;
    }

    /**
     * This method is like `_.min` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the criterion by which
     * the value is ranked. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * var objects = [{ 'n': 1 }, { 'n': 2 }];
     *
     * _.minBy(objects, function(o) { return o.n; });
     * // => { 'n': 1 }
     *
     * // The `_.property` iteratee shorthand.
     * _.minBy(objects, 'n');
     * // => { 'n': 1 }
     */
    function minBy(array, iteratee) {
      return (array && array.length)
        ? baseExtremum(array, getIteratee(iteratee, 2), baseLt)
        : undefined;
    }

    /**
     * Multiply two numbers.
     *
     * @static
     * @memberOf _
     * @since 4.7.0
     * @category Math
     * @param {number} multiplier The first number in a multiplication.
     * @param {number} multiplicand The second number in a multiplication.
     * @returns {number} Returns the product.
     * @example
     *
     * _.multiply(6, 4);
     * // => 24
     */
    var multiply = createMathOperation(function(multiplier, multiplicand) {
      return multiplier * multiplicand;
    }, 1);

    /**
     * Computes `number` rounded to `precision`.
     *
     * @static
     * @memberOf _
     * @since 3.10.0
     * @category Math
     * @param {number} number The number to round.
     * @param {number} [precision=0] The precision to round to.
     * @returns {number} Returns the rounded number.
     * @example
     *
     * _.round(4.006);
     * // => 4
     *
     * _.round(4.006, 2);
     * // => 4.01
     *
     * _.round(4060, -2);
     * // => 4100
     */
    var round = createRound('round');

    /**
     * Subtract two numbers.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Math
     * @param {number} minuend The first number in a subtraction.
     * @param {number} subtrahend The second number in a subtraction.
     * @returns {number} Returns the difference.
     * @example
     *
     * _.subtract(6, 4);
     * // => 2
     */
    var subtract = createMathOperation(function(minuend, subtrahend) {
      return minuend - subtrahend;
    }, 0);

    /**
     * Computes the sum of the values in `array`.
     *
     * @static
     * @memberOf _
     * @since 3.4.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @returns {number} Returns the sum.
     * @example
     *
     * _.sum([4, 2, 8, 6]);
     * // => 20
     */
    function sum(array) {
      return (array && array.length)
        ? baseSum(array, identity)
        : 0;
    }

    /**
     * This method is like `_.sum` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the value to be summed.
     * The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {number} Returns the sum.
     * @example
     *
     * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
     *
     * _.sumBy(objects, function(o) { return o.n; });
     * // => 20
     *
     * // The `_.property` iteratee shorthand.
     * _.sumBy(objects, 'n');
     * // => 20
     */
    function sumBy(array, iteratee) {
      return (array && array.length)
        ? baseSum(array, getIteratee(iteratee, 2))
        : 0;
    }

    /*------------------------------------------------------------------------*/

    // Add methods that return wrapped values in chain sequences.
    lodash.after = after;
    lodash.ary = ary;
    lodash.assign = assign;
    lodash.assignIn = assignIn;
    lodash.assignInWith = assignInWith;
    lodash.assignWith = assignWith;
    lodash.at = at;
    lodash.before = before;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.castArray = castArray;
    lodash.chain = chain;
    lodash.chunk = chunk;
    lodash.compact = compact;
    lodash.concat = concat;
    lodash.cond = cond;
    lodash.conforms = conforms;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.curry = curry;
    lodash.curryRight = curryRight;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defaultsDeep = defaultsDeep;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.differenceBy = differenceBy;
    lodash.differenceWith = differenceWith;
    lodash.drop = drop;
    lodash.dropRight = dropRight;
    lodash.dropRightWhile = dropRightWhile;
    lodash.dropWhile = dropWhile;
    lodash.fill = fill;
    lodash.filter = filter;
    lodash.flatMap = flatMap;
    lodash.flatMapDeep = flatMapDeep;
    lodash.flatMapDepth = flatMapDepth;
    lodash.flatten = flatten;
    lodash.flattenDeep = flattenDeep;
    lodash.flattenDepth = flattenDepth;
    lodash.flip = flip;
    lodash.flow = flow;
    lodash.flowRight = flowRight;
    lodash.fromPairs = fromPairs;
    lodash.functions = functions;
    lodash.functionsIn = functionsIn;
    lodash.groupBy = groupBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.intersectionBy = intersectionBy;
    lodash.intersectionWith = intersectionWith;
    lodash.invert = invert;
    lodash.invertBy = invertBy;
    lodash.invokeMap = invokeMap;
    lodash.iteratee = iteratee;
    lodash.keyBy = keyBy;
    lodash.keys = keys;
    lodash.keysIn = keysIn;
    lodash.map = map;
    lodash.mapKeys = mapKeys;
    lodash.mapValues = mapValues;
    lodash.matches = matches;
    lodash.matchesProperty = matchesProperty;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.mergeWith = mergeWith;
    lodash.method = method;
    lodash.methodOf = methodOf;
    lodash.mixin = mixin;
    lodash.negate = negate;
    lodash.nthArg = nthArg;
    lodash.omit = omit;
    lodash.omitBy = omitBy;
    lodash.once = once;
    lodash.orderBy = orderBy;
    lodash.over = over;
    lodash.overArgs = overArgs;
    lodash.overEvery = overEvery;
    lodash.overSome = overSome;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.partition = partition;
    lodash.pick = pick;
    lodash.pickBy = pickBy;
    lodash.property = property;
    lodash.propertyOf = propertyOf;
    lodash.pull = pull;
    lodash.pullAll = pullAll;
    lodash.pullAllBy = pullAllBy;
    lodash.pullAllWith = pullAllWith;
    lodash.pullAt = pullAt;
    lodash.range = range;
    lodash.rangeRight = rangeRight;
    lodash.rearg = rearg;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.reverse = reverse;
    lodash.sampleSize = sampleSize;
    lodash.set = set;
    lodash.setWith = setWith;
    lodash.shuffle = shuffle;
    lodash.slice = slice;
    lodash.sortBy = sortBy;
    lodash.sortedUniq = sortedUniq;
    lodash.sortedUniqBy = sortedUniqBy;
    lodash.split = split;
    lodash.spread = spread;
    lodash.tail = tail;
    lodash.take = take;
    lodash.takeRight = takeRight;
    lodash.takeRightWhile = takeRightWhile;
    lodash.takeWhile = takeWhile;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.thru = thru;
    lodash.toArray = toArray;
    lodash.toPairs = toPairs;
    lodash.toPairsIn = toPairsIn;
    lodash.toPath = toPath;
    lodash.toPlainObject = toPlainObject;
    lodash.transform = transform;
    lodash.unary = unary;
    lodash.union = union;
    lodash.unionBy = unionBy;
    lodash.unionWith = unionWith;
    lodash.uniq = uniq;
    lodash.uniqBy = uniqBy;
    lodash.uniqWith = uniqWith;
    lodash.unset = unset;
    lodash.unzip = unzip;
    lodash.unzipWith = unzipWith;
    lodash.update = update;
    lodash.updateWith = updateWith;
    lodash.values = values;
    lodash.valuesIn = valuesIn;
    lodash.without = without;
    lodash.words = words;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.xorBy = xorBy;
    lodash.xorWith = xorWith;
    lodash.zip = zip;
    lodash.zipObject = zipObject;
    lodash.zipObjectDeep = zipObjectDeep;
    lodash.zipWith = zipWith;

    // Add aliases.
    lodash.entries = toPairs;
    lodash.entriesIn = toPairsIn;
    lodash.extend = assignIn;
    lodash.extendWith = assignInWith;

    // Add methods to `lodash.prototype`.
    mixin(lodash, lodash);

    /*------------------------------------------------------------------------*/

    // Add methods that return unwrapped values in chain sequences.
    lodash.add = add;
    lodash.attempt = attempt;
    lodash.camelCase = camelCase;
    lodash.capitalize = capitalize;
    lodash.ceil = ceil;
    lodash.clamp = clamp;
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.cloneDeepWith = cloneDeepWith;
    lodash.cloneWith = cloneWith;
    lodash.conformsTo = conformsTo;
    lodash.deburr = deburr;
    lodash.defaultTo = defaultTo;
    lodash.divide = divide;
    lodash.endsWith = endsWith;
    lodash.eq = eq;
    lodash.escape = escape;
    lodash.escapeRegExp = escapeRegExp;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.floor = floor;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.get = get;
    lodash.gt = gt;
    lodash.gte = gte;
    lodash.has = has;
    lodash.hasIn = hasIn;
    lodash.head = head;
    lodash.identity = identity;
    lodash.includes = includes;
    lodash.indexOf = indexOf;
    lodash.inRange = inRange;
    lodash.invoke = invoke;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isArrayBuffer = isArrayBuffer;
    lodash.isArrayLike = isArrayLike;
    lodash.isArrayLikeObject = isArrayLikeObject;
    lodash.isBoolean = isBoolean;
    lodash.isBuffer = isBuffer;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isEqualWith = isEqualWith;
    lodash.isError = isError;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isInteger = isInteger;
    lodash.isLength = isLength;
    lodash.isMap = isMap;
    lodash.isMatch = isMatch;
    lodash.isMatchWith = isMatchWith;
    lodash.isNaN = isNaN;
    lodash.isNative = isNative;
    lodash.isNil = isNil;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isObjectLike = isObjectLike;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isSafeInteger = isSafeInteger;
    lodash.isSet = isSet;
    lodash.isString = isString;
    lodash.isSymbol = isSymbol;
    lodash.isTypedArray = isTypedArray;
    lodash.isUndefined = isUndefined;
    lodash.isWeakMap = isWeakMap;
    lodash.isWeakSet = isWeakSet;
    lodash.join = join;
    lodash.kebabCase = kebabCase;
    lodash.last = last;
    lodash.lastIndexOf = lastIndexOf;
    lodash.lowerCase = lowerCase;
    lodash.lowerFirst = lowerFirst;
    lodash.lt = lt;
    lodash.lte = lte;
    lodash.max = max;
    lodash.maxBy = maxBy;
    lodash.mean = mean;
    lodash.meanBy = meanBy;
    lodash.min = min;
    lodash.minBy = minBy;
    lodash.stubArray = stubArray;
    lodash.stubFalse = stubFalse;
    lodash.stubObject = stubObject;
    lodash.stubString = stubString;
    lodash.stubTrue = stubTrue;
    lodash.multiply = multiply;
    lodash.nth = nth;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.pad = pad;
    lodash.padEnd = padEnd;
    lodash.padStart = padStart;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.repeat = repeat;
    lodash.replace = replace;
    lodash.result = result;
    lodash.round = round;
    lodash.runInContext = runInContext;
    lodash.sample = sample;
    lodash.size = size;
    lodash.snakeCase = snakeCase;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.sortedIndexBy = sortedIndexBy;
    lodash.sortedIndexOf = sortedIndexOf;
    lodash.sortedLastIndex = sortedLastIndex;
    lodash.sortedLastIndexBy = sortedLastIndexBy;
    lodash.sortedLastIndexOf = sortedLastIndexOf;
    lodash.startCase = startCase;
    lodash.startsWith = startsWith;
    lodash.subtract = subtract;
    lodash.sum = sum;
    lodash.sumBy = sumBy;
    lodash.template = template;
    lodash.times = times;
    lodash.toFinite = toFinite;
    lodash.toInteger = toInteger;
    lodash.toLength = toLength;
    lodash.toLower = toLower;
    lodash.toNumber = toNumber;
    lodash.toSafeInteger = toSafeInteger;
    lodash.toString = toString;
    lodash.toUpper = toUpper;
    lodash.trim = trim;
    lodash.trimEnd = trimEnd;
    lodash.trimStart = trimStart;
    lodash.truncate = truncate;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;
    lodash.upperCase = upperCase;
    lodash.upperFirst = upperFirst;

    // Add aliases.
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.first = head;

    mixin(lodash, (function() {
      var source = {};
      baseForOwn(lodash, function(func, methodName) {
        if (!hasOwnProperty.call(lodash.prototype, methodName)) {
          source[methodName] = func;
        }
      });
      return source;
    }()), { 'chain': false });

    /*------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type {string}
     */
    lodash.VERSION = VERSION;

    // Assign default placeholders.
    arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
      lodash[methodName].placeholder = lodash;
    });

    // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
    arrayEach(['drop', 'take'], function(methodName, index) {
      LazyWrapper.prototype[methodName] = function(n) {
        var filtered = this.__filtered__;
        if (filtered && !index) {
          return new LazyWrapper(this);
        }
        n = n === undefined ? 1 : nativeMax(toInteger(n), 0);

        var result = this.clone();
        if (filtered) {
          result.__takeCount__ = nativeMin(n, result.__takeCount__);
        } else {
          result.__views__.push({
            'size': nativeMin(n, MAX_ARRAY_LENGTH),
            'type': methodName + (result.__dir__ < 0 ? 'Right' : '')
          });
        }
        return result;
      };

      LazyWrapper.prototype[methodName + 'Right'] = function(n) {
        return this.reverse()[methodName](n).reverse();
      };
    });

    // Add `LazyWrapper` methods that accept an `iteratee` value.
    arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
      var type = index + 1,
          isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;

      LazyWrapper.prototype[methodName] = function(iteratee) {
        var result = this.clone();
        result.__iteratees__.push({
          'iteratee': getIteratee(iteratee, 3),
          'type': type
        });
        result.__filtered__ = result.__filtered__ || isFilter;
        return result;
      };
    });

    // Add `LazyWrapper` methods for `_.head` and `_.last`.
    arrayEach(['head', 'last'], function(methodName, index) {
      var takeName = 'take' + (index ? 'Right' : '');

      LazyWrapper.prototype[methodName] = function() {
        return this[takeName](1).value()[0];
      };
    });

    // Add `LazyWrapper` methods for `_.initial` and `_.tail`.
    arrayEach(['initial', 'tail'], function(methodName, index) {
      var dropName = 'drop' + (index ? '' : 'Right');

      LazyWrapper.prototype[methodName] = function() {
        return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
      };
    });

    LazyWrapper.prototype.compact = function() {
      return this.filter(identity);
    };

    LazyWrapper.prototype.find = function(predicate) {
      return this.filter(predicate).head();
    };

    LazyWrapper.prototype.findLast = function(predicate) {
      return this.reverse().find(predicate);
    };

    LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
      if (typeof path == 'function') {
        return new LazyWrapper(this);
      }
      return this.map(function(value) {
        return baseInvoke(value, path, args);
      });
    });

    LazyWrapper.prototype.reject = function(predicate) {
      return this.filter(negate(getIteratee(predicate)));
    };

    LazyWrapper.prototype.slice = function(start, end) {
      start = toInteger(start);

      var result = this;
      if (result.__filtered__ && (start > 0 || end < 0)) {
        return new LazyWrapper(result);
      }
      if (start < 0) {
        result = result.takeRight(-start);
      } else if (start) {
        result = result.drop(start);
      }
      if (end !== undefined) {
        end = toInteger(end);
        result = end < 0 ? result.dropRight(-end) : result.take(end - start);
      }
      return result;
    };

    LazyWrapper.prototype.takeRightWhile = function(predicate) {
      return this.reverse().takeWhile(predicate).reverse();
    };

    LazyWrapper.prototype.toArray = function() {
      return this.take(MAX_ARRAY_LENGTH);
    };

    // Add `LazyWrapper` methods to `lodash.prototype`.
    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
      var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName),
          isTaker = /^(?:head|last)$/.test(methodName),
          lodashFunc = lodash[isTaker ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName],
          retUnwrapped = isTaker || /^find/.test(methodName);

      if (!lodashFunc) {
        return;
      }
      lodash.prototype[methodName] = function() {
        var value = this.__wrapped__,
            args = isTaker ? [1] : arguments,
            isLazy = value instanceof LazyWrapper,
            iteratee = args[0],
            useLazy = isLazy || isArray(value);

        var interceptor = function(value) {
          var result = lodashFunc.apply(lodash, arrayPush([value], args));
          return (isTaker && chainAll) ? result[0] : result;
        };

        if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
          // Avoid lazy use if the iteratee has a "length" value other than `1`.
          isLazy = useLazy = false;
        }
        var chainAll = this.__chain__,
            isHybrid = !!this.__actions__.length,
            isUnwrapped = retUnwrapped && !chainAll,
            onlyLazy = isLazy && !isHybrid;

        if (!retUnwrapped && useLazy) {
          value = onlyLazy ? value : new LazyWrapper(this);
          var result = func.apply(value, args);
          result.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined });
          return new LodashWrapper(result, chainAll);
        }
        if (isUnwrapped && onlyLazy) {
          return func.apply(this, args);
        }
        result = this.thru(interceptor);
        return isUnwrapped ? (isTaker ? result.value()[0] : result.value()) : result;
      };
    });

    // Add `Array` methods to `lodash.prototype`.
    arrayEach(['pop', 'push', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {
      var func = arrayProto[methodName],
          chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
          retUnwrapped = /^(?:pop|shift)$/.test(methodName);

      lodash.prototype[methodName] = function() {
        var args = arguments;
        if (retUnwrapped && !this.__chain__) {
          var value = this.value();
          return func.apply(isArray(value) ? value : [], args);
        }
        return this[chainName](function(value) {
          return func.apply(isArray(value) ? value : [], args);
        });
      };
    });

    // Map minified method names to their real names.
    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
      var lodashFunc = lodash[methodName];
      if (lodashFunc) {
        var key = (lodashFunc.name + ''),
            names = realNames[key] || (realNames[key] = []);

        names.push({ 'name': methodName, 'func': lodashFunc });
      }
    });

    realNames[createHybrid(undefined, BIND_KEY_FLAG).name] = [{
      'name': 'wrapper',
      'func': undefined
    }];

    // Add methods to `LazyWrapper`.
    LazyWrapper.prototype.clone = lazyClone;
    LazyWrapper.prototype.reverse = lazyReverse;
    LazyWrapper.prototype.value = lazyValue;

    // Add chain sequence methods to the `lodash` wrapper.
    lodash.prototype.at = wrapperAt;
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.commit = wrapperCommit;
    lodash.prototype.next = wrapperNext;
    lodash.prototype.plant = wrapperPlant;
    lodash.prototype.reverse = wrapperReverse;
    lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;

    // Add lazy aliases.
    lodash.prototype.first = lodash.prototype.head;

    if (iteratorSymbol) {
      lodash.prototype[iteratorSymbol] = wrapperToIterator;
    }
    return lodash;
  });

  /*--------------------------------------------------------------------------*/

  // Export lodash.
  var _ = runInContext();

  // Some AMD build optimizers, like r.js, check for condition patterns like:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lodash on the global object to prevent errors when Lodash is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    // Use `_.noConflict` to remove Lodash from the global object.
    root._ = _;

    // Define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module.
    define(function() {
      return _;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds it.
  else if (freeModule) {
    // Export for Node.js.
    (freeModule.exports = _)._ = _;
    // Export for CommonJS support.
    freeExports._ = _;
  }
  else {
    // Export to the global object.
    root._ = _;
  }
}.call(this));

_.extend(PhaseMatch.util, _);
_.noConflict();

var nm = Math.pow(10, -9);
var um = Math.pow(10, -6);
var pm = Math.pow(10, -12);
var lightspeed =  2.99792458 * Math.pow(10, 8);
var twoPI = 2 * Math.PI;
var e0 = 8.854 * Math.pow(10,-12)
PhaseMatch.constants = {
    // user accessible constants
    um: um,
    nm: nm,
    pm: pm,
    c: lightspeed,
    e0: e0
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

var ellipticity = 1.0;

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
        Wi_SQ = sq(P.W_sx  * convfromFWHM), // convert from FWHM to sigma @TODO: Change to P.W_i
        // Ws_SQ = sq(W_s * convfromFWHM), // convert from FWHM to sigma
        // Wi_SQ = sq(W_i * convfromFWHM) // convert from FWHM to sigma @TODO: Change to P.W_i
        Wx_SQ = Wp_SQ * sq(ellipticity),
        Wy_SQ = Wp_SQ
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


        ,As_r = -0.25 * Wx_SQ + GAM1s
        ,As_i = -DEL1s
        ,Ai_r = -0.25 * Wx_SQ + GAM1i
        ,Ai_i = -DEL1i
        ,Bs_r = -0.25 * Wy_SQ + GAM2s
        ,Bs_i = -DEL2s
        ,Bi_r = -0.25 * Wy_SQ + GAM2i
        ,Bi_i = -DEL2i
        ,Cs = -0.25 * (P.L  / k_s - 2*z0/k_p)
        ,Ci = -0.25 * (P.L  / k_i - 2*z0/k_p)
        ,Ds =  0.25 * P.L  * (1/k_s - 1/k_p)
        ,Di =  0.25 * P.L  * (1/k_i - 1/k_p)
        // ,Es_r =  0.50 * (Ws_r*PHI_s * PSI_s)
        // ,Es_i =  0.50 * (Ws_i*PHI_i * PSI_s)
        // ,Ei_r =  0.50 * (Wi_r*PHI_i * PSI_i)
        // ,Ei_i =  0.50 * (Wi_i*PHI_i * PSI_i)
        ,mx_real = -0.50 * Wx_SQ
        ,mx_imag = z0/k_p
        ,my_real = -0.50 * Wy_SQ
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
            A9 = [ my_real, my_imag - m * z],
            // A9 = A8, //Pump waist is symmetric
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
        Wx_SQ = Wp_SQ * sq(ellipticity),
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
        lambda_p: 775 * con.nm,
        lambda_s: 1550 * con.nm,
        lambda_i: 1550 * 775 * con.nm / ( 1550 -  775 ),
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
        W_sx: 100 * con.um,
        W_sy: 100 * con.um,
        W_ix: 100 * con.um,
        W_iy: 100 * con.um,
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
        autocalfocus: true,
        z0s: -2000/2 * con.um,
        deff: 1 * con.pm,
        Pav: 1e-3

        // z0: 2000/2 * con.um
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

            this.auto_calc_collection_focus();

            // Set the positions of the signal, idler, pump waists
            this.z0p = 0 *con.um;
            this.z0s = -1*this.L/2;
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

        auto_calc_collection_focus : function (){
            this.lambda_i = 1/(1/this.lambda_p - 1/this.lambda_s);
            var props = this;
            props.update_all_angles();

            var bw = 0.01
                    ,ls_start = this.lambda_s - this.lambda_s *bw
                    ,ls_stop = this.lambda_s + this.lambda_s *bw
                    ,li_start = this.lambda_i - this.lambda_i *bw
                    ,li_stop = this.lambda_i + this.lambda_i *bw
                    ,dim = 10
                    ,lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim)
                    ,lambda_i = PhaseMatch.linspace(li_start, li_stop, dim)
                    ,n = 20
                    ;

            props.nslices = 10;

            var max_coinc = function(focus){
                if (focus >0 || focus< -1*this.L){return 1e12;}

                props.z0s = focus;
                props.z0i = focus;
                    //PhaseMatch.calc_heralding_plot_focus_position_p = function calc_heralding_plot_focus_position_p(props, WsRange, ls_start, ls_stop, li_start, li_stop, n){
                // var eff = [1];
                // var eff = PhaseMatch.calc_heralding_plot_focus_position_p(props, [focus], ls_start, ls_stop, li_start, li_stop, n);
                var JSI_coinc = PhaseMatch.calc_JSI_p(props, lambda_s, lambda_i, dim, 1);
                var coinc = PhaseMatch.Sum(JSI_coinc);
                // console.log(coinc, focus*1e6);
                return (1/(coinc+1));
            };

            var guess = -this.L/2;
            var startTime = new Date();
            // props.z0s = guess;
            // props.z0i = guess;
            var ans = PhaseMatch.nelderMead(max_coinc, guess, 10);

            // Run again wiht better initial conditions based on previous optimization
            ans = PhaseMatch.nelderMead(max_coinc, ans, 20);
            var endTime = new Date();


            var timeDiff = (endTime - startTime)/1000;

            this.z0s = ans;
            this.z0i = this.z0s;

            // console.log("New focus Position:", ans*1e6, this.z0s * 1e6);
            // // console.log("Theta autocalc = ", timeDiff, ans);
            // // props.theta = ans;
            // // console.log("After autocalc: ", props.theta_i * 180/Math.PI);
            // props.update_all_angles(props);

            // // props.calcfibercoupling = fiber;
            // // calculate the walkoff angle
            // this.calc_walkoff_angles();
            // // console.log("Walkoff:", this.walkoff_p*180/Math.PI);
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

        get_rates_constant : function (){
            var bw_pump = 2*Math.PI*con.c*(1/(this.lambda_p-this.p_bw/2) - 1/(this.lambda_p+this.p_bw/2))*Math.sqrt(2)/(2*Math.sqrt(Math.log(2)));
            var N_num = Math.pow(2, 1.5) * Math.pow(this.deff, 2) * Math.pow(this.L,2) * this.Pav;
            var N_den = Math.pow(Math.PI, .5) * con.e0 * Math.pow(con.c,3) * bw_pump;
            var N = N_num/N_den;
            console.log(N, N_num, Math.pow(this.deff, 2) * Math.pow(this.L,2), this.L, this.Pav);
            return (N);
        },

        set_zint : function (){
            var zslice = 100e-6 * Math.pow(this.L/2500e-6, 0.5);

            if (zslice < 100e-6){
                zslice = 100e-6;
            }

            if (zslice > 500e-6){
                zslice = 500e-6;
            }
            // if (this.L < 5000e-6){
            //     zslice = 100e-6;
            // }
            // if ((this.L > 5000e-6)&&(this.L < 15000e-6)){
            //     zslice = 150e-6
            // }
            // else{
            //     zslice = 300e-6
            // }
            // var zslice = 300e-6; //length of each crystal slice
            var nslices = Math.round(this.L/zslice);
            if (nslices < 4){
                nslices = 4;
            }

            // console.log(nslices);
            //console.log("number slices");
            // if (nslices>30){
            //     nslices = 30;
            // }
            // nslices =nslices*1;
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
            //console.log(nslices);
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

            var self = this;

            if ( typeof name === 'object' ){

                PhaseMatch.util.each( name, function(val, name){self.set(name, val);} );
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

                    if (name === 'z0s'){
                        // Match the idler waist position to that of the signal
                        // this.z0s = val - this.L;
                        this.z0i = val;
                    }

                    this[ name ] = val;


                    if (name === 'apodization' || name === 'apodization_FWHM' || name === 'L'){//} || name = 'calc_apodization')){
                        if (isNaN(this["apodization"]) || isNaN(this["apodization_FWHM"])  || isNaN(this["L"])){
                            return;
                        }
                        this.set_apodization_L();
                        this.set_apodization_coeff();
                    }

                    if (name === "L"){
                        this.set_zint();
                    }



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

// Calculate and return the coincidence rate 
PhaseMatch.calc_JSI_rates_p = function calc_JSI_rates_p(props, lambda_s, lambda_i, dim, norm){
    var N = lambda_s.length * (lambda_i.length);
    var JSI = new Float64Array( N );
    var JSA = PhaseMatch.calc_JSA_p(props, lambda_s,lambda_i, dim, 1);
    var dw_s = (lambda_s[lambda_s.length-1] - lambda_s[0])/lambda_s.length;
    var dw_i = (lambda_i[lambda_i.length-1] - lambda_i[0])/lambda_i.length;

    var Ws_SQ = Math.pow(props.W_sx,2) 
        ,PHI_s = 1/Math.cos(props.theta_s_e)
        ,PHI_i = 1/Math.cos(props.theta_i_e)
        ,con = PhaseMatch.constants
        ,twoPIc = 2*Math.PI*con.c
        ,omega_s = twoPIc / (props.lambda_s )
        ,omega_i = twoPIc / (props.lambda_i )
        // ,pumpScale = Math.pow(props.W,2) // May need to later include the ellipticity parameter
        ,scale = (sq(props.W_sx) * PHI_s * sq(props.W_ix) * PHI_i * sq(props.W))
        ,inv_lambda_s_sq = 0
        ,inv_lambda_i_sq = 0
        ,dlambda_s = Math.abs(lambda_s[lambda_s.length-1] - lambda_s[0])/lambda_s.length
        ,dlambda_i = Math.abs(lambda_i[lambda_i.length-1] - lambda_i[0])/lambda_i.length
        ,norm_sum_s = twoPIc * dlambda_s
        ,norm_sum_i = twoPIc * dlambda_i
        ,lomega = omega_s * omega_i /sq(props.n_s*props.n_i)
        ,norm_const = props.get_rates_constant();
        ;
        ;

    // for (var l = 0; l<lambda_s.length; l++){
    //     inv_lambda_s_sq += 1/sq(lambda_s[l]);
    // }

    // for (var k = 0; k<lambda_i.length; k++){
    //     inv_lambda_i_sq += 1/sq(lambda_i[k]);
    // }

    var d_omega_s = norm_sum_s /sq(props.lambda_s);
    var d_omega_i = norm_sum_i /sq(props.lambda_i);

    // var d_omega_s = 1;
    // var d_omega_i = 1;

    for (var i=0; i<N; i++){

        JSI[i] = (sq(JSA[0][i]) + sq(JSA[1][i]))*norm_const*scale*(d_omega_s*d_omega_i)*lomega;
    }

    // And now we have the scaling.



    return JSI;

};


////////////////////
//CURRENT
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

    // var dOmega_s = new Float64Array( lambda_s.length );
    // var dOmega_i = new Float64Array( lambda_i.length );


    var maxpm = 0;

    var  Ws_SQ = Math.pow(P.W_sx,2)
        ,Wi_SQ = Math.pow(P.W_ix,2) 
        ,PHI_s = 1/Math.cos(P.theta_s_e)
        ,PHI_i = 1/Math.cos(P.theta_i_e)
        ,con = PhaseMatch.constants
        ,twoPIc = 2*Math.PI*con.c
        ,omega_s = twoPIc / (P.lambda_s )
        ,omega_i = twoPIc / (P.lambda_i )
        ,pumpScale = Math.pow(P.W,2) // May need to later include the ellipticity parameter
        ,scale_s = 1/(Ws_SQ * PHI_s *pumpScale)
        ,scale_i =1/(Wi_SQ * PHI_i * pumpScale) //assume symmetric coupling geometry
        ,dlambda_s = Math.abs(lambda_s[lambda_s.length-1] - lambda_s[0])/lambda_s.length
        ,dlambda_i = Math.abs(lambda_i[lambda_i.length-1] - lambda_i[0])/lambda_i.length
        ,norm_sum_s = twoPIc * dlambda_s
        ,norm_sum_i = twoPIc * dlambda_i
        ,lomega = omega_s * omega_i /sq(props.n_s*props.n_i)
        ,norm_const = props.get_rates_constant();
        ;

    // calculate normalization
    // var PMN = PhaseMatch.phasematch(P);
    // var norm = Math.sqrt(sq(PMN[0]) + sq(PMN[1]));


    
    // var lomega = omega_s * omega_i /sq(props.n_s*props.n_i);

    // dOmega_s = lomega*(twoPIc*Math.abs(1/lambda_s[0] - 1/lambda_s[lambda_s.length-1])/lambda_s.length);
    // dOmega_i = lomega* (twoPIc*Math.abs(1/lambda_i[0] - 1/lambda_i[lambda_i.length-1])/lambda_i.length);

    for (var j=0; j<lambda_i.length; j++){
        for (i=0; i<lambda_s.length; i++){
            var index_s = i;
            var index_i = j;

            P.lambda_s = lambda_s[index_s];
            P.lambda_i = lambda_i[index_i];

            dOmega_s = norm_sum_s / sq(lambda_s[index_s]);
            dOmega_i = norm_sum_i / sq(lambda_i[index_i]);
            // var dOmega_s = 1.;
            // var dOmega_i = 1.;
            // lomega = 1;


            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

            // var P_i = P.clone();
            var PM = PhaseMatch.phasematch_singles(P);
            PMreal_s[i + lambda_s.length*j] = ( PM[0]  /norm ) ;
            PMimag_s[i + lambda_s.length*j] = ( PM[1]  /norm ) ;
            PMmag_s[i + lambda_s.length*j] = (Math.sqrt(sq(PMreal_s[i + lambda_s.length*j]) + sq(PMimag_s[i + lambda_s.length*j])))* norm_const  *(dOmega_s * dOmega_i) *lomega /scale_s;

            // Now calculate the Idler JSI
            // The role of the signal and idler get swapped in the calculation
            // but the signal and idler wavelengths and other properties stay the same
            // so there is no need to transpose the PMmag_i array.
            P.swap_signal_idler();
            var PM_i = PhaseMatch.phasematch_singles(P);
            P.swap_signal_idler();
            PMreal_i[i + lambda_s.length*j] = ( PM_i[0] /norm );
            PMimag_i[i + lambda_s.length*j] = ( PM_i[1] /norm );
            PMmag_i[i + lambda_s.length*j] = (Math.sqrt(sq(PMreal_i[i + lambda_s.length*j]) + sq(PMimag_i[i + lambda_s.length*j]))) * norm_const * (dOmega_s * dOmega_i) *lomega /scale_i;


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


////////////
//CURRENT
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

        // Now, since the calculation is done in terms of omega_s, omega_i, need to figure out 
        // step size of the Riemman sum.

        // for (var i=0; i<lambda_s.length, i++){

        // }
        // var dw_s = (lambda_s[lambda_s.length-1] - lambda_s[0])/lambda_s.length;
        // var dw_i = (lambda_i[lambda_i.length-1] - lambda_i[0])/lambda_i.length;
        // console.log(PhaseMatch.Sum(JSI_singles[0]).toString());
        return [PhaseMatch.Sum(JSI_singles[0]), PhaseMatch.Sum(JSI_singles[1])];
    }

    function calc_coinc_rate( ){
        
        // var JSI_coinc = PhaseMatch.calc_JSI_p(P, lambda_s,lambda_i, dim, 1);
        var JSI_coinc = PhaseMatch.calc_JSI_rates_p(P, lambda_s,lambda_i, dim, 1);
        
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
