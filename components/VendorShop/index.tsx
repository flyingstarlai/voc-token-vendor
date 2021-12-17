import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Web3 from "web3";
import {Button, Divider, List, OutlinedInput, TextField} from "@mui/material";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import LoadingButton from "@mui/lab/LoadingButton";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CardActions from "@mui/material/CardActions";
import * as React from "react";
import {useEffect, useRef, useState} from "react";

interface MyAppProps {
    myBalance:  string;
    vendorBalance: string;
    submitted: boolean;
    onBuyToken: (amount: string) => void;
}

export default function Vendor(props: MyAppProps) {

    let inputRef = useRef<HTMLInputElement>();

    const [error, setError] = useState(false)

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const amount = data.get('amount') as string
        if(amount) {
            setError(false)
            props.onBuyToken(amount)
        } else setError(true)

        event.currentTarget.reset();
  }



    return (
        <React.Fragment>
            <List>
                <ListItem>
                    <ListItemText primary="Vendor Supply" secondary={ Web3.utils.fromWei(props.vendorBalance)} />
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText primary="My VoC Token" secondary={props.myBalance} />
                </ListItem>
            </List>

            <Typography  variant="subtitle1"  >
                You can buy here
                or Send ether to Vendor address
            </Typography>

            <Typography variant="subtitle1">
                Send 1 wei for 1 voc token-bit
            </Typography>

            {!props.submitted && <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }} maxWidth="xs">

                <FormControl>
                <TextField
                    inputRef={inputRef}
                    margin="normal"
                    disabled={props.submitted}
                    error={error}
                    required
                    name="amount"
                    label="VoC Token"
                    type="number"
                    id="amount"
                    autoComplete="voc-token"
                />
                <Button
                    type="submit"
                    // fullWidth
                    variant="contained"
                    sx={{ mt: 2, mb: 2 }}
                >
                    Purchase
                </Button>
                </FormControl>

            </Box> }

            {props.submitted && <Typography variant="h5">
                Processing payment..
            </Typography>}

        </React.Fragment>    )
}
