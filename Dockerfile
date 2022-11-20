FROM node:19-alpine3.15 as FRONTEND_BUILD
WORKDIR /app/frontend/
COPY frontend/package*.json .
RUN npm install
COPY frontend/ .
RUN npm run build

FROM rust:1.64-buster
WORKDIR /app/backend/

# This is a trick to make Docker cache the updated Crates.io index.
RUN echo "fn main() {}" > dummy.rs
COPY backend/Cargo.toml .
RUN sed -i 's#src/main.rs#dummy.rs#' Cargo.toml
RUN cargo build
RUN sed -i 's#dummy.rs#src/main.rs#' Cargo.toml

COPY backend /app/backend/
RUN cargo build

COPY --from=FRONTEND_BUILD /app/frontend/build /app/frontend/build
ENV FRONTEND_PATH=/app/frontend/build

ENTRYPOINT ["cargo", "run"]