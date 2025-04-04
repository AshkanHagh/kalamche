# NOTE: docker file not working. fix
FROM registry.docker.ir/lukemathwalker/cargo-chef:latest-rust-1.85.0-alpine as chef
WORKDIR /app

FROM chef AS planner

COPY ./Cargo.toml ./Cargo.lock ./
COPY ./crates ./crates

RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder

RUN apk add --no-cache openssl-dev

COPY --from=planner /app/recipe.json .
RUN cargo chef cook --release

COPY . .

RUN cargo build --release
RUN mv ./target/release/server ./server

FROM scratch AS runtime
WORKDIR /app
COPY --from=builder /app/server /usr/local/bin/

EXPOSE 7319
ENTRYPOINT ["/usr/local/bin/server"]
