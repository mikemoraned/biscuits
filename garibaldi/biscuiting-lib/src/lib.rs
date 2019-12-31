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

#[wasm_bindgen]
pub struct ContourFinder {
    contour: Option<Vec<u32>>,
}

#[wasm_bindgen]
impl ContourFinder {
    pub fn new() -> ContourFinder {
        console_error_panic_hook::set_once();
        ContourFinder { contour: None }
    }

    pub fn find(
        &mut self,
        width: u32,
        height: u32,
        input: Clamped<Vec<u8>>,
    ) -> Result<String, JsValue> {
        use web_sys::console;

        let input_foreground_color = Rgba([255u8; 4]);

        console::time_with_label("from raw input");
        match RgbaImage::from_raw(width, height, input.0) {
            Some(image) => {
                console::time_end_with_label("from raw input");
                match self.find_first_foreground_pixel(&input_foreground_color, &image) {
                    Some(start) => {
                        console::time_with_label("trace contour");
                        let mut contour = Vec::new();
                        contour.push((start.0, start.0));
                        self.trace_contour(
                            Turtle::new(start.0, start.1),
                            &image,
                            &input_foreground_color,
                            &mut contour,
                        );
                        console::time_end_with_label("trace contour");
                        console::time_with_label("save contour");
                        self.contour = Some(
                            contour
                                .into_iter()
                                .map(|(x, y)| vec![x, y])
                                .flatten()
                                .collect::<Vec<u32>>(),
                        );
                        console::time_end_with_label("save contour");

                        Ok("found contours".into())
                    }
                    None => {
                        self.contour = Some(Vec::new());
                        Ok("no contours present".into())
                    }
                }
            }
            None => Err("couldn't read from raw".into()),
        }
    }

    pub fn num_contour_points(&self) -> usize {
        match &self.contour {
            Some(vec) => vec.len() / 2,
            None => panic!("no contour"),
        }
    }

    pub fn contour_ptr(&self) -> *const u32 {
        match &self.contour {
            Some(vec) => vec.as_ptr(),
            None => panic!("no contour"),
        }
    }
}

#[derive(PartialEq, Debug)]
enum Direction {
    North,
    West,
    South,
    East,
}

#[derive(PartialEq, Debug)]
struct Turtle {
    x: i32,
    y: i32,
    direction: Direction,
}

impl Turtle {
    pub fn new(x: u32, y: u32) -> Turtle {
        Turtle {
            x: x as i32,
            y: y as i32,
            direction: Direction::East,
        }
    }

    pub fn left(&self) -> Turtle {
        use Direction::*;
        match self.direction {
            North => Turtle {
                x: self.x - 1,
                y: self.y,
                direction: West,
            },
            East => Turtle {
                x: self.x,
                y: self.y - 1,
                direction: North,
            },
            South => Turtle {
                x: self.x + 1,
                y: self.y,
                direction: East,
            },
            West => Turtle {
                x: self.x,
                y: self.y + 1,
                direction: South,
            },
        }
    }

    pub fn right(&self) -> Turtle {
        use Direction::*;
        match self.direction {
            North => Turtle {
                x: self.x + 1,
                y: self.y,
                direction: East,
            },
            East => Turtle {
                x: self.x,
                y: self.y + 1,
                direction: South,
            },
            South => Turtle {
                x: self.x - 1,
                y: self.y,
                direction: West,
            },
            West => Turtle {
                x: self.x,
                y: self.y - 1,
                direction: North,
            },
        }
    }
}

impl ContourFinder {
    pub fn contour(&self) -> Result<Vec<u32>, String> {
        match &self.contour {
            Some(vec) => Ok(vec.clone()),
            None => Err("no output".into()),
        }
    }

    fn find_first_foreground_pixel(
        &self,
        color: &Rgba<u8>,
        image: &RgbaImage,
    ) -> Option<(u32, u32)> {
        for (x, y, p) in image.enumerate_pixels() {
            if p == color {
                return Some((x, y));
            }
        }
        None
    }

