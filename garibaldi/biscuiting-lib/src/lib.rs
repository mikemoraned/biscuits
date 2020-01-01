extern crate base64;
extern crate console_error_panic_hook;
extern crate image;
#[macro_use]
extern crate imageproc;
extern crate js_sys;
extern crate wasm_bindgen;
#[cfg(feature = "wee_alloc")]
extern crate wee_alloc;

use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

mod border;
use border::BorderFinder;

#[wasm_bindgen]
pub struct BiscuitFinder {
    border_indexes: Option<Vec<usize>>,
    border_points: Option<Vec<u32>>,
}

use image::{Rgba, RgbaImage};

#[wasm_bindgen]
impl BiscuitFinder {
    pub fn new() -> BiscuitFinder {
        console_error_panic_hook::set_once();
        BiscuitFinder {
            border_indexes: None,
            border_points: None,
        }
    }

    pub fn find_biscuits(
        &mut self,
        width: u32,
        height: u32,
        input: Clamped<Vec<u8>>,
    ) -> Result<String, JsValue> {
        use image::{GrayImage, Luma, SubImage};
        use imageproc::definitions::Image;
        use imageproc::map::map_colors;
        use imageproc::region_labelling::{connected_components, Connectivity};
        use std::cmp::{max, min};
        use web_sys::console;

        let input_background_color = Rgba([255u8; 4]);

        console::time_with_label("from raw input");
        match RgbaImage::from_raw(width, height, input.0) {
            Some(image) => {
                console::time_end_with_label("from raw input");

                let foreground_color = Luma([255u8; 1]);
                let background_color = Luma([0u8; 1]);

                console::time_with_label("find components");
                let gray_image: GrayImage = map_colors(&image, |p| {
                    if p == input_background_color {
                        background_color
                    } else {
                        foreground_color
                    }
                });

                let labelled_image: Image<Luma<u32>> =
                    connected_components(&gray_image, Connectivity::Four, background_color);
                let num_labels = (labelled_image.pixels().map(|p| p[0]).max().unwrap()) as usize;
                console::time_end_with_label("find components");

                console::time_with_label("finding bounding boxes");
                let mut bounding_boxes = Vec::new();
                bounding_boxes.resize_with(num_labels + 1, || vec![width, height, 0, 0]);
                for (x, y, p) in labelled_image.enumerate_pixels() {
                    let label_id = p[0] as usize;
                    let current_bounding_box = &mut bounding_boxes[label_id];
                    current_bounding_box[0] = min(x, current_bounding_box[0]);
                    current_bounding_box[1] = min(y, current_bounding_box[1]);
                    current_bounding_box[2] = max(x + 1, current_bounding_box[2]);
                    current_bounding_box[3] = max(y + 1, current_bounding_box[3]);
                }
                console::time_end_with_label("finding bounding boxes");

                console::time_with_label("finding borders");
                let mut border_indexes = Vec::with_capacity(num_labels);
                let mut border_points = Vec::new();
                let mut start_index: usize = 0;
                for label_id in 1..=num_labels {
                    let foreground_color = Luma([label_id as u32]);
                    let bounding_box = &bounding_boxes[label_id];
                    let (min_x, min_y, max_x, max_y) = (
                        bounding_box[0],
                        bounding_box[1],
                        bounding_box[2],
                        bounding_box[3],
                    );
                    let sub_image =
                        SubImage::new(&labelled_image, min_x, min_y, max_x - min_x, max_y - min_y);
                    let border =
                        BorderFinder::find_in_image(&foreground_color, &sub_image.to_image())
                            .unwrap();
                    border_indexes.push(start_index + border.len());
                    start_index += border.len();
                    for chunk in border.chunks(2) {
                        let x = chunk[0] + min_x;
                        let y = chunk[1] + min_y;
                        border_points.push(x);
                        border_points.push(y);
                    }
                }
                self.border_indexes = Some(border_indexes);
                self.border_points = Some(border_points);
                console::time_end_with_label("finding borders");

                return Ok("processed image".into());
            }
            None => {
                return Err("couldn't read from raw".into());
            }
        }
    }

