import { WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';
import { notify } from "../utils/notifications";
import { NetworkConfigurationProvider, useNetworkConfiguration } from './NetworkConfigurationProvider';
import dynamic from "next/dynamic";

const ReactUIWalletModalProviderDynamic = dynamic(
    async () =>
        (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
    { ssr: false }
);

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { autoConnect } = useAutoConnect();
    const { networkConfiguration, customRpcUrl } = useNetworkConfiguration();
    const { endpoint, wsEndpoint } = useMemo(() => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        if (networkConfiguration === 'custom') {
            const rpc = customRpcUrl || 'http://localhost:8899';
            const ws = rpc.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
            return { endpoint: rpc, wsEndpoint: ws };
        }

        const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
        const httpEndpoint = `${origin}/api/rpc/mainnet`;
        const ws = `${origin.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://')}/api/rpc-ws/mainnet`;
        return { endpoint: httpEndpoint, wsEndpoint: ws };
    }, [networkConfiguration, customRpcUrl]);

    const onError = useCallback(
        (error: WalletError) => {
            notify({ type: 'error', message: error.message ? `${error.name}: ${error.message}` : error.name });
            console.error(error);
        },
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint} config={{ wsEndpoint }}>
            <WalletProvider wallets={[]} onError={onError} autoConnect={autoConnect}>
                <ReactUIWalletModalProviderDynamic>
                    {children}
                </ReactUIWalletModalProviderDynamic>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <>
            <NetworkConfigurationProvider>
                <AutoConnectProvider>
                    <WalletContextProvider>{children}</WalletContextProvider>
                </AutoConnectProvider>
            </NetworkConfigurationProvider>
        </>
    );
};
