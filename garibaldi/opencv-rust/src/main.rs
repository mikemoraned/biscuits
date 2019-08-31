use rand::prelude::*;
use std::path::PathBuf;

use opencv::{core, core::Vec3b, imgcodecs, imgproc, prelude::*, Result};

fn random_color_map(num_labels: i32) -> Vec<Vec3b> {
    let mut color_map: Vec<Vec3b> = vec![Vec3b::default(); num_labels as usize];
    let mut rng = thread_rng();
    color_map[0] = Vec3b::default();
    for label in 1..num_labels {
        color_map[label as usize] = Vec3b::from([
            rng.gen_range(0, 255),
            rng.gen_range(0, 255),
            rng.gen_range(0, 255),
        ]);
    }
    println!("color map: {:?}", color_map);

    color_map
}

fn detect_components() -> Result<()> {
    let binary_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("greyscale.png");
    let components_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("components.png");

    let src = imgcodecs::imread(binary_path.to_str().unwrap(), imgcodecs::IMREAD_GRAYSCALE)?;
    let mut src_bw = unsafe { Mat::new_size(src.size()?, core::CV_32S)? };
    imgproc::threshold(&src, &mut src_bw, 128.0, 255.0, imgproc::THRESH_BINARY)?;
    let mut label_image = unsafe { Mat::new_size(src.size()?, core::CV_32S)? };

    let num_labels = imgproc::connected_components(&src_bw, &mut label_image, 8, core::CV_32S)?;
    println!("num labels: {}", num_labels);

    let color_map = random_color_map(num_labels);

    let mut dest = unsafe { Mat::new_size(src.size()?, core::CV_8UC3)? };
    for row in 0..dest.rows()? {
        for col in 0..dest.cols()? {
            let label = label_image.at_2d::<i32>(row, col)?;
            // println!("{}", label);
            *dest.at_2d_mut::<Vec3b>(row, col)? = color_map[*label as usize];
        }
    }

    let params = opencv::types::VectorOfint::new();
    imgcodecs::imwrite(components_path.to_str().unwrap(), &dest, &params)?;

    Ok(())
}

fn main() {
    println!("{:?}", detect_components());
}