import { BN } from "@anchor-lang/core"
import { PublicKey } from "@solana/web3.js"

export interface Record {
    pubkey: PublicKey,
    sender: PublicKey,
    receiver: PublicKey,
    vault: PublicKey,
    amount: BN
}