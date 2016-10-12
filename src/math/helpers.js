/**
 * General internal math helper functions
 */
var helpers = {};

var sq = helpers.sq = function sq( x ){
    return x * x;
    // return Math.pow(x,2);
};

/*
 * A series of helper functions
 */
helpers.Sum = function Sum(A){
    var total=0;
    var l = A.length;
    for(var i=0; i<l; i++) {
        total += A[i];
    }
    return total;
};

/*
 * Reverses a typed array
 */
helpers.reverse = function reverse(A){
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

helpers.Transpose = function Transpose(A, dim){
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

helpers.AntiTranspose = function Transpose(A, dim){
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

helpers.linspace = function linspace(xstart,xstop,npts){
    var A = new Float64Array(npts);
    var diff = (xstop-xstart)/(npts-1);
    var curVal = 0;
    for (var i=0; i<npts; i++){
        A[i] = xstart + i*diff;
    }
    return A;
};

helpers.create_2d_array = function create_2d_array(data, dimx, dimy){
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

helpers.create_2d_array_view = function create_2d_array_view(data, dimx, dimy){
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

helpers.zeros = function zeros(dimx, dimy){
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
helpers.normalize = function normalize(data){
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
helpers.normalizeToVal = function normalizeToVal(data,maxval){
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
helpers.max = function max(data){
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
helpers.NintegrateWeights = function NintegrateWeights(n){
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
helpers.Nintegrate2arg = function Nintegrate2arg(f,a,b,dx,n,w){
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
helpers.Nintegrate = function Nintegrate(f,a,b,n){
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
helpers.Nintegrate2DWeights = function Nintegrate2DWeights(n){

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
helpers.Nintegrate2D = function Nintegrate2D(f,a,b,c,d,n,w){
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

helpers.Nintegrate2DModeSolver = function Nintegrate2DModeSolver(f,a,b,c,d,n,w){

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
helpers.Nintegrate2DWeights_3_8 = function Nintegrate2DWeights_3_8(n){
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
helpers.Nintegrate2D_3_8 = function Nintegrate2D_3_8(f,a,b,c,d,n,w){
    var weights;
    // n = n+(3- n%3); //guarantee that n is divisible by 3

    if (w === null || w === undefined){
      weights = helpers.Nintegrate2DWeights_3_8(n);

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
helpers.Nintegrate2D_3_8_singles = function Nintegrate2D_3_8_singles(f, fz1 ,a,b,c,d,n,w){
    var weights = w;
    // n = n+(3- n%3); //guarantee that n is divisible by 3

    var  dx = (b-a)/n
        ,dy = (d-c)/n
        ,result1 = 0
        ,result2 = 0
        ,scale = dx * dy * 9/64
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

    return [result1*scale, result2*scale];

};


helpers.RiemannSum2D = function RiemannSum2D(f, a, b, c, d, n){
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
helpers.cmultiplyR = function cmultiplyR(a,b,c,d){
    return a*c - b*d;
};

helpers.cmultiplyI = function cmultiplyI(a,b,c,d){
    return a*d + b*c;
};

helpers.cdivideR = function cdivideR(a,b,c,d){
    return (a*c+b*d)/((c*c)+(d*d));
};

helpers.cdivideI = function cdivideI(a,b,c,d){
    return (b*c-a*d)/((c*c)+(d*d));
};

helpers.caddR = function caddR(a,ai,b,bi){
    return a+b;
};

helpers.caddI = function caddI(a,ai,b,bi){
    return ai+bi;
};

// Returns real part of the principal square root of a complex number
helpers.csqrtR = function csqrtR(a,ai){
    // var rSqrt = Math.sqrt(Math.sqrt((a*a)+(ai*ai)));
    // var arg = Math.atan2(ai,a)*0.5;
    // var real = rSqrt*Math.cos(arg);
    // // return real;
    // return helpers.sign(real)*real; //returns the real value
    var r = Math.sqrt((a*a)+(ai*ai));
    var realNum = a + r;
    var real = realNum / Math.sqrt(2*realNum);
    return real;
};

// Returns imag part of the principal square root of a complex number
helpers.csqrtI = function csqrtI(a,ai){
    // var rSqrt = Math.sqrt(Math.sqrt((a*a)+(ai*ai)));
    // var arg = Math.atan2(ai,a)*.5;
    // var real = rSqrt*Math.cos(arg);
    // var imag = rSqrt*Math.sin(arg);
    // // return imag;
    // return helpers.sign(real)*imag; //returns the imag value

    var r = Math.sqrt((a*a)+(ai*ai));
    var realNum = a + r;
    var imag = ai / Math.sqrt(2*realNum);
    return imag;
};

// Returns imag part of the principal square root of a complex number
helpers.csqrt = function csqrt(a,ai){
    // var rSqrt = Math.sqrt(Math.sqrt((a*a)+(ai*ai)));
    // var arg = Math.atan2(ai,a)*.5;
    // var real = rSqrt*Math.cos(arg);
    // var imag = rSqrt*Math.sin(arg);
    // // return imag;
    // return helpers.sign(real)*imag; //returns the imag value

    var r = Math.sqrt((a*a)+(ai*ai));
    var realNum = a + r;
    var imag = ai / Math.sqrt(2*realNum);
    var real = realNum / Math.sqrt(2*realNum);
    return [real,imag];
};

// http://jsperf.com/signs/3
helpers.sign = function sign(x) {
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
};

module.exports = helpers;
