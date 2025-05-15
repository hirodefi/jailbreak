import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import Web3 from 'web3';
import { CHAIN_ID } from '../configs/contract';

// Define the context type
interface Web3ContextType {
    web3: Web3 | null;
    account: string | null;
    networkId: string | null;
    utils: typeof Web3.utils;
    connectMetaMask: () => Promise<void>;
    disconnectMetaMask: () => void;
}

// Create the context with undefined initial value
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Custom hook
export const useWeb3 = (): Web3ContextType => {
    const context = useContext(Web3Context);
    if (!context) throw new Error('useWeb3 must be used within a Web3Provider');
    return context;
};

// Props type for provider
interface Web3ProviderProps {
    children: ReactNode;
}

// Web3Provider Component
export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [networkId, setNetworkId] = useState<string | null>(null);
    const [utils] = useState<typeof Web3.utils>(Web3.utils);

    const connectMetaMask = async () => {
        if ((window as any).ethereum) {
            const ethereum = (window as any).ethereum;
            const web3Instance = new Web3(ethereum);

            try {
                const accounts: string[] = await ethereum.request({
                    method: 'eth_requestAccounts',
                });

                const expectedChainId = CHAIN_ID; // hardhat testnet for example
                const chainId: string = await ethereum.request({ method: 'eth_chainId' });


                if (chainId !== expectedChainId) {
                    alert('Please switch MetaMask to the Harhat Testnet.');
                    return;
                }

                setWeb3(web3Instance);
                setAccount(accounts[0]);
                setNetworkId(chainId);

                localStorage.setItem('isLogin', 'true');
                localStorage.setItem('account', accounts[0]);

                ethereum.on('accountsChanged', () => disconnectMetaMask());
                ethereum.on('chainChanged', () => disconnectMetaMask());
            } catch (error) {
                console.error('User denied account access', error);
            }
        } else {
            alert('Please install MetaMask');
        }
    };

    const disconnectMetaMask = () => {
        setAccount(null);
        setNetworkId(null);
        setWeb3(null);
        localStorage.clear();
        window.location.reload();
    };

    useEffect(() => {
        const previouslyLoggedIn = localStorage.getItem('isLogin');
        if (previouslyLoggedIn === 'true') {
            connectMetaMask();
        }
    }, []);


    return (
        <Web3Context.Provider value={{ web3, account, networkId, utils, connectMetaMask, disconnectMetaMask }}>
            {children}
        </Web3Context.Provider>
    );
};
