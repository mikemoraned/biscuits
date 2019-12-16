# Building

    wasm-pack build

# Sharing locally

In current dir:

    cd pkg
    npm link

Elsewhere, where we want to use the locally published version:

    npm link biscuiting-lib

# Publishing

    wasm-pack publish
