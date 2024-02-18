// Define the structure of the geomagnetism object


declare class MagneticElements {
  x: number;
  y: number;
  z: number;
  h: number;
  f: number;
  incl: number;
  decl: number;
  gv: number;
  xdot: number;
  ydot: number;
  zdot: number;
  hdot: number;
  fdot: number;
  incldot: number;
  decldot: number;
  gvdot: number;

  constructor(options: {
    x?: number;
    y?: number;
    z?: number;
    h?: number;
    f?: number;
    incl?: number;
    decl?: number;
    gv?: number;
    xdot?: number;
    ydot?: number;
    zdot?: number;
    hdot?: number;
    fdot?: number;
    incldot?: number;
    decldot?: number;
    gvdot?: number;
  });

  static fromGeoMagneticVector(magnetic_vector: {
    bx: number; by: number; bz: number;
  }): MagneticElements;

  static fromSecularVariationVector(magnetic_variation: {
    bx: number; by: number; bz: number;
  }): MagneticElements;

  clone(): MagneticElements;

  scale(factor: number): MagneticElements;

  subtract(subtrahend: MagneticElements): MagneticElements;
}

declare class Model {
  epoch: number;
  start_date: Date;
  end_date: Date;
  name: string;
  main_field_coeff_g: number[];
  main_field_coeff_h: number[];
  secular_var_coeff_g: number[];
  secular_var_coeff_h: number[];
  n_max: number;
  n_max_sec_var: number;
  num_terms: number;

  constructor(options: ModelOptions);

  getTimedModel(date: Date): Model;

  getSummation(legendre: LegendreFunction, sph_variables: SphericalVariables, coord_spherical: CoordSpherical): MagneticVectorSph;

  point(coords: [number, number]): MagneticElements;
}

declare module "geomagnetism" {
  function model(date?: Date): Model; // Replace 'any' with the actual return type of the model function
}

