use rand::prelude::*;
use std::path::PathBuf;

use opencv::{core, core::Vec3b, imgcodecs, imgproc, prelude::*, Result};

fn random_color_map(num_labels: usize) -> Vec<Vec3b> {
    let mut color_map: Vec<Vec3b> = vec![Vec3b::default(); num_labels];
    let mut rng = thread_rng();
    color_map[0] = Vec3b::default();
    for label in 1..num_labels {
        color_map[label] = Vec3b::from([
            rng.gen_range(0, 255),
            rng.gen_range(0, 255),
            rng.gen_range(0, 255),
        ]);
    }
    println!("color map: {:?}", color_map);

    color_map
}

fn label_components(component_image: &Mat, num_components: usize) -> Result<Mat> {
    println!("num labels: {}", num_components);

    let color_map = random_color_map(num_components);

    let mut label_image = unsafe { Mat::new_size(component_image.size()?, core::CV_8UC3)? };
    for row in 0..label_image.rows()? {
        for col in 0..label_image.cols()? {
            let component = component_image.at_2d::<i32>(row, col)?;
            *label_image.at_2d_mut::<Vec3b>(row, col)? = color_map[*component as usize];
        }
    }

    Ok(label_image)
}

fn detect_components(src_path: PathBuf, components_path: PathBuf) -> Result<()> {
    let src = imgcodecs::imread(src_path.to_str().unwrap(), imgcodecs::IMREAD_GRAYSCALE)?;
    let mut src_bw = unsafe { Mat::new_size(src.size()?, core::CV_32S)? };
    imgproc::threshold(&src, &mut src_bw, 128.0, 255.0, imgproc::THRESH_BINARY)?;
    let mut component_image = unsafe { Mat::new_size(src.size()?, core::CV_32S)? };
    let num_components =
        imgproc::connected_components(&src_bw, &mut component_image, 8, core::CV_32S)? as usize;

    let label_image = label_components(&component_image, num_components)?;

    let params = opencv::types::VectorOfint::new();
    imgcodecs::imwrite(components_path.to_str().unwrap(), &label_image, &params)?;

    Ok(())
}

fn main() {
    let src_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("greyscale.png");
    let components_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("components.png");

    println!("{:?}", detect_components(src_path, components_path));
}
