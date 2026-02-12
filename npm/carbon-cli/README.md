# @omnipair/carbon-cli

Carbon CLI for the [Carbon](https://github.com/Omnipair/carbon) Solana indexing framework.

## Install

```bash
npm install -g @omnipair/carbon-cli
```

## Usage

```bash
# Interactive mode
carbon-cli

# Generate a decoder from an Anchor IDL
carbon-cli parse --idl my_program.json --output ./src/decoders

# Generate a decoder from an on-chain program address
carbon-cli parse --idl LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo -u mainnet-beta --output ./src/decoders

# Scaffold a new project
carbon-cli scaffold --name my-indexer --output ./my-indexer --decoders pumpfun,moonshot --data-source yellowstone-grpc --metrics log

# Help
carbon-cli --help
```

## Supported Platforms

- Linux x64
- macOS x64 (Intel)
- macOS arm64 (Apple Silicon, via Rosetta 2)
- Windows x64

## Building from Source

If your platform isn't supported, you can build from source:

```bash
cargo install --git https://github.com/Omnipair/carbon.git carbon-cli
```
