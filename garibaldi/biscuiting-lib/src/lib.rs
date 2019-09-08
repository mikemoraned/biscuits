extern crate base64;
extern crate image;
extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn find_biscuits(image_data_uri_str: &str) -> Result<String, JsValue> {
    use base64::{decode, encode};
    use image::{load_from_memory_with_format, DynamicImage, ImageFormat, ImageOutputFormat};
    use imageproc::noise::salt_and_pepper_noise;
    use url::Url;
    use web_sys::console;

    console::time_with_label("parse data url");
    match Url::parse(image_data_uri_str) {
        Ok(image_data_uri) => {
            console::time_end_with_label("parse data url");
            console::time_with_label("trim url");
            let path = image_data_uri.path();
            let prefix = "image/png;base64,";
            if path.starts_with(prefix) {
                let image_base64 = path.trim_start_matches(prefix);
                console::time_end_with_label("trim url");

                console::time_with_label("decode base64");
                match decode(image_base64) {
                    Ok(image_bytes) => {
                        console::time_end_with_label("decode base64");
                        console::time_with_label("decode png");
                        match load_from_memory_with_format(&image_bytes, ImageFormat::PNG) {
                            Ok(image) => match image {
                                DynamicImage::ImageRgba8(rgba_image) => {
                                    console::time_end_with_label("decode png");
                                    console::time_with_label("process image");
                                    let modified_image = DynamicImage::ImageRgba8(
                                        salt_and_pepper_noise(&rgba_image, 0.1, 1),
                                    );
                                    console::time_end_with_label("process image");
                                    console::time_with_label("encode png");
                                    let mut modified_image_bytes = vec![];
                                    modified_image
                                        .write_to(&mut modified_image_bytes, ImageOutputFormat::PNG)
                                        .unwrap();
                                    console::time_end_with_label("encode png");
                                    console::time_with_label("encode base64");
                                    let modified_image_base64 = encode(&modified_image_bytes);
                                    console::time_end_with_label("encode base64");
                                    console::time_with_label("encode data url");
                                    let mut modified_image_uri = image_data_uri.clone();
                                    modified_image_uri
                                        .set_path(&format!("{}{}", prefix, modified_image_base64));
                                    console::time_end_with_label("encode data url");
                                    return Ok(modified_image_uri.as_str().into());
                                }
                                _ => {
                                    return Err(format!("got some other image type").into());
                                }
                            },
                            Err(error) => {
                                return Err(format!("image error: {:?}", error).into());
                            }
                        }
                    }
                    Err(error) => {
                        return Err(format!("{:?}", error).into());
                    }
                }
            } else {
                return Err(format!("did not find {:?}", prefix).into());
            }
        }
        Err(error) => {
            return Err(format!("{:?}", error).into());
        }
    }
}
