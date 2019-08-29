use std::path::PathBuf;

use opencv::{core, imgcodecs, imgproc, objdetect, prelude::*, types::VectorOfPoint, Result};

fn detect_components() -> Result<()> {
    let binary_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("binary.png");
    let components_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("components.png");
    let src = imgcodecs::imread(binary_path.to_str().unwrap(), imgcodecs::IMREAD_GRAYSCALE)?;
    let mut labels = Mat::default()?;

    imgproc::connected_components(&src, &mut labels, 8, core::CV_32S)?;

    let params = opencv::types::VectorOfint::new();
    imgcodecs::imwrite(components_path.to_str().unwrap(), &labels, &params)?;

    Ok(())
}

fn main() {
    println!("{:?}", detect_components());
}
