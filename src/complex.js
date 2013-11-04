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
    if (!(this instanceof Complex)) return new Complex(re, im);
    
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
        if (!k) k = 0;
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
        if (polar) return this.magnitude() + ' ' + this.angle();

        var ret = ''
            ,re = this._[0]
            ,im = this._[1]
            ;
        if (re) ret += re;
        if (re && im || im < 0) ret += im < 0 ? '-' : '+';
        if (im){
            var absIm = abs(im);
            if (absIm !== 1) ret += absIm;
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
        if (real instanceof Complex) return real.clone();
        var type = typeof real;
        if (type === 'string'){
            if (real === 'i') real = '0+1i';
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

for (var e in extend) Complex[e] = extend[e];

return Complex;

})();
