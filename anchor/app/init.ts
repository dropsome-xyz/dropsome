import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Dropsome } from "../target/types/dropsome";
import * as web3 from "@solana/web3.js";
import 'dotenv/config';

async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Dropsome as Program<Dropsome>;

    const networkFeeReserve = process.env.NETWORK_FEE_RESERVE_LAMPORTS;
    if (!networkFeeReserve) throw new Error("NETWORK_FEE_RESERVE_LAMPORTS not set in environment");

    const treasury = process.env.TREASURY;
    if (!treasury) throw new Error("TREASURY not set in environment");

    const feeBasisPoints = process.env.FEE_BASIS_POINTS;
    if (!feeBasisPoints) throw new Error("FEE_BASIS_POINTS not set in environment");

    const minDropAmount = process.env.MIN_DROP_AMOUNT_LAMPORTS;
    if (!minDropAmount) throw new Error("MIN_DROP_AMOUNT_LAMPORTS not set in environment");

    const [appStatePda] = web3.PublicKey.findProgramAddressSync([
        anchor.utils.bytes.utf8.encode("app_state")
    ], program.programId);

    const authority = provider.wallet;
    const params = {
        authority: authority.publicKey,
        isActive: true,
        networkFeeReserve: new BN(networkFeeReserve),
        treasury: new web3.PublicKey(treasury),
        feeBasisPoints: Number(feeBasisPoints),
        minDropAmount: new BN(minDropAmount),
    };

    try {
        const tx = await program.methods
            .initialize(params)
            .accounts({
                authority: authority.publicKey,
            })
            .signers([authority.payer])
            .rpc({ commitment: "confirmed" });
        console.log("App initialized. Transaction signature:", tx);

        const appState = await program.account.appState.fetch(appStatePda);

        console.log("  AppState:");
        console.log("is_initialized:", appState.isInitialized);
        console.log("authority:", appState.authority.toString());
        console.log("is_active:", appState.isActive);
        console.log("network_fee_reserve:", appState.networkFeeReserve.toString());
        console.log("treasury:", appState.treasury.toString());
        console.log("fee_basis_points:", appState.feeBasisPoints);
        console.log("min_drop_amount:", appState.minDropAmount.toString());
    } catch (e) {
        console.error("Initialization failed:", e);
    }
}

main(); 