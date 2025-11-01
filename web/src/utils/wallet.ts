import { Keypair } from "@solana/web3.js";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
const DEFAULT_DERIVATION_PATH: string = "m/44'/501'/0'/0'"

export async function createReceiverWallet(): Promise<{ keypair: Keypair; mnemonic: string; }> {
    // Step 1: Generate a random mnemonic (seed phrase)
    const mnemonic = generateMnemonic();

    // Step 2: Convert the mnemonic to a seed buffer
    const seed = await mnemonicToSeed(mnemonic);

    // Step 3: Derive the key pair
    const derivedSeed = derivePath(DEFAULT_DERIVATION_PATH, seed.toString("hex")).key;
    const keypair = Keypair.fromSeed(new Uint8Array(derivedSeed));
    return { keypair, mnemonic };
}