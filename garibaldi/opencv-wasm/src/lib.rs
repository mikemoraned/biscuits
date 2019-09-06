extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

use opencv::{core};

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    let zero = core::Scalar::new(0.0, 0.0, 0.0, 0.0);
    alert(&format!("OpenCV: {:?} to {}!", zero, name));
}
