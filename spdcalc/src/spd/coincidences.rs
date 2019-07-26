use crate::math::fwhm_to_sigma;
use super::*;
use dim::ucum::{C_, RAD};
use num::Complex;

fn sinc( x : f64 ) -> f64 {
  if x == 0. { 1. } else { f64::sin(x) / x }
}

/// Calculate the pump spectrum
#[allow(non_snake_case)]
fn pump_spectrum(signal : &Photon, idler : &Photon, pump : &Photon, p_bw : Wavelength) -> f64 {
  let PI2c = PI2 * C_;
  let lamda_s = signal.get_wavelength();
  let lamda_i = idler.get_wavelength();
  let lamda_p = pump.get_wavelength();

  let w = PI2c * (1. / lamda_s + 1. / lamda_i - 1. / lamda_p);

  // convert from wavelength to w
  let fwhm = PI2c / (lamda_p * lamda_p) * p_bw;
  let sigma_I = fwhm_to_sigma(fwhm);
  let x = w / sigma_I;

  // Convert from intensity to Amplitude
  // A^2 ~ I ... so extra factor of two here making this 1/4
  (-0.25 * x * x).exp()
}

/// calculate the phasematching
pub fn phasematch(spd : &SPD) -> Complex<f64> {

  // calculate pump spectrum with original pump
  let alpha = pump_spectrum(&spd.signal, &spd.idler, &spd.pump, spd.pump_bandwidth);

  if alpha < spd.pump_spectrum_threshold {
    return Complex::new(0., 0.);
  }

  // calculate coincidences with pump wavelength to match signal/idler
  let (pmz, pmt) = calc_coincidence_phasematch( &spd.with_phasematched_pump() );

  alpha * pmt * pmz
}

#[allow(non_snake_case)]
fn calc_coincidence_phasematch(spd : &SPD) -> (Complex<f64>, f64) {
  if spd.fiber_coupling {
    return calc_coincidence_phasematch_fiber_coupling(spd);
  }

  // crystal length
  let L = *(spd.crystal_setup.length / ucum::M);

  let delk = *(spd.calc_delta_k() / ucum::J / ucum::S);
  let arg = L * 0.5 * delk.z;
  // no fiber coupling
  let pmz = Complex::new(sinc(arg), 0.);
  let waist = *(spd.pump.waist / ucum::M);
  let pmt = f64::exp(-0.5 * ((delk.x * waist.x).powi(2) + (delk.y * waist.y).powi(2)));

  (pmz, pmt)
}

