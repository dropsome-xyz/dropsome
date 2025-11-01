import { BN } from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js"

export interface Record {
    pubkey: PublicKey,
    sender: PublicKey,
    receiver: PublicKey,
    vault: PublicKey,
    amount: BN
}