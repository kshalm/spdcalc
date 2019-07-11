const _ = require('lodash')
const spdc = require('./spdcalc_old')

function print_nm( val ){
  return (val * 1e9).toFixed(2) + 'nm'
}

function defaultProps(){
  const props = new spdc.SPDCprop()

  console.log(`Indices (${props.lambda_i})`, props.crystal.indicies(props.lambda_i, props.temp))

  console.log(`Pump: φ(${props.phi}), θ(${props.theta}), λ(${print_nm(props.lambda_p)})`)
  console.log(`Signal: φ(${props.phi_s}), θ(${props.theta_s}), λ(${print_nm(props.lambda_s)})`)
  console.log(`Signal (external): θ(${props.theta_s_e})`)
  console.log(`Idler: φ(${props.phi_i}), θ(${props.theta_i}), λ(${print_nm(props.lambda_i)})`)
  console.log(`Idler (external): θ(${props.theta_i_e})`)
  return props
}

function poling_period(){
  const props = defaultProps()
  props.calc_poling_period()

  console.log(`S_s: ${props.S_s}`)
  console.log(`n_s: ${props.n_s}`)
  console.log(`n_i: ${props.n_i}`)
  console.log(`n_p: ${props.n_p}`)
  console.log(`Poling period: ${props.poling_sign >= 0 ? '' : '-'}${props.poling_period}`)
  let del_k = spdc.calc_delK(props);
  console.log('DeltaK:', del_k)
}

function walkoff(){
  const props = defaultProps()
  props.auto_calc_Theta()
  console.log(`walkoff_p: ${props.walkoff_p}`)
}

function walkoff_calc_version_2( P, h = 0.1 ){
   // Calculate the pump walkoff angle
   var ne_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

   //calculate the derivative
   var deltheta = h * Math.PI/180;

   var S_p = P.calc_Coordinate_Transform(P.theta - 0.5 * deltheta, P.phi, P.theta_s, P.theta_i);
   var ne1_p = P.calc_Index_PMType(P.lambda_p, P.type, S_p, "pump");

   S_p = P.calc_Coordinate_Transform(P.theta + 0.5 * deltheta, P.phi, P.theta_s, P.theta_i);
   var ne2_p = P.calc_Index_PMType(P.lambda_p, P.type, S_p, "pump");

   //set back to original theta
   //theta = origin_theta;
   //this.S_p = this.calc_Coordinate_Transform(theta,this.phi, this.theta_s, this.theta_i);

   return -1/ne_p *(ne1_p - ne2_p)/deltheta;
   // console.log("Walkoff:", this.walkoff_p*180/Math.PI);
   // this.walkoff_p = 0;
}

function walkoff_convergence(){
  const props = defaultProps()
  props.auto_calc_Theta()

  let result = _.times(16, exp => {
    let h = Math.pow(10, -exp)
    props.calc_walkoff_angles( h )
    let w = props.walkoff_p
    return [h.toExponential(), w.toExponential()]
  })

  console.log('walkoff convergence (old): ', result)

  let result_new = _.times(16, exp => {
    let h = Math.pow(10, -exp)
    let w = walkoff_calc_version_2(props, h)
    return [h.toExponential(), w.toExponential()]
  })

  console.log('walkoff convergence (new): ', result_new)
}

// poling_period()
// walkoff()
walkoff_convergence()