#[allow(non_snake_case)]
fn calc_coincidence_phasematch_fiber_coupling(spd : &SPD) -> (Complex<f64>, f64) {
  // crystal length
  let L = *(spd.crystal_setup.length / ucum::M);

  let delk = *(spd.calc_delta_k() / ucum::J / ucum::S);
  let arg = L * 0.5 * delk.z;

  // energy matching condition
  let PI2c = PI2 * C_;
  let omega_s = PI2c / spd.signal.get_wavelength();
  let omega_i = PI2c / spd.idler.get_wavelength();
  let omega_p = omega_s + omega_i;

  // Height of the collected spots from the axis.
  let theta_s = *(spd.signal.get_theta() / RAD);
  let phi_s = *(spd.signal.get_phi() / RAD);
  let theta_i = *(spd.idler.get_theta() / RAD);
  let phi_i = *(spd.idler.get_phi() / RAD);
  let theta_s_e = *(spd.signal.get_external_theta(&spd.crystal_setup) / RAD);
  let theta_i_e = *(spd.idler.get_external_theta(&spd.crystal_setup) / RAD);

  let hs = L * 0.5 * f64::tan(theta_s) * f64::cos(phi_s);
  let hi = L * 0.5 * f64::tan(theta_i) * f64::cos(phi_i);

  let PMz_real = 0.;
  let PMz_imag = 0.;

  // let W_s = 2*Math.asin( Math.cos(P.theta_s_e)*Math.sin(P.W_sx/2)/(P.n_s * Math.cos(P.theta_s))),
  //     W_i = 2*Math.asin( Math.cos(P.theta_i_e)*Math.sin(P.W_ix/2)/(P.n_i * Math.cos(P.theta_i)));

  let ellipticity = 1.0_f64;
  // Setup constants
  // TODO: enhancement, account for y component of waist. currently only taking x into account
  let Wp_SQ = (*(spd.pump.waist / ucum::M)).x.powi(2);
  let Ws_SQ = (*(spd.signal.waist / ucum::M)).x.powi(2);
  let Wi_SQ = (*(spd.idler.waist / ucum::M)).x.powi(2);
  let Wx_SQ = Wp_SQ * ellipticity.powi(2);
  let Wy_SQ = Wp_SQ;

  // Is this the k vector along the direction of propagation?
  let n_p = spd.pump.get_index(&spd.crystal_setup);
  let n_s = spd.signal.get_index(&spd.crystal_setup);
  let n_i = spd.idler.get_index(&spd.crystal_setup);
  let k_p = PI2 * n_p / spd.pump.get_wavelength();
  let k_s = PI2 * n_s / spd.signal.get_wavelength(); //  * f64::cos(theta_s),
  let k_i = PI2 * n_i / spd.idler.get_wavelength(); // * f64::cos(theta_i)

  let PHI_s = f64::cos(theta_s_e).powi(-2); // External angle for the signal???? Is PHI_s z component?
  let PHI_i = f64::cos(theta_i_e).powi(-2); // External angle for the idler????
  let PSI_s = (k_s / n_s) * f64::sin(theta_s_e) * f64::cos(phi_s); // Looks to be the y component of the ks,i
  let PSI_i = (k_i / n_i) * f64::sin(theta_i_e) * f64::cos(phi_i);

  // Take into account apodized crystals
  // Apodization 1/e^2
  let bw = spd.pp.map_or(
    // if no periodic poling return f64::MAX
    std::f64::MAX,
    // otherwise check apodization
    |poling| poling.apodization.map_or(
      // again if no apodization...
      std::f64::MAX,
      // convert from 0->L to -1 -> 1 for the integral over z
      |ap| 2. * fwhm_to_sigma(ap.fwhm) / L
    )
  );

  let z0 = *(spd.z0p / ucum::M); //put pump in middle of the crystal
  let z0s = *(spd.z0s / ucum::M); //-P.L/(2*Math.cos(P.theta_s_e))
  let z0i = *(spd.z0i / ucum::M); //-P.L/(2*Math.cos(P.theta_i_e))

  // Now put the waist of the signal & idler at the center fo the crystal.
  // W = Wfi.*sqrt( 1 + 2.*1i.*(zi+hi.*sin(thetai_f))./(kif.*Wfi^2));
  let Ws_r = Ws_SQ;
  let Ws_i = 2. / (k_s / n_s) * (z0s + hs * f64::sin(theta_s_e) * f64::cos(phi_s) );
  let Wi_r = Wi_SQ;
  let Wi_i = 2. / (k_i / n_i) * (z0i + hi * f64::sin(theta_i_e) * f64::cos(phi_i) );

  // Now calculate the the coeficients that get repeatedly used. This is from
  // Karina's code. Assume a symmetric pump waist (Wx = Wy)
  let ks_f = k_s / n_s;
  let ki_f = k_i / n_i;
  let SIN_THETA_s_e = f64::sin(theta_s_e);
  let SIN_THETA_i_e = f64::sin(theta_i_e);
  let COS_THETA_s_e = f64::cos(theta_s_e);
  let COS_THETA_i_e = f64::cos(theta_i_e);
  let TAN_THETA_s_e = f64::tan(theta_s_e);
  let TAN_THETA_i_e = f64::tan(theta_i_e);
  let COS_PHI_s = f64::cos(phi_s);
  let COS_PHI_i = f64::cos(phi_i);
  let GAM2s = -0.25 * Ws_SQ;
  let GAM2i = -0.25 * Wi_SQ;
  let GAM1s = GAM2s *PHI_s;
  let GAM1i = GAM2i *PHI_i;
  let GAM3s = -2. * ks_f * GAM1s * SIN_THETA_s_e * COS_PHI_s;
  let GAM3i = -2. * ki_f * GAM1i * SIN_THETA_i_e * COS_PHI_i;
  let GAM4s = -0.5 * ks_f * SIN_THETA_s_e * COS_PHI_s * GAM3s;
  let GAM4i = -0.5 * ki_f * SIN_THETA_i_e * COS_PHI_i * GAM3i;
  let zhs = z0s + hs * SIN_THETA_s_e * COS_PHI_s;
  let zhi = z0i + hi * SIN_THETA_i_e * COS_PHI_i;
  let DEL2s = 0.5 / ks_f * zhs;
  let DEL2i = 0.5 / ki_f * zhi;
  let DEL1s = DEL2s * PHI_s;
  let DEL1i = DEL2i * PHI_i;
  let DEL3s = -hs - zhs * PHI_s * SIN_THETA_s_e * COS_PHI_s;
  let DEL3i = -hi - zhi * PHI_i * SIN_THETA_i_e * COS_PHI_i;
  let DEL4s = 0.5*ks_f * zhs * TAN_THETA_s_e.powi(2) - ks_f * z0s;
  let DEL4i = 0.5*ki_f * zhi * TAN_THETA_i_e.powi(2) - ki_f * z0i;

  let As_r = -0.25 * Wx_SQ + GAM1s;
  let As_i = -DEL1s;
  let Ai_r = -0.25 * Wx_SQ + GAM1i;
  let Ai_i = -DEL1i;
  let Bs_r = -0.25 * Wy_SQ + GAM2s;
  let Bs_i = -DEL2s;
  let Bi_r = -0.25 * Wy_SQ + GAM2i;
  let Bi_i = -DEL2i;
  let Cs = -0.25 * (L / k_s - 2. * z0/k_p);
  let Ci = -0.25 * (L / k_i - 2. * z0/k_p);
  let Ds =  0.25 * L  * (1./k_s - 1./k_p);
  let Di =  0.25 * L  * (1./k_i - 1./k_p);
  // ,Es_r =  0.50 * (Ws_r*PHI_s * PSI_s)
  // ,Es_i =  0.50 * (Ws_i*PHI_i * PSI_s)
  // ,Ei_r =  0.50 * (Wi_r*PHI_i * PSI_i)
  // ,Ei_i =  0.50 * (Wi_i*PHI_i * PSI_i)
  let mx_real = -0.50 * Wx_SQ;
  let mx_imag = z0/k_p;
  let my_real = -0.50 * Wy_SQ;
  let my_imag = mx_imag;
  let m  = L  / (2. * k_p);
  let n  = 0.5 * L  * f64::tan(*(spd.calc_pump_walkoff() / RAD));
  let pp_factor = spd.pp.map_or(1., |p| p.pp_factor());
  let ee = 0.5 * L  * (k_p + k_s + k_i + PI2 * pp_factor / ucum::M);
  let ff = 0.5 * L  * (k_p - k_s - k_i - PI2 * pp_factor / ucum::M);
  // ,hh_r = -0.25 * (Wi_r * PHI_i * sq(PSI_i) + Ws_r * PHI_s * sq(PSI_s))
  // ,hh_i = -0.25 * (Wi_i * PHI_i * sq(PSI_i) + Ws_i * PHI_s * sq(PSI_s))
  let hh_r = GAM4s + GAM4i;
  let hh_i = -(DEL4s + DEL4i);

  let A1R = As_r;
  let A1IO = As_i + Cs;
  let A1I = 0.;
  let A2R = Bs_r;
  let A2IO = Bs_i + Cs;
  let A2I = 0.;
  let A3R = Ai_r;
  let A3IO = Ai_i + Ci;
  let A3I = 0.;
  let A4R = Bi_r;
  let A4IO = Bi_i + Ci;
  let A4I = 0.;
  let A5R = GAM3s;
  let A5I = -DEL3s;
  let A6R = 0.;
  let A6IO = n;
  let A6I = 0.;
  let A7R = GAM3i;
  let A7I = -DEL3i;
  let A8R = mx_real;
  let A8IO = mx_imag;
  let A8I = 0.;
  let A9R = my_real;
  let A9IO = my_imag;
  let A9I = 0.;
  let A10R = hh_r;
  let A10IO = hh_i + ee;
  let A10I = 0.;

  let zintfunc = |z| {
    // z = 0;
    // let terms = calczterms(z);
    // let A1R = terms[0][0],
    //     A1I = terms[0][1],
    //     A2R = terms[1][0],
    //     A2I = terms[1][1],
    //     A3R = terms[2][0],
    //     A3I = terms[2][1],
    //     A4R = terms[3][0],
    //     A4I = terms[3][1],
    //     A5R = terms[4][0],
    //     A5I = terms[4][1],
    //     A6R = terms[5][0],
    //     A6I = terms[5][1],
    //     A7R = terms[6][0],
    //     A7I = terms[6][1],
    //     A8R = terms[7][0],
    //     A8I = terms[7][1],
    //     A9R = terms[8][0],
    //     A9I = terms[8][1],
    //     A10R = terms[9][0],
    //     A10I = terms[9][1]
    //     ;

    let  m_z = m*z
    ,Ds_z = Ds *z
    ,Di_z = Di *z
    ,ff_z = ff*z
    ;

    A1I = A1IO + Ds_z;
    A2I = A2IO + Ds_z;
    A3I = A3IO + Di_z;
    A4I = A4IO + Di_z;
    A6I = A6IO * (1+z);
    A8I = A8IO - m_z;
    A9I = A9IO - m_z;
    A10I = A10IO + ff_z;

    // (-4 A3 + A8^2/A1)
    // console.log("hello");
    // console.log("A1R: " + A1R.toString() + "   A2R: " + A2R.toString()+"A3R: " + A3R.toString() + "   A4R: " + A4R.toString()+"A5R: " + A5R.toString() + "   A6R: " + A6R.toString()+"A7R: " + A7R.toString() + "   A8R: " + A8R.toString()+"A9R: " + A9R.toString() + "   A10R: " + A10R.toString());
    // First calculate terms in the exponential of the integral
    //   E^(1/4 (4 A10 - A5^2/A1 - A6^2/A2 - (-2 A1 A7 + A5 A8)^2/(A1 (4 A1 A3 - A8^2)) - (A6^2 (-2 A2 + A9)^2)/(A2 (4 A2 A4 - A9^2)))
    // )

    // From Karina's code
    // % z = (exp((4.*A11 - A2.^2./A1 - A4.^2./A3 - (A10.*A4 - 2.*A3.*A8).^2./(A3.*(-A10.^2 + 4.*A3.*A7)) - (-2.*A1.*A6 + A2.*A9).^2./(A1.*(4.*A1.*A5 - A9.^2)))./4.)./...
    // %
    // Kr -> Ka
    // A1 -> A1
    // A2 -> A3
    // A3 -> A5
    // A4 -> A7
    // A5 -> A2
    // A6 -> A4
    // A6 -> A8
    // A7 -> A6
    // A8 -> A9
    // A9 -> A10
    // A10 -> A11

    // Ka -> Kr
    // A1 -> A1
    // A2 -> A5
    // A3 -> A2
    // A4 -> A6
    // A5 -> A3
    // A6 -> A7
    // A7 -> A4
    // A8 -> A6
    // A9 -> A8
    // A10 -> A9
    // A11 -> A10

    // 4 A10
    let EXP1R = A10R*4,
    EXP1I = A10I*4,

    // A5^2/A1
    EXP2R_a = helpers.cmultiplyR(A5R, A5I, A5R, A5I ),
    EXP2I_a = helpers.cmultiplyI(A5R, A5I, A5R, A5I ),
    EXP2R = helpers.cdivideR(EXP2R_a, EXP2I_a, A1R, A1I),
    EXP2I = helpers.cdivideI(EXP2R_a, EXP2I_a, A1R, A1I),

    // A6^2/A2
    EXP3R_a = helpers.cmultiplyR(A6R, A6I, A6R, A6I ),
    EXP3I_a = helpers.cmultiplyI(A6R, A6I, A6R, A6I ),
    EXP3R = helpers.cdivideR(EXP3R_a, EXP3I_a, A2R, A2I),
    EXP3I = helpers.cdivideI(EXP3R_a, EXP3I_a, A2R, A2I),

    // (-2 A1 A7 + A5 A8)^2/ (A1 (4 A1 A3 - A8^2))
    EXP4Ra_num = -2 * helpers.cmultiplyR( A1R, A1I, A7R, A7I),
    EXP4Ia_num = -2 * helpers.cmultiplyI( A1R, A1I, A7R, A7I),
    EXP4Rb_num = helpers.cmultiplyR( A5R, A5I, A8R, A8I),
    EXP4Ib_num = helpers.cmultiplyI( A5R, A5I, A8R, A8I),
    EXP4Rc_num  = helpers.caddR(EXP4Ra_num, EXP4Ia_num, EXP4Rb_num, EXP4Ib_num),
    EXP4Ic_num  = helpers.caddI(EXP4Ra_num, EXP4Ia_num, EXP4Rb_num, EXP4Ib_num),
    EXP4R_num   = helpers.cmultiplyR(EXP4Rc_num, EXP4Ic_num, EXP4Rc_num, EXP4Ic_num),
    EXP4I_num   = helpers.cmultiplyI(EXP4Rc_num, EXP4Ic_num, EXP4Rc_num, EXP4Ic_num),
    // Denominator
    EXP4Ra_den = -1 * helpers.cmultiplyR(A8R, A8I, A8R, A8I),
    EXP4Ia_den = -1 * helpers.cmultiplyI(A8R, A8I, A8R, A8I),
    EXP4Rb_den =  4 * helpers.cmultiplyR( A1R, A1I, A3R, A3I),
    EXP4Ib_den =  4 * helpers.cmultiplyI( A1R, A1I, A3R, A3I),
    EXP4Rc_den =  helpers.caddR( EXP4Ra_den, EXP4Ia_den, EXP4Rb_den, EXP4Ib_den ),
    EXP4Ic_den =  helpers.caddI( EXP4Ra_den, EXP4Ia_den, EXP4Rb_den, EXP4Ib_den ),
    EXP4R_den = helpers.cmultiplyR(A1R, A1I, EXP4Rc_den, EXP4Ic_den),
    EXP4I_den = helpers.cmultiplyI(A1R, A1I, EXP4Rc_den, EXP4Ic_den),
    EXP4R     = helpers.cdivideR(EXP4R_num, EXP4I_num, EXP4R_den, EXP4I_den),
    EXP4I     = helpers.cdivideI(EXP4R_num, EXP4I_num, EXP4R_den, EXP4I_den),

    // A6^2 (-2 A2 + A9)^2)/(A2 (4 A2 A4 - A9^2)))
    EXP5Rb_num = helpers.caddR( -2*A2R, -2*A2I, A9R, A9I),
    EXP5Ib_num = helpers.caddI( -2*A2R, -2*A2I, A9R, A9I),
    EXP5Rc_num = helpers.cmultiplyR( EXP5Rb_num, EXP5Ib_num,EXP5Rb_num, EXP5Ib_num),
    EXP5Ic_num = helpers.cmultiplyI( EXP5Rb_num, EXP5Ib_num,EXP5Rb_num, EXP5Ib_num),
    EXP5R_num  = helpers.cmultiplyR( EXP3R, EXP3I ,EXP5Rc_num, EXP5Ic_num),
    EXP5I_num  = helpers.cmultiplyI( EXP3R, EXP3I ,EXP5Rc_num, EXP5Ic_num),
    // EXP5R_num  = helpers.cmultiplyR( EXP5Rd_num, EXP5Id_num, EXP5Rd_num, EXP5Id_num),
    // EXP5I_num  = helpers.cmultiplyI( EXP5Rd_num, EXP5Id_num, EXP5Rd_num, EXP5Id_num),
    // Denominator
    EXP5Ra_den = -1 * helpers.cmultiplyR(A9R, A9I, A9R, A9I),
    EXP5Ia_den = -1 * helpers.cmultiplyI(A9R, A9I, A9R, A9I),
    EXP5Rb_den =  4 * helpers.cmultiplyR( A2R, A2I, A4R, A4I),
    EXP5Ib_den =  4 * helpers.cmultiplyI( A2R, A2I, A4R, A4I),
    EXP5R_den =  helpers.caddR( EXP5Ra_den, EXP5Ia_den, EXP5Rb_den, EXP5Ib_den ),
    EXP5I_den =  helpers.caddI( EXP5Ra_den, EXP5Ia_den, EXP5Rb_den, EXP5Ib_den ),
    // expression for fifth term
    EXP5R     = helpers.cdivideR(EXP5R_num, EXP5I_num, EXP5R_den, EXP5I_den),
    EXP5I     = helpers.cdivideI(EXP5R_num, EXP5I_num, EXP5R_den, EXP5I_den),

    // Full expression for term in the exponential
    EXP6R_a = helpers.caddR(EXP1R, EXP1I, -1*EXP2R, -1*EXP2I),
    EXP6I_a = helpers.caddI(EXP1R, EXP1I, -1*EXP2R, -1*EXP2I),
    EXP6R_b = helpers.caddR(EXP6R_a, EXP6I_a, -1*EXP3R, -1*EXP3I),
    EXP6I_b = helpers.caddI(EXP6R_a, EXP6I_a, -1*EXP3R, -1*EXP3I),
    EXP6R_c = helpers.caddR(EXP6R_b, EXP6I_b, -1*EXP4R, -1*EXP4I),
    EXP6I_c = helpers.caddI(EXP6R_b, EXP6I_b, -1*EXP4R, -1*EXP4I),
    EXPR = 0.25 * helpers.caddR(EXP6R_c, EXP6I_c, -1*EXP5R, -1*EXP5I),
    EXPI = 0.25 * helpers.caddI(EXP6R_c, EXP6I_c, -1*EXP5R, -1*EXP5I),


    //////////////////////////////////////////////////////////////////////////////
    // Now deal with the denominator in the integral:
    // Sqrt[A1 A2 (-4 A3 + A8^2/A1) (-4 A4 + A9^2/A2)]

    // A1 A2
    DEN1R = helpers.cmultiplyR(A1R, A1I, A2R, A2I),
    DEN1I = helpers.cmultiplyI(A1R, A1I, A2R, A2I),

    // (-4 A3 + A8^2/A1) //Matlab (-4 A7 + A10^2/A3)
    DEN2R_a = helpers.cdivideR(-1*EXP4Ra_den, -1*EXP4Ia_den, A1R, A1I),
    DEN2I_a = helpers.cdivideI(-1*EXP4Ra_den, -1*EXP4Ia_den, A1R, A1I),
    DEN2R = helpers.caddR(-4*A3R, -4*A3I, DEN2R_a, DEN2I_a),
    DEN2I = helpers.caddI(-4*A3R, -4*A3I, DEN2R_a, DEN2I_a),

    // (-4 A4 + A9^2/A2)
    DEN3R_a = helpers.cdivideR(-1*EXP5Ra_den, -1*EXP5Ia_den, A2R, A2I),
    DEN3I_a = helpers.cdivideI(-1*EXP5Ra_den, -1*EXP5Ia_den, A2R, A2I),
    DEN3R = helpers.caddR(-4*A4R, -4*A4I, DEN3R_a, DEN3I_a),
    DEN3I = helpers.caddI(-4*A4R, -4*A4I, DEN3R_a, DEN3I_a),

    // full expression for denominator
    DEN4R_a = helpers.cmultiplyR(DEN1R, DEN1I, DEN2R, DEN2I),
    DEN4I_a = helpers.cmultiplyI(DEN1R, DEN1I, DEN2R, DEN2I),
    DEN4R_b = helpers.cmultiplyR(DEN4R_a, DEN4I_a, DEN3R, DEN3I),
    DEN4I_b = helpers.cmultiplyI(DEN4R_a, DEN4I_a, DEN3R, DEN3I),
    DENR     = helpers.csqrtR(DEN4R_b, DEN4I_b),
    DENI     = helpers.csqrtI(DEN4R_b, DEN4I_b),

    // Now calculate the full term in the integral.
    pmzcoeff = Math.exp(- 1/2*sq(z/bw)), // apodization
    // pmzcoeff = 1,
    // Exponential using Euler's formula
    coeffR = Math.exp(EXPR),
    // coeffR = 1,
    EReal = coeffR * pmzcoeff*Math.cos(EXPI),
    EImag = coeffR * pmzcoeff*Math.sin(EXPI),
    real = helpers.cdivideR(EReal, EImag, DENR, DENI),
    imag = helpers.cdivideI(EReal, EImag, DENR, DENI)
    ;
    let EXPRadd = (EXP1R -EXP2R -EXP3R -EXP4R -EXP5R)/4;


    // console.log("Exponent: ", EXPR, EXPI);
    // // console.log("4A10: ", EXP1R, EXP1I);
    // // console.log("A5^2/A1: ", EXP2R, EXP2I);
    // // console.log("A6^2/A2: ", EXP3R, EXP3I);
    // // console.log("(-2 A1 A7 + A5 A8)^2:", EXP4R, EXP4I);
    // // console.log("A6^2 (-2 A2 + A9)^2):", EXP5R, EXP5I);
    // console.log("Den1: ", DEN1R, DEN1I);
    // console.log("DEN2: ", DEN2R, DEN2I);
    // console.log("DEN3: ", DEN3R, DEN3I);
    // console.log("C9squaredA2:", DEN3R_a, DEN3I_a);
    // console.log("Denominator: ", DENR, DENI);
    // console.log("RESULT: ", (0.5*real).toExponential(), (0.5*imag).toExponential());
    /////////////////////////////////////////////////////////////////
    // console.log("real: " + EXPR.toString() + "   ExpImag: " + EXPI.toString() + "   DenR: " + DENR.toString() + "   DENI: " + DENI.toString() + " Den1I: " +DEN1I.toString() + " DEN2I: " + DEN2I.toString() + " DEN3I: " + DEN3I.toString() + " A1I: " + A1I.toString() + " A2I: " + A2I.toString() + " A8I: " + A8I.toString() + " A1I: " + A1I.toString() + " A3I: " + A3I.toString());
    // console.log("real: " + EXPR.toString() + "   ExpImag: " + EXPI.toString() + "   DenR: " + DENR.toString() + "   DENI: " + DENI.toString() + " Den1R: " +DEN1R.toString() + " DEN2R: " + DEN2R.toString() + " DEN3R: " + DEN3R.toString() + " A1R: " + A1R.toString() + " A2R: " + A2R.toString() + " A8R: " + A8R.toString() + " A1R: " + A1R.toString() + " A3R: " + A3R.toString());
    // console.log("real: " + EXPR.toString() + "   ExpImag: " + EXPI.toString() + " EXP1R: " + EXP1R.toString() + ", EXP2R: " + EXP2R.toString()+ ", EXP3R: " + EXP3R.toString()+ ", EXP4R: " + EXP4R.toString()+ ", EXP5R: " + EXP5R.toString() + " A1R: " + A1R.toString() + " A3R: " + A3R.toString() + "    A5I: " + A5I.toString() + ",    A7I: " + A7I.toString() + " A8R: " + A8R.toString() + ", Exp4R_num: " + EXP4R_num.toString() + ", Exp4I_num: " + EXP4I_num.toString() + ", Exp4R_den: " + EXP4R_den.toString() + ", Exp4I_den: " + EXP4I_den.toString() );
    // console.log("real: " + real.toString() + " Imag: " + imag.toString());

    return [real, imag];
  };

  let arg = P.L/2*(delKz);
  let PMt = 1;

  let dz = 2/P.numzint;
  let pmintz = helpers.Nintegrate2arg(zintfunc,-1, 1,dz,P.numzint,P.zweights);
  // let pmintz = zintfunc(0.5);

  // let dz = 1;
  // let pmintz = helpers.Nintegrate2arg(zintfunc,-1, 1,dz,1,P.zweights);
  // PMz_real = pmintz[0]/P.L ;
  // PMz_imag = pmintz[1]/P.L ;
  PMz_real = pmintz[0]/2;
  PMz_imag = pmintz[1]/2;
  // let coeff = (Math.sqrt(omega_s * omega_i)/ (P.n_s * P.n_i));
  let coeff = 1;
  PMz_real = PMz_real * coeff;
  PMz_imag = PMz_imag * coeff;

  (Complex::new(PMz_real, PMz_imag), PMt)
}

