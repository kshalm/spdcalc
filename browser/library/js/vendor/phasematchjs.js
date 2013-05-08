/**
 * phasematchjs v0.0.1a - 2013-05-08
 *  ENTER_DESCRIPTION 
 *
 * Copyright (c) 2013 Krister Shalm <kshalm@gmail.com>
 * Licensed GPLv3
 */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node.
        module.exports = factory(require('numeric'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['numeric'], factory);
    } else {
        // Browser globals (root is window)
        root.PhaseMatch = factory(root.numeric);
    }
}(this, function( numeric ) {

'use strict';
var PhaseMatch = { util: {} };

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

    PhaseMatch.svdcmp = function(a, m, n, w, v){
      var flag, i, its, j, jj, k, l, nm,
          anorm = 0.0, c, f, g = 0.0, h, s, scale = 0.0, x, y, z, rv1 = [];
          
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
              for (j = 1; j <= m; ++ j){
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

      return true;
    };
})();
/**
 * BBO indicies. This is a test object that returns the index of refraction
 * for BBO. Eventually this will be called from the crystal database, but 
 * it is useful to have here for now.
 * @class BBO
 * @param {Array} temp [description]
 */
PhaseMatch.BBO = function BBO (temp) {
    //Selmeir coefficients for nx, ny, nz
    this.temp = temp;
    // this.lambda = lambda
};

PhaseMatch.BBO.prototype  = {
    indicies:function(lambda){
        lambda = lambda * Math.pow(10,6); //Convert for Sellmeir Coefficients
        var no = Math.sqrt(2.7359 + 0.01878/ (sq(lambda) - 0.01822) - 0.01354*sq(lambda));
        var ne = Math.sqrt(2.3753 + 0.01224 / (sq(lambda) - 0.01667) - 0.01516*sq(lambda));

        return [no, no, ne];
    }
};


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
    // console.log("going into calc_delK");
    // console.log("Index of refraction inside calc_delk", P.lambda_s, n_s, n_i, n_p);
    // Directions of the signal and idler photons in the pump coordinates
    var Ss = [Math.sin(P.theta_s)*Math.cos(P.phi_s), Math.sin(P.theta_s)*Math.sin(P.phi_s), Math.cos(P.theta_s)];
    var Si = [Math.sin(P.theta_i)*Math.cos(P.phi_i), Math.sin(P.theta_i)*Math.sin(P.phi_i), Math.cos(P.theta_i)];
    // console.log("SS, SI", Ss, Si);
    // console.log("");

    var delKx = (2*Math.PI*((n_s*Ss[0]/P.lambda_s) + n_i*Si[0]/P.lambda_i));
    var delKy = (2*Math.PI*((n_s*Ss[1]/P.lambda_s) + n_i*Si[1]/P.lambda_i));
    var delKz = (2*Math.PI*(n_p/P.lambda_p - (n_s*Ss[2]/P.lambda_s) - n_i*Si[2]/P.lambda_i));
    delKz = delKz -2*Math.PI/P.poling_period;

    return [delKx, delKy, delKz];

};

/*
 * optimum_idler()
 * Analytically calcualte optimum idler photon wavelength
 * All angles in radians.
 */
PhaseMatch.optimum_idler = function optimum_idler(P){//crystal, Type,  lambda_p, lambda_s, theta_s, phi_s, theta, phi, poling_period){
    // var lambda_i = 1/(1/lambda_p - 1/lambda_s);
    // P.phi_i = P.phi_s + Math.PI;

    var delKpp = P.lambda_s/P.poling_period;

    var arg = sq(P.n_s) + sq(P.n_p*P.lambda_s/P.lambda_p);    
    arg -= 2*P.n_s*P.n_p*(P.lambda_s/P.lambda_p)*Math.cos(P.theta_s) - 2*P.n_p*P.lambda_s/P.lambda_p*delKpp;
    arg += 2*P.n_s*Math.cos(P.theta_s)*delKpp + sq(delKpp);
    arg = Math.sqrt(arg);

    var arg2 = P.n_s*Math.sin(P.theta_s)/arg;

    var theta_i = Math.asin(arg2);
    // return theta_i;
    P.theta_i = theta_i;
    //Update the index of refraction for the idler
    P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
    P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");
};

/*
 * phasematch()
 * Gets the index of refraction depending on phasematching type
 * P is SPDC Properties object
 */
