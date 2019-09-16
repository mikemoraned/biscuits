extern crate base64;
extern crate console_error_panic_hook;
extern crate image;
extern crate js_sys;
extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;

#[wasm_bindgen]
pub struct BiscuitFinder {
    width: u32,
    height: u32,
    output: Option<Vec<u8>>,
}

use image::{Rgba, RgbaImage};

fn gen_range(min: u8, max: u8) -> u8 {
    let random = js_sys::Math::random();
    return ((random * ((max - min + 1) as f64)).floor() as u8) + min;
}

#[wasm_bindgen]
impl BiscuitFinder {
    pub fn new(width: u32, height: u32) -> BiscuitFinder {
        console_error_panic_hook::set_once();
        BiscuitFinder {
            width,
            height,
            output: None,
        }
    }

    fn random_color_map(&self, num_labels: usize) -> Vec<Rgba<u8>> {
        use web_sys::console;

        let mut color_map = vec![Rgba([0u8; 4]); num_labels];
        color_map[0] = Rgba([0u8; 4]);
        for label in 1..num_labels {
            color_map[label] = Rgba([gen_range(1, 255), gen_range(1, 255), gen_range(1, 255), 0u8]);
        }
        console::log_1(&format!("color map: {:?}", color_map).into());

        color_map
    }

    pub fn find_biscuits(&mut self, input: Clamped<Vec<u8>>) -> Result<String, JsValue> {
        use image::{GrayImage, Luma};
        use imageproc::map::map_colors;
        use imageproc::region_labelling::{connected_components, Connectivity};
        use web_sys::console;

        let len = input.0.len();
        console::log_1(
            &format!(
                "raw input [{}, {}, {}, {}], [{}, {}, {}, {}]",
                input.0[0],
                input.0[1],
                input.0[2],
                input.0[3],
                input.0[len - 4],
                input.0[len - 3],
                input.0[len - 2],
                input.0[len - 1]
            )
            .into(),
        );

        console::time_with_label("from raw input");
        match RgbaImage::from_raw(self.width, self.height, input.0) {
            Some(image) => {
                console::time_end_with_label("from raw input");

                let top_left = image.get_pixel(0, 0);
                let bottom_right = image.get_pixel(self.width - 1, self.height - 1);
                console::log_1(
                    &format!(
                        "rgba [{}, {}, {}, {}], [{}, {}, {}, {}]",
                        top_left[0],
                        top_left[1],
                        top_left[2],
                        top_left[3],
                        bottom_right[0],
                        bottom_right[1],
                        bottom_right[2],
                        bottom_right[3]
                    )
                    .into(),
                );

                console::time_with_label("process image");
                let gray_image: GrayImage = map_colors(&image, |p| {
                    let avg = ((p[0] as f32) + (p[1] as f32) + (p[2] as f32)) / 3.0;
                    let alpha = p[3] as f32 / std::u8::MAX as f32;
                    let gray = (alpha * avg).floor() as u8;
                    let inverted_gray = 255 - gray;
                    if inverted_gray < 128 {
                        Luma([0u8; 1])
                    } else {
                        Luma([255u8; 1])
                    }
                });

                let background_color = Luma([0u8; 1]);
                let labelled_image =
                    connected_components(&gray_image, Connectivity::Four, background_color);
                let num_labels = (labelled_image.pixels().map(|p| p[0]).max().unwrap()) as usize;
                let color_map = self.random_color_map(num_labels + 1);
                let processed_gray_image =
                    map_colors(&labelled_image, |p| color_map[p[0] as usize]);

                console::time_end_with_label("process image");

                console::time_with_label("to raw output");
                // let remapped_to_rgba_image: RgbaImage = map_colors(&gray_image, |p| {
                let remapped_to_rgba_image: RgbaImage = map_colors(&processed_gray_image, |p| {
                    let gray = p[0];
                    Rgba([gray, gray, gray, 255])
                });
                self.output = Some(remapped_to_rgba_image.to_vec());
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
