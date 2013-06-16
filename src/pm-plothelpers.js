/**
 * Constants accessible to PhaseMatch internally
 */

PhaseMatch.calc_JSA = function calc_JSA(props, ls_start, ls_stop, li_start, li_stop, dim){
    // PhaseMatch.updateallangles(props);
    // console.log("Calculating JSA", props.temp);
    var P = props.clone();
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
        
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

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

    var P = props.clone();
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
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

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

    var P = props.clone();
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
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

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

    var P = props.clone();
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
        P.n_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

        P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

        //calcualte the correct idler angle analytically.
        P.optimum_idler(P);
        // P.calc_wbar();

        PM[i] = PhaseMatch.phasematch_Int_Phase(P);

    }
    return PM;

};

PhaseMatch.calc_signal_theta_phi = function calc_calc_signal_theta_phi(props, x_start, x_stop, y_start, y_stop, dim){

    var P = props.clone();
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
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

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

    var P = props.clone();
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
        P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
        P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

        
        PM[i] = PhaseMatch.phasematch_Int_Phase(P);
        // PM[i] = PhaseMatch.calc_delK(P);

    }
    var endTime = new Date();
    var timeDiff = (endTime - startTime);
    return PM;

};

PhaseMatch.calc_signal_phi_vs_idler_phi = function calc_signal_phi_vs_idler_phi(props, x_start, x_stop, y_start, y_stop, dim){

    var P = props.clone();
    props.update_all_angles(P);

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

        PM[i] = PhaseMatch.phasematch_Int_Phase(P);

    }

    return PM;

};

/* calc_schmidt_plot
* Params is a JSON string of the form { x: "L/W/BW", y:"L/W/BW"}
*/
PhaseMatch.calc_schmidt_plot = function calc_schmidt_plot(props, x_start, x_stop, y_start, y_stop, ls_start, ls_stop, li_start, li_stop, dim, params){

    var P = props.clone();
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
        
        //now calculate the JSA for these values
        var jsa = PhaseMatch.calc_JSA(P, ls_start, ls_stop, li_start, li_stop, dimjsa);
        var jsa2d = PhaseMatch.create_2d_array(jsa, dimjsa, dimjsa);
        S[i] = PhaseMatch.calc_Schmidt(jsa2d);

        if (S[i]<maxschmidt){
            maxschmidt = S[i];
            x_ideal = xrange[index_s];
            y_ideal = yrange[index_i];
        }

        // P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

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
    console.log("Lowest Schmidt = ", maxschmidt, " , X = ", x_ideal, ", Y = ", y_ideal);
    // console.log("HOM dip = ",PhaseMatch.calc_HOM_JSA(P, 0e-15));
    
    return S;

};

PhaseMatch.calc_XY_fixed_idler = function calc_XY_fixed_idler(props, x_start, x_stop, y_start, y_stop, dim){

    var P = props.clone();
    props.update_all_angles(P);


    //temporarily setup the idler angle

    // P.theta_i = P.theta_s;
    P.optimum_idler(P);
    P.phi_i = P.phi_s + Math.PI;

    // console.log('setting idler phi to: ', P.phi_i*180/Math.PI);
        
    P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
    P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");


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
            P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

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
    var P = props.clone();
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
   
    var dim_theta =2;
    var scale = 10;

    var theta_s = PhaseMatch.linspace(P.theta_s - scale*P.W_sx/2, P.theta_s + scale*P.W_sx/2, dim_theta);
    var phi_s = PhaseMatch.linspace(P.phi_s - scale*P.W_sy/2, P.phi_s + scale*P.W_sy/2, dim_theta);

    var dtheta_s = (theta_s[1] - theta_s[0])/dim_theta;

    var N = dim * dim;
    var PM = new Float64Array( N );

    console.log("indside plothelper ", P.W_sx * 180/Math.PI);
    
    for (i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_i = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_i = Math.atan2(Y[index_y],X[index_x]);
        // phi_s[0] = P.phi_i + Math.PI;
        P.phi_s = P.phi_i + Math.PI;

        var maxval = 0;

        var min_theta_s = function(ts){
            maxval = 0;
            P.theta_s = ts;                
            iterate_theta();
            return 1 - maxval;
        };

        var iterate_theta = function(){
            // for (var r=0; r<dim_theta; r++){
            //     P.phi_s = phi_s[r];
                P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
                P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);

                var x = Math.sin(P.theta_s)*Math.cos(P.phi_s);
                var y = Math.sin(P.theta_s)*Math.sin(P.phi_s);
                var alpha_i = Math.exp(-1*sq((X_0 - x )/(2*P.W_sx)) - sq((Y_0 - y)/(2*P.W_sy)));

                for (var j=0; j<dim_lambda; j++){
                    P.lambda_s = lambda_s[j];
                    // P.lambda_s = 1500e-9;
                    P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);

                    P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");
                    P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

                    var PM_tmp_complex = PhaseMatch.phasematch(P); //complex

                    var PM_tmp = sq(PM_tmp_complex[0]*alpha_i) + sq(PM_tmp_complex[1]*alpha_i);
                    // maxval += PM_tmp;
                    if (PM_tmp>maxval){
                        maxval = PM_tmp;
                    }
                }
                maxval = maxval/1;
            // }
        };

        
        // if (P.brute_force){
        if (false){
            var guess = P.theta_i;
            var ans = PhaseMatch.nelderMead(min_theta_s, guess, 50);
        }
        else{
            for (var j=0; j<dim_lambda; j++){
                P.lambda_s = lambda_s[j];
                // P.lambda_s = 1500e-9;
                P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s);

                P.optimum_signal;
                P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);
                // P.S_s = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_s, P.phi_s);
                P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

                var x = Math.sin(P.theta_s)*Math.cos(P.phi_s);
                var y = Math.sin(P.theta_s)*Math.sin(P.phi_s);
                var alpha_i = Math.exp(-1*sq((X_0 - x )/(2*P.W_sx)) - sq((Y_0 - y)/(2*P.W_sy)));


                P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

                var PM_tmp_complex = PhaseMatch.phasematch(P); //complex

                var PM_tmp = sq(PM_tmp_complex[0]*alpha_i) + sq(PM_tmp_complex[1]*alpha_i);
                maxval += PM_tmp;
                // if (PM_tmp>maxval){
                //     maxval = PM_tmp;
                // }
            }
        }
        PM[i] = maxval;

    }
    console.log("MAX", PhaseMatch.max(PM));
    // console.log("bloop", P.lambda_s*1e9, P.lambda_i*1e9);
    console.log("end indside plothelper ", P.W_sx * 180/Math.PI);

    return PM;
};