PhaseMatch.phasematch = function phasematch (P){
    var con = PhaseMatch.constants;
    var lambda_p = P.lambda_p; //store the original lambda_p
    var n_p = P.n_p;
    var p_bw = 2*Math.PI*con.c/sq(lambda_p) *P.p_bw * n_p; //convert from wavelength to w 

    P.lambda_p = 1/(1/P.lambda_s+1/P.lambda_i);
    P.n_p = P.calc_Index_PMType(P.lambda_p, P.Type, P.S_p, "pump");

    var delK = PhaseMatch.calc_delK(P);
    
    P.lambda_p = lambda_p; //set back to the original lambda_p
    P.n_p = n_p;
    // P.calc_Index_PMType(P.lambda_p, P.Type, P.S_p, "pump");
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
    var PMz_real =  PMz * Math.cos(arg);
    var PMz_imag = PMz * Math.sin(arg);

    // Phasematching along transverse directions
    // np.exp(-.5*(delKx**2 + delKy**2)*W**2)
    var PMt = Math.exp(-0.5*(sq(delK[0]) + sq(delK[1]))*sq(P.W));

    // Calculate the Pump spectrum
    // convert pump bandwidth from FWHM to standard deviation
    // p_bw = p_bw / 2.35482;
    var alpha = Math.exp(-1*sq(2*Math.PI*con.c*( ( P.n_s/P.lambda_s + P.n_i/P.lambda_i +1/P.poling_period - P.n_p/lambda_p) )/(p_bw)));
    // var alpha = 1;
    // PMt = 1;
    // PMz_real = 1;
    // PMz_imag = 0;

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
    // var PM = PhaseMatch.phasematch(P, P.crystal, P.Type, P.lambda_p, P.p_bw, P.W, P.lambda_s, P.lambda_i, P.L, P.theta, P.phi, P.theta_s, P.theta_i, P.phi_s, P.phi_i, P.poling_period, P.phase, P.apodization ,P.apodization_FWHM);
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


(function(){

    // /**
    //  * Rotation object
    //  */
    // var Rotation = function(){

    //     this.Sx = 0;
    //     this.Sy = 0;
    //     this.Sz = 0;
    // };

    // Rotation.prototype = {

    //     set: function( theta, phi, theta_s, phi_s ){

    //         // First get the ransfomration to lambda_p coordinates
    //         var S_x = Math.sin(theta_s)*Math.cos(phi_s);
    //         var S_y = Math.sin(theta_s)*Math.sin(phi_s);
    //         var S_z = Math.cos(theta_s);

    //         // Transform from the lambda_p coordinates to crystal coordinates
    //         var SR_x = Math.cos(theta)*Math.cos(phi)*S_x - Math.sin(phi)*S_y + Math.sin(theta)*Math.cos(phi)*S_z;
    //         var SR_y = Math.cos(theta)*Math.sin(phi)*S_x + Math.cos(phi)*S_y + Math.sin(theta)*Math.sin(phi)*S_z;
    //         var SR_z = -Math.sin(theta)*S_x  + Math.cos(theta)*S_z;
            
    //         // Normalambda_ize the unit vector
    //         // FIX ME: When theta = 0, Norm goes to infinity. This messes up the rest of the calculations. In this
    //         // case I think the correct behaviour is for Norm = 1 ?
    //         var Norm =  Math.sqrt(sq(S_x) + sq(S_y) + sq(S_z));
    //         this.Sx = SR_x/(Norm);
    //         this.Sy = SR_y/(Norm);
    //         this.Sz = SR_z/(Norm);
    //     }
    // };

    // PhaseMatch.Rotation = Rotation;

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
            this.lambda_p = 775 * con.nm;
            this.lambda_s = 1550 * con.nm;
            this.lambda_i = 1550 * con.nm;
            this.Types = ["o -> o + o", "e -> o + o", "e -> e + o", "e -> o + e"];
            this.Type = this.Types[2];
            this.theta = 19.8371104525 *Math.PI / 180;
            // this.theta = 19.2371104525 *Math.PI / 180;
            this.phi = 0;
            this.theta_s = 1 * Math.PI / 180;
            this.theta_i = this.theta_s;
            this.phi_s = 0;
            this.phi_i = this.phi_s + Math.PI;
            this.poling_period = 1000000;
            this.L = 2000 * con.um;
            this.W = 1* con.um;
            this.p_bw = 15 * con.nm;
            this.phase = false;
            this.apodization = 1;
            this.apodization_FWHM = 1000 * con.um;
            this.crystal = new PhaseMatch.BBO();
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
            var ind = this.crystal.indicies(lambda);

            var nx = ind[0];
            var ny = ind[1];
            var nz = ind[2];

            var Sx = S[0];
            var Sy = S[1];
            var Sz = S[2];

            var B = sq(Sx) * (1/sq(ny) + 1/sq(nz)) + sq(Sy) *(1/sq(nx) + 1/sq(nz)) + sq(Sz) *(1/sq(nx) + 1/sq(ny));
            var C = sq(Sx) / (sq(ny) * sq(nz)) + sq(Sy) /(sq(nx) * sq(nz)) + sq(Sz) / (sq(nx) * sq(ny));
            var D = sq(B) - 4 * C;

            var nslow = Math.sqrt(2/ (B + Math.sqrt(D)));
            var nfast = Math.sqrt(2/ (B - Math.sqrt(D)));
            //nfast = o, nslow = e

            var n = 1;

            switch (Type){

                case "e -> o + o":
                    if (photon === "pump") { n = nslow;}
                    else { n = nfast;}
                break;
                case "e -> e + o":
                    if (photon === "idler") { n = nfast;}
                    else {n = nslow;}
                break;
                case "e -> o + e":
                    if (photon === "signal") { n = nfast;}
                    else {n = nslow;}
                break;
                default:
                    throw "Error: bad PMType specified";
            }

            return n ;
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

    //
    // @TODO: Jasper suggests moving these into the props object
    // itself ( thereby making this a more object oriented approach )
    // 
    // Ex: props.auto_calc_Theta();
    // 
    // inside functions you just need to change:
    // function auto_calc_Theta( props )
    // to
    // function auto_calc_Theta(){
    //     var props = this;
    //     ...
    // }
    // 
    PhaseMatch.auto_calc_Theta = function auto_calc_Theta(props){
        var min_delK = function(x){
            if (x>Math.PI/2 || x<0){return 1e12;}
            props.theta = x;
            props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
            props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);
            props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);

            props.n_p = props.calc_Index_PMType(props.lambda_p, props.Type, props.S_p, "pump");
            props.n_s = props.calc_Index_PMType(props.lambda_s, props.Type, props.S_s, "signal");
            props.n_i = props.calc_Index_PMType(props.lambda_i, props.Type, props.S_i, "idler");

            var delK =  PhaseMatch.calc_delK(props);
            // console.log("in the function", delK)
            return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
        };

        var guess = Math.PI/8;
        var startTime = new Date();

        var ans = PhaseMatch.nelderMead(min_delK, guess, 1000);
        // var ans = numeric.uncmin(min_delK, [guess]).solution[0];
        var endTime = new Date();
        

        var timeDiff = (endTime - startTime)/1000;
        console.log("Theta autocalc = ", timeDiff);
        props.theta = ans;
    };

    PhaseMatch.brute_force_theta_i = function brute_force_theta_i(props){
        var min_PM = function(x){
            if (x>Math.PI/2 || x<0){return 1e12;}
            props.theta_i = x;
            // props.S_p = props.calc_Coordinate_Transform(props.theta, props.phi, 0, 0);
            // props.S_s = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_s, props.phi_s);
            props.S_i = props.calc_Coordinate_Transform(props.theta, props.phi, props.theta_i, props.phi_i);

            // props.n_p = props.calc_Index_PMType(props.lambda_p, props.Type, props.S_p, "pump");
            // props.n_s = props.calc_Index_PMType(props.lambda_s, props.Type, props.S_s, "signal");
            props.n_i = props.calc_Index_PMType(props.lambda_i, props.Type, props.S_i, "idler");

            var PMtmp =  PhaseMatch.phasematch_Int_Phase(props);
            // console.log("in the function", delK)
            return 1-PMtmp;
        };

        //Initial guess
        PhaseMatch.optimum_idler(props);
        var guess = props.theta_i;
        // var startTime = new Date();

        var ans = PhaseMatch.nelderMead(min_PM, guess, 100);
        // var ans = numeric.uncmin(min_delK, [guess]).solution[0];
        // var endTime = new Date();
        

        // var timeDiff = (endTime - startTime)/1000;
        // console.log("Theta autocalc = ", timeDiff);
        // props.theta_i = ans;
    };
})();