    fn trace_contour(
        &self,
        start: Turtle,
        image: &RgbaImage,
        foreground_color: &Rgba<u8>,
        points: &mut Vec<(u32, u32)>,
    ) {
        let mut next = start.left();
        while next != start {
            if self.is_in_bounds(next.x, next.y, &image)
                && image.get_pixel(next.x as u32, next.y as u32) == foreground_color
            {
                points.push((next.x as u32, next.y as u32));
                next = next.left();
            } else {
                next = next.right();
            }
        }
    }

    fn is_in_bounds(&self, x: i32, y: i32, image: &RgbaImage) -> bool {
        (x >= 0 && x < image.width() as i32) && (y >= 0 && y < image.height() as i32)
    }
}

#[wasm_bindgen]
pub struct BiscuitFinder {
    colored_areas: Option<Vec<u8>>,
    bounding_boxes: Option<Vec<u32>>,
    bounding_boxes_color_map: Option<Vec<u8>>,
    color_map: Option<Vec<Rgba<u8>>>,
}

use image::{Rgba, RgbaImage};

fn gen_range(min: u8, max: u8) -> u8 {
    let random = js_sys::Math::random();
    return ((random * ((max - min + 1) as f64)).floor() as u8) + min;
}

fn random_color_map(num_labels: usize) -> Vec<Rgba<u8>> {
    use web_sys::console;

    let mut color_map = vec![Rgba([0u8; 4]); num_labels];
    color_map[0] = Rgba([0u8; 4]);
    for label in 1..num_labels {
        color_map[label] = Rgba([
            gen_range(1, 255),
            gen_range(1, 255),
            gen_range(1, 255),
            255u8,
        ]);
    }
    console::log_1(&format!("color map: {:?}", color_map).into());

    color_map
}

#[wasm_bindgen]
impl BiscuitFinder {
    pub fn new() -> BiscuitFinder {
        console_error_panic_hook::set_once();
        BiscuitFinder {
            colored_areas: None,
            bounding_boxes: None,
            bounding_boxes_color_map: None,
            color_map: Some(random_color_map(100)),
        }
    }

    pub fn find_biscuits(
        &mut self,
        width: u32,
        height: u32,
        input: Clamped<Vec<u8>>,
    ) -> Result<String, JsValue> {
        use image::{GrayImage, Luma};
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

                console::time_with_label("process image");
                let gray_image: GrayImage = map_colors(&image, |p| {
                    if p == input_background_color {
                        background_color
                    } else {
                        foreground_color
                    }
                });

                let labelled_image =
                    connected_components(&gray_image, Connectivity::Four, background_color);
                let num_labels = (labelled_image.pixels().map(|p| p[0]).max().unwrap()) as usize;
                let required_color_map_size = num_labels + 1;
                let color_map = self.stretch_color_map(required_color_map_size);
                let processed_gray_image =
                    map_colors(&labelled_image, |p| color_map[p[0] as usize]);

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

                let without_background_color_map = color_map.clone().split_off(1);
                let flattened_bounding_boxes_color_map = without_background_color_map
                    .into_iter()
                    .map(|color| vec![color[0], color[1], color[2], color[3]])
                    .flatten()
                    .collect::<Vec<u8>>();

                let without_background_bounding_box = bounding_boxes.split_off(1);
                let flattened_bounding_boxes = without_background_bounding_box
                    .into_iter()
                    .flatten()
                    .collect::<Vec<u32>>();
                self.bounding_boxes = Some(flattened_bounding_boxes);
                self.bounding_boxes_color_map = Some(flattened_bounding_boxes_color_map);
                console::time_end_with_label("finding bounding boxes");

                console::time_end_with_label("process image");

                console::time_with_label("to raw output");
                self.colored_areas = Some(processed_gray_image.to_vec());
                console::time_end_with_label("to raw output");
                return Ok("processed image".into());
            }
            None => {
                return Err("couldn't read from raw".into());
            }
        }
    }

    pub fn output_ptr(&self) -> *const u8 {
        match &self.colored_areas {
            Some(buffer) => buffer.as_ptr(),
            None => panic!("no output"),
        }
    }

    pub fn bounding_boxes_ptr(&self) -> *const u32 {
        match &self.bounding_boxes {
            Some(vec) => vec.as_ptr(),
            None => panic!("no bounding boxes"),
        }
    }

    pub fn bounding_boxes_color_map_ptr(&self) -> *const u8 {
        match &self.bounding_boxes_color_map {
            Some(vec) => vec.as_ptr(),
            None => panic!("no bounding boxes"),
        }
    }

    pub fn num_bounding_boxes(&self) -> usize {
        match &self.bounding_boxes {
            Some(vec) => vec.len() / 4,
            None => panic!("no bounding boxes"),
        }
    }
}

