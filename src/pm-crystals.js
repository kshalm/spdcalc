/**
 * These are the properties that are used to calculate phasematching
 */


/**
 * BBO indicies. 
 */
PhaseMatch.BBO = function BBO () {
    //Selmeir coefficients for nx, ny, nz
    this.temp = 20;
    this.name = "BBO ref 1";
    this.info = "";
};

PhaseMatch.BBO.prototype  = {
    indicies:function(lambda, temp){
        lambda = lambda * Math.pow(10,6); //Convert for Sellmeir Coefficients
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
};


/**
 * KTP indicies.
 */
PhaseMatch.KTP = function KTP () {
    //Selmeir coefficients for nx, ny, nz
    this.temp = 20;
    this.name = "KTP ref 1";
    // this.info = "H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)";
    this.info = "http://www.redoptronics.com/KTP-crystal.html";
};

PhaseMatch.KTP.prototype  = {
    indicies:function(lambda, temp){
        lambda = lambda * Math.pow(10,6); //Convert for Sellmeir Coefficients

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
};


/**
 * KTP Ref 2 indicies.
 */
PhaseMatch.KTP_2 = function KTP_2 () {
    //Selmeir coefficients for nx, ny, nz
    this.temp = 20;
    this.name = "KTP ref 2";
    // this.info = "H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27, 3314 (1988)";
    this.info = " http://www.castech-us.com/casktp.htm & Newlight Photonics";
};

PhaseMatch.KTP_2.prototype  = {
    indicies:function(lambda, temp){
        lambda = lambda * Math.pow(10,6); //Convert for Sellmeir Coefficients

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
};



/**
 * BiBO indicies.
 */
PhaseMatch.BiBO_1 = function BiBO_1 () {
    //Selmeir coefficients for nx, ny, nz
    this.temp = 20;
    this.name = "BiBO ref 1";
    this.info = "http://www.newlightphotonics.com/bibo-properties.html";
};

PhaseMatch.BiBO_1.prototype  = {
    indicies:function(lambda, temp){
        lambda = lambda * Math.pow(10,6); //Convert for Sellmeir Coefficients
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
};


/**
 * LiNbO3 indicies.
 */
PhaseMatch.LiNbO3_1 = function LiNbO3_1 () {
    //Selmeir coefficients for nx, ny, nz
    this.temp = 20;
    this.name = "LiNbO3 ref 1";
    this.info = "http://www.newlightphotonics.com/bibo-properties.html";
    this.crystal_type = "Negative Uniaxial";
    this.crystal_class = "class_3m";
    this.min_lambda = 0.4*1e-9;
    this.max_lambda = 3.4*1e-9;
};

PhaseMatch.LiNbO3_1.prototype  = {
    indicies:function(lambda, temp){
        lambda = lambda * Math.pow(10,6); //Convert for Sellmeir Coefficients
        //Alan Migdal's program
        var nx = Math.sqrt( 4.9048 - 0.11768/(0.04750 - sq(lambda)) - 0.027169*sq(lambda) );
        var ny = nx;
        var nz = Math.sqrt( 4.5820 - 0.099169/(0.044432 - sq(lambda)) -  0.021950*sq(lambda) );

        //http://www.newlightphotonics.com/LN-crystal.html
        var dnx = -0.874e-6;
        var dny = dnx;
        var dnz = 39.073e-6;

        nx = nx + (temp -20.0)*dnx;
        ny = ny + (temp -20.0)*dny;
        nz = nz + (temp -20.0)*dnz;

        return [nx, ny, nz];
    }
};


/**
* Create the Crystal DB
**/

// var BBO = new PhaseMatch.BBO();
// var KTP = new PhaseMatch.KTP();
PhaseMatch.CrystalDB = {"BBO ref 1": new PhaseMatch.BBO(), 
                        "BiBO ref 1": new PhaseMatch.BiBO_1(),
                        "KTP ref 1": new PhaseMatch.KTP(),
                        "KTP ref 2": new PhaseMatch.KTP_2(),
                        "LiNbO3 ref 1": new PhaseMatch.LiNbO3_1()};

PhaseMatch.CrystalDBKeys = [];

for(var k in PhaseMatch.CrystalDB){
    PhaseMatch.CrystalDBKeys.push(k);
}

// class KTP(Crystal):
//     Name = "KTP"
//     CrystalType = "Biaxial"
//     CrystalClass = "Unknown"
//     MinLambda = 0.35*nm
//     MaxLambda = 4.5*nm
//     # Temp = 70.
//     def Index(self,Lambda,theta):
//         # H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27,
// #       3314 (1988)

//         Lambda=Lambda*10**6

//         # nx = ( 2.1146 + 0.89188/(1 - (0.20861/Lambda)**2) - (0.01320*Lambda**2) )**.5
//         # ny = ( 2.1518 + 0.87862/(1 - (0.21801/Lambda)**2) - (0.01327*Lambda**2) )**.5
//         # nz = ( 2.3136 + 1.00012/(1 - (0.23831/Lambda)**2) - (0.01679*Lambda**2) )**.5
//         #http://www.redoptronics.com/KTP-crystal.html
//         nx=(2.10468 + 0.89342*Lambda**2/(Lambda**2-0.04438)-0.01036*Lambda**2)**.5 
//         ny=(2.14559 + 0.87629*Lambda**2/(Lambda**2-0.0485)-0.01173*Lambda**2)**.5
//         nz=(1.9446 + 1.3617*Lambda**2/(Lambda**2-0.047)-0.01491*Lambda**2)**.5

//         dnx=1.1 *10**(-5)
//         dny=1.3 *10**(-5)
//         dnz=1.6 *10**(-5)

//         nx = nx + (self.Temp -20.)*dnx
//         ny = ny + (self.Temp -20.)*dny
//         nz = nz + (self.Temp -20.)*dnz

//         # http://www.castech-us.com/casktp.htm
//         # nx=(3.0065+0.03901/(Lambda**2-0.04251)-0.01327*Lambda**2)**.5
//         # ny=(3.0333+0.04154/(Lambda**2-0.04547)-0.01408*Lambda**2)**.5
//         # nz=(3.0065+0.05694/(Lambda**2-0.05658)-0.01682*Lambda**2)**.5
//         return nx, ny, nz


// class LiNbO3(Crystal):
//     Name = "LiNbO3"
//     CrystalType = "NegativeUniaxial"
//     CrystalClass = "class_3m"
//     MinLambda = 0.4*nm
//     MaxLambda = 3.4*nm
//     # Temp = 70.

//     def Index(self,Lambda,theta):
//         # H. Vanherzeele, J. D. Bierlein, F. C. Zumsteg, Appl. Opt., 27,
// #       3314 (1988)

//         Lambda=Lambda*10**6

//         nx = ( 4.9048 - 0.11768/(0.04750 - Lambda**2) - 0.027169*Lambda**2 )**.5
//         ny = nx
//         nz = ( 4.5820 - 0.099169/(0.044432 - Lambda**2) -  0.021950*Lambda**2 )**.5

//         # nx = np.sqrt( 1 + 2.6734*Lambda**2/(Lambda**2-0.01764) + 1.2290*Lambda**2/(Lambda**2-0.05914) + 12.614*Lambda**2/(Lambda**2-474.60) )
//         # ny = nx
//         # nz = np.sqrt( 1 + 2.9804*Lambda**2/(Lambda**2-0.02047) + 0.5981*Lambda**2/(Lambda**2-0.0666) + 8.9543*Lambda**2/(Lambda**2-416.08) )

        
//         # nx = nx + (self.Temp -20.)*dnx
//         # ny = ny + (self.Temp -20.)*dny
//         # nz = nz + (self.Temp -20.)*dnz

//         return nx, ny, nz



