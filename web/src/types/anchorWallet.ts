import type { AnchorProvider } from '@anchor-lang/core';

/**
 * The wallet shape AnchorProvider's constructor accepts.
 *
 * The wallet adapter's `WalletContextState` declares every signing member as
 * optional, so it only satisfies this once `connected` is true. TypeScript
 * cannot narrow that from the `connected` boolean alone, so call sites that
 * have already guarded on `connected` cast through this type.
 */
export type AnchorWallet = ConstructorParameters<typeof AnchorProvider>[1];