impl BiscuitFinder {
    fn stretch_color_map(&mut self, required_color_map_size: usize) -> &Vec<Rgba<u8>> {
        match &self.color_map {
            Some(map) => {
                if map.len() <= required_color_map_size {
                    self.color_map = Some(random_color_map(required_color_map_size));
                }
            }
            None => {
                self.color_map = Some(random_color_map(required_color_map_size));
            }
        };
        self.color_map.as_ref().unwrap()
    }

    pub fn output(&self) -> Result<Vec<u8>, String> {
        match &self.colored_areas {
            Some(buffer) => Ok(buffer.clone()),
            None => Err("no output".into()),
        }
    }

    pub fn bounding_boxes(&self) -> Result<Vec<u32>, String> {
        match &self.bounding_boxes {
            Some(vec) => Ok(vec.clone()),
            None => Err("no output".into()),
        }
    }
}

#[cfg(test)]
mod tests {
    extern crate wasm_bindgen_test;
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_contour_finding_with_centered_square() {
        let mut contour_finder = ContourFinder::new();

        let image = rgba_image!(
            [0,   0,   0,   255], [0,   0,   0,   255], [0,   0,   0,   255], [0,   0,   0,   255];
            [0,   0,   0,   255], [255, 255, 255, 255], [255, 255, 255, 255], [0,   0,   0,   255];
            [0,   0,   0,   255], [255, 255, 255, 255], [255, 255, 255, 255], [0,   0,   0,   255];
            [0,   0,   0,   255], [0,   0,   0,   255], [0,   0,   0,   255], [0,   0,   0,   255]);

        let input = Clamped(image.to_vec());
        let result = contour_finder.find(4, 4, input);

        assert_eq!(Ok("found contours".into()), result);

        assert_eq!(4, contour_finder.num_contour_points());
        let contour = contour_finder.contour();
        assert_eq!(Ok(vec![1, 1, 2, 1, 2, 2, 1, 2]), contour);
    }

    #[wasm_bindgen_test]
    fn test_when_only_background_pixels_provided() {
        let mut biscuit_finder = BiscuitFinder::new();

        let image = rgba_image!(
            [255, 255, 255, 255], [255, 255, 255, 255];
            [255, 255, 255, 255], [255, 255, 255, 255]);

        let input = Clamped(image.to_vec());
        let result = biscuit_finder.find_biscuits(2, 2, input);

        assert_eq!(Ok("processed image".into()), result);

        let output = biscuit_finder.output();
        assert!(output.is_ok());

        assert_eq!(0, biscuit_finder.num_bounding_boxes());
        let bounding_boxes = biscuit_finder.bounding_boxes();
        assert_eq!(Ok(vec![]), bounding_boxes);
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

        let output = biscuit_finder.output();
        assert!(output.is_ok());

        assert_eq!(1, biscuit_finder.num_bounding_boxes());
        let bounding_boxes = biscuit_finder.bounding_boxes();
        assert_eq!(Ok(vec![0, 0, 1, 1]), bounding_boxes);
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

        let output = biscuit_finder.output();
        assert!(output.is_ok());

        assert_eq!(1, biscuit_finder.num_bounding_boxes());
        let bounding_boxes = biscuit_finder.bounding_boxes();
        assert_eq!(Ok(vec![1, 1, 3, 3]), bounding_boxes);
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

        let output = biscuit_finder.output();
        assert!(output.is_ok());

        assert_eq!(4, biscuit_finder.num_bounding_boxes());
        let bounding_boxes = biscuit_finder.bounding_boxes();
        assert_eq!(
            Ok(vec![
                1, 1, 2, 2, //
                3, 1, 4, 2, //
                1, 3, 2, 4, //
                3, 3, 4, 4, //
            ]),
            bounding_boxes
        );
    }
}
