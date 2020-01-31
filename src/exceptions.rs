#[derive(Debug, Clone)]
pub struct SPDCError(pub String);

impl SPDCError {
  pub fn new( message : String ) -> Self {
    Self(message)
  }
}
