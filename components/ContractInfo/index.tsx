import Box from "@mui/material/Box";
import * as React from "react";
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {AlertTitle, Typography} from "@mui/material";
import Button from '@mui/material/Button';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import LinkIcon from "@mui/icons-material/Link";
import ListItemText from "@mui/material/ListItemText";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PaidIcon from "@mui/icons-material/Paid";
import Web3 from "web3";

interface MyAppProps {
    token:  string;
    vendor: string;
}

export default function ContractInfo(props: MyAppProps) {
    return (
        <React.Fragment>
                    <List>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <LinkIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Binance" secondary='Smart Chain - Testnet' />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <StorefrontIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Vendor Address" secondary={props.vendor} />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <PaidIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Token Address" secondary={props.token}  />
                        </ListItem>
                    </List>
        </React.Fragment>
    );
}
