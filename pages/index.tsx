import  { NextPage } from 'next'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import detectEtherumProvider from "@metamask/detect-provider"
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import {ChangeEvent, useEffect, useState} from "react";
import {provider} from "web3-core";
import Token from '../abis/VOCToken.json'
import Vendor from '../abis/VOCVendor.json'
import { VOCToken  } from '../abis/types/VOCToken'
import { VOCVendor  } from '../abis/types/VOCVendor'
import {Backdrop, CircularProgress} from "@mui/material";
import Appbar from '../components/Appbar'
import SwitchNetwork from '../components/SwitchNetwork'
import ContractInfo from '../components/ContractInfo'
import VendorShop from '../components/VendorShop'
import Alert from "@mui/material/Alert";
import * as React from "react";

declare let window: any;
interface INetwork { [key: string]: { address: string}}

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

  function handleChange(e:  ChangeEvent<HTMLInputElement>) {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    })
  }



  async function handleBuyToken(weiAmount: string) {
    try {
       if(!account) return;
       setPaymentInProcess(true)
      await vocVendor?.methods.buyTokens(account).send({ from: account, value: Web3.utils.toWei(weiAmount, "wei")});
    } catch (err) {
      setPaymentInProcess(false)
    }

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
      <Box sx={{ flexGrow: 1 }}>
        <Box>
          <Appbar
              web3={web3}
              onUnlockWallet={(acc) => setAccount(acc)}
              account={account || 'Unlock'}
          />
        </Box>
        <Box>
          <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={preLoading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          {wrongNetwork && <SwitchNetwork />}
          {walletNotFound && <Alert severity="warning">Please Install Metamask</Alert>}
          {walletUnlocked && <Alert severity="warning">Please Unlock Your Wallet</Alert>}
        </Box>
        <Grid
            sx={{ mt: 2 }}
            container spacing={2}
            direction="column"
            justifyContent="center"
            alignItems="center">
          <Grid item>
            <VendorShop
                myBalance={!wrongNetwork ? token.balance : '0'}
                vendorBalance={!wrongNetwork ? token.vendorBalance : '0'}
                submitted={paymentInProcess}
                onBuyToken={ (amount) => handleBuyToken(amount)}
            />
          </Grid>
          <Grid item>
            <ContractInfo token={contractAddress.token} vendor={contractAddress.vendor} />
          </Grid>
        </Grid>
      </Box>
  )
}

export default Home
