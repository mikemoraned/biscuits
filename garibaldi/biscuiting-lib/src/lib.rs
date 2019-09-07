extern crate base64;
extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn find_biscuits(image_data_uri_str: &str) {
    use base64::decode;
    use url::Url;
    use web_sys::console;

    console::log_1(&format!("received '{}'", image_data_uri_str).into());

    match Url::parse(image_data_uri_str) {
        Ok(image_data_uri) => {
            console::log_1(&format!("uri: '{:?}'", image_data_uri).into());
            console::log_1(
                &format!(
                    "uri parts: scheme: '{:?}', path: '{:?}'",
                    image_data_uri.scheme(),
                    image_data_uri.path()
                )
                .into(),
            );

            let path = image_data_uri.path();
            let prefix = "image/png;base64,";
            if path.starts_with(prefix) {
                let image_base64 = path.trim_start_matches(prefix);
                console::log_1(&format!("base64: {}", image_base64).into());

                match decode(image_base64) {
                    Ok(image_bytes) => {
                        console::log_1(&format!("got bytes: {}", image_bytes.len()).into());
                    }
                    Err(error) => {
                        console::error_1(&format!("{:?}", error).into());
                    }
                }
            } else {
                console::error_1(&format!("did not find {:?}", prefix).into());
            }
        }
        Err(error) => {
            console::error_1(&format!("{:?}", error).into());
        }
    }
}
