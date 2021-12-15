import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import BalanceIcon from "@mui/icons-material/Balance";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import {AppProps} from "next/app";
import {EmotionCache} from "@emotion/react";


interface MyAppProps {
    account:  string;
}

export default function AppbarIndex(props: MyAppProps) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <Avatar>
                            <BalanceIcon />
                        </Avatar>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        VoC Token
                    </Typography>
                    <Typography color="inherit">{props.account || 'Connect'}</Typography>
                    <IconButton color="inherit">
                        <AccountBalanceWalletIcon />
                    </IconButton>

                </Toolbar>
            </AppBar>
        </Box>
    );
}
