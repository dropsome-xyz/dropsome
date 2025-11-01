<img src="web/public/logo.svg" alt="icon" width="100"/>

# Dropsome - A DeFi Project to Share SOL with Newbies

[![License: Apache 2.0](https://img.shields.io/badge/license-Apache_2.0-blue)](https://opensource.org/licenses/Apache-2.0)
![version](https://img.shields.io/badge/dynamic/toml?url=https://raw.githubusercontent.com/dropsome-xyz/dropsome/main/anchor/programs/dropsome/Cargo.toml&query=$.package.version&label=version&color=green)
[![Documentation](https://img.shields.io/badge/documentation-blue)](https://docs.dropsome.xyz)

**Dropsome** is a decentralized finance (DeFi) app that allows users to share a small amount of SOL with someone who doesn't have a wallet. By generating a wallet and a secure link, the sender can easily drop SOL for a receiver to claim, without requiring them to have a wallet initially. The receiver can then claim the funds after installing a wallet app like Phantom or Solflare.

### User Flows

**1. Drop:**
   - The sender specifies the amount of SOL to share and the app generates a unique claim link.
   - The sender shares the link with the receiver, and the funds are securely held in the smart contract.

**2. Claim:**
   - The receiver opens the claim link, installs a wallet (e.g., Phantom or Solflare), and imports the secret phrase.
   - After connecting their wallet to the app, the receiver approves the transaction to claim the SOL.

**3. Refund:**
   - If the receiver hasn’t claimed the drop, the sender can refund the SOL by selecting the unclaimed drop and initiating the refund process.

## App Links
- Program: [DSdHwC1vGPL4KzNAhgxMYggZnBBaY8upKx6uo655kVYZ](https://explorer.solana.com/address/DSdHwC1vGPL4KzNAhgxMYggZnBBaY8upKx6uo655kVYZ)
- Application: [Dropsome.xyz](https://dropsome.xyz)

## Project Structure

- **`anchor/`** - Solana Program 
- **`web/`** - Frontend Application (Next.js)

## Prerequisites

- Rust
- Solana CLI
- Anchor
- Node.js (>=16) and Yarn
- Docker (for verified builds)

## Local Deployment & Testing

### 1. Test the Anchor Program Locally

```bash
cd anchor
anchor build
anchor test --provider.cluster localnet
```

### 2. Initialize the Program (Required for Running Locally)

Set up `.env` file in `anchor/` directory (see `.env.example` for reference), then:

```bash
cd anchor
yarn ts-node app/init.ts
```

### 3. Run the Frontend App Locally

Set up `.env` file in `web/` directory (see `.env.example` for reference), then:

```bash
cd web
yarn install
yarn dev
```

The frontend will be running on [http://localhost:3000](http://localhost:3000).

## Program Verification

To verify the program build matches the on-chain deployment:

```bash
cd anchor

# Build the verifiable program
solana-verify build

# Compare the hashes
solana-verify get-executable-hash target/deploy/dropsome.so
solana-verify get-program-hash DSdHwC1vGPL4KzNAhgxMYggZnBBaY8upKx6uo655kVYZ
```

The two hashes should be equal.

## License
Dropsome is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for details.