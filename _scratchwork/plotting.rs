
fn calc_JSI_grid( plot_dimensions :GridSize, parameters :Parameters ) -> Plot2d {
    let len = x * y;
    let arr :Vec<f64> = Vec::with_capacity( len );

    Plot2d {
        dimensions: plot_dimensions,
        parameters: parameters,
        data: arr,
    }
}

struct Range {
    min: f64,
    max: f64,
    step: u32,
}

struct GridSize {
    x: Range,
    y: Range,
}

impl GridSize {
    fn new(xmin :f64, xmax :f64, ymin :f64, ymax :f64, dim: usize ) -> GridSize {
        GridSize {
            x: Range { min: xmin, max: xmax, step: dim },
            y: Range { min: ymin, max: ymax, step: dim },
        }
    }

    fn get_length(&self) -> usize {
        self.x.step * self.y.step
    }

    fn to_slices( &self, divisions: usize ) -> GridSize {
        // slice grid into...
    }
}

let grid_size = GridSize::new( lamda_s_min, lamda_s_max, lamda_i_min, lamda_i_max, 100 );

let jobs = grid_size.slice( n_workers );

let results = jobs.iter().map(move |job| calc_JSI_grid( job, parameters )).collect();

Plot2d::stitch_together( results ) // .reduce( Plot2d::stitch_together ) then normalize