PhaseMatch.calcJSA = function calcJSA(P, ls_start, ls_stop, li_start, li_stop, dim){

    var lambda_s = new Float64Array(dim);
    var lambda_i = new Float64Array(dim);

    var i;
    lambda_s = numeric.linspace(ls_start, ls_stop, dim);
    lambda_i = numeric.linspace(li_stop, li_start, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_s = i % dim;
        var index_i = Math.floor(i / dim);

        P.lambda_s = lambda_s[index_s];
        P.lambda_i = lambda_i[index_i];
        
        // P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        PhaseMatch.optimum_idler(P); //Need to find the optimum idler for each angle.
        // P.n_i = P.calc_Index_PMType(P.lambda_i, P.Type, P.S_i, "idler");

        //calcualte the correct idler angle analytically.
        // PhaseMatch.optimum_idler(P);
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    
    return PM;

};

PhaseMatch.calcXY = function calcXY(P, x_start, x_stop, y_start, y_stop, dim){

    var X = new Float64Array(dim);
    var Y = new Float64Array(dim);

    var i;
    X = numeric.linspace(x_start, x_stop, dim);
    Y = numeric.linspace(y_start, y_stop, dim); 

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    var startTime = new Date();
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_s = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_s = Math.atan2(Y[index_y],X[index_x]);
        P.phi_i = (P.phi_s + Math.PI);
        
        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        // P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.Type, P.S_s, "signal");

        // PhaseMatch.optimum_idler(P); //Need to find the optimum idler for each angle.
        // PhaseMatch.brute_force_theta_i(P); //use a search. could be time consuming.

        //calcualte the correct idler angle analytically.
        PhaseMatch.optimum_idler(P);
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};

PhaseMatch.calc_lambda_s_vs_theta_s = function calc_lambda_s_vs_theta_s(P, l_start, l_stop, t_start, t_stop, dim){

    var lambda_s = new Float64Array(dim);
    var theta_s = new Float64Array(dim);

    var i;
    lambda_s = numeric.linspace(l_start, l_stop, dim);
    theta_s = numeric.linspace(t_stop, t_start, dim); 

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

        PhaseMatch.optimum_idler(P); //Need to find the optimum idler for each angle.
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};

PhaseMatch.calc_theta_phi = function calc_theta_phi(P, t_start, t_stop, p_start, p_stop, dim){

    var theta = new Float64Array(dim);
    var phi = new Float64Array(dim);

    var i;
    theta = numeric.linspace(t_start, t_stop, dim);
    phi = numeric.linspace(p_start, p_stop, dim); 

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
        PhaseMatch.optimum_idler(P);
        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);

    }
    return PM;

};