PhaseMatch.calc_XY_mode_solver2 = function calc_XY_mode_solver2(props, x_start, x_stop, y_start, y_stop, BW, dim){
    // dim = 50;
    var P = props.clone();
    props.update_all_angles(P);

    P.optimum_idler(P);
    P.phi_i = P.phi_s + Math.PI;
    var X_0 = Math.sin(P.theta_s)* Math.cos(P.phi_s);
    var Y_0 = Math.sin(P.theta_s)* Math.sin(P.phi_s);

    var X = PhaseMatch.linspace(x_start, x_stop, dim);
    var Y = PhaseMatch.linspace(y_start, y_stop, dim);

    var dim_lambda = 20; 

    if (P.brute_force){
        dim = P.brute_dim;
        // dim_lambda = Math.round(dim_lambda/5)+1;
    }

    var lambda_s = PhaseMatch.linspace(P.lambda_s - BW/2, P.lambda_s + BW/2, dim_lambda);
    var lambda_i = PhaseMatch.linspace(P.lambda_i - BW/2, P.lambda_i + BW/2, dim_lambda);
   

    var N = dim * dim;
    var PM = new Float64Array( N );
    
    for (var i=0; i<N; i++){
        var index_x = i % dim;
        var index_y = Math.floor(i / dim);

        P.theta_i = Math.asin(Math.sqrt(sq(X[index_x]) + sq(Y[index_y])));
        P.phi_i = Math.atan2(Y[index_y],X[index_x]);
        P.phi_s = P.phi_i + Math.PI;
        P.S_i = P.calc_Coordinate_Transform(P.theta, P.phi, P.theta_i, P.phi_i);

        var maxval =0;

         for (var j=0; j<dim_lambda; j++){
            P.lambda_s = lambda_s[j];
            P.lambda_i = 1/(1/P.lambda_p - 1/P.lambda_s); 
            P.n_i = P.calc_Index_PMType(P.lambda_i, P.type, P.S_i, "idler");

            if (P.brute_force) {
               P.brute_force_theta_s(); //use a search. time consuming. 
            }
            else {
                //calculate the correct signal angle analytically.
                P.optimum_signal();
            }
            // P.optimum_signal(P);

            var x = Math.sin(P.theta_s)*Math.cos(P.phi_s);
            var y = Math.sin(P.theta_s)*Math.sin(P.phi_s);
            var alpha_i = Math.exp(-1*sq((X_0 - x )/(2*P.W_sx)) - sq((Y_0 - y)/(2*P.W_sy)));


            // P.n_s = P.calc_Index_PMType(P.lambda_s, P.type, P.S_s, "signal");

            var PM_tmp_complex = PhaseMatch.phasematch(P); //complex

            var PM_tmp = sq(PM_tmp_complex[0]*alpha_i) + sq(PM_tmp_complex[1]*alpha_i);
            // maxval += PM_tmp/dim_lambda;
            if (PM_tmp>maxval){
                maxval = PM_tmp;
            }
        }
            
        PM[i] = maxval;

    }
    console.log("MAXXXXX", Math.max.apply(null, PM));

    return PM;
};