#[cfg(test)]
mod tests {
  use super::*;
  extern crate float_cmp;
  use float_cmp::*;

  #[test]
  fn pump_spectrum_test() {
    let spd = SPD::default();

    let actual = pump_spectrum(&spd.signal, &spd.idler, &spd.pump, spd.pump_bandwidth);

    let expected = 1.;

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }

  #[test]
  fn phasematch_test(){
    let mut spd = SPD::default();
    // spd.signal.set_from_external_theta(3. * ucum::DEG, &spd.crystal_setup);
    spd.signal.set_angles(0. *ucum::RAD, 0.03253866877817829 * ucum::RAD);
    // spd.assign_optimum_idler();
    // spd.assign_optimum_theta();

    // FIXME This isn't matching.
    spd.idler.set_angles(PI * ucum::RAD, 0.03178987094605031 * ucum::RAD);
    spd.crystal_setup.theta = 0.5515891191131287 * ucum::RAD;

    let amp = phasematch( &spd );
    /*
    let amp_pm_tz = calc_coincidence_phasematch( &spd );
    let delk = spd.calc_delta_k();

    println!("n_p: {}", spd.pump.get_index(&spd.crystal_setup));
    println!("n_s: {}", spd.signal.get_index(&spd.crystal_setup));
    println!("n_i: {}", spd.idler.get_index(&spd.crystal_setup));

    println!("{:#?}", spd);
    println!("{}", *(delk / ucum::J / ucum::S));

    println!("pmtz {} {}", amp_pm_tz.0, amp_pm_tz.1);
    println!("phasematch {}", amp);
    */

    let actual = amp;
    let expected = Complex::new(0.9999999456740692, 0.);

    assert!(
      approx_eq!(f64, actual.re, expected.re, ulps = 2, epsilon = 1e-12),
      "actual: {}, expected: {}",
      actual,
      expected
    );
    assert!(
      approx_eq!(f64, actual.im, expected.im, ulps = 2, epsilon = 1e-12),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }

  #[test]
  fn phasematch_collinear_test(){
    let spd = SPD::default();

    let amp = phasematch( &spd.to_collinear() );
    let actual = amp.re.powi(2) + amp.im.powi(2);
    let expected = 1.;

    /*
    let zero = 0. * ucum::RAD;
    let signal = Photon::signal(zero, zero, spd.signal.get_wavelength(), spd.signal.waist);
    let idler = Photon::idler(zero, zero, spd.idler.get_wavelength(), spd.idler.waist);

    let mut spd_collinear = SPD {
      signal,
      idler,
      ..spd
    };

    spd_collinear.assign_optimum_theta();

    println!("theta {}", spd_collinear.crystal_setup.theta);
    */

    assert!(
      approx_eq!(f64, actual, expected, ulps = 2),
      "actual: {}, expected: {}",
      actual,
      expected
    );
  }
}
