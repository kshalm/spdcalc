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

poling_period()
