module.exports.test = function(nelderMead, pmLib, props){
  var min_delK = function(x){
      if (x>Math.PI/2 || x<0){return 1e12;}
      props.theta = x;
      // props.theta_s = pmLib.find_internal_angle(props, "signal");
      props.update_all_angles(props);
      var delK =  pmLib.calc_delK(props);
      // Returning all 3 delK components can lead to errors in the search
      // return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
      return Math.abs( delK[2] );
  };

  var guess = Math.PI/2;
  var ans = nelderMead(min_delK, guess, 100);
  return ans;
}

module.exports.graph = function(nelderMead, pmLib, props){
  var min_delK = function(x){
      if (x>Math.PI/2 || x<0){return 1e12;}
      props.theta = x;
      // props.theta_s = pmLib.find_internal_angle(props, "signal");
      props.update_all_angles(props);
      var delK =  pmLib.calc_delK(props);
      // Returning all 3 delK components can lead to errors in the search
      // return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
      return Math.abs( delK[2] );
  };

  var guess = Math.PI/2;
  var data = [];
  for (let i = 0; i < Math.PI/2; i += 0.001){
    data.push({
      theta: i
      , delKz: min_delK(i)
    })
  }
  return data;
}

module.exports.graphpp = function(pmLib, props){
  var min_delK = function(x){
      props.poling_period = x;
      // props.theta_s = pmLib.find_internal_angle(props, "signal");
      props.optimum_idler();
      var delK =  pmLib.calc_delK(props);
      // Returning all 3 delK components can lead to errors in the search
      // return Math.sqrt(sq(delK[0]) + sq(delK[1]) + sq(delK[2]) );
      return Math.abs( delK[2] );
  };

  var guess = Math.PI/2;
  var data = [];
  for (let i = 0; i < 100000; i++){
    let x = i/100000;
    data.push({
      pp: x
      , delKz: min_delK(x)
    })
  }
  return data;
}
