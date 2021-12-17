import  { NextPage } from 'next'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Web3 from 'web3'
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

import detectEtherumProvider from "@metamask/detect-provider"

import { AbiItem } from 'web3-utils'
import {ChangeEvent, useEffect, useState} from "react";
import {provider} from "web3-core";
import Token from '../abis/VOCToken.json'
import Vendor from '../abis/VOCVendor.json'
import { VOCToken  } from '../abis/types/VOCToken'
import { VOCVendor  } from '../abis/types/VOCVendor'
import {Backdrop, Button, CircularProgress, Container, Paper} from "@mui/material";
import Appbar from '../components/Appbar'
import SwitchNetwork from '../components/SwitchNetwork'
import ContractInfo from '../components/ContractInfo'
import VendorShop from '../components/VendorShop'
import Alert from "@mui/material/Alert";
import * as React from "react";
import Toolbar from "@mui/material/Toolbar";

declare let window: any;
interface INetwork { [key: string]: { address: string}}

interface Web3Context {
  chainId: string
  address: string
}

const Home: NextPage = () => {

  const [web3, setWeb3] = useState<Web3>()
  const [vocToken, setVocToken] = useState<VOCToken>()
  const [vocVendor, setVocVendor] = useState<VOCVendor>()

  const [contractAddress, setAddress] = useState({
    token: "",
    vendor: ""
  })

  const [token, setToken] = useState({
    balance: '0',
    vendorBalance: '0'
  })

  const [account, setAccount] = useState<string>();
  const [values, setValues] = useState<{ [key: string]: string}>({
    customer: '',
    amount: ''
  })

  const [wrongNetwork, setWrongNetwork] = useState(false)
  const [walletNotFound, setWalletNotFound] = useState(false)
  const [walletUnlocked, setWalletUnlocked] = useState(false)
  const [preLoading, setPreLoading] = useState(false)

  const [paymentInProcess, setPaymentInProcess] = useState(false)


  async function connectWeb3() {
    try {
      // detecting provider
      setPreLoading(true)



      const provider = await detectEtherumProvider() as provider;
      if(provider) {

        if (provider !== window.ethereum) {
          setPreLoading(false)
          return;
        }

      } else {
        setWalletNotFound(true)
        setPreLoading(false)
        return;
      }

      setPreLoading(false)

      // injecting network
      const web3 = new Web3(window.ethereum);
      setWeb3(web3)

      // listening provider event
      const { ethereum } = window;
      ethereum.on('chainChanged', () => handleChainChanged(web3))
      ethereum.on('accountsChanged', () => handleChainChanged(web3))

      // checking current network
      const chainId = await checkingNetwork(web3)
      if(!chainId) return;

      // check wallet status
      const acc = await checkingWallet(web3);
      if(!acc) return;

     await loadSmartContract(web3, chainId, acc);

    } catch (e) {
        console.log(e)
    }

  }

  async function checkingNetwork(web3: Web3) {
    const chainId = await web3.eth.net.getId()
    const chainIds = [5777, 97] //80001
    if(!chainIds.find(c => c === chainId)) {
      setWrongNetwork(true)
      return undefined;
    }
    setWrongNetwork(false);
    return chainId.toString();
  }

  async function checkingWallet(web3: Web3) {
      const acc = await web3.eth.getAccounts()
      console.log(acc)
      if(acc.length < 1) {
        setWalletUnlocked(true)
        return undefined;
      }
      setWalletUnlocked(false)
      setAccount(acc[0])
      return acc[0]
  }

  async function loadSmartContract(web3: Web3, chainId: string, acc: string) {

    // load Token Contract
    const tokenAddress = (Token.networks as INetwork )[chainId].address
    const _tokenInstance = new web3.eth.Contract(
        Token.abi as AbiItem[],
        tokenAddress
    ) as unknown as VOCToken;
    setVocToken(_tokenInstance)


    // load VendorShop Contract
    const vendorAddress = (Vendor.networks as INetwork )[chainId].address
    const _tokenSaleInstance = new web3.eth.Contract(
        Vendor.abi as AbiItem[],
        vendorAddress
    ) as unknown as VOCVendor;
    setVocVendor(_tokenSaleInstance);

    setAddress({
      token: tokenAddress,
      vendor:  vendorAddress
    })

    // listen contract events
    listenTokenTransfer(_tokenInstance, acc, vendorAddress)


    // load balance
    const balance = await _tokenInstance.methods.balanceOf(acc).call()
    const vendorBalance = await _tokenInstance.methods.balanceOf(vendorAddress).call()

    setToken({ balance, vendorBalance })


  }

  const handleChainChanged = async (web3: Web3) => {

    const chainId = await checkingNetwork(web3)
    if(!chainId) return;

    const acc = await checkingWallet(web3);
    if(!acc) return;

    await loadSmartContract(web3, chainId, acc)
  }

  const listenTokenTransfer = (instance: VOCToken, address: string, vendor: string) => {
    instance.events.Transfer({ filter: { to: address } })
      .on("data", async() => {
        const balance = await instance.methods.balanceOf(address).call()
        const vendorBalance = await instance.methods.balanceOf(vendor).call()
        if(balance)   {
          setPaymentInProcess(false)
          setValues({ ...values, amount: ''})
          setToken({ balance, vendorBalance })

        }
      })
  }

  // function handleChange(e:  ChangeEvent<HTMLInputElement>) {
  //   setValues({
  //     ...values,
  //     [e.target.name]: e.target.value
  //   })
  // }


  async function handleBuyToken(weiAmount: string) {
    try {
       if(!account) return;
       setPaymentInProcess(true)
      await vocVendor?.methods.buyTokens(account).send({ from: account, value: Web3.utils.toWei(weiAmount, "wei")});
    } catch (err) {
      setPaymentInProcess(false)
    }

  }

  const [web3Context, setWeb3Context] = React.useState<Web3Context | undefined>();

  let providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "123",
      }
    },
  };



  async function handleConnectModal() {
    // const web3Modal = new Web3Modal({
    //   network: "mainnet",
    //   providerOptions
    // });
    //
    // web3Modal.clearCachedProvider()
    // const provider = await web3Modal.connect();
    // const web3 = new Web3(provider);
    // setWeb3(web3)

    const provider = new WalletConnectProvider({
      // infuraId: "27e484dcd9e3efcfd25a83a78777cdf1", // Required
      rpc: {
        1: "https://mainnet.mycustomnode.com",
        3: "https://ropsten.mycustomnode.com",
        97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        // ...
      },
    });



    //  Enable session (triggers QR Code modal)
    await provider.enable();

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
    });

