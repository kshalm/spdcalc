pub extern crate dimensioned as dim;
extern crate nalgebra as na;

macro_rules! dim_vector3 {
  ( $slice:expr;$units:ty ) => (
    na::Vector3::<$units>::new(si::ONE * $slice[0], si::ONE * $slice[1], si::ONE * $slice[2])
  )
}

pub mod junk;
pub mod crystal;
pub use crystal::Crystals;
