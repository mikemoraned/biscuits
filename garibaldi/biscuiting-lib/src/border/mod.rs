use image::{ImageBuffer, Luma};

mod turtle;

pub struct BorderFinder {}

impl BorderFinder {
    pub fn find_in_image(
        input_foreground_color: &Luma<u32>,
        image: &ImageBuffer<Luma<u32>, Vec<u32>>,
    ) -> Option<Vec<u32>> {
        match BorderFinder::find_first_foreground_pixel(input_foreground_color, image) {
            Some(start) => {
                let mut border = Vec::new();
                border.push((start.0, start.0));
                BorderFinder::trace_border(
                    turtle::Turtle::new(start.0, start.1),
                    image,
                    input_foreground_color,
                    &mut border,
                );
                let flattened_border = border
                    .into_iter()
                    .map(|(x, y)| vec![x, y])
                    .flatten()
                    .collect::<Vec<u32>>();
                return Some(flattened_border);
            }
            None => None,
        }
    }

    fn find_first_foreground_pixel(
        color: &Luma<u32>,
        image: &ImageBuffer<Luma<u32>, Vec<u32>>,
    ) -> Option<(u32, u32)> {
        for (x, y, p) in image.enumerate_pixels() {
            if p == color {
                return Some((x, y));
            }
        }
        None
    }

    fn trace_border(
        start: turtle::Turtle,
        image: &ImageBuffer<Luma<u32>, Vec<u32>>,
        foreground_color: &Luma<u32>,
        points: &mut Vec<(u32, u32)>,
    ) {
        let mut next = start.left();
        while next != start {
            if BorderFinder::is_in_bounds(next.x, next.y, &image)
                && image.get_pixel(next.x as u32, next.y as u32) == foreground_color
            {
                points.push((next.x as u32, next.y as u32));
                next = next.left();
            } else {
                next = next.right();
            }
        }
    }

    fn is_in_bounds(x: i32, y: i32, image: &ImageBuffer<Luma<u32>, Vec<u32>>) -> bool {
        (x >= 0 && x < image.width() as i32) && (y >= 0 && y < image.height() as i32)
    }
}

#[cfg(test)]
mod tests {
    extern crate wasm_bindgen_test;
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_with_centered_squaree() {
        let image = gray_image!(type: u32,
            0,   0,   0, 0;
            0, 255, 255, 0;
            0, 255, 255, 0;
            0,   0,   0, 0);

        let input_foreground_color = Luma([255u32; 1]);

        let border = BorderFinder::find_in_image(&input_foreground_color, &image);

        assert_eq!(Some(vec![1, 1, 2, 1, 2, 2, 1, 2]), border);
    }

    #[wasm_bindgen_test]
    fn test_with_single_pixel_in_top_left_corner() {
        let image = gray_image!(type: u32,
            255, 0;  
              0, 0);

        let input_foreground_color = Luma([255u32; 1]);

        let border = BorderFinder::find_in_image(&input_foreground_color, &image);

        assert_eq!(Some(vec![0, 0, 0, 0]), border);
    }
}
