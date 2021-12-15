import  { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import PaidIcon from '@mui/icons-material/Paid';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LinkIcon from '@mui/icons-material/Link';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BalanceIcon from '@mui/icons-material/Balance';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';

import detectEtherumProvider from "@metamask/detect-provider"
import styles from '../styles/Home.module.css'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import {ChangeEvent, useEffect, useState} from "react";
import {provider} from "web3-core";
import Token from '../abis/VOCToken.json'
import Vendor from '../abis/VOCVendor.json'
import { VOCToken  } from '../abis/types/VOCToken'
import { VOCVendor  } from '../abis/types/VOCVendor'
import {Copyright} from "@mui/icons-material";
import {Divider, OutlinedInput} from "@mui/material";
interface INetwork { [key: string]: { address: string}}

import Appbar from '../components/Appbar'

declare let window: any;

const Home: NextPage = () => {



  const [vocToken, setVocToken] = useState<VOCToken>()
  const [vocVendor, setVocVendor] = useState<VOCVendor>()

  const [tokenAddress, setTokenAddress] = useState({
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

  const [error, setError] = useState("")

  const [waiting, setWaiting] = useState(false)


  async function connectWeb3() {
    try {
      const provider = await detectEtherumProvider() as provider;
      if(provider) {

        if (provider !== window.ethereum) {
          console.error('Do you have multiple wallets installed?');
          return;
        }

      } else {
        console.log('etherum wallet not found')
        setError('Etherum wallet not found')
        return;
      }




      const { ethereum } = window;

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleChainChanged)

      await switchEthereumChain();

      await preloadApp();


    } catch (e) {
        console.log(e)
    }

  }


  async function preloadApp() {
    setAccount('')
    let web3: Web3;
    const { ethereum } = window;
    web3 = new Web3(ethereum);

    const networkId = await web3.eth.net.getId()
    const chainIds = [5777, 97] //80001
    if(!chainIds.find(c => c === networkId)) {
      console.log('network error')
      setError(`Token not available in current network, please change network.`)
      return;
    }



    await web3.eth.requestAccounts();

    const acc = await web3.eth.getAccounts()

    setAccount(acc[0])


    const tokenAddress = (Token.networks as INetwork )[networkId].address
    const _tokenInstance = new web3.eth.Contract(
        Token.abi as AbiItem[],
        tokenAddress
    ) as unknown as VOCToken;
    setVocToken(_tokenInstance)

    const res = await  _tokenInstance.getPastEvents('Transfer')
    console.log(res)


    const vendorAddress = (Vendor.networks as INetwork )[networkId].address
    const _tokenSaleInstance = new web3.eth.Contract(
        Vendor.abi as AbiItem[],
        vendorAddress
    ) as unknown as VOCVendor;
    setVocVendor(_tokenSaleInstance);

    const balance = await _tokenInstance.methods.balanceOf(acc[0]).call()
    const vendorBalance = await _tokenInstance.methods.balanceOf(vendorAddress).call()

    listenTokenTransfer(_tokenInstance, acc[0], vendorAddress)

    setToken({ balance, vendorBalance })

    setTokenAddress({
      token: tokenAddress,
      vendor:  vendorAddress
    })
  }
  async  function switchEthereumChain() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }],
      });
    } catch (e: any) {
      if (e.code === 4902) {
        try {
        //   await window.ethereum.request({
        //     method: "wallet_addEthereumChain",
        //     params: [
        //       {
        //         chainId: "0x13881",
        //         rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
        //         chainName: "Polygon Testnet Mumbai",
        //         nativeCurrency: {
        //           name: "tMATIC",
        //           symbol: "tMATIC", // 2-6 characters long
        //           decimals: 18,
        //         },
        //         blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
        //       },
        //     ],
        //   });
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



  const handleChainChanged = async () => {
    await preloadApp();
   // window.location.reload();
  }


  const listenTokenTransfer = (instance: VOCToken, address: string, vendor: string) => {
    instance.events.Transfer({ filter: { to: address } })
      .on("data", async(eventData) => {
        // console.log('EventData', eventData);
        const balance = await instance.methods.balanceOf(address).call()
        const vendorBalance = await instance.methods.balanceOf(vendor).call()
        if(balance)   {
          setWaiting(false)
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



  async function handleBuyToken() {
    try {
      const weiAmount = values['amount'];
      if(!account) return;
      if(!weiAmount) {
        setValues({...values, error: 'true'})
        return;
      }
      setValues({...values, error: ''})
      setWaiting(true)
      await vocVendor?.methods.buyTokens(account).send({ from: account, value: Web3.utils.toWei(weiAmount, "wei")});
    } catch (err) {
      setWaiting(false)
      setValues({ ...values, amount: ''})
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
  }, [])

  const renderLoadingOrError = () =>
      <Box>
        <ListItem>
          <ListItemText primary={error}  />
        </ListItem>
      </Box>

  const renderContent = () => <>

    <Box sx={{
      backgroundColor: 'background.paper'
    }}>
      <Card sx={{ minWidth: 300 }}>
        <CardContent>

          <ListItem>
            <ListItemText primary="Vendor Supply" secondary={Web3.utils.fromWei(token.vendorBalance)} />
          </ListItem>
          <Divider />
          <Stack spacing={2} direction="row">
            <ListItem>
              <ListItemText primary="My VoC Token" secondary={token.balance} />
            </ListItem>
            <ListItem>
              <ListItemText primary="(12 Decimals)" secondary={Web3.utils.fromWei(token.balance)} />
            </ListItem>
          </Stack>

          <Typography sx={{ fontSize: 14, mb: 2 }} color="text.primary" gutterBottom>
            You can buy here
            or Send ether to Vendor address
          </Typography>

          <Typography sx={{ fontSize: 14, mb: 2 }} color="text.primary" gutterBottom>
            Send 1 wei for 1 voc token-bit
          </Typography>
          <Stack spacing={2} direction="column">
            <FormControl>
              <InputLabel htmlFor="component-outlined">Token bit</InputLabel>
              <OutlinedInput
                  required={true}
                  error={values['error'] === 'true'}
                  type='number'
                  name='amount'
                  id="component-outlined"
                  value={values['amount']}
                  onChange={handleChange}
                  label="VoC Token"
              />
            </FormControl>
            <LoadingButton loading={waiting} loadingPosition="end" endIcon={<AttachMoneyIcon/>} variant="outlined" onClick={handleBuyToken}>
              Buy VoC
            </LoadingButton>
          </Stack>

        </CardContent>
        <CardActions>
          {/*<Button size="small">Learn More</Button>*/}
        </CardActions>
      </Card>
    </Box>
    <br />
    <Box sx={{
      backgroundColor: 'background.paper'
    }}>
      <Card sx={{ minWidth: 300 }}>
        <CardContent>
      <List sx={{ width: '100%',  backgroundColor: 'background.paper' }}>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <LinkIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Binance" secondary='Smart Chain - Testnet' />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <AccountBalanceWalletIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Active Wallet" secondary={account} />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <StorefrontIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Vendor Address" secondary={tokenAddress.vendor} />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <PaidIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Token Address" secondary={tokenAddress.token}  />
        </ListItem>
      </List>
        </CardContent>
      </Card>
    </Box>
  </>

  const checkRender = () => {
    if(!account || !vocToken || !vocVendor) {
      return renderLoadingOrError()
    }

    return renderContent();
  }

  return (
      <>
        <Appbar account={account || 'Connet'} />
        <br />
        <Container maxWidth="lg" sx={{

        }}>

          {
            checkRender()
          }

        </Container>
      </>
  )
}

export default Home
