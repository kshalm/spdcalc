# SPDCalc Library

## Development

```sh
cargo build
```

## Building wasm

Install and use [just](https://github.com/casey/just)

```sh
cd wasm/
just -l # list available commands
just build-py # use one
```

## Publishing pypi

update `wasm/wapm/wapm.toml` with new version number

```sh
just publish-py-test # pypi test publish
```