// Subscribe to chainId change
    provider.on("chainChanged", (chainId: number) => {
      console.log(chainId);
    });

// Subscribe to session connection
    provider.on("connect", () => {
      console.log("connect");
    });

// Subscribe to session disconnection
    provider.on("disconnect", (code: number, reason: string) => {
      console.log(code, reason);
    });

    //  Create Web3
    // @ts-ignore
    const web3 = new Web3(provider);

    // checking current network
    const chainId = await checkingNetwork(web3)
    if(!chainId) return;

    // check wallet status
    const acc = await checkingWallet(web3);
    if(!acc) return;


    setWeb3Context({
      chainId,
      address: acc
    })

  }

  useEffect(() => {
   connectWeb3().then(() => {})

    return () => {
      const eth = window.ethereum;
     if(eth) {
       eth.removeListener('accountsChanged', handleChainChanged)
       eth.removeListener('chainChanged', handleChainChanged)
     }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])




  return (
      <Box sx={{ display: 'flex' }}>
        <Appbar
            web3={web3}
            onUnlockWallet={(acc) => setAccount(acc)}
            account={account || 'Unlock'}
        />
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={preLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                      ? theme.palette.grey[100]
                      : theme.palette.grey[900],
              flexGrow: 1,
              height: '100vh',
              overflow: 'auto',
            }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{  mb: 4 }}>
            <Grid
                container spacing={3}
                justifyContent="center">
              <Grid item xs={12}  md={8} lg={9} >
                {wrongNetwork && <SwitchNetwork />}
                {walletNotFound && <Alert severity="warning">Please Install Metamask</Alert>}
                {walletUnlocked && <Alert severity="warning">Please Unlock Your Wallet</Alert>}
                {/*<Button onClick={handleConnectModal}>Connect</Button>*/}
              </Grid>
              <Grid  item xs={12} md={8} lg={9} >
                <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                >
                <VendorShop
                    myBalance={!wrongNetwork ? token.balance : '0'}
                    vendorBalance={!wrongNetwork ? token.vendorBalance : '0'}
                    submitted={paymentInProcess}
                    onBuyToken={ (amount) => handleBuyToken(amount)}
                />
                </Paper>
              </Grid>
              <Grid  item xs={12} md={8} lg={9}>
                <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                >
                <ContractInfo token={contractAddress.token} vendor={contractAddress.vendor} />
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

      </Box>
  )
}

export default Home
