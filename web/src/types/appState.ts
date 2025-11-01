import { PublicKey } from "@solana/web3.js";

export interface AppState {
    isInitialized: boolean;
    authority: PublicKey;
    isActive: boolean;
    networkFeeReserve: number;
    treasury: PublicKey;
    feeBasisPoints: number;
    minDropAmount: number;
}


