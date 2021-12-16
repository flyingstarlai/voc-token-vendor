import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Web3 from "web3";
import {Divider, OutlinedInput} from "@mui/material";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import LoadingButton from "@mui/lab/LoadingButton";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CardActions from "@mui/material/CardActions";
import * as React from "react";
import { useState} from "react";

interface MyAppProps {
     myBalance:  string;
    vendorBalance: string;
    submitted: boolean;
    onBuyToken: (amount: string) => void;
}

export default function Vendor(props: MyAppProps) {
    const [values, setValues] = useState('')
    const [error, setError] = useState(false)
    return (
        <Box sx={{
            backgroundColor: 'background.paper'
        }}>
            <Card sx={{ minWidth: 300 }}>
                <CardContent>

                    <ListItem>
                        <ListItemText primary="Vendor Supply" secondary={ Web3.utils.fromWei(props.vendorBalance)} />
                    </ListItem>
                    <Divider />
                    <Stack spacing={2} direction="row">
                        <ListItem>
                            <ListItemText primary="My VoC Token" secondary={props.myBalance} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="(12 Decimals)" secondary={Web3.utils.fromWei(props.myBalance)} />
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
                                disabled={props.submitted}
                                required={true}
                                error={error}
                                type='number'
                                name='amount'
                                id="component-outlined"
                                value={values}
                                onChange={(e) => setValues(e.target.value)}
                                label="VoC Token"
                            />
                        </FormControl>
                        <LoadingButton
                            size={'large'}
                            loading={props.submitted}
                            loadingPosition="end"
                            endIcon={<AttachMoneyIcon/>}
                            variant="outlined"
                            onClick={() => {
                                if(values) {
                                    setError(false)
                                    props.onBuyToken(values)
                                } else setError(true)
                                setValues('')
                            }}>
                            Buy VoC
                        </LoadingButton>
                    </Stack>

                </CardContent>

            </Card>
        </Box>
    )
}
