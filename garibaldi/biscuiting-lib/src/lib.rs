extern crate base64;
extern crate image;
extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;

#[wasm_bindgen]
pub struct BiscuitFinder {
    width: u32,
    height: u32,
    output: Option<Vec<u8>>,
}

fn performance() -> web_sys::Performance {
    let window = web_sys::window().expect("should have a window in this context");
    window
        .performance()
        .expect("performance should be available")
}

#[wasm_bindgen]
impl BiscuitFinder {
    pub fn new(width: u32, height: u32) -> BiscuitFinder {
        BiscuitFinder {
            width,
            height,
            output: None,
        }
    }

    pub fn find_biscuits(&mut self, input: Clamped<Vec<u8>>) -> Result<String, JsValue> {
        use image::RgbaImage;
        use imageproc::noise::salt_and_pepper_noise;
        use web_sys::console;

        console::time_with_label("from raw input");
        match RgbaImage::from_raw(self.width, self.height, input.0) {
            Some(image) => {
                console::time_end_with_label("from raw input");

                console::time_with_label("process image");
                let seed = performance().now();
                let processed_image = salt_and_pepper_noise(&image, 0.1, seed as u64);
                console::time_end_with_label("process image");

                console::time_with_label("to raw output");
                self.output = Some(processed_image.to_vec());
                console::time_end_with_label("to raw output");

                return Ok("processed image".into());
            }
            None => {
                return Err("couldn't read from raw".into());
            }
        }
    }

    pub fn output(&self) -> *const u8 {
        match &self.output {
            Some(buffer) => buffer.as_ptr(),
            None => panic!("no output"),
        }
    }
}
