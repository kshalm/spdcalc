const _ = require('lodash')
const spdc = require('./spdcalc_old')

function print_nm( val ){
  return (val * 1e9).toFixed(2) + 'nm'
}

const deg = Math.PI/180

function defaultProps(){
  const props = new spdc.SPDCprop({crystal: 'BBO-1', enable_pp: false, theta_s_e: 3 * Math.PI/180})
  //{crystal: 'BBO-1', enable_pp: false, theta_s_e: 3 * Math.PI/180}


  return props
}

function show( props ){
  console.log(`Indices (${props.lambda_i})`, props.crystal.indicies(props.lambda_i, props.temp))

  console.log(`Pump: φ(${props.phi}), θ(${props.theta}), λ(${print_nm(props.lambda_p)})`)
  console.log(`Signal: φ(${props.phi_s}), θ(${props.theta_s}), λ(${print_nm(props.lambda_s)})`)
  console.log(`Signal (external): θ(${props.theta_s_e})`)
  console.log(`Idler: φ(${props.phi_i}), θ(${props.theta_i}), λ(${print_nm(props.lambda_i)})`)
  console.log(`Idler (external): θ(${props.theta_i_e})`)
  console.log(`n_p: ${props.n_p}, n_s: ${props.n_s}, n_i: ${props.n_i}`)
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

function ddx( fn, x, h ){
  return 0.5*(fn(x + h) - fn(x - h))/h
}

function walkoff_calc_version_2( P, h = 0.1 ){
   // Calculate the pump walkoff angle
   var ne_p = P.calc_Index_PMType(P.lambda_p, P.type, P.S_p, "pump");

   //calculate the derivative
   var deltheta = h * Math.PI/180;

   var S_p = P.calc_Coordinate_Transform(P.theta - 0.5 * deltheta, P.phi, 0, 0);
   var ne1_p = P.calc_Index_PMType(P.lambda_p, P.type, S_p, "pump");

   S_p = P.calc_Coordinate_Transform(P.theta + 0.5 * deltheta, P.phi, 0, 0);
   var ne2_p = P.calc_Index_PMType(P.lambda_p, P.type, S_p, "pump");

   //set back to original theta
   //theta = origin_theta;
   //this.S_p = this.calc_Coordinate_Transform(theta,this.phi, this.theta_s, this.theta_i);

   return -1/ne_p *(ne2_p - ne1_p)/deltheta;
   // console.log("Walkoff:", this.walkoff_p*180/Math.PI);
   // this.walkoff_p = 0;
}

function walkoff_convergence(){
  const props = defaultProps()
  props.enable_pp = false
  props.auto_calc_Theta()
  console.log('theta', props.theta/deg)
  console.log('indices', props.crystal.indicies(props.lambda_p, props.temp))

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

  let fn = theta => {
    let S_p = props.calc_Coordinate_Transform(theta, props.phi, 0, 0)
    return props.calc_Index_PMType(props.lambda_p, props.type, S_p, "pump")
  }

  let result_3 = _.times(16, exp => {
    let h = Math.pow(10, -exp)
    let w = -(1/fn(props.theta)) * ddx(fn, props.theta, h)
    return [h.toExponential(), w.toExponential()]
  })

  let h_o = Math.pow(Number.EPSILON, 1/3);
  console.log('Epsilon', Number.EPSILON)
  console.log(`h_o: ${h_o.toExponential()}`)
  console.log('walkoff convergence (v3): ', result_3)

  let graph = _.times(180, i => {
    let theta = deg * (i)
    let w = fn(theta)
    return [(theta/deg), w.toExponential()]
  })

  // graph.forEach( v => console.log(v[0], v[1]))
}

function derrivativeTest(){
  let h_o = Math.pow(Number.EPSILON, 1/3);
  console.log(`h_o: ${h_o.toExponential()}`)
  let fn = x => Math.sin(x)

  let x_o = 2
  let fpexact = Math.cos(x_o)
  console.log(fpexact)

  let result = _.times(16, exp => {
    let h = Math.pow(10, -exp)
    let fp = ddx( fn, x_o, h )
    let err = fp-fpexact
    return [h.toExponential(), fp.toExponential(), err.toExponential()]
  })

  console.log('x^2 convergence: ', result)
}

function pump_spectrum(){
  let props = defaultProps()
  props.auto_calc_Theta()
  props.calcfibercoupling = false

  let sp = spdc.pump_spectrum(props)

  console.log(`Pump Spectrum: ${sp}`)
}

function phasematch(){
  let props = defaultProps()
  props.auto_calc_Theta()
  props.calcfibercoupling = false
  // props.update_all_angles()

  let delk = spdc.calc_delK( props )
  let amp_pm_tz = spdc.calc_PM_tz_k_coinc( props )
  let amp = spdc.phasematch( props )

  show(props)

  console.log('delk', delk)
  console.log('S_s', props.S_s)

  console.log('PMtz amp', amp_pm_tz)
  console.log('PM amplitued', amp)
  var arg = props.L/2*(delk[2]);
  console.log('arg', arg)
  console.log('sinc', Math.sin(arg)/arg)
}

function phasematch_norm(){
  let props = defaultProps()
  props.auto_calc_Theta()
  props.calcfibercoupling = false

  show(props)

  let norm = spdc.normalize_joint_spectrum(props)
  console.log('norm', norm)
}

// poling_period()
// walkoff()
// walkoff_convergence()
// derrivativeTest()

// phasematch()
// pump_spectrum()
phasematch_norm()