    pub fn border_indexes_ptr(&self) -> *const usize {
        match &self.border_indexes {
            Some(vec) => vec.as_ptr(),
            None => panic!("no border indexes"),
        }
    }

    pub fn num_borders(&self) -> usize {
        match &self.border_indexes {
            Some(vec) => vec.len(),
            None => panic!("no borders"),
        }
    }

    pub fn border_points_ptr(&self) -> *const u32 {
        match &self.border_points {
            Some(vec) => vec.as_ptr(),
            None => panic!("no border points"),
        }
    }

    pub fn num_border_points(&self) -> usize {
        match &self.border_points {
            Some(vec) => vec.len() / 2,
            None => panic!("no border points"),
        }
    }
}

impl BiscuitFinder {
    pub fn border_points(&self) -> Result<Vec<u32>, String> {
        match &self.border_points {
            Some(vec) => Ok(vec.clone()),
            None => panic!("no border points"),
        }
    }
}

#[cfg(test)]
mod tests {
    extern crate wasm_bindgen_test;
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_when_only_background_pixels_provided() {
        let mut biscuit_finder = BiscuitFinder::new();

        let image = rgba_image!(
            [255, 255, 255, 255], [255, 255, 255, 255];
            [255, 255, 255, 255], [255, 255, 255, 255]);

        let input = Clamped(image.to_vec());
        let result = biscuit_finder.find_biscuits(2, 2, input);

        assert_eq!(Ok("processed image".into()), result);

        assert_eq!(0, biscuit_finder.num_borders());
        let border_points = biscuit_finder.border_points();
        assert_eq!(Ok(vec![]), border_points);
    }

    #[wasm_bindgen_test]
    fn test_with_single_pixel_biscuit_in_top_left_corner() {
        let mut biscuit_finder = BiscuitFinder::new();

        let image = rgba_image!(
            [0,     0,   0, 255], [255, 255, 255, 255];
            [255, 255, 255, 255], [255, 255, 255, 255]);

        let input = Clamped(image.to_vec());
        let result = biscuit_finder.find_biscuits(2, 2, input);

        assert_eq!(Ok("processed image".into()), result);

        assert_eq!(1, biscuit_finder.num_borders());
        let border_points = biscuit_finder.border_points();
        assert_eq!(Ok(vec![0, 0, 0, 0]), border_points);
    }

    #[wasm_bindgen_test]
    fn test_with_big_biscuit_in_middle() {
        let mut biscuit_finder = BiscuitFinder::new();

        let image = rgba_image!(
            [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255];
            [255, 255, 255, 255], [0,     0,   0, 255], [0,     0,   0, 255], [255, 255, 255, 255];
            [255, 255, 255, 255], [0,     0,   0, 255], [0,     0,   0, 255], [255, 255, 255, 255];
            [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255]);

        let input = Clamped(image.to_vec());
        let result = biscuit_finder.find_biscuits(4, 4, input);

        assert_eq!(Ok("processed image".into()), result);

        assert_eq!(1, biscuit_finder.num_borders());
        let border_points = biscuit_finder.border_points();
        assert_eq!(Ok(vec![1, 1, 2, 1, 2, 2, 1, 2]), border_points);
    }

    #[wasm_bindgen_test]
    fn test_with_multiple_biscuits() {
        let mut biscuit_finder = BiscuitFinder::new();

        let image = rgba_image!(
            [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255];
            [255, 255, 255, 255], [0,     0,   0, 255], [255, 255, 255, 255], [0,     0,   0, 255], [255, 255, 255, 255];
            [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255];
            [255, 255, 255, 255], [0,     0,   0, 255], [255, 255, 255, 255], [0,     0,   0, 255], [255, 255, 255, 255];
            [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255]);

        let input = Clamped(image.to_vec());
        let result = biscuit_finder.find_biscuits(5, 5, input);

        assert_eq!(Ok("processed image".into()), result);

        assert_eq!(4, biscuit_finder.num_borders());
        let border_points = biscuit_finder.border_points();
        assert_eq!(
            Ok(vec![
                1, 1, 1, 1, //
                3, 1, 3, 1, //
                1, 3, 1, 3, //
                3, 3, 3, 3, //
            ]),
            border_points
        );
    }
}
