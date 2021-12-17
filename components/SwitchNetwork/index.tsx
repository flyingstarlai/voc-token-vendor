import Box from "@mui/material/Box";
import * as React from "react";
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {AlertTitle, Typography} from "@mui/material";
import Button from '@mui/material/Button';
import {useState} from "react";

declare let window: any;

export default function SwitchNetworkIndex() {

    async function handleSwitchNetwork() {
       if(!window.ethereum) return;
        await switchEthereumChain()

    }

    const [ec, setEc] = useState('')
    async function addChain() {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: '0x61',
                        chainName: 'Smart Chain - Testnet',
                        nativeCurrency: {
                            name: 'Binance',
                            symbol: 'BNB', // 2-6 characters long
                            decimals: 18
                        },
                        blockExplorerUrls: ['https://testnet.bscscan.com'],
                        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                    },
                ],
            });
        } catch (addError) {
            console.error(addError);
        }
    }

    async  function switchEthereumChain() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x61' }],
            });
        } catch (e: any) {
            if (e.code === 4902 || e.code === -32603) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0x61',
                                chainName: 'Smart Chain - Testnet',
                                nativeCurrency: {
                                    name: 'Binance',
                                    symbol: 'BNB', // 2-6 characters long
                                    decimals: 18
                                },
                                blockExplorerUrls: ['https://testnet.bscscan.com'],
                                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                            },
                        ],
                    });
                } catch (addError) {
                    console.error(addError);
                }
            }
            // console.error(e)
        }
    }

    return (

        <Alert severity="error" >
            <Typography>
               You need to connect to supported network
                <Button
                    onClick={handleSwitchNetwork}
                    sx={{
                    ml: 2,
                }} variant='outlined' >Switch Network</Button>
            </Typography>
        </Alert>

    );
}
