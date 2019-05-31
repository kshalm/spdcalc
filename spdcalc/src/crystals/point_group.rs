/// Crystallographic Point Group
/// Hermann-Mauguin (Universal) short notation
/// Note: `s` represents `/` and `i` represents rotary-inversion
/// [More Information](https://en.wikipedia.org/wiki/Crystallographic_point_group)
#[allow(non_camel_case_types)]
#[derive(Debug)]
pub enum PointGroup {
  /// Triclinic 1
  HM_1,
  /// Triclinic -1
  HM_i1,

  /// Monoclinic 2
  HM_2,
  /// Monoclinic m
  HM_m,
  /// Monoclinic 2/m
  HM_2sm,

  /// Orthorhombic 222
  HM_222,
  /// Orthorhombic mm2
  HM_mm2,
  /// Orthorhombic mmm
  HM_mmm,

  /// Tetragonal 4
  HM_4,
  /// Tetragonal -4
  HM_i4,
  /// Tetragonal 4/m
  HM_4sm,
  /// Tetragonal 422
  HM_422,
  /// Tetragonal 4mm
  HM_4mm,
  /// Tetragonal -42m
  HM_i42m,
  /// Tetragonal 4/mmm
  HM_4smmm,

  /// Trigonal 3
  HM_3,
  /// Trigonal -3
  HM_i3,
  /// Trigonal 32
  HM_32,
  /// Trigonal 3m
  HM_3m,
  /// Trigonal -3m
  HM_i3m,

  /// Hexagonal 6
  HM_6,
  /// Hexagonal -6
  HM_i6,
  /// Hexagonal 6/m
  HM_6sm,
  /// Hexagonal 622
  HM_622,
  /// Hexagonal 6mm
  HM_6mm,
  /// Hexagonal -62m
  HM_i62m,
  /// Hexagonal 6/mmm
  HM_6smmm,

  /// Cubic 23
  HM_23,
  /// Cubic m-3
  HM_mi3,
  /// Cubic 432
  HM_432,
  /// Cubic -43m
  HM_i43m,
  /// Cubic m-3m
  HM_mi3m,
}
