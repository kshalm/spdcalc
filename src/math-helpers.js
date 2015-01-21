/**
 * General internal math helper functions
 */

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