// def PM_theta_phi(P, x=[-1,-1], y=[-1,-1], initialize= False):

//     pump_bw = 2*np.pi*con.c/(P.lambda_p**2) *P.pump_bw 

//     n_thetas = P.npts
//     n_phis = P.npts
//     if initialize:
//         astart = 0. *np.pi/180
//         astop = 90. *np.pi/180

//         aistart =0. *np.pi/180
//         aistop = 90. *np.pi/180

//     else:
//         astart = x[0]
//         astop = x[1]

//         aistart = y[0]
//         aistop = y[1]

//     theta = np.linspace(astart, astop, n_thetas)
//     phi = np.linspace(aistart, aistop, n_phis)
//     [THETA, PHI] = np.meshgrid(theta,phi)

//     # theta_s = np.arctan((X**2 + Y**2)**.5) 
//     # phi_s = np.arctan(Y/X) 
//     # neg_ind = X <0
//     # phi_s[neg_ind] = phi_s[neg_ind]+np.pi
//     # phi_i = (phi_s +np.pi)

//     theta_i = optimum_idler(P, P.lambda_s, P.theta_s, P.phi_s, THETA,PHI, P.poling_period)
//     PM = phasematch_Int_Phase(P.Type, P.crystal, P.lambda_p, pump_bw, P.W, P.lambda_s, P.lambda_i, P.L ,THETA, PHI, 
//         P.theta_s, theta_i, P.phi_s, P.phi_i, P.calcPhase, P.poling_period, P.apodization, P.apodization_FWHM )
//     # print "Theta s, i", P.theta_s*180/np.pi, P.theta_i*180/np.pi,  np.max(theta_i*180/np.pi)
//     # print
//     return [astart, astop], [aistart, aistop], PM



return PhaseMatch;
}));