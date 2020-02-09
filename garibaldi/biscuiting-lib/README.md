# Building

    wasm-pack build --scope mike_moran

# Sharing locally

In current dir:

    cd pkg
    npm link

Elsewhere, where we want to use the locally published version:

    npm link biscuiting-lib

# Publishing

    wasm-pack publish
