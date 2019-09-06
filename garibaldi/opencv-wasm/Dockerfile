FROM rust:1.37.0-stretch as build
COPY . /
RUN apt-get remove python3 -y
RUN cargo build --release

