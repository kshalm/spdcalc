struct SPDCProperties {
  pm_type :PMType,
  crystal :Crystal,
  pump :Beam,
  pump_bandwidth :Length,
  signal :Beam,
  idler :Beam,

  periodic_polling :Option<PeriodicPolling>,
}

enum PMType {
  Type0_o_oo,
  Type0_e_ee,

  Type1_e_oo,

  Type2_e_eo,
  Type2_e_oe,
}

struct Crystal {
  type :CrystalType,
  theta :Angle,
  phi :Angle,
  length :Length,
  temperature :Temperature,
}

struct Beam {
  type: BeamType,
  wavelength :Wavelength,
  theta :Angle, // internal angle
  phi :Angle,
  waist :Vector2<Length>,
  r_index :RIndex,
}

enum BeamType {
  Pump,
  Signal,
  Idler,
}

impl Beam {
  fn new( theta_external: Angle ) -> Beam {
    Beam {
      theta: calc_internal_theta( theta_external ),
    }
  }

  fn calc_refractive_index( &self, crystal :Crystal, pm_type :PMType ) -> Unitless<f64> {
    // rotated indices
    let indices = crystal.get_indices();

  }

  fn get_group_velocity( &self, crystal :Crystal, pm_type :PMType ) -> Velocity<f64> {

  }


}

struct PeriodicPolling {
  period :Length,
  sign :Sign, //positive negative????
  apodization :Option<Apodization>,
}

struct Apodization {
  steps :i32,
  fwhm :Wavelength,
}


// -------------------
var spdcDefaults = {
    // lambda_p: 775 * con.nm,
    // lambda_s: 1550 * con.nm,
    // lambda_i: 1550 * 775 * con.nm / ( 1550 -  775 ),
    // type: "Type 2:   e -> e + o",
    // theta: 90 *Math.PI / 180,
    // phi: 0,
    theta_s: 0, //computed
    theta_i: 0, //computed
    theta_s_e: 0 *Math.PI / 180,
    theta_i_e: 0,
    // phi_s: 0,
    // phi_i: Math.PI ,
    // L: 2000 * con.um,
    // W: 100 * con.um,
    // p_bw: 5.35 * con.nm,
    walkoff_p: 0, //computed
    // W_sx: 100 * con.um,
    // W_sy: 100 * con.um,
    // W_ix: 100 * con.um,
    // W_iy: 100 * con.um,
    phase: false, // ?????
    // brute_force: false, // DEPRECATED
    // brute_dim: 50, // DEPRECATED
    autocalctheta: false,
    autocalcpp: true,
    // poling_period: 1000000,
    // poling_sign: 1,
    calc_apodization: false,
    // apodization: 30,
    // apodization_FWHM: 1600 * con.um,
    use_guassian_approx: false, // for testing
    // crystal: Crystals('KTP-3'),
    // temp: 20,
    // enable_pp: true,

    calcfibercoupling: true,
    singles: false,
    autocalfocus: true,

    z0s: -2000/2 * con.um,
    deff: 1.0 * con.pm, // nonlinearity of crystal computed
    Pav: 1e-3 // fixed constant for now

    // z0: 2000/2 * con.um
};
