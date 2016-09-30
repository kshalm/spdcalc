(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["PhaseMatch"] = factory();
	else
		root["PhaseMatch"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
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

	__webpack_require__(155);
	module.exports = __webpack_require__(54);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(3)
	  , core      = __webpack_require__(25)
	  , hide      = __webpack_require__(13)
	  , redefine  = __webpack_require__(14)
	  , ctx       = __webpack_require__(26)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
	    , key, own, out, exp;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    // export native or passed
	    out = (own ? target : source)[key];
	    // bind timers to global for call from export context
	    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // extend global
	    if(target)redefine(target, key, out, type & $export.U);
	    // export
	    if(exports[key] != out)hide(exports, key, exp);
	    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
	  }
	};
	global.core = core;
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(5);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(64)('wks')
	  , uid        = __webpack_require__(41)
	  , Symbol     = __webpack_require__(3).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(4)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(2)
	  , IE8_DOM_DEFINE = __webpack_require__(115)
	  , toPrimitive    = __webpack_require__(24)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(7) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(32)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(20);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(8)
	  , createDesc = __webpack_require__(31);
	module.exports = __webpack_require__(7) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(3)
	  , hide      = __webpack_require__(13)
	  , has       = __webpack_require__(11)
	  , SRC       = __webpack_require__(41)('src')
	  , TO_STRING = 'toString'
	  , $toString = Function[TO_STRING]
	  , TPL       = ('' + $toString).split(TO_STRING);

	__webpack_require__(25).inspectSource = function(it){
	  return $toString.call(it);
	};

	(module.exports = function(O, key, val, safe){
	  var isFunction = typeof val == 'function';
	  if(isFunction)has(val, 'name') || hide(val, 'name', key);
	  if(O[key] === val)return;
	  if(isFunction)has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
	  if(O === global){
	    O[key] = val;
	  } else {
	    if(!safe){
	      delete O[key];
	      hide(O, key, val);
	    } else {
	      if(O[key])O[key] = val;
	      else hide(O, key, val);
	    }
	  }
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, TO_STRING, function toString(){
	  return typeof this == 'function' && this[SRC] || $toString.call(this);
	});

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(1)
	  , fails   = __webpack_require__(4)
	  , defined = __webpack_require__(20)
	  , quot    = /"/g;
	// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
	var createHTML = function(string, tag, attribute, value) {
	  var S  = String(defined(string))
	    , p1 = '<' + tag;
	  if(attribute !== '')p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
	  return p1 + '>' + S + '</' + tag + '>';
	};
	module.exports = function(NAME, exec){
	  var O = {};
	  O[NAME] = exec(createHTML);
	  $export($export.P + $export.F * fails(function(){
	    var test = ''[NAME]('"');
	    return test !== test.toLowerCase() || test.split('"').length > 3;
	  }), 'String', O);
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(50)
	  , defined = __webpack_require__(20);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var pIE            = __webpack_require__(51)
	  , createDesc     = __webpack_require__(31)
	  , toIObject      = __webpack_require__(16)
	  , toPrimitive    = __webpack_require__(24)
	  , has            = __webpack_require__(11)
	  , IE8_DOM_DEFINE = __webpack_require__(115)
	  , gOPD           = Object.getOwnPropertyDescriptor;

	exports.f = __webpack_require__(7) ? gOPD : function getOwnPropertyDescriptor(O, P){
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if(IE8_DOM_DEFINE)try {
	    return gOPD(O, P);
	  } catch(e){ /* empty */ }
	  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(11)
	  , toObject    = __webpack_require__(10)
	  , IE_PROTO    = __webpack_require__(87)('IE_PROTO')
	  , ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var fails = __webpack_require__(4);

	module.exports = function(method, arg){
	  return !!method && fails(function(){
	    arg ? method.call(null, function(){}, 1) : method.call(null);
	  });
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex
	var ctx      = __webpack_require__(26)
	  , IObject  = __webpack_require__(50)
	  , toObject = __webpack_require__(10)
	  , toLength = __webpack_require__(9)
	  , asc      = __webpack_require__(158);
	module.exports = function(TYPE, $create){
	  var IS_MAP        = TYPE == 1
	    , IS_FILTER     = TYPE == 2
	    , IS_SOME       = TYPE == 3
	    , IS_EVERY      = TYPE == 4
	    , IS_FIND_INDEX = TYPE == 6
	    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
	    , create        = $create || asc;
	  return function($this, callbackfn, that){
	    var O      = toObject($this)
	      , self   = IObject(O)
	      , f      = ctx(callbackfn, that, 3)
	      , length = toLength(self.length)
	      , index  = 0
	      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
	      , val, res;
	    for(;length > index; index++)if(NO_HOLES || index in self){
	      val = self[index];
	      res = f(val, index, O);
	      if(TYPE){
	        if(IS_MAP)result[index] = res;            // map
	        else if(res)switch(TYPE){
	          case 3: return true;                    // some
	          case 5: return val;                     // find
	          case 6: return index;                   // findIndex
	          case 2: result.push(val);               // filter
	        } else if(IS_EVERY)return false;          // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(1)
	  , core    = __webpack_require__(25)
	  , fails   = __webpack_require__(4);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(5);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(12);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var Map     = __webpack_require__(131)
	  , $export = __webpack_require__(1)
	  , shared  = __webpack_require__(64)('metadata')
	  , store   = shared.store || (shared.store = new (__webpack_require__(134)));

	var getOrCreateMetadataMap = function(target, targetKey, create){
	  var targetMetadata = store.get(target);
	  if(!targetMetadata){
	    if(!create)return undefined;
	    store.set(target, targetMetadata = new Map);
	  }
	  var keyMetadata = targetMetadata.get(targetKey);
	  if(!keyMetadata){
	    if(!create)return undefined;
	    targetMetadata.set(targetKey, keyMetadata = new Map);
	  } return keyMetadata;
	};
	var ordinaryHasOwnMetadata = function(MetadataKey, O, P){
	  var metadataMap = getOrCreateMetadataMap(O, P, false);
	  return metadataMap === undefined ? false : metadataMap.has(MetadataKey);
	};
	var ordinaryGetOwnMetadata = function(MetadataKey, O, P){
	  var metadataMap = getOrCreateMetadataMap(O, P, false);
	  return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
	};
	var ordinaryDefineOwnMetadata = function(MetadataKey, MetadataValue, O, P){
	  getOrCreateMetadataMap(O, P, true).set(MetadataKey, MetadataValue);
	};
	var ordinaryOwnMetadataKeys = function(target, targetKey){
	  var metadataMap = getOrCreateMetadataMap(target, targetKey, false)
	    , keys        = [];
	  if(metadataMap)metadataMap.forEach(function(_, key){ keys.push(key); });
	  return keys;
	};
	var toMetaKey = function(it){
	  return it === undefined || typeof it == 'symbol' ? it : String(it);
	};
	var exp = function(O){
	  $export($export.S, 'Reflect', O);
	};

	module.exports = {
	  store: store,
	  map: getOrCreateMetadataMap,
	  has: ordinaryHasOwnMetadata,
	  get: ordinaryGetOwnMetadata,
	  set: ordinaryDefineOwnMetadata,
	  keys: ordinaryOwnMetadataKeys,
	  key: toMetaKey,
	  exp: exp
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	if(__webpack_require__(7)){
	  var LIBRARY             = __webpack_require__(34)
	    , global              = __webpack_require__(3)
	    , fails               = __webpack_require__(4)
	    , $export             = __webpack_require__(1)
	    , $typed              = __webpack_require__(65)
	    , $buffer             = __webpack_require__(94)
	    , ctx                 = __webpack_require__(26)
	    , anInstance          = __webpack_require__(33)
	    , propertyDesc        = __webpack_require__(31)
	    , hide                = __webpack_require__(13)
	    , redefineAll         = __webpack_require__(38)
	    , toInteger           = __webpack_require__(32)
	    , toLength            = __webpack_require__(9)
	    , toIndex             = __webpack_require__(40)
	    , toPrimitive         = __webpack_require__(24)
	    , has                 = __webpack_require__(11)
	    , same                = __webpack_require__(128)
	    , classof             = __webpack_require__(49)
	    , isObject            = __webpack_require__(5)
	    , toObject            = __webpack_require__(10)
	    , isArrayIter         = __webpack_require__(79)
	    , create              = __webpack_require__(35)
	    , getPrototypeOf      = __webpack_require__(18)
	    , gOPN                = __webpack_require__(36).f
	    , getIterFn           = __webpack_require__(96)
	    , uid                 = __webpack_require__(41)
	    , wks                 = __webpack_require__(6)
	    , createArrayMethod   = __webpack_require__(22)
	    , createArrayIncludes = __webpack_require__(55)
	    , speciesConstructor  = __webpack_require__(88)
	    , ArrayIterators      = __webpack_require__(97)
	    , Iterators           = __webpack_require__(45)
	    , $iterDetect         = __webpack_require__(61)
	    , setSpecies          = __webpack_require__(39)
	    , arrayFill           = __webpack_require__(72)
	    , arrayCopyWithin     = __webpack_require__(108)
	    , $DP                 = __webpack_require__(8)
	    , $GOPD               = __webpack_require__(17)
	    , dP                  = $DP.f
	    , gOPD                = $GOPD.f
	    , RangeError          = global.RangeError
	    , TypeError           = global.TypeError
	    , Uint8Array          = global.Uint8Array
	    , ARRAY_BUFFER        = 'ArrayBuffer'
	    , SHARED_BUFFER       = 'Shared' + ARRAY_BUFFER
	    , BYTES_PER_ELEMENT   = 'BYTES_PER_ELEMENT'
	    , PROTOTYPE           = 'prototype'
	    , ArrayProto          = Array[PROTOTYPE]
	    , $ArrayBuffer        = $buffer.ArrayBuffer
	    , $DataView           = $buffer.DataView
	    , arrayForEach        = createArrayMethod(0)
	    , arrayFilter         = createArrayMethod(2)
	    , arraySome           = createArrayMethod(3)
	    , arrayEvery          = createArrayMethod(4)
	    , arrayFind           = createArrayMethod(5)
	    , arrayFindIndex      = createArrayMethod(6)
	    , arrayIncludes       = createArrayIncludes(true)
	    , arrayIndexOf        = createArrayIncludes(false)
	    , arrayValues         = ArrayIterators.values
	    , arrayKeys           = ArrayIterators.keys
	    , arrayEntries        = ArrayIterators.entries
	    , arrayLastIndexOf    = ArrayProto.lastIndexOf
	    , arrayReduce         = ArrayProto.reduce
	    , arrayReduceRight    = ArrayProto.reduceRight
	    , arrayJoin           = ArrayProto.join
	    , arraySort           = ArrayProto.sort
	    , arraySlice          = ArrayProto.slice
	    , arrayToString       = ArrayProto.toString
	    , arrayToLocaleString = ArrayProto.toLocaleString
	    , ITERATOR            = wks('iterator')
	    , TAG                 = wks('toStringTag')
	    , TYPED_CONSTRUCTOR   = uid('typed_constructor')
	    , DEF_CONSTRUCTOR     = uid('def_constructor')
	    , ALL_CONSTRUCTORS    = $typed.CONSTR
	    , TYPED_ARRAY         = $typed.TYPED
	    , VIEW                = $typed.VIEW
	    , WRONG_LENGTH        = 'Wrong length!';

	  var $map = createArrayMethod(1, function(O, length){
	    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
	  });

	  var LITTLE_ENDIAN = fails(function(){
	    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
	  });

	  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function(){
	    new Uint8Array(1).set({});
	  });

	  var strictToLength = function(it, SAME){
	    if(it === undefined)throw TypeError(WRONG_LENGTH);
	    var number = +it
	      , length = toLength(it);
	    if(SAME && !same(number, length))throw RangeError(WRONG_LENGTH);
	    return length;
	  };

	  var toOffset = function(it, BYTES){
	    var offset = toInteger(it);
	    if(offset < 0 || offset % BYTES)throw RangeError('Wrong offset!');
	    return offset;
	  };

	  var validate = function(it){
	    if(isObject(it) && TYPED_ARRAY in it)return it;
	    throw TypeError(it + ' is not a typed array!');
	  };

	  var allocate = function(C, length){
	    if(!(isObject(C) && TYPED_CONSTRUCTOR in C)){
	      throw TypeError('It is not a typed array constructor!');
	    } return new C(length);
	  };

	  var speciesFromList = function(O, list){
	    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
	  };

	  var fromList = function(C, list){
	    var index  = 0
	      , length = list.length
	      , result = allocate(C, length);
	    while(length > index)result[index] = list[index++];
	    return result;
	  };

	  var addGetter = function(it, key, internal){
	    dP(it, key, {get: function(){ return this._d[internal]; }});
	  };

	  var $from = function from(source /*, mapfn, thisArg */){
	    var O       = toObject(source)
	      , aLen    = arguments.length
	      , mapfn   = aLen > 1 ? arguments[1] : undefined
	      , mapping = mapfn !== undefined
	      , iterFn  = getIterFn(O)
	      , i, length, values, result, step, iterator;
	    if(iterFn != undefined && !isArrayIter(iterFn)){
	      for(iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++){
	        values.push(step.value);
	      } O = values;
	    }
	    if(mapping && aLen > 2)mapfn = ctx(mapfn, arguments[2], 2);
	    for(i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++){
	      result[i] = mapping ? mapfn(O[i], i) : O[i];
	    }
	    return result;
	  };

	  var $of = function of(/*...items*/){
	    var index  = 0
	      , length = arguments.length
	      , result = allocate(this, length);
	    while(length > index)result[index] = arguments[index++];
	    return result;
	  };

	  // iOS Safari 6.x fails here
	  var TO_LOCALE_BUG = !!Uint8Array && fails(function(){ arrayToLocaleString.call(new Uint8Array(1)); });

	  var $toLocaleString = function toLocaleString(){
	    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
	  };

	  var proto = {
	    copyWithin: function copyWithin(target, start /*, end */){
	      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    every: function every(callbackfn /*, thisArg */){
	      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    fill: function fill(value /*, start, end */){ // eslint-disable-line no-unused-vars
	      return arrayFill.apply(validate(this), arguments);
	    },
	    filter: function filter(callbackfn /*, thisArg */){
	      return speciesFromList(this, arrayFilter(validate(this), callbackfn,
	        arguments.length > 1 ? arguments[1] : undefined));
	    },
	    find: function find(predicate /*, thisArg */){
	      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    findIndex: function findIndex(predicate /*, thisArg */){
	      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    forEach: function forEach(callbackfn /*, thisArg */){
	      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    indexOf: function indexOf(searchElement /*, fromIndex */){
	      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    includes: function includes(searchElement /*, fromIndex */){
	      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    join: function join(separator){ // eslint-disable-line no-unused-vars
	      return arrayJoin.apply(validate(this), arguments);
	    },
	    lastIndexOf: function lastIndexOf(searchElement /*, fromIndex */){ // eslint-disable-line no-unused-vars
	      return arrayLastIndexOf.apply(validate(this), arguments);
	    },
	    map: function map(mapfn /*, thisArg */){
	      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    reduce: function reduce(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
	      return arrayReduce.apply(validate(this), arguments);
	    },
	    reduceRight: function reduceRight(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
	      return arrayReduceRight.apply(validate(this), arguments);
	    },
	    reverse: function reverse(){
	      var that   = this
	        , length = validate(that).length
	        , middle = Math.floor(length / 2)
	        , index  = 0
	        , value;
	      while(index < middle){
	        value         = that[index];
	        that[index++] = that[--length];
	        that[length]  = value;
	      } return that;
	    },
	    some: function some(callbackfn /*, thisArg */){
	      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    sort: function sort(comparefn){
	      return arraySort.call(validate(this), comparefn);
	    },
	    subarray: function subarray(begin, end){
	      var O      = validate(this)
	        , length = O.length
	        , $begin = toIndex(begin, length);
	      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
	        O.buffer,
	        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
	        toLength((end === undefined ? length : toIndex(end, length)) - $begin)
	      );
	    }
	  };

	  var $slice = function slice(start, end){
	    return speciesFromList(this, arraySlice.call(validate(this), start, end));
	  };

	  var $set = function set(arrayLike /*, offset */){
	    validate(this);
	    var offset = toOffset(arguments[1], 1)
	      , length = this.length
	      , src    = toObject(arrayLike)
	      , len    = toLength(src.length)
	      , index  = 0;
	    if(len + offset > length)throw RangeError(WRONG_LENGTH);
	    while(index < len)this[offset + index] = src[index++];
	  };

	  var $iterators = {
	    entries: function entries(){
	      return arrayEntries.call(validate(this));
	    },
	    keys: function keys(){
	      return arrayKeys.call(validate(this));
	    },
	    values: function values(){
	      return arrayValues.call(validate(this));
	    }
	  };

	  var isTAIndex = function(target, key){
	    return isObject(target)
	      && target[TYPED_ARRAY]
	      && typeof key != 'symbol'
	      && key in target
	      && String(+key) == String(key);
	  };
	  var $getDesc = function getOwnPropertyDescriptor(target, key){
	    return isTAIndex(target, key = toPrimitive(key, true))
	      ? propertyDesc(2, target[key])
	      : gOPD(target, key);
	  };
	  var $setDesc = function defineProperty(target, key, desc){
	    if(isTAIndex(target, key = toPrimitive(key, true))
	      && isObject(desc)
	      && has(desc, 'value')
	      && !has(desc, 'get')
	      && !has(desc, 'set')
	      // TODO: add validation descriptor w/o calling accessors
	      && !desc.configurable
	      && (!has(desc, 'writable') || desc.writable)
	      && (!has(desc, 'enumerable') || desc.enumerable)
	    ){
	      target[key] = desc.value;
	      return target;
	    } else return dP(target, key, desc);
	  };

	  if(!ALL_CONSTRUCTORS){
	    $GOPD.f = $getDesc;
	    $DP.f   = $setDesc;
	  }

	  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
	    getOwnPropertyDescriptor: $getDesc,
	    defineProperty:           $setDesc
	  });

	  if(fails(function(){ arrayToString.call({}); })){
	    arrayToString = arrayToLocaleString = function toString(){
	      return arrayJoin.call(this);
	    }
	  }

	  var $TypedArrayPrototype$ = redefineAll({}, proto);
	  redefineAll($TypedArrayPrototype$, $iterators);
	  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
	  redefineAll($TypedArrayPrototype$, {
	    slice:          $slice,
	    set:            $set,
	    constructor:    function(){ /* noop */ },
	    toString:       arrayToString,
	    toLocaleString: $toLocaleString
	  });
	  addGetter($TypedArrayPrototype$, 'buffer', 'b');
	  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
	  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
	  addGetter($TypedArrayPrototype$, 'length', 'e');
	  dP($TypedArrayPrototype$, TAG, {
	    get: function(){ return this[TYPED_ARRAY]; }
	  });

	  module.exports = function(KEY, BYTES, wrapper, CLAMPED){
	    CLAMPED = !!CLAMPED;
	    var NAME       = KEY + (CLAMPED ? 'Clamped' : '') + 'Array'
	      , ISNT_UINT8 = NAME != 'Uint8Array'
	      , GETTER     = 'get' + KEY
	      , SETTER     = 'set' + KEY
	      , TypedArray = global[NAME]
	      , Base       = TypedArray || {}
	      , TAC        = TypedArray && getPrototypeOf(TypedArray)
	      , FORCED     = !TypedArray || !$typed.ABV
	      , O          = {}
	      , TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
	    var getter = function(that, index){
	      var data = that._d;
	      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
	    };
	    var setter = function(that, index, value){
	      var data = that._d;
	      if(CLAMPED)value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
	      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
	    };
	    var addElement = function(that, index){
	      dP(that, index, {
	        get: function(){
	          return getter(this, index);
	        },
	        set: function(value){
	          return setter(this, index, value);
	        },
	        enumerable: true
	      });
	    };
	    if(FORCED){
	      TypedArray = wrapper(function(that, data, $offset, $length){
	        anInstance(that, TypedArray, NAME, '_d');
	        var index  = 0
	          , offset = 0
	          , buffer, byteLength, length, klass;
	        if(!isObject(data)){
	          length     = strictToLength(data, true)
	          byteLength = length * BYTES;
	          buffer     = new $ArrayBuffer(byteLength);
	        } else if(data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER){
	          buffer = data;
	          offset = toOffset($offset, BYTES);
	          var $len = data.byteLength;
	          if($length === undefined){
	            if($len % BYTES)throw RangeError(WRONG_LENGTH);
	            byteLength = $len - offset;
	            if(byteLength < 0)throw RangeError(WRONG_LENGTH);
	          } else {
	            byteLength = toLength($length) * BYTES;
	            if(byteLength + offset > $len)throw RangeError(WRONG_LENGTH);
	          }
	          length = byteLength / BYTES;
	        } else if(TYPED_ARRAY in data){
	          return fromList(TypedArray, data);
	        } else {
	          return $from.call(TypedArray, data);
	        }
	        hide(that, '_d', {
	          b: buffer,
	          o: offset,
	          l: byteLength,
	          e: length,
	          v: new $DataView(buffer)
	        });
	        while(index < length)addElement(that, index++);
	      });
	      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
	      hide(TypedArrayPrototype, 'constructor', TypedArray);
	    } else if(!$iterDetect(function(iter){
	      // V8 works with iterators, but fails in many other cases
	      // https://code.google.com/p/v8/issues/detail?id=4552
	      new TypedArray(null); // eslint-disable-line no-new
	      new TypedArray(iter); // eslint-disable-line no-new
	    }, true)){
	      TypedArray = wrapper(function(that, data, $offset, $length){
	        anInstance(that, TypedArray, NAME);
	        var klass;
	        // `ws` module bug, temporarily remove validation length for Uint8Array
	        // https://github.com/websockets/ws/pull/645
	        if(!isObject(data))return new Base(strictToLength(data, ISNT_UINT8));
	        if(data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER){
	          return $length !== undefined
	            ? new Base(data, toOffset($offset, BYTES), $length)
	            : $offset !== undefined
	              ? new Base(data, toOffset($offset, BYTES))
	              : new Base(data);
	        }
	        if(TYPED_ARRAY in data)return fromList(TypedArray, data);
	        return $from.call(TypedArray, data);
	      });
	      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function(key){
	        if(!(key in TypedArray))hide(TypedArray, key, Base[key]);
	      });
	      TypedArray[PROTOTYPE] = TypedArrayPrototype;
	      if(!LIBRARY)TypedArrayPrototype.constructor = TypedArray;
	    }
	    var $nativeIterator   = TypedArrayPrototype[ITERATOR]
	      , CORRECT_ITER_NAME = !!$nativeIterator && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined)
	      , $iterator         = $iterators.values;
	    hide(TypedArray, TYPED_CONSTRUCTOR, true);
	    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
	    hide(TypedArrayPrototype, VIEW, true);
	    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

	    if(CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)){
	      dP(TypedArrayPrototype, TAG, {
	        get: function(){ return NAME; }
	      });
	    }

	    O[NAME] = TypedArray;

	    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

	    $export($export.S, NAME, {
	      BYTES_PER_ELEMENT: BYTES,
	      from: $from,
	      of: $of
	    });

	    if(!(BYTES_PER_ELEMENT in TypedArrayPrototype))hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

	    $export($export.P, NAME, proto);

	    setSpecies(NAME);

	    $export($export.P + $export.F * FORCED_SET, NAME, {set: $set});

	    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

	    $export($export.P + $export.F * (TypedArrayPrototype.toString != arrayToString), NAME, {toString: arrayToString});

	    $export($export.P + $export.F * fails(function(){
	      new TypedArray(1).slice();
	    }), NAME, {slice: $slice});

	    $export($export.P + $export.F * (fails(function(){
	      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString()
	    }) || !fails(function(){
	      TypedArrayPrototype.toLocaleString.call([1, 2]);
	    })), NAME, {toLocaleString: $toLocaleString});

	    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
	    if(!LIBRARY && !CORRECT_ITER_NAME)hide(TypedArrayPrototype, ITERATOR, $iterator);
	  };
	} else module.exports = function(){ /* empty */ };

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var freeGlobal = __webpack_require__(376);

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	module.exports = root;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var META     = __webpack_require__(41)('meta')
	  , isObject = __webpack_require__(5)
	  , has      = __webpack_require__(11)
	  , setDesc  = __webpack_require__(8).f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !__webpack_require__(4)(function(){
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function(it){
	  setDesc(it, META, {value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  }});
	};
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add metadata
	    if(!create)return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function(it, create){
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return true;
	    // not necessary to add metadata
	    if(!create)return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function(it){
	  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY:      META,
	  NEED:     false,
	  fastKey:  fastKey,
	  getWeak:  getWeak,
	  onFreeze: onFreeze
	};

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 32 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name, forbiddenField){
	  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

/***/ },
/* 34 */
/***/ function(module, exports) {

	module.exports = false;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(2)
	  , dPs         = __webpack_require__(121)
	  , enumBugKeys = __webpack_require__(75)
	  , IE_PROTO    = __webpack_require__(87)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(74)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(77).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};

	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys      = __webpack_require__(123)
	  , hiddenKeys = __webpack_require__(75).concat('length', 'prototype');

	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return $keys(O, hiddenKeys);
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(123)
	  , enumBugKeys = __webpack_require__(75);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var redefine = __webpack_require__(14);
	module.exports = function(target, src, safe){
	  for(var key in src)redefine(target, key, src[key], safe);
	  return target;
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global      = __webpack_require__(3)
	  , dP          = __webpack_require__(8)
	  , DESCRIPTORS = __webpack_require__(7)
	  , SPECIES     = __webpack_require__(6)('species');

	module.exports = function(KEY){
	  var C = global[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(32)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsNative = __webpack_require__(357),
	    getValue = __webpack_require__(380);

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

	module.exports = getNative;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// 22.1.3.31 Array.prototype[@@unscopables]
	var UNSCOPABLES = __webpack_require__(6)('unscopables')
	  , ArrayProto  = Array.prototype;
	if(ArrayProto[UNSCOPABLES] == undefined)__webpack_require__(13)(ArrayProto, UNSCOPABLES, {});
	module.exports = function(key){
	  ArrayProto[UNSCOPABLES][key] = true;
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(26)
	  , call        = __webpack_require__(117)
	  , isArrayIter = __webpack_require__(79)
	  , anObject    = __webpack_require__(2)
	  , toLength    = __webpack_require__(9)
	  , getIterFn   = __webpack_require__(96)
	  , BREAK       = {}
	  , RETURN      = {};
	var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
	  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator, result;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if(result === BREAK || result === RETURN)return result;
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    result = call(iterator, f, step.value, entries);
	    if(result === BREAK || result === RETURN)return result;
	  }
	};
	exports.BREAK  = BREAK;
	exports.RETURN = RETURN;

/***/ },
/* 45 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(8).f
	  , has = __webpack_require__(11)
	  , TAG = __webpack_require__(6)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(1)
	  , defined = __webpack_require__(20)
	  , fails   = __webpack_require__(4)
	  , spaces  = __webpack_require__(92)
	  , space   = '[' + spaces + ']'
	  , non     = '\u200b\u0085'
	  , ltrim   = RegExp('^' + space + space + '*')
	  , rtrim   = RegExp(space + space + '*$');

	var exporter = function(KEY, exec, ALIAS){
	  var exp   = {};
	  var FORCE = fails(function(){
	    return !!spaces[KEY]() || non[KEY]() != non;
	  });
	  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
	  if(ALIAS)exp[ALIAS] = fn;
	  $export($export.P + $export.F * FORCE, 'String', exp);
	};

	// 1 -> String#trimLeft
	// 2 -> String#trimRight
	// 3 -> String#trim
	var trim = exporter.trim = function(string, TYPE){
	  string = String(defined(string));
	  if(TYPE & 1)string = string.replace(ltrim, '');
	  if(TYPE & 2)string = string.replace(rtrim, '');
	  return string;
	};

	module.exports = exporter;

/***/ },
/* 48 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * General internal math helper functions
	 */
	var helpers = {};

	var sq = helpers.sq = function sq(x) {
	    return x * x;
	    // return Math.pow(x,2);
	};

	/*
	 * A series of helper functions
	 */
	helpers.Sum = function Sum(A) {
	    var total = 0;
	    var l = A.length;
	    for (var i = 0; i < l; i++) {
	        total += A[i];
	    }
	    return total;
	};

	/*
	 * Reverses a typed array
	 */
	helpers.reverse = function reverse(A) {
	    var rev = new Float64Array(A.length);
	    var l = A.length;
	    for (var i = 0; i < l; i++) {
	        rev[i] = A[l - 1 - i];
	    }
	    return rev;
	};

	/* Note:
	    Use: Math.max.apply(null, [1,5,2,7,8])
	    instead of creating your own
	 */

	helpers.Transpose = function Transpose(A, dim) {
	    var Trans = new Float64Array(dim * dim);
	    var l = A.length;
	    for (var i = 0; i < l; i++) {
	        var index_c = i % dim;
	        var index_r = Math.floor(i / dim);
	        //swap rows with columns
	        Trans[index_c * dim + index_r] = A[i];
	    }
	    return Trans;
	};

	helpers.AntiTranspose = function Transpose(A, dim) {
	    var Trans = new Float64Array(dim * dim);
	    var l = A.length;
	    for (var i = 0; i < l; i++) {
	        var index_c = i % dim;
	        var index_r = Math.floor(i / dim);
	        //swap rows with columns
	        Trans[(dim - 1 - index_c) * dim + (dim - 1 - index_r)] = A[i];
	    }
	    return Trans;
	};

	helpers.linspace = function linspace(xstart, xstop, npts) {
	    var A = new Float64Array(npts);
	    var diff = (xstop - xstart) / (npts - 1);
	    var curVal = 0;
	    for (var i = 0; i < npts; i++) {
	        A[i] = xstart + i * diff;
	    }
	    return A;
	};

	helpers.create_2d_array = function create_2d_array(data, dimx, dimy) {
	    var data2D = [];
	    var index = 0;

	    for (var i = 0; i < dimy; i++) {
	        var row = new Float64Array(dimx);
	        for (var j = 0; j < dimx; j++) {
	            row[j] = data[index];
	            index += 1;
	        }
	        data2D[i] = row;
	    }
	    return data2D;
	};

	helpers.create_2d_array_view = function create_2d_array_view(data, dimx, dimy) {
	    var data2D = [];

	    if (data.buffer && data.buffer.byteLength) {

	        for (var i = 0; i < dimy; i++) {

	            data2D[i] = new Float64Array(data.buffer, i * 16, dimx);
	        }
	    } else {

	        return null;
	    }

	    return data2D;
	};

	helpers.zeros = function zeros(dimx, dimy) {
	    var data2D = [];
	    var index = 0;

	    for (var i = 0; i < dimy; i++) {
	        var row = new Float64Array(dimx);
	        for (var j = 0; j < dimx; j++) {
	            row[j] = 0;
	        }
	        data2D[i] = row;
	    }
	    return data2D;
	};

	/*
	 * Takes an array and normalizes it using the max value in the array.
	 */
	helpers.normalize = function normalize(data) {
	    var maxval = Math.max.apply(null, data);
	    var n = data.length;

	    for (var i = 0; i < n; i++) {
	        data[i] = data[i] / maxval;
	    }
	    return data;
	};

	/*
	 * Takes an array and normalizes it to a given value.
	 */
	helpers.normalizeToVal = function normalizeToVal(data, maxval) {
	    // var maxval = Math.max.apply(null,data);
	    var n = data.length;

	    for (var i = 0; i < n; i++) {
	        data[i] = data[i] / maxval;
	    }
	    return data;
	};

	/*
	 * Faster method for finding the max from an array
	 */
	helpers.max = function max(data) {
	    var counter = data.length,
	        maxd = -1 * Infinity,
	        member;

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
	helpers.NintegrateWeights = function NintegrateWeights(n) {
	    var weights = new Array(n + 1);
	    weights[0] = 1;
	    weights[n] = 1;
	    for (var i = 1; i < n; i++) {
	        if (i % 2 === 0) {
	            //even case
	            weights[i] = 2;
	        } else {
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
	helpers.Nintegrate2arg = function Nintegrate2arg(f, a, b, dx, n, w) {
	    // we remove the check of n being even for speed. Be careful to only
	    // input n that are even.

	    dx = (b - a) / n;
	    var result_real = 0;
	    var result_imag = 0;

	    for (var j = 0; j < n + 1; j++) {
	        var feval = f(a + j * dx); // f must return two element array
	        result_real += feval[0] * w[j];
	        result_imag += feval[1] * w[j];
	    }

	    return [result_real * dx / 3, result_imag * dx / 3];
	};

	/*
	Perform a numerical 1D integration using Simpson's rule.

	f(x) is the function to be evaluated
	a,b are the x start and stop points of the range

	The 1D simpson's integrator has weights that are of the form
	(1 4 2 4 ... 2 4 1)
	 */
	helpers.Nintegrate = function Nintegrate(f, a, b, n) {
	    if (n % 2 !== 0) {
	        n = n + 1; //guarantee that n is even
	    }

	    var weights = new Array(n + 1);
	    weights[0] = 1;
	    weights[n] = 1;
	    for (var i = 1; i < n; i++) {
	        if (i % 2 === 0) {
	            //even case
	            weights[i] = 2;
	        } else {
	            weights[i] = 4;
	        }
	    }

	    // if (n<50){
	    //     console.log(weights);
	    // }

	    var dx = (b - a) / n;
	    var result = 0;

	    for (var j = 0; j < n + 1; j++) {
	        result += f(a + j * dx) * weights[j];
	    }

	    return result * dx / 3;
	};

	/*
	Perform a numerical 2D integration using Simpson's rule.
	Calculate the array of weights for Simpson's rule.
	 */
	helpers.Nintegrate2DWeights = function Nintegrate2DWeights(n) {

	    if (n % 2 !== 0) {
	        n = n + 1; //guarantee that n is even
	    }

	    var weights = new Array(n + 1);
	    weights[0] = 1;
	    weights[n] = 1;
	    for (var i = 1; i < n; i++) {
	        if (i % 2 === 0) {
	            //even case
	            weights[i] = 2;
	        } else {
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
	helpers.Nintegrate2D = function Nintegrate2D(f, a, b, c, d, n, w) {
	    var weights;

	    if (n % 2 !== 0) {
	        n = n + 1; //guarantee that n is even
	    }

	    if (w === null || w === undefined) {
	        weights = new Array(n + 1);
	        weights[0] = 1;
	        weights[n] = 1;
	        for (var i = 1; i < n; i++) {
	            if (i % 2 === 0) {
	                //even case
	                weights[i] = 2;
	            } else {
	                weights[i] = 4;
	            }
	        }
	    } else {
	        weights = w;
	    }

	    // if (n<50){
	    //     console.log(weights);
	    // }

	    var dx = (b - a) / n;
	    var dy = (d - c) / n;
	    var result = 0;

	    for (var j = 0; j < n + 1; j++) {
	        for (var k = 0; k < n + 1; k++) {
	            result += f(a + j * dx, c + k * dy) * weights[j] * weights[k];
	        }
	    }

	    return result * dx * dy / 9;
	};

	/*
	 * Special version of Simpsons 2D integral for use with the mode solver.
	 * Accepts a function that returns two arguments. Integrates thses two results
	 * separately. For speed, we strip out the weights code and assume it is provided.
	 */

	helpers.Nintegrate2DModeSolver = function Nintegrate2DModeSolver(f, a, b, c, d, n, w) {

	    var weights = w;

	    var dx = (b - a) / n;
	    var dy = (d - c) / n;
	    var result1 = 0;
	    var result2 = 0;
	    var result = 0;

	    for (var j = 0; j < n + 1; j++) {
	        for (var k = 0; k < n + 1; k++) {
	            // console.log(f(a +j*dx, c+k*dy)*weights[k] );
	            result = f(a + j * dx, c + k * dy);
	            result1 += result[0] * weights[j] * weights[k];
	            result2 += result[1] * weights[j] * weights[k];
	        }
	    }

	    return [result1 * dx * dy / 9, result2 * dx * dy / 9];
	};

	/*
	Calculate the array of weights for Simpson's 3/8 rule.
	 */
	helpers.Nintegrate2DWeights_3_8 = function Nintegrate2DWeights_3_8(n) {
	    // if (n%3 !== 0){
	    //     n = n+n%3; //guarantee that n is divisible by 3
	    // }

	    // n = n+(3- n%3) -3; //guarantee that n is divisible by 3

	    // console.log(n);

	    var weights = new Array(n + 1);
	    weights[0] = 1;
	    weights[n + 1] = 1;
	    for (var i = 1; i < n + 1; i++) {
	        if (i % 3 === 0) {
	            weights[i] = 2;
	        } else {
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
	helpers.Nintegrate2D_3_8 = function Nintegrate2D_3_8(f, a, b, c, d, n, w) {
	    var weights;
	    // n = n+(3- n%3); //guarantee that n is divisible by 3

	    if (w === null || w === undefined) {
	        weights = helpers.Nintegrate2DWeights_3_8(n);
	    } else {
	        weights = w;
	    }

	    if (n < 50) {
	        // console.log(weights);
	    }

	    var dx = (b - a) / n;
	    var dy = (d - c) / n;
	    var result = 0;

	    for (var j = 0; j < n + 2; j++) {
	        for (var k = 0; k < n + 2; k++) {
	            // console.log("inside Simpsons. J: " +j.toString() + ", k:" + k.toString() + ", result:" +result.toString());
	            result += f(a + j * dx, c + k * dy) * weights[j] * weights[k];
	        }
	    }

	    return result * dx * dy * 9 / 64;
	};

	/*
	A modification of Simpson's 2-Dimensional 3/8th's rule for the double integral
	over length that must be done in the singles caluclation. A custom function is
	being written to greatly speed up the calculation. The return is the real and
	imaginary parts. Make sure N is divisible by 3.
	*/
	helpers.Nintegrate2D_3_8_singles = function Nintegrate2D_3_8_singles(f, fz1, a, b, c, d, n, w) {
	    var weights = w;
	    // n = n+(3- n%3); //guarantee that n is divisible by 3

	    var dx = (b - a) / n,
	        dy = (d - c) / n,
	        result1 = 0,
	        result2 = 0;

	    for (var j = 0; j < n + 2; j++) {
	        var x = a + j * dx,
	            Cz1 = fz1(x);

	        for (var k = 0; k < n + 2; k++) {
	            var y = c + k * dy,
	                result = f(x, y, Cz1),
	                weight = weights[j] * weights[k];
	            result1 += result[0] * weight;
	            result2 += result[1] * weight;
	        }
	    }

	    return [result1 * dx * dy * 9 / 64, result2 * dx * dy * 9 / 64];
	};

	helpers.RiemannSum2D = function RiemannSum2D(f, a, b, c, d, n) {
	    var dx = (b - a) / n;
	    var dy = (d - c) / n;
	    var result = 0;

	    for (var j = 0; j < n; j++) {
	        for (var k = 0; k < n; k++) {
	            result += f(a + j * dx, c + k * dy);
	        }
	    }

	    return result * dx * dy;
	};

	// Complex number handling
	helpers.cmultiplyR = function cmultiplyR(a, b, c, d) {
	    return a * c - b * d;
	};

	helpers.cmultiplyI = function cmultiplyI(a, b, c, d) {
	    return a * d + b * c;
	};

	helpers.cdivideR = function cdivideR(a, b, c, d) {
	    return (a * c + b * d) / (sq(c) + sq(d));
	};

	helpers.cdivideI = function cdivideI(a, b, c, d) {
	    return (b * c - a * d) / (sq(c) + sq(d));
	};

	helpers.caddR = function caddR(a, ai, b, bi) {
	    return a + b;
	};

	helpers.caddI = function caddI(a, ai, b, bi) {
	    return ai + bi;
	};

	// Returns real part of the principal square root of a complex number
	helpers.csqrtR = function csqrtR(a, ai) {
	    var r = Math.sqrt(sq(a) + sq(ai));
	    var arg = Math.atan2(ai, a);
	    var real = Math.sqrt(r) * Math.cos(arg / 2);
	    // return real;
	    return helpers.sign(real) * real; //returns the real value
	};

	// Returns imag part of the principal square root of a complex number
	helpers.csqrtI = function csqrtI(a, ai) {
	    var r = Math.sqrt(sq(a) + sq(ai));
	    var arg = Math.atan2(ai, a);
	    var real = Math.sqrt(r) * Math.cos(arg / 2);
	    var imag = Math.sqrt(r) * Math.sin(arg / 2);
	    // return imag;
	    return helpers.sign(real) * imag; //returns the imag value
	};

	// http://jsperf.com/signs/3
	helpers.sign = function sign(x) {
	    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
	};

	module.exports = helpers;

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(19)
	  , TAG = __webpack_require__(6)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function(it, key){
	  try {
	    return it[key];
	  } catch(e){ /* empty */ }
	};

	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(19);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 51 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 52 */
/***/ function(module, exports) {

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

	module.exports = isObject;


/***/ },
/* 53 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Constants accessible to PhaseMatch internally
	 */
	var nm = Math.pow(10, -9);
	var um = Math.pow(10, -6);
	var pm = Math.pow(10, -12);
	var lightspeed = 2.99792458 * Math.pow(10, 8);
	var twoPI = 2 * Math.PI;
	var e0 = 8.854 * Math.pow(10, -12);

	module.exports = {
	    // user accessible constants
	    um: um,
	    nm: nm,
	    pm: pm,
	    c: lightspeed,
	    e0: e0,
	    twoPI: twoPI
		};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	var PhaseMatch = {
	    constants: __webpack_require__(53),
	    Complex: __webpack_require__(150),
	    nelderMead: __webpack_require__(105),
	    svdcmp: __webpack_require__(151),
	    Crystals: __webpack_require__(106)
	};

	module.exports = PhaseMatch;

	// assign math helpers to PhaseMatch
	var helpers = __webpack_require__(48);
	var sq = helpers.sq;
	Object.assign(PhaseMatch, helpers);

	// assign momentum functions
	var pm_momentum = __webpack_require__(152);
	Object.assign(PhaseMatch, pm_momentum);

	// assign properties tools
	var pm_props = __webpack_require__(154);
	Object.assign(PhaseMatch, pm_props);

	// assign plot helpers
	var pm_plot = __webpack_require__(153);
	Object.assign(PhaseMatch, pm_plot);

	/**
	 * Phasematching Library
	 * This is the file that will evolve into the lambda_ibrary of functions to compute phasematching.
	 */

	/*
	 * calc_delK()
	 * Gets the index of refraction depending on phasematching type
	 * All angles in radians.
	 * P is SPDC Properties object
	 */

	PhaseMatch.calc_delK = function calc_delK(P) {

	    var twoPI = Math.PI * 2;
	    var n_p = P.n_p;
	    var n_s = P.n_s;
	    var n_i = P.n_i;
	    var sinThetaS = Math.sin(P.theta_s);
	    var sinThetaI = Math.sin(P.theta_i);
	    var invLambdaS = 1 / P.lambda_s;
	    var invLambdaI = 1 / P.lambda_i;

	    // Directions of the signal and idler photons in the pump coordinates
	    var Ss = [sinThetaS * Math.cos(P.phi_s), sinThetaS * Math.sin(P.phi_s), Math.cos(P.theta_s)];
	    var Si = [sinThetaI * Math.cos(P.phi_i), sinThetaI * Math.sin(P.phi_i), Math.cos(P.theta_i)];

	    var delKx = twoPI * (n_s * Ss[0] * invLambdaS + n_i * Si[0] * invLambdaI);
	    var delKy = twoPI * (n_s * Ss[1] * invLambdaS + n_i * Si[1] * invLambdaI);
	    var delKz = twoPI * (n_p / P.lambda_p - n_s * Ss[2] * invLambdaS - n_i * Si[2] * invLambdaI);

	    if (P.enable_pp) {
	        delKz -= twoPI / (P.poling_period * P.poling_sign);
	    }

	    return [delKx, delKy, delKz];
	};

	/*
	 * calc_PM_tz
	 * Returns Phasematching function for the transverse and longitudinal directions
	 */

	PhaseMatch.calc_PM_tz = function calc_PM_tz(P) {
	    var con = PhaseMatch.constants;
	    var lambda_p = P.lambda_p; //store the original lambda_p
	    var n_p = P.n_p;

	    P.lambda_p = 1 / (1 / P.lambda_s + 1 / P.lambda_i);
	    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

	    var delK = PhaseMatch.calc_delK(P);

	    P.lambda_p = lambda_p; //set back to the original lambda_p
	    P.n_p = n_p;

	    var arg = P.L / 2 * delK[2];

	    var PMz_real = 0;
	    var PMz_imag = 0;

	    // var convfromFWHM = 1/(2 * Math.sqrt(2*Math.log(2))); //convert from FWHM
	    // var convfromFWHM = 1/(2 * Math.sqrt(Math.log(2)));
	    // Need to convert my 1/e^2 definition. I am using the definition
	    // E = exp(-x^2/(sqrt(2)*W)) vs the standard E = exp(-x^2/W)).
	    // Therefore W -> sqrt(2)*W
	    var convtoproppergaussian = 1 * Math.sqrt(2); // Use 1/e^2 in intensity.
	    // var convtoFWHM = 2*(Math.sqrt(Math.log(2)/2));

	    var W_s, W_i;

	    if (P.calcfibercoupling) {
	        W_s = P.W_sx;
	        W_i = P.W_ix;
	        // W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s)));
	        // W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));
	    } else {
	        W_s = Math.pow(2, 20); //Arbitrary large number
	        W_i = Math.pow(2, 20); //Arbitrary large number
	    }

	    // // Setup constants
	    var Wp_SQ = sq(P.W * convtoproppergaussian); // convert from FWHM to sigma
	    var Ws_SQ = sq(W_s * convtoproppergaussian); // convert from FWHM to sigma
	    var Wi_SQ = sq(W_i * convtoproppergaussian); // convert from FWHM to sigma @TODO: Change to P.W_i

	    // // Setup constants
	    // var Wp_SQ = sq(P.W * convtoFWHM); // convert from sigma to FWHM
	    // var Ws_SQ = sq(W_s * convtoFWHM); // convert from sigma to FWHM
	    // var Wi_SQ = sq(W_i * convtoFWHM); // convert from sigma to FWHM @TODO: Change to P.W_i

	    var COS_2THETAs = Math.cos(2 * P.theta_s);
	    var COS_2THETAi = Math.cos(2 * P.theta_i);
	    var COS_2PHIs = Math.cos(2 * P.phi_s);
	    var COS_THETAs = Math.cos(P.theta_s);
	    var COS_THETAi = Math.cos(P.theta_i);
	    var COS_PHIs = Math.cos(P.phi_s);

	    var SIN_2THETAs = Math.sin(2 * P.theta_s);
	    var SIN_2THETAi = Math.sin(2 * P.theta_i);
	    var SIN_2PHIs = Math.sin(2 * P.phi_s);
	    var SIN_THETAs = Math.sin(P.theta_s);
	    var SIN_THETAi = Math.sin(P.theta_i);
	    var SIN_PHIs = Math.sin(P.phi_s);
	    var COS_2THETAi_minus_PHIs = Math.cos(2 * (P.theta_i - P.phi_s));
	    var COS_2THETAs_minus_PHIs = Math.cos(2 * (P.theta_s - P.phi_s));
	    var COS_2THETAs_plus_PHIs = Math.cos(2 * (P.theta_s + P.phi_s));
	    var COS_2THETAi_plus_PHIs = Math.cos(2 * (P.theta_i + P.phi_s));
	    var COS_2THETAi_plus_THETAs = Math.cos(2 * (P.theta_i + P.theta_s));
	    var SIN_2THETAi_plus_THETAs = Math.sin(2 * (P.theta_i + P.theta_s));
	    var SIN_THETAi_plus_THETAs = Math.sin(P.theta_i + P.theta_s);

	    var RHOpx = P.walkoff_p; //pump walkoff angle.
	    // var RHOpx = 0; //pump walkoff angle.

	    RHOpx = -RHOpx; //Take the negative value. This is due to how things are defined later.

	    // Deal with the constant term without z dependence
	    // Expanded version where W_s does not have to equal W_i

	    var Anum1a = (6 + 2 * COS_2THETAi + COS_2THETAi_minus_PHIs - 2 * COS_2PHIs + COS_2THETAi_plus_PHIs) * sq(delK[0]);
	    var Anum1b = 8 * sq(SIN_THETAi) * SIN_2PHIs * delK[0] * delK[1];
	    var Anum1c = (6 + 2 * COS_2THETAi - COS_2THETAi_minus_PHIs + 2 * COS_2PHIs - COS_2THETAi_plus_PHIs) * sq(delK[1]);
	    var Anum1 = Anum1a + Anum1b + Anum1c;

	    var Anum2a = 8 * (sq(delK[0]) + sq(delK[1]));
	    var Anum2b = (6 + 2 * COS_2THETAs + COS_2THETAs_minus_PHIs + COS_2THETAs_plus_PHIs - 2 * COS_2PHIs) * sq(delK[0]);
	    var Anum2c = 8 * sq(SIN_THETAi) * SIN_2PHIs * delK[0] * delK[1];
	    var Anum2d = (6 + 2 * COS_2THETAs - COS_2THETAs_minus_PHIs - COS_2THETAs_plus_PHIs + 2 * COS_2PHIs) * sq(delK[1]);
	    var Anum2e = Anum2b + Anum2c + Anum2d;

	    var Anum1rr = Wp_SQ * Ws_SQ * (Anum1a + Anum1b + Anum1c);
	    var Anum2arr = 8 * Ws_SQ * (sq(delK[0]) + sq(delK[1]));
	    var Anum2rr = Wi_SQ * (Anum2arr + Wp_SQ * Anum2e);
	    var Anum = Wi_SQ * Ws_SQ * Wp_SQ * (Anum1rr + Anum2rr);

	    // var Aden = 16*(Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*( sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ));
	    // var A = Anum / Aden;

	    var ki = P.n_i * 2 * Math.PI / P.lambda_i;
	    var ks = P.n_s * 2 * Math.PI / P.lambda_s;
	    var kp = P.n_p * 2 * Math.PI / P.lambda_p;

	    // Deal with the z term coefficient. It is imaginary. Version with W_s and W_i independent
	    var Bnum1 = 4 * (SIN_2THETAi * SIN_PHIs * delK[0] + COS_PHIs * SIN_2THETAi * delK[1] + 2 * sq(COS_THETAi) * delK[2]);

	    var Bnum2a = 4 * ((SIN_2THETAi - SIN_2THETAs) * SIN_PHIs * delK[0] + COS_PHIs * (SIN_2THETAi - SIN_2THETAs) * delK[1] + (2 + COS_2THETAi + COS_2THETAs) * delK[2]);
	    var Bnum2b = 4 * (3 + COS_2THETAi) * delK[2] + delK[0] * (4 * SIN_2THETAi * SIN_PHIs + (6 + 2 * COS_2THETAi + COS_2THETAi_minus_PHIs - 2 * COS_2PHIs + COS_2THETAi_plus_PHIs) * RHOpx) + 8 * COS_PHIs * SIN_THETAi * delK[1] * (COS_THETAi + SIN_THETAi * SIN_PHIs * RHOpx);

	    var Bnum3a1 = -4 * (SIN_2THETAs * SIN_PHIs * delK[0] + COS_PHIs * SIN_2THETAs * delK[1] - 2 * sq(COS_THETAs) * delK[2]);
	    var Bnum3a2 = 8 * (delK[2] + delK[1] * RHOpx);
	    var Bnum3b = 4 * (3 + COS_2THETAs) * delK[2] + delK[0] * (-4 * SIN_2THETAs * SIN_PHIs + (6 + 2 * COS_2THETAs + COS_2THETAs_minus_PHIs - 2 * COS_2PHIs + COS_2THETAs_plus_PHIs) * RHOpx) + 8 * COS_PHIs * SIN_THETAs * delK[1] * (-COS_THETAs + SIN_THETAs * SIN_PHIs * RHOpx);

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
	    var Cnum = sq(SIN_THETAi_plus_THETAs) * Wp_SQ + Ws_SQ * (sq(SIN_THETAi) - SIN_2THETAi * SIN_PHIs * RHOpx) + Wi_SQ * (sq(SIN_THETAs) + SIN_2THETAs * SIN_PHIs * RHOpx);

	    var Cnuma = sq(SIN_THETAi_plus_THETAs);
	    var Cnumb = sq(SIN_THETAi) - SIN_2THETAi * SIN_PHIs * RHOpx;
	    var Cnumc = sq(SIN_THETAs) + SIN_2THETAs * SIN_PHIs * RHOpx;

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
	        pi2 = 2 * Math.PI,
	        gaussnorm;

	    if (P.singles) {
	        xconst1 = 1 / Wp_SQ;
	        xconst1 += (sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) / Ws_SQ;
	        xconst = Math.sqrt(2 * Math.PI) / Math.sqrt(xconst1);

	        // Next the constant that remains after analytically integrating over y
	        yconst1 = (Wp_SQ + Ws_SQ) * (sq(COS_THETAs) * Wp_SQ + Ws_SQ);
	        yconst2 = Wp_SQ * Ws_SQ * ((sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) * Wp_SQ + Ws_SQ);
	        yconst = Math.sqrt(2 * Math.PI) / Math.sqrt(yconst1 / yconst2);

	        // Normalization from the Gaussian terms in the integral.
	        gaussnorm = 1 / Math.sqrt(pi2 * Ws_SQ) * (1 / Math.sqrt(pi2 * Wp_SQ));
	    } else {
	        xconst1 = (sq(COS_PHIs) + sq(COS_THETAi) * sq(SIN_PHIs)) / Wi_SQ;
	        xconst1 += 1 / Wp_SQ;
	        xconst1 += (sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) / Ws_SQ;
	        xconst = Math.sqrt(2 * Math.PI) / Math.sqrt(xconst1);

	        // Next the constant that remains after analytically integrating over y
	        yconst1 = (Wp_SQ * Ws_SQ + Wi_SQ * (Wp_SQ + Ws_SQ)) * sq(COS_THETAi) * Wp_SQ * Ws_SQ + Wi_SQ * (sq(COS_THETAs) * Wp_SQ + Ws_SQ);
	        yconst2 = Wi_SQ * Wp_SQ * Ws_SQ * ((sq(COS_PHIs) + sq(COS_THETAi) * sq(SIN_PHIs)) * Wp_SQ * Ws_SQ + Wi_SQ * ((sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) * Wp_SQ + Ws_SQ));
	        yconst = Math.sqrt(2 * Math.PI) / Math.sqrt(yconst1 / yconst2);

	        // Normalization from the Gaussian terms in the integral.
	        gaussnorm = 1 / Math.sqrt(pi2 * Ws_SQ) * (1 / Math.sqrt(pi2 * Wi_SQ)) * (1 / Math.sqrt(pi2 * Wp_SQ));
	    }

	    var pmzcoeff = 0,
	        bw;

	    if (P.calc_apodization && P.enable_pp) {
	        // var apodization_coeff = P.apodization_coeff;
	        bw = P.apodization_FWHM / 2.3548;
	    } else {
	        bw = Math.pow(2, 20);
	    }

	    ///////////////////////////////////////////
	    var calczterms = function calczterms(z) {
	        var Q_sR = Ws_SQ,
	            Q_sI = -2 * z / ks,
	            Q_iR = Wi_SQ,
	            Q_iI = -2 * z / ki,
	            Q_pR = Wp_SQ,
	            Q_pI = 2 * z / kp,
	            Q_sR_SQ = PhaseMatch.cmultiplyR(Q_sR, Q_sI, Q_sR, Q_sI),
	            Q_sI_SQ = PhaseMatch.cmultiplyI(Q_sR, Q_sI, Q_sR, Q_sI),
	            Q_iR_SQ = PhaseMatch.cmultiplyR(Q_iR, Q_iI, Q_iR, Q_iI),
	            Q_iI_SQ = PhaseMatch.cmultiplyI(Q_iR, Q_iI, Q_iR, Q_iI),
	            Q_pR_SQ = PhaseMatch.cmultiplyR(Q_pR, Q_pI, Q_pR, Q_pI),
	            Q_pI_SQ = PhaseMatch.cmultiplyI(Q_pR, Q_pI, Q_pR, Q_pI);

	        var Q_isR = PhaseMatch.cmultiplyR(Q_iR, Q_iI, Q_sR, Q_sI);
	        var Q_isI = PhaseMatch.cmultiplyI(Q_iR, Q_iI, Q_sR, Q_sI);

	        var Q_ispR = PhaseMatch.cmultiplyR(Q_pR, Q_pI, Q_isR, Q_isI);
	        var Q_ispI = PhaseMatch.cmultiplyI(Q_pR, Q_pI, Q_isR, Q_isI);

	        var Q_ipR = PhaseMatch.cmultiplyR(Q_iR, Q_iI, Q_pR, Q_pI);
	        var Q_ipI = PhaseMatch.cmultiplyI(Q_iR, Q_iI, Q_pR, Q_pI);

	        var Q_spR = PhaseMatch.cmultiplyR(Q_sR, Q_sI, Q_pR, Q_pI);
	        var Q_spI = PhaseMatch.cmultiplyI(Q_sR, Q_sI, Q_pR, Q_pI);

	        var Anum1R = Q_spR * Anum1;
	        var Anum1I = Q_spI * Anum1;
	        var Anum2aR = Q_sR * Anum2a;
	        var Anum2aI = Q_sI * Anum2a;
	        // var Anum2 = Wi_SQ*(Anum2a + Wp_SQ*(Anum2b + Anum2c + Anum2d));
	        var Anum2c1R = Q_pR * Anum2e;
	        var Anum2c1I = Q_pI * Anum2e;
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
	        var Aden1R = PhaseMatch.caddR(Q_spR, Q_spI, Q_ipR, Q_ipI);
	        var Aden1I = PhaseMatch.caddI(Q_spR, Q_spI, Q_ipR, Q_ipI);
	        var Aden2R = PhaseMatch.caddR(Aden1R, Aden1I, Q_isR, Q_isI);
	        var Aden2I = PhaseMatch.caddI(Aden1R, Aden1I, Q_isR, Q_isI);
	        var Aden3R = sq(COS_THETAi) * Q_spR;
	        var Aden3I = sq(COS_THETAi) * Q_spI;
	        var Aden4R = sq(COS_THETAs) * Q_ipR;
	        var Aden4I = sq(COS_THETAs) * Q_ipI;
	        var Aden5R = PhaseMatch.caddR(Aden3R, Aden3I, Aden4R, Aden4I);
	        var Aden5I = PhaseMatch.caddI(Aden3R, Aden3I, Aden4R, Aden4I);
	        var Aden6R = PhaseMatch.caddR(Aden5R, Aden5I, Q_isR, Q_isI);
	        var Aden6I = PhaseMatch.caddI(Aden5R, Aden5I, Q_isR, Q_isI);
	        var AdenR = 16 * PhaseMatch.cmultiplyR(Aden6R, Aden6I, Aden2R, Aden2I);
	        var AdenI = 16 * PhaseMatch.cmultiplyI(Aden6R, Aden6I, Aden2R, Aden2I);

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
	        var Bnum2cR = PhaseMatch.caddR(Bnum2aR, Bnum2aI, Bnum2bR, Bnum2bI);
	        var Bnum2cI = PhaseMatch.caddI(Bnum2aR, Bnum2aI, Bnum2bR, Bnum2bI);
	        var Bnum2R = PhaseMatch.cmultiplyR(Bnum2cR, Bnum2cI, Q_ispR, Q_ispI);
	        var Bnum2I = PhaseMatch.cmultiplyI(Bnum2cR, Bnum2cI, Q_ispR, Q_ispI);
	        // var Bnum3a = -4*sq(Wp_SQ)*(SIN_2THETAs*SIN_PHIs*delK[0]+COS_PHIs*SIN_2THETAs*delK[1]-2*sq(COS_THETAs)*delK[2]) + 8*sq(Ws_SQ)*(delK[2]+delK[1]*RHOpx);
	        var Bnum3a1R = Bnum3a1 * Q_pR_SQ;
	        var Bnum3a1I = Bnum3a1 * Q_pI_SQ;
	        var Bnum3a2R = Bnum3a2 * Q_sR_SQ;
	        var Bnum3a2I = Bnum3a2 * Q_sI_SQ;
	        var Bnum3aR = PhaseMatch.caddR(Bnum3a1R, Bnum3a1I, Bnum3a2R, Bnum3a2I);
	        var Bnum3aI = PhaseMatch.caddI(Bnum3a1R, Bnum3a1I, Bnum3a2R, Bnum3a2I);
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
	        var BR = 2 * PhaseMatch.cdivideR(BnumR, BnumI, AdenR, AdenI);
	        var BI = 2 * PhaseMatch.cdivideI(BnumR, BnumI, AdenR, AdenI);

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
	        var CdenaR = sq(COS_THETAi) * Q_spR,
	            CdenaI = sq(COS_THETAi) * Q_spI,
	            CdenbR = sq(COS_THETAs) * Q_ipR,
	            CdenbI = sq(COS_THETAs) * Q_ipI,
	            CdencR = PhaseMatch.caddR(CdenaR, CdenaI, CdenbR, CdenbI),
	            CdencI = PhaseMatch.caddI(CdenaR, CdenaI, CdenbR, CdenbI),
	            CdenR = 2 * PhaseMatch.caddR(CdencR, CdencI, Q_isR, Q_isI),
	            CdenI = 2 * PhaseMatch.caddI(CdencR, CdencI, Q_isR, Q_isI);

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
	        var gN = sq(1 / Math.sqrt(Math.PI * 2)) * 1 / Math.sqrt(Math.PI * 2),
	            gaussR = PhaseMatch.cdivideR(gN * Math.sqrt(Ws_SQ * Wi_SQ * Wp_SQ), 0, Q_ispR, Q_ispI),
	            gaussI = PhaseMatch.cdivideI(gN * Math.sqrt(Ws_SQ * Wi_SQ * Wp_SQ), 0, Q_ispR, Q_ispI);

	        // xconst1 = (sq(COS_PHIs) + sq(COS_THETAi)*sq(SIN_PHIs))/Wi_SQ;
	        var xconst1R = PhaseMatch.cdivideR(sq(COS_PHIs) + sq(COS_THETAi) * sq(SIN_PHIs), 0, Q_iR, Q_iI),
	            xconst1I = PhaseMatch.cdivideI(sq(COS_PHIs) + sq(COS_THETAi) * sq(SIN_PHIs), 0, Q_iR, Q_iI),

	        // xconst1 += 1/Wp_SQ;
	        xconst2R = PhaseMatch.cdivideR(1, 0, Q_pR, Q_pI),
	            xconst2I = PhaseMatch.cdivideI(1, 0, Q_pR, Q_pI),
	            xconst3R = PhaseMatch.caddR(xconst1R, xconst1I, xconst2R, xconst2I),
	            xconst3I = PhaseMatch.caddI(xconst1R, xconst1I, xconst2R, xconst2I),

	        // xconst1 += (sq(COS_PHIs) + sq(COS_THETAs)*sq(SIN_PHIs))/Ws_SQ;
	        xconst4R = PhaseMatch.cdivideR(sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs), 0, Q_sR, Q_sI),
	            xconst4I = PhaseMatch.cdivideI(sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs), 0, Q_sR, Q_sI),
	            xconst5R = PhaseMatch.caddR(xconst3R, xconst3I, xconst4R, xconst4I),
	            xconst5I = PhaseMatch.caddI(xconst3R, xconst3I, xconst4R, xconst4I),

	        // Math.sqrt(xconst1);
	        xconst6R = PhaseMatch.csqrtR(xconst5R, xconst5I),
	            xconst6I = PhaseMatch.csqrtI(xconst5R, xconst5I),

	        // xconst = Math.sqrt(2*Math.PI)/Math.sqrt(xconst1);
	        xconstR = PhaseMatch.cdivideR(Math.sqrt(2 * Math.PI), 0, xconst6R, xconst6I),
	            xconstI = PhaseMatch.cdivideI(Math.sqrt(2 * Math.PI), 0, xconst6R, xconst6I);

	        // yconst numerator
	        // yconst1 = (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ ));
	        //
	        // (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))
	        //
	        var ynum1R = PhaseMatch.caddR(Q_spR, Q_spI, Q_ipR, Q_ipI),
	            ynum1I = PhaseMatch.caddI(Q_spR, Q_spI, Q_ipR, Q_ipI),
	            ynum2R = PhaseMatch.caddR(ynum1R, ynum1I, Q_isR, Q_isI),
	            ynum2I = PhaseMatch.caddI(ynum1R, ynum1I, Q_isR, Q_isI),

	        // (sq(COS_THETAi))*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ )
	        ynum3R = PhaseMatch.caddR(sq(COS_THETAs) * Q_ipR, sq(COS_THETAs) * Q_ipI, Q_isR, Q_isI),
	            ynum3I = PhaseMatch.caddI(sq(COS_THETAs) * Q_ipR, sq(COS_THETAs) * Q_ipI, Q_isR, Q_isI),
	            ynum4R = PhaseMatch.caddR(ynum3R, ynum3I, sq(COS_THETAi) * Q_spR, sq(COS_THETAi) * Q_spI),
	            ynum4I = PhaseMatch.caddI(ynum3R, ynum3I, sq(COS_THETAi) * Q_spR, sq(COS_THETAi) * Q_spI),

	        // (Wp_SQ*Ws_SQ + Wi_SQ*(Wp_SQ+Ws_SQ))*(sq(COS_THETAi)*Wp_SQ*Ws_SQ + Wi_SQ*(sq(COS_THETAs)*Wp_SQ+Ws_SQ ));
	        ynumR = PhaseMatch.cmultiplyR(ynum2R, ynum2I, ynum4R, ynum4I),
	            ynumI = PhaseMatch.cmultiplyI(ynum2R, ynum2I, ynum4R, ynum4I);

	        // // yconst denominator
	        // // yconst2 = Wi_SQ*Wp_SQ*Ws_SQ*((sq(COS_PHIs)+sq(COS_THETAi)*sq(SIN_PHIs))*Wp_SQ*Ws_SQ + Wi_SQ* (( sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs)) *Wp_SQ +Ws_SQ));
	        var c1 = sq(COS_PHIs) + sq(COS_THETAs) * sq(SIN_PHIs),
	            yden1R = PhaseMatch.caddR(c1 * Q_ipR, c1 * Q_ipI, Q_isR, Q_isI),
	            yden1I = PhaseMatch.caddI(c1 * Q_ipR, c1 * Q_ipI, Q_isR, Q_isI),
	            c2 = sq(COS_PHIs) + sq(COS_THETAi) * sq(SIN_PHIs),
	            yden2R = PhaseMatch.caddR(c2 * Q_spR, c2 * Q_spI, yden1R, yden1I),
	            yden2I = PhaseMatch.caddI(c2 * Q_spR, c2 * Q_spI, yden1R, yden1I),
	            ydenR = PhaseMatch.cmultiplyR(Q_ispR, Q_ispI, yden2R, yden2I),
	            ydenI = PhaseMatch.cmultiplyI(Q_ispR, Q_ispI, yden2R, yden2I);

	        // yconst = Math.sqrt(2*Math.PI)/Math.sqrt(yconst1/yconst2);
	        var yconstd1R = PhaseMatch.cdivideR(ynumR, ynumI, ydenR, ydenI),
	            yconstd1I = PhaseMatch.cdivideI(ynumR, ynumI, ydenR, ydenI),
	            yconstd2R = PhaseMatch.csqrtR(yconstd1R, yconstd1I),
	            yconstd2I = PhaseMatch.csqrtI(yconstd1R, yconstd1I),
	            yconstR = PhaseMatch.cdivideR(Math.sqrt(2 * Math.PI), 0, yconstd2R, yconstd2I),
	            yconstI = PhaseMatch.cdivideI(Math.sqrt(2 * Math.PI), 0, yconstd2R, yconstd2I);

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
	    var zintfunc = function zintfunc(z) {
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

	        var pmzcoeff = Math.exp(-1 / 2 * sq(z / bw)); // apodization
	        pmzcoeff = pmzcoeff * Math.exp(-sq(z) * CR - z * BI - AR);
	        var realE = pmzcoeff * Math.cos(-sq(z) * CI + z * BR - AI);
	        var imagE = pmzcoeff * Math.sin(-sq(z) * CI + z * BR - AI);

	        var real = PhaseMatch.cmultiplyR(realE, imagE, coeffR, coeffI);
	        var imag = PhaseMatch.cmultiplyI(realE, imagE, coeffR, coeffI);

	        return [real, imag];
	    };

	    var PMt;
	    if (P.calcfibercoupling) {
	        var dz = P.L / P.numzint;
	        var pmintz = PhaseMatch.Nintegrate2arg(zintfunc, -P.L / 2, P.L / 2, dz, P.numzint, P.zweights);
	        PMz_real = pmintz[0] / P.L;
	        PMz_imag = pmintz[1] / P.L;
	        PMt = 1;
	    } else {
	        var PMzNorm1 = Math.sin(arg) / arg;
	        // var PMz_real =  PMzNorm1 * Math.cos(arg);
	        // var PMz_imag = PMzNorm1 * Math.sin(arg);
	        PMz_real = PMzNorm1;
	        PMz_imag = 0;
	        PMt = Math.exp(-0.5 * (sq(delK[0]) + sq(delK[1])) * sq(P.W));
	    }
	    // var PMz_real = PhaseMatch.Nintegrate(zintReal,-P.L/2, P.L/2,numz)/P.L;
	    // var PMz_imag = PhaseMatch.Nintegrate(zintImag,-P.L/2, P.L/2,numz)/P.L;

	    // console.log(zintReal(0), bw);
	    // console.log(PMz_real, PMz_imag);


	    if (P.use_guassian_approx) {
	        // console.log('approx');
	        PMz_real = Math.exp(-0.193 * sq(arg));
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
	PhaseMatch.pump_spectrum = function pump_spectrum(P) {
	    var con = PhaseMatch.constants;
	    // PhaseMatch.convertToMicrons(P);
	    var mu = 1;
	    con.c = con.c * mu;
	    // @TODO: Need to move the pump bandwidth to someplace that is cached.
	    var p_bw = 2 * Math.PI * con.c / sq(P.lambda_p) * P.p_bw; //* n_p; //convert from wavelength to w
	    p_bw = p_bw / (2 * Math.sqrt(Math.log(2))); //convert from FWHM
	    var alpha = Math.exp(-1 / 2 * sq(2 * Math.PI * con.c * (1 / P.lambda_s + 1 / P.lambda_i - 1 / P.lambda_p) / p_bw));
	    // PhaseMatch.convertToMeters(P);
	    return alpha;
	};

	/*
	 * phasematch()
	 * Gets the index of refraction depending on phasematching type
	 * P is SPDC Properties object
	 */
	PhaseMatch.phasematch = function phasematch(P) {

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
	    return [alpha * PMt * PMz_real, alpha * PMt * PMz_imag, C_check];
	};

	/*
	 * phasematch()
	 * Gets the index of refraction depending on phasematching type
	 * P is SPDC Properties object
	 */
	PhaseMatch.phasematch_coinc = function phasematch_coinc(P) {

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
	    return [alpha * PMt * PMz_real, alpha * PMt * PMz_imag, C_check];
	};

	/*
	 * phasematch_singles()
	 * Gets the index of refraction depending on phasematching type for the singles
	 * Rate for the signal photon.
	 * P is SPDC Properties object
	 */
	PhaseMatch.phasematch_singles = function phasematch_singles(P) {

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
	    return [alpha * PMt * PMz_real, alpha * PMt * PMz_imag, C_check];
	};

	/*
	 * phasematch_Int_Phase()
	 * Gets the index of refraction depending on phasematching type
	 * P is SPDC Properties object
	 */
	PhaseMatch.phasematch_Int_Phase = function phasematch_Int_Phase(P) {

	    // PM is a complex array. First element is real part, second element is imaginary.
	    var PM = PhaseMatch.phasematch(P);

	    var C_check = PM[2];

	    // var PMInt = sq(PM[0]) + sq(PM[1])

	    if (P.phase) {
	        var PMang = Math.atan2(PM[1], PM[0]) + Math.PI;
	        // need to figure out an elegant way to apodize the phase. Leave out for now
	        // var x = PMInt<0.01
	        // var AP = PMInt
	        // var AP[x] = 0.
	        // var x = PMInt >0
	        // var AP[x] = 1.

	        // PM = PMang * AP;
	        PM = PMang * 180 / Math.PI;
	    } else {
	        // console.log  ("calculating Intensity")
	        PM = sq(PM[0]) + sq(PM[1]);
	    }
	    // console.log(PM)
	    return { "phasematch": PM };
	};

	/*
	 * phasematch_Int_Phase()
	 * Gets the index of refraction depending on phasematching type
	 * P is SPDC Properties object
	 */
	PhaseMatch.phasematch_Int_Phase_Singles = function phasematch_Int_Phase_Singles(P) {

	    // PM is a complex array. First element is real part, second element is imaginary.
	    var PM = PhaseMatch.phasematch_singles(P);

	    var C_check = PM[2];

	    // var PMInt = sq(PM[0]) + sq(PM[1])

	    if (P.phase) {
	        var PMang = Math.atan2(PM[1], PM[0]) + Math.PI;
	        // need to figure out an elegant way to apodize the phase. Leave out for now
	        // var x = PMInt<0.01
	        // var AP = PMInt
	        // var AP[x] = 0.
	        // var x = PMInt >0
	        // var AP[x] = 1.

	        // PM = PMang * AP;
	        PM = PMang * 180 / Math.PI;
	    } else {
	        // console.log  ("calculating Intensity")
	        PM = sq(PM[0]) + sq(PM[1]);
	    }
	    // console.log(PM)
	    return { "phasematch": PM };
	};

	/*
	 * Normalization function for the joint spectrums
	 */
	PhaseMatch.normalize_joint_spectrum = function normalize_joint_spectrum(props) {
	    // Find the optimum phase matching condition. This will be when delK = 0 and everything is collinear.
	    // Need to calculate optimum poling period and crystal angle.
	    var P = props.clone();
	    P.theta_s = 0;
	    P.theta_i = 0;
	    P.theta_s_e = 0;
	    P.theta_i_e = 0;
	    P.update_all_angles();

	    if (props.enable_pp) {
	        P.calc_poling_period();
	    } else {
	        P.auto_calc_Theta();
	    }

	    var norm = PhaseMatch.phasematch_Int_Phase(P)['phasematch'];
	    return norm;
	};

	/*
	 * Normalization function for the joint spectrum of the Singles rate
	 */
	PhaseMatch.normalize_joint_spectrum_singles = function normalize_joint_spectrum_singles(props) {
	    // Find the optimum phase matching condition. This will be when delK = 0 and everything is collinear.
	    // Need to calculate optimum poling period and crystal angle.
	    var P = props.clone();
	    P.theta_s = 0;
	    P.theta_i = 0;
	    P.theta_s_e = 0;
	    P.theta_i_e = 0;
	    P.update_all_angles();

	    if (props.enable_pp) {
	        P.calc_poling_period();
	    } else {
	        P.auto_calc_Theta();
	    }

	    var convfromFWHM = Math.sqrt(2) // Use 1/e^2 in intensity.
	    ,
	        Wi_SQ = Math.pow(P.W_sx * convfromFWHM, 2) // convert from FWHM to sigma @TODO: Change to P.W_i
	    ,
	        PHI_s = 1 / Math.cos(P.theta_s_e);

	    //console.log("Wi squared: ", Wi_SQ*PHI_s);

	    var norm = PhaseMatch.phasematch_Int_Phase_Singles(P)['phasematch']; //*(Wi_SQ*PHI_s);
	    return norm;
	};

	/*
	 * calc_HOM_JSA()
	 * Calculates the Joint Spectra Amplitude of the HOM at a particluar time delay
	 * P is SPDC Properties object
	 * ls_start ... li_stop are the signal/idler wavelength ranges to calculate over
	 * delT is the time delay between signal and idler
	 */
	PhaseMatch.calc_HOM_rate = function calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT, JSA, dim) {
	    var con = PhaseMatch.constants;

	    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
	    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

	    var rate = 0;

	    var PM_JSA1_real = JSA['PM_JSA1_real'];
	    var PM_JSA1_imag = JSA['PM_JSA1_imag'];
	    var PM_JSA2_real = JSA['PM_JSA2_real'];
	    var PM_JSA2_imag = JSA['PM_JSA2_imag'];

	    var N = dim * dim;
	    var JSI = new Float64Array(N);

	    for (var i = 0; i < N; i++) {
	        var index_s = i % dim;
	        var index_i = Math.floor(i / dim);

	        var ARG = 2 * Math.PI * con.c * (1 / lambda_s[index_s] - 1 / lambda_i[index_i]) * delT;
	        var Tosc_real = Math.cos(ARG);
	        var Tosc_imag = Math.sin(ARG);

	        var arg2_real = Tosc_real * PM_JSA2_real[index_s][index_i] - Tosc_imag * PM_JSA2_imag[index_s][index_i];
	        // rate = arg2_real;
	        var arg2_imag = Tosc_real * PM_JSA2_imag[index_s][index_i] + Tosc_imag * PM_JSA2_real[index_s][index_i];

	        var PM_real = (PM_JSA1_real[index_s][index_i] - arg2_real) / 2; ///Math.sqrt(2);
	        var PM_imag = (PM_JSA1_imag[index_s][index_i] - arg2_imag) / 2; //Math.sqrt(2);

	        var val = sq(PM_real) + sq(PM_imag);
	        JSI[i] = val;
	        rate += val;
	    }

	    return { "rate": rate, "JSI": JSI };
	};

	/*
	 * calc_HOM_bunch_JSA()
	 * Calculates the Joint Spectra Amplitude of the HOM at a particluar time delay
	 * P is SPDC Properties object
	 * ls_start ... li_stop are the signal/idler wavelength ranges to calculate over
	 * delT is the time delay between signal and idler
	 */
	PhaseMatch.calc_HOM_bunch_rate = function calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT, JSA, dim) {
	    var con = PhaseMatch.constants;

	    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
	    var lambda_i = PhaseMatch.linspace(li_stop, li_start, dim);

	    var rate = 0;

	    var PM_JSA1_real = JSA['PM_JSA1_real'];
	    var PM_JSA1_imag = JSA['PM_JSA1_imag'];
	    var PM_JSA2_real = JSA['PM_JSA2_real'];
	    var PM_JSA2_imag = JSA['PM_JSA2_imag'];

	    var N = dim * dim;
	    var JSI = new Float64Array(N);

	    for (var i = 0; i < N; i++) {
	        var index_s = i % dim;
	        var index_i = Math.floor(i / dim);

	        var ARG = 2 * Math.PI * con.c * (1 / lambda_s[index_s] - 1 / lambda_i[index_i]) * delT;
	        var Tosc_real = Math.cos(ARG);
	        var Tosc_imag = Math.sin(ARG);

	        var arg2_real = Tosc_real * PM_JSA2_real[index_s][index_i] - Tosc_imag * PM_JSA2_imag[index_s][index_i];
	        // rate = arg2_real;
	        var arg2_imag = Tosc_real * PM_JSA2_imag[index_s][index_i] + Tosc_imag * PM_JSA2_real[index_s][index_i];

	        var PM_real = (PM_JSA1_real[index_s][index_i] + arg2_real) / 2; ///Math.sqrt(2);
	        var PM_imag = (PM_JSA1_imag[index_s][index_i] + arg2_imag) / 2; //Math.sqrt(2);

	        var val = sq(PM_real) + sq(PM_imag);
	        JSI[i] = val;
	        rate += val;
	    }

	    return { "rate": rate, "JSI": JSI };
	};
	/*
	 * calc_HOM_scan()
	 * Calculates the HOM probability of coincidences over range of times.
	 * P is SPDC Properties object
	 * delT is the time delay between signal and idler
	 */
	PhaseMatch.calc_HOM_scan = function calc_HOM_scan(P, t_start, t_stop, ls_start, ls_stop, li_start, li_stop, dim, dip) {
	    // console.log(dip);
	    // dip = dip || true;
	    // console.log(dip);


	    var npts = 100; //number of points to pass to the calc_HOM_JSA

	    var delT = PhaseMatch.linspace(t_start, t_stop, dim);

	    var HOM_values = PhaseMatch.linspace(t_start, t_stop, dim);
	    var PM_JSA1 = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts);
	    var PM_JSA2 = PhaseMatch.calc_JSA(P, li_start, li_stop, ls_start, ls_stop, npts);

	    var PM_JSA1_real = PhaseMatch.create_2d_array(PM_JSA1[0], npts, npts);
	    var PM_JSA1_imag = PhaseMatch.create_2d_array(PM_JSA1[1], npts, npts);
	    var PM_JSA2_real = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[0], npts), npts, npts);
	    var PM_JSA2_imag = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[1], npts), npts, npts);

	    var JSA = {
	        'PM_JSA1_real': PM_JSA1_real,
	        'PM_JSA1_imag': PM_JSA1_imag,
	        'PM_JSA2_real': PM_JSA2_real,
	        'PM_JSA2_imag': PM_JSA2_imag
	    };

	    var PM_JSI = PhaseMatch.calc_JSI(P, ls_start, ls_stop, li_start, li_stop, npts);

	    // Calculate normalization
	    var N = PhaseMatch.Sum(PM_JSI),
	        rate;

	    for (var i = 0; i < dim; i++) {
	        if (dip) {
	            rate = PhaseMatch.calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
	        } else {
	            rate = PhaseMatch.calc_HOM_bunch_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
	        }

	        HOM_values[i] = rate["rate"] / N;
	    }
	    return HOM_values;
	};

	/*
	 * calc_HOM_scan()
	 * Calculates the HOM probability of coincidences over range of times.
	 * P is SPDC Properties object
	 * delT is the time delay between signal and idler
	 */
	PhaseMatch.calc_HOM_scan_p = function calc_HOM_scan(P, delT, ls_start, ls_stop, li_start, li_stop, npts, dip) {
	    // console.log(dip);
	    // dip = dip || true;
	    // console.log(dip);


	    // var npts = 50;  //number of points to pass to the calc_HOM_JSA
	    var dim = delT.length;

	    // var delT = PhaseMatch.linspace(t_start, t_stop, dim);

	    var HOM_values = new Float64Array(dim);
	    var PM_JSA1 = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts);
	    var PM_JSA2 = PhaseMatch.calc_JSA(P, li_start, li_stop, ls_start, ls_stop, npts);

	    var PM_JSA1_real = PhaseMatch.create_2d_array(PM_JSA1[0], npts, npts);
	    var PM_JSA1_imag = PhaseMatch.create_2d_array(PM_JSA1[1], npts, npts);
	    var PM_JSA2_real = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[0], npts), npts, npts);
	    var PM_JSA2_imag = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[1], npts), npts, npts);

	    var JSA = {
	        'PM_JSA1_real': PM_JSA1_real,
	        'PM_JSA1_imag': PM_JSA1_imag,
	        'PM_JSA2_real': PM_JSA2_real,
	        'PM_JSA2_imag': PM_JSA2_imag
	    };

	    var PM_JSI = PhaseMatch.calc_JSI(P, ls_start, ls_stop, li_start, li_stop, npts);

	    // Calculate normalization
	    var N = PhaseMatch.Sum(PM_JSI),
	        rate;

	    for (var i = 0; i < dim; i++) {
	        if (dip) {
	            rate = PhaseMatch.calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
	        } else {
	            rate = PhaseMatch.calc_HOM_bunch_rate(ls_start, ls_stop, li_start, li_stop, delT[i], JSA, npts);
	        }

	        HOM_values[i] = rate["rate"] / N;
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
	PhaseMatch.calc_HOM_JSA = function calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT, dim, dip) {
	    var PM_JSA1 = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, dim);
	    var PM_JSA2 = PhaseMatch.calc_JSA(P, li_start, li_stop, ls_start, ls_stop, dim);

	    var PM_JSA1_real = PhaseMatch.create_2d_array(PM_JSA1[0], dim, dim);
	    var PM_JSA1_imag = PhaseMatch.create_2d_array(PM_JSA1[1], dim, dim);
	    var PM_JSA2_real = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[0], dim), dim, dim);
	    var PM_JSA2_imag = PhaseMatch.create_2d_array(PhaseMatch.AntiTranspose(PM_JSA2[1], dim), dim, dim);

	    var JSA = {
	        'PM_JSA1_real': PM_JSA1_real,
	        'PM_JSA1_imag': PM_JSA1_imag,
	        'PM_JSA2_real': PM_JSA2_real,
	        'PM_JSA2_imag': PM_JSA2_imag
	    };

	    var JSI;

	    if (dip) {
	        JSI = PhaseMatch.calc_HOM_rate(ls_start, ls_stop, li_start, li_stop, delT, JSA, dim);
	    } else {
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
	PhaseMatch.calc_2HOM_rate = function calc_HOM_rate(delT, ls_start, ls_stop, li_start, li_stop, PM_JSA_real, PM_JSA_imag, dim) {
	    var con = PhaseMatch.constants;

	    var lambda_s = PhaseMatch.linspace(ls_start, ls_stop, dim);
	    var lambda_i = PhaseMatch.linspace(li_start, li_stop, dim);
	    var rate_ss = 0;
	    var rate_ii = 0;
	    var rate_si = 0;

	    // var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], dim, dim);
	    // var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], dim, dim);

	    // Now create the ws, wi arrays for the two crystals. Because the crystals are identical, we can get away with
	    // using just one array for both ws and wi.

	    // loop over ws1
	    for (var j = 0; j < dim; j++) {

	        // loop over wi1
	        for (var k = 0; k < dim; k++) {
	            var A_real = PM_JSA_real[j][k];
	            var A_imag = PM_JSA_imag[j][k];

	            // loop over ws2
	            for (var l = 0; l < dim; l++) {
	                var C_real = PM_JSA_real[l][k];
	                var C_imag = PM_JSA_imag[l][k];

	                // loop over wi2
	                for (var m = 0; m < dim; m++) {

	                    // for the signal signal phase
	                    var ARG_ss = 2 * Math.PI * con.c * (1 / lambda_s[j] - 1 / lambda_i[l]) * delT;
	                    var Phase_ss_real = Math.cos(ARG_ss);
	                    var Phase_ss_imag = Math.sin(ARG_ss);

	                    // for the idler idler phase
	                    var ARG_ii = 2 * Math.PI * con.c * (1 / lambda_s[k] - 1 / lambda_i[m]) * delT;
	                    var Phase_ii_real = Math.cos(ARG_ii);
	                    var Phase_ii_imag = Math.sin(ARG_ii);

	                    // for the signal/idler phase
	                    var ARG_si = 2 * Math.PI * con.c * (1 / lambda_s[j] - 1 / lambda_i[m]) * delT;
	                    var Phase_si_real = Math.cos(ARG_si);
	                    var Phase_si_imag = Math.sin(ARG_si);

	                    var B_real = PM_JSA_real[l][m];
	                    var B_imag = PM_JSA_imag[l][m];

	                    var D_real = PM_JSA_real[j][m];
	                    var D_imag = PM_JSA_imag[j][m];

	                    var Arg1_real = A_real * B_real - A_imag * B_imag;
	                    var Arg1_imag = A_real * B_imag + A_imag * B_real; //minus here b/c of complex conjugate

	                    var Arg2_real = C_real * D_real - C_imag * D_imag;
	                    var Arg2_imag = C_real * D_imag + C_imag * D_real; //minus here b/c of complex conjugate

	                    var Intf_ss_real = (Arg1_real - (Phase_ss_real * Arg2_real - Phase_ss_imag * Arg2_imag)) / 2;
	                    var Intf_ss_imag = (Arg1_imag - (Phase_ss_real * Arg2_imag + Phase_ss_imag * Arg2_real)) / 2;

	                    var Intf_ii_real = (Arg1_real - (Phase_ii_real * Arg2_real - Phase_ii_imag * Arg2_imag)) / 2;
	                    var Intf_ii_imag = (Arg1_imag - (Phase_ii_real * Arg2_imag + Phase_ii_imag * Arg2_real)) / 2;

	                    var Intf_si_real = (Arg1_real - (Phase_si_real * Arg2_real - Phase_si_imag * Arg2_imag)) / 2;
	                    var Intf_si_imag = (Arg1_imag - (Phase_si_real * Arg2_imag + Phase_si_imag * Arg2_real)) / 2;

	                    rate_ss += sq(Intf_ss_real) + sq(Intf_ss_imag);
	                    rate_ii += sq(Intf_ii_real) + sq(Intf_ii_imag);
	                    rate_si += sq(Intf_si_real) + sq(Intf_si_imag);
	                    // rate += HOM_real;
	                }
	            }
	        }
	    }
	    return { "ii": rate_ss, "ss": rate_ii, "si": rate_si };
	};

	/*
	 * calc_2HOM_norm()
	 * Calculates the normalization value
	 * P is SPDC Properties object
	 */
	PhaseMatch.calc_2HOM_norm = function calc_HOM_norm(PM_JSA_real, PM_JSA_imag, dim) {
	    var rate = 0;

	    // var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], dim, dim);
	    // var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], dim, dim);

	    // Now create the ws, wi arrays for the two crystals. Because the crystals are identical, we can get away with
	    // using just one array for both ws and wi.
	    // loop over ws1
	    for (var j = 0; j < dim; j++) {

	        // loop over wi1
	        for (var k = 0; k < dim; k++) {
	            var A_real = PM_JSA_real[j][k];
	            var A_imag = PM_JSA_imag[j][k];

	            // loop over ws2
	            for (var l = 0; l < dim; l++) {
	                // var C_real = PM_JSA_real[l][k];
	                // var C_imag = PM_JSA_imag[l][k];

	                // loop over wi2
	                for (var m = 0; m < dim; m++) {

	                    var B_real = PM_JSA_real[l][m];
	                    var B_imag = PM_JSA_imag[l][m];

	                    var Arg1_real = A_real * B_real - A_imag * B_imag;
	                    var Arg1_imag = A_real * B_imag + A_imag * B_real;

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
	PhaseMatch.calc_2HOM_scan = function calc_HOM_scan(P, t_start, t_stop, ls_start, ls_stop, li_start, li_stop, dim) {

	    var npts = 30; //number of points to pass to calc_JSA()
	    // dim = 20;
	    var delT = PhaseMatch.linspace(t_start, t_stop, dim);

	    var HOM_values_ss = new Float64Array(dim);
	    var HOM_values_ii = new Float64Array(dim);
	    var HOM_values_si = new Float64Array(dim);

	    var PM_JSA = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts); // Returns the complex JSA

	    var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], npts, npts);
	    var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], npts, npts);

	    // Calculate normalization
	    var N = PhaseMatch.calc_2HOM_norm(PM_JSA_real, PM_JSA_imag, npts);
	    // var N = 1;

	    for (var i = 0; i < dim; i++) {
	        // PM_JSA = PhaseMatch.calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT[i], npts);
	        // var total = PhaseMatch.Sum(PM_JSA)/N;
	        var rates = PhaseMatch.calc_2HOM_rate(delT[i], ls_start, ls_stop, li_start, li_stop, PM_JSA_real, PM_JSA_imag, npts);
	        HOM_values_ss[i] = rates["ss"] / N;
	        HOM_values_ii[i] = rates["ii"] / N;
	        HOM_values_si[i] = rates["si"] / N;
	    }

	    return { "ss": HOM_values_ss, "ii": HOM_values_ii, "si": HOM_values_si };
	};

	/*
	 * calc_2HOM_scan()
	 * Calculates the HOM probability of coincidences over range of times for two identical sources.
	 * P is SPDC Properties object
	 * delT is the time delay between signal and idler
	 */
	PhaseMatch.calc_2HOM_scan_p = function calc_HOM_scan(P, delT, ls_start, ls_stop, li_start, li_stop, dim) {

	    var npts = 30; //number of points to pass to calc_JSA()
	    // dim = 20;
	    // var delT = PhaseMatch.linspace(t_start, t_stop, dim);
	    dim = delT.length;

	    var HOM_values_ss = new Float64Array(dim);
	    var HOM_values_ii = new Float64Array(dim);
	    var HOM_values_si = new Float64Array(dim);

	    var PM_JSA = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, npts); // Returns the complex JSA

	    var PM_JSA_real = PhaseMatch.create_2d_array(PM_JSA[0], npts, npts);
	    var PM_JSA_imag = PhaseMatch.create_2d_array(PM_JSA[1], npts, npts);

	    // Calculate normalization
	    var N = PhaseMatch.calc_2HOM_norm(PM_JSA_real, PM_JSA_imag, npts);
	    // var N = 1;

	    for (var i = 0; i < dim; i++) {
	        // PM_JSA = PhaseMatch.calc_HOM_JSA(P, ls_start, ls_stop, li_start, li_stop, delT[i], npts);
	        // var total = PhaseMatch.Sum(PM_JSA)/N;
	        var rates = PhaseMatch.calc_2HOM_rate(delT[i], ls_start, ls_stop, li_start, li_stop, PM_JSA_real, PM_JSA_imag, npts);
	        HOM_values_ss[i] = rates["ss"] / N;
	        HOM_values_ii[i] = rates["ii"] / N;
	        HOM_values_si[i] = rates["si"] / N;
	    }

	    // return {"ss":HOM_values_ss, "ii":HOM_values_ii, "si":HOM_values_si};
	    return [HOM_values_ss, HOM_values_ii, HOM_values_si];
	};

	/*
	 * calc_Schmidt
	 * Calculates the Schmidt number for a 2D matrix
	 * NOTE: The SVD routine has problems with odd dimensions
	 */
	PhaseMatch.calc_Schmidt = function calc_Schmidt(PM) {
	    // var PM2D = PhaseMatch.create2Darray(PM, dim,dim);

	    var l = PM.length;
	    var PMsqrt = new Array(l),
	        j,
	        i;

	    for (i = 0; i < l; i++) {
	        PMsqrt[i] = new Array(l);
	        for (j = 0; j < l; j++) {
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
	    for (j = 0; j < l; j++) {
	        Norm += sq(D[j]);
	    }

	    // var Norm = PhaseMatch.Sum(D); // Normalization
	    // console.log("normalization", Norm);

	    var Kinv = 0;
	    for (i = 0; i < l; i++) {
	        Kinv += sq(sq(D[i]) / Norm); //calculate the inverse of the Schmidt number
	    }
	    return 1 / Kinv;
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
	PhaseMatch.autorange_lambda = function autorange_lambda(props, threshold) {
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


	    threshold = threshold * PMmax['phasematch'];
	    // console.log(th)

	    var lambda_limit = function lambda_limit(lambda_s) {
	        P.lambda_s = lambda_s;
	        P.n_s = P.calc_Index_PMType(lambda_s, P.type, P.S_s, "signal");
	        P.lambda_i = 1 / (1 / P.lambda_p - 1 / lambda_s);
	        P.optimum_idler(P);

	        var PM = PhaseMatch.phasematch_Int_Phase(P);
	        // console.log(P.lambda_p/1e-9, P.lambda_s/1e-9, P.lambda_i/1e-9, PM)
	        return Math.abs(PM["phasematch"] - threshold);
	    };

	    var guess = P.lambda_s - 1e-9;
	    var ans = PhaseMatch.nelderMead(lambda_limit, guess, 50);
	    var ans2 = 1 / (1 / props.lambda_p - 1 / ans);

	    var l1 = Math.min(ans, ans2);
	    var l2 = Math.max(ans, ans2);
	    // console.log(l1/1e-9, l2/1e-9);

	    var dif = Math.abs(ans - props.lambda_s);
	    // console.log(PMmax,threshold,ans/1e-9, ans2/1e-9, P.lambda_s/1e-9, dif/1e-9);

	    //Now try to find sensible limits. We want to make sure the range of values isn't too big,
	    //but also ensure that if the pump bandwidth is small, that the resulting JSA is visible.
	    //This is important for calculating things like the Hong-Ou-Mandel.
	    var difmax = 2e-9 * P.lambda_p / 775e-9 * P.p_bw / 1e-9;

	    // console.log("diff = ", dif/1e-9, difmax/1e-9);

	    if (difmax > 35e-9) {
	        difmax = 35e-9;
	    }

	    if (dif > difmax) {
	        dif = difmax;
	    }

	    var ls_a = props.lambda_s - 10 * dif;
	    var ls_b = props.lambda_s + 10 * dif;

	    // var li_a = props.lambda_i - 3 * dif;
	    // var li_b = props.lambda_i + 3 * dif;

	    // var ls_a = 1/(1/l1 + 1/l2)*2 - 3 * dif;
	    // var ls_b = 1/(1/l1 + 1/l2)*2 + 3 * dif;

	    var li_a = 1 / (1 / P.lambda_p - 1 / ls_b);
	    var li_b = 1 / (1 / P.lambda_p - 1 / ls_a);

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

	PhaseMatch.autorange_delT = function autorange_delT(props, lambda_start, lambda_stop) {
	    // var P = props.clone();
	    var con = PhaseMatch.constants;

	    var gv_s = props.get_group_velocity(props.lambda_s, props.type, props.S_s, "signal");
	    var gv_i = props.get_group_velocity(props.lambda_i, props.type, props.S_i, "idler");

	    // var zero_delay = props.L * (1/gv_i - 1/gv_s)/2;
	    var zero_delay = 0;
	    // console.log("minimum of HOM dip = ", zero_delay/1e-15);

	    var bw = Math.abs(lambda_stop - lambda_start);
	    var coh_time = 1 / (2 * Math.PI * con.c / sq(lambda_start + bw / 2) * bw);

	    var t_start = zero_delay - 40 * coh_time;
	    var t_stop = zero_delay + 40 * coh_time;

	    return [zero_delay, t_start, t_stop];
	};

	PhaseMatch.autorange_delT_2crystal = function autorange_delT_2crystal(props, lambda_start, lambda_stop) {
	    // var P = props.clone();
	    var con = PhaseMatch.constants;

	    var gv_s = props.get_group_velocity(props.lambda_s, props.type, props.S_s, "signal");
	    var gv_i = props.get_group_velocity(props.lambda_i, props.type, props.S_i, "idler");

	    // var zero_delay = props.L * (1/gv_i - 1/gv_s)/2;
	    var zero_delay = 0;
	    // console.log("minimum of HOM dip = ", zero_delay/1e-15);

	    var bw = Math.abs(lambda_stop - lambda_start);
	    var coh_time = 1 / (2 * Math.PI * con.c / sq(lambda_start + bw / 2) * bw);

	    var t_start = zero_delay - 40 * coh_time;
	    var t_stop = zero_delay + 40 * coh_time;

	    return [zero_delay, t_start, t_stop];
	};

	PhaseMatch.autorange_theta = function autorange_theta(props) {
	    var P = props.clone();
	    P.update_all_angles();
	    var offset = 2 * Math.PI / 180;
	    var dif = P.theta_s - P.theta_s * 0.3;
	    var theta_start = dif * (1 - 1e-6 / P.W);
	    theta_start = Math.max(0, theta_start);
	    // var theta_end = P.theta_s + P.theta_s*0.4;
	    var theta_end = P.theta_s + (P.theta_s - theta_start);
	    theta_end = Math.max(2 * Math.PI / 180, theta_end);
	    // console.log("Before", theta_start*180/Math.PI, theta_end*180/Math.PI);
	    P.theta_s = theta_start;
	    P.update_all_angles();
	    theta_start = PhaseMatch.find_external_angle(P, "signal");

	    P.theta_s = theta_end;
	    P.update_all_angles();
	    theta_end = PhaseMatch.find_external_angle(P, "signal");
	    // console.log("after", theta_start*180/Math.PI, theta_end*180/Math.PI);

	    // console.log("optimal theta", theta_start*180/Math.PI, theta_end*theta_start*180/Math.PI);

	    return [theta_start, theta_end];
	};

	PhaseMatch.autorange_poling_period = function autorange_poling_period(props) {
	    var P = props.clone();
	    P.theta = Math.PI / 2; //set the angle to 0
	    P.update_all_angles();
	    P.calc_poling_period();
	    var diff = 50e-6;
	    var poling_start = P.poling_period - diff;
	    var poling_end = P.poling_period + diff;

	    if (poling_start < 0) {
	        poling_start = 1e-6;
	    }

	    return [poling_start, poling_end];
	};

	PhaseMatch.find_internal_angle = function find_internal_angle(props, photon) {
	    var P = props.clone(),
	        snell_external,
	        guess,
	        min_snells_law;

	    if (photon === 'signal') {
	        snell_external = Math.sin(props.theta_s_e);

	        min_snells_law = function min_snells_law(theta_internal) {
	            if (theta_internal > Math.PI / 2 || theta_internal < 0) {
	                return 1e12;
	            }
	            P.theta_s = theta_internal;

	            P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
	            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

	            return Math.abs(snell_external - P.n_s * Math.sin(P.theta_s));
	        };

	        //Initial guess
	        guess = props.theta_s;
	        // guess = 16*Math.PI/180;
	    }
	    if (photon === 'idler') {
	        // var offset = 0.45/180*Math.PI;
	        // props.theta_i_e = props.theta_i_e + offset;

	        snell_external = Math.sin(props.theta_i_e);

	        min_snells_law = function min_snells_law(theta_internal) {
	            if (theta_internal > Math.PI / 2 || theta_internal < 0) {
	                return 1e12;
	            }
	            P.theta_i = theta_internal;

	            P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
	            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

	            return Math.abs(snell_external - P.n_i * Math.sin(P.theta_i));
	        };

	        //Initial guess
	        guess = props.theta_i;
	        // guess = 45*Math.PI/180;
	    }
	    var ans = PhaseMatch.nelderMead(min_snells_law, guess, 40);
	    // console.log("Internal angle is: ", ans*180/Math.PI, props.theta_s*180/Math.PI );
	    return ans;
	};

	PhaseMatch.find_external_angle = function find_external_angle(props, photon) {
	    var theta_external = 0,
	        arg;

	    if (photon === 'signal') {
	        arg = props.n_s * Math.sin(props.theta_s);
	        theta_external = Math.asin(arg);
	    }
	    if (photon === 'idler') {
	        arg = props.n_i * Math.sin(props.theta_i);
	        theta_external = Math.asin(arg);
	    }

	    // console.log("External angle is: ", theta_external*180/Math.PI, props.theta_s*180/Math.PI );
	    return theta_external;
	};

	PhaseMatch.swap_signal_idler = function swap_signal_idler(P) {
	    // Swap role of signal and idler. Useful for calculating Idler properties
	    var tempLambda = P.lambda_s,
	        tempTheta = P.theta_s,
	        tempPhis = P.phi_s,
	        tempNs = P.n_s,
	        tempSs = P.S_s,
	        tempW_sx = P.W_sx,
	        tempW_sy = P.W_sy,
	        tempTheta_se = P.theta_s_e;

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

	if (true) {
	    // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return PhaseMatch;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(16)
	  , toLength  = __webpack_require__(9)
	  , toIndex   = __webpack_require__(40);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global            = __webpack_require__(3)
	  , $export           = __webpack_require__(1)
	  , redefine          = __webpack_require__(14)
	  , redefineAll       = __webpack_require__(38)
	  , meta              = __webpack_require__(30)
	  , forOf             = __webpack_require__(44)
	  , anInstance        = __webpack_require__(33)
	  , isObject          = __webpack_require__(5)
	  , fails             = __webpack_require__(4)
	  , $iterDetect       = __webpack_require__(61)
	  , setToStringTag    = __webpack_require__(46)
	  , inheritIfRequired = __webpack_require__(78);

	module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
	  var Base  = global[NAME]
	    , C     = Base
	    , ADDER = IS_MAP ? 'set' : 'add'
	    , proto = C && C.prototype
	    , O     = {};
	  var fixMethod = function(KEY){
	    var fn = proto[KEY];
	    redefine(proto, KEY,
	      KEY == 'delete' ? function(a){
	        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
	      } : KEY == 'has' ? function has(a){
	        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
	      } : KEY == 'get' ? function get(a){
	        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
	      } : KEY == 'add' ? function add(a){ fn.call(this, a === 0 ? 0 : a); return this; }
	        : function set(a, b){ fn.call(this, a === 0 ? 0 : a, b); return this; }
	    );
	  };
	  if(typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
	    new C().entries().next();
	  }))){
	    // create collection constructor
	    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
	    redefineAll(C.prototype, methods);
	    meta.NEED = true;
	  } else {
	    var instance             = new C
	      // early implementations not supports chaining
	      , HASNT_CHAINING       = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance
	      // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
	      , THROWS_ON_PRIMITIVES = fails(function(){ instance.has(1); })
	      // most early implementations doesn't supports iterables, most modern - not close it correctly
	      , ACCEPT_ITERABLES     = $iterDetect(function(iter){ new C(iter); }) // eslint-disable-line no-new
	      // for early implementations -0 and +0 not the same
	      , BUGGY_ZERO = !IS_WEAK && fails(function(){
	        // V8 ~ Chromium 42- fails only with 5+ elements
	        var $instance = new C()
	          , index     = 5;
	        while(index--)$instance[ADDER](index, index);
	        return !$instance.has(-0);
	      });
	    if(!ACCEPT_ITERABLES){ 
	      C = wrapper(function(target, iterable){
	        anInstance(target, C, NAME);
	        var that = inheritIfRequired(new Base, target, C);
	        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
	        return that;
	      });
	      C.prototype = proto;
	      proto.constructor = C;
	    }
	    if(THROWS_ON_PRIMITIVES || BUGGY_ZERO){
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }
	    if(BUGGY_ZERO || HASNT_CHAINING)fixMethod(ADDER);
	    // weak collections should not contains .clear method
	    if(IS_WEAK && proto.clear)delete proto.clear;
	  }

	  setToStringTag(C, NAME);

	  O[NAME] = C;
	  $export($export.G + $export.W + $export.F * (C != Base), O);

	  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

	  return C;
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var hide     = __webpack_require__(13)
	  , redefine = __webpack_require__(14)
	  , fails    = __webpack_require__(4)
	  , defined  = __webpack_require__(20)
	  , wks      = __webpack_require__(6);

	module.exports = function(KEY, length, exec){
	  var SYMBOL   = wks(KEY)
	    , fns      = exec(defined, SYMBOL, ''[KEY])
	    , strfn    = fns[0]
	    , rxfn     = fns[1];
	  if(fails(function(){
	    var O = {};
	    O[SYMBOL] = function(){ return 7; };
	    return ''[KEY](O) != 7;
	  })){
	    redefine(String.prototype, KEY, strfn);
	    hide(RegExp.prototype, SYMBOL, length == 2
	      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	      ? function(string, arg){ return rxfn.call(string, this, arg); }
	      // 21.2.5.6 RegExp.prototype[@@match](string)
	      // 21.2.5.9 RegExp.prototype[@@search](string)
	      : function(string){ return rxfn.call(string, this); }
	    );
	  }
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 21.2.5.3 get RegExp.prototype.flags
	var anObject = __webpack_require__(2);
	module.exports = function(){
	  var that   = anObject(this)
	    , result = '';
	  if(that.global)     result += 'g';
	  if(that.ignoreCase) result += 'i';
	  if(that.multiline)  result += 'm';
	  if(that.unicode)    result += 'u';
	  if(that.sticky)     result += 'y';
	  return result;
	};

/***/ },
/* 59 */
/***/ function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return              fn.apply(that, args);
	};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.8 IsRegExp(argument)
	var isObject = __webpack_require__(5)
	  , cof      = __webpack_require__(19)
	  , MATCH    = __webpack_require__(6)('match');
	module.exports = function(it){
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
	};

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(6)('iterator')
	  , SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }

	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	// Forced replacement prototype accessors methods
	module.exports = __webpack_require__(34)|| !__webpack_require__(4)(function(){
	  var K = Math.random();
	  // In FF throws only define methods
	  __defineSetter__.call(null, K, function(){ /* empty */});
	  delete __webpack_require__(3)[K];
	});

/***/ },
/* 63 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(3)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(3)
	  , hide   = __webpack_require__(13)
	  , uid    = __webpack_require__(41)
	  , TYPED  = uid('typed_array')
	  , VIEW   = uid('view')
	  , ABV    = !!(global.ArrayBuffer && global.DataView)
	  , CONSTR = ABV
	  , i = 0, l = 9, Typed;

	var TypedArrayConstructors = (
	  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
	).split(',');

	while(i < l){
	  if(Typed = global[TypedArrayConstructors[i++]]){
	    hide(Typed.prototype, TYPED, true);
	    hide(Typed.prototype, VIEW, true);
	  } else CONSTR = false;
	}

	module.exports = {
	  ABV:    ABV,
	  CONSTR: CONSTR,
	  TYPED:  TYPED,
	  VIEW:   VIEW
	};

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var listCacheClear = __webpack_require__(393),
	    listCacheDelete = __webpack_require__(394),
	    listCacheGet = __webpack_require__(395),
	    listCacheHas = __webpack_require__(396),
	    listCacheSet = __webpack_require__(397);

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

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	module.exports = ListCache;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(103);

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

	module.exports = assocIndexOf;


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var isKeyable = __webpack_require__(391);

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

	module.exports = getMapData;


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(42);

	/* Built-in method references that are verified to be native. */
	var nativeCreate = getNative(Object, 'create');

	module.exports = nativeCreate;


/***/ },
/* 70 */
/***/ function(module, exports) {

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

	module.exports = isArray;


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var arrayLikeKeys = __webpack_require__(349),
	    baseKeys = __webpack_require__(358),
	    isArrayLike = __webpack_require__(104);

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

	module.exports = keys;


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
	'use strict';
	var toObject = __webpack_require__(10)
	  , toIndex  = __webpack_require__(40)
	  , toLength = __webpack_require__(9);
	module.exports = function fill(value /*, start = 0, end = @length */){
	  var O      = toObject(this)
	    , length = toLength(O.length)
	    , aLen   = arguments.length
	    , index  = toIndex(aLen > 1 ? arguments[1] : undefined, length)
	    , end    = aLen > 2 ? arguments[2] : undefined
	    , endPos = end === undefined ? length : toIndex(end, length);
	  while(endPos > index)O[index++] = value;
	  return O;
	};

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $defineProperty = __webpack_require__(8)
	  , createDesc      = __webpack_require__(31);

	module.exports = function(object, index, value){
	  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
	  else object[index] = value;
	};

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(5)
	  , document = __webpack_require__(3).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 75 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var MATCH = __webpack_require__(6)('match');
	module.exports = function(KEY){
	  var re = /./;
	  try {
	    '/./'[KEY](re);
	  } catch(e){
	    try {
	      re[MATCH] = false;
	      return !'/./'[KEY](re);
	    } catch(f){ /* empty */ }
	  } return true;
	};

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(3).document && document.documentElement;

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	var isObject       = __webpack_require__(5)
	  , setPrototypeOf = __webpack_require__(86).set;
	module.exports = function(that, target, C){
	  var P, S = target.constructor;
	  if(S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf){
	    setPrototypeOf(that, P);
	  } return that;
	};

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(45)
	  , ITERATOR   = __webpack_require__(6)('iterator')
	  , ArrayProto = Array.prototype;

	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(19);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(35)
	  , descriptor     = __webpack_require__(31)
	  , setToStringTag = __webpack_require__(46)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(13)(IteratorPrototype, __webpack_require__(6)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(34)
	  , $export        = __webpack_require__(1)
	  , redefine       = __webpack_require__(14)
	  , hide           = __webpack_require__(13)
	  , has            = __webpack_require__(11)
	  , Iterators      = __webpack_require__(45)
	  , $iterCreate    = __webpack_require__(81)
	  , setToStringTag = __webpack_require__(46)
	  , getPrototypeOf = __webpack_require__(18)
	  , ITERATOR       = __webpack_require__(6)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';

	var returnThis = function(){ return this; };

	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 83 */
/***/ function(module, exports) {

	// 20.2.2.14 Math.expm1(x)
	var $expm1 = Math.expm1;
	module.exports = (!$expm1
	  // Old FF bug
	  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
	  // Tor Browser bug
	  || $expm1(-2e-17) != -2e-17
	) ? function expm1(x){
	  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
	} : $expm1;

/***/ },
/* 84 */
/***/ function(module, exports) {

	// 20.2.2.28 Math.sign(x)
	module.exports = Math.sign || function sign(x){
	  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
	};

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(3)
	  , macrotask = __webpack_require__(93).set
	  , Observer  = global.MutationObserver || global.WebKitMutationObserver
	  , process   = global.process
	  , Promise   = global.Promise
	  , isNode    = __webpack_require__(19)(process) == 'process';

	module.exports = function(){
	  var head, last, notify;

	  var flush = function(){
	    var parent, fn;
	    if(isNode && (parent = process.domain))parent.exit();
	    while(head){
	      fn   = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch(e){
	        if(head)notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if(parent)parent.enter();
	  };

	  // Node.js
	  if(isNode){
	    notify = function(){
	      process.nextTick(flush);
	    };
	  // browsers with MutationObserver
	  } else if(Observer){
	    var toggle = true
	      , node   = document.createTextNode('');
	    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
	    notify = function(){
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if(Promise && Promise.resolve){
	    var promise = Promise.resolve();
	    notify = function(){
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function(){
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global, flush);
	    };
	  }

	  return function(fn){
	    var task = {fn: fn, next: undefined};
	    if(last)last.next = task;
	    if(!head){
	      head = task;
	      notify();
	    } last = task;
	  };
	};

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var isObject = __webpack_require__(5)
	  , anObject = __webpack_require__(2);
	var check = function(O, proto){
	  anObject(O);
	  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function(test, buggy, set){
	      try {
	        set = __webpack_require__(26)(Function.call, __webpack_require__(17).f(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch(e){ buggy = true; }
	      return function setPrototypeOf(O, proto){
	        check(O, proto);
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(64)('keys')
	  , uid    = __webpack_require__(41);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject  = __webpack_require__(2)
	  , aFunction = __webpack_require__(12)
	  , SPECIES   = __webpack_require__(6)('species');
	module.exports = function(O, D){
	  var C = anObject(O).constructor, S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(32)
	  , defined   = __webpack_require__(20);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	// helper for String#{startsWith, endsWith, includes}
	var isRegExp = __webpack_require__(60)
	  , defined  = __webpack_require__(20);

	module.exports = function(that, searchString, NAME){
	  if(isRegExp(searchString))throw TypeError('String#' + NAME + " doesn't accept regex!");
	  return String(defined(that));
	};

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var toInteger = __webpack_require__(32)
	  , defined   = __webpack_require__(20);

	module.exports = function repeat(count){
	  var str = String(defined(this))
	    , res = ''
	    , n   = toInteger(count);
	  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
	  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
	  return res;
	};

/***/ },
/* 92 */
/***/ function(module, exports) {

	module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
	  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var ctx                = __webpack_require__(26)
	  , invoke             = __webpack_require__(59)
	  , html               = __webpack_require__(77)
	  , cel                = __webpack_require__(74)
	  , global             = __webpack_require__(3)
	  , process            = global.process
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	var run = function(){
	  var id = +this;
	  if(queue.hasOwnProperty(id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function(event){
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!setTask || !clearTask){
	  setTask = function setImmediate(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(__webpack_require__(19)(process) == 'process'){
	    defer = function(id){
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if(MessageChannel){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
	    defer = function(id){
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listener, false);
	  // IE8-
	  } else if(ONREADYSTATECHANGE in cel('script')){
	    defer = function(id){
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global         = __webpack_require__(3)
	  , DESCRIPTORS    = __webpack_require__(7)
	  , LIBRARY        = __webpack_require__(34)
	  , $typed         = __webpack_require__(65)
	  , hide           = __webpack_require__(13)
	  , redefineAll    = __webpack_require__(38)
	  , fails          = __webpack_require__(4)
	  , anInstance     = __webpack_require__(33)
	  , toInteger      = __webpack_require__(32)
	  , toLength       = __webpack_require__(9)
	  , gOPN           = __webpack_require__(36).f
	  , dP             = __webpack_require__(8).f
	  , arrayFill      = __webpack_require__(72)
	  , setToStringTag = __webpack_require__(46)
	  , ARRAY_BUFFER   = 'ArrayBuffer'
	  , DATA_VIEW      = 'DataView'
	  , PROTOTYPE      = 'prototype'
	  , WRONG_LENGTH   = 'Wrong length!'
	  , WRONG_INDEX    = 'Wrong index!'
	  , $ArrayBuffer   = global[ARRAY_BUFFER]
	  , $DataView      = global[DATA_VIEW]
	  , Math           = global.Math
	  , RangeError     = global.RangeError
	  , Infinity       = global.Infinity
	  , BaseBuffer     = $ArrayBuffer
	  , abs            = Math.abs
	  , pow            = Math.pow
	  , floor          = Math.floor
	  , log            = Math.log
	  , LN2            = Math.LN2
	  , BUFFER         = 'buffer'
	  , BYTE_LENGTH    = 'byteLength'
	  , BYTE_OFFSET    = 'byteOffset'
	  , $BUFFER        = DESCRIPTORS ? '_b' : BUFFER
	  , $LENGTH        = DESCRIPTORS ? '_l' : BYTE_LENGTH
	  , $OFFSET        = DESCRIPTORS ? '_o' : BYTE_OFFSET;

	// IEEE754 conversions based on https://github.com/feross/ieee754
	var packIEEE754 = function(value, mLen, nBytes){
	  var buffer = Array(nBytes)
	    , eLen   = nBytes * 8 - mLen - 1
	    , eMax   = (1 << eLen) - 1
	    , eBias  = eMax >> 1
	    , rt     = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0
	    , i      = 0
	    , s      = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0
	    , e, m, c;
	  value = abs(value)
	  if(value != value || value === Infinity){
	    m = value != value ? 1 : 0;
	    e = eMax;
	  } else {
	    e = floor(log(value) / LN2);
	    if(value * (c = pow(2, -e)) < 1){
	      e--;
	      c *= 2;
	    }
	    if(e + eBias >= 1){
	      value += rt / c;
	    } else {
	      value += rt * pow(2, 1 - eBias);
	    }
	    if(value * c >= 2){
	      e++;
	      c /= 2;
	    }
	    if(e + eBias >= eMax){
	      m = 0;
	      e = eMax;
	    } else if(e + eBias >= 1){
	      m = (value * c - 1) * pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * pow(2, eBias - 1) * pow(2, mLen);
	      e = 0;
	    }
	  }
	  for(; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
	  e = e << mLen | m;
	  eLen += mLen;
	  for(; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
	  buffer[--i] |= s * 128;
	  return buffer;
	};
	var unpackIEEE754 = function(buffer, mLen, nBytes){
	  var eLen  = nBytes * 8 - mLen - 1
	    , eMax  = (1 << eLen) - 1
	    , eBias = eMax >> 1
	    , nBits = eLen - 7
	    , i     = nBytes - 1
	    , s     = buffer[i--]
	    , e     = s & 127
	    , m;
	  s >>= 7;
	  for(; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
	  m = e & (1 << -nBits) - 1;
	  e >>= -nBits;
	  nBits += mLen;
	  for(; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
	  if(e === 0){
	    e = 1 - eBias;
	  } else if(e === eMax){
	    return m ? NaN : s ? -Infinity : Infinity;
	  } else {
	    m = m + pow(2, mLen);
	    e = e - eBias;
	  } return (s ? -1 : 1) * m * pow(2, e - mLen);
	};

	var unpackI32 = function(bytes){
	  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
	};
	var packI8 = function(it){
	  return [it & 0xff];
	};
	var packI16 = function(it){
	  return [it & 0xff, it >> 8 & 0xff];
	};
	var packI32 = function(it){
	  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
	};
	var packF64 = function(it){
	  return packIEEE754(it, 52, 8);
	};
	var packF32 = function(it){
	  return packIEEE754(it, 23, 4);
	};

	var addGetter = function(C, key, internal){
	  dP(C[PROTOTYPE], key, {get: function(){ return this[internal]; }});
	};

	var get = function(view, bytes, index, isLittleEndian){
	  var numIndex = +index
	    , intIndex = toInteger(numIndex);
	  if(numIndex != intIndex || intIndex < 0 || intIndex + bytes > view[$LENGTH])throw RangeError(WRONG_INDEX);
	  var store = view[$BUFFER]._b
	    , start = intIndex + view[$OFFSET]
	    , pack  = store.slice(start, start + bytes);
	  return isLittleEndian ? pack : pack.reverse();
	};
	var set = function(view, bytes, index, conversion, value, isLittleEndian){
	  var numIndex = +index
	    , intIndex = toInteger(numIndex);
	  if(numIndex != intIndex || intIndex < 0 || intIndex + bytes > view[$LENGTH])throw RangeError(WRONG_INDEX);
	  var store = view[$BUFFER]._b
	    , start = intIndex + view[$OFFSET]
	    , pack  = conversion(+value);
	  for(var i = 0; i < bytes; i++)store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
	};

	var validateArrayBufferArguments = function(that, length){
	  anInstance(that, $ArrayBuffer, ARRAY_BUFFER);
	  var numberLength = +length
	    , byteLength   = toLength(numberLength);
	  if(numberLength != byteLength)throw RangeError(WRONG_LENGTH);
	  return byteLength;
	};

	if(!$typed.ABV){
	  $ArrayBuffer = function ArrayBuffer(length){
	    var byteLength = validateArrayBufferArguments(this, length);
	    this._b       = arrayFill.call(Array(byteLength), 0);
	    this[$LENGTH] = byteLength;
	  };

	  $DataView = function DataView(buffer, byteOffset, byteLength){
	    anInstance(this, $DataView, DATA_VIEW);
	    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
	    var bufferLength = buffer[$LENGTH]
	      , offset       = toInteger(byteOffset);
	    if(offset < 0 || offset > bufferLength)throw RangeError('Wrong offset!');
	    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
	    if(offset + byteLength > bufferLength)throw RangeError(WRONG_LENGTH);
	    this[$BUFFER] = buffer;
	    this[$OFFSET] = offset;
	    this[$LENGTH] = byteLength;
	  };

	  if(DESCRIPTORS){
	    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
	    addGetter($DataView, BUFFER, '_b');
	    addGetter($DataView, BYTE_LENGTH, '_l');
	    addGetter($DataView, BYTE_OFFSET, '_o');
	  }

	  redefineAll($DataView[PROTOTYPE], {
	    getInt8: function getInt8(byteOffset){
	      return get(this, 1, byteOffset)[0] << 24 >> 24;
	    },
	    getUint8: function getUint8(byteOffset){
	      return get(this, 1, byteOffset)[0];
	    },
	    getInt16: function getInt16(byteOffset /*, littleEndian */){
	      var bytes = get(this, 2, byteOffset, arguments[1]);
	      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
	    },
	    getUint16: function getUint16(byteOffset /*, littleEndian */){
	      var bytes = get(this, 2, byteOffset, arguments[1]);
	      return bytes[1] << 8 | bytes[0];
	    },
	    getInt32: function getInt32(byteOffset /*, littleEndian */){
	      return unpackI32(get(this, 4, byteOffset, arguments[1]));
	    },
	    getUint32: function getUint32(byteOffset /*, littleEndian */){
	      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
	    },
	    getFloat32: function getFloat32(byteOffset /*, littleEndian */){
	      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
	    },
	    getFloat64: function getFloat64(byteOffset /*, littleEndian */){
	      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
	    },
	    setInt8: function setInt8(byteOffset, value){
	      set(this, 1, byteOffset, packI8, value);
	    },
	    setUint8: function setUint8(byteOffset, value){
	      set(this, 1, byteOffset, packI8, value);
	    },
	    setInt16: function setInt16(byteOffset, value /*, littleEndian */){
	      set(this, 2, byteOffset, packI16, value, arguments[2]);
	    },
	    setUint16: function setUint16(byteOffset, value /*, littleEndian */){
	      set(this, 2, byteOffset, packI16, value, arguments[2]);
	    },
	    setInt32: function setInt32(byteOffset, value /*, littleEndian */){
	      set(this, 4, byteOffset, packI32, value, arguments[2]);
	    },
	    setUint32: function setUint32(byteOffset, value /*, littleEndian */){
	      set(this, 4, byteOffset, packI32, value, arguments[2]);
	    },
	    setFloat32: function setFloat32(byteOffset, value /*, littleEndian */){
	      set(this, 4, byteOffset, packF32, value, arguments[2]);
	    },
	    setFloat64: function setFloat64(byteOffset, value /*, littleEndian */){
	      set(this, 8, byteOffset, packF64, value, arguments[2]);
	    }
	  });
	} else {
	  if(!fails(function(){
	    new $ArrayBuffer;     // eslint-disable-line no-new
	  }) || !fails(function(){
	    new $ArrayBuffer(.5); // eslint-disable-line no-new
	  })){
	    $ArrayBuffer = function ArrayBuffer(length){
	      return new BaseBuffer(validateArrayBufferArguments(this, length));
	    };
	    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
	    for(var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j; ){
	      if(!((key = keys[j++]) in $ArrayBuffer))hide($ArrayBuffer, key, BaseBuffer[key]);
	    };
	    if(!LIBRARY)ArrayBufferProto.constructor = $ArrayBuffer;
	  }
	  // iOS Safari 7.x bug
	  var view = new $DataView(new $ArrayBuffer(2))
	    , $setInt8 = $DataView[PROTOTYPE].setInt8;
	  view.setInt8(0, 2147483648);
	  view.setInt8(1, 2147483649);
	  if(view.getInt8(0) || !view.getInt8(1))redefineAll($DataView[PROTOTYPE], {
	    setInt8: function setInt8(byteOffset, value){
	      $setInt8.call(this, byteOffset, value << 24 >> 24);
	    },
	    setUint8: function setUint8(byteOffset, value){
	      $setInt8.call(this, byteOffset, value << 24 >> 24);
	    }
	  }, true);
	}
	setToStringTag($ArrayBuffer, ARRAY_BUFFER);
	setToStringTag($DataView, DATA_VIEW);
	hide($DataView[PROTOTYPE], $typed.VIEW, true);
	exports[ARRAY_BUFFER] = $ArrayBuffer;
	exports[DATA_VIEW] = $DataView;

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var global         = __webpack_require__(3)
	  , core           = __webpack_require__(25)
	  , LIBRARY        = __webpack_require__(34)
	  , wksExt         = __webpack_require__(130)
	  , defineProperty = __webpack_require__(8).f;
	module.exports = function(name){
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
	};

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(49)
	  , ITERATOR  = __webpack_require__(6)('iterator')
	  , Iterators = __webpack_require__(45);
	module.exports = __webpack_require__(25).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(43)
	  , step             = __webpack_require__(118)
	  , Iterators        = __webpack_require__(45)
	  , toIObject        = __webpack_require__(16);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(82)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(42),
	    root = __webpack_require__(29);

	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map');

	module.exports = Map;


/***/ },
/* 99 */
/***/ function(module, exports) {

	/** Built-in value references. */
	var defineProperty = Object.defineProperty;

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

	module.exports = baseAssignValue;


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var Uint8Array = __webpack_require__(343);

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

	module.exports = cloneArrayBuffer;


/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	var assignValue = __webpack_require__(138),
	    baseAssignValue = __webpack_require__(99);

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

	module.exports = copyObject;


/***/ },
/* 102 */
/***/ function(module, exports) {

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

	module.exports = overArg;


/***/ },
/* 103 */
/***/ function(module, exports) {

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

	module.exports = eq;


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(148),
	    isLength = __webpack_require__(419);

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

	module.exports = isArrayLike;


/***/ },
/* 105 */
/***/ function(module, exports) {

	'use strict';

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
	        var a_cost = objFunc(a),
	            b_cost = objFunc(b);

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

	    var centroid_n = this.vertices.length - 1,
	        centroid_sum = 0,
	        i;
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
	    var best_x = this.vertices[0],
	        a;
	    for (a = 1; a < this.vertices.length; a += 1) {
	        this.vertices[a] = best_x + 0.5 * (this.vertices[a] - best_x); //0.1 + 0.5(0.1-0.1)
	    }
	};

	var nelderMead = function nelderMead(objFunc, x0, numIters) {

	    //This is our Simplex object that will mutate based on the behavior of the objective function objFunc
	    var S = new Simplex([x0, x0 + 1, x0 + 2]),
	        itr,
	        x;

	    for (itr = 0; itr < numIters; itr += 1) {

	        S.updateCentroid(objFunc); //needs to know which objFunc to hand to sortByCost
	        S.updateReflectPoint(objFunc);

	        x = S.vertices[0];

	        if (S.reflect_cost < S.getVertexCost(objFunc, 'secondWorst') && S.reflect_cost > S.getVertexCost(objFunc, 'best')) {
	            S.reflect();
	        } else if (S.reflect_cost < S.getVertexCost(objFunc, 'best')) {
	            //new point is better than previous best: expand

	            S.updateExpandPoint(objFunc);

	            if (S.expand_cost < S.reflect_cost) {
	                S.expand();
	            } else {
	                S.reflect();
	            }
	        } else {
	            //new point was worse than all current points: contract

	            S.updateContractPoint(objFunc);

	            if (S.contract_cost < S.getVertexCost(objFunc, 'worst')) {
	                S.contract();
	            } else {
	                S.reduce();
	            }
	        }
	    }

	    return x;
	};

	module.exports = nelderMead;

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var crystals = {};
	var cloneDeep = __webpack_require__(145);
	var sq = __webpack_require__(48).sq;

	// defaults defined for every crystal
	var defaults = {

	    name: 'Unnamed Crystal',
	    temp: 20,
	    info: '',

	    indicies: function indicies() {
	        return [1, 1, 1];
	    }
	};

	// get and set crystal db entries

	var Crystals = function Crystals(key, create) {

	    // invalid args
	    if (!key) {
	        return null;
	    }

	    if (!create && !(key in crystals)) {

	        throw 'Crystal type "' + key + ' not yet defined.';
	    }

	    if (create) {

	        if (key in crystals) {

	            throw 'Crystal type "' + key + ' already defined.';
	        }

	        crystals[key] = Object.assign({}, defaults, create, { id: key });
	    }

	    return cloneDeep(crystals[key]);
	};

	// get all crystal keynames
	Crystals.keys = function () {

	    return Object.keys(crystals);
	};

	/**
	 * These are the properties that are used to calculate phasematching
	 */

	/**
	 * BBO indicies.
	 */
	Crystals('BBO-1', {
	    name: 'BBO ref 1',
	    // info: '',
	    indicies: function indicies(lambda, temp) {
	        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
	        var lambda_sq = sq(lambda);
	        // http://www.newlightphotonics.com/bbo-properties.html & Alan Migdall
	        var no = Math.sqrt(2.7359 + 0.01878 / (lambda_sq - 0.01822) - 0.01354 * lambda_sq);
	        var ne = Math.sqrt(2.3753 + 0.01224 / (lambda_sq - 0.01667) - 0.01516 * lambda_sq);

	        //from Newlight Photonics
	        var dno = -9.3e-6;
	        var dne = -16.6e-6;

	        no = no + (temp - 20.0) * dno;
	        ne = ne + (temp - 20.0) * dne;

	        return [no, no, ne];
	    }
	});

	/**
	 * KTP indicies.
	 */
	Crystals('KTP-3', {
	    name: 'KTP ref 1',
	    // info: 'H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)',
	    info: 'Includes Franco Wong"s modificatin.  http://dx.doi.org/10.1063/1.1668320, http://www.redoptronics.com/KTP-crystal.html',
	    indicies: function indicies(lambda, temp) {
	        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
	        var lambda_sq = sq(lambda);

	        // http://www.redoptronics.com/KTP-crystal.html
	        var nx = Math.sqrt(2.10468 + 0.89342 * lambda_sq / (lambda_sq - 0.04438) - 0.01036 * lambda_sq);
	        var ny;

	        if (lambda < 1.2) {
	            ny = Math.sqrt(2.14559 + 0.87629 * lambda_sq / (lambda_sq - 0.0485) - 0.01173 * lambda_sq);
	        } else {
	            ny = Math.sqrt(2.0993 + 0.922683 * lambda_sq / (lambda_sq - 0.0467695) - 0.0138408 * lambda_sq);
	        }

	        var nz = Math.sqrt(1.9446 + 1.3617 * lambda_sq / (lambda_sq - 0.047) - 0.01491 * lambda_sq);

	        var dnx = 1.1e-5;
	        var dny = 1.3e-5;
	        var dnz = 1.6e-5;

	        nx = nx + (temp - 20.0) * dnx;
	        ny = ny + (temp - 20.0) * dny;
	        nz = nz + (temp - 20.0) * dnz;

	        // var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
	        // var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

	        return [nx, ny, nz];
	    }
	});

	/**
	 * BiBO indicies.
	 */
	Crystals('BiBO-1', {
	    name: 'BiBO ref 1',
	    info: 'http://www.newlightphotonics.com/bibo-properties.html',
	    indicies: function indicies(lambda, temp) {
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
	        var nx = Math.sqrt(3.0740 + 0.0323 / (lambda_sq - 0.0316) - 0.01337 * lambda_sq);
	        var ny = Math.sqrt(3.1685 + 0.0373 / (lambda_sq - 0.0346) - 0.01750 * lambda_sq);
	        var nz = Math.sqrt(3.6545 + 0.0511 / (lambda_sq - 0.0371) - 0.0226 * lambda_sq);

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
	Crystals('LiNbO3-1', {
	    name: 'LiNbO3 ref 1',
	    info: 'http://www.newlightphotonics.com/bibo-properties.html',
	    type: 'Negative Uniaxial',
	    cls: 'class_3m',
	    lambda_min: 0.4 * 1e-9,
	    lambda_max: 3.4 * 1e-9,
	    indicies: function indicies(lambda, temp) {
	        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
	        var lambda_sq = sq(lambda);
	        //Alan Migdal's program & http://www.redoptronics.com/linbo3-crystals.html
	        var nx = Math.sqrt(4.9048 - 0.11768 / (0.04750 - lambda_sq) - 0.027169 * lambda_sq);
	        var ny = nx;
	        var nz = Math.sqrt(4.5820 - 0.099169 / (0.044432 - lambda_sq) - 0.021950 * lambda_sq);

	        // http://www.redoptronics.com/linbo3-crystals.html
	        // var nx = Math.sqrt(4.9048+0.11768/(sq(lambda) - 0.04750) - 0.027169 * sq(lambda));
	        // var ny = nx
	        // var nz = Math.sqrt(4.5820+0.099169/(sq(lambda)- 0.04443) - 0.021950 * sq(lambda));

	        //http://www.newlightphotonics.com/LN-crystal.html
	        var dnx = -0.874e-6;
	        var dny = dnx;
	        var dnz = 39.073e-6;

	        nx = nx + (temp - 20.0) * dnx;
	        ny = ny + (temp - 20.0) * dny;
	        nz = nz + (temp - 20.0) * dnz;

	        return [nx, ny, nz];
	    }
	});

	/**
	 * LiNbO3 MGO doped indicies.
	 */
	Crystals('LiNB-MgO', {
	    name: 'LiNbO3 (5% MgO doped)',
	    info: 'Applied Physics B May 2008,Volume 91,Issue 2,pp 343-348',
	    type: '',
	    cls: '',
	    lambda_min: 440 * 1e-9,
	    lambda_max: 4000 * 1e-9,
	    indicies: function indicies(lambda, temp) {
	        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
	        var F = (temp - 24.5) * (temp + 570.82);

	        // Coefficients for the extraordinary index
	        var a1 = 5.756,
	            a2 = 0.0983,
	            a3 = 0.2020,
	            a4 = 189.32,
	            a5 = 12.52,
	            a6 = 1.32e-2,
	            b1 = 2.86e-6,
	            b2 = 4.7e-8,
	            b3 = 6.113e-8,
	            b4 = 1.516e-4;
	        var l2 = lambda * lambda;
	        var nz = Math.sqrt(a1 + b1 * F + (a2 + b2 * F) / (l2 - sq(a3 + b3 * F)) + (a4 + b4 * F) / (l2 - sq(a5)) - a6 * l2);

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

	        var nx = Math.sqrt(a1 + b1 * F + (a2 + b2 * F) / (l2 - sq(a3 + b3 * F)) + (a4 + b4 * F) / (l2 - sq(a5)) - a6 * l2);
	        var ny = nx;

	        return [nx, ny, nz];
	    }
	});

	/**
	 * LiNbO3 indicies.
	 */
	Crystals('KDP-1', {
	    name: 'KDP ref 1',
	    info: 'http://www.newlightphotonics.com/KDP-crystal.html',
	    type: 'Negative Uniaxial',
	    cls: 'class_3m',
	    lambda_min: 200 * 1e-9,
	    lambda_max: 1500 * 1e-9,
	    indicies: function indicies(lambda, temp) {
	        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
	        var lambda_sq = sq(lambda);

	        //Alan Migdal's program & http://www.redoptronics.com/linbo3-crystals.html
	        // var nx = Math.sqrt( 4.9048 - 0.11768/(0.04750 - sq(lambda)) - 0.027169*sq(lambda) );
	        var nx = Math.sqrt(2.259276 + 13.005522 * lambda_sq / (lambda_sq - 400) + 0.01008956 / (lambda_sq - 0.012942625));
	        var ny = nx;
	        // var nz = Math.sqrt( 4.5820 - 0.099169/(0.044432 - lambda_sq) -  0.021950*lambda_sq );
	        var nz = Math.sqrt(2.132668 + 3.2279924 * lambda_sq / (lambda_sq - 400) + 0.008637494 / (lambda_sq - 0.012281043));

	        // http://www.redoptronics.com/linbo3-crystals.html
	        // var nx = Math.sqrt(4.9048+0.11768/(sq(lambda) - 0.04750) - 0.027169 * sq(lambda));
	        // var ny = nx
	        // var nz = Math.sqrt(4.5820+0.099169/(sq(lambda)- 0.04443) - 0.021950 * sq(lambda));

	        //http://www.newlightphotonics.com/LN-crystal.html
	        var dnx = -0.874e-6;
	        var dny = dnx;
	        var dnz = 39.073e-6;

	        nx = nx + (temp - 20.0) * dnx;
	        ny = ny + (temp - 20.0) * dny;
	        nz = nz + (temp - 20.0) * dnz;

	        return [nx, ny, nz];
	    }
	});

	/**
	 * AGGaSe2
	 */
	Crystals('AgGaSe2-1', {
	    name: 'AgGaSe2 Ref 1',
	    info: 'H. Kildal, J. Mikkelsen, Opt. Commun. 9, 315 (1973)',
	    type: '',
	    cls: '',
	    lambda_min: 1000 * 1e-9,
	    lambda_max: 13500 * 1e-9,
	    indicies: function indicies(lambda, temp) {
	        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

	        var nx = Math.sqrt(3.9362 + 2.9113 / (1 - sq(0.38821 / lambda)) + 1.7954 / (1 - sq(40 / lambda))),
	            ny = nx,
	            nz = Math.sqrt(3.3132 + 3.3616 / (1 - sq(0.38201 / lambda)) + 1.7677 / (1 - sq(40 / lambda)));

	        // http://www.redoptronics.com/AgGaS2-AgGaSe2.html
	        var dnx = 15e-5,
	            dny = dnx,
	            dnz = 15e-5;

	        nx = nx + (temp - 20.0) * dnx;
	        ny = ny + (temp - 20.0) * dny;
	        nz = nz + (temp - 20.0) * dnz;
	        return [nx, ny, nz];
	    }
	});

	/**
	 * AGGaSe2
	 */
	Crystals('AgGaSe2-2', {
	    name: 'AgGaSe2 Ref 2',
	    info: 'G. C. Bhar, Appl. Opt., 15, 305 (1976)',
	    type: '',
	    cls: '',
	    lambda_min: 1000 * 1e-9,
	    lambda_max: 13500 * 1e-9,
	    indicies: function indicies(lambda, temp) {
	        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients

	        var nx = Math.sqrt(4.6453 + 2.2057 / (1 - sq(0.43347 / lambda)) + 1.8377 / (1 - sq(40 / lambda))),
	            ny = nx,
	            nz = Math.sqrt(5.2912 + 1.3970 / (1 - sq(0.53339 / lambda)) + 1.9282 / (1 - sq(40 / lambda)));

	        // Got temperature coefficients fro:
	        // http://www.redoptronics.com/AgGaS2-AgGaSe2.html
	        var dnx = 15e-5,
	            dny = dnx,
	            dnz = 15e-5;

	        nx = nx + (temp - 20.0) * dnx;
	        ny = ny + (temp - 20.0) * dny;
	        nz = nz + (temp - 20.0) * dnz;
	        return [nx, ny, nz];
	    }
	});

	/**
	 * AgGaS2
	 */
	Crystals('AgGaS2-1', {
	    name: 'AgGaS2 Ref 1',
	    info: 'G. C. Bhar, Appl. Opt., 15, 305 (1976)',
	    type: '',
	    cls: '',
	    lambda_min: 500 * 1e-9,
	    lambda_max: 13000 * 1e-9,
	    indicies: function indicies(lambda, temp) {
	        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
	        var lambda_sq = sq(lambda);

	        var nx = Math.sqrt(3.628 + 2.1686 * lambda_sq / (lambda_sq - 0.1003) + 2.1753 * lambda_sq / (lambda_sq - 950)),
	            ny = nx,
	            nz = Math.sqrt(4.0172 + 1.5274 * lambda_sq / (lambda_sq - 0.131) + 2.1699 * lambda_sq / (lambda_sq - 950));

	        // Got temperature coefficients fro:
	        // http://www.redoptronics.com/AgGaS2-AgGaSe2.html
	        var dnx = 15.4e-5,
	            dny = dnx,
	            dnz = 15.5e-5;

	        nx = nx + (temp - 20.0) * dnx;
	        ny = ny + (temp - 20.0) * dny;
	        nz = nz + (temp - 20.0) * dnz;
	        return [nx, ny, nz];
	    }
	});

	/**
	 * LiIO3 ref 1
	 */
	Crystals('LiIO3-1', {
	    name: 'LiIO3 Ref 1',
	    info: 'B. F. Levine, C. G. Bethea: Appl. Phys. Lett. 20, 272 (1972)',
	    type: 'Negative Uniaxial',
	    cls: 'Class 6',
	    lambda_min: 300 * 1e-9,
	    lambda_max: 5000 * 1e-9,
	    indicies: function indicies(lambda, temp) {
	        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
	        var lambda_sq = sq(lambda);

	        var nx = Math.sqrt(2.03132 + 1.37623 / (1 - 0.0350832 / lambda_sq) + 1.06745 / (1 - 169 / lambda_sq)),
	            ny = nx,
	            nz = Math.sqrt(1.83086 + 1.08807 / (1.0 - 0.031381 / lambda_sq) + 0.554582 / (1.0 - 158.76 / lambda_sq));
	        return [nx, ny, nz];
	    }
	});

	/**
	 * LiIO3 ref 2
	 */
	Crystals('LiIO3-2', {
	    name: 'LiIO3 Ref 2',
	    info: 'K. Takizawa, M. Okada, S. Leiri, Opt. Commun., 23, 279 (1977)',
	    type: 'Negative Uniaxial',
	    cls: 'Class 6',
	    lambda_min: 300 * 1e-9,
	    lambda_max: 5000 * 1e-9,
	    indicies: function indicies(lambda, temp) {
	        lambda = lambda * 1e6; //Convert for Sellmeir Coefficients
	        var lambda_sq = sq(lambda);

	        var nx = Math.sqrt(3.4095 + 0.047664 / (lambda_sq - 0.033991)),
	            ny = nx,
	            nz = Math.sqrt(2.9163 + 0.034514 / (lambda_sq - 0.031034));
	        return [nx, ny, nz];
	    }
	});

		module.exports = Crystals;

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	var cof = __webpack_require__(19);
	module.exports = function(it, msg){
	  if(typeof it != 'number' && cof(it) != 'Number')throw TypeError(msg);
	  return +it;
	};

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
	'use strict';
	var toObject = __webpack_require__(10)
	  , toIndex  = __webpack_require__(40)
	  , toLength = __webpack_require__(9);

	module.exports = [].copyWithin || function copyWithin(target/*= 0*/, start/*= 0, end = @length*/){
	  var O     = toObject(this)
	    , len   = toLength(O.length)
	    , to    = toIndex(target, len)
	    , from  = toIndex(start, len)
	    , end   = arguments.length > 2 ? arguments[2] : undefined
	    , count = Math.min((end === undefined ? len : toIndex(end, len)) - from, len - to)
	    , inc   = 1;
	  if(from < to && to < from + count){
	    inc  = -1;
	    from += count - 1;
	    to   += count - 1;
	  }
	  while(count-- > 0){
	    if(from in O)O[to] = O[from];
	    else delete O[to];
	    to   += inc;
	    from += inc;
	  } return O;
	};

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	var forOf = __webpack_require__(44);

	module.exports = function(iter, ITERATOR){
	  var result = [];
	  forOf(iter, false, result.push, result, ITERATOR);
	  return result;
	};


/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	var aFunction = __webpack_require__(12)
	  , toObject  = __webpack_require__(10)
	  , IObject   = __webpack_require__(50)
	  , toLength  = __webpack_require__(9);

	module.exports = function(that, callbackfn, aLen, memo, isRight){
	  aFunction(callbackfn);
	  var O      = toObject(that)
	    , self   = IObject(O)
	    , length = toLength(O.length)
	    , index  = isRight ? length - 1 : 0
	    , i      = isRight ? -1 : 1;
	  if(aLen < 2)for(;;){
	    if(index in self){
	      memo = self[index];
	      index += i;
	      break;
	    }
	    index += i;
	    if(isRight ? index < 0 : length <= index){
	      throw TypeError('Reduce of empty array with no initial value');
	    }
	  }
	  for(;isRight ? index >= 0 : length > index; index += i)if(index in self){
	    memo = callbackfn(memo, self[index], index, O);
	  }
	  return memo;
	};

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var aFunction  = __webpack_require__(12)
	  , isObject   = __webpack_require__(5)
	  , invoke     = __webpack_require__(59)
	  , arraySlice = [].slice
	  , factories  = {};

	var construct = function(F, len, args){
	  if(!(len in factories)){
	    for(var n = [], i = 0; i < len; i++)n[i] = 'a[' + i + ']';
	    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
	  } return factories[len](F, args);
	};

	module.exports = Function.bind || function bind(that /*, args... */){
	  var fn       = aFunction(this)
	    , partArgs = arraySlice.call(arguments, 1);
	  var bound = function(/* args... */){
	    var args = partArgs.concat(arraySlice.call(arguments));
	    return this instanceof bound ? construct(fn, args.length, args) : invoke(fn, args, that);
	  };
	  if(isObject(fn.prototype))bound.prototype = fn.prototype;
	  return bound;
	};

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var dP          = __webpack_require__(8).f
	  , create      = __webpack_require__(35)
	  , redefineAll = __webpack_require__(38)
	  , ctx         = __webpack_require__(26)
	  , anInstance  = __webpack_require__(33)
	  , defined     = __webpack_require__(20)
	  , forOf       = __webpack_require__(44)
	  , $iterDefine = __webpack_require__(82)
	  , step        = __webpack_require__(118)
	  , setSpecies  = __webpack_require__(39)
	  , DESCRIPTORS = __webpack_require__(7)
	  , fastKey     = __webpack_require__(30).fastKey
	  , SIZE        = DESCRIPTORS ? '_s' : 'size';

	var getEntry = function(that, key){
	  // fast case
	  var index = fastKey(key), entry;
	  if(index !== 'F')return that._i[index];
	  // frozen object case
	  for(entry = that._f; entry; entry = entry.n){
	    if(entry.k == key)return entry;
	  }
	};

	module.exports = {
	  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
	    var C = wrapper(function(that, iterable){
	      anInstance(that, C, NAME, '_i');
	      that._i = create(null); // index
	      that._f = undefined;    // first entry
	      that._l = undefined;    // last entry
	      that[SIZE] = 0;         // size
	      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear(){
	        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
	          entry.r = true;
	          if(entry.p)entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that._f = that._l = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function(key){
	        var that  = this
	          , entry = getEntry(that, key);
	        if(entry){
	          var next = entry.n
	            , prev = entry.p;
	          delete that._i[entry.i];
	          entry.r = true;
	          if(prev)prev.n = next;
	          if(next)next.p = prev;
	          if(that._f == entry)that._f = next;
	          if(that._l == entry)that._l = prev;
	          that[SIZE]--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /*, that = undefined */){
	        anInstance(this, C, 'forEach');
	        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
	          , entry;
	        while(entry = entry ? entry.n : this._f){
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while(entry && entry.r)entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key){
	        return !!getEntry(this, key);
	      }
	    });
	    if(DESCRIPTORS)dP(C.prototype, 'size', {
	      get: function(){
	        return defined(this[SIZE]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    var entry = getEntry(that, key)
	      , prev, index;
	    // change existing entry
	    if(entry){
	      entry.v = value;
	    // create new entry
	    } else {
	      that._l = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that._l,             // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if(!that._f)that._f = entry;
	      if(prev)prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if(index !== 'F')that._i[index] = entry;
	    } return that;
	  },
	  getEntry: getEntry,
	  setStrong: function(C, NAME, IS_MAP){
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    $iterDefine(C, NAME, function(iterated, kind){
	      this._t = iterated;  // target
	      this._k = kind;      // kind
	      this._l = undefined; // previous
	    }, function(){
	      var that  = this
	        , kind  = that._k
	        , entry = that._l;
	      // revert to the last existing entry
	      while(entry && entry.r)entry = entry.p;
	      // get next entry
	      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
	        // or finish the iteration
	        that._t = undefined;
	        return step(1);
	      }
	      // return step by kind
	      if(kind == 'keys'  )return step(0, entry.k);
	      if(kind == 'values')return step(0, entry.v);
	      return step(0, [entry.k, entry.v]);
	    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

	    // add [@@species], 23.1.2.2, 23.2.2.2
	    setSpecies(NAME);
	  }
	};

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var classof = __webpack_require__(49)
	  , from    = __webpack_require__(109);
	module.exports = function(NAME){
	  return function toJSON(){
	    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
	    return from(this);
	  };
	};

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var redefineAll       = __webpack_require__(38)
	  , getWeak           = __webpack_require__(30).getWeak
	  , anObject          = __webpack_require__(2)
	  , isObject          = __webpack_require__(5)
	  , anInstance        = __webpack_require__(33)
	  , forOf             = __webpack_require__(44)
	  , createArrayMethod = __webpack_require__(22)
	  , $has              = __webpack_require__(11)
	  , arrayFind         = createArrayMethod(5)
	  , arrayFindIndex    = createArrayMethod(6)
	  , id                = 0;

	// fallback for uncaught frozen keys
	var uncaughtFrozenStore = function(that){
	  return that._l || (that._l = new UncaughtFrozenStore);
	};
	var UncaughtFrozenStore = function(){
	  this.a = [];
	};
	var findUncaughtFrozen = function(store, key){
	  return arrayFind(store.a, function(it){
	    return it[0] === key;
	  });
	};
	UncaughtFrozenStore.prototype = {
	  get: function(key){
	    var entry = findUncaughtFrozen(this, key);
	    if(entry)return entry[1];
	  },
	  has: function(key){
	    return !!findUncaughtFrozen(this, key);
	  },
	  set: function(key, value){
	    var entry = findUncaughtFrozen(this, key);
	    if(entry)entry[1] = value;
	    else this.a.push([key, value]);
	  },
	  'delete': function(key){
	    var index = arrayFindIndex(this.a, function(it){
	      return it[0] === key;
	    });
	    if(~index)this.a.splice(index, 1);
	    return !!~index;
	  }
	};

	module.exports = {
	  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
	    var C = wrapper(function(that, iterable){
	      anInstance(that, C, NAME, '_i');
	      that._i = id++;      // collection id
	      that._l = undefined; // leak store for uncaught frozen objects
	      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    redefineAll(C.prototype, {
	      // 23.3.3.2 WeakMap.prototype.delete(key)
	      // 23.4.3.3 WeakSet.prototype.delete(value)
	      'delete': function(key){
	        if(!isObject(key))return false;
	        var data = getWeak(key);
	        if(data === true)return uncaughtFrozenStore(this)['delete'](key);
	        return data && $has(data, this._i) && delete data[this._i];
	      },
	      // 23.3.3.4 WeakMap.prototype.has(key)
	      // 23.4.3.4 WeakSet.prototype.has(value)
	      has: function has(key){
	        if(!isObject(key))return false;
	        var data = getWeak(key);
	        if(data === true)return uncaughtFrozenStore(this).has(key);
	        return data && $has(data, this._i);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    var data = getWeak(anObject(key), true);
	    if(data === true)uncaughtFrozenStore(that).set(key, value);
	    else data[that._i] = value;
	    return that;
	  },
	  ufstore: uncaughtFrozenStore
	};

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(7) && !__webpack_require__(4)(function(){
	  return Object.defineProperty(__webpack_require__(74)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	// 20.1.2.3 Number.isInteger(number)
	var isObject = __webpack_require__(5)
	  , floor    = Math.floor;
	module.exports = function isInteger(it){
	  return !isObject(it) && isFinite(it) && floor(it) === it;
	};

/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(2);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },
/* 118 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 119 */
/***/ function(module, exports) {

	// 20.2.2.20 Math.log1p(x)
	module.exports = Math.log1p || function log1p(x){
	  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
	};

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys  = __webpack_require__(37)
	  , gOPS     = __webpack_require__(63)
	  , pIE      = __webpack_require__(51)
	  , toObject = __webpack_require__(10)
	  , IObject  = __webpack_require__(50)
	  , $assign  = Object.assign;

	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(4)(function(){
	  var A = {}
	    , B = {}
	    , S = Symbol()
	    , K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function(k){ B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
	  var T     = toObject(target)
	    , aLen  = arguments.length
	    , index = 1
	    , getSymbols = gOPS.f
	    , isEnum     = pIE.f;
	  while(aLen > index){
	    var S      = IObject(arguments[index++])
	      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
	  } return T;
	} : $assign;

/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(8)
	  , anObject = __webpack_require__(2)
	  , getKeys  = __webpack_require__(37);

	module.exports = __webpack_require__(7) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(16)
	  , gOPN      = __webpack_require__(36).f
	  , toString  = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function(it){
	  try {
	    return gOPN(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};

	module.exports.f = function getOwnPropertyNames(it){
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};


/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(11)
	  , toIObject    = __webpack_require__(16)
	  , arrayIndexOf = __webpack_require__(55)(false)
	  , IE_PROTO     = __webpack_require__(87)('IE_PROTO');

	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	var getKeys   = __webpack_require__(37)
	  , toIObject = __webpack_require__(16)
	  , isEnum    = __webpack_require__(51).f;
	module.exports = function(isEntries){
	  return function(it){
	    var O      = toIObject(it)
	      , keys   = getKeys(O)
	      , length = keys.length
	      , i      = 0
	      , result = []
	      , key;
	    while(length > i)if(isEnum.call(O, key = keys[i++])){
	      result.push(isEntries ? [key, O[key]] : O[key]);
	    } return result;
	  };
	};

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	// all object keys, includes non-enumerable and symbols
	var gOPN     = __webpack_require__(36)
	  , gOPS     = __webpack_require__(63)
	  , anObject = __webpack_require__(2)
	  , Reflect  = __webpack_require__(3).Reflect;
	module.exports = Reflect && Reflect.ownKeys || function ownKeys(it){
	  var keys       = gOPN.f(anObject(it))
	    , getSymbols = gOPS.f;
	  return getSymbols ? keys.concat(getSymbols(it)) : keys;
	};

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	var $parseFloat = __webpack_require__(3).parseFloat
	  , $trim       = __webpack_require__(47).trim;

	module.exports = 1 / $parseFloat(__webpack_require__(92) + '-0') !== -Infinity ? function parseFloat(str){
	  var string = $trim(String(str), 3)
	    , result = $parseFloat(string);
	  return result === 0 && string.charAt(0) == '-' ? -0 : result;
	} : $parseFloat;

/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	var $parseInt = __webpack_require__(3).parseInt
	  , $trim     = __webpack_require__(47).trim
	  , ws        = __webpack_require__(92)
	  , hex       = /^[\-+]?0[xX]/;

	module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix){
	  var string = $trim(String(str), 3);
	  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
	} : $parseInt;

/***/ },
/* 128 */
/***/ function(module, exports) {

	// 7.2.9 SameValue(x, y)
	module.exports = Object.is || function is(x, y){
	  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
	};

/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/tc39/proposal-string-pad-start-end
	var toLength = __webpack_require__(9)
	  , repeat   = __webpack_require__(91)
	  , defined  = __webpack_require__(20);

	module.exports = function(that, maxLength, fillString, left){
	  var S            = String(defined(that))
	    , stringLength = S.length
	    , fillStr      = fillString === undefined ? ' ' : String(fillString)
	    , intMaxLength = toLength(maxLength);
	  if(intMaxLength <= stringLength || fillStr == '')return S;
	  var fillLen = intMaxLength - stringLength
	    , stringFiller = repeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
	  if(stringFiller.length > fillLen)stringFiller = stringFiller.slice(0, fillLen);
	  return left ? stringFiller + S : S + stringFiller;
	};


/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(6);

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(112);

	// 23.1 Map Objects
	module.exports = __webpack_require__(56)('Map', function(get){
	  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function get(key){
	    var entry = strong.getEntry(this, key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function set(key, value){
	    return strong.def(this, key === 0 ? 0 : key, value);
	  }
	}, strong, true);

/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	// 21.2.5.3 get RegExp.prototype.flags()
	if(__webpack_require__(7) && /./g.flags != 'g')__webpack_require__(8).f(RegExp.prototype, 'flags', {
	  configurable: true,
	  get: __webpack_require__(58)
	});

/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(112);

	// 23.2 Set Objects
	module.exports = __webpack_require__(56)('Set', function(get){
	  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.2.3.1 Set.prototype.add(value)
	  add: function add(value){
	    return strong.def(this, value = value === 0 ? 0 : value, value);
	  }
	}, strong);

/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var each         = __webpack_require__(22)(0)
	  , redefine     = __webpack_require__(14)
	  , meta         = __webpack_require__(30)
	  , assign       = __webpack_require__(120)
	  , weak         = __webpack_require__(114)
	  , isObject     = __webpack_require__(5)
	  , getWeak      = meta.getWeak
	  , isExtensible = Object.isExtensible
	  , uncaughtFrozenStore = weak.ufstore
	  , tmp          = {}
	  , InternalMap;

	var wrapper = function(get){
	  return function WeakMap(){
	    return get(this, arguments.length > 0 ? arguments[0] : undefined);
	  };
	};

	var methods = {
	  // 23.3.3.3 WeakMap.prototype.get(key)
	  get: function get(key){
	    if(isObject(key)){
	      var data = getWeak(key);
	      if(data === true)return uncaughtFrozenStore(this).get(key);
	      return data ? data[this._i] : undefined;
	    }
	  },
	  // 23.3.3.5 WeakMap.prototype.set(key, value)
	  set: function set(key, value){
	    return weak.def(this, key, value);
	  }
	};

	// 23.3 WeakMap Objects
	var $WeakMap = module.exports = __webpack_require__(56)('WeakMap', wrapper, methods, weak, true, true);

	// IE11 WeakMap frozen keys fix
	if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
	  InternalMap = weak.getConstructor(wrapper);
	  assign(InternalMap.prototype, methods);
	  meta.NEED = true;
	  each(['delete', 'has', 'get', 'set'], function(key){
	    var proto  = $WeakMap.prototype
	      , method = proto[key];
	    redefine(proto, key, function(a, b){
	      // store frozen objects on internal weakmap shim
	      if(isObject(a) && !isExtensible(a)){
	        if(!this._f)this._f = new InternalMap;
	        var result = this._f[key](a, b);
	        return key == 'set' ? this : result;
	      // store all the rest on native weakmap
	      } return method.call(this, a, b);
	    });
	  });
	}

/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(29);

	/** Built-in value references. */
	var Symbol = root.Symbol;

	module.exports = Symbol;


/***/ },
/* 136 */
/***/ function(module, exports) {

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

	module.exports = arrayPush;


/***/ },
/* 137 */
/***/ function(module, exports) {

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

	module.exports = arrayReduce;


/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	var baseAssignValue = __webpack_require__(99),
	    eq = __webpack_require__(103);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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

	module.exports = assignValue;


/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(102),
	    stubArray = __webpack_require__(422);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own enumerable symbol properties of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

	module.exports = getSymbols;


/***/ },
/* 140 */
/***/ function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

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

	module.exports = isIndex;


/***/ },
/* 141 */
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

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

	module.exports = isPrototype;


/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(347);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

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

	module.exports = overRest;


/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	var baseSetToString = __webpack_require__(362),
	    shortOut = __webpack_require__(407);

	/**
	 * Sets the `toString` method of `func` to return `string`.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var setToString = shortOut(baseSetToString);

	module.exports = setToString;


/***/ },
/* 144 */
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var funcProto = Function.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

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

	module.exports = toSource;


/***/ },
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	var baseClone = __webpack_require__(352);

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

	module.exports = cloneDeep;


/***/ },
/* 146 */
/***/ function(module, exports) {

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

	module.exports = identity;


/***/ },
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLikeObject = __webpack_require__(417);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

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

	module.exports = isArguments;


/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(52);

	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

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

	module.exports = isFunction;


/***/ },
/* 149 */
/***/ function(module, exports) {

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

	module.exports = isObjectLike;


/***/ },
/* 150 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/*
	 * Localize global props for better performance
	 */
	var PI = Math.PI,
	    _cos = Math.cos,
	    _sin = Math.sin,
	    _sqrt = Math.sqrt,
	    pow = Math.pow,
	    _log = Math.log,
	    _exp = Math.exp,
	    abs = Math.abs,
	    atan2 = Math.atan2;

	var ArrDef = Float64Array || Array;

	/*
	 * Utility functions
	 */
	function _sinh(x) {
	    return (_exp(x) - _exp(-x)) * 0.5;
	}

	function _cosh(x) {
	    return (_exp(x) + _exp(-x)) * 0.5;
	}

	/*
	 * Object definition
	 */

	function Complex(re, im) {
	    // allow instantiation by simply: Complex(args);
	    if (!(this instanceof Complex)) {
	        return new Complex(re, im);
	    }

	    // private properties... don't modify directly
	    this._ = new ArrDef(2);

	    this.set(re, im);
	}

	var prototype = Complex.prototype = {

	    set: function set(re, im) {
	        if (im || re === 0 || im === 0) {
	            this.fromRect(+re, +im);
	        } else if (re.length) {
	            this.fromRect(+re[0], +re[1]);
	        } else if (re.re || re.im) {
	            this.fromRect(+re.re, +re.im);
	        }
	        return this;
	    },

	    fromRect: function fromRect(re, im) {
	        this._[0] = re;
	        this._[1] = im;
	        return this;
	    },

	    fromPolar: function fromPolar(r, phi) {
	        return this.fromRect(r * _cos(phi), r * _sin(phi));
	    },

	    toPrecision: function toPrecision(k) {
	        return this.fromRect(this._[0].toPrecision(k), this._[1].toPrecision(k));
	    },

	    toFixed: function toFixed(k) {
	        return this.fromRect(this._[0].toFixed(k), this._[1].toFixed(k));
	    },

	    finalize: function finalize() {
	        this.fromRect = function (re, im) {
	            return new Complex(re, im);
	        };
	        if (Object.defineProperty) {
	            Object.defineProperty(this, 'real', { writable: false, value: this._[0] });
	            Object.defineProperty(this, 'im', { writable: false, value: this._[1] });
	        }
	        return this;
	    },

	    magnitude: function magnitude() {
	        var re = this._[0],
	            im = this._[1];
	        return _sqrt(re * re + im * im);
	    },

	    angle: function angle() {
	        return atan2(this._[1], this._[0]);
	    },

	    conjugate: function conjugate() {
	        return this.fromRect(this._[0], -this._[1]);
	    },

	    negate: function negate() {
	        return this.fromRect(-this._[0], -this._[1]);
	    },

	    multiply: function multiply(z) {
	        var re = this._[0],
	            im = this._[1];
	        return this.fromRect(z._[0] * re - z._[1] * im, im * z._[0] + z._[1] * re);
	    },

	    divide: function divide(z) {
	        var zre = z._[0],
	            zim = z._[1],
	            re = this._[0],
	            im = this._[1],
	            invdivident = 1 / (zre * zre + zim * zim);
	        return this.fromRect((re * zre + im * zim) * invdivident, (im * zre - re * zim) * invdivident);
	    },

	    add: function add(z) {
	        return this.fromRect(this._[0] + z._[0], this._[1] + z._[1]);
	    },

	    subtract: function subtract(z) {
	        return this.fromRect(this._[0] - z._[0], this._[1] - z._[1]);
	    },

	    pow: function pow(z) {
	        var result = z.multiply(this.clone().log()).exp(); // z^w = e^(w*log(z))
	        return this.fromRect(result._[0], result._[1]);
	    },

	    sqrt: function sqrt() {
	        var abs = this.magnitude(),
	            sgn = this._[1] < 0 ? -1 : 1;
	        return this.fromRect(_sqrt((abs + this._[0]) * 0.5), sgn * _sqrt((abs - this._[0]) * 0.5));
	    },

	    log: function log(k) {
	        if (!k) {
	            k = 0;
	        }
	        return this.fromRect(_log(this.magnitude()), this.angle() + k * 2 * PI);
	    },

	    exp: function exp() {
	        return this.fromPolar(_exp(this._[0]), this._[1]);
	    },

	    sin: function sin() {
	        var re = this._[0],
	            im = this._[1];
	        return this.fromRect(_sin(re) * _cosh(im), _cos(re) * _sinh(im));
	    },

	    cos: function cos() {
	        var re = this._[0],
	            im = this._[1];
	        return this.fromRect(_cos(re) * _cosh(im), _sin(re) * _sinh(im) * -1);
	    },

	    tan: function tan() {
	        var re = this._[0],
	            im = this._[1],
	            invdivident = 1 / (_cos(2 * re) + _cosh(2 * im));
	        return this.fromRect(_sin(2 * re) * invdivident, _sinh(2 * im) * invdivident);
	    },

	    sinh: function sinh() {
	        var re = this._[0],
	            im = this._[1];
	        return this.fromRect(_sinh(re) * _cos(im), _cosh(re) * _sin(im));
	    },

	    cosh: function cosh() {
	        var re = this._[0],
	            im = this._[1];
	        return this.fromRect(_cosh(re) * _cos(im), _sinh(re) * _sin(im));
	    },

	    tanh: function tanh() {
	        var re = this._[0],
	            im = this._[1],
	            invdivident = 1 / (_cosh(2 * re) + _cos(2 * im));
	        return this.fromRect(_sinh(2 * re) * invdivident, _sin(2 * im) * invdivident);
	    },

	    clone: function clone() {
	        return new Complex(this._[0], this._[1]);
	    },

	    toString: function toString(polar) {
	        if (polar) {
	            return this.magnitude() + ' ' + this.angle();
	        }

	        var ret = '',
	            re = this._[0],
	            im = this._[1];
	        if (re) {
	            ret += re;
	        }
	        if (re && im || im < 0) {
	            ret += im < 0 ? '-' : '+';
	        }
	        if (im) {
	            var absIm = abs(im);
	            if (absIm !== 1) {
	                ret += absIm;
	            }
	            ret += 'i';
	        }
	        return ret || '0';
	    },

	    equals: function equals(z) {
	        return z._[0] === this._[0] && z._[1] === this._[1];
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

	    from: function from(real, im) {
	        if (real instanceof Complex) {
	            return real.clone();
	        }
	        var type = typeof real === 'undefined' ? 'undefined' : _typeof(real);
	        if (type === 'string') {
	            if (real === 'i') {
	                real = '0+1i';
	            }
	            var match = real.match(/(\d+)?([\+\-]\d*)[ij]/);
	            if (match) {
	                real = match[1];
	                im = match[2] === '+' || match[2] === '-' ? match[2] + '1' : match[2];
	            }
	        }
	        real = +real;
	        im = +im;
	        return new Complex(isNaN(real) ? 0 : real, isNaN(im) ? 0 : im);
	    },

	    fromPolar: function fromPolar(r, phi) {
	        return new Complex(1, 1).fromPolar(r, phi);
	    },

	    i: new Complex(0, 1).finalize(),

	    one: new Complex(1, 0).finalize()

	};

	for (var e in extend) {
	    Complex[e] = extend[e];
	}

	module.exports = Complex;

/***/ },
/* 151 */
/***/ function(module, exports) {

	"use strict";

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

	var pythag = function pythag(a, b) {
	  var at = Math.abs(a),
	      bt = Math.abs(b),
	      ct;

	  if (at > bt) {
	    ct = bt / at;
	    return at * Math.sqrt(1.0 + ct * ct);
	  }

	  if (0.0 === bt) {
	    return 0.0;
	  }

	  ct = at / bt;
	  return bt * Math.sqrt(1.0 + ct * ct);
	};

	var sign = function sign(a, b) {
	  return b >= 0.0 ? Math.abs(a) : -Math.abs(a);
	};

	// PhaseMatch.svdcmp = function(a, m, n, w, v){
	var svdcmp = function svdcmp(a) {
	  var flag,
	      i,
	      its,
	      j,
	      jj,
	      k,
	      l,
	      nm,
	      anorm = 0.0,
	      c,
	      f,
	      g = 0.0,
	      h,
	      s,
	      scale = 0.0,
	      x,
	      y,
	      z,
	      rv1 = [];

	  var m = a.length; //number of rows
	  var n = a[0].length; // number of cols

	  var v = PhaseMatch.zeros(m, n);
	  // var v = cloneDeep(a);
	  var w = [];

	  //Householder reduction to bidiagonal form
	  for (i = 0; i < n; ++i) {
	    l = i + 1;
	    rv1[i] = scale * g;
	    g = s = scale = 0.0;
	    if (i < m) {
	      for (k = i; k < m; ++k) {
	        scale += Math.abs(a[k][i]);
	      }
	      if (0.0 !== scale) {
	        for (k = i; k < m; ++k) {
	          a[k][i] /= scale;
	          s += a[k][i] * a[k][i];
	        }
	        f = a[i][i];
	        g = -sign(Math.sqrt(s), f);
	        h = f * g - s;
	        a[i][i] = f - g;
	        for (j = l; j < n; ++j) {
	          for (s = 0.0, k = i; k < m; ++k) {
	            s += a[k][i] * a[k][j];
	          }
	          f = s / h;
	          for (k = i; k < m; ++k) {
	            a[k][j] += f * a[k][i];
	          }
	        }
	        for (k = i; k < m; ++k) {
	          a[k][i] *= scale;
	        }
	      }
	    }
	    w[i] = scale * g;
	    g = s = scale = 0.0;
	    if (i < m && i !== n - 1) {
	      for (k = l; k < n; ++k) {
	        scale += Math.abs(a[i][k]);
	      }
	      if (0.0 !== scale) {
	        for (k = l; k < n; ++k) {
	          a[i][k] /= scale;
	          s += a[i][k] * a[i][k];
	        }
	        f = a[i][l];
	        g = -sign(Math.sqrt(s), f);
	        h = f * g - s;
	        a[i][l] = f - g;
	        for (k = l; k < n; ++k) {
	          rv1[k] = a[i][k] / h;
	        }
	        for (j = l; j < m; ++j) {
	          for (s = 0.0, k = l; k < n; ++k) {
	            s += a[j][k] * a[i][k];
	          }
	          for (k = l; k < n; ++k) {
	            a[j][k] += s * rv1[k];
	          }
	        }
	        for (k = l; k < n; ++k) {
	          a[i][k] *= scale;
	        }
	      }
	    }
	    anorm = Math.max(anorm, Math.abs(w[i]) + Math.abs(rv1[i]));
	  }

	  //Acumulation of right-hand transformation
	  for (i = n - 1; i >= 0; --i) {
	    if (i < n - 1) {
	      if (0.0 !== g) {
	        for (j = l; j < n; ++j) {
	          v[j][i] = a[i][j] / a[i][l] / g;
	        }
	        for (j = l; j < n; ++j) {
	          for (s = 0.0, k = l; k < n; ++k) {
	            s += a[i][k] * v[k][j];
	          }
	          for (k = l; k < n; ++k) {
	            v[k][j] += s * v[k][i];
	          }
	        }
	      }
	      for (j = l; j < n; ++j) {
	        v[i][j] = v[j][i] = 0.0;
	      }
	    }
	    v[i][i] = 1.0;
	    g = rv1[i];
	    l = i;
	  }

	  //Acumulation of left-hand transformation
	  for (i = Math.min(n, m) - 1; i >= 0; --i) {
	    l = i + 1;
	    g = w[i];
	    for (j = l; j < n; ++j) {
	      a[i][j] = 0.0;
	    }
	    if (0.0 !== g) {
	      g = 1.0 / g;
	      for (j = l; j < n; ++j) {
	        for (s = 0.0, k = l; k < m; ++k) {
	          s += a[k][i] * a[k][j];
	        }
	        f = s / a[i][i] * g;
	        for (k = i; k < m; ++k) {
	          a[k][j] += f * a[k][i];
	        }
	      }
	      for (j = i; j < m; ++j) {
	        a[j][i] *= g;
	      }
	    } else {
	      for (j = i; j < m; ++j) {
	        a[j][i] = 0.0;
	      }
	    }
	    ++a[i][i];
	  }

	  //Diagonalization of the bidiagonal form
	  for (k = n - 1; k >= 0; --k) {
	    for (its = 1; its <= 30; ++its) {
	      flag = true;
	      for (l = k; l >= 0; --l) {
	        nm = l - 1;
	        if (Math.abs(rv1[l]) + anorm === anorm) {
	          flag = false;
	          break;
	        }
	        if (Math.abs(w[nm]) + anorm === anorm) {
	          break;
	        }
	      }
	      if (flag) {
	        c = 0.0;
	        s = 1.0;
	        for (i = l; i <= k; ++i) {
	          f = s * rv1[i];
	          if (Math.abs(f) + anorm === anorm) {
	            break;
	          }
	          g = w[i];
	          h = pythag(f, g);
	          w[i] = h;
	          h = 1.0 / h;
	          c = g * h;
	          s = -f * h;
	          for (j = 0; j < m; ++j) {
	            y = a[j][nm];
	            z = a[j][i];
	            a[j][nm] = y * c + z * s;
	            a[j][i] = z * c - y * s;
	          }
	        }
	      }

	      //Convergence
	      z = w[k];
	      if (l === k) {
	        if (z < 0.0) {
	          w[k] = -z;
	          for (j = 0; j < n; ++j) {
	            v[j][k] = -v[j][k];
	          }
	        }
	        break;
	      }

	      if (30 === its) {
	        return false;
	      }

	      //Shift from bottom 2-by-2 minor
	      x = w[l];
	      nm = k - 1;
	      y = w[nm];
	      g = rv1[nm];
	      h = rv1[k];
	      f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2.0 * h * y);
	      g = pythag(f, 1.0);
	      f = ((x - z) * (x + z) + h * (y / (f + sign(g, f)) - h)) / x;

	      //Next QR transformation
	      c = s = 1.0;
	      for (j = l; j <= nm; ++j) {
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
	        for (jj = 0; jj < n; ++jj) {
	          x = v[jj][j];
	          z = v[jj][i];
	          v[jj][j] = x * c + z * s;
	          v[jj][i] = z * c - x * s;
	        }
	        z = pythag(f, h);
	        w[j] = z;
	        if (0.0 !== z) {
	          z = 1.0 / z;
	          c = f * z;
	          s = h * z;
	        }
	        f = c * g + s * y;
	        x = c * y - s * g;
	        for (jj = 0; jj < m; ++jj) {
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

	  return { U: a, W: w, V: v };
	};

	module.exports = svdcmp;

/***/ },
/* 152 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Phasematching Library for momentum space calculations
	 */
	var ellipticity = 1.0;
	var con = __webpack_require__(53);
	var helpers = __webpack_require__(48);
	var sq = helpers.sq;
	var PhaseMatch = __webpack_require__(54);

	/*
	 * To deal with possible floating point errors, convert from meters to microns before performing the calculations.
	 */
	var convertToMicrons = function convertToMicrons(props) {
	    var P = props
	    // ,mu = 1E6
	    ,
	        mu = 1;

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

	var convertToMeters = function convertToMeters(props) {
	    var P = props
	    // ,mu = 1E-6
	    ,
	        mu = 1;

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

	/*
	 * Get the constants and terms used in the calculation of the momentum
	 * space joint spectrum for the coincidences.
	 */
	var calc_PM_tz_k_coinc = function calc_PM_tz_k_coinc(P) {
	    // console.log("hi");
	    // console.log("\n");
	    // var todeg = 180/Math.PI;
	    // console.log("Inside calc_PM_tz_k_coinc:  Theta_s: " + (P.theta_s*todeg).toString() + ", Theta_i: " + (P.theta_i*todeg).toString() );
	    var toMicrons = 1;
	    // var toMicrons= 1;
	    var lambda_p = P.lambda_p; //store the original lambda_p
	    var n_p = P.n_p;

	    var twoPI = 2 * Math.PI,
	        twoPIc = twoPI * con.c * toMicrons;

	    var z0 = P.z0p //put pump in middle of the crystal
	    ,
	        z0s = P.z0s //-P.L/(2*Math.cos(P.theta_s_e))
	    ,
	        z0i = P.z0i //-P.L/(2*Math.cos(P.theta_i_e))
	    ;

	    // Get the pump index corresponding to the crystal phasematching function
	    // to calculate the K vector mismatch
	    P.lambda_p = 1 / (1 / P.lambda_s + 1 / P.lambda_i);
	    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

	    // P.calc_walkoff_angles();
	    var RHOpx = P.walkoff_p; //pump walkoff angle.
	    // var RHOpx  = 0;


	    convertToMicrons(P);

	    var omega_s = twoPIc / P.lambda_s,
	        omega_i = twoPIc / P.lambda_i,
	        omega_p = omega_s + omega_i
	    // omega_p = twoPIc / P.lambda_p
	    ;

	    // console.log("frequencies2:" + (P.lambda_p*1E9).toString() + ", " + (omega_p/twoPI*1E-9).toString() + ", " + (omega_s*1E-9).toString() + ", " + (omega_i*1E-9).toString() + ", ")
	    // convertToMicrons(P);

	    var delK = PhaseMatch.calc_delK(P);
	    var delKx = delK[0],
	        delKy = delK[1],
	        delKz = delK[2];

	    // console.log("deltaK:" + delKx.toString() + ", " + delKy.toString() + ", " + delKz.toString() + ", ")
	    var toDeg = 180 / Math.PI;
	    // console.log("angles in calc:", P.theta_s*toDeg, P.theta_s_e*toDeg, P.phi_s*toDeg);
	    // Height of the collected spots from the axis.
	    var hs = Math.tan(P.theta_s) * P.L * 0.5 * Math.cos(P.phi_s),
	        hi = Math.tan(P.theta_i) * P.L * 0.5 * Math.cos(P.phi_i);

	    var PMz_real = 0;
	    var PMz_imag = 0;

	    // var convfromFWHM = 1*Math.sqrt(2); // Use 1/e^2 in intensity.
	    var convfromFWHM = 1; // Use 1/e^2 in intensity.


	    // var W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s))),
	    //     W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));


	    // Setup constants
	    var Wp_SQ = sq(P.W * convfromFWHM),
	        // convert from FWHM to sigma
	    Ws_SQ = sq(P.W_sx * convfromFWHM),
	        // convert from FWHM to sigma
	    Wi_SQ = sq(P.W_sx * convfromFWHM),
	        // convert from FWHM to sigma @TODO: Change to P.W_i
	    // Ws_SQ = sq(W_s * convfromFWHM), // convert from FWHM to sigma
	    // Wi_SQ = sq(W_i * convfromFWHM) // convert from FWHM to sigma @TODO: Change to P.W_i
	    Wx_SQ = Wp_SQ * sq(ellipticity),
	        Wy_SQ = Wp_SQ;

	    // Is this the k vector along the direction of propagation?
	    var k_p = twoPI * P.n_p / P.lambda_p,
	        k_s = twoPI * P.n_s / P.lambda_s,
	        //  * Math.cos(P.theta_s),
	    k_i = twoPI * P.n_i / P.lambda_i // * Math.cos(P.theta_i)
	    ;

	    //     var Ss = [ sinThetaS * Math.cos(P.phi_s),  sinThetaS * Math.sin(P.phi_s), Math.cos(P.theta_s)];
	    var PHI_s = sq(1 / Math.cos(P.theta_s_e)),
	        // External angle for the signal???? Is PHI_s z component?
	    PHI_i = sq(1 / Math.cos(P.theta_i_e)),
	        // External angle for the idler????
	    PSI_s = k_s / P.n_s * Math.sin(P.theta_s_e) * Math.cos(P.phi_s),
	        // Looks to be the y component of the ks,i
	    PSI_i = k_i / P.n_i * Math.sin(P.theta_i_e) * Math.cos(P.phi_i);

	    var bw; // Apodization 1/e^2

	    // Take into account apodized crystals
	    if (P.calc_apodization && P.enable_pp) {
	        bw = P.apodization_FWHM / 2.3548;
	        bw = 2 * bw / P.L; // convert from 0->L to -1 -> 1 for the integral over z
	    } else {
	        bw = Math.pow(2, 20);
	    }

	    // Now put the waist of the signal & idler at the center fo the crystal.
	    // W = Wfi.*sqrt( 1 + 2.*1i.*(zi+hi.*sin(thetai_f))./(kif.*Wfi^2));
	    var Ws_r = Ws_SQ,
	        Ws_i = 2 / (k_s / P.n_s) * (z0s + hs * Math.sin(P.theta_s_e) * Math.cos(P.phi_s)),
	        Wi_r = Wi_SQ,
	        Wi_i = 2 / (k_i / P.n_i) * (z0i + hi * Math.sin(P.theta_i_e) * Math.cos(P.phi_i));

	    // console.log("Signal WAIST:",Ws_r,Ws_i);
	    // console.log('SIGNAL CALCULATIONS:', hs * Math.sin(P.theta_s_e)*Math.cos(P.phi_s), hi * Math.sin(P.theta_i_e)*Math.cos(P.phi_i) );
	    // console.log("EXTERNAL ANGLES:", P.theta_s_e * toDeg, P.theta_i_e * toDeg);

	    // console.log("Theta_s: " + (P.theta_s * 180 / Math.PI).toString() + ", Theta_i: " + (P.theta_i * 180 / Math.PI).toString(), ", PHI_I: " + PHI_i.toString() + ", Psi_I: " + PSI_i.toString() + ", PHI_s: " + PHI_s.toString() + ", Psi_s: " + PSI_s.toString());
	    // console.log("Ks: " + k_s.toString() + "Ki: " + k_i.toString() + "Kp: " + k_p.toString() + "PHI_s: " + PHI_s.toString() + "PSIs: " + PSI_s.toString() );
	    // Now calculate the the coeficients that get repeatedly used. This is from
	    // Karina's code. Assume a symmetric pump waist (Wx = Wy)

	    var ks_f = k_s / P.n_s,
	        ki_f = k_i / P.n_i,
	        SIN_THETA_s_e = Math.sin(P.theta_s_e),
	        SIN_THETA_i_e = Math.sin(P.theta_i_e),
	        COS_THETA_s_e = Math.cos(P.theta_s_e),
	        COS_THETA_i_e = Math.cos(P.theta_i_e),
	        TAN_THETA_s_e = Math.tan(P.theta_s_e),
	        TAN_THETA_i_e = Math.tan(P.theta_i_e),
	        COS_PHI_s = Math.cos(P.phi_s),
	        COS_PHI_i = Math.cos(P.phi_i),
	        GAM2s = -0.25 * Ws_SQ,
	        GAM2i = -0.25 * Wi_SQ,
	        GAM1s = GAM2s * PHI_s,
	        GAM1i = GAM2i * PHI_i,
	        GAM3s = -2 * ks_f * GAM1s * SIN_THETA_s_e * COS_PHI_s,
	        GAM3i = -2 * ki_f * GAM1i * SIN_THETA_i_e * COS_PHI_i,
	        GAM4s = -0.5 * ks_f * SIN_THETA_s_e * COS_PHI_s * GAM3s,
	        GAM4i = -0.5 * ki_f * SIN_THETA_i_e * COS_PHI_i * GAM3i,
	        zhs = z0s + hs * SIN_THETA_s_e * COS_PHI_s,
	        zhi = z0i + hi * SIN_THETA_i_e * COS_PHI_i,
	        DEL2s = 0.5 / ks_f * zhs,
	        DEL2i = 0.5 / ki_f * zhi,
	        DEL1s = DEL2s * PHI_s,
	        DEL1i = DEL2i * PHI_i,
	        DEL3s = -hs - zhs * PHI_s * SIN_THETA_s_e * COS_PHI_s,
	        DEL3i = -hi - zhi * PHI_i * SIN_THETA_i_e * COS_PHI_i,
	        DEL4s = 0.5 * ks_f * zhs * sq(TAN_THETA_s_e) - ks_f * z0s,
	        DEL4i = 0.5 * ki_f * zhi * sq(TAN_THETA_i_e) - ki_f * z0i,
	        As_r = -0.25 * Wx_SQ + GAM1s,
	        As_i = -DEL1s,
	        Ai_r = -0.25 * Wx_SQ + GAM1i,
	        Ai_i = -DEL1i,
	        Bs_r = -0.25 * Wy_SQ + GAM2s,
	        Bs_i = -DEL2s,
	        Bi_r = -0.25 * Wy_SQ + GAM2i,
	        Bi_i = -DEL2i,
	        Cs = -0.25 * (P.L / k_s - 2 * z0 / k_p),
	        Ci = -0.25 * (P.L / k_i - 2 * z0 / k_p),
	        Ds = 0.25 * P.L * (1 / k_s - 1 / k_p),
	        Di = 0.25 * P.L * (1 / k_i - 1 / k_p)
	    // ,Es_r =  0.50 * (Ws_r*PHI_s * PSI_s)
	    // ,Es_i =  0.50 * (Ws_i*PHI_i * PSI_s)
	    // ,Ei_r =  0.50 * (Wi_r*PHI_i * PSI_i)
	    // ,Ei_i =  0.50 * (Wi_i*PHI_i * PSI_i)
	    ,
	        mx_real = -0.50 * Wx_SQ,
	        mx_imag = z0 / k_p,
	        my_real = -0.50 * Wy_SQ,
	        my_imag = mx_imag,
	        m = P.L / (2 * k_p),
	        n = 0.5 * P.L * Math.tan(RHOpx),
	        ee = 0.5 * P.L * (k_p + k_s + k_i + twoPI / (P.poling_period * P.poling_sign)),
	        ff = 0.5 * P.L * (k_p - k_s - k_i - twoPI / (P.poling_period * P.poling_sign))
	    // ,hh_r = -0.25 * (Wi_r * PHI_i * sq(PSI_i) + Ws_r * PHI_s * sq(PSI_s))
	    // ,hh_i = -0.25 * (Wi_i * PHI_i * sq(PSI_i) + Ws_i * PHI_s * sq(PSI_s))
	    ,
	        hh_r = GAM4s + GAM4i,
	        hh_i = -(DEL4s + DEL4i);

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
	    var calczterms = function calczterms(z) {
	        // console.log("inside calczterms");
	        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
	        var A1 = [As_r, As_i + Cs + Ds * z],
	            A3 = [Ai_r, Ai_i + Ci + Di * z],
	            A2 = [Bs_r, Bs_i + Cs + Ds * z],
	            A4 = [Bi_r, Bi_i + Ci + Di * z],

	        // A5 = [ Es_r, Es_i + hs],
	        // A7 = [ Ei_r, Ei_i + hi],
	        A5 = [GAM3s, -DEL3s],
	            A7 = [GAM3i, -DEL3i],

	        //1i*0.5.*L.*(1 + Xi).*tan(Rho);
	        A6 = [0, n * (1 + z)],
	            A8 = [mx_real, mx_imag - m * z],
	            A9 = [my_real, my_imag - m * z],

	        // A9 = A8, //Pump waist is symmetric
	        A10 = [hh_r, hh_i + ee + ff * z];

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

	    var zintfunc = function zintfunc(z) {
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
	            A10I = terms[9][1];
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
	        var EXP1R = A10R * 4,
	            EXP1I = A10I * 4,


	        // A5^2/A1
	        EXP2R_a = helpers.cmultiplyR(A5R, A5I, A5R, A5I),
	            EXP2I_a = helpers.cmultiplyI(A5R, A5I, A5R, A5I),
	            EXP2R = helpers.cdivideR(EXP2R_a, EXP2I_a, A1R, A1I),
	            EXP2I = helpers.cdivideI(EXP2R_a, EXP2I_a, A1R, A1I),


	        // A6^2/A2
	        EXP3R_a = helpers.cmultiplyR(A6R, A6I, A6R, A6I),
	            EXP3I_a = helpers.cmultiplyI(A6R, A6I, A6R, A6I),
	            EXP3R = helpers.cdivideR(EXP3R_a, EXP3I_a, A2R, A2I),
	            EXP3I = helpers.cdivideI(EXP3R_a, EXP3I_a, A2R, A2I),


	        // (-2 A1 A7 + A5 A8)^2/ (A1 (4 A1 A3 - A8^2))
	        EXP4Ra_num = -2 * helpers.cmultiplyR(A1R, A1I, A7R, A7I),
	            EXP4Ia_num = -2 * helpers.cmultiplyI(A1R, A1I, A7R, A7I),
	            EXP4Rb_num = helpers.cmultiplyR(A5R, A5I, A8R, A8I),
	            EXP4Ib_num = helpers.cmultiplyI(A5R, A5I, A8R, A8I),
	            EXP4Rc_num = helpers.caddR(EXP4Ra_num, EXP4Ia_num, EXP4Rb_num, EXP4Ib_num),
	            EXP4Ic_num = helpers.caddI(EXP4Ra_num, EXP4Ia_num, EXP4Rb_num, EXP4Ib_num),
	            EXP4R_num = helpers.cmultiplyR(EXP4Rc_num, EXP4Ic_num, EXP4Rc_num, EXP4Ic_num),
	            EXP4I_num = helpers.cmultiplyI(EXP4Rc_num, EXP4Ic_num, EXP4Rc_num, EXP4Ic_num),

	        // Denominator
	        EXP4Ra_den = -1 * helpers.cmultiplyR(A8R, A8I, A8R, A8I),
	            EXP4Ia_den = -1 * helpers.cmultiplyI(A8R, A8I, A8R, A8I),
	            EXP4Rb_den = 4 * helpers.cmultiplyR(A1R, A1I, A3R, A3I),
	            EXP4Ib_den = 4 * helpers.cmultiplyI(A1R, A1I, A3R, A3I),
	            EXP4Rc_den = helpers.caddR(EXP4Ra_den, EXP4Ia_den, EXP4Rb_den, EXP4Ib_den),
	            EXP4Ic_den = helpers.caddI(EXP4Ra_den, EXP4Ia_den, EXP4Rb_den, EXP4Ib_den),
	            EXP4R_den = helpers.cmultiplyR(A1R, A1I, EXP4Rc_den, EXP4Ic_den),
	            EXP4I_den = helpers.cmultiplyI(A1R, A1I, EXP4Rc_den, EXP4Ic_den),
	            EXP4R = helpers.cdivideR(EXP4R_num, EXP4I_num, EXP4R_den, EXP4I_den),
	            EXP4I = helpers.cdivideI(EXP4R_num, EXP4I_num, EXP4R_den, EXP4I_den),


	        // A6^2 (-2 A2 + A9)^2)/(A2 (4 A2 A4 - A9^2)))
	        EXP5Rb_num = helpers.caddR(-2 * A2R, -2 * A2I, A9R, A9I),
	            EXP5Ib_num = helpers.caddI(-2 * A2R, -2 * A2I, A9R, A9I),
	            EXP5Rc_num = helpers.cmultiplyR(EXP5Rb_num, EXP5Ib_num, EXP5Rb_num, EXP5Ib_num),
	            EXP5Ic_num = helpers.cmultiplyI(EXP5Rb_num, EXP5Ib_num, EXP5Rb_num, EXP5Ib_num),
	            EXP5R_num = helpers.cmultiplyR(EXP3R, EXP3I, EXP5Rc_num, EXP5Ic_num),
	            EXP5I_num = helpers.cmultiplyI(EXP3R, EXP3I, EXP5Rc_num, EXP5Ic_num),

	        // EXP5R_num  = helpers.cmultiplyR( EXP5Rd_num, EXP5Id_num, EXP5Rd_num, EXP5Id_num),
	        // EXP5I_num  = helpers.cmultiplyI( EXP5Rd_num, EXP5Id_num, EXP5Rd_num, EXP5Id_num),
	        // Denominator
	        EXP5Ra_den = -1 * helpers.cmultiplyR(A9R, A9I, A9R, A9I),
	            EXP5Ia_den = -1 * helpers.cmultiplyI(A9R, A9I, A9R, A9I),
	            EXP5Rb_den = 4 * helpers.cmultiplyR(A2R, A2I, A4R, A4I),
	            EXP5Ib_den = 4 * helpers.cmultiplyI(A2R, A2I, A4R, A4I),
	            EXP5R_den = helpers.caddR(EXP5Ra_den, EXP5Ia_den, EXP5Rb_den, EXP5Ib_den),
	            EXP5I_den = helpers.caddI(EXP5Ra_den, EXP5Ia_den, EXP5Rb_den, EXP5Ib_den),

	        // expression for fifth term
	        EXP5R = helpers.cdivideR(EXP5R_num, EXP5I_num, EXP5R_den, EXP5I_den),
	            EXP5I = helpers.cdivideI(EXP5R_num, EXP5I_num, EXP5R_den, EXP5I_den),


	        // Full expression for term in the exponential
	        EXP6R_a = helpers.caddR(EXP1R, EXP1I, -1 * EXP2R, -1 * EXP2I),
	            EXP6I_a = helpers.caddI(EXP1R, EXP1I, -1 * EXP2R, -1 * EXP2I),
	            EXP6R_b = helpers.caddR(EXP6R_a, EXP6I_a, -1 * EXP3R, -1 * EXP3I),
	            EXP6I_b = helpers.caddI(EXP6R_a, EXP6I_a, -1 * EXP3R, -1 * EXP3I),
	            EXP6R_c = helpers.caddR(EXP6R_b, EXP6I_b, -1 * EXP4R, -1 * EXP4I),
	            EXP6I_c = helpers.caddI(EXP6R_b, EXP6I_b, -1 * EXP4R, -1 * EXP4I),
	            EXPR = 0.25 * helpers.caddR(EXP6R_c, EXP6I_c, -1 * EXP5R, -1 * EXP5I),
	            EXPI = 0.25 * helpers.caddI(EXP6R_c, EXP6I_c, -1 * EXP5R, -1 * EXP5I),


	        //////////////////////////////////////////////////////////////////////////////
	        // Now deal with the denominator in the integral:
	        // Sqrt[A1 A2 (-4 A3 + A8^2/A1) (-4 A4 + A9^2/A2)]

	        // A1 A2
	        DEN1R = helpers.cmultiplyR(A1R, A1I, A2R, A2I),
	            DEN1I = helpers.cmultiplyI(A1R, A1I, A2R, A2I),


	        // (-4 A3 + A8^2/A1) //Matlab (-4 A7 + A10^2/A3)
	        DEN2R_a = helpers.cdivideR(-1 * EXP4Ra_den, -1 * EXP4Ia_den, A1R, A1I),
	            DEN2I_a = helpers.cdivideI(-1 * EXP4Ra_den, -1 * EXP4Ia_den, A1R, A1I),
	            DEN2R = helpers.caddR(-4 * A3R, -4 * A3I, DEN2R_a, DEN2I_a),
	            DEN2I = helpers.caddI(-4 * A3R, -4 * A3I, DEN2R_a, DEN2I_a),


	        // (-4 A4 + A9^2/A2)
	        DEN3R_a = helpers.cdivideR(-1 * EXP5Ra_den, -1 * EXP5Ia_den, A2R, A2I),
	            DEN3I_a = helpers.cdivideI(-1 * EXP5Ra_den, -1 * EXP5Ia_den, A2R, A2I),
	            DEN3R = helpers.caddR(-4 * A4R, -4 * A4I, DEN3R_a, DEN3I_a),
	            DEN3I = helpers.caddI(-4 * A4R, -4 * A4I, DEN3R_a, DEN3I_a),


	        // full expression for denominator
	        DEN4R_a = helpers.cmultiplyR(DEN1R, DEN1I, DEN2R, DEN2I),
	            DEN4I_a = helpers.cmultiplyI(DEN1R, DEN1I, DEN2R, DEN2I),
	            DEN4R_b = helpers.cmultiplyR(DEN4R_a, DEN4I_a, DEN3R, DEN3I),
	            DEN4I_b = helpers.cmultiplyI(DEN4R_a, DEN4I_a, DEN3R, DEN3I),
	            DENR = helpers.csqrtR(DEN4R_b, DEN4I_b),
	            DENI = helpers.csqrtI(DEN4R_b, DEN4I_b),


	        // Now calculate the full term in the integral.
	        pmzcoeff = Math.exp(-1 / 2 * sq(z / bw)),
	            // apodization
	        // pmzcoeff = 1,
	        // Exponential using Euler's formula
	        coeffR = Math.exp(EXPR),

	        // coeffR = 1,
	        EReal = coeffR * pmzcoeff * Math.cos(EXPI),
	            EImag = coeffR * pmzcoeff * Math.sin(EXPI),
	            real = helpers.cdivideR(EReal, EImag, DENR, DENI),
	            imag = helpers.cdivideI(EReal, EImag, DENR, DENI);
	        var EXPRadd = (EXP1R - EXP2R - EXP3R - EXP4R - EXP5R) / 4;

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

	    var arg = P.L / 2 * delKz;
	    var PMt = 1;

	    if (P.calcfibercoupling) {
	        var dz = 2 / P.numzint;
	        var pmintz = helpers.Nintegrate2arg(zintfunc, -1, 1, dz, P.numzint, P.zweights);
	        // var pmintz = zintfunc(0.5);

	        // var dz = 1;
	        // var pmintz = helpers.Nintegrate2arg(zintfunc,-1, 1,dz,1,P.zweights);
	        // PMz_real = pmintz[0]/P.L ;
	        // PMz_imag = pmintz[1]/P.L ;
	        PMz_real = pmintz[0] / 2;
	        PMz_imag = pmintz[1] / 2;
	        // var coeff = (Math.sqrt(omega_s * omega_i)/ (P.n_s * P.n_i));
	        var coeff = 1;
	        PMz_real = PMz_real * coeff;
	        PMz_imag = PMz_imag * coeff;
	    } else {
	        var PMzNorm1 = Math.sin(arg) / arg;
	        // var PMz_real =  PMzNorm1 * Math.cos(arg);
	        // var PMz_imag = PMzNorm1 * Math.sin(arg);
	        PMz_real = PMzNorm1;
	        PMz_imag = 0;
	        PMt = Math.exp(-0.5 * (sq(delK[0]) + sq(delK[1])) * sq(P.W));
	    }

	    if (P.use_guassian_approx) {
	        // console.log('approx');
	        PMz_real = Math.exp(-0.193 * sq(arg));
	        PMz_imag = 0;
	    }

	    convertToMeters(P);
	    P.lambda_p = lambda_p; //set back to the original lambda_p
	    P.n_p = n_p;
	    // console.log(PMz_real.toString());
	    return [PMz_real, PMz_imag, PMt];
	};

	/**********************************************************************
	 * Get the constants and terms used in the calculation of the momentum
	 * space joint spectrum for the singles counts from the Idler.
	 */
	var calc_PM_tz_k_singles = function calc_PM_tz_k_singles(P) {
	    // console.log("hi");
	    // console.log("\n");
	    var toMicrons = 1;
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


	    var twoPI = 2 * Math.PI,
	        twoPIc = twoPI * con.c * toMicrons;

	    var z0 = P.z0p //put pump in middle of the crystal
	    ,
	        z0s = P.z0s // -P.L/(2*Math.cos(P.theta_s_e))
	    ;

	    // Get the pump index corresponding to the crystal phasematching function
	    // to calculate the K vector mismatch
	    P.lambda_p = 1 / (1 / P.lambda_s + 1 / P.lambda_i);
	    P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

	    // P.calc_walkoff_angles();
	    var RHOpx = P.walkoff_p; //pump walkoff angle.
	    // var RHOpx = 0

	    convertToMicrons(P);
	    var omega_s = twoPIc / P.lambda_s,
	        omega_i = twoPIc / P.lambda_i,
	        omega_p = omega_s + omega_i
	    // omega_p = twoPIc / P.lambda_p
	    ;

	    // Height of the collected spots from the axis.
	    var hs = Math.tan(P.theta_s) * P.L * 0.5 * Math.cos(P.phi_s),
	        hi = Math.tan(P.theta_i) * P.L * 0.5 * Math.cos(P.phi_i);

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
	    var Wp_SQ = sq(P.W * convfromFWHM),
	        // convert from FWHM to sigma
	    Ws_SQ = sq(P.W_sx * convfromFWHM),
	        // convert from FWHM to sigma
	    Wi_SQ = sq(P.W_sx * convfromFWHM),
	        // convert from FWHM to sigma @TODO: Change to P.W_i
	    // Ws_SQ = sq(W_s * convfromFWHM), // convert from FWHM to sigma
	    // Wi_SQ = sq(W_i * convfromFWHM) // convert from FWHM to sigma @TODO: Change to P.W_i
	    // Set Wx = Wy for the pump.
	    Wx_SQ = Wp_SQ * sq(ellipticity),
	        Wy_SQ = Wp_SQ;

	    // Is this the k vector along the direction of propagation?
	    var k_p = twoPI * P.n_p / P.lambda_p,
	        k_s = twoPI * P.n_s / P.lambda_s,
	        //  * Math.cos(P.theta_s),
	    k_i = twoPI * P.n_i / P.lambda_i // * Math.cos(P.theta_i)
	    ;

	    //     var Ss = [ sinThetaS * Math.cos(P.phi_s),  sinThetaS * Math.sin(P.phi_s), Math.cos(P.theta_s)];
	    var PHI_s = sq(1 / Math.cos(P.theta_s_e)),
	        // External angle for the signal???? Is PHI_s z component?
	    // PSI_s = (k_s/P.n_s) * Math.sin(P.theta_s_e) * Math.cos(P.phi_s) // Looks to be the y component of the ks,i
	    PSI_s = 1 * Math.sin(P.theta_s_e) * Math.cos(P.phi_s) // Looks to be the y component of the ks,i
	    ;

	    // Now put the waist of the signal & idler at the center fo the crystal.
	    // W = Wfi.*sqrt( 1 + 2.*1i.*(zi+hi.*sin(thetai_f))./(kif.*Wfi^2));
	    // var  Ws_r = Ws_SQ
	    //     ,Ws_i = -2/(omega_s/con.c) * (z0s + hs * Math.sin(P.theta_s_e) )
	    //     ;

	    var Ws_r = Ws_SQ,
	        Ws_i = 2 / (k_s / P.n_s) * (z0s + hs * Math.sin(P.theta_s_e) * Math.cos(P.phi_s));

	    // console.log("WAIST Imag:", Ws_i);

	    var bw; // Apodization 1/e^2

	    // Take into account apodized crystals
	    if (P.calc_apodization && P.enable_pp) {
	        bw = P.apodization_FWHM / 2.3548;
	        bw = 2 * bw / P.L; // convert from 0->L to -1 -> 1 for the integral over z
	    } else {
	        bw = Math.pow(2, 20);
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


	    var ks_f = k_s / P.n_s,
	        SIN_THETA_s_e = Math.sin(P.theta_s_e),
	        COS_THETA_s_e = Math.cos(P.theta_s_e),
	        TAN_THETA_s_e = Math.tan(P.theta_s_e),
	        COS_PHI_s = Math.cos(P.phi_s),
	        GAM2s = -0.25 * Ws_SQ,
	        GAM1s = GAM2s * PHI_s,
	        GAM3s = -2 * ks_f * GAM1s * SIN_THETA_s_e * COS_PHI_s,
	        GAM4s = -0.5 * ks_f * SIN_THETA_s_e * COS_PHI_s * GAM3s,
	        zhs = z0s + hs * SIN_THETA_s_e * COS_PHI_s,
	        DEL2s = 0.5 / ks_f * zhs,
	        DEL1s = DEL2s * PHI_s,
	        DEL3s = -hs - zhs * PHI_s * SIN_THETA_s_e * COS_PHI_s,
	        DEL4s = 0.5 * ks_f * zhs * sq(TAN_THETA_s_e) - ks_f * z0s,
	        KpKs = k_p * k_s,
	        L = P.L
	    // ,C0 = Ws_SQ * PHI_s

	    // ,C0_r = -4 * GAM1s
	    // ,C0_i = 4 * DEL1s
	    // ,C1_r = KpKs * (Wx_SQ + C0_r)
	    // ,C1_i = KpKs * (C0_i)
	    // ,C2_r = C0_r * PSI_s
	    // ,C2_i = C0_i * PSI_s
	    ,
	        C7 = k_p - k_s - k_i - twoPI / (P.poling_period * P.poling_sign),
	        C3 = P.L * C7,
	        C4 = P.L * (1 / k_i - 1 / k_p),
	        C5 = k_s / k_p
	    // ,C6_r = KpKs * (Ws_r + Wy_SQ)
	    // ,C6_i = KpKs * Ws_i
	    // ,C6_r = KpKs * (Wy_SQ -4*GAM2s)
	    // ,C6_i = 4*KpKs * GAM2s
	    ,
	        C9 = k_p * Wx_SQ,
	        C10 = k_p * Wy_SQ,
	        LRho = L * RHOpx,
	        LRho_sq = sq(LRho);
	    // Imaginary Terms
	    var alpha1R = 4 * KpKs * GAM1s,
	        alpha1I = -4 * KpKs * DEL1s,
	        alpha2R = 4 * KpKs * GAM2s,
	        alpha2I = -4 * KpKs * DEL2s,
	        alpha3R = GAM3s,
	        alpha3I = -DEL3s
	    // Complex conjugates
	    ,
	        alpha1cR = alpha1R,
	        alpha1cI = -alpha1I,
	        alpha2cR = alpha2R,
	        alpha2cI = -alpha2I,
	        alpha3cR = alpha3R,
	        alpha3cI = -alpha3I;

	    // M1R = -2 * DEL3s
	    //     ,M1I = -2 * GAM3s
	    //     ,M2R = M1R //M2 is the complex conjugate of M1
	    //     ,M2I = -M2I
	    // //      M1R = 2*hs + C2_i
	    // //     ,M1I = -C2_r
	    // //     ,M2R = 2*hs - C2_i
	    // //     ,M2I = C2_r
	    //     ,M1_SQR = helpers.cmultiplyR( M1R, M1I, M1R, M1I)
	    //     ,M1_SQI = helpers.cmultiplyI( M1R, M1I, M1R, M1I)
	    //     ,M2_SQR = helpers.cmultiplyR( M2R, M2I, M2R, M2I)
	    //     ,M2_SQI = helpers.cmultiplyI( M2R, M2I, M2R, M2I)
	    //     ;

	    // As a function of z1 along the crystal, calculate the z1-dependent coefficients
	    var calcz1terms = function calcz1terms(z1) {
	        // z1=0;
	        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
	        var A1 = 2 * z0 - L * z1,
	            B1 = 1 - z1,
	            B3 = 1 + z1;
	        return [A1, B1, B3];

	        // return [D1R, D1I, D3R, D3I, H1R, H1I, H3R, H3I, P1R, P1I, P3R, P3I, Q1R, Q1I, Q3R, Q3I, A1, B1, B3];
	    };

	    // As a function of z2 along the crystal, calculate the z2-dependent coefficients
	    var calcz2terms = function calcz2terms(z2) {
	        // z2 = 0;
	        // Represent complex numbers as a two-array. x[0] = Real, x[1] = Imag
	        var A2 = 2 * z0 - L * z2,
	            B2 = 1 - z2,
	            B4 = 1 + z2;
	        return [A2, B2, B4];
	        // return [D2R, D2I, D4R, D4I, H2R, H2I, H4R, H4I, P2R, P2I, P4R, P4I, Q2R, Q2I, Q4R, Q4I, A2, B2, B4];
	    };

	    var zintfunc = function zintfunc(z1, z2, Cz1) {
	        // z1 = 0;
	        // z2 =0;
	        // Get the terms that depend only on z2. We already have the terms depending only on z1 in Cz1
	        var Cz2 = calcz2terms(z2),
	            B0 = z1 - z2
	        // From Cz1
	        ,
	            A1 = Cz1[0],
	            B1 = Cz1[1],
	            B3 = Cz1[2]

	        // From Cz2
	        ,
	            A2 = Cz2[0],
	            B2 = Cz2[1],
	            B4 = Cz2[2]

	        // Now terms that depend on both z1 and z2
	        ,
	            B6a = C4 * B0,
	            gamma1I = -k_p * L * B1 + k_s * A1,
	            gamma2I = -k_p * L * B2 + k_s * A2,
	            HaR = alpha1R,
	            HaI = alpha1I + gamma1I,
	            HbR = alpha2R,
	            HbI = alpha2I + gamma1I,
	            HcR = alpha1cR,
	            HcI = alpha1cI - gamma2I,
	            HdR = alpha2cR,
	            HdI = alpha2cI - gamma2I,
	            AA1R = (HaR - C9 * k_s) / (4 * KpKs),
	            AA1I = HaI / (4 * KpKs),
	            AA2R = (HcR - C9 * k_s) / (4 * KpKs),
	            AA2I = HcI / (4 * KpKs),
	            BB1R = (HbR - C10 * k_s) / (4 * KpKs),
	            BB1I = HbI / (4 * KpKs),
	            BB2R = (HdR - C10 * k_s) / (4 * KpKs),
	            BB2I = HdI / (4 * KpKs)

	        // Now for the denominators that show up in EE, FF, GG, HH, and II
	        ,
	            X11R = C9 * k_s - HaR,
	            X11I = -HaI,
	            X12R = -HcI,
	            X12I = HcR - C9 * k_s,
	            Y21R = C10 * k_s - HbR,
	            Y21I = -HbI,
	            Y22R = -HdI,
	            Y22I = HdR - C10 * k_s

	        //Now to calculate the term EE
	        // EE = 1/4*(-  2*Wx^2 + I B6a + C5/X11*(C9 - I A1)^2 - I C5/X12*(C9 + I A2)^2  )
	        // ,EE1R = helpers.cmultiplyR(C9, -A1, C9, -A1)
	        // ,EE1I = helpers.cmultiplyI(C9, -A1, C9, -A1)
	        // ,EE2R = helpers.cmultiplyR(C9, A2, C9, A2)
	        // ,EE2I = helpers.cmultiplyI(C9, A2, C9, A2)
	        // ,EE3R = C5 * helpers.cdivideR(EE1R, EE1I, X11R, X11I)
	        // ,EE3I = C5 * helpers.cdivideI(EE1R, EE1I, X11R, X11I)
	        // ,EE4R = C5 * helpers.cdivideR(EE2R, EE2I, X12R, X12I)
	        // ,EE4I = C5 * helpers.cdivideI(EE2R, EE2I, X12R, X12I)
	        // ,EE5R = helpers.cmultiplyR(0, 1, EE4R, EE4I)
	        // ,EE5I = helpers.cmultiplyI(0, 1, EE4R, EE4I)
	        // ,EER = 0.25 * (-2*Wx_SQ + EE3R - EE5R)
	        // ,EEI = 0.25 * (B6a + EE3I - EE5I)

	        ,
	            EE1R = helpers.cmultiplyR(A1, C9, A1, C9),
	            EE1I = helpers.cmultiplyI(A1, C9, A1, C9),
	            EE2R = helpers.cmultiplyR(A2, -C9, A2, -C9),
	            EE2I = helpers.cmultiplyI(A2, -C9, A2, -C9),
	            EE3R = C5 * helpers.cdivideR(EE1R, EE1I, X11R, X11I),
	            EE3I = C5 * helpers.cdivideI(EE1R, EE1I, X11R, X11I),
	            EE4R = C5 * helpers.cdivideR(EE2R, EE2I, X12R, X12I),
	            EE4I = C5 * helpers.cdivideI(EE2R, EE2I, X12R, X12I),
	            EE5R = helpers.cmultiplyR(0, 1, EE4R, EE4I),
	            EE5I = helpers.cmultiplyI(0, 1, EE4R, EE4I),
	            EER = 0.25 * (-2 * Wx_SQ - EE3R + EE5R),
	            EEI = 0.25 * (B6a - EE3I + EE5I)

	        //Now to calculate the term FF
	        // FF = 1/4*(-2*Wy^2 + I B6a - C5/Y21 *(I C10 + A1)^2 + I C5/Y22 *(-I C10 + A2)^2)
	        ,
	            FF1R = helpers.cmultiplyR(A1, C10, A1, C10),
	            FF1I = helpers.cmultiplyI(A1, C10, A1, C10),
	            FF2R = helpers.cmultiplyR(A2, -C10, A2, -C10),
	            FF2I = helpers.cmultiplyI(A2, -C10, A2, -C10),
	            FF3R = C5 * helpers.cdivideR(FF1R, FF1I, Y21R, Y21I),
	            FF3I = C5 * helpers.cdivideI(FF1R, FF1I, Y21R, Y21I),
	            FF4R = C5 * helpers.cdivideR(FF2R, FF2I, Y22R, Y22I),
	            FF4I = C5 * helpers.cdivideI(FF2R, FF2I, Y22R, Y22I),
	            FF5R = helpers.cmultiplyR(0, 1, FF4R, FF4I),
	            FF5I = helpers.cmultiplyI(0, 1, FF4R, FF4I),
	            FFR = 0.25 * (-2 * Wy_SQ - FF3R + FF5R),
	            FFI = 0.25 * (B6a - FF3I + FF5I)

	        //Now to calculate the term GG
	        // GG = ks*( \[Alpha]3c/X12 *(I C9 - A2)  +  \[Alpha]3/X11 *(-C9 + I A1));
	        ,
	            GG1R = helpers.cmultiplyR(-C9, A1, alpha3R, alpha3I),
	            GG1I = helpers.cmultiplyI(-C9, A1, alpha3R, alpha3I),
	            GG2R = helpers.cdivideR(GG1R, GG1I, X11R, X11I),
	            GG2I = helpers.cdivideI(GG1R, GG1I, X11R, X11I),
	            GG3R = helpers.cmultiplyR(-A2, C9, alpha3cR, alpha3cI),
	            GG3I = helpers.cmultiplyI(-A2, C9, alpha3cR, alpha3cI),
	            GG4R = helpers.cdivideR(GG3R, GG3I, X12R, X12I),
	            GG4I = helpers.cdivideI(GG3R, GG3I, X12R, X12I),
	            GGR = k_s * (GG2R + GG4R),
	            GGI = k_s * (GG2I + GG4I)

	        //Now to calculate the term HH
	        // HH = L * \[Rho]/2 *(I B0 + ks*(B3/Y21 *(-I C10 - A1)  +  B4/Y22 *(C10 + I A2)));
	        // HH = L * \[Rho]/2 *(I B0 + ks*(B3/Y21 *(-I C10 - A1)  +  B4/Y22 *(C10 + I A2)));
	        ,
	            HH2R = B4 * helpers.cdivideR(C10, A2, Y22R, Y22I),
	            HH2I = B4 * helpers.cdivideI(C10, A2, Y22R, Y22I),
	            HH4R = B3 * helpers.cdivideR(-A1, -C10, Y21R, Y21I),
	            HH4I = B3 * helpers.cdivideI(-A1, -C10, Y21R, Y21I),
	            HHR = 0.5 * LRho * (k_s * (HH2R + HH4R)),
	            HHI = 0.5 * LRho * (B0 + k_s * (HH2I + HH4I))

	        //Now to calculate the term II
	        // II = IIrho + IIgam + IIdelk
	        // IIrho = 1/4* ks*kp*L^2*\[Rho]^2 ( -B3^2/Y21 +I B4^2/Y22)
	        // IIgam = kp*ks*(\[Alpha]3^2/X11 - I \[Alpha]3c^2/X12)
	        // IIdelk = 2 \[CapitalGamma]4s + 0.5 I (C3*B0)

	        ,
	            IIrho1R = sq(B4) * helpers.cdivideR(0, 1, Y22R, Y22I),
	            IIrho1I = sq(B4) * helpers.cdivideI(0, 1, Y22R, Y22I),
	            IIrho2R = sq(B3) * helpers.cdivideR(1, 0, Y21R, Y21I),
	            IIrho2I = sq(B3) * helpers.cdivideI(1, 0, Y21R, Y21I),
	            IIrhoR = 0.25 * LRho_sq * (IIrho1R - IIrho2R),
	            IIrhoI = 0.25 * LRho_sq * (IIrho1I - IIrho2I),
	            IIgam1R = helpers.cmultiplyR(alpha3R, alpha3I, alpha3R, alpha3I),
	            IIgam1I = helpers.cmultiplyI(alpha3R, alpha3I, alpha3R, alpha3I),
	            IIgam2R = helpers.cdivideR(IIgam1R, IIgam1I, X11R, X11I),
	            IIgam2I = helpers.cdivideI(IIgam1R, IIgam1I, X11R, X11I),
	            IIgam3R = helpers.cmultiplyR(alpha3cR, alpha3cI, alpha3cR, alpha3cI),
	            IIgam3I = helpers.cmultiplyI(alpha3cR, alpha3cI, alpha3cR, alpha3cI),
	            IIgam4R = helpers.cdivideR(IIgam3R, IIgam3I, X12R, X12I),
	            IIgam4I = helpers.cdivideI(IIgam3R, IIgam3I, X12R, X12I),
	            IIgamR = IIgam2R + IIgam4I,
	            IIgamI = IIgam2I - IIgam4R,
	            IIR = 2 * GAM4s + KpKs * (IIrhoR + IIgamR),
	            III = 0.5 * (C3 * B0) + KpKs * (IIrhoI + IIgamI)

	        // ,IIR = 0
	        // ,III = 0
	        // ,HHR = 0
	        // ,HHI = 0
	        // ,GGR = 0
	        // ,GGI = 0
	        // // ,II2R = helpers.cmultiplyR(B6, 0, 0, 2*C7)
	        // ,II2I = helpers.cmultiplyI(B6, 0, 0, 2*C7)
	        // ,IIR = 0.25 * helpers.caddR(II1R, II1I, II2R, II2I)
	        // ,III = 0.25 * helpers.caddI(II1R, II1I, II2R, II2I)

	        // Now calculate terms in the numerator
	        // Exp(-(GG^2/(4 EE)) - HH^2/(4 FF) + II)
	        ,
	            EXP1R = helpers.cmultiplyR(GGR, GGI, GGR, GGI),
	            EXP1I = helpers.cmultiplyI(GGR, GGI, GGR, GGI),
	            EXP2R = -helpers.cdivideR(EXP1R, EXP1I, EER, EEI) / 4,
	            EXP2I = -helpers.cdivideI(EXP1R, EXP1I, EER, EEI) / 4,
	            EXP3R = helpers.cmultiplyR(HHR, HHI, HHR, HHI),
	            EXP3I = helpers.cmultiplyI(HHR, HHI, HHR, HHI),
	            EXP4R = helpers.cdivideR(EXP3R, EXP3I, -4 * FFR, -4 * FFI),
	            EXP4I = helpers.cdivideI(EXP3R, EXP3I, -4 * FFR, -4 * FFI),
	            EXPR = EXP2R + EXP4R + IIR,
	            EXPI = EXP2I + EXP4I + III

	        // Now calculate terms in the DENominator
	        // 8 * Sqrt[AA1 BB1 AA2 BB2 EE FF]
	        ,
	            Den1R = helpers.cmultiplyR(AA1R, AA1I, BB1R, BB1I),
	            Den1I = helpers.cmultiplyI(AA1R, AA1I, BB1R, BB1I),
	            Den2R = helpers.cmultiplyR(AA2R, AA2I, BB2R, BB2I),
	            Den2I = helpers.cmultiplyI(AA2R, AA2I, BB2R, BB2I),
	            Den3R = helpers.cmultiplyR(EER, EEI, FFR, FFI),
	            Den3I = helpers.cmultiplyI(EER, EEI, FFR, FFI),
	            Den4R = helpers.cmultiplyR(Den1R, Den1I, Den2R, Den2I),
	            Den4I = helpers.cmultiplyI(Den1R, Den1I, Den2R, Den2I),
	            Den5R = helpers.cmultiplyR(Den4R, Den4I, Den3R, Den3I),
	            Den5I = helpers.cmultiplyI(Den4R, Den4I, Den3R, Den3I),
	            DenR = 8 * helpers.csqrtR(Den5R, Den5I),
	            DenI = 8 * helpers.csqrtI(Den5R, Den5I)

	        // Now calculate the full term in the integral.
	        // @TODO: Not sure how to correctly handle the apodization in the double length integral
	        ,
	            pmzcoeff = Math.exp(-1 / 2 * sq(z1 / bw)) * Math.exp(-1 / 2 * sq(z2 / bw)) // apodization
	        // ,pmzcoeff = 1
	        // Exponential using Euler's formula
	        ,
	            coeffR = Math.exp(EXPR)
	        // ,coeffR = 1
	        ,
	            EReal = coeffR * pmzcoeff * Math.cos(EXPI),
	            EImag = coeffR * pmzcoeff * Math.sin(EXPI)

	        // ,real = coeffR
	        // ,imag = 0

	        ,
	            real = 0.5 * helpers.cdivideR(EReal, EImag, DenR, DenI),
	            imag = 0.5 * helpers.cdivideI(EReal, EImag, DenR, DenI)

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
	        delKz = delK[2];

	    var arg = P.L / 2 * delKz;

	    var PMt = 1;
	    if (P.calcfibercoupling) {
	        var dz = 2 / P.numz2Dint;
	        var pmintz = helpers.Nintegrate2D_3_8_singles(zintfunc, calcz1terms, -1, 1, -1, 1, P.numz2Dint, P.z2Dweights);
	        // var  z1 = 0
	        //     ,z2 = 0.5
	        // var z1 = 0.5
	        //     ,z2 = -0.7
	        //     ;
	        // var pmintz = zintfunc(z1,z2, calcz1terms(z1));

	        // console.log("Int: " + pmintz[0].toString() + ", " + pmintz[1].toString() + ", " + P.z2Dweights.length.toString());
	        // var dz = 1;
	        // var pmintz = helpers.Nintegrate2arg(zintfunc,-1, 1,dz,1,P.zweights);
	        // PMz_real = pmintz[0]/P.L ;
	        // PMz_imag = pmintz[1]/P.L ;
	        PMz_real = pmintz[0] / 2;
	        PMz_imag = pmintz[1] / 2;
	        // var coeff = ((omega_s * omega_i)/ (P.n_s * P.n_i));
	        var coeff = 1;
	        PMz_real = PMz_real * coeff;
	        PMz_imag = PMz_imag * coeff;
	    } else {
	        var PMzNorm1 = Math.sin(arg) / arg;
	        // var PMz_real =  PMzNorm1 * Math.cos(arg);
	        // var PMz_imag = PMzNorm1 * Math.sin(arg);
	        PMz_real = PMzNorm1;
	        PMz_imag = 0;
	        PMt = Math.exp(-0.5 * (sq(delK[0]) + sq(delK[1])) * sq(P.W));
	    }
	    // console.log("Inside calculation");
	    // console.log("Int: " + PMz_real.toString() + ", " + PMz_imag.toString());

	    if (P.use_guassian_approx) {
	        PMz_real = Math.exp(-0.193 * sq(arg));
	        PMz_imag = 0;
	    }
	    convertToMeters(P);
	    P.lambda_p = lambda_p; //set back to the original lambda_p
	    P.n_p = n_p;

	    // console.log("real: " + PMz_real.toString() + " imag: " + PMz_imag.toString());


	    return [PMz_real, PMz_imag, PMt];
	};

	Object.assign(module.exports, {
	    convertToMicrons: convertToMicrons,
	    convertToMeters: convertToMeters,
	    calc_PM_tz_k_coinc: calc_PM_tz_k_coinc,
	    calc_PM_tz_k_singles: calc_PM_tz_k_singles
		});

/***/ },
/* 153 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Constants accessible to PhaseMatch internally
	 */

	var PlotHelpers = module.exports = {};
	var helpers = __webpack_require__(48);
	var sq = helpers.sq;
	var con = __webpack_require__(53);
	var PhaseMatch = __webpack_require__(54);

	PlotHelpers.calc_JSA = function calc_JSA(props, ls_start, ls_stop, li_start, li_stop, dim) {

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


	    var todeg = 180 / Math.PI;
	    // // console.log(P.phi_i*todeg, P.phi_s*todeg);
	    // P.theta_i = P.theta_s;
	    // var centerpm = PhaseMatch.phasematch(P);
	    // // console.log(sq(centerpm[0]) + sq(centerpm[1]));


	    var i;
	    var lambda_s = helpers.linspace(ls_start, ls_stop, dim);
	    var lambda_i = helpers.linspace(li_stop, li_start, dim);

	    var N = dim * dim;
	    var PMreal = new Float64Array(N);
	    var PMimag = new Float64Array(N);

	    var maxpm = 0;

	    // calculate normalization
	    var PMN = PhaseMatch.phasematch(P);
	    var norm = Math.sqrt(sq(PMN[0]) + sq(PMN[1]));

	    for (i = 0; i < N; i++) {
	        var index_s = i % dim;
	        var index_i = Math.floor(i / dim);

	        P.lambda_s = lambda_s[index_s];
	        P.lambda_i = lambda_i[index_i];

	        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
	        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

	        var PM = PhaseMatch.phasematch(P);
	        PMreal[i] = PM[0] / norm;
	        PMimag[i] = PM[1] / norm;
	        // C_check = PM[2];
	        // if (PM[i]>maxpm){maxpm = PM[i];}
	    }

	    // // console.log("Approx Check, ", C_check);
	    return [PMreal, PMimag];
	};

	PlotHelpers.calc_JSI = function calc_JSI(props, ls_start, ls_stop, li_start, li_stop, dim) {
	    var N = dim * dim;

	    var JSI = new Float64Array(N);

	    var JSA = PlotHelpers.calc_JSA(props, ls_start, ls_stop, li_start, li_stop, dim);

	    for (var i = 0; i < N; i++) {

	        JSI[i] = sq(JSA[0][i]) + sq(JSA[1][i]);
	    }
	    JSI = helpers.normalize(JSI);
	    return JSI;
	};

	PlotHelpers.calc_JSA_p = function calc_JSA_p(props, lambda_s, lambda_i, dim, norm) {
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


	    var todeg = 180 / Math.PI;

	    // // console.log("Inside JSA_p:  Theta_s: " + (P.theta_s*todeg).toString() + ", Theta_i: " + (P.theta_i*todeg).toString() );
	    // // console.log(P.phi_i*todeg, P.phi_s*todeg);
	    // P.theta_i = P.theta_s;
	    // var centerpm = PhaseMatch.phasematch(P);
	    // // console.log(sq(centerpm[0]) + sq(centerpm[1]));


	    var i;
	    // var lambda_s = helpers.linspace(ls_start, ls_stop, dim);
	    // var lambda_i = helpers.linspace(li_stop, li_start, dim);

	    var N = lambda_s.length * lambda_i.length;
	    var PMreal = new Float64Array(N);
	    var PMimag = new Float64Array(N);

	    var maxpm = 0;

	    // calculate normalization
	    // var PMN = PhaseMatch.phasematch(P);
	    // var norm = Math.sqrt(sq(PMN[0]) + sq(PMN[1]));


	    for (var j = 0; j < lambda_i.length; j++) {
	        for (i = 0; i < lambda_s.length; i++) {
	            var index_s = i;
	            var index_i = j;

	            P.lambda_s = lambda_s[index_s];
	            P.lambda_i = lambda_i[index_i];

	            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
	            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

	            // P.lambda_s = P.lambda_s *1E6;
	            // P.lambda_i = P.lambda_i *1E6;

	            var PM = PhaseMatch.phasematch(P);
	            PMreal[i + lambda_s.length * j] = PM[0] / norm;
	            PMimag[i + lambda_s.length * j] = PM[1] / norm;
	        }
	    }

	    // // console.log("JSA coinc Max: " + helpers.max(PMreal).toString());
	    // // console.log("Approx Check, ", C_check);
	    return [PMreal, PMimag];
	};

	PlotHelpers.calc_JSI_p = function calc_JSI_p(props, lambda_s, lambda_i, dim, norm) {
	    var N = lambda_s.length * lambda_i.length;
	    var JSI = new Float64Array(N);
	    var JSA = PlotHelpers.calc_JSA_p(props, lambda_s, lambda_i, dim, norm);

	    for (var i = 0; i < N; i++) {

	        JSI[i] = sq(JSA[0][i]) + sq(JSA[1][i]);
	    }
	    // JSI = helpers.normalize(JSI);

	    return JSI;
	};

	// Calculate and return the coincidence rate
	PlotHelpers.calc_JSI_rates_p = function calc_JSI_rates_p(props, lambda_s, lambda_i, dim, norm) {
	    var N = lambda_s.length * lambda_i.length;
	    var JSI = new Float64Array(N);
	    var JSA = PlotHelpers.calc_JSA_p(props, lambda_s, lambda_i, dim, 1);
	    var dw_s = (lambda_s[lambda_s.length - 1] - lambda_s[0]) / lambda_s.length;
	    var dw_i = (lambda_i[lambda_i.length - 1] - lambda_i[0]) / lambda_i.length;

	    var Ws_SQ = Math.pow(props.W_sx, 2),
	        PHI_s = 1 / Math.cos(props.theta_s_e),
	        PHI_i = 1 / Math.cos(props.theta_i_e),
	        twoPIc = 2 * Math.PI * con.c,
	        omega_s = twoPIc / props.lambda_s,
	        omega_i = twoPIc / props.lambda_i
	    // ,pumpScale = Math.pow(props.W,2) // May need to later include the ellipticity parameter
	    ,
	        scale = sq(props.W_sx) * PHI_s * sq(props.W_ix) * PHI_i * sq(props.W),
	        inv_lambda_s_sq = 0,
	        inv_lambda_i_sq = 0,
	        dlambda_s = Math.abs(lambda_s[lambda_s.length - 1] - lambda_s[0]) / lambda_s.length,
	        dlambda_i = Math.abs(lambda_i[lambda_i.length - 1] - lambda_i[0]) / lambda_i.length,
	        norm_sum_s = twoPIc * dlambda_s,
	        norm_sum_i = twoPIc * dlambda_i,
	        lomega = omega_s * omega_i / sq(props.n_s * props.n_i),
	        norm_const = props.get_rates_constant();

	    // for (var l = 0; l<lambda_s.length; l++){
	    //     inv_lambda_s_sq += 1/sq(lambda_s[l]);
	    // }

	    // for (var k = 0; k<lambda_i.length; k++){
	    //     inv_lambda_i_sq += 1/sq(lambda_i[k]);
	    // }

	    var d_omega_s = norm_sum_s / sq(props.lambda_s);
	    var d_omega_i = norm_sum_i / sq(props.lambda_i);

	    // var d_omega_s = 1;
	    // var d_omega_i = 1;

	    for (var i = 0; i < N; i++) {

	        JSI[i] = (sq(JSA[0][i]) + sq(JSA[1][i])) * norm_const * scale * (d_omega_s * d_omega_i) * lomega;
	    }

	    // And now we have the scaling.


	    return JSI;
	};

	////////////////////
	//CURRENT
	PlotHelpers.calc_JSI_Singles_p = function calc_JSI_Singles_p(props, lambda_s, lambda_i, dim, norm) {

	    props.update_all_angles();
	    // // console.log(props.lambda_i/1e-9, props.lambda_s/1e-9, props.theta_s*180/Math.PI, props.theta_i*180/Math.PI);
	    var P = props.clone();
	    // // console.log(P.theta_i*180/Math.PI, P.phi_i*180/Math.PI);
	    // P.theta_i = 0.6*Math.PI/180;
	    P.phi_i = P.phi_s + Math.PI;
	    P.update_all_angles();
	    P.optimum_idler(P);

	    var todeg = 180 / Math.PI;

	    var i;
	    var N = lambda_s.length * lambda_i.length;
	    var PMreal_s = new Float64Array(N);
	    var PMimag_s = new Float64Array(N);
	    var PMmag_s = new Float64Array(N);

	    var PMreal_i = new Float64Array(N);
	    var PMimag_i = new Float64Array(N);
	    var PMmag_i = new Float64Array(N);

	    // var dOmega_s = new Float64Array( lambda_s.length );
	    // var dOmega_i = new Float64Array( lambda_i.length );


	    var maxpm = 0;

	    var Ws_SQ = Math.pow(P.W_sx, 2),
	        Wi_SQ = Math.pow(P.W_ix, 2),
	        PHI_s = 1 / Math.cos(P.theta_s_e),
	        PHI_i = 1 / Math.cos(P.theta_i_e),
	        twoPIc = 2 * Math.PI * con.c,
	        omega_s = twoPIc / P.lambda_s,
	        omega_i = twoPIc / P.lambda_i,
	        dOmega_s,
	        dOmega_i,
	        pumpScale = Math.pow(P.W, 2) // May need to later include the ellipticity parameter
	    ,
	        scale_s = 1 / (Ws_SQ * PHI_s * pumpScale),
	        scale_i = 1 / (Wi_SQ * PHI_i * pumpScale) //assume symmetric coupling geometry
	    ,
	        dlambda_s = Math.abs(lambda_s[lambda_s.length - 1] - lambda_s[0]) / lambda_s.length,
	        dlambda_i = Math.abs(lambda_i[lambda_i.length - 1] - lambda_i[0]) / lambda_i.length,
	        norm_sum_s = twoPIc * dlambda_s,
	        norm_sum_i = twoPIc * dlambda_i,
	        lomega = omega_s * omega_i / sq(props.n_s * props.n_i),
	        norm_const = props.get_rates_constant();

	    // calculate normalization
	    // var PMN = PhaseMatch.phasematch(P);
	    // var norm = Math.sqrt(sq(PMN[0]) + sq(PMN[1]));


	    // var lomega = omega_s * omega_i /sq(props.n_s*props.n_i);

	    // dOmega_s = lomega*(twoPIc*Math.abs(1/lambda_s[0] - 1/lambda_s[lambda_s.length-1])/lambda_s.length);
	    // dOmega_i = lomega* (twoPIc*Math.abs(1/lambda_i[0] - 1/lambda_i[lambda_i.length-1])/lambda_i.length);

	    for (var j = 0; j < lambda_i.length; j++) {
	        for (i = 0; i < lambda_s.length; i++) {
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
	            PMreal_s[i + lambda_s.length * j] = PM[0] / norm;
	            PMimag_s[i + lambda_s.length * j] = PM[1] / norm;
	            PMmag_s[i + lambda_s.length * j] = Math.sqrt(sq(PMreal_s[i + lambda_s.length * j]) + sq(PMimag_s[i + lambda_s.length * j])) * norm_const * (dOmega_s * dOmega_i) * lomega / scale_s;

	            // Now calculate the Idler JSI
	            // The role of the signal and idler get swapped in the calculation
	            // but the signal and idler wavelengths and other properties stay the same
	            // so there is no need to transpose the PMmag_i array.
	            P.swap_signal_idler();
	            var PM_i = PhaseMatch.phasematch_singles(P);
	            P.swap_signal_idler();
	            PMreal_i[i + lambda_s.length * j] = PM_i[0] / norm;
	            PMimag_i[i + lambda_s.length * j] = PM_i[1] / norm;
	            PMmag_i[i + lambda_s.length * j] = Math.sqrt(sq(PMreal_i[i + lambda_s.length * j]) + sq(PMimag_i[i + lambda_s.length * j])) * norm_const * (dOmega_s * dOmega_i) * lomega / scale_i;
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
	PlotHelpers.calc_PM_Curves = function calc_PM_Curves(props, l_start, l_stop, lp_start, lp_stop, type, dim) {

	    props.update_all_angles();
	    var P = props.clone();

	    if (P.brute_force) {
	        dim = P.brute_dim;
	    }

	    var i;
	    var lambda_p = helpers.linspace(lp_start, lp_stop, dim);
	    // lambda_s is either the signal or idler wavelength
	    var lambda_s = helpers.linspace(l_stop, l_start, dim);

	    var N = dim * dim;
	    var PM = new Float64Array(N);

	    if (type === 'signal') {
	        for (i = 0; i < N; i++) {
	            var index_p = i % dim;
	            var index_s = Math.floor(i / dim);

	            P.lambda_s = lambda_s[index_s];
	            P.lambda_p = lambda_p[index_p];
	            P.lambda_i = 1 / (1 / P.lambda_p - 1 / P.lambda_s);

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
	PlotHelpers.calc_PM_Crystal_Tilt = function calc_PM_Crystal_Tilt(props, ls_start, ls_stop, theta_start, theta_stop, dim) {

	    props.update_all_angles();
	    var P = props.clone();

	    // if (P.brute_force){
	    //     dim = P.brute_dim;
	    // }

	    var i;
	    // lambda_s is either the signal or idler wavelength
	    var lambda_s = helpers.linspace(ls_stop, ls_start, dim);
	    // internal angle of the optic axis wrt to the pump direction.
	    var theta = helpers.linspace(theta_start, theta_stop, dim);

	    var N = dim * dim;
	    var PM = new Float64Array(N);

	    for (i = 0; i < N; i++) {
	        var index_theta = i % dim;
	        var index_s = Math.floor(i / dim);

	        P.lambda_s = lambda_s[index_s];
	        P.theta = theta[index_theta];
	        P.lambda_i = 1 / (1 / P.lambda_p - 1 / P.lambda_s);

	        //crystal has changed angle, so update all angles and indices
	        P.update_all_angles();

	        PM[i] = "phasematch";
	    }

	    return PM;
	};

	/* This plots the phasematching curve for crystal theta and phi.
	*/
	PlotHelpers.calc_PM_Pump_Theta_Phi = function calc_PM_Pump_Theta_Phi(props, theta_start, theta_stop, phi_start, phi_stop, dim) {

	    props.update_all_angles();
	    var P = props.clone();

	    // if (P.brute_force){
	    //     dim = P.brute_dim;
	    // }

	    var i;
	    var theta = helpers.linspace(theta_start, theta_stop, dim);
	    var phi = helpers.linspace(phi_stop, phi_start, dim);

	    var N = dim * dim;
	    var PM = new Float64Array(N);

	    for (i = 0; i < N; i++) {
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
	PlotHelpers.calc_PM_Pump_Theta_Poling = function calc_PM_Pump_Theta_Poling(props, poling_start, poling_stop, theta_start, theta_stop, dim) {

	    props.update_all_angles();
	    var P = props.clone();

	    // if (P.brute_force){
	    //     dim = P.brute_dim;
	    // }

	    var i;
	    var poling = helpers.linspace(poling_start, poling_stop, dim);
	    var theta = helpers.linspace(theta_stop, theta_start, dim);

	    var N = dim * dim;
	    var PM = new Float64Array(N);

	    for (i = 0; i < N; i++) {
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
	// PlotHelpers.calc_indicies = function calc_indicies(props, dim){

	//     props.update_all_angles();
	//     var P = props.clone();

	//     // if (P.brute_force){
	//     //     dim = P.brute_dim;
	//     // }

	//     var i;
	//     var poling = helpers.linspace(poling_start, poling_stop, dim);
	//     var theta = helpers.linspace(theta_stop, theta_start, dim);

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


	PlotHelpers.calc_XY = function calc_XY(props, x_start, x_stop, y_start, y_stop, dim) {
	    // // console.log('inside calc_xy',props.phi*180/Math.PI);
	    props.update_all_angles();
	    var P = props.clone();
	    P.lambda_i = 1 / (1 / P.lambda_p - 1 / P.lambda_s);
	    // // console.log(P.lambda_i);
	    // P.update_all_angles();
	    // // console.log(P);
	    // // console.log('After clone',props.phi*180/Math.PI);

	    P.phi_i = P.phi_s + Math.PI;
	    P.brute_force = true;
	    if (P.brute_force) {
	        // Check to see if the Rayleigh range is shorter than the crystal.
	        // If so, set the lenght of the crystal to be equal to 2* Rayleigh rang
	        var z0 = Math.PI * P.W * P.W / P.lambda_p;
	        //     //console.log("Rayleigh Range: " + (z0*1e6).toString());
	        if (10 * z0 < P.L) {
	            P.L = 10 * z0;
	        }
	        // dim = P.brute_dim;
	        // dim = 5;
	    }

	    // Find the stopping angle to integrate over
	    var int_angles = PhaseMatch.autorange_theta(P);
	    var tstart = int_angles[0];
	    var tstop = int_angles[1];
	    if (P.theta_s * 180 / Math.PI < 4) {
	        tstart = 0;
	    }

	    if (tstop < x_stop) {
	        tstop = x_stop;
	    }

	    if (tstop < P.theta_i) {
	        tstop = P.theta_i;
	    }
	    // if (tstop < P.theta_s_e){
	    //     tstop =
	    // }
	    // int_angles[1] = (P.theta_s_e - int_angles[0]) + P.theta_s_e;
	    var num_pts_per_deg = 20;
	    var numint = Math.round((tstop - tstart) * 180 / Math.PI * num_pts_per_deg);
	    // if (numint < 100){
	    //     numint = 100;
	    // };
	    //     //console.log("number of integration points: " + numint.toString());

	    P.theta_s_e = x_stop;
	    var theta_stop = PhaseMatch.find_internal_angle(P, "signal");
	    var int_weights = helpers.NintegrateWeights(numint),
	        diff = tstop - tstart,
	        dtheta = diff / numint;
	    tstart = 0;
	    tstop = theta_stop;

	    // // console.log("theta_stop: " + (theta_stop*180/Math.PI).toString() +', ' + numint.toString() +', ' + diff.toString() +', ' +dtheta.toString() );
	    var i;

	    var theta_x_e = helpers.linspace(x_start, x_stop, dim);
	    var theta_y_e = helpers.linspace(y_stop, y_start, dim);
	    var X = theta_x_e;
	    var Y = theta_y_e;

	    for (var k = 0; k < dim; k++) {
	        if (theta_x_e[k] < 0) {
	            P.theta_s_e = -1 * theta_x_e[k];
	            X[k] = -1 * PhaseMatch.find_internal_angle(P, "signal");
	            Y[dim - k - 1] = X[k];
	        } else {
	            P.theta_s_e = theta_x_e[k];
	            X[k] = PhaseMatch.find_internal_angle(P, "signal");
	            Y[dim - k - 1] = X[k];
	        }
	    }

	    var N = dim * dim;
	    var PM = new Float64Array(N);
	    var PM_int_results = new Float64Array(numint);

	    var startTime = new Date();

	    var angintfunct = function angintfunct(theta_i) {
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

	    for (i = 0; i < N; i++) {
	        var index_x = i % dim;
	        var index_y = Math.floor(i / dim);

	        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
	        P.phi_s = Math.atan2(Y[index_y], X[index_x]);

	        // if (X[index_x] < 0){ P.phi_s += Math.PI;}
	        // if (P.phi_s<0){ P.phi_s += 2*Math.PI;}

	        // // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
	        P.phi_i = P.phi_s + Math.PI;

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

	            for (var j = 0; j < numint; j++) {
	                PM_int_results[j] = angintfunct(tstart + dtheta * j);
	            }

	            // PM[i] = Math.max.apply(Math, PM_int_results);
	            PM[i] = helpers.max(PM_int_results);
	            // var pm_int_ang = helpers.Nintegrate2arg(angintfunct,tstart, tstop, dtheta,numint,int_weights);
	            // // console.log("int result: " + pm_int_ang[0].toString());
	            // PM[i] = Math.sqrt(pm_int_ang[0]*pm_int_ang[0] + pm_int_ang[1]*pm_int_ang[1])/diff;
	        } else {
	            //calculate the correct idler angle analytically.
	            // // console.log('hello');
	            P.optimum_idler(P);
	            PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
	        }

	        // // console.log('inside !',props.phi*180/Math.PI);
	    }
	    P.brute_force = false;
	    var endTime = new Date();
	    var timeDiff = endTime - startTime;
	    //console.log("return" + timeDiff.toString());
	    return PM;
	};

	PlotHelpers.calc_XY_both = function calc_XY_both(props, x_start, x_stop, y_start, y_stop, dim) {
	    // // console.log('inside calc_xy',props.phi*180/Math.PI);

	    props.update_all_angles();
	    var P = props.clone();
	    P.lambda_i = 1 / (1 / P.lambda_p - 1 / P.lambda_s);
	    // // console.log(P.lambda_i);
	    // P.update_all_angles();
	    // // console.log(P);
	    // // console.log('After clone',props.phi*180/Math.PI);

	    P.phi_i = P.phi_s + Math.PI;

	    if (P.brute_force) {
	        dim = P.brute_dim;
	    }

	    var i;

	    var theta_x_e = helpers.linspace(x_start, x_stop, dim);
	    var theta_y_e = helpers.linspace(y_stop, y_start, dim);
	    var X = theta_x_e;
	    var Y = theta_y_e;

	    for (var k = 0; k < dim; k++) {
	        if (theta_x_e[k] < 0) {
	            P.theta_s_e = -1 * theta_x_e[k];
	            X[k] = -1 * PhaseMatch.find_internal_angle(P, "signal");
	            Y[dim - k - 1] = X[k];
	        } else {
	            P.theta_s_e = theta_x_e[k];
	            X[k] = PhaseMatch.find_internal_angle(P, "signal");
	            Y[dim - k - 1] = X[k];
	        }
	    }

	    var N = dim * dim;
	    var PM = new Float64Array(N),
	        index_x,
	        index_y;

	    // Find Signal distribution
	    for (i = 0; i < N; i++) {
	        index_x = i % dim;
	        index_y = Math.floor(i / dim);

	        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
	        P.phi_s = Math.atan2(Y[index_y], X[index_x]);
	        P.phi_i = P.phi_s + Math.PI;

	        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
	        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

	        if (P.brute_force) {
	            P.brute_force_theta_i(P); //use a search. could be time consuming.
	        } else {
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
	    if (P.type === "Type 0:   o -> o + o" || P.type === "Type 1:   e -> o + o" || P.type === "Type 0:   e -> e + e") {
	        //swap signal and idler frequencies.
	        var lambda_s = P.lambda_s;
	        P.lambda_s = P.lambda_i;
	        P.lambda_i = lambda_s;
	    }
	    if (P.type === "Type 2:   e -> e + o") {
	        // // console.log("switching");
	        P.type = "Type 2:   e -> o + e";
	    } else if (P.type === "Type 2:   e -> o + e") {
	        // // console.log("other way");
	        P.type = "Type 2:   e -> e + o";
	    }

	    for (i = 0; i < N; i++) {
	        index_x = i % dim;
	        index_y = Math.floor(i / dim);

	        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
	        P.phi_s = Math.atan2(Y[index_y], X[index_x]);
	        P.phi_i = P.phi_s + Math.PI;

	        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
	        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

	        if (P.brute_force) {
	            P.brute_force_theta_i(P); //use a search. could be time consuming.
	        } else {
	            //calculate the correct idler angle analytically.
	            P.optimum_idler(P);
	        }

	        PM[i] += PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
	    }

	    return PM;
	};

	PlotHelpers.calc_lambda_s_vs_theta_s = function calc_lambda_s_vs_theta_s(props, l_start, l_stop, t_start, t_stop, dim) {

	    props.update_all_angles();
	    var P = props.clone();

	    P.phi_i = P.phi_s + Math.PI;

	    if (P.brute_force) {
	        dim = P.brute_dim;
	    }

	    var theta_s_e = helpers.linspace(t_stop, t_start, dim);
	    var theta_s = theta_s_e;

	    for (var k = 0; k < dim; k++) {
	        P.theta_s_e = theta_s_e[k];
	        theta_s[k] = PhaseMatch.find_internal_angle(P, "signal");
	    }
	    var i;
	    var lambda_s = helpers.linspace(l_start, l_stop, dim);
	    // var theta_s_e = [];

	    var N = dim * dim;
	    var PM = new Float64Array(N);
	    var radtodeg = 180 / Math.PI;

	    var startTime = new Date();
	    for (i = 0; i < N; i++) {
	        var index_s = i % dim;
	        var index_i = Math.floor(i / dim);

	        P.lambda_s = lambda_s[index_s];
	        P.theta_s = theta_s[index_i];
	        P.lambda_i = 1 / (1 / P.lambda_p - 1 / P.lambda_s);

	        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
	        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

	        if (P.brute_force) {
	            P.brute_force_theta_i(P); //use a search. could be time consuming.
	        } else {
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
	    var timeDiff = endTime - startTime;
	    return { data: PM };
	};

	PlotHelpers.calc_theta_phi = function calc_theta_phi(props, t_start, t_stop, p_start, p_stop, dim) {

	    props.update_all_angles();
	    var P = props.clone();
	    P.phi_i = P.phi_s + Math.PI;

	    var i;
	    var theta = helpers.linspace(t_start, t_stop, dim);
	    var phi = helpers.linspace(p_start, p_stop, dim);

	    var N = dim * dim;
	    var PM = new Float64Array(N);

	    for (i = 0; i < N; i++) {
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

	PlotHelpers.calc_signal_theta_phi = function calc_calc_signal_theta_phi(props, x_start, x_stop, y_start, y_stop, dim) {

	    props.update_all_angles();
	    var P = props.clone();

	    if (P.brute_force) {
	        dim = P.brute_dim;
	    }

	    var theta_s_e = helpers.linspace(x_start, x_stop, dim);
	    var X = theta_s_e;

	    for (var k = 0; k < dim; k++) {
	        P.theta_s_e = theta_s_e[k];
	        X[k] = PhaseMatch.find_internal_angle(P, "signal");
	    }

	    var i;
	    // var X = PhaseMatch.linspace(x_start, x_stop, dim);
	    var Y = helpers.linspace(y_start, y_stop, dim);

	    var N = dim * dim;
	    var PM = new Float64Array(N);

	    var startTime = new Date();
	    for (i = 0; i < N; i++) {
	        var index_x = i % dim;
	        var index_y = Math.floor(i / dim);

	        P.theta_s = X[index_x];
	        P.phi_s = Y[index_y];

	        // // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
	        P.phi_i = P.phi_s + Math.PI;

	        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
	        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
	        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

	        if (P.brute_force) {
	            P.brute_force_theta_i(P); //use a search. could be time consuming.
	        } else {
	            //calculate the correct idler angle analytically.
	            P.optimum_idler(P);
	        }

	        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
	    }
	    var endTime = new Date();
	    var timeDiff = endTime - startTime;
	    return PM;
	};

	PlotHelpers.calc_signal_theta_vs_idler_theta = function calc_signal_theta_vs_idler_theta(props, x_start, x_stop, y_start, y_stop, dim) {

	    props.update_all_angles();
	    var P = props.clone();

	    var i;

	    var theta_s_e = helpers.linspace(x_start, x_stop, dim);
	    var theta_i_e = helpers.linspace(y_stop, y_start, dim);
	    var X = theta_s_e;
	    var Y = theta_i_e;

	    for (var k = 0; k < dim; k++) {
	        P.theta_s_e = theta_s_e[k];
	        X[k] = PhaseMatch.find_internal_angle(P, "signal");
	        P.theta_i_e = theta_i_e[k];
	        Y[k] = PhaseMatch.find_internal_angle(P, "idler");
	        // Y[k] = X[k];
	    }

	    // var X = helpers.linspace(x_start, x_stop, dim);
	    // var Y = helpers.linspace(y_stop, y_start, dim);

	    var N = dim * dim;
	    var PM = new Float64Array(N);

	    var startTime = new Date();
	    for (i = 0; i < N; i++) {
	        var index_x = i % dim;
	        var index_y = Math.floor(i / dim);

	        P.theta_s = X[index_x];
	        P.theta_i = Y[index_y];

	        // // console.log(P.theta_s /Math.PI * 180, P.phi_s /Math.PI * 180);
	        P.phi_i = P.phi_s + Math.PI;

	        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
	        P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
	        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
	        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

	        PM[i] = PhaseMatch.phasematch_Int_Phase(P)["phasematch"];
	        // PM[i] = PhaseMatch.calc_delK(P);
	    }
	    var endTime = new Date();
	    var timeDiff = endTime - startTime;
	    return PM;
	};

	PlotHelpers.calc_signal_phi_vs_idler_phi = function calc_signal_phi_vs_idler_phi(props, x_start, x_stop, y_start, y_stop, dim) {

	    props.update_all_angles();
	    var P = props.clone();

	    var i;
	    var X = helpers.linspace(x_start, x_stop, dim);
	    var Y = helpers.linspace(y_stop, y_start, dim);

	    var N = dim * dim;
	    var PM = new Float64Array(N);

	    for (i = 0; i < N; i++) {
	        var index_x = i % dim;
	        var index_y = Math.floor(i / dim);

	        P.phi_s = X[index_x];
	        P.phi_i = Y[index_y];

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
	PlotHelpers.calc_schmidt_plot = function calc_schmidt_plot(props, x_start, x_stop, y_start, y_stop, ls_start, ls_stop, li_start, li_stop, dim, params) {

	    props.update_all_angles();
	    var P = props.clone();

	    // if (P.brute_force && dim>P.brute_dim){
	    //     dim = P.brute_dim;
	    // }

	    var xrange = helpers.linspace(x_start, x_stop, dim);
	    var yrange = helpers.linspace(y_stop, y_start, dim);
	    var i;
	    var N = dim * dim;
	    var S = new Float64Array(N);

	    var dimjsa = 50; //make sure this is even

	    var maxpm = 0;
	    var maxschmidt = 10;
	    var x_ideal = 0;
	    var y_ideal = 0;

	    for (i = 0; i < N; i++) {
	        var index_s = i % dim;
	        var index_i = Math.floor(i / dim);

	        // Figure out what to plot in the x dimension
	        switch (params.x) {
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
	        switch (params.y) {
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

	        if (S[i] < maxschmidt) {
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
	PlotHelpers.calc_schmidt_plot_p = function calc_schmidt_plot(props, xrange, yrange, ls_start, ls_stop, li_start, li_stop, dim, params) {
	    props.update_all_angles();
	    var P = props.clone();

	    // if (P.brute_force && dim>P.brute_dim){
	    //     dim = P.brute_dim;
	    // }

	    // var xrange = helpers.linspace(x_start, x_stop, dim);
	    // var yrange = helpers.linspace(y_stop, y_start, dim);
	    var i;
	    var N = xrange.length * yrange.length;
	    var S = new Float64Array(N);

	    var dimjsa = 50; //make sure this is even

	    var maxpm = 0;
	    var maxschmidt = 10;
	    var x_ideal = 0;
	    var y_ideal = 0;

	    for (i = 0; i < N; i++) {
	        var index_x = i % xrange.length;
	        var index_y = Math.floor(i / xrange.length);

	        // Figure out what to plot in the x dimension
	        switch (params.x) {
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
	        switch (params.y) {
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

	        if (S[i] < maxschmidt) {
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
	PlotHelpers.calc_heralding_plot_p = function calc_heralding_plot_p(props, WpRange, WsRange, ls_start, ls_stop, li_start, li_stop, n) {
	    props.update_all_angles();
	    var P = props.clone(),
	        i,
	        N = WpRange.length * WsRange.length,
	        eff_s = new Float64Array(N),
	        eff_i = new Float64Array(N),
	        singles_s = new Float64Array(N),
	        singles_i = new Float64Array(N),
	        coinc = new Float64Array(N),
	        dim = 15,
	        maxeEff = 0,
	        Ws_ideal = 0,
	        Wp_ideal = 0,
	        Wi_SQ = Math.pow(P.W_sx, 2),
	        PHI_s = 1 / Math.cos(P.theta_s_e)
	    // ,PHI_i = 1/Math.cos(P.theta_s_i)
	    // ,n = n+(3- n%3) //guarantee that n is divisible by 3
	    ,
	        lambdaWeights = helpers.Nintegrate2DWeights_3_8(n)
	    // @@@@@@ For testing purposes
	    ,
	        lambda_s = helpers.linspace(ls_start, ls_stop, dim),
	        lambda_i = helpers.linspace(li_stop, li_start, dim);
	    // ,lambda_s = helpers.linspace(P.lambda_p *2, P.lambda_p *2, dim)
	    // ,lambda_i = helpers.linspace(P.lambda_p *2, P.lambda_p *2, dim)

	    n = 15; //make sure this is even


	    P.phi_i = P.phi_s + Math.PI;
	    P.update_all_angles();
	    P.optimum_idler(P);

	    var P_i = P.clone();
	    P_i.swap_signal_idler();
	    var PHI_i = 1 / Math.cos(P_i.theta_s_e);

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


	    function calc_singles_rate() {
	        var JSI_singles = PhaseMatch.calc_JSI_Singles_p(P, lambda_s, lambda_i, dim, 1);

	        // Now, since the calculation is done in terms of omega_s, omega_i, need to figure out
	        // step size of the Riemman sum.

	        // for (var i=0; i<lambda_s.length, i++){

	        // }
	        // var dw_s = (lambda_s[lambda_s.length-1] - lambda_s[0])/lambda_s.length;
	        // var dw_i = (lambda_i[lambda_i.length-1] - lambda_i[0])/lambda_i.length;
	        // console.log(helpers.Sum(JSI_singles[0]).toString());
	        return [helpers.Sum(JSI_singles[0]), helpers.Sum(JSI_singles[1])];
	    }

	    function calc_coinc_rate() {

	        // var JSI_coinc = PhaseMatch.calc_JSI_p(P, lambda_s,lambda_i, dim, 1);
	        var JSI_coinc = PhaseMatch.calc_JSI_rates_p(P, lambda_s, lambda_i, dim, 1);

	        return helpers.Sum(JSI_coinc);
	    }

	    for (i = 0; i < N; i++) {
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

	        // var singlesRate = helpers.Nintegrate2D_3_8(calc_singles_rate, ls_start, ls_stop, li_start, li_stop, n, lambdaWeights)
	        //     ,coincRate = helpers.Nintegrate2D_3_8(calc_coinc_rate, ls_start, ls_stop, li_start, li_stop, n, lambdaWeights)
	        //     ;

	        var singRate = calc_singles_rate(),
	            coincRate = calc_coinc_rate(),
	            singlesRate = singRate[0],
	            idlerSinglesRate = singRate[1];

	        // // coincRate = coincRate ;
	        // P.swap_signal_idler();
	        // // var PHI_i = 1/Math.cos(P_i.theta_s_e);
	        // // var idlerSinglesRate = helpers.Nintegrate2D_3_8(calc_singles_rate, li_start, li_stop, ls_start, ls_stop, n, lambdaWeights);
	        // var idlerSinglesRate = calc_singles_rate();
	        // P.swap_signal_idler();
	        // P.swap_signal_idler();
	        // // console.log("singles: " + singlesRate.toString() + ", coinc:" + coincRate.toString());
	        singles_s[i] = singlesRate; // / ( sq(P.W_sx) * PHI_s);
	        singles_i[i] = idlerSinglesRate; // / ( sq(P.W_sx) * PHI_i);
	        coinc[i] = coincRate;
	        eff_i[i] = coincRate / singlesRate; //*( sq(P.W_sx) * PHI_s);
	        eff_s[i] = coincRate / idlerSinglesRate; //  *( sq(P.W_sx) * PHI_i);
	        // // console.log(coincRate.toString() + ', ' + singlesRate.toString());

	    }
	    return [eff_i, eff_s, singles_s, singles_i, coinc];
	    // return eff;
	};

	/*
	* calc_heralding_plot_focus_position_p
	*/
	PlotHelpers.calc_heralding_plot_focus_position_p = function calc_heralding_plot_focus_position_p(props, WsRange, ls_start, ls_stop, li_start, li_stop, n) {
	    props.update_all_angles();
	    var WpRange = [props.W];
	    var P = props.clone()
	    // ,WpRange = [props.W]
	    ,
	        i,
	        N = WpRange.length * WsRange.length,
	        eff_s = new Float64Array(N),
	        eff_i = new Float64Array(N),
	        singles_s = new Float64Array(N),
	        singles_i = new Float64Array(N),
	        coinc = new Float64Array(N),
	        dim = 15,
	        maxeEff = 0,
	        Ws_ideal = 0,
	        Wp_ideal = 0,
	        Wi_SQ = Math.pow(P.W_sx, 2),
	        PHI_s = 1 / Math.cos(P.theta_s_e)
	    // ,PHI_i = 1/Math.cos(P.theta_s_i)
	    // ,n = n+(3- n%3) //guarantee that n is divisible by 3
	    ,
	        lambdaWeights = helpers.Nintegrate2DWeights_3_8(n)
	    // @@@@@@ For testing purposes
	    ,
	        lambda_s = helpers.linspace(ls_start, ls_stop, dim),
	        lambda_i = helpers.linspace(li_stop, li_start, dim);
	    // ,lambda_s = helpers.linspace(P.lambda_p *2, P.lambda_p *2, dim)
	    // ,lambda_i = helpers.linspace(P.lambda_p *2, P.lambda_p *2, dim)

	    n = 16; //make sure this is even
	    // // console.log("NNNNNNNN: " + WsRange.toString());
	    P.phi_i = P.phi_s + Math.PI;
	    P.update_all_angles();
	    P.optimum_idler(P);

	    var P_i = P.clone();
	    P_i.swap_signal_idler();
	    var PHI_i = 1 / Math.cos(P_i.theta_s_e);

	    function calc_singles_rate() {
	        var JSI_singles = PhaseMatch.calc_JSI_Singles_p(P, lambda_s, lambda_i, dim, 1);
	        // // console.log(helpers.Sum(JSI_singles[0]).toString());
	        return [helpers.Sum(JSI_singles[0]), helpers.Sum(JSI_singles[1])];
	    }

	    function calc_coinc_rate() {
	        var JSI_coinc = PhaseMatch.calc_JSI_p(P, lambda_s, lambda_i, dim, 1);
	        return helpers.Sum(JSI_coinc);
	    }

	    for (i = 0; i < N; i++) {
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

	        var singRate = calc_singles_rate(),
	            coincRate = calc_coinc_rate(),
	            singlesRate = singRate[0],
	            idlerSinglesRate = singRate[1];

	        singles_s[i] = singlesRate; // / ( sq(P.W_sx) * PHI_s);
	        singles_i[i] = idlerSinglesRate; // / ( sq(P.W_sx) * PHI_i);
	        coinc[i] = coincRate;
	        eff_i[i] = coincRate / singlesRate; //*( sq(P.W_sx) * PHI_s);
	        eff_s[i] = coincRate / idlerSinglesRate; //  *( sq(P.W_sx) * PHI_i);
	        // // console.log(coincRate.toString() + ', ' + singlesRate.toString());

	    }
	    return [eff_i, eff_s, singles_s, singles_i, coinc];
	    // return eff;
		};

/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/**
	* These are the properties that are used to calculate phasematching
	*/

	var properties = {};
	module.exports = properties;

	var cloneDeep = __webpack_require__(145);
	var assignWith = __webpack_require__(414);
	var pick = __webpack_require__(421);
	var con = __webpack_require__(53);
	var helpers = __webpack_require__(48);
	var sq = helpers.sq;
	var Crystals = __webpack_require__(106);
	var nelderMead = __webpack_require__(105);
	var PhaseMatch = __webpack_require__(54);

	// These are the names associated with the types
	// The "type" property is stored as an integer
	properties.PMTypes = ["Type 0:   o -> o + o", "Type 0:   e -> e + e", "Type 1:   e -> o + o", "Type 2:   e -> e + o", "Type 2:   e -> o + e"];

	properties.apodization_L = [];
	properties.apodization_coeff = [];
	// PhaseMatch.zweights = [];

	var spdcDefaults = {
	    lambda_p: 775 * con.nm,
	    lambda_s: 1550 * con.nm,
	    lambda_i: 1550 * 775 * con.nm / (1550 - 775),
	    type: "Type 2:   e -> e + o",
	    theta: 90 * Math.PI / 180,
	    phi: 0,
	    theta_s: 0,
	    theta_i: 0,
	    theta_s_e: 0 * Math.PI / 180,
	    theta_i_e: 0,
	    phi_s: 0,
	    phi_i: Math.PI,
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
	    crystal: Crystals('KTP-3'),
	    temp: 20,
	    enable_pp: true,
	    calcfibercoupling: true,
	    singles: false,
	    autocalfocus: true,
	    z0s: -2000 / 2 * con.um,
	    deff: 1 * con.pm,
	    Pav: 1e-3

	    // z0: 2000/2 * con.um
	};

	var spdcDefaultKeys = Object.keys(spdcDefaults);

	// deep copy callback to extend deeper into object
	var cloneCallback = function cloneCallback(a, b) {

	    var type = typeof b === 'undefined' ? 'undefined' : _typeof(b);

	    if (type === 'object' || type === 'array') {

	        return cloneDeep(b);
	    }

	    return b !== undefined ? b : a;
	};

	/**
	 * SPDCprop
	 */
	var SPDCprop = function SPDCprop(cfg) {
	    this.init(cfg);
	};

	SPDCprop.prototype = {

	    init: function init(cfg) {

	        // set properties or fall back to defaults
	        this.set(Object.assign({}, spdcDefaults, cfg));
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
	        if (this.autocalctheta) {
	            this.auto_calc_Theta();
	        }

	        this.auto_calc_collection_focus();

	        // Set the positions of the signal, idler, pump waists
	        this.z0p = 0 * con.um;
	        this.z0s = -1 * this.L / 2;
	        this.z0i = this.z0s;

	        // console.log(this.zweights);
	    },

	    calc_Coordinate_Transform: function calc_Coordinate_Transform(theta, phi, theta_s, phi_s) {
	        //Should save some calculation time by defining these variables.
	        var SIN_THETA = Math.sin(theta);
	        var COS_THETA = Math.cos(theta);
	        var SIN_THETA_S = Math.sin(theta_s);
	        var COS_THETA_S = Math.cos(theta_s);
	        var SIN_PHI = Math.sin(phi);
	        var COS_PHI = Math.cos(phi);

	        var SIN_PHI_S = Math.sin(phi_s);
	        var COS_PHI_S = Math.cos(phi_s);

	        var S_x = SIN_THETA_S * COS_PHI_S;
	        var S_y = SIN_THETA_S * SIN_PHI_S;
	        var S_z = COS_THETA_S;

	        // Transform from the lambda_p coordinates to crystal coordinates
	        var SR_x = COS_THETA * COS_PHI * S_x - SIN_PHI * S_y + SIN_THETA * COS_PHI * S_z;
	        var SR_y = COS_THETA * SIN_PHI * S_x + COS_PHI * S_y + SIN_THETA * SIN_PHI * S_z;
	        var SR_z = -SIN_THETA * S_x + COS_THETA * S_z;

	        // Normalambda_ize the unit vector
	        // @TODO: When theta = 0, Norm goes to infinity. This messes up the rest of the calculations. In this
	        // case I think the correct behaviour is for Norm = 1 ?
	        var Norm = Math.sqrt(sq(S_x) + sq(S_y) + sq(S_z));
	        var Sx = SR_x / Norm;
	        var Sy = SR_y / Norm;
	        var Sz = SR_z / Norm;

	        return [Sx, Sy, Sz];
	    },

	    calc_Index_PMType: function calc_Index_PMType(lambda, Type, S, photon) {
	        // console.log(properties.PMTypes[0]);
	        var ind = this.crystal.indicies(lambda, this.temp); //can I move this out to speed it up?

	        var nx_squared_inv = 1 / sq(ind[0]);
	        var ny_squared_inv = 1 / sq(ind[1]);
	        var nz_squared_inv = 1 / sq(ind[2]);

	        var Sx_squared = sq(S[0]);
	        var Sy_squared = sq(S[1]);
	        var Sz_squared = sq(S[2]);

	        var B = Sx_squared * (ny_squared_inv + nz_squared_inv) + Sy_squared * (nx_squared_inv + nz_squared_inv) + Sz_squared * (nx_squared_inv + ny_squared_inv);
	        var C = Sx_squared * (ny_squared_inv * nz_squared_inv) + Sy_squared * (nx_squared_inv * nz_squared_inv) + Sz_squared * (nx_squared_inv * ny_squared_inv);
	        var D = sq(B) - 4 * C;

	        var nslow = Math.sqrt(2 / (B + Math.sqrt(D)));
	        var nfast = Math.sqrt(2 / (B - Math.sqrt(D)));

	        // var phit= this.phi*180/Math.PI;

	        var n = 1;

	        switch (Type) {
	            case properties.PMTypes[0]:
	                n = nfast;
	                break;
	            case properties.PMTypes[1]:
	                n = nslow;
	                break;
	            case properties.PMTypes[2]:
	                if (photon === "pump") {
	                    n = nslow;
	                } else {
	                    n = nfast;
	                }
	                break;
	            case properties.PMTypes[3]:
	                if (photon === "idler") {
	                    n = nfast;
	                } else {
	                    n = nslow;
	                }
	                break;
	            case properties.PMTypes[4]:
	                if (photon === "signal") {
	                    n = nfast;
	                } else {
	                    n = nslow;
	                }
	                break;
	            default:
	                throw "Error: bad PMType specified";
	        }

	        return n;
	    },

	    update_all_angles: function update_all_angles() {
	        var props = this;
	        // console.log("old pump index", props.n_p);

	        props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
	        props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);

	        props.n_p = props.calc_Index_PMType(props.lambda_p, props.type, props.S_p, "pump");
	        props.n_s = props.calc_Index_PMType(props.lambda_s, props.type, props.S_s, "signal");
	        // console.log("new pump index", props.n_p);

	        props.optimum_idler();
	        // set the external idler angle
	        props.theta_i_e = PhaseMatch.find_external_angle(props, "idler");
	        // props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);
	        // props.n_i = props.calc_Index_PMType(props.lambda_i, props.type, props.S_i, "idler");
	        // console.log(props.n_s, props.n_s, props.n_i);
	        // props.calc_walkoff_angles();
	    },

	    get_group_velocity: function get_group_velocity(lambda, Type, S, photon) {
	        // var props = this;
	        var bw = 1e-11;
	        // var P = props.clone();

	        var n1 = this.calc_Index_PMType(lambda - bw, Type, S, photon);
	        var n2 = this.calc_Index_PMType(lambda + bw, Type, S, photon);

	        var dn = (n2 - n1) / (2 * bw);

	        var gv = con.c / (n1 - lambda * dn);

	        return gv;
	    },

	    auto_calc_Theta: function auto_calc_Theta() {
	        this.lambda_i = 1 / (1 / this.lambda_p - 1 / this.lambda_s);
	        var props = this;

	        var min_delK = function min_delK(x) {
	            if (x > Math.PI / 2 || x < 0) {
	                return 1e12;
	            }
	            props.theta = x;
	            props.theta_s = PhaseMatch.find_internal_angle(props, "signal");
	            props.update_all_angles(props);
	            var delK = PhaseMatch.calc_delK(props);
	            // Returning all 3 delK components can lead to errors in the search
	            // return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
	            return Math.sqrt(sq(delK[2]));
	        };

	        var guess = Math.PI / 6;
	        var startTime = new Date();
	        // var theta_s = props.theta_s;
	        // var theta_s_e = props.theta_s_e;
	        // props.theta_s_e = theta_s_e +0.01;
	        // PhaseMatch.find_internal_angle(props, "signal");
	        // props.theta_s = theta_s + 0.01;
	        var ans = nelderMead(min_delK, guess, 30);
	        // props.theta = ans;
	        // props.theta_s_e = theta_s_e;
	        // PhaseMatch.find_internal_angle(props, "signal");
	        // props.theta_s = theta_s;
	        // Run again wiht better initial conditions based on previous optimization
	        ans = nelderMead(min_delK, ans, 30);
	        var endTime = new Date();

	        var timeDiff = (endTime - startTime) / 1000;
	        // console.log("Theta autocalc = ", timeDiff, ans);
	        // props.theta = ans;
	        // console.log("After autocalc: ", props.theta_i * 180/Math.PI);
	        props.update_all_angles(props);

	        // props.calcfibercoupling = fiber;
	        // calculate the walkoff angle
	        this.calc_walkoff_angles();
	        // console.log("Walkoff:", this.walkoff_p*180/Math.PI);
	    },

	    calc_poling_period: function calc_poling_period() {
	        var props = this;
	        this.lambda_i = 1 / (1 / this.lambda_p - 1 / this.lambda_s);
	        props.poling_period = Math.pow(2, 30); // Set this to a large number
	        props.update_all_angles(props);
	        if (props.enable_pp) {
	            var P = props.clone();

	            var find_pp = function find_pp(x) {
	                // if (x<0){ return 1e12;}  // arbitrary large number
	                P.poling_period = x;
	                // Calculate the angle for the idler photon
	                P.optimum_idler();
	                var delK = PhaseMatch.calc_delK(P);
	                return Math.sqrt(sq(delK[2]));
	                // return Math.sqrt(sq(delK[2]) +sq(delK[0])+ sq(delK[1]));
	            };

	            var delK_guess = PhaseMatch.calc_delK(P)[2];
	            var guess = 2 * Math.PI / delK_guess;

	            if (guess < 0) {
	                P.poling_sign = -1;
	                guess = guess * -1;
	            } else {
	                P.poling_sign = 1;
	            }

	            //finds the minimum theta
	            var startTime = new Date();
	            nelderMead(find_pp, guess, 100);
	            var endTime = new Date();
	            //console.log("calculation time for periodic poling calc", endTime - startTime, props.poling_period);

	            props.poling_period = P.poling_period;
	            props.poling_sign = P.poling_sign;
	            props.calc_walkoff_angles();
	        }
	    },

	    auto_calc_collection_focus: function auto_calc_collection_focus() {
	        this.lambda_i = 1 / (1 / this.lambda_p - 1 / this.lambda_s);
	        var props = this;
	        props.update_all_angles();

	        var bw = 0.01,
	            ls_start = this.lambda_s - this.lambda_s * bw,
	            ls_stop = this.lambda_s + this.lambda_s * bw,
	            li_start = this.lambda_i - this.lambda_i * bw,
	            li_stop = this.lambda_i + this.lambda_i * bw,
	            dim = 10,
	            lambda_s = helpers.linspace(ls_start, ls_stop, dim),
	            lambda_i = helpers.linspace(li_start, li_stop, dim),
	            n = 20;

	        props.nslices = 10;

	        var max_coinc = function max_coinc(focus) {
	            if (focus > 0 || focus < -1 * this.L) {
	                return 1e12;
	            }

	            props.z0s = focus;
	            props.z0i = focus;
	            //PhaseMatch.calc_heralding_plot_focus_position_p = function calc_heralding_plot_focus_position_p(props, WsRange, ls_start, ls_stop, li_start, li_stop, n){
	            // var eff = [1];
	            // var eff = PhaseMatch.calc_heralding_plot_focus_position_p(props, [focus], ls_start, ls_stop, li_start, li_stop, n);
	            var JSI_coinc = PhaseMatch.calc_JSI_p(props, lambda_s, lambda_i, dim, 1);
	            var coinc = helpers.Sum(JSI_coinc);
	            // console.log(coinc, focus*1e6);
	            return 1 / (coinc + 1);
	        };

	        var guess = -this.L / 2;
	        var startTime = new Date();
	        // props.z0s = guess;
	        // props.z0i = guess;
	        var ans = nelderMead(max_coinc, guess, 10);

	        // Run again wiht better initial conditions based on previous optimization
	        ans = nelderMead(max_coinc, ans, 20);
	        var endTime = new Date();

	        var timeDiff = (endTime - startTime) / 1000;

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

	    optimum_idler: function optimum_idler() {
	        var P = this;

	        var delKpp = P.lambda_s / (P.poling_period * P.poling_sign);

	        P.phi_i = P.phi_s + Math.PI;

	        var arg = sq(P.n_s) + sq(P.n_p * P.lambda_s / P.lambda_p);
	        arg += -2 * P.n_s * P.n_p * (P.lambda_s / P.lambda_p) * Math.cos(P.theta_s) - 2 * P.n_p * P.lambda_s / P.lambda_p * delKpp;
	        arg += 2 * P.n_s * Math.cos(P.theta_s) * delKpp + sq(delKpp);
	        arg = Math.sqrt(arg);

	        var arg2 = P.n_s * Math.sin(P.theta_s) / arg;

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

	    optimum_signal: function optimum_signal() {
	        var P = this;

	        var delKpp = P.lambda_i / (P.poling_period * P.poling_sign);

	        var arg = sq(P.n_i) + sq(P.n_p * P.lambda_i / P.lambda_p);
	        arg += -2 * P.n_i * P.n_p * (P.lambda_i / P.lambda_p) * Math.cos(P.theta_i) - 2 * P.n_p * P.lambda_i / P.lambda_p * delKpp;
	        arg += 2 * P.n_i * Math.cos(P.theta_i) * delKpp + sq(delKpp);
	        arg = Math.sqrt(arg);

	        var arg2 = P.n_i * Math.sin(P.theta_i) / arg;

	        var theta_s = Math.asin(arg2);
	        // return theta_i;
	        P.theta_s = theta_s;
	        //Update the index of refraction for the idler
	        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
	        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
	    },

	    brute_force_theta_i: function brute_force_theta_i() {
	        var props = this;

	        var min_PM = function min_PM(x) {
	            if (x > Math.PI / 2 || x < 0) {
	                return 1e12;
	            }
	            props.theta_i = x;

	            props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);
	            props.n_i = props.calc_Index_PMType(props.lambda_i, props.type, props.S_i, "idler");

	            var PMtmp = PhaseMatch.phasematch_Int_Phase(props);
	            return 1 - PMtmp[0];
	        };

	        //Initial guess
	        props.optimum_idler();
	        var guess = props.theta_i;
	        // var startTime = new Date();

	        var ans = nelderMead(min_PM, guess, 25);
	    },

	    brute_force_theta_s: function brute_force_theta_s() {
	        var props = this;

	        var min_PM = function min_PM(x) {
	            if (x > Math.PI / 2 || x < 0) {
	                return 1e12;
	            }
	            props.theta_s = x;

	            props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);
	            props.n_s = props.calc_Index_PMType(props.lambda_s, props.type, props.S_s, "signal");

	            var PMtmp = PhaseMatch.phasematch_Int_Phase(props);
	            return 1 - PMtmp[0];
	        };

	        //Initial guess
	        props.optimum_signal();
	        var guess = props.theta_s;

	        var ans = nelderMead(min_PM, guess, 25);
	    },

	    set_apodization_L: function set_apodization_L() {
	        this.apodization_L = helpers.linspace(-this.L / 2, this.L / 2, this.apodization + 1);
	    },

	    set_apodization_coeff: function set_apodization_coeff() {
	        // var bw = this.apodization_FWHM /(2 * Math.sqrt(2*Math.log(2))); //convert from FWHM
	        var bw = this.apodization_FWHM / 2.3548;
	        var dim = this.apodization_L.length;
	        this.apodization_coeff = [];
	        var delL = Math.abs(this.apodization_L[0] - this.apodization_L[1]);
	        for (var i = 0; i < dim; i++) {
	            this.apodization_coeff[i] = Math.exp(-sq(this.apodization_L[i] / bw) / 2);
	        }

	        var total = helpers.Sum(this.apodization_coeff);

	        //normalize
	        // for (i=0; i<dim; i++){
	        //     this.apodization_coeff[i] = this.apodization_coeff[i]/total;
	        // }
	    },

	    get_rates_constant: function get_rates_constant() {
	        var bw_pump = 2 * Math.PI * con.c * (1 / (this.lambda_p - this.p_bw / 2) - 1 / (this.lambda_p + this.p_bw / 2)) * Math.sqrt(2) / (2 * Math.sqrt(Math.log(2)));
	        var N_num = Math.pow(2, 1.5) * Math.pow(this.deff, 2) * Math.pow(this.L, 2) * this.Pav;
	        var N_den = Math.pow(Math.PI, 0.5) * con.e0 * Math.pow(con.c, 3) * bw_pump;
	        var N = N_num / N_den;
	        console.log(N, N_num, Math.pow(this.deff, 2) * Math.pow(this.L, 2), this.L, this.Pav);
	        return N;
	    },

	    set_zint: function set_zint() {
	        var zslice = 100e-6 * Math.pow(this.L / 2500e-6, 0.5);

	        if (zslice < 100e-6) {
	            zslice = 100e-6;
	        }

	        if (zslice > 500e-6) {
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
	        var nslices = Math.round(this.L / zslice);
	        if (nslices < 4) {
	            nslices = 4;
	        }

	        // console.log(nslices);
	        //console.log("number slices");
	        // if (nslices>30){
	        //     nslices = 30;
	        // }
	        // nslices =nslices*1;
	        if (nslices % 2 !== 0) {
	            nslices += 1;
	        }
	        this.numzint = nslices;
	        // this.numzint = 10;

	        this.zweights = helpers.NintegrateWeights(this.numzint);
	        var n = this.numzint;
	        // var n = 3;
	        n = n + (3 - n % 3); //guarantee that n is divisible by 3
	        this.z2Dweights = helpers.Nintegrate2DWeights_3_8(n);
	        this.numz2Dint = n;
	        //console.log(nslices);
	    },

	    calc_walkoff_angles: function calc_walkoff_angles() {
	        // Calculate the pump walkoff angle
	        var P = this;
	        var ne_p = this.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");
	        var origin_theta = P.theta;

	        //calculate the derivative
	        var deltheta = 0.1 * Math.PI / 180;

	        var theta = P.theta - deltheta / 2;
	        this.S_p = this.calc_Coordinate_Transform(theta, this.phi, this.theta_s, this.theta_i);
	        var ne1_p = this.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

	        theta = theta + deltheta;
	        this.S_p = this.calc_Coordinate_Transform(theta, this.phi, this.theta_s, this.theta_i);
	        var ne2_p = this.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

	        //set back to original theta
	        theta = origin_theta;
	        this.S_p = this.calc_Coordinate_Transform(theta, this.phi, this.theta_s, this.theta_i);

	        this.walkoff_p = -1 / ne_p * (ne1_p - ne2_p) / deltheta;
	        // console.log("Walkoff:", this.walkoff_p*180/Math.PI);
	        // this.walkoff_p = 0;
	    },

	    swap_signal_idler: function swap_signal_idler() {
	        // Swap role of signal and idler. Useful for calculating Idler properties
	        // this.update_all_angles();
	        // @ToDO: Do not swap the role of the signal/idler waists. In the code the idler waist
	        // is always set to be 100 um and is never updated to be equal to the signal waist until
	        // the actual phasematching function is called. Therefore switching the waists will yield
	        // the wrong result here. Need to fix this if we ever decide to handle asymmetric coupling
	        // geometries where the signal and idler can have different waists.
	        var P = this,
	            tempLambda = P.lambda_s,
	            tempTheta = P.theta_s,
	            tempPhis = P.phi_s,
	            tempNs = P.n_s,
	            tempSs = P.S_s
	        // ,tempW_sx = P.W_sx
	        // ,tempW_sy = P.W_sy
	        ,
	            tempTheta_se = P.theta_s_e;

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
	        if (P.type === "Type 2:   e -> e + o") {
	            // console.log("switching");
	            P.type = "Type 2:   e -> o + e";
	        } else if (P.type === "Type 2:   e -> o + e") {
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
	    set: function set(name, val) {

	        var self = this;

	        if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {

	                for (var _iterator = Object.entries(name)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var _step$value = _slicedToArray(_step.value, 2);

	                    var n = _step$value[0];
	                    var _val = _step$value[1];

	                    self.set(n, _val);
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }

	            return this;
	        } else {

	            // set the value
	            if (name in spdcDefaults) {

	                if (name === 'type') {

	                    val = val;
	                } else if (name === 'crystal' && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) !== 'object') {

	                    val = Crystals(val);
	                    // this.calc_walkoff_angles();
	                }

	                if (name === 'poling_period') {
	                    if (val === 0 || isNaN(val)) {
	                        val = Math.pow(2, 30);
	                    }
	                }

	                if (name === 'apodization') {
	                    if (val < 31) {
	                        val = 31;
	                    }
	                    // val = 25;
	                }

	                // if (name === 'poling_period'){
	                //     if (isNaN(val)){
	                //         val = Math.pow(2,30);
	                //     }
	                // }

	                if (name === 'z0s') {
	                    // Match the idler waist position to that of the signal
	                    // this.z0s = val - this.L;
	                    this.z0i = val;
	                }

	                this[name] = val;

	                if (name === 'apodization' || name === 'apodization_FWHM' || name === 'L') {
	                    //} || name = 'calc_apodization')){
	                    if (isNaN(this["apodization"]) || isNaN(this["apodization_FWHM"]) || isNaN(this["L"])) {
	                        return;
	                    }
	                    this.set_apodization_L();
	                    this.set_apodization_coeff();
	                }

	                if (name === "L") {
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
	    get: function get(key) {

	        if (key) {

	            return key in spdcDefaults ? cloneDeep(this[key]) : undefined;
	        }

	        var vals = cloneDeep(pick(this, spdcDefaultKeys));
	        vals.crystal = vals.crystal.id;
	        return vals;
	    },

	    /**
	     * Create a clone of self
	     * @return {SPDCprop} The cloned properties object
	     */
	    clone: function clone() {

	        var clone = Object.create(SPDCprop.prototype);

	        assignWith(clone, this, cloneCallback);

	        return clone;
	    }
	};

		properties.SPDCprop = SPDCprop;

/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";

	__webpack_require__(336);

	__webpack_require__(425);

	__webpack_require__(156);

	if (global._babelPolyfill) {
	  throw new Error("only one instance of babel-polyfill is allowed");
	}
	global._babelPolyfill = true;

	var DEFINE_PROPERTY = "defineProperty";
	function define(O, key, value) {
	  O[key] || Object[DEFINE_PROPERTY](O, key, {
	    writable: true,
	    configurable: true,
	    value: value
	  });
	}

	define(String.prototype, "padLeft", "".padStart);
	define(String.prototype, "padRight", "".padEnd);

	"pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill".split(",").forEach(function (key) {
	  [][key] && define(Array, key, Function.call.bind([][key]));
	});
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(165);
	module.exports = __webpack_require__(25).RegExp.escape;

/***/ },
/* 157 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(5)
	  , isArray  = __webpack_require__(80)
	  , SPECIES  = __webpack_require__(6)('species');

	module.exports = function(original){
	  var C;
	  if(isArray(original)){
	    C = original.constructor;
	    // cross-realm fallback
	    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
	    if(isObject(C)){
	      C = C[SPECIES];
	      if(C === null)C = undefined;
	    }
	  } return C === undefined ? Array : C;
	};

/***/ },
/* 158 */
/***/ function(module, exports, __webpack_require__) {

	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
	var speciesConstructor = __webpack_require__(157);

	module.exports = function(original, length){
	  return new (speciesConstructor(original))(length);
	};

/***/ },
/* 159 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var anObject    = __webpack_require__(2)
	  , toPrimitive = __webpack_require__(24)
	  , NUMBER      = 'number';

	module.exports = function(hint){
	  if(hint !== 'string' && hint !== NUMBER && hint !== 'default')throw TypeError('Incorrect hint');
	  return toPrimitive(anObject(this), hint != NUMBER);
	};

/***/ },
/* 160 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(37)
	  , gOPS    = __webpack_require__(63)
	  , pIE     = __webpack_require__(51);
	module.exports = function(it){
	  var result     = getKeys(it)
	    , getSymbols = gOPS.f;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = pIE.f
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
	  } return result;
	};

/***/ },
/* 161 */
/***/ function(module, exports, __webpack_require__) {

	var getKeys   = __webpack_require__(37)
	  , toIObject = __webpack_require__(16);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 162 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var path      = __webpack_require__(163)
	  , invoke    = __webpack_require__(59)
	  , aFunction = __webpack_require__(12);
	module.exports = function(/* ...pargs */){
	  var fn     = aFunction(this)
	    , length = arguments.length
	    , pargs  = Array(length)
	    , i      = 0
	    , _      = path._
	    , holder = false;
	  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
	  return function(/* ...args */){
	    var that = this
	      , aLen = arguments.length
	      , j = 0, k = 0, args;
	    if(!holder && !aLen)return invoke(fn, pargs, that);
	    args = pargs.slice();
	    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
	    while(aLen > k)args.push(arguments[k++]);
	    return invoke(fn, args, that);
	  };
	};

/***/ },
/* 163 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(3);

/***/ },
/* 164 */
/***/ function(module, exports) {

	module.exports = function(regExp, replace){
	  var replacer = replace === Object(replace) ? function(part){
	    return replace[part];
	  } : replace;
	  return function(it){
	    return String(it).replace(regExp, replacer);
	  };
	};

/***/ },
/* 165 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/benjamingr/RexExp.escape
	var $export = __webpack_require__(1)
	  , $re     = __webpack_require__(164)(/[\\^$*+?.()|[\]{}]/g, '\\$&');

	$export($export.S, 'RegExp', {escape: function escape(it){ return $re(it); }});


/***/ },
/* 166 */
/***/ function(module, exports, __webpack_require__) {

	// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
	var $export = __webpack_require__(1);

	$export($export.P, 'Array', {copyWithin: __webpack_require__(108)});

	__webpack_require__(43)('copyWithin');

/***/ },
/* 167 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export = __webpack_require__(1)
	  , $every  = __webpack_require__(22)(4);

	$export($export.P + $export.F * !__webpack_require__(21)([].every, true), 'Array', {
	  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
	  every: function every(callbackfn /* , thisArg */){
	    return $every(this, callbackfn, arguments[1]);
	  }
	});

/***/ },
/* 168 */
/***/ function(module, exports, __webpack_require__) {

	// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
	var $export = __webpack_require__(1);

	$export($export.P, 'Array', {fill: __webpack_require__(72)});

	__webpack_require__(43)('fill');

/***/ },
/* 169 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export = __webpack_require__(1)
	  , $filter = __webpack_require__(22)(2);

	$export($export.P + $export.F * !__webpack_require__(21)([].filter, true), 'Array', {
	  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
	  filter: function filter(callbackfn /* , thisArg */){
	    return $filter(this, callbackfn, arguments[1]);
	  }
	});

/***/ },
/* 170 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
	var $export = __webpack_require__(1)
	  , $find   = __webpack_require__(22)(6)
	  , KEY     = 'findIndex'
	  , forced  = true;
	// Shouldn't skip holes
	if(KEY in [])Array(1)[KEY](function(){ forced = false; });
	$export($export.P + $export.F * forced, 'Array', {
	  findIndex: function findIndex(callbackfn/*, that = undefined */){
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	__webpack_require__(43)(KEY);

/***/ },
/* 171 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
	var $export = __webpack_require__(1)
	  , $find   = __webpack_require__(22)(5)
	  , KEY     = 'find'
	  , forced  = true;
	// Shouldn't skip holes
	if(KEY in [])Array(1)[KEY](function(){ forced = false; });
	$export($export.P + $export.F * forced, 'Array', {
	  find: function find(callbackfn/*, that = undefined */){
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	__webpack_require__(43)(KEY);

/***/ },
/* 172 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export  = __webpack_require__(1)
	  , $forEach = __webpack_require__(22)(0)
	  , STRICT   = __webpack_require__(21)([].forEach, true);

	$export($export.P + $export.F * !STRICT, 'Array', {
	  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
	  forEach: function forEach(callbackfn /* , thisArg */){
	    return $forEach(this, callbackfn, arguments[1]);
	  }
	});

/***/ },
/* 173 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ctx            = __webpack_require__(26)
	  , $export        = __webpack_require__(1)
	  , toObject       = __webpack_require__(10)
	  , call           = __webpack_require__(117)
	  , isArrayIter    = __webpack_require__(79)
	  , toLength       = __webpack_require__(9)
	  , createProperty = __webpack_require__(73)
	  , getIterFn      = __webpack_require__(96);

	$export($export.S + $export.F * !__webpack_require__(61)(function(iter){ Array.from(iter); }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = toObject(arrayLike)
	      , C       = typeof this == 'function' ? this : Array
	      , aLen    = arguments.length
	      , mapfn   = aLen > 1 ? arguments[1] : undefined
	      , mapping = mapfn !== undefined
	      , index   = 0
	      , iterFn  = getIterFn(O)
	      , length, result, step, iterator;
	    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
	      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
	        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
	      }
	    } else {
	      length = toLength(O.length);
	      for(result = new C(length); length > index; index++){
	        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});


/***/ },
/* 174 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export       = __webpack_require__(1)
	  , $indexOf      = __webpack_require__(55)(false)
	  , $native       = [].indexOf
	  , NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;

	$export($export.P + $export.F * (NEGATIVE_ZERO || !__webpack_require__(21)($native)), 'Array', {
	  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
	  indexOf: function indexOf(searchElement /*, fromIndex = 0 */){
	    return NEGATIVE_ZERO
	      // convert -0 to +0
	      ? $native.apply(this, arguments) || 0
	      : $indexOf(this, searchElement, arguments[1]);
	  }
	});

/***/ },
/* 175 */
/***/ function(module, exports, __webpack_require__) {

	// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
	var $export = __webpack_require__(1);

	$export($export.S, 'Array', {isArray: __webpack_require__(80)});

/***/ },
/* 176 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 22.1.3.13 Array.prototype.join(separator)
	var $export   = __webpack_require__(1)
	  , toIObject = __webpack_require__(16)
	  , arrayJoin = [].join;

	// fallback for not array-like strings
	$export($export.P + $export.F * (__webpack_require__(50) != Object || !__webpack_require__(21)(arrayJoin)), 'Array', {
	  join: function join(separator){
	    return arrayJoin.call(toIObject(this), separator === undefined ? ',' : separator);
	  }
	});

/***/ },
/* 177 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export       = __webpack_require__(1)
	  , toIObject     = __webpack_require__(16)
	  , toInteger     = __webpack_require__(32)
	  , toLength      = __webpack_require__(9)
	  , $native       = [].lastIndexOf
	  , NEGATIVE_ZERO = !!$native && 1 / [1].lastIndexOf(1, -0) < 0;

	$export($export.P + $export.F * (NEGATIVE_ZERO || !__webpack_require__(21)($native)), 'Array', {
	  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
	  lastIndexOf: function lastIndexOf(searchElement /*, fromIndex = @[*-1] */){
	    // convert -0 to +0
	    if(NEGATIVE_ZERO)return $native.apply(this, arguments) || 0;
	    var O      = toIObject(this)
	      , length = toLength(O.length)
	      , index  = length - 1;
	    if(arguments.length > 1)index = Math.min(index, toInteger(arguments[1]));
	    if(index < 0)index = length + index;
	    for(;index >= 0; index--)if(index in O)if(O[index] === searchElement)return index || 0;
	    return -1;
	  }
	});

/***/ },
/* 178 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export = __webpack_require__(1)
	  , $map    = __webpack_require__(22)(1);

	$export($export.P + $export.F * !__webpack_require__(21)([].map, true), 'Array', {
	  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
	  map: function map(callbackfn /* , thisArg */){
	    return $map(this, callbackfn, arguments[1]);
	  }
	});

/***/ },
/* 179 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export        = __webpack_require__(1)
	  , createProperty = __webpack_require__(73);

	// WebKit Array.of isn't generic
	$export($export.S + $export.F * __webpack_require__(4)(function(){
	  function F(){}
	  return !(Array.of.call(F) instanceof F);
	}), 'Array', {
	  // 22.1.2.3 Array.of( ...items)
	  of: function of(/* ...args */){
	    var index  = 0
	      , aLen   = arguments.length
	      , result = new (typeof this == 'function' ? this : Array)(aLen);
	    while(aLen > index)createProperty(result, index, arguments[index++]);
	    result.length = aLen;
	    return result;
	  }
	});

/***/ },
/* 180 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export = __webpack_require__(1)
	  , $reduce = __webpack_require__(110);

	$export($export.P + $export.F * !__webpack_require__(21)([].reduceRight, true), 'Array', {
	  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
	  reduceRight: function reduceRight(callbackfn /* , initialValue */){
	    return $reduce(this, callbackfn, arguments.length, arguments[1], true);
	  }
	});

/***/ },
/* 181 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export = __webpack_require__(1)
	  , $reduce = __webpack_require__(110);

	$export($export.P + $export.F * !__webpack_require__(21)([].reduce, true), 'Array', {
	  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
	  reduce: function reduce(callbackfn /* , initialValue */){
	    return $reduce(this, callbackfn, arguments.length, arguments[1], false);
	  }
	});

/***/ },
/* 182 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export    = __webpack_require__(1)
	  , html       = __webpack_require__(77)
	  , cof        = __webpack_require__(19)
	  , toIndex    = __webpack_require__(40)
	  , toLength   = __webpack_require__(9)
	  , arraySlice = [].slice;

	// fallback for not array-like ES3 strings and DOM objects
	$export($export.P + $export.F * __webpack_require__(4)(function(){
	  if(html)arraySlice.call(html);
	}), 'Array', {
	  slice: function slice(begin, end){
	    var len   = toLength(this.length)
	      , klass = cof(this);
	    end = end === undefined ? len : end;
	    if(klass == 'Array')return arraySlice.call(this, begin, end);
	    var start  = toIndex(begin, len)
	      , upTo   = toIndex(end, len)
	      , size   = toLength(upTo - start)
	      , cloned = Array(size)
	      , i      = 0;
	    for(; i < size; i++)cloned[i] = klass == 'String'
	      ? this.charAt(start + i)
	      : this[start + i];
	    return cloned;
	  }
	});

/***/ },
/* 183 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export = __webpack_require__(1)
	  , $some   = __webpack_require__(22)(3);

	$export($export.P + $export.F * !__webpack_require__(21)([].some, true), 'Array', {
	  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
	  some: function some(callbackfn /* , thisArg */){
	    return $some(this, callbackfn, arguments[1]);
	  }
	});

/***/ },
/* 184 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export   = __webpack_require__(1)
	  , aFunction = __webpack_require__(12)
	  , toObject  = __webpack_require__(10)
	  , fails     = __webpack_require__(4)
	  , $sort     = [].sort
	  , test      = [1, 2, 3];

	$export($export.P + $export.F * (fails(function(){
	  // IE8-
	  test.sort(undefined);
	}) || !fails(function(){
	  // V8 bug
	  test.sort(null);
	  // Old WebKit
	}) || !__webpack_require__(21)($sort)), 'Array', {
	  // 22.1.3.25 Array.prototype.sort(comparefn)
	  sort: function sort(comparefn){
	    return comparefn === undefined
	      ? $sort.call(toObject(this))
	      : $sort.call(toObject(this), aFunction(comparefn));
	  }
	});

/***/ },
/* 185 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(39)('Array');

/***/ },
/* 186 */
/***/ function(module, exports, __webpack_require__) {

	// 20.3.3.1 / 15.9.4.4 Date.now()
	var $export = __webpack_require__(1);

	$export($export.S, 'Date', {now: function(){ return new Date().getTime(); }});

/***/ },
/* 187 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
	var $export = __webpack_require__(1)
	  , fails   = __webpack_require__(4)
	  , getTime = Date.prototype.getTime;

	var lz = function(num){
	  return num > 9 ? num : '0' + num;
	};

	// PhantomJS / old WebKit has a broken implementations
	$export($export.P + $export.F * (fails(function(){
	  return new Date(-5e13 - 1).toISOString() != '0385-07-25T07:06:39.999Z';
	}) || !fails(function(){
	  new Date(NaN).toISOString();
	})), 'Date', {
	  toISOString: function toISOString(){
	    if(!isFinite(getTime.call(this)))throw RangeError('Invalid time value');
	    var d = this
	      , y = d.getUTCFullYear()
	      , m = d.getUTCMilliseconds()
	      , s = y < 0 ? '-' : y > 9999 ? '+' : '';
	    return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
	      '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
	      'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
	      ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
	  }
	});

/***/ },
/* 188 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export     = __webpack_require__(1)
	  , toObject    = __webpack_require__(10)
	  , toPrimitive = __webpack_require__(24);

	$export($export.P + $export.F * __webpack_require__(4)(function(){
	  return new Date(NaN).toJSON() !== null || Date.prototype.toJSON.call({toISOString: function(){ return 1; }}) !== 1;
	}), 'Date', {
	  toJSON: function toJSON(key){
	    var O  = toObject(this)
	      , pv = toPrimitive(O);
	    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
	  }
	});

/***/ },
/* 189 */
/***/ function(module, exports, __webpack_require__) {

	var TO_PRIMITIVE = __webpack_require__(6)('toPrimitive')
	  , proto        = Date.prototype;

	if(!(TO_PRIMITIVE in proto))__webpack_require__(13)(proto, TO_PRIMITIVE, __webpack_require__(159));

/***/ },
/* 190 */
/***/ function(module, exports, __webpack_require__) {

	var DateProto    = Date.prototype
	  , INVALID_DATE = 'Invalid Date'
	  , TO_STRING    = 'toString'
	  , $toString    = DateProto[TO_STRING]
	  , getTime      = DateProto.getTime;
	if(new Date(NaN) + '' != INVALID_DATE){
	  __webpack_require__(14)(DateProto, TO_STRING, function toString(){
	    var value = getTime.call(this);
	    return value === value ? $toString.call(this) : INVALID_DATE;
	  });
	}

/***/ },
/* 191 */
/***/ function(module, exports, __webpack_require__) {

	// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
	var $export = __webpack_require__(1);

	$export($export.P, 'Function', {bind: __webpack_require__(111)});

/***/ },
/* 192 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var isObject       = __webpack_require__(5)
	  , getPrototypeOf = __webpack_require__(18)
	  , HAS_INSTANCE   = __webpack_require__(6)('hasInstance')
	  , FunctionProto  = Function.prototype;
	// 19.2.3.6 Function.prototype[@@hasInstance](V)
	if(!(HAS_INSTANCE in FunctionProto))__webpack_require__(8).f(FunctionProto, HAS_INSTANCE, {value: function(O){
	  if(typeof this != 'function' || !isObject(O))return false;
	  if(!isObject(this.prototype))return O instanceof this;
	  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
	  while(O = getPrototypeOf(O))if(this.prototype === O)return true;
	  return false;
	}});

/***/ },
/* 193 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(8).f
	  , createDesc = __webpack_require__(31)
	  , has        = __webpack_require__(11)
	  , FProto     = Function.prototype
	  , nameRE     = /^\s*function ([^ (]*)/
	  , NAME       = 'name';

	var isExtensible = Object.isExtensible || function(){
	  return true;
	};

	// 19.2.4.2 name
	NAME in FProto || __webpack_require__(7) && dP(FProto, NAME, {
	  configurable: true,
	  get: function(){
	    try {
	      var that = this
	        , name = ('' + that).match(nameRE)[1];
	      has(that, NAME) || !isExtensible(that) || dP(that, NAME, createDesc(5, name));
	      return name;
	    } catch(e){
	      return '';
	    }
	  }
	});

/***/ },
/* 194 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.3 Math.acosh(x)
	var $export = __webpack_require__(1)
	  , log1p   = __webpack_require__(119)
	  , sqrt    = Math.sqrt
	  , $acosh  = Math.acosh;

	$export($export.S + $export.F * !($acosh
	  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
	  && Math.floor($acosh(Number.MAX_VALUE)) == 710
	  // Tor Browser bug: Math.acosh(Infinity) -> NaN 
	  && $acosh(Infinity) == Infinity
	), 'Math', {
	  acosh: function acosh(x){
	    return (x = +x) < 1 ? NaN : x > 94906265.62425156
	      ? Math.log(x) + Math.LN2
	      : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
	  }
	});

/***/ },
/* 195 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.5 Math.asinh(x)
	var $export = __webpack_require__(1)
	  , $asinh  = Math.asinh;

	function asinh(x){
	  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
	}

	// Tor Browser bug: Math.asinh(0) -> -0 
	$export($export.S + $export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', {asinh: asinh});

/***/ },
/* 196 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.7 Math.atanh(x)
	var $export = __webpack_require__(1)
	  , $atanh  = Math.atanh;

	// Tor Browser bug: Math.atanh(-0) -> 0 
	$export($export.S + $export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
	  atanh: function atanh(x){
	    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
	  }
	});

/***/ },
/* 197 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.9 Math.cbrt(x)
	var $export = __webpack_require__(1)
	  , sign    = __webpack_require__(84);

	$export($export.S, 'Math', {
	  cbrt: function cbrt(x){
	    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
	  }
	});

/***/ },
/* 198 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.11 Math.clz32(x)
	var $export = __webpack_require__(1);

	$export($export.S, 'Math', {
	  clz32: function clz32(x){
	    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
	  }
	});

/***/ },
/* 199 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.12 Math.cosh(x)
	var $export = __webpack_require__(1)
	  , exp     = Math.exp;

	$export($export.S, 'Math', {
	  cosh: function cosh(x){
	    return (exp(x = +x) + exp(-x)) / 2;
	  }
	});

/***/ },
/* 200 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.14 Math.expm1(x)
	var $export = __webpack_require__(1)
	  , $expm1  = __webpack_require__(83);

	$export($export.S + $export.F * ($expm1 != Math.expm1), 'Math', {expm1: $expm1});

/***/ },
/* 201 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.16 Math.fround(x)
	var $export   = __webpack_require__(1)
	  , sign      = __webpack_require__(84)
	  , pow       = Math.pow
	  , EPSILON   = pow(2, -52)
	  , EPSILON32 = pow(2, -23)
	  , MAX32     = pow(2, 127) * (2 - EPSILON32)
	  , MIN32     = pow(2, -126);

	var roundTiesToEven = function(n){
	  return n + 1 / EPSILON - 1 / EPSILON;
	};


	$export($export.S, 'Math', {
	  fround: function fround(x){
	    var $abs  = Math.abs(x)
	      , $sign = sign(x)
	      , a, result;
	    if($abs < MIN32)return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
	    a = (1 + EPSILON32 / EPSILON) * $abs;
	    result = a - (a - $abs);
	    if(result > MAX32 || result != result)return $sign * Infinity;
	    return $sign * result;
	  }
	});

/***/ },
/* 202 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
	var $export = __webpack_require__(1)
	  , abs     = Math.abs;

	$export($export.S, 'Math', {
	  hypot: function hypot(value1, value2){ // eslint-disable-line no-unused-vars
	    var sum  = 0
	      , i    = 0
	      , aLen = arguments.length
	      , larg = 0
	      , arg, div;
	    while(i < aLen){
	      arg = abs(arguments[i++]);
	      if(larg < arg){
	        div  = larg / arg;
	        sum  = sum * div * div + 1;
	        larg = arg;
	      } else if(arg > 0){
	        div  = arg / larg;
	        sum += div * div;
	      } else sum += arg;
	    }
	    return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
	  }
	});

/***/ },
/* 203 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.18 Math.imul(x, y)
	var $export = __webpack_require__(1)
	  , $imul   = Math.imul;

	// some WebKit versions fails with big numbers, some has wrong arity
	$export($export.S + $export.F * __webpack_require__(4)(function(){
	  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
	}), 'Math', {
	  imul: function imul(x, y){
	    var UINT16 = 0xffff
	      , xn = +x
	      , yn = +y
	      , xl = UINT16 & xn
	      , yl = UINT16 & yn;
	    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
	  }
	});

/***/ },
/* 204 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.21 Math.log10(x)
	var $export = __webpack_require__(1);

	$export($export.S, 'Math', {
	  log10: function log10(x){
	    return Math.log(x) / Math.LN10;
	  }
	});

/***/ },
/* 205 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.20 Math.log1p(x)
	var $export = __webpack_require__(1);

	$export($export.S, 'Math', {log1p: __webpack_require__(119)});

/***/ },
/* 206 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.22 Math.log2(x)
	var $export = __webpack_require__(1);

	$export($export.S, 'Math', {
	  log2: function log2(x){
	    return Math.log(x) / Math.LN2;
	  }
	});

/***/ },
/* 207 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.28 Math.sign(x)
	var $export = __webpack_require__(1);

	$export($export.S, 'Math', {sign: __webpack_require__(84)});

/***/ },
/* 208 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.30 Math.sinh(x)
	var $export = __webpack_require__(1)
	  , expm1   = __webpack_require__(83)
	  , exp     = Math.exp;

	// V8 near Chromium 38 has a problem with very small numbers
	$export($export.S + $export.F * __webpack_require__(4)(function(){
	  return !Math.sinh(-2e-17) != -2e-17;
	}), 'Math', {
	  sinh: function sinh(x){
	    return Math.abs(x = +x) < 1
	      ? (expm1(x) - expm1(-x)) / 2
	      : (exp(x - 1) - exp(-x - 1)) * (Math.E / 2);
	  }
	});

/***/ },
/* 209 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.33 Math.tanh(x)
	var $export = __webpack_require__(1)
	  , expm1   = __webpack_require__(83)
	  , exp     = Math.exp;

	$export($export.S, 'Math', {
	  tanh: function tanh(x){
	    var a = expm1(x = +x)
	      , b = expm1(-x);
	    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
	  }
	});

/***/ },
/* 210 */
/***/ function(module, exports, __webpack_require__) {

	// 20.2.2.34 Math.trunc(x)
	var $export = __webpack_require__(1);

	$export($export.S, 'Math', {
	  trunc: function trunc(it){
	    return (it > 0 ? Math.floor : Math.ceil)(it);
	  }
	});

/***/ },
/* 211 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global            = __webpack_require__(3)
	  , has               = __webpack_require__(11)
	  , cof               = __webpack_require__(19)
	  , inheritIfRequired = __webpack_require__(78)
	  , toPrimitive       = __webpack_require__(24)
	  , fails             = __webpack_require__(4)
	  , gOPN              = __webpack_require__(36).f
	  , gOPD              = __webpack_require__(17).f
	  , dP                = __webpack_require__(8).f
	  , $trim             = __webpack_require__(47).trim
	  , NUMBER            = 'Number'
	  , $Number           = global[NUMBER]
	  , Base              = $Number
	  , proto             = $Number.prototype
	  // Opera ~12 has broken Object#toString
	  , BROKEN_COF        = cof(__webpack_require__(35)(proto)) == NUMBER
	  , TRIM              = 'trim' in String.prototype;

	// 7.1.3 ToNumber(argument)
	var toNumber = function(argument){
	  var it = toPrimitive(argument, false);
	  if(typeof it == 'string' && it.length > 2){
	    it = TRIM ? it.trim() : $trim(it, 3);
	    var first = it.charCodeAt(0)
	      , third, radix, maxCode;
	    if(first === 43 || first === 45){
	      third = it.charCodeAt(2);
	      if(third === 88 || third === 120)return NaN; // Number('+0x1') should be NaN, old V8 fix
	    } else if(first === 48){
	      switch(it.charCodeAt(1)){
	        case 66 : case 98  : radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
	        case 79 : case 111 : radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
	        default : return +it;
	      }
	      for(var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++){
	        code = digits.charCodeAt(i);
	        // parseInt parses a string to a first unavailable symbol
	        // but ToNumber should return NaN if a string contains unavailable symbols
	        if(code < 48 || code > maxCode)return NaN;
	      } return parseInt(digits, radix);
	    }
	  } return +it;
	};

	if(!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')){
	  $Number = function Number(value){
	    var it = arguments.length < 1 ? 0 : value
	      , that = this;
	    return that instanceof $Number
	      // check on 1..constructor(foo) case
	      && (BROKEN_COF ? fails(function(){ proto.valueOf.call(that); }) : cof(that) != NUMBER)
	        ? inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
	  };
	  for(var keys = __webpack_require__(7) ? gOPN(Base) : (
	    // ES3:
	    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	    // ES6 (in case, if modules with ES6 Number statics required before):
	    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
	    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
	  ).split(','), j = 0, key; keys.length > j; j++){
	    if(has(Base, key = keys[j]) && !has($Number, key)){
	      dP($Number, key, gOPD(Base, key));
	    }
	  }
	  $Number.prototype = proto;
	  proto.constructor = $Number;
	  __webpack_require__(14)(global, NUMBER, $Number);
	}

/***/ },
/* 212 */
/***/ function(module, exports, __webpack_require__) {

	// 20.1.2.1 Number.EPSILON
	var $export = __webpack_require__(1);

	$export($export.S, 'Number', {EPSILON: Math.pow(2, -52)});

/***/ },
/* 213 */
/***/ function(module, exports, __webpack_require__) {

	// 20.1.2.2 Number.isFinite(number)
	var $export   = __webpack_require__(1)
	  , _isFinite = __webpack_require__(3).isFinite;

	$export($export.S, 'Number', {
	  isFinite: function isFinite(it){
	    return typeof it == 'number' && _isFinite(it);
	  }
	});

/***/ },
/* 214 */
/***/ function(module, exports, __webpack_require__) {

	// 20.1.2.3 Number.isInteger(number)
	var $export = __webpack_require__(1);

	$export($export.S, 'Number', {isInteger: __webpack_require__(116)});

/***/ },
/* 215 */
/***/ function(module, exports, __webpack_require__) {

	// 20.1.2.4 Number.isNaN(number)
	var $export = __webpack_require__(1);

	$export($export.S, 'Number', {
	  isNaN: function isNaN(number){
	    return number != number;
	  }
	});

/***/ },
/* 216 */
/***/ function(module, exports, __webpack_require__) {

	// 20.1.2.5 Number.isSafeInteger(number)
	var $export   = __webpack_require__(1)
	  , isInteger = __webpack_require__(116)
	  , abs       = Math.abs;

	$export($export.S, 'Number', {
	  isSafeInteger: function isSafeInteger(number){
	    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
	  }
	});

/***/ },
/* 217 */
/***/ function(module, exports, __webpack_require__) {

	// 20.1.2.6 Number.MAX_SAFE_INTEGER
	var $export = __webpack_require__(1);

	$export($export.S, 'Number', {MAX_SAFE_INTEGER: 0x1fffffffffffff});

/***/ },
/* 218 */
/***/ function(module, exports, __webpack_require__) {

	// 20.1.2.10 Number.MIN_SAFE_INTEGER
	var $export = __webpack_require__(1);

	$export($export.S, 'Number', {MIN_SAFE_INTEGER: -0x1fffffffffffff});

/***/ },
/* 219 */
/***/ function(module, exports, __webpack_require__) {

	var $export     = __webpack_require__(1)
	  , $parseFloat = __webpack_require__(126);
	// 20.1.2.12 Number.parseFloat(string)
	$export($export.S + $export.F * (Number.parseFloat != $parseFloat), 'Number', {parseFloat: $parseFloat});

/***/ },
/* 220 */
/***/ function(module, exports, __webpack_require__) {

	var $export   = __webpack_require__(1)
	  , $parseInt = __webpack_require__(127);
	// 20.1.2.13 Number.parseInt(string, radix)
	$export($export.S + $export.F * (Number.parseInt != $parseInt), 'Number', {parseInt: $parseInt});

/***/ },
/* 221 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export      = __webpack_require__(1)
	  , toInteger    = __webpack_require__(32)
	  , aNumberValue = __webpack_require__(107)
	  , repeat       = __webpack_require__(91)
	  , $toFixed     = 1..toFixed
	  , floor        = Math.floor
	  , data         = [0, 0, 0, 0, 0, 0]
	  , ERROR        = 'Number.toFixed: incorrect invocation!'
	  , ZERO         = '0';

	var multiply = function(n, c){
	  var i  = -1
	    , c2 = c;
	  while(++i < 6){
	    c2 += n * data[i];
	    data[i] = c2 % 1e7;
	    c2 = floor(c2 / 1e7);
	  }
	};
	var divide = function(n){
	  var i = 6
	    , c = 0;
	  while(--i >= 0){
	    c += data[i];
	    data[i] = floor(c / n);
	    c = (c % n) * 1e7;
	  }
	};
	var numToString = function(){
	  var i = 6
	    , s = '';
	  while(--i >= 0){
	    if(s !== '' || i === 0 || data[i] !== 0){
	      var t = String(data[i]);
	      s = s === '' ? t : s + repeat.call(ZERO, 7 - t.length) + t;
	    }
	  } return s;
	};
	var pow = function(x, n, acc){
	  return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
	};
	var log = function(x){
	  var n  = 0
	    , x2 = x;
	  while(x2 >= 4096){
	    n += 12;
	    x2 /= 4096;
	  }
	  while(x2 >= 2){
	    n  += 1;
	    x2 /= 2;
	  } return n;
	};

	$export($export.P + $export.F * (!!$toFixed && (
	  0.00008.toFixed(3) !== '0.000' ||
	  0.9.toFixed(0) !== '1' ||
	  1.255.toFixed(2) !== '1.25' ||
	  1000000000000000128..toFixed(0) !== '1000000000000000128'
	) || !__webpack_require__(4)(function(){
	  // V8 ~ Android 4.3-
	  $toFixed.call({});
	})), 'Number', {
	  toFixed: function toFixed(fractionDigits){
	    var x = aNumberValue(this, ERROR)
	      , f = toInteger(fractionDigits)
	      , s = ''
	      , m = ZERO
	      , e, z, j, k;
	    if(f < 0 || f > 20)throw RangeError(ERROR);
	    if(x != x)return 'NaN';
	    if(x <= -1e21 || x >= 1e21)return String(x);
	    if(x < 0){
	      s = '-';
	      x = -x;
	    }
	    if(x > 1e-21){
	      e = log(x * pow(2, 69, 1)) - 69;
	      z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
	      z *= 0x10000000000000;
	      e = 52 - e;
	      if(e > 0){
	        multiply(0, z);
	        j = f;
	        while(j >= 7){
	          multiply(1e7, 0);
	          j -= 7;
	        }
	        multiply(pow(10, j, 1), 0);
	        j = e - 1;
	        while(j >= 23){
	          divide(1 << 23);
	          j -= 23;
	        }
	        divide(1 << j);
	        multiply(1, 1);
	        divide(2);
	        m = numToString();
	      } else {
	        multiply(0, z);
	        multiply(1 << -e, 0);
	        m = numToString() + repeat.call(ZERO, f);
	      }
	    }
	    if(f > 0){
	      k = m.length;
	      m = s + (k <= f ? '0.' + repeat.call(ZERO, f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
	    } else {
	      m = s + m;
	    } return m;
	  }
	});

/***/ },
/* 222 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export      = __webpack_require__(1)
	  , $fails       = __webpack_require__(4)
	  , aNumberValue = __webpack_require__(107)
	  , $toPrecision = 1..toPrecision;

	$export($export.P + $export.F * ($fails(function(){
	  // IE7-
	  return $toPrecision.call(1, undefined) !== '1';
	}) || !$fails(function(){
	  // V8 ~ Android 4.3-
	  $toPrecision.call({});
	})), 'Number', {
	  toPrecision: function toPrecision(precision){
	    var that = aNumberValue(this, 'Number#toPrecision: incorrect invocation!');
	    return precision === undefined ? $toPrecision.call(that) : $toPrecision.call(that, precision); 
	  }
	});

/***/ },
/* 223 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(1);

	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(120)});

/***/ },
/* 224 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(1)
	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	$export($export.S, 'Object', {create: __webpack_require__(35)});

/***/ },
/* 225 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(1);
	// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
	$export($export.S + $export.F * !__webpack_require__(7), 'Object', {defineProperties: __webpack_require__(121)});

/***/ },
/* 226 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(1);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(7), 'Object', {defineProperty: __webpack_require__(8).f});

/***/ },
/* 227 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.5 Object.freeze(O)
	var isObject = __webpack_require__(5)
	  , meta     = __webpack_require__(30).onFreeze;

	__webpack_require__(23)('freeze', function($freeze){
	  return function freeze(it){
	    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
	  };
	});

/***/ },
/* 228 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	var toIObject                 = __webpack_require__(16)
	  , $getOwnPropertyDescriptor = __webpack_require__(17).f;

	__webpack_require__(23)('getOwnPropertyDescriptor', function(){
	  return function getOwnPropertyDescriptor(it, key){
	    return $getOwnPropertyDescriptor(toIObject(it), key);
	  };
	});

/***/ },
/* 229 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 Object.getOwnPropertyNames(O)
	__webpack_require__(23)('getOwnPropertyNames', function(){
	  return __webpack_require__(122).f;
	});

/***/ },
/* 230 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 Object.getPrototypeOf(O)
	var toObject        = __webpack_require__(10)
	  , $getPrototypeOf = __webpack_require__(18);

	__webpack_require__(23)('getPrototypeOf', function(){
	  return function getPrototypeOf(it){
	    return $getPrototypeOf(toObject(it));
	  };
	});

/***/ },
/* 231 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.11 Object.isExtensible(O)
	var isObject = __webpack_require__(5);

	__webpack_require__(23)('isExtensible', function($isExtensible){
	  return function isExtensible(it){
	    return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
	  };
	});

/***/ },
/* 232 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.12 Object.isFrozen(O)
	var isObject = __webpack_require__(5);

	__webpack_require__(23)('isFrozen', function($isFrozen){
	  return function isFrozen(it){
	    return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
	  };
	});

/***/ },
/* 233 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.13 Object.isSealed(O)
	var isObject = __webpack_require__(5);

	__webpack_require__(23)('isSealed', function($isSealed){
	  return function isSealed(it){
	    return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
	  };
	});

/***/ },
/* 234 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.10 Object.is(value1, value2)
	var $export = __webpack_require__(1);
	$export($export.S, 'Object', {is: __webpack_require__(128)});

/***/ },
/* 235 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(10)
	  , $keys    = __webpack_require__(37);

	__webpack_require__(23)('keys', function(){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 236 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.15 Object.preventExtensions(O)
	var isObject = __webpack_require__(5)
	  , meta     = __webpack_require__(30).onFreeze;

	__webpack_require__(23)('preventExtensions', function($preventExtensions){
	  return function preventExtensions(it){
	    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
	  };
	});

/***/ },
/* 237 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.17 Object.seal(O)
	var isObject = __webpack_require__(5)
	  , meta     = __webpack_require__(30).onFreeze;

	__webpack_require__(23)('seal', function($seal){
	  return function seal(it){
	    return $seal && isObject(it) ? $seal(meta(it)) : it;
	  };
	});

/***/ },
/* 238 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $export = __webpack_require__(1);
	$export($export.S, 'Object', {setPrototypeOf: __webpack_require__(86).set});

/***/ },
/* 239 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.3.6 Object.prototype.toString()
	var classof = __webpack_require__(49)
	  , test    = {};
	test[__webpack_require__(6)('toStringTag')] = 'z';
	if(test + '' != '[object z]'){
	  __webpack_require__(14)(Object.prototype, 'toString', function toString(){
	    return '[object ' + classof(this) + ']';
	  }, true);
	}

/***/ },
/* 240 */
/***/ function(module, exports, __webpack_require__) {

	var $export     = __webpack_require__(1)
	  , $parseFloat = __webpack_require__(126);
	// 18.2.4 parseFloat(string)
	$export($export.G + $export.F * (parseFloat != $parseFloat), {parseFloat: $parseFloat});

/***/ },
/* 241 */
/***/ function(module, exports, __webpack_require__) {

	var $export   = __webpack_require__(1)
	  , $parseInt = __webpack_require__(127);
	// 18.2.5 parseInt(string, radix)
	$export($export.G + $export.F * (parseInt != $parseInt), {parseInt: $parseInt});

/***/ },
/* 242 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY            = __webpack_require__(34)
	  , global             = __webpack_require__(3)
	  , ctx                = __webpack_require__(26)
	  , classof            = __webpack_require__(49)
	  , $export            = __webpack_require__(1)
	  , isObject           = __webpack_require__(5)
	  , aFunction          = __webpack_require__(12)
	  , anInstance         = __webpack_require__(33)
	  , forOf              = __webpack_require__(44)
	  , speciesConstructor = __webpack_require__(88)
	  , task               = __webpack_require__(93).set
	  , microtask          = __webpack_require__(85)()
	  , PROMISE            = 'Promise'
	  , TypeError          = global.TypeError
	  , process            = global.process
	  , $Promise           = global[PROMISE]
	  , process            = global.process
	  , isNode             = classof(process) == 'process'
	  , empty              = function(){ /* empty */ }
	  , Internal, GenericPromiseCapability, Wrapper;

	var USE_NATIVE = !!function(){
	  try {
	    // correct subclassing with @@species support
	    var promise     = $Promise.resolve(1)
	      , FakePromise = (promise.constructor = {})[__webpack_require__(6)('species')] = function(exec){ exec(empty, empty); };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
	  } catch(e){ /* empty */ }
	}();

	// helpers
	var sameConstructor = function(a, b){
	  // with library wrapper special case
	  return a === b || a === $Promise && b === Wrapper;
	};
	var isThenable = function(it){
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var newPromiseCapability = function(C){
	  return sameConstructor($Promise, C)
	    ? new PromiseCapability(C)
	    : new GenericPromiseCapability(C);
	};
	var PromiseCapability = GenericPromiseCapability = function(C){
	  var resolve, reject;
	  this.promise = new C(function($$resolve, $$reject){
	    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject  = $$reject;
	  });
	  this.resolve = aFunction(resolve);
	  this.reject  = aFunction(reject);
	};
	var perform = function(exec){
	  try {
	    exec();
	  } catch(e){
	    return {error: e};
	  }
	};
	var notify = function(promise, isReject){
	  if(promise._n)return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function(){
	    var value = promise._v
	      , ok    = promise._s == 1
	      , i     = 0;
	    var run = function(reaction){
	      var handler = ok ? reaction.ok : reaction.fail
	        , resolve = reaction.resolve
	        , reject  = reaction.reject
	        , domain  = reaction.domain
	        , result, then;
	      try {
	        if(handler){
	          if(!ok){
	            if(promise._h == 2)onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if(handler === true)result = value;
	          else {
	            if(domain)domain.enter();
	            result = handler(value);
	            if(domain)domain.exit();
	          }
	          if(result === reaction.promise){
	            reject(TypeError('Promise-chain cycle'));
	          } else if(then = isThenable(result)){
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch(e){
	        reject(e);
	      }
	    };
	    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if(isReject && !promise._h)onUnhandled(promise);
	  });
	};
	var onUnhandled = function(promise){
	  task.call(global, function(){
	    var value = promise._v
	      , abrupt, handler, console;
	    if(isUnhandled(promise)){
	      abrupt = perform(function(){
	        if(isNode){
	          process.emit('unhandledRejection', value, promise);
	        } else if(handler = global.onunhandledrejection){
	          handler({promise: promise, reason: value});
	        } else if((console = global.console) && console.error){
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if(abrupt)throw abrupt.error;
	  });
	};
	var isUnhandled = function(promise){
	  if(promise._h == 1)return false;
	  var chain = promise._a || promise._c
	    , i     = 0
	    , reaction;
	  while(chain.length > i){
	    reaction = chain[i++];
	    if(reaction.fail || !isUnhandled(reaction.promise))return false;
	  } return true;
	};
	var onHandleUnhandled = function(promise){
	  task.call(global, function(){
	    var handler;
	    if(isNode){
	      process.emit('rejectionHandled', promise);
	    } else if(handler = global.onrejectionhandled){
	      handler({promise: promise, reason: promise._v});
	    }
	  });
	};
	var $reject = function(value){
	  var promise = this;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if(!promise._a)promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function(value){
	  var promise = this
	    , then;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if(promise === value)throw TypeError("Promise can't be resolved itself");
	    if(then = isThenable(value)){
	      microtask(function(){
	        var wrapper = {_w: promise, _d: false}; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch(e){
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch(e){
	    $reject.call({_w: promise, _d: false}, e); // wrap
	  }
	};

	// constructor polyfill
	if(!USE_NATIVE){
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor){
	    anInstance(this, $Promise, PROMISE, '_h');
	    aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
	    } catch(err){
	      $reject.call(this, err);
	    }
	  };
	  Internal = function Promise(executor){
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = __webpack_require__(38)($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected){
	      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
	      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail   = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode ? process.domain : undefined;
	      this._c.push(reaction);
	      if(this._a)this._a.push(reaction);
	      if(this._s)notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	  PromiseCapability = function(){
	    var promise  = new Internal;
	    this.promise = promise;
	    this.resolve = ctx($resolve, promise, 1);
	    this.reject  = ctx($reject, promise, 1);
	  };
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
	__webpack_require__(46)($Promise, PROMISE);
	__webpack_require__(39)(PROMISE);
	Wrapper = __webpack_require__(25)[PROMISE];

	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r){
	    var capability = newPromiseCapability(this)
	      , $$reject   = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x){
	    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
	    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
	    var capability = newPromiseCapability(this)
	      , $$resolve  = capability.resolve;
	    $$resolve(x);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(61)(function(iter){
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , resolve    = capability.resolve
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      var values    = []
	        , index     = 0
	        , remaining = 1;
	      forOf(iterable, false, function(promise){
	        var $index        = index++
	          , alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function(value){
	          if(alreadyCalled)return;
	          alreadyCalled  = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  }
	});

/***/ },
/* 243 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
	var $export   = __webpack_require__(1)
	  , aFunction = __webpack_require__(12)
	  , anObject  = __webpack_require__(2)
	  , rApply    = (__webpack_require__(3).Reflect || {}).apply
	  , fApply    = Function.apply;
	// MS Edge argumentsList argument is optional
	$export($export.S + $export.F * !__webpack_require__(4)(function(){
	  rApply(function(){});
	}), 'Reflect', {
	  apply: function apply(target, thisArgument, argumentsList){
	    var T = aFunction(target)
	      , L = anObject(argumentsList);
	    return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
	  }
	});

/***/ },
/* 244 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
	var $export    = __webpack_require__(1)
	  , create     = __webpack_require__(35)
	  , aFunction  = __webpack_require__(12)
	  , anObject   = __webpack_require__(2)
	  , isObject   = __webpack_require__(5)
	  , fails      = __webpack_require__(4)
	  , bind       = __webpack_require__(111)
	  , rConstruct = (__webpack_require__(3).Reflect || {}).construct;

	// MS Edge supports only 2 arguments and argumentsList argument is optional
	// FF Nightly sets third argument as `new.target`, but does not create `this` from it
	var NEW_TARGET_BUG = fails(function(){
	  function F(){}
	  return !(rConstruct(function(){}, [], F) instanceof F);
	});
	var ARGS_BUG = !fails(function(){
	  rConstruct(function(){});
	});

	$export($export.S + $export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
	  construct: function construct(Target, args /*, newTarget*/){
	    aFunction(Target);
	    anObject(args);
	    var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
	    if(ARGS_BUG && !NEW_TARGET_BUG)return rConstruct(Target, args, newTarget);
	    if(Target == newTarget){
	      // w/o altered newTarget, optimization for 0-4 arguments
	      switch(args.length){
	        case 0: return new Target;
	        case 1: return new Target(args[0]);
	        case 2: return new Target(args[0], args[1]);
	        case 3: return new Target(args[0], args[1], args[2]);
	        case 4: return new Target(args[0], args[1], args[2], args[3]);
	      }
	      // w/o altered newTarget, lot of arguments case
	      var $args = [null];
	      $args.push.apply($args, args);
	      return new (bind.apply(Target, $args));
	    }
	    // with altered newTarget, not support built-in constructors
	    var proto    = newTarget.prototype
	      , instance = create(isObject(proto) ? proto : Object.prototype)
	      , result   = Function.apply.call(Target, instance, args);
	    return isObject(result) ? result : instance;
	  }
	});

/***/ },
/* 245 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
	var dP          = __webpack_require__(8)
	  , $export     = __webpack_require__(1)
	  , anObject    = __webpack_require__(2)
	  , toPrimitive = __webpack_require__(24);

	// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
	$export($export.S + $export.F * __webpack_require__(4)(function(){
	  Reflect.defineProperty(dP.f({}, 1, {value: 1}), 1, {value: 2});
	}), 'Reflect', {
	  defineProperty: function defineProperty(target, propertyKey, attributes){
	    anObject(target);
	    propertyKey = toPrimitive(propertyKey, true);
	    anObject(attributes);
	    try {
	      dP.f(target, propertyKey, attributes);
	      return true;
	    } catch(e){
	      return false;
	    }
	  }
	});

/***/ },
/* 246 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.4 Reflect.deleteProperty(target, propertyKey)
	var $export  = __webpack_require__(1)
	  , gOPD     = __webpack_require__(17).f
	  , anObject = __webpack_require__(2);

	$export($export.S, 'Reflect', {
	  deleteProperty: function deleteProperty(target, propertyKey){
	    var desc = gOPD(anObject(target), propertyKey);
	    return desc && !desc.configurable ? false : delete target[propertyKey];
	  }
	});

/***/ },
/* 247 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 26.1.5 Reflect.enumerate(target)
	var $export  = __webpack_require__(1)
	  , anObject = __webpack_require__(2);
	var Enumerate = function(iterated){
	  this._t = anObject(iterated); // target
	  this._i = 0;                  // next index
	  var keys = this._k = []       // keys
	    , key;
	  for(key in iterated)keys.push(key);
	};
	__webpack_require__(81)(Enumerate, 'Object', function(){
	  var that = this
	    , keys = that._k
	    , key;
	  do {
	    if(that._i >= keys.length)return {value: undefined, done: true};
	  } while(!((key = keys[that._i++]) in that._t));
	  return {value: key, done: false};
	});

	$export($export.S, 'Reflect', {
	  enumerate: function enumerate(target){
	    return new Enumerate(target);
	  }
	});

/***/ },
/* 248 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
	var gOPD     = __webpack_require__(17)
	  , $export  = __webpack_require__(1)
	  , anObject = __webpack_require__(2);

	$export($export.S, 'Reflect', {
	  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
	    return gOPD.f(anObject(target), propertyKey);
	  }
	});

/***/ },
/* 249 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.8 Reflect.getPrototypeOf(target)
	var $export  = __webpack_require__(1)
	  , getProto = __webpack_require__(18)
	  , anObject = __webpack_require__(2);

	$export($export.S, 'Reflect', {
	  getPrototypeOf: function getPrototypeOf(target){
	    return getProto(anObject(target));
	  }
	});

/***/ },
/* 250 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.6 Reflect.get(target, propertyKey [, receiver])
	var gOPD           = __webpack_require__(17)
	  , getPrototypeOf = __webpack_require__(18)
	  , has            = __webpack_require__(11)
	  , $export        = __webpack_require__(1)
	  , isObject       = __webpack_require__(5)
	  , anObject       = __webpack_require__(2);

	function get(target, propertyKey/*, receiver*/){
	  var receiver = arguments.length < 3 ? target : arguments[2]
	    , desc, proto;
	  if(anObject(target) === receiver)return target[propertyKey];
	  if(desc = gOPD.f(target, propertyKey))return has(desc, 'value')
	    ? desc.value
	    : desc.get !== undefined
	      ? desc.get.call(receiver)
	      : undefined;
	  if(isObject(proto = getPrototypeOf(target)))return get(proto, propertyKey, receiver);
	}

	$export($export.S, 'Reflect', {get: get});

/***/ },
/* 251 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.9 Reflect.has(target, propertyKey)
	var $export = __webpack_require__(1);

	$export($export.S, 'Reflect', {
	  has: function has(target, propertyKey){
	    return propertyKey in target;
	  }
	});

/***/ },
/* 252 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.10 Reflect.isExtensible(target)
	var $export       = __webpack_require__(1)
	  , anObject      = __webpack_require__(2)
	  , $isExtensible = Object.isExtensible;

	$export($export.S, 'Reflect', {
	  isExtensible: function isExtensible(target){
	    anObject(target);
	    return $isExtensible ? $isExtensible(target) : true;
	  }
	});

/***/ },
/* 253 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.11 Reflect.ownKeys(target)
	var $export = __webpack_require__(1);

	$export($export.S, 'Reflect', {ownKeys: __webpack_require__(125)});

/***/ },
/* 254 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.12 Reflect.preventExtensions(target)
	var $export            = __webpack_require__(1)
	  , anObject           = __webpack_require__(2)
	  , $preventExtensions = Object.preventExtensions;

	$export($export.S, 'Reflect', {
	  preventExtensions: function preventExtensions(target){
	    anObject(target);
	    try {
	      if($preventExtensions)$preventExtensions(target);
	      return true;
	    } catch(e){
	      return false;
	    }
	  }
	});

/***/ },
/* 255 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.14 Reflect.setPrototypeOf(target, proto)
	var $export  = __webpack_require__(1)
	  , setProto = __webpack_require__(86);

	if(setProto)$export($export.S, 'Reflect', {
	  setPrototypeOf: function setPrototypeOf(target, proto){
	    setProto.check(target, proto);
	    try {
	      setProto.set(target, proto);
	      return true;
	    } catch(e){
	      return false;
	    }
	  }
	});

/***/ },
/* 256 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
	var dP             = __webpack_require__(8)
	  , gOPD           = __webpack_require__(17)
	  , getPrototypeOf = __webpack_require__(18)
	  , has            = __webpack_require__(11)
	  , $export        = __webpack_require__(1)
	  , createDesc     = __webpack_require__(31)
	  , anObject       = __webpack_require__(2)
	  , isObject       = __webpack_require__(5);

	function set(target, propertyKey, V/*, receiver*/){
	  var receiver = arguments.length < 4 ? target : arguments[3]
	    , ownDesc  = gOPD.f(anObject(target), propertyKey)
	    , existingDescriptor, proto;
	  if(!ownDesc){
	    if(isObject(proto = getPrototypeOf(target))){
	      return set(proto, propertyKey, V, receiver);
	    }
	    ownDesc = createDesc(0);
	  }
	  if(has(ownDesc, 'value')){
	    if(ownDesc.writable === false || !isObject(receiver))return false;
	    existingDescriptor = gOPD.f(receiver, propertyKey) || createDesc(0);
	    existingDescriptor.value = V;
	    dP.f(receiver, propertyKey, existingDescriptor);
	    return true;
	  }
	  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
	}

	$export($export.S, 'Reflect', {set: set});

/***/ },
/* 257 */
/***/ function(module, exports, __webpack_require__) {

	var global            = __webpack_require__(3)
	  , inheritIfRequired = __webpack_require__(78)
	  , dP                = __webpack_require__(8).f
	  , gOPN              = __webpack_require__(36).f
	  , isRegExp          = __webpack_require__(60)
	  , $flags            = __webpack_require__(58)
	  , $RegExp           = global.RegExp
	  , Base              = $RegExp
	  , proto             = $RegExp.prototype
	  , re1               = /a/g
	  , re2               = /a/g
	  // "new" creates a new object, old webkit buggy here
	  , CORRECT_NEW       = new $RegExp(re1) !== re1;

	if(__webpack_require__(7) && (!CORRECT_NEW || __webpack_require__(4)(function(){
	  re2[__webpack_require__(6)('match')] = false;
	  // RegExp constructor can alter flags and IsRegExp works correct with @@match
	  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
	}))){
	  $RegExp = function RegExp(p, f){
	    var tiRE = this instanceof $RegExp
	      , piRE = isRegExp(p)
	      , fiU  = f === undefined;
	    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
	      : inheritIfRequired(CORRECT_NEW
	        ? new Base(piRE && !fiU ? p.source : p, f)
	        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
	      , tiRE ? this : proto, $RegExp);
	  };
	  var proxy = function(key){
	    key in $RegExp || dP($RegExp, key, {
	      configurable: true,
	      get: function(){ return Base[key]; },
	      set: function(it){ Base[key] = it; }
	    });
	  };
	  for(var keys = gOPN(Base), i = 0; keys.length > i; )proxy(keys[i++]);
	  proto.constructor = $RegExp;
	  $RegExp.prototype = proto;
	  __webpack_require__(14)(global, 'RegExp', $RegExp);
	}

	__webpack_require__(39)('RegExp');

/***/ },
/* 258 */
/***/ function(module, exports, __webpack_require__) {

	// @@match logic
	__webpack_require__(57)('match', 1, function(defined, MATCH, $match){
	  // 21.1.3.11 String.prototype.match(regexp)
	  return [function match(regexp){
	    'use strict';
	    var O  = defined(this)
	      , fn = regexp == undefined ? undefined : regexp[MATCH];
	    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
	  }, $match];
	});

/***/ },
/* 259 */
/***/ function(module, exports, __webpack_require__) {

	// @@replace logic
	__webpack_require__(57)('replace', 2, function(defined, REPLACE, $replace){
	  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
	  return [function replace(searchValue, replaceValue){
	    'use strict';
	    var O  = defined(this)
	      , fn = searchValue == undefined ? undefined : searchValue[REPLACE];
	    return fn !== undefined
	      ? fn.call(searchValue, O, replaceValue)
	      : $replace.call(String(O), searchValue, replaceValue);
	  }, $replace];
	});

/***/ },
/* 260 */
/***/ function(module, exports, __webpack_require__) {

	// @@search logic
	__webpack_require__(57)('search', 1, function(defined, SEARCH, $search){
	  // 21.1.3.15 String.prototype.search(regexp)
	  return [function search(regexp){
	    'use strict';
	    var O  = defined(this)
	      , fn = regexp == undefined ? undefined : regexp[SEARCH];
	    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
	  }, $search];
	});

/***/ },
/* 261 */
/***/ function(module, exports, __webpack_require__) {

	// @@split logic
	__webpack_require__(57)('split', 2, function(defined, SPLIT, $split){
	  'use strict';
	  var isRegExp   = __webpack_require__(60)
	    , _split     = $split
	    , $push      = [].push
	    , $SPLIT     = 'split'
	    , LENGTH     = 'length'
	    , LAST_INDEX = 'lastIndex';
	  if(
	    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
	    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
	    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
	    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
	    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
	    ''[$SPLIT](/.?/)[LENGTH]
	  ){
	    var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
	    // based on es5-shim implementation, need to rework it
	    $split = function(separator, limit){
	      var string = String(this);
	      if(separator === undefined && limit === 0)return [];
	      // If `separator` is not a regex, use native split
	      if(!isRegExp(separator))return _split.call(string, separator, limit);
	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') +
	                  (separator.multiline ? 'm' : '') +
	                  (separator.unicode ? 'u' : '') +
	                  (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0;
	      var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var separator2, match, lastIndex, lastLength, i;
	      // Doesn't need flags gy, but they don't hurt
	      if(!NPCG)separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
	      while(match = separatorCopy.exec(string)){
	        // `separatorCopy.lastIndex` is not reliable cross-browser
	        lastIndex = match.index + match[0][LENGTH];
	        if(lastIndex > lastLastIndex){
	          output.push(string.slice(lastLastIndex, match.index));
	          // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
	          if(!NPCG && match[LENGTH] > 1)match[0].replace(separator2, function(){
	            for(i = 1; i < arguments[LENGTH] - 2; i++)if(arguments[i] === undefined)match[i] = undefined;
	          });
	          if(match[LENGTH] > 1 && match.index < string[LENGTH])$push.apply(output, match.slice(1));
	          lastLength = match[0][LENGTH];
	          lastLastIndex = lastIndex;
	          if(output[LENGTH] >= splitLimit)break;
	        }
	        if(separatorCopy[LAST_INDEX] === match.index)separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
	      }
	      if(lastLastIndex === string[LENGTH]){
	        if(lastLength || !separatorCopy.test(''))output.push('');
	      } else output.push(string.slice(lastLastIndex));
	      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
	    };
	  // Chakra, V8
	  } else if('0'[$SPLIT](undefined, 0)[LENGTH]){
	    $split = function(separator, limit){
	      return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
	    };
	  }
	  // 21.1.3.17 String.prototype.split(separator, limit)
	  return [function split(separator, limit){
	    var O  = defined(this)
	      , fn = separator == undefined ? undefined : separator[SPLIT];
	    return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
	  }, $split];
	});

/***/ },
/* 262 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	__webpack_require__(132);
	var anObject    = __webpack_require__(2)
	  , $flags      = __webpack_require__(58)
	  , DESCRIPTORS = __webpack_require__(7)
	  , TO_STRING   = 'toString'
	  , $toString   = /./[TO_STRING];

	var define = function(fn){
	  __webpack_require__(14)(RegExp.prototype, TO_STRING, fn, true);
	};

	// 21.2.5.14 RegExp.prototype.toString()
	if(__webpack_require__(4)(function(){ return $toString.call({source: 'a', flags: 'b'}) != '/a/b'; })){
	  define(function toString(){
	    var R = anObject(this);
	    return '/'.concat(R.source, '/',
	      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
	  });
	// FF44- RegExp#toString has a wrong name
	} else if($toString.name != TO_STRING){
	  define(function toString(){
	    return $toString.call(this);
	  });
	}

/***/ },
/* 263 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.2 String.prototype.anchor(name)
	__webpack_require__(15)('anchor', function(createHTML){
	  return function anchor(name){
	    return createHTML(this, 'a', 'name', name);
	  }
	});

/***/ },
/* 264 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.3 String.prototype.big()
	__webpack_require__(15)('big', function(createHTML){
	  return function big(){
	    return createHTML(this, 'big', '', '');
	  }
	});

/***/ },
/* 265 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.4 String.prototype.blink()
	__webpack_require__(15)('blink', function(createHTML){
	  return function blink(){
	    return createHTML(this, 'blink', '', '');
	  }
	});

/***/ },
/* 266 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.5 String.prototype.bold()
	__webpack_require__(15)('bold', function(createHTML){
	  return function bold(){
	    return createHTML(this, 'b', '', '');
	  }
	});

/***/ },
/* 267 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export = __webpack_require__(1)
	  , $at     = __webpack_require__(89)(false);
	$export($export.P, 'String', {
	  // 21.1.3.3 String.prototype.codePointAt(pos)
	  codePointAt: function codePointAt(pos){
	    return $at(this, pos);
	  }
	});

/***/ },
/* 268 */
/***/ function(module, exports, __webpack_require__) {

	// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
	'use strict';
	var $export   = __webpack_require__(1)
	  , toLength  = __webpack_require__(9)
	  , context   = __webpack_require__(90)
	  , ENDS_WITH = 'endsWith'
	  , $endsWith = ''[ENDS_WITH];

	$export($export.P + $export.F * __webpack_require__(76)(ENDS_WITH), 'String', {
	  endsWith: function endsWith(searchString /*, endPosition = @length */){
	    var that = context(this, searchString, ENDS_WITH)
	      , endPosition = arguments.length > 1 ? arguments[1] : undefined
	      , len    = toLength(that.length)
	      , end    = endPosition === undefined ? len : Math.min(toLength(endPosition), len)
	      , search = String(searchString);
	    return $endsWith
	      ? $endsWith.call(that, search, end)
	      : that.slice(end - search.length, end) === search;
	  }
	});

/***/ },
/* 269 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.6 String.prototype.fixed()
	__webpack_require__(15)('fixed', function(createHTML){
	  return function fixed(){
	    return createHTML(this, 'tt', '', '');
	  }
	});

/***/ },
/* 270 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.7 String.prototype.fontcolor(color)
	__webpack_require__(15)('fontcolor', function(createHTML){
	  return function fontcolor(color){
	    return createHTML(this, 'font', 'color', color);
	  }
	});

/***/ },
/* 271 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.8 String.prototype.fontsize(size)
	__webpack_require__(15)('fontsize', function(createHTML){
	  return function fontsize(size){
	    return createHTML(this, 'font', 'size', size);
	  }
	});

/***/ },
/* 272 */
/***/ function(module, exports, __webpack_require__) {

	var $export        = __webpack_require__(1)
	  , toIndex        = __webpack_require__(40)
	  , fromCharCode   = String.fromCharCode
	  , $fromCodePoint = String.fromCodePoint;

	// length should be 1, old FF problem
	$export($export.S + $export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
	  // 21.1.2.2 String.fromCodePoint(...codePoints)
	  fromCodePoint: function fromCodePoint(x){ // eslint-disable-line no-unused-vars
	    var res  = []
	      , aLen = arguments.length
	      , i    = 0
	      , code;
	    while(aLen > i){
	      code = +arguments[i++];
	      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
	      res.push(code < 0x10000
	        ? fromCharCode(code)
	        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
	      );
	    } return res.join('');
	  }
	});

/***/ },
/* 273 */
/***/ function(module, exports, __webpack_require__) {

	// 21.1.3.7 String.prototype.includes(searchString, position = 0)
	'use strict';
	var $export  = __webpack_require__(1)
	  , context  = __webpack_require__(90)
	  , INCLUDES = 'includes';

	$export($export.P + $export.F * __webpack_require__(76)(INCLUDES), 'String', {
	  includes: function includes(searchString /*, position = 0 */){
	    return !!~context(this, searchString, INCLUDES)
	      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

/***/ },
/* 274 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.9 String.prototype.italics()
	__webpack_require__(15)('italics', function(createHTML){
	  return function italics(){
	    return createHTML(this, 'i', '', '');
	  }
	});

/***/ },
/* 275 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(89)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(82)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 276 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.10 String.prototype.link(url)
	__webpack_require__(15)('link', function(createHTML){
	  return function link(url){
	    return createHTML(this, 'a', 'href', url);
	  }
	});

/***/ },
/* 277 */
/***/ function(module, exports, __webpack_require__) {

	var $export   = __webpack_require__(1)
	  , toIObject = __webpack_require__(16)
	  , toLength  = __webpack_require__(9);

	$export($export.S, 'String', {
	  // 21.1.2.4 String.raw(callSite, ...substitutions)
	  raw: function raw(callSite){
	    var tpl  = toIObject(callSite.raw)
	      , len  = toLength(tpl.length)
	      , aLen = arguments.length
	      , res  = []
	      , i    = 0;
	    while(len > i){
	      res.push(String(tpl[i++]));
	      if(i < aLen)res.push(String(arguments[i]));
	    } return res.join('');
	  }
	});

/***/ },
/* 278 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(1);

	$export($export.P, 'String', {
	  // 21.1.3.13 String.prototype.repeat(count)
	  repeat: __webpack_require__(91)
	});

/***/ },
/* 279 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.11 String.prototype.small()
	__webpack_require__(15)('small', function(createHTML){
	  return function small(){
	    return createHTML(this, 'small', '', '');
	  }
	});

/***/ },
/* 280 */
/***/ function(module, exports, __webpack_require__) {

	// 21.1.3.18 String.prototype.startsWith(searchString [, position ])
	'use strict';
	var $export     = __webpack_require__(1)
	  , toLength    = __webpack_require__(9)
	  , context     = __webpack_require__(90)
	  , STARTS_WITH = 'startsWith'
	  , $startsWith = ''[STARTS_WITH];

	$export($export.P + $export.F * __webpack_require__(76)(STARTS_WITH), 'String', {
	  startsWith: function startsWith(searchString /*, position = 0 */){
	    var that   = context(this, searchString, STARTS_WITH)
	      , index  = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length))
	      , search = String(searchString);
	    return $startsWith
	      ? $startsWith.call(that, search, index)
	      : that.slice(index, index + search.length) === search;
	  }
	});

/***/ },
/* 281 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.12 String.prototype.strike()
	__webpack_require__(15)('strike', function(createHTML){
	  return function strike(){
	    return createHTML(this, 'strike', '', '');
	  }
	});

/***/ },
/* 282 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.13 String.prototype.sub()
	__webpack_require__(15)('sub', function(createHTML){
	  return function sub(){
	    return createHTML(this, 'sub', '', '');
	  }
	});

/***/ },
/* 283 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// B.2.3.14 String.prototype.sup()
	__webpack_require__(15)('sup', function(createHTML){
	  return function sup(){
	    return createHTML(this, 'sup', '', '');
	  }
	});

/***/ },
/* 284 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 21.1.3.25 String.prototype.trim()
	__webpack_require__(47)('trim', function($trim){
	  return function trim(){
	    return $trim(this, 3);
	  };
	});

/***/ },
/* 285 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var global         = __webpack_require__(3)
	  , has            = __webpack_require__(11)
	  , DESCRIPTORS    = __webpack_require__(7)
	  , $export        = __webpack_require__(1)
	  , redefine       = __webpack_require__(14)
	  , META           = __webpack_require__(30).KEY
	  , $fails         = __webpack_require__(4)
	  , shared         = __webpack_require__(64)
	  , setToStringTag = __webpack_require__(46)
	  , uid            = __webpack_require__(41)
	  , wks            = __webpack_require__(6)
	  , wksExt         = __webpack_require__(130)
	  , wksDefine      = __webpack_require__(95)
	  , keyOf          = __webpack_require__(161)
	  , enumKeys       = __webpack_require__(160)
	  , isArray        = __webpack_require__(80)
	  , anObject       = __webpack_require__(2)
	  , toIObject      = __webpack_require__(16)
	  , toPrimitive    = __webpack_require__(24)
	  , createDesc     = __webpack_require__(31)
	  , _create        = __webpack_require__(35)
	  , gOPNExt        = __webpack_require__(122)
	  , $GOPD          = __webpack_require__(17)
	  , $DP            = __webpack_require__(8)
	  , $keys          = __webpack_require__(37)
	  , gOPD           = $GOPD.f
	  , dP             = $DP.f
	  , gOPN           = gOPNExt.f
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , PROTOTYPE      = 'prototype'
	  , HIDDEN         = wks('_hidden')
	  , TO_PRIMITIVE   = wks('toPrimitive')
	  , isEnum         = {}.propertyIsEnumerable
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , OPSymbols      = shared('op-symbols')
	  , ObjectProto    = Object[PROTOTYPE]
	  , USE_NATIVE     = typeof $Symbol == 'function'
	  , QObject        = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(dP({}, 'a', {
	    get: function(){ return dP(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = gOPD(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  dP(it, key, D);
	  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
	} : dP;

	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
	  return typeof it == 'symbol';
	} : function(it){
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D){
	  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if(has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  it  = toIObject(it);
	  key = toPrimitive(key, true);
	  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
	  var D = gOPD(it, key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = gOPN(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var IS_OP  = it === ObjectProto
	    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if(!USE_NATIVE){
	  $Symbol = function Symbol(){
	    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
	    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function(value){
	      if(this === ObjectProto)$set.call(OPSymbols, value);
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    };
	    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
	    return wrap(tag);
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
	    return this._k;
	  });

	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f   = $defineProperty;
	  __webpack_require__(36).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(51).f  = $propertyIsEnumerable;
	  __webpack_require__(63).f = $getOwnPropertySymbols;

	  if(DESCRIPTORS && !__webpack_require__(34)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  wksExt.f = function(name){
	    return wrap(wks(name));
	  }
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

	for(var symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

	for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    if(isSymbol(key))return keyOf(SymbolRegistry, key);
	    throw TypeError(key + ' is not a symbol!');
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	});

	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it){
	    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	    var args = [it]
	      , i    = 1
	      , replacer, $replacer;
	    while(arguments.length > i)args.push(arguments[i++]);
	    replacer = args[1];
	    if(typeof replacer == 'function')$replacer = replacer;
	    if($replacer || !isArray(replacer))replacer = function(key, value){
	      if($replacer)value = $replacer.call(this, key, value);
	      if(!isSymbol(value))return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(13)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 286 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export      = __webpack_require__(1)
	  , $typed       = __webpack_require__(65)
	  , buffer       = __webpack_require__(94)
	  , anObject     = __webpack_require__(2)
	  , toIndex      = __webpack_require__(40)
	  , toLength     = __webpack_require__(9)
	  , isObject     = __webpack_require__(5)
	  , ArrayBuffer  = __webpack_require__(3).ArrayBuffer
	  , speciesConstructor = __webpack_require__(88)
	  , $ArrayBuffer = buffer.ArrayBuffer
	  , $DataView    = buffer.DataView
	  , $isView      = $typed.ABV && ArrayBuffer.isView
	  , $slice       = $ArrayBuffer.prototype.slice
	  , VIEW         = $typed.VIEW
	  , ARRAY_BUFFER = 'ArrayBuffer';

	$export($export.G + $export.W + $export.F * (ArrayBuffer !== $ArrayBuffer), {ArrayBuffer: $ArrayBuffer});

	$export($export.S + $export.F * !$typed.CONSTR, ARRAY_BUFFER, {
	  // 24.1.3.1 ArrayBuffer.isView(arg)
	  isView: function isView(it){
	    return $isView && $isView(it) || isObject(it) && VIEW in it;
	  }
	});

	$export($export.P + $export.U + $export.F * __webpack_require__(4)(function(){
	  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
	}), ARRAY_BUFFER, {
	  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
	  slice: function slice(start, end){
	    if($slice !== undefined && end === undefined)return $slice.call(anObject(this), start); // FF fix
	    var len    = anObject(this).byteLength
	      , first  = toIndex(start, len)
	      , final  = toIndex(end === undefined ? len : end, len)
	      , result = new (speciesConstructor(this, $ArrayBuffer))(toLength(final - first))
	      , viewS  = new $DataView(this)
	      , viewT  = new $DataView(result)
	      , index  = 0;
	    while(first < final){
	      viewT.setUint8(index++, viewS.getUint8(first++));
	    } return result;
	  }
	});

	__webpack_require__(39)(ARRAY_BUFFER);

/***/ },
/* 287 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(1);
	$export($export.G + $export.W + $export.F * !__webpack_require__(65).ABV, {
	  DataView: __webpack_require__(94).DataView
	});

/***/ },
/* 288 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(28)('Float32', 4, function(init){
	  return function Float32Array(data, byteOffset, length){
	    return init(this, data, byteOffset, length);
	  };
	});

/***/ },
/* 289 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(28)('Float64', 8, function(init){
	  return function Float64Array(data, byteOffset, length){
	    return init(this, data, byteOffset, length);
	  };
	});

/***/ },
/* 290 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(28)('Int16', 2, function(init){
	  return function Int16Array(data, byteOffset, length){
	    return init(this, data, byteOffset, length);
	  };
	});

/***/ },
/* 291 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(28)('Int32', 4, function(init){
	  return function Int32Array(data, byteOffset, length){
	    return init(this, data, byteOffset, length);
	  };
	});

/***/ },
/* 292 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(28)('Int8', 1, function(init){
	  return function Int8Array(data, byteOffset, length){
	    return init(this, data, byteOffset, length);
	  };
	});

/***/ },
/* 293 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(28)('Uint16', 2, function(init){
	  return function Uint16Array(data, byteOffset, length){
	    return init(this, data, byteOffset, length);
	  };
	});

/***/ },
/* 294 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(28)('Uint32', 4, function(init){
	  return function Uint32Array(data, byteOffset, length){
	    return init(this, data, byteOffset, length);
	  };
	});

/***/ },
/* 295 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(28)('Uint8', 1, function(init){
	  return function Uint8Array(data, byteOffset, length){
	    return init(this, data, byteOffset, length);
	  };
	});

/***/ },
/* 296 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(28)('Uint8', 1, function(init){
	  return function Uint8ClampedArray(data, byteOffset, length){
	    return init(this, data, byteOffset, length);
	  };
	}, true);

/***/ },
/* 297 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var weak = __webpack_require__(114);

	// 23.4 WeakSet Objects
	__webpack_require__(56)('WeakSet', function(get){
	  return function WeakSet(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.4.3.1 WeakSet.prototype.add(value)
	  add: function add(value){
	    return weak.def(this, value, true);
	  }
	}, weak, false, true);

/***/ },
/* 298 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// https://github.com/tc39/Array.prototype.includes
	var $export   = __webpack_require__(1)
	  , $includes = __webpack_require__(55)(true);

	$export($export.P, 'Array', {
	  includes: function includes(el /*, fromIndex = 0 */){
	    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	__webpack_require__(43)('includes');

/***/ },
/* 299 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask
	var $export   = __webpack_require__(1)
	  , microtask = __webpack_require__(85)()
	  , process   = __webpack_require__(3).process
	  , isNode    = __webpack_require__(19)(process) == 'process';

	$export($export.G, {
	  asap: function asap(fn){
	    var domain = isNode && process.domain;
	    microtask(domain ? domain.bind(fn) : fn);
	  }
	});

/***/ },
/* 300 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/ljharb/proposal-is-error
	var $export = __webpack_require__(1)
	  , cof     = __webpack_require__(19);

	$export($export.S, 'Error', {
	  isError: function isError(it){
	    return cof(it) === 'Error';
	  }
	});

/***/ },
/* 301 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export  = __webpack_require__(1);

	$export($export.P + $export.R, 'Map', {toJSON: __webpack_require__(113)('Map')});

/***/ },
/* 302 */
/***/ function(module, exports, __webpack_require__) {

	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	var $export = __webpack_require__(1);

	$export($export.S, 'Math', {
	  iaddh: function iaddh(x0, x1, y0, y1){
	    var $x0 = x0 >>> 0
	      , $x1 = x1 >>> 0
	      , $y0 = y0 >>> 0;
	    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
	  }
	});

/***/ },
/* 303 */
/***/ function(module, exports, __webpack_require__) {

	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	var $export = __webpack_require__(1);

	$export($export.S, 'Math', {
	  imulh: function imulh(u, v){
	    var UINT16 = 0xffff
	      , $u = +u
	      , $v = +v
	      , u0 = $u & UINT16
	      , v0 = $v & UINT16
	      , u1 = $u >> 16
	      , v1 = $v >> 16
	      , t  = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
	    return u1 * v1 + (t >> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >> 16);
	  }
	});

/***/ },
/* 304 */
/***/ function(module, exports, __webpack_require__) {

	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	var $export = __webpack_require__(1);

	$export($export.S, 'Math', {
	  isubh: function isubh(x0, x1, y0, y1){
	    var $x0 = x0 >>> 0
	      , $x1 = x1 >>> 0
	      , $y0 = y0 >>> 0;
	    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
	  }
	});

/***/ },
/* 305 */
/***/ function(module, exports, __webpack_require__) {

	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	var $export = __webpack_require__(1);

	$export($export.S, 'Math', {
	  umulh: function umulh(u, v){
	    var UINT16 = 0xffff
	      , $u = +u
	      , $v = +v
	      , u0 = $u & UINT16
	      , v0 = $v & UINT16
	      , u1 = $u >>> 16
	      , v1 = $v >>> 16
	      , t  = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
	    return u1 * v1 + (t >>> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >>> 16);
	  }
	});

/***/ },
/* 306 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export         = __webpack_require__(1)
	  , toObject        = __webpack_require__(10)
	  , aFunction       = __webpack_require__(12)
	  , $defineProperty = __webpack_require__(8);

	// B.2.2.2 Object.prototype.__defineGetter__(P, getter)
	__webpack_require__(7) && $export($export.P + __webpack_require__(62), 'Object', {
	  __defineGetter__: function __defineGetter__(P, getter){
	    $defineProperty.f(toObject(this), P, {get: aFunction(getter), enumerable: true, configurable: true});
	  }
	});

/***/ },
/* 307 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export         = __webpack_require__(1)
	  , toObject        = __webpack_require__(10)
	  , aFunction       = __webpack_require__(12)
	  , $defineProperty = __webpack_require__(8);

	// B.2.2.3 Object.prototype.__defineSetter__(P, setter)
	__webpack_require__(7) && $export($export.P + __webpack_require__(62), 'Object', {
	  __defineSetter__: function __defineSetter__(P, setter){
	    $defineProperty.f(toObject(this), P, {set: aFunction(setter), enumerable: true, configurable: true});
	  }
	});

/***/ },
/* 308 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/tc39/proposal-object-values-entries
	var $export  = __webpack_require__(1)
	  , $entries = __webpack_require__(124)(true);

	$export($export.S, 'Object', {
	  entries: function entries(it){
	    return $entries(it);
	  }
	});

/***/ },
/* 309 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/tc39/proposal-object-getownpropertydescriptors
	var $export        = __webpack_require__(1)
	  , ownKeys        = __webpack_require__(125)
	  , toIObject      = __webpack_require__(16)
	  , gOPD           = __webpack_require__(17)
	  , createProperty = __webpack_require__(73);

	$export($export.S, 'Object', {
	  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
	    var O       = toIObject(object)
	      , getDesc = gOPD.f
	      , keys    = ownKeys(O)
	      , result  = {}
	      , i       = 0
	      , key;
	    while(keys.length > i)createProperty(result, key = keys[i++], getDesc(O, key));
	    return result;
	  }
	});

/***/ },
/* 310 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export                  = __webpack_require__(1)
	  , toObject                 = __webpack_require__(10)
	  , toPrimitive              = __webpack_require__(24)
	  , getPrototypeOf           = __webpack_require__(18)
	  , getOwnPropertyDescriptor = __webpack_require__(17).f;

	// B.2.2.4 Object.prototype.__lookupGetter__(P)
	__webpack_require__(7) && $export($export.P + __webpack_require__(62), 'Object', {
	  __lookupGetter__: function __lookupGetter__(P){
	    var O = toObject(this)
	      , K = toPrimitive(P, true)
	      , D;
	    do {
	      if(D = getOwnPropertyDescriptor(O, K))return D.get;
	    } while(O = getPrototypeOf(O));
	  }
	});

/***/ },
/* 311 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $export                  = __webpack_require__(1)
	  , toObject                 = __webpack_require__(10)
	  , toPrimitive              = __webpack_require__(24)
	  , getPrototypeOf           = __webpack_require__(18)
	  , getOwnPropertyDescriptor = __webpack_require__(17).f;

	// B.2.2.5 Object.prototype.__lookupSetter__(P)
	__webpack_require__(7) && $export($export.P + __webpack_require__(62), 'Object', {
	  __lookupSetter__: function __lookupSetter__(P){
	    var O = toObject(this)
	      , K = toPrimitive(P, true)
	      , D;
	    do {
	      if(D = getOwnPropertyDescriptor(O, K))return D.set;
	    } while(O = getPrototypeOf(O));
	  }
	});

/***/ },
/* 312 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/tc39/proposal-object-values-entries
	var $export = __webpack_require__(1)
	  , $values = __webpack_require__(124)(false);

	$export($export.S, 'Object', {
	  values: function values(it){
	    return $values(it);
	  }
	});

/***/ },
/* 313 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// https://github.com/zenparsing/es-observable
	var $export     = __webpack_require__(1)
	  , global      = __webpack_require__(3)
	  , core        = __webpack_require__(25)
	  , microtask   = __webpack_require__(85)()
	  , OBSERVABLE  = __webpack_require__(6)('observable')
	  , aFunction   = __webpack_require__(12)
	  , anObject    = __webpack_require__(2)
	  , anInstance  = __webpack_require__(33)
	  , redefineAll = __webpack_require__(38)
	  , hide        = __webpack_require__(13)
	  , forOf       = __webpack_require__(44)
	  , RETURN      = forOf.RETURN;

	var getMethod = function(fn){
	  return fn == null ? undefined : aFunction(fn);
	};

	var cleanupSubscription = function(subscription){
	  var cleanup = subscription._c;
	  if(cleanup){
	    subscription._c = undefined;
	    cleanup();
	  }
	};

	var subscriptionClosed = function(subscription){
	  return subscription._o === undefined;
	};

	var closeSubscription = function(subscription){
	  if(!subscriptionClosed(subscription)){
	    subscription._o = undefined;
	    cleanupSubscription(subscription);
	  }
	};

	var Subscription = function(observer, subscriber){
	  anObject(observer);
	  this._c = undefined;
	  this._o = observer;
	  observer = new SubscriptionObserver(this);
	  try {
	    var cleanup      = subscriber(observer)
	      , subscription = cleanup;
	    if(cleanup != null){
	      if(typeof cleanup.unsubscribe === 'function')cleanup = function(){ subscription.unsubscribe(); };
	      else aFunction(cleanup);
	      this._c = cleanup;
	    }
	  } catch(e){
	    observer.error(e);
	    return;
	  } if(subscriptionClosed(this))cleanupSubscription(this);
	};

	Subscription.prototype = redefineAll({}, {
	  unsubscribe: function unsubscribe(){ closeSubscription(this); }
	});

	var SubscriptionObserver = function(subscription){
	  this._s = subscription;
	};

	SubscriptionObserver.prototype = redefineAll({}, {
	  next: function next(value){
	    var subscription = this._s;
	    if(!subscriptionClosed(subscription)){
	      var observer = subscription._o;
	      try {
	        var m = getMethod(observer.next);
	        if(m)return m.call(observer, value);
	      } catch(e){
	        try {
	          closeSubscription(subscription);
	        } finally {
	          throw e;
	        }
	      }
	    }
	  },
	  error: function error(value){
	    var subscription = this._s;
	    if(subscriptionClosed(subscription))throw value;
	    var observer = subscription._o;
	    subscription._o = undefined;
	    try {
	      var m = getMethod(observer.error);
	      if(!m)throw value;
	      value = m.call(observer, value);
	    } catch(e){
	      try {
	        cleanupSubscription(subscription);
	      } finally {
	        throw e;
	      }
	    } cleanupSubscription(subscription);
	    return value;
	  },
	  complete: function complete(value){
	    var subscription = this._s;
	    if(!subscriptionClosed(subscription)){
	      var observer = subscription._o;
	      subscription._o = undefined;
	      try {
	        var m = getMethod(observer.complete);
	        value = m ? m.call(observer, value) : undefined;
	      } catch(e){
	        try {
	          cleanupSubscription(subscription);
	        } finally {
	          throw e;
	        }
	      } cleanupSubscription(subscription);
	      return value;
	    }
	  }
	});

	var $Observable = function Observable(subscriber){
	  anInstance(this, $Observable, 'Observable', '_f')._f = aFunction(subscriber);
	};

	redefineAll($Observable.prototype, {
	  subscribe: function subscribe(observer){
	    return new Subscription(observer, this._f);
	  },
	  forEach: function forEach(fn){
	    var that = this;
	    return new (core.Promise || global.Promise)(function(resolve, reject){
	      aFunction(fn);
	      var subscription = that.subscribe({
	        next : function(value){
	          try {
	            return fn(value);
	          } catch(e){
	            reject(e);
	            subscription.unsubscribe();
	          }
	        },
	        error: reject,
	        complete: resolve
	      });
	    });
	  }
	});

	redefineAll($Observable, {
	  from: function from(x){
	    var C = typeof this === 'function' ? this : $Observable;
	    var method = getMethod(anObject(x)[OBSERVABLE]);
	    if(method){
	      var observable = anObject(method.call(x));
	      return observable.constructor === C ? observable : new C(function(observer){
	        return observable.subscribe(observer);
	      });
	    }
	    return new C(function(observer){
	      var done = false;
	      microtask(function(){
	        if(!done){
	          try {
	            if(forOf(x, false, function(it){
	              observer.next(it);
	              if(done)return RETURN;
	            }) === RETURN)return;
	          } catch(e){
	            if(done)throw e;
	            observer.error(e);
	            return;
	          } observer.complete();
	        }
	      });
	      return function(){ done = true; };
	    });
	  },
	  of: function of(){
	    for(var i = 0, l = arguments.length, items = Array(l); i < l;)items[i] = arguments[i++];
	    return new (typeof this === 'function' ? this : $Observable)(function(observer){
	      var done = false;
	      microtask(function(){
	        if(!done){
	          for(var i = 0; i < items.length; ++i){
	            observer.next(items[i]);
	            if(done)return;
	          } observer.complete();
	        }
	      });
	      return function(){ done = true; };
	    });
	  }
	});

	hide($Observable.prototype, OBSERVABLE, function(){ return this; });

	$export($export.G, {Observable: $Observable});

	__webpack_require__(39)('Observable');

/***/ },
/* 314 */
/***/ function(module, exports, __webpack_require__) {

	var metadata                  = __webpack_require__(27)
	  , anObject                  = __webpack_require__(2)
	  , toMetaKey                 = metadata.key
	  , ordinaryDefineOwnMetadata = metadata.set;

	metadata.exp({defineMetadata: function defineMetadata(metadataKey, metadataValue, target, targetKey){
	  ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject(target), toMetaKey(targetKey));
	}});

/***/ },
/* 315 */
/***/ function(module, exports, __webpack_require__) {

	var metadata               = __webpack_require__(27)
	  , anObject               = __webpack_require__(2)
	  , toMetaKey              = metadata.key
	  , getOrCreateMetadataMap = metadata.map
	  , store                  = metadata.store;

	metadata.exp({deleteMetadata: function deleteMetadata(metadataKey, target /*, targetKey */){
	  var targetKey   = arguments.length < 3 ? undefined : toMetaKey(arguments[2])
	    , metadataMap = getOrCreateMetadataMap(anObject(target), targetKey, false);
	  if(metadataMap === undefined || !metadataMap['delete'](metadataKey))return false;
	  if(metadataMap.size)return true;
	  var targetMetadata = store.get(target);
	  targetMetadata['delete'](targetKey);
	  return !!targetMetadata.size || store['delete'](target);
	}});

/***/ },
/* 316 */
/***/ function(module, exports, __webpack_require__) {

	var Set                     = __webpack_require__(133)
	  , from                    = __webpack_require__(109)
	  , metadata                = __webpack_require__(27)
	  , anObject                = __webpack_require__(2)
	  , getPrototypeOf          = __webpack_require__(18)
	  , ordinaryOwnMetadataKeys = metadata.keys
	  , toMetaKey               = metadata.key;

	var ordinaryMetadataKeys = function(O, P){
	  var oKeys  = ordinaryOwnMetadataKeys(O, P)
	    , parent = getPrototypeOf(O);
	  if(parent === null)return oKeys;
	  var pKeys  = ordinaryMetadataKeys(parent, P);
	  return pKeys.length ? oKeys.length ? from(new Set(oKeys.concat(pKeys))) : pKeys : oKeys;
	};

	metadata.exp({getMetadataKeys: function getMetadataKeys(target /*, targetKey */){
	  return ordinaryMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
	}});

/***/ },
/* 317 */
/***/ function(module, exports, __webpack_require__) {

	var metadata               = __webpack_require__(27)
	  , anObject               = __webpack_require__(2)
	  , getPrototypeOf         = __webpack_require__(18)
	  , ordinaryHasOwnMetadata = metadata.has
	  , ordinaryGetOwnMetadata = metadata.get
	  , toMetaKey              = metadata.key;

	var ordinaryGetMetadata = function(MetadataKey, O, P){
	  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
	  if(hasOwn)return ordinaryGetOwnMetadata(MetadataKey, O, P);
	  var parent = getPrototypeOf(O);
	  return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
	};

	metadata.exp({getMetadata: function getMetadata(metadataKey, target /*, targetKey */){
	  return ordinaryGetMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
	}});

/***/ },
/* 318 */
/***/ function(module, exports, __webpack_require__) {

	var metadata                = __webpack_require__(27)
	  , anObject                = __webpack_require__(2)
	  , ordinaryOwnMetadataKeys = metadata.keys
	  , toMetaKey               = metadata.key;

	metadata.exp({getOwnMetadataKeys: function getOwnMetadataKeys(target /*, targetKey */){
	  return ordinaryOwnMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
	}});

/***/ },
/* 319 */
/***/ function(module, exports, __webpack_require__) {

	var metadata               = __webpack_require__(27)
	  , anObject               = __webpack_require__(2)
	  , ordinaryGetOwnMetadata = metadata.get
	  , toMetaKey              = metadata.key;

	metadata.exp({getOwnMetadata: function getOwnMetadata(metadataKey, target /*, targetKey */){
	  return ordinaryGetOwnMetadata(metadataKey, anObject(target)
	    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
	}});

/***/ },
/* 320 */
/***/ function(module, exports, __webpack_require__) {

	var metadata               = __webpack_require__(27)
	  , anObject               = __webpack_require__(2)
	  , getPrototypeOf         = __webpack_require__(18)
	  , ordinaryHasOwnMetadata = metadata.has
	  , toMetaKey              = metadata.key;

	var ordinaryHasMetadata = function(MetadataKey, O, P){
	  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
	  if(hasOwn)return true;
	  var parent = getPrototypeOf(O);
	  return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
	};

	metadata.exp({hasMetadata: function hasMetadata(metadataKey, target /*, targetKey */){
	  return ordinaryHasMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
	}});

/***/ },
/* 321 */
/***/ function(module, exports, __webpack_require__) {

	var metadata               = __webpack_require__(27)
	  , anObject               = __webpack_require__(2)
	  , ordinaryHasOwnMetadata = metadata.has
	  , toMetaKey              = metadata.key;

	metadata.exp({hasOwnMetadata: function hasOwnMetadata(metadataKey, target /*, targetKey */){
	  return ordinaryHasOwnMetadata(metadataKey, anObject(target)
	    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
	}});

/***/ },
/* 322 */
/***/ function(module, exports, __webpack_require__) {

	var metadata                  = __webpack_require__(27)
	  , anObject                  = __webpack_require__(2)
	  , aFunction                 = __webpack_require__(12)
	  , toMetaKey                 = metadata.key
	  , ordinaryDefineOwnMetadata = metadata.set;

	metadata.exp({metadata: function metadata(metadataKey, metadataValue){
	  return function decorator(target, targetKey){
	    ordinaryDefineOwnMetadata(
	      metadataKey, metadataValue,
	      (targetKey !== undefined ? anObject : aFunction)(target),
	      toMetaKey(targetKey)
	    );
	  };
	}});

/***/ },
/* 323 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export  = __webpack_require__(1);

	$export($export.P + $export.R, 'Set', {toJSON: __webpack_require__(113)('Set')});

/***/ },
/* 324 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// https://github.com/mathiasbynens/String.prototype.at
	var $export = __webpack_require__(1)
	  , $at     = __webpack_require__(89)(true);

	$export($export.P, 'String', {
	  at: function at(pos){
	    return $at(this, pos);
	  }
	});

/***/ },
/* 325 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// https://tc39.github.io/String.prototype.matchAll/
	var $export     = __webpack_require__(1)
	  , defined     = __webpack_require__(20)
	  , toLength    = __webpack_require__(9)
	  , isRegExp    = __webpack_require__(60)
	  , getFlags    = __webpack_require__(58)
	  , RegExpProto = RegExp.prototype;

	var $RegExpStringIterator = function(regexp, string){
	  this._r = regexp;
	  this._s = string;
	};

	__webpack_require__(81)($RegExpStringIterator, 'RegExp String', function next(){
	  var match = this._r.exec(this._s);
	  return {value: match, done: match === null};
	});

	$export($export.P, 'String', {
	  matchAll: function matchAll(regexp){
	    defined(this);
	    if(!isRegExp(regexp))throw TypeError(regexp + ' is not a regexp!');
	    var S     = String(this)
	      , flags = 'flags' in RegExpProto ? String(regexp.flags) : getFlags.call(regexp)
	      , rx    = new RegExp(regexp.source, ~flags.indexOf('g') ? flags : 'g' + flags);
	    rx.lastIndex = toLength(regexp.lastIndex);
	    return new $RegExpStringIterator(rx, S);
	  }
	});

/***/ },
/* 326 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// https://github.com/tc39/proposal-string-pad-start-end
	var $export = __webpack_require__(1)
	  , $pad    = __webpack_require__(129);

	$export($export.P, 'String', {
	  padEnd: function padEnd(maxLength /*, fillString = ' ' */){
	    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
	  }
	});

/***/ },
/* 327 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// https://github.com/tc39/proposal-string-pad-start-end
	var $export = __webpack_require__(1)
	  , $pad    = __webpack_require__(129);

	$export($export.P, 'String', {
	  padStart: function padStart(maxLength /*, fillString = ' ' */){
	    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
	  }
	});

/***/ },
/* 328 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
	__webpack_require__(47)('trimLeft', function($trim){
	  return function trimLeft(){
	    return $trim(this, 1);
	  };
	}, 'trimStart');

/***/ },
/* 329 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
	__webpack_require__(47)('trimRight', function($trim){
	  return function trimRight(){
	    return $trim(this, 2);
	  };
	}, 'trimEnd');

/***/ },
/* 330 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(95)('asyncIterator');

/***/ },
/* 331 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(95)('observable');

/***/ },
/* 332 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/ljharb/proposal-global
	var $export = __webpack_require__(1);

	$export($export.S, 'System', {global: __webpack_require__(3)});

/***/ },
/* 333 */
/***/ function(module, exports, __webpack_require__) {

	var $iterators    = __webpack_require__(97)
	  , redefine      = __webpack_require__(14)
	  , global        = __webpack_require__(3)
	  , hide          = __webpack_require__(13)
	  , Iterators     = __webpack_require__(45)
	  , wks           = __webpack_require__(6)
	  , ITERATOR      = wks('iterator')
	  , TO_STRING_TAG = wks('toStringTag')
	  , ArrayValues   = Iterators.Array;

	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype
	    , key;
	  if(proto){
	    if(!proto[ITERATOR])hide(proto, ITERATOR, ArrayValues);
	    if(!proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	    Iterators[NAME] = ArrayValues;
	    for(key in $iterators)if(!proto[key])redefine(proto, key, $iterators[key], true);
	  }
	}

/***/ },
/* 334 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(1)
	  , $task   = __webpack_require__(93);
	$export($export.G + $export.B, {
	  setImmediate:   $task.set,
	  clearImmediate: $task.clear
	});

/***/ },
/* 335 */
/***/ function(module, exports, __webpack_require__) {

	// ie9- setTimeout & setInterval additional parameters fix
	var global     = __webpack_require__(3)
	  , $export    = __webpack_require__(1)
	  , invoke     = __webpack_require__(59)
	  , partial    = __webpack_require__(162)
	  , navigator  = global.navigator
	  , MSIE       = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
	var wrap = function(set){
	  return MSIE ? function(fn, time /*, ...args */){
	    return set(invoke(
	      partial,
	      [].slice.call(arguments, 2),
	      typeof fn == 'function' ? fn : Function(fn)
	    ), time);
	  } : set;
	};
	$export($export.G + $export.B + $export.F * MSIE, {
	  setTimeout:  wrap(global.setTimeout),
	  setInterval: wrap(global.setInterval)
	});

/***/ },
/* 336 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(285);
	__webpack_require__(224);
	__webpack_require__(226);
	__webpack_require__(225);
	__webpack_require__(228);
	__webpack_require__(230);
	__webpack_require__(235);
	__webpack_require__(229);
	__webpack_require__(227);
	__webpack_require__(237);
	__webpack_require__(236);
	__webpack_require__(232);
	__webpack_require__(233);
	__webpack_require__(231);
	__webpack_require__(223);
	__webpack_require__(234);
	__webpack_require__(238);
	__webpack_require__(239);
	__webpack_require__(191);
	__webpack_require__(193);
	__webpack_require__(192);
	__webpack_require__(241);
	__webpack_require__(240);
	__webpack_require__(211);
	__webpack_require__(221);
	__webpack_require__(222);
	__webpack_require__(212);
	__webpack_require__(213);
	__webpack_require__(214);
	__webpack_require__(215);
	__webpack_require__(216);
	__webpack_require__(217);
	__webpack_require__(218);
	__webpack_require__(219);
	__webpack_require__(220);
	__webpack_require__(194);
	__webpack_require__(195);
	__webpack_require__(196);
	__webpack_require__(197);
	__webpack_require__(198);
	__webpack_require__(199);
	__webpack_require__(200);
	__webpack_require__(201);
	__webpack_require__(202);
	__webpack_require__(203);
	__webpack_require__(204);
	__webpack_require__(205);
	__webpack_require__(206);
	__webpack_require__(207);
	__webpack_require__(208);
	__webpack_require__(209);
	__webpack_require__(210);
	__webpack_require__(272);
	__webpack_require__(277);
	__webpack_require__(284);
	__webpack_require__(275);
	__webpack_require__(267);
	__webpack_require__(268);
	__webpack_require__(273);
	__webpack_require__(278);
	__webpack_require__(280);
	__webpack_require__(263);
	__webpack_require__(264);
	__webpack_require__(265);
	__webpack_require__(266);
	__webpack_require__(269);
	__webpack_require__(270);
	__webpack_require__(271);
	__webpack_require__(274);
	__webpack_require__(276);
	__webpack_require__(279);
	__webpack_require__(281);
	__webpack_require__(282);
	__webpack_require__(283);
	__webpack_require__(186);
	__webpack_require__(188);
	__webpack_require__(187);
	__webpack_require__(190);
	__webpack_require__(189);
	__webpack_require__(175);
	__webpack_require__(173);
	__webpack_require__(179);
	__webpack_require__(176);
	__webpack_require__(182);
	__webpack_require__(184);
	__webpack_require__(172);
	__webpack_require__(178);
	__webpack_require__(169);
	__webpack_require__(183);
	__webpack_require__(167);
	__webpack_require__(181);
	__webpack_require__(180);
	__webpack_require__(174);
	__webpack_require__(177);
	__webpack_require__(166);
	__webpack_require__(168);
	__webpack_require__(171);
	__webpack_require__(170);
	__webpack_require__(185);
	__webpack_require__(97);
	__webpack_require__(257);
	__webpack_require__(262);
	__webpack_require__(132);
	__webpack_require__(258);
	__webpack_require__(259);
	__webpack_require__(260);
	__webpack_require__(261);
	__webpack_require__(242);
	__webpack_require__(131);
	__webpack_require__(133);
	__webpack_require__(134);
	__webpack_require__(297);
	__webpack_require__(286);
	__webpack_require__(287);
	__webpack_require__(292);
	__webpack_require__(295);
	__webpack_require__(296);
	__webpack_require__(290);
	__webpack_require__(293);
	__webpack_require__(291);
	__webpack_require__(294);
	__webpack_require__(288);
	__webpack_require__(289);
	__webpack_require__(243);
	__webpack_require__(244);
	__webpack_require__(245);
	__webpack_require__(246);
	__webpack_require__(247);
	__webpack_require__(250);
	__webpack_require__(248);
	__webpack_require__(249);
	__webpack_require__(251);
	__webpack_require__(252);
	__webpack_require__(253);
	__webpack_require__(254);
	__webpack_require__(256);
	__webpack_require__(255);
	__webpack_require__(298);
	__webpack_require__(324);
	__webpack_require__(327);
	__webpack_require__(326);
	__webpack_require__(328);
	__webpack_require__(329);
	__webpack_require__(325);
	__webpack_require__(330);
	__webpack_require__(331);
	__webpack_require__(309);
	__webpack_require__(312);
	__webpack_require__(308);
	__webpack_require__(306);
	__webpack_require__(307);
	__webpack_require__(310);
	__webpack_require__(311);
	__webpack_require__(301);
	__webpack_require__(323);
	__webpack_require__(332);
	__webpack_require__(300);
	__webpack_require__(302);
	__webpack_require__(304);
	__webpack_require__(303);
	__webpack_require__(305);
	__webpack_require__(314);
	__webpack_require__(315);
	__webpack_require__(317);
	__webpack_require__(316);
	__webpack_require__(319);
	__webpack_require__(318);
	__webpack_require__(320);
	__webpack_require__(321);
	__webpack_require__(322);
	__webpack_require__(299);
	__webpack_require__(313);
	__webpack_require__(335);
	__webpack_require__(334);
	__webpack_require__(333);
	module.exports = __webpack_require__(25);

/***/ },
/* 337 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(42),
	    root = __webpack_require__(29);

	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');

	module.exports = DataView;


/***/ },
/* 338 */
/***/ function(module, exports, __webpack_require__) {

	var hashClear = __webpack_require__(381),
	    hashDelete = __webpack_require__(382),
	    hashGet = __webpack_require__(383),
	    hashHas = __webpack_require__(384),
	    hashSet = __webpack_require__(385);

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

	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

	module.exports = Hash;


/***/ },
/* 339 */
/***/ function(module, exports, __webpack_require__) {

	var mapCacheClear = __webpack_require__(398),
	    mapCacheDelete = __webpack_require__(399),
	    mapCacheGet = __webpack_require__(400),
	    mapCacheHas = __webpack_require__(401),
	    mapCacheSet = __webpack_require__(402);

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

	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

	module.exports = MapCache;


/***/ },
/* 340 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(42),
	    root = __webpack_require__(29);

	/* Built-in method references that are verified to be native. */
	var Promise = getNative(root, 'Promise');

	module.exports = Promise;


/***/ },
/* 341 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(42),
	    root = __webpack_require__(29);

	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');

	module.exports = Set;


/***/ },
/* 342 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(66),
	    stackClear = __webpack_require__(408),
	    stackDelete = __webpack_require__(409),
	    stackGet = __webpack_require__(410),
	    stackHas = __webpack_require__(411),
	    stackSet = __webpack_require__(412);

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

	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;

	module.exports = Stack;


/***/ },
/* 343 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(29);

	/** Built-in value references. */
	var Uint8Array = root.Uint8Array;

	module.exports = Uint8Array;


/***/ },
/* 344 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(42),
	    root = __webpack_require__(29);

	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');

	module.exports = WeakMap;


/***/ },
/* 345 */
/***/ function(module, exports) {

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

	module.exports = addMapEntry;


/***/ },
/* 346 */
/***/ function(module, exports) {

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

	module.exports = addSetEntry;


/***/ },
/* 347 */
/***/ function(module, exports) {

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

	module.exports = apply;


/***/ },
/* 348 */
/***/ function(module, exports) {

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

	module.exports = arrayEach;


/***/ },
/* 349 */
/***/ function(module, exports, __webpack_require__) {

	var baseTimes = __webpack_require__(363),
	    isArguments = __webpack_require__(147),
	    isArray = __webpack_require__(70),
	    isIndex = __webpack_require__(140);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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

	module.exports = arrayLikeKeys;


/***/ },
/* 350 */
/***/ function(module, exports) {

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

	module.exports = arrayMap;


/***/ },
/* 351 */
/***/ function(module, exports, __webpack_require__) {

	var copyObject = __webpack_require__(101),
	    keys = __webpack_require__(71);

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

	module.exports = baseAssign;


/***/ },
/* 352 */
/***/ function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(342),
	    arrayEach = __webpack_require__(348),
	    assignValue = __webpack_require__(138),
	    baseAssign = __webpack_require__(351),
	    cloneBuffer = __webpack_require__(364),
	    copyArray = __webpack_require__(371),
	    copySymbols = __webpack_require__(372),
	    getAllKeys = __webpack_require__(377),
	    getTag = __webpack_require__(379),
	    initCloneArray = __webpack_require__(386),
	    initCloneByTag = __webpack_require__(387),
	    initCloneObject = __webpack_require__(388),
	    isArray = __webpack_require__(70),
	    isBuffer = __webpack_require__(418),
	    isObject = __webpack_require__(52),
	    keys = __webpack_require__(71);

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

	module.exports = baseClone;


/***/ },
/* 353 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(52);

	/** Built-in value references. */
	var objectCreate = Object.create;

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

	module.exports = baseCreate;


/***/ },
/* 354 */
/***/ function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(136),
	    isFlattenable = __webpack_require__(389);

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

	module.exports = baseFlatten;


/***/ },
/* 355 */
/***/ function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(136),
	    isArray = __webpack_require__(70);

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

	module.exports = baseGetAllKeys;


/***/ },
/* 356 */
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

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

	module.exports = baseGetTag;


/***/ },
/* 357 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(148),
	    isMasked = __webpack_require__(392),
	    isObject = __webpack_require__(52),
	    toSource = __webpack_require__(144);

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

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

	module.exports = baseIsNative;


/***/ },
/* 358 */
/***/ function(module, exports, __webpack_require__) {

	var isPrototype = __webpack_require__(141),
	    nativeKeys = __webpack_require__(405);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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

	module.exports = baseKeys;


/***/ },
/* 359 */
/***/ function(module, exports, __webpack_require__) {

	var basePickBy = __webpack_require__(360);

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

	module.exports = basePick;


/***/ },
/* 360 */
/***/ function(module, exports, __webpack_require__) {

	var baseAssignValue = __webpack_require__(99);

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

	module.exports = basePickBy;


/***/ },
/* 361 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(146),
	    overRest = __webpack_require__(142),
	    setToString = __webpack_require__(143);

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

	module.exports = baseRest;


/***/ },
/* 362 */
/***/ function(module, exports, __webpack_require__) {

	var constant = __webpack_require__(415),
	    identity = __webpack_require__(146),
	    nativeDefineProperty = __webpack_require__(404);

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

	module.exports = baseSetToString;


/***/ },
/* 363 */
/***/ function(module, exports) {

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

	module.exports = baseTimes;


/***/ },
/* 364 */
/***/ function(module, exports) {

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

	module.exports = cloneBuffer;


/***/ },
/* 365 */
/***/ function(module, exports, __webpack_require__) {

	var cloneArrayBuffer = __webpack_require__(100);

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

	module.exports = cloneDataView;


/***/ },
/* 366 */
/***/ function(module, exports, __webpack_require__) {

	var addMapEntry = __webpack_require__(345),
	    arrayReduce = __webpack_require__(137),
	    mapToArray = __webpack_require__(403);

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

	module.exports = cloneMap;


/***/ },
/* 367 */
/***/ function(module, exports) {

	/** Used to match `RegExp` flags from their coerced string values. */
	var reFlags = /\w*$/;

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

	module.exports = cloneRegExp;


/***/ },
/* 368 */
/***/ function(module, exports, __webpack_require__) {

	var addSetEntry = __webpack_require__(346),
	    arrayReduce = __webpack_require__(137),
	    setToArray = __webpack_require__(406);

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

	module.exports = cloneSet;


/***/ },
/* 369 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(135);

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

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

	module.exports = cloneSymbol;


/***/ },
/* 370 */
/***/ function(module, exports, __webpack_require__) {

	var cloneArrayBuffer = __webpack_require__(100);

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

	module.exports = cloneTypedArray;


/***/ },
/* 371 */
/***/ function(module, exports) {

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

	module.exports = copyArray;


/***/ },
/* 372 */
/***/ function(module, exports, __webpack_require__) {

	var copyObject = __webpack_require__(101),
	    getSymbols = __webpack_require__(139);

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

	module.exports = copySymbols;


/***/ },
/* 373 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(29);

	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];

	module.exports = coreJsData;


/***/ },
/* 374 */
/***/ function(module, exports, __webpack_require__) {

	var baseRest = __webpack_require__(361),
	    isIterateeCall = __webpack_require__(390);

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

	module.exports = createAssigner;


/***/ },
/* 375 */
/***/ function(module, exports, __webpack_require__) {

	var flatten = __webpack_require__(416),
	    overRest = __webpack_require__(142),
	    setToString = __webpack_require__(143);

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

	module.exports = flatRest;


/***/ },
/* 376 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	module.exports = freeGlobal;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 377 */
/***/ function(module, exports, __webpack_require__) {

	var baseGetAllKeys = __webpack_require__(355),
	    getSymbols = __webpack_require__(139),
	    keys = __webpack_require__(71);

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

	module.exports = getAllKeys;


/***/ },
/* 378 */
/***/ function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(102);

	/** Built-in value references. */
	var getPrototype = overArg(Object.getPrototypeOf, Object);

	module.exports = getPrototype;


/***/ },
/* 379 */
/***/ function(module, exports, __webpack_require__) {

	var DataView = __webpack_require__(337),
	    Map = __webpack_require__(98),
	    Promise = __webpack_require__(340),
	    Set = __webpack_require__(341),
	    WeakMap = __webpack_require__(344),
	    baseGetTag = __webpack_require__(356),
	    toSource = __webpack_require__(144);

	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';

	var dataViewTag = '[object DataView]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);

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

	module.exports = getTag;


/***/ },
/* 380 */
/***/ function(module, exports) {

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

	module.exports = getValue;


/***/ },
/* 381 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(69);

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

	module.exports = hashClear;


/***/ },
/* 382 */
/***/ function(module, exports) {

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

	module.exports = hashDelete;


/***/ },
/* 383 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(69);

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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

	module.exports = hashGet;


/***/ },
/* 384 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(69);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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

	module.exports = hashHas;


/***/ },
/* 385 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(69);

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

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

	module.exports = hashSet;


/***/ },
/* 386 */
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

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

	module.exports = initCloneArray;


/***/ },
/* 387 */
/***/ function(module, exports, __webpack_require__) {

	var cloneArrayBuffer = __webpack_require__(100),
	    cloneDataView = __webpack_require__(365),
	    cloneMap = __webpack_require__(366),
	    cloneRegExp = __webpack_require__(367),
	    cloneSet = __webpack_require__(368),
	    cloneSymbol = __webpack_require__(369),
	    cloneTypedArray = __webpack_require__(370);

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';

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

	module.exports = initCloneByTag;


/***/ },
/* 388 */
/***/ function(module, exports, __webpack_require__) {

	var baseCreate = __webpack_require__(353),
	    getPrototype = __webpack_require__(378),
	    isPrototype = __webpack_require__(141);

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

	module.exports = initCloneObject;


/***/ },
/* 389 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(135),
	    isArguments = __webpack_require__(147),
	    isArray = __webpack_require__(70);

	/** Built-in value references. */
	var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

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

	module.exports = isFlattenable;


/***/ },
/* 390 */
/***/ function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(103),
	    isArrayLike = __webpack_require__(104),
	    isIndex = __webpack_require__(140),
	    isObject = __webpack_require__(52);

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

	module.exports = isIterateeCall;


/***/ },
/* 391 */
/***/ function(module, exports) {

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

	module.exports = isKeyable;


/***/ },
/* 392 */
/***/ function(module, exports, __webpack_require__) {

	var coreJsData = __webpack_require__(373);

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());

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

	module.exports = isMasked;


/***/ },
/* 393 */
/***/ function(module, exports) {

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

	module.exports = listCacheClear;


/***/ },
/* 394 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(67);

	/** Used for built-in method references. */
	var arrayProto = Array.prototype;

	/** Built-in value references. */
	var splice = arrayProto.splice;

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

	module.exports = listCacheDelete;


/***/ },
/* 395 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(67);

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

	module.exports = listCacheGet;


/***/ },
/* 396 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(67);

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

	module.exports = listCacheHas;


/***/ },
/* 397 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(67);

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

	module.exports = listCacheSet;


/***/ },
/* 398 */
/***/ function(module, exports, __webpack_require__) {

	var Hash = __webpack_require__(338),
	    ListCache = __webpack_require__(66),
	    Map = __webpack_require__(98);

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

	module.exports = mapCacheClear;


/***/ },
/* 399 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(68);

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

	module.exports = mapCacheDelete;


/***/ },
/* 400 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(68);

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

	module.exports = mapCacheGet;


/***/ },
/* 401 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(68);

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

	module.exports = mapCacheHas;


/***/ },
/* 402 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(68);

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

	module.exports = mapCacheSet;


/***/ },
/* 403 */
/***/ function(module, exports) {

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

	module.exports = mapToArray;


/***/ },
/* 404 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(42);

	/* Built-in method references that are verified to be native. */
	var nativeDefineProperty = getNative(Object, 'defineProperty');

	module.exports = nativeDefineProperty;


/***/ },
/* 405 */
/***/ function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(102);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg(Object.keys, Object);

	module.exports = nativeKeys;


/***/ },
/* 406 */
/***/ function(module, exports) {

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

	module.exports = setToArray;


/***/ },
/* 407 */
/***/ function(module, exports) {

	/** Used to detect hot functions by number of calls within a span of milliseconds. */
	var HOT_COUNT = 500,
	    HOT_SPAN = 16;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeNow = Date.now;

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

	module.exports = shortOut;


/***/ },
/* 408 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(66);

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

	module.exports = stackClear;


/***/ },
/* 409 */
/***/ function(module, exports) {

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

	module.exports = stackDelete;


/***/ },
/* 410 */
/***/ function(module, exports) {

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

	module.exports = stackGet;


/***/ },
/* 411 */
/***/ function(module, exports) {

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

	module.exports = stackHas;


/***/ },
/* 412 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(66),
	    Map = __webpack_require__(98),
	    MapCache = __webpack_require__(339);

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

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

	module.exports = stackSet;


/***/ },
/* 413 */
/***/ function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(420);

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

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

	module.exports = toKey;


/***/ },
/* 414 */
/***/ function(module, exports, __webpack_require__) {

	var copyObject = __webpack_require__(101),
	    createAssigner = __webpack_require__(374),
	    keys = __webpack_require__(71);

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

	module.exports = assignWith;


/***/ },
/* 415 */
/***/ function(module, exports) {

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

	module.exports = constant;


/***/ },
/* 416 */
/***/ function(module, exports, __webpack_require__) {

	var baseFlatten = __webpack_require__(354);

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

	module.exports = flatten;


/***/ },
/* 417 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(104),
	    isObjectLike = __webpack_require__(149);

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

	module.exports = isArrayLikeObject;


/***/ },
/* 418 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(29),
	    stubFalse = __webpack_require__(423);

	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

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

	module.exports = isBuffer;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(426)(module)))

/***/ },
/* 419 */
/***/ function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

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

	module.exports = isLength;


/***/ },
/* 420 */
/***/ function(module, exports, __webpack_require__) {

	var isObjectLike = __webpack_require__(149);

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

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

	module.exports = isSymbol;


/***/ },
/* 421 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(350),
	    basePick = __webpack_require__(359),
	    flatRest = __webpack_require__(375),
	    toKey = __webpack_require__(413);

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

	module.exports = pick;


/***/ },
/* 422 */
/***/ function(module, exports) {

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

	module.exports = stubArray;


/***/ },
/* 423 */
/***/ function(module, exports) {

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

	module.exports = stubFalse;


/***/ },
/* 424 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 425 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {/**
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
	 * additional grant of patent rights can be found in the PATENTS file in
	 * the same directory.
	 */

	!(function(global) {
	  "use strict";

	  var hasOwn = Object.prototype.hasOwnProperty;
	  var undefined; // More compressible than void 0.
	  var $Symbol = typeof Symbol === "function" ? Symbol : {};
	  var iteratorSymbol = $Symbol.iterator || "@@iterator";
	  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	  var inModule = typeof module === "object";
	  var runtime = global.regeneratorRuntime;
	  if (runtime) {
	    if (inModule) {
	      // If regeneratorRuntime is defined globally and we're in a module,
	      // make the exports object identical to regeneratorRuntime.
	      module.exports = runtime;
	    }
	    // Don't bother evaluating the rest of this file if the runtime was
	    // already defined globally.
	    return;
	  }

	  // Define the runtime globally (as expected by generated code) as either
	  // module.exports (if we're in a module) or a new, empty object.
	  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    // If outerFn provided, then outerFn.prototype instanceof Generator.
	    var generator = Object.create((outerFn || Generator).prototype);
	    var context = new Context(tryLocsList || []);

	    // The ._invoke method unifies the implementations of the .next,
	    // .throw, and .return methods.
	    generator._invoke = makeInvokeMethod(innerFn, self, context);

	    return generator;
	  }
	  runtime.wrap = wrap;

	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }

	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";

	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};

	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}

	  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

	  // Helper for defining the .next, .throw, and .return methods of the
	  // Iterator interface in terms of a single ._invoke method.
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function(method) {
	      prototype[method] = function(arg) {
	        return this._invoke(method, arg);
	      };
	    });
	  }

	  runtime.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        // For the native GeneratorFunction constructor, the best we can
	        // do is to check its .name property.
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };

	  runtime.mark = function(genFun) {
	    if (Object.setPrototypeOf) {
	      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	      if (!(toStringTagSymbol in genFun)) {
	        genFun[toStringTagSymbol] = "GeneratorFunction";
	      }
	    }
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };

	  // Within the body of any async function, `await x` is transformed to
	  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	  // `value instanceof AwaitArgument` to determine if the yielded value is
	  // meant to be awaited. Some may consider the name of this method too
	  // cutesy, but they are curmudgeons.
	  runtime.awrap = function(arg) {
	    return new AwaitArgument(arg);
	  };

	  function AwaitArgument(arg) {
	    this.arg = arg;
	  }

	  function AsyncIterator(generator) {
	    function invoke(method, arg, resolve, reject) {
	      var record = tryCatch(generator[method], generator, arg);
	      if (record.type === "throw") {
	        reject(record.arg);
	      } else {
	        var result = record.arg;
	        var value = result.value;
	        if (value instanceof AwaitArgument) {
	          return Promise.resolve(value.arg).then(function(value) {
	            invoke("next", value, resolve, reject);
	          }, function(err) {
	            invoke("throw", err, resolve, reject);
	          });
	        }

	        return Promise.resolve(value).then(function(unwrapped) {
	          // When a yielded Promise is resolved, its final value becomes
	          // the .value of the Promise<{value,done}> result for the
	          // current iteration. If the Promise is rejected, however, the
	          // result for this iteration will be rejected with the same
	          // reason. Note that rejections of yielded Promises are not
	          // thrown back into the generator function, as is the case
	          // when an awaited Promise is rejected. This difference in
	          // behavior between yield and await is important, because it
	          // allows the consumer to decide what to do with the yielded
	          // rejection (swallow it and continue, manually .throw it back
	          // into the generator, abandon iteration, whatever). With
	          // await, by contrast, there is no opportunity to examine the
	          // rejection reason outside the generator function, so the
	          // only option is to throw it from the await expression, and
	          // let the generator function handle the exception.
	          result.value = unwrapped;
	          resolve(result);
	        }, reject);
	      }
	    }

	    if (typeof process === "object" && process.domain) {
	      invoke = process.domain.bind(invoke);
	    }

	    var previousPromise;

	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return new Promise(function(resolve, reject) {
	          invoke(method, arg, resolve, reject);
	        });
	      }

	      return previousPromise =
	        // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(
	          callInvokeWithMethodAndArg,
	          // Avoid propagating failures to Promises returned by later
	          // invocations of the iterator.
	          callInvokeWithMethodAndArg
	        ) : callInvokeWithMethodAndArg();
	    }

	    // Define the unified helper method that is used to implement .next,
	    // .throw, and .return (see defineIteratorMethods).
	    this._invoke = enqueue;
	  }

	  defineIteratorMethods(AsyncIterator.prototype);

	  // Note that simple async functions are implemented on top of
	  // AsyncIterator objects; they just return a Promise for the value of
	  // the final result produced by the iterator.
	  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
	    var iter = new AsyncIterator(
	      wrap(innerFn, outerFn, self, tryLocsList)
	    );

	    return runtime.isGeneratorFunction(outerFn)
	      ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function(result) {
	          return result.done ? result.value : iter.next();
	        });
	  };

	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;

	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }

	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }

	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }

	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          if (method === "return" ||
	              (method === "throw" && delegate.iterator[method] === undefined)) {
	            // A return or throw (when the delegate iterator has no throw
	            // method) always terminates the yield* loop.
	            context.delegate = null;

	            // If the delegate iterator has a return method, give it a
	            // chance to clean up.
	            var returnMethod = delegate.iterator["return"];
	            if (returnMethod) {
	              var record = tryCatch(returnMethod, delegate.iterator, arg);
	              if (record.type === "throw") {
	                // If the return method threw an exception, let that
	                // exception prevail over the original return or throw.
	                method = "throw";
	                arg = record.arg;
	                continue;
	              }
	            }

	            if (method === "return") {
	              // Continue with the outer return, now that the delegate
	              // iterator has been terminated.
	              continue;
	            }
	          }

	          var record = tryCatch(
	            delegate.iterator[method],
	            delegate.iterator,
	            arg
	          );

	          if (record.type === "throw") {
	            context.delegate = null;

	            // Like returning generator.throw(uncaught), but without the
	            // overhead of an extra function call.
	            method = "throw";
	            arg = record.arg;
	            continue;
	          }

	          // Delegate generator ran and handled its own exceptions so
	          // regardless of what the method was, we continue as if it is
	          // "next" with an undefined arg.
	          method = "next";
	          arg = undefined;

	          var info = record.arg;
	          if (info.done) {
	            context[delegate.resultName] = info.value;
	            context.next = delegate.nextLoc;
	          } else {
	            state = GenStateSuspendedYield;
	            return info;
	          }

	          context.delegate = null;
	        }

	        if (method === "next") {
	          // Setting context._sent for legacy support of Babel's
	          // function.sent implementation.
	          context.sent = context._sent = arg;

	        } else if (method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw arg;
	          }

	          if (context.dispatchException(arg)) {
	            // If the dispatched exception was caught by a catch block,
	            // then let that catch block handle the exception normally.
	            method = "next";
	            arg = undefined;
	          }

	        } else if (method === "return") {
	          context.abrupt("return", arg);
	        }

	        state = GenStateExecuting;

	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;

	          var info = {
	            value: record.arg,
	            done: context.done
	          };

	          if (record.arg === ContinueSentinel) {
	            if (context.delegate && method === "next") {
	              // Deliberately forget the last sent value so that we don't
	              // accidentally pass it on to the delegate.
	              arg = undefined;
	            }
	          } else {
	            return info;
	          }

	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          // Dispatch the exception by looping back around to the
	          // context.dispatchException(arg) call above.
	          method = "throw";
	          arg = record.arg;
	        }
	      }
	    };
	  }

	  // Define Generator.prototype.{next,throw,return} in terms of the
	  // unified ._invoke helper method.
	  defineIteratorMethods(Gp);

	  Gp[iteratorSymbol] = function() {
	    return this;
	  };

	  Gp[toStringTagSymbol] = "Generator";

	  Gp.toString = function() {
	    return "[object Generator]";
	  };

	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };

	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }

	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }

	    this.tryEntries.push(entry);
	  }

	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }

	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }

	  runtime.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();

	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }

	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };

	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }

	      if (typeof iterable.next === "function") {
	        return iterable;
	      }

	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }

	          next.value = undefined;
	          next.done = true;

	          return next;
	        };

	        return next.next = next;
	      }
	    }

	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  runtime.values = values;

	  function doneResult() {
	    return { value: undefined, done: true };
	  }

	  Context.prototype = {
	    constructor: Context,

	    reset: function(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      // Resetting context._sent for legacy support of Babel's
	      // function.sent implementation.
	      this.sent = this._sent = undefined;
	      this.done = false;
	      this.delegate = null;

	      this.tryEntries.forEach(resetTryEntry);

	      if (!skipTempReset) {
	        for (var name in this) {
	          // Not sure about the optimal order of these conditions:
	          if (name.charAt(0) === "t" &&
	              hasOwn.call(this, name) &&
	              !isNaN(+name.slice(1))) {
	            this[name] = undefined;
	          }
	        }
	      }
	    },

	    stop: function() {
	      this.done = true;

	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }

	      return this.rval;
	    },

	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }

	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;
	        return !!caught;
	      }

	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;

	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }

	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");

	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }

	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },

	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }

	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg <= finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }

	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;

	      if (finallyEntry) {
	        this.next = finallyEntry.finallyLoc;
	      } else {
	        this.complete(record);
	      }

	      return ContinueSentinel;
	    },

	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }

	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = record.arg;
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }
	    },

	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },

	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }

	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },

	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };

	      return ContinueSentinel;
	    }
	  };
	})(
	  // Among the various tricks for obtaining a reference to the global
	  // object, this seems to be the most reliable technique that does not
	  // use indirect eval (which violates Content Security Policy).
	  typeof global === "object" ? global :
	  typeof window === "object" ? window :
	  typeof self === "object" ? self : this
	);

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(424)))

/***/ },
/* 426 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ])
});
;
//# sourceMappingURL=phasematch.js.map