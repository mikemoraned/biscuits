use image::GenericImage;

mod turtle;

pub struct BorderFinder {}

impl BorderFinder {
    pub fn find_in_image<I>(input_foreground_color: I::Pixel, image: &I) -> Option<Vec<u32>>
    where
        I: GenericImage,
        I::Pixel: std::cmp::Eq,
    {
        match BorderFinder::find_first_foreground_pixel(input_foreground_color, image) {
            Some(start) => {
                let mut border = Vec::new();
                border.push((start.0, start.1));
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

    fn find_first_foreground_pixel<I>(color: I::Pixel, image: &I) -> Option<(u32, u32)>
    where
        I: GenericImage,
        I::Pixel: std::cmp::Eq,
    {
        for y in 0..image.width() {
            for x in 0..image.height() {
                let p = image.get_pixel(x, y);
                if p == color {
                    return Some((x, y));
                }
            }
        }
        None
    }

    fn trace_border<I>(
        start: turtle::Turtle,
        image: &I,
        foreground_color: I::Pixel,
        points: &mut Vec<(u32, u32)>,
    ) where
        I: GenericImage,
        I::Pixel: std::cmp::Eq,
    {
        let mut next = start.left();
        while next != start {
            if BorderFinder::is_in_bounds(next.x, next.y, image)
                && image.get_pixel(next.x as u32, next.y as u32) == foreground_color
            {
                points.push((next.x as u32, next.y as u32));
                next = next.left();
            } else {
                next = next.right();
            }
        }
    }

    fn is_in_bounds<I>(x: i32, y: i32, image: &I) -> bool
    where
        I: GenericImage,
    {
        (x >= 0 && x < image.width() as i32) && (y >= 0 && y < image.height() as i32)
    }
}

#[cfg(test)]
mod tests {
    extern crate wasm_bindgen_test;
    use super::*;
    use image::Luma;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_with_centered_squaree() {
        let mut image = gray_image!(type: u32,
            0,   0,   0, 0;
            0, 255, 255, 0;
            0, 255, 255, 0;
            0,   0,   0, 0);

        let input_foreground_color = Luma([255u32; 1]);

        let sub_image = image.sub_image(0, 0, image.width(), image.height());

        let border = BorderFinder::find_in_image(input_foreground_color, &sub_image);

        assert_eq!(Some(vec![1, 1, 2, 1, 2, 2, 1, 2]), border);
    }

    #[wasm_bindgen_test]
    fn test_with_x_offset_square() {
        let mut image = gray_image!(type: u32,
            0,   0,   0,   0;
            0,   0, 255, 255;
            0,   0, 255, 255;
            0,   0,   0,   0);

        let input_foreground_color = Luma([255u32; 1]);

        let sub_image = image.sub_image(0, 0, image.width(), image.height());

        let border = BorderFinder::find_in_image(input_foreground_color, &sub_image);

        assert_eq!(Some(vec![2, 1, 3, 1, 3, 2, 2, 2]), border);
    }

    #[wasm_bindgen_test]
    fn test_with_y_offset_square() {
        let mut image = gray_image!(type: u32,
            0,   0,   0, 0;
            0,   0,   0, 0;
            0, 255, 255, 0;
            0, 255, 255, 0);

        let input_foreground_color = Luma([255u32; 1]);

        let sub_image = image.sub_image(0, 0, image.width(), image.height());

        let border = BorderFinder::find_in_image(input_foreground_color, &sub_image);

        assert_eq!(Some(vec![1, 2, 2, 2, 2, 3, 1, 3]), border);
    }

    #[wasm_bindgen_test]
    fn test_with_single_pixel_in_top_left_corner() {
        let mut image = gray_image!(type: u32,
            255, 0;
              0, 0);

        let input_foreground_color = Luma([255u32; 1]);

        let sub_image = image.sub_image(0, 0, image.width(), image.height());

        let border = BorderFinder::find_in_image(input_foreground_color, &sub_image);

        assert_eq!(Some(vec![0, 0, 0, 0]), border);
    }
}
