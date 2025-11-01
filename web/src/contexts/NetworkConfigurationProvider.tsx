import { useLocalStorage } from '@solana/wallet-adapter-react';
import { createContext, FC, ReactNode, useContext } from 'react';


export interface NetworkConfigurationState {
    networkConfiguration: string;
    setNetworkConfiguration(networkConfiguration: string): void;
    customRpcUrl: string;
    setCustomRpcUrl(customRpcUrl: string): void;
}

export const NetworkConfigurationContext = createContext<NetworkConfigurationState>({} as NetworkConfigurationState);

export function useNetworkConfiguration(): NetworkConfigurationState {
    return useContext(NetworkConfigurationContext);
}

export const NetworkConfigurationProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [networkConfiguration, setNetworkConfiguration] = useLocalStorage("network", "mainnet-beta");
    const [customRpcUrl, setCustomRpcUrl] = useLocalStorage("customRpcUrl", "http://localhost:8899");

    return (
        <NetworkConfigurationContext.Provider value={{ 
            networkConfiguration, 
            setNetworkConfiguration,
            customRpcUrl,
            setCustomRpcUrl
        }}>{children}</NetworkConfigurationContext.Provider>
    );
};