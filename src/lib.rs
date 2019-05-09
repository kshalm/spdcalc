mod utils;
extern crate num;
extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
// use std::f64::consts::PI;
use num::complex::Complex;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// lifted from the `console_log` example
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(a: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
#[no_mangle]
pub fn speed_test(amount: usize) -> String {
    let window = web_sys::window().expect("should have a window in this context");
    let performance = window
        .performance()
        .expect("performance should be available");

    let test_values = init(amount);

    // console_log!("WASM: Testing with {} calculations", test_values.len());

    let start = performance.now();

    let mut total = 0.0;
    for _i in 0..test_values.len() {
        total += calc( 1.0 / test_values[_i] );
    }

    let end = performance.now();

    let elapsed = end - start;
    // console_log!("WASM: Calculation took {} ms", elapsed);
    return format_args!("[{}, {}]", total, elapsed).to_string();
}

#[wasm_bindgen]
pub fn reserve_array_test(size: usize) -> String {
    let window = web_sys::window().expect("should have a window in this context");
    let performance = window
        .performance()
        .expect("performance should be available");

    let start = performance.now();

    let arr = init( size );

    let end = performance.now();
    let elapsed = end - start;

    return format_args!("[{}, {}]", size, elapsed).to_string();
}

// fn perf_to_system(amt: f64) -> SystemTime {
//     let secs = (amt as u64) / 1_000;
//     let nanos = ((amt as u32) % 1_000) * 1_000_000;
//     UNIX_EPOCH + Duration::new(secs, nanos)
// }

fn init(amount: usize) -> Vec<f64> {
    let mut test_values = vec![];
    test_values.reserve(amount);

    for _i in 0..amount {
        test_values.push( (_i + 1) as f64 );
    }

    return test_values;
}

fn calc(val: f64) -> f64 {
    let x = Complex::new(val, val * val);
    let y = x.sqrt() - x.exp();
    return y.norm();
}
