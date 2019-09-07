extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) {
    use web_sys::console;

    console::log_1(&format!("Hello, {}!", name).into());
}
