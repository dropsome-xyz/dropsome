import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Dropsome } from "../target/types/dropsome";
import * as web3 from "@solana/web3.js";
import 'dotenv/config';

async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Dropsome as Program<Dropsome>;

    const [appStatePda] = web3.PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("app_state")
    ], program.programId);

    try {
        const appState = await program.account.appState.fetch(appStatePda);

        console.log("  AppState:");
        console.log("is_initialized:", appState.isInitialized);
        console.log("authority:", appState.authority.toString());
        console.log("is_active:", appState.isActive);
        console.log("network_fee_reserve:", appState.networkFeeReserve.toString());
        console.log("treasury:", appState.treasury.toString());
        console.log("fee_basis_points:", appState.feeBasisPoints);
    } catch (e) {
        console.error("Failed to fetch app state:", e);
    }
}

main(); 