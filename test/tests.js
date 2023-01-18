const _ = require('lodash')
const spdc = require('./spdcalc_old')

function print_nm( val ){
  return (val * 1e9).toFixed(2) + 'nm'
}

const deg = Math.PI/180

function crystal_indices(){
  let type = 'LiIO3-2'
  let indices = spdc.Crystals(type).indicies(720e-9, 30)

  console.log(`indices for ${type}:`, indices)
}

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
  console.log(`pp: ${props.enable_pp}, period: ${props.poling_sign * props.poling_period}, apodization: ${props.calc_apodization}, fwhm: ${props.apodization_FWHM}`)
  console.log(`z0p: ${props.z0p}, z0s: ${props.z0s}, z0i: ${props.z0i}`)
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

function waist_position(){
  const props = defaultProps()
  show(props)
  props.auto_calc_collection_focus()

  console.log(`Waist position: ${props.z0s}`)
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
  props.lambda_s = 1500 * 1e-9
  props.calcfibercoupling = false

  show(props)

  let sp = spdc.pump_spectrum(props)

  console.log(`Pump Spectrum: ${sp}`)
}

function phasematch(){
  let props = defaultProps()
  props.set('enable_pp', false)
  props.poling_period = 1e16
  props.auto_calc_Theta()
  props.auto_calc_collection_focus()
  // props.calcfibercoupling = false
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

function phasematch_pp(){
  let props = defaultProps()
  props.set('enable_pp', true)
  props.calc_poling_period()
  props.auto_calc_collection_focus()
  // props.auto_calc_Theta()
  // props.calcfibercoupling = false
  // props.update_all_angles()

  let delk = spdc.calc_delK( props )
  let amp_pm_tz = spdc.calc_PM_tz_k_coinc( props )
  let amp = spdc.phasematch( props )

  show(props)

  console.log('PMtz amp', amp_pm_tz)
  console.log('PM amplitude', amp)
}

function phasematch_norm(){
  let props = defaultProps()
  // props.auto_calc_Theta()
  // props.calcfibercoupling = false
  props.set('enable_pp', true)
  props.calc_poling_period()
  props.auto_calc_collection_focus()

  show(props)

  let norm = spdc.normalize_joint_spectrum(props)
  console.log('norm', norm)
  let norm_singles = spdc.normalize_joint_spectrum_singles(props)
  console.log('norm singles', norm_singles)
}

function autorange_lambda(){
  let props = defaultProps()
  props.auto_calc_Theta()
  show(props)

  let ranges = spdc.autorange_lambda(props, 0.5)
  console.log(ranges)
}

function singles(){
  let props = defaultProps()
  props.theta = 0
  props.set('enable_pp', false)
  props.poling_period = 1e16

  props.auto_calc_Theta()
  props.auto_calc_collection_focus()
  // props.calcfibercoupling = false
  props.update_all_angles()

  let delk = spdc.calc_delK( props )
  let amp_pm_tz = spdc.calc_PM_tz_k_singles( props )
  let amp = spdc.phasematch_singles( props )

  show(props)

  console.log('delk', delk)
  console.log('S_s', props.S_s)

  console.log('PMtz singles amp', amp_pm_tz)
  console.log('PM singles amplitude', amp)
}

function singles_pp(){
  let props = defaultProps()
  props.set('enable_pp', true)
  props.calc_poling_period()
  props.auto_calc_collection_focus()
  // props.calcfibercoupling = false
  // props.update_all_angles()

  let delk = spdc.calc_delK( props )
  let amp_pm_tz = spdc.calc_PM_tz_k_singles( props )
  let amp = spdc.phasematch_singles( props )

  show(props)

  console.log('delk', delk)
  console.log('S_s', props.S_s)

  console.log('PMtz singles amp', amp_pm_tz)
  console.log('PM singles amplitude', amp)
}

function integrator_test(){
  let n = 33
  let w = spdc.Nintegrate2DWeights_3_8(n)
  let result = spdc.Nintegrate2D_3_8((x, y) => {
    return Math.sin(x) * y * y * y
  }, 0, Math.PI, 0, 2, n, w)

  let actual = result
  let expected = Math.pow(2, 4) / 2

  console.log('result', actual)
  console.log('expected', expected);

  let diff = 100. * Math.abs(expected - actual) / expected
  console.log('percent diff', diff)
}

function rates_test(){
  let props = new spdc.SPDCprop({
    crystal: 'KTP-3'
    , "lambda_p": 7.74e-7
    , enable_pp: true
    , L: 6000 * 1e-6
    , W: 200 * 1e-6
    , theta: 90 * Math.PI/180
    , p_bw: 0.2 * 1e-9
    , W_sx: 50e-6
    , W_sy: 50e-6
    , W_ix: 50e-6
    , W_iy: 50e-6
  })
  props.calc_poling_period()
  props.update_all_angles()
  props.auto_calc_collection_focus()
  props.optimum_idler()
  console.table(props.get())
  console.table(Object.entries(props))

  let dim = 15
  let lamda_s = spdc.linspace(
    1546.01 * 1e-9,
    1553.99 * 1e-9,
    dim
  );
  let lamda_i = spdc.linspace(
    1542.05 * 1e-9,
    1550.00 * 1e-9,
    dim
  );

  let start = Date.now()
  let rates = spdc.calc_JSI_rates_p(props, lamda_s, lamda_i, dim, 1)

  let sum = spdc.Sum(rates)
  console.log('coinc rate sum', sum)

  let singles_rates = spdc.calc_JSI_Singles_p(props, lamda_s, lamda_i, dim, 1)
  let sum_s_s = spdc.Sum(singles_rates[0])
  let sum_s_i = spdc.Sum(singles_rates[1])

  console.log('singles s rate sum', sum_s_s)
  console.log('singles i rate sum', sum_s_i)

  let eff_i = sum / sum_s_s
  let eff_s = sum / sum_s_i
  let eff_sym = sum / Math.sqrt(sum_s_i * sum_s_s)

  console.log('signal efficiency', eff_s)
  console.log('idler efficiency', eff_i)
  console.log('symmetric efficiency', eff_sym)
  console.log('calcuation took', (Date.now() - start) + 'ms')
}

function heralding_apodization_test(){
  let props = new spdc.SPDCprop({
    crystal: 'KTP-3'
    , L: 1000 * 1e-6
    , enable_pp: true
    , theta: 90 * Math.PI/180
    , calc_apodization: true
    , apodization_FWHM: 1000 * 1e-6
  })
  props.update_all_angles()
  props.calc_poling_period()
  // props.auto_calc_collection_focus()

  show(props)

  let dim = 30
  let lamda_s = spdc.linspace(
    1490.86 * 1e-9,
    1609.14 * 1e-9,
    dim
  );
  let lamda_i = spdc.linspace(
    1495.05 * 1e-9,
    1614.03 * 1e-9,
    dim
  );

  let start = Date.now()
  let rates = spdc.calc_JSI_rates_p(props, lamda_s, lamda_i, dim, 1)

  let sum = spdc.Sum(rates)
  console.log('coinc rate sum', sum)

  let singles_rates = spdc.calc_JSI_Singles_p(props, lamda_s, lamda_i, dim, 1)
  let sum_s_s = spdc.Sum(singles_rates[0])
  let sum_s_i = spdc.Sum(singles_rates[1])

  console.log('singles s rate sum', sum_s_s)
  console.log('singles i rate sum', sum_s_i)

  let eff_i = sum / sum_s_s
  let eff_s = sum / sum_s_i

  console.log('idler efficiency', eff_i)
  console.log('signal efficiency', eff_s)
  console.log('calcuation took', (Date.now() - start) + 'ms')
}

function test_for_krister(){
  let props = new spdc.SPDCprop({
    crystal: 'KTP-3'
    , L: 12000 * 1e-6
    , enable_pp: true
    , theta: 90 * Math.PI/180
    , calc_apodization: true
    , apodization_FWHM: 8000 * 1e-6
  })
  props.update_all_angles()
  props.calc_poling_period()
  props.auto_calc_collection_focus()

  show(props)

  let dim = 30
  let lamda_s = spdc.linspace(
    1540.18 * 1e-9,
    1559.82 * 1e-9,
    dim
  );
  let lamda_i = spdc.linspace(
    1540.30 * 1e-9,
    1559.95 * 1e-9,
    dim
  );

  let start = Date.now()
  let rates = spdc.calc_JSI_rates_p(props, lamda_s, lamda_i, dim, 1)

  let sum = spdc.Sum(rates)
  console.log('coinc rate sum', sum)

  let singles_rates = spdc.calc_JSI_Singles_p(props, lamda_s, lamda_i, dim, 1)
  let sum_s_s = spdc.Sum(singles_rates[0])
  let sum_s_i = spdc.Sum(singles_rates[1])

  console.log('singles s rate sum', sum_s_s)
  console.log('singles i rate sum', sum_s_i)

  let eff_i = sum / sum_s_s
  let eff_s = sum / sum_s_i

  console.log('idler efficiency', eff_i)
  console.log('signal efficiency', eff_s)
  console.log('calcuation took', (Date.now() - start) + 'ms')
}

function swap_test(){
  let props = defaultProps()
  props.set('enable_pp', true)
  props.calc_poling_period()
  props.auto_calc_collection_focus()
  props.optimum_idler()
  console.log(props.theta_s, props.theta_i)
  props.swap_signal_idler()
  props.optimum_idler()
  console.log(props.theta_s, props.theta_i)
}

// crystal_indices()
// poling_period()
// walkoff()
// walkoff_convergence()
// derrivativeTest()

// phasematch()
// phasematch_pp()
// pump_spectrum()
// phasematch_norm()
// autorange_lambda()

// singles()
// singles_pp()
// integrator_test()
rates_test()
// heralding_apodization_test()

// test_for_krister()
// waist_position()
// swap_test()
