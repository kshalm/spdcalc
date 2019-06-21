// macro_rules! dim_vector3 {
//   ( $slice:expr;$units:ty ) => (
//     na::Vector3::<$units>::new(ucum::ONE * $slice[0], ucum::ONE * $slice[1],
// ucum::ONE * $slice[2])   )
// }

use dim::ucum;

/// Create a dimensioned vector3
pub fn dim_vector3<L, R>(unit_const : L, arr : &[R; 3]) -> na::Vector3<dim::typenum::Prod<L, R>>
where
  L : std::ops::Mul<R> + Copy,
  R : Copy,
  dim::typenum::Prod<L, R> : na::Scalar,
{
  na::Vector3::new(
    unit_const * arr[0],
    unit_const * arr[1],
    unit_const * arr[2],
  )
}

/// convert from celsius to kelvin
pub fn from_celsius_to_kelvin( c : f64 ) -> ucum::Kelvin<f64> {
  ucum::Kelvin::new(c + 273.15)
}

/// convert from kelvin to celsius
pub fn from_kelvin_to_celsius( k : ucum::Kelvin<f64> ) -> f64 {
  *(k/ucum::K) - 273.15
}
