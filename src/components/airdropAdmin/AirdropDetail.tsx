import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, Grid, Button, Box } from '@mui/material';
import { useWeb3 } from "../../context/web3Context";
import { airdropContractABI, airdropContractAddress } from "../../configs/contract";
import { useLocation } from "react-router-dom";

import moment from "moment";
import axiosInstance from '../../services/axiosInstance';
import { AxiosResponse } from "axios";


interface Airdrop {
    merkleRoot: string;
    totalCount: string;
    claimedCount: string;
    totalTokens: string;
    claimedTokens: string;
    isActive: string;
    isCompleted: string;
}

interface AirdropData {
    _id: string;
    airdropId: string;
    totalRecipients: number;
    totalTokens: number;
    isCreated: boolean;
    createdAt: string;
}


const AirdropDetail: React.FC = () => {


    const { web3, account, utils } = useWeb3();
    const [airdrop, setAirdrop] = useState<Airdrop>();
    const [airdropData, setAirdropData] = useState<AirdropData>();
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [loading3, setLoading3] = useState(false);
    const [loading4, setLoading4] = useState(false);
    const [loading5, setLoading5] = useState(false);



    const location = useLocation();
    const queryParams = new URLSearchParams(location.search); // Parse the query string

    const airdropId = queryParams.get('airdropId');


    useEffect(() => {
        if (airdropId && web3) {
            fetchAirdrop();
        }
    }, [airdropId, web3]);

    useEffect(() => {
        fetchAirdropData();
    }, [airdropId, account]);


    const fetchAirdrop = async (): Promise<void> => {
        try {
            airdrop
            if (airdropId && web3) {
                setLoading3(true);

                let airdropIdHex = utils.numberToHex(airdropId);
                airdropIdHex = utils.padLeft(airdropIdHex, 64);

                const contract = new web3.eth.Contract(airdropContractABI, airdropContractAddress);
                const result: Airdrop = await contract.methods.airdrops(airdropIdHex).call();
                if (result && parseInt(result.totalCount) > 0) {
                    setAirdrop(() => { return { ...result } })
                }
                setLoading3(false);
            }
        } catch (error) {
            console.log(error)
            setLoading3(false);
        }
    }

    const fetchAirdropData = async () => {
        if (account && airdropId) {
            setLoading(true);
            axiosInstance
                .get('/airdrop/admin', { params: { airdropId: parseInt(airdropId) } })
                .then((response) => {
                    setAirdropData(response.data.data);
                    setLoading(false);
                })
                .catch((error) => {
                    alert(error.message)
                    setLoading(false);
                });
        }
    }


    const updateCreatedStatus = async (): Promise<void> => {
        if (airdropId) {
            setLoading2(true);
            axiosInstance
                .put('/airdrop/admin', { airdropId: parseInt(airdropId) })
                .then((response) => {
                    setLoading2(false);
                    if (response.data.isError) {
                        alert(response.data.message);
                    }
                    else {
                        fetchAirdropData();
                    }
                })
                .catch((error) => {
                    alert(error.message)
                    setLoading2(false);
                });
        }

    }

    const confirmAirdrop = async (): Promise<void> => {
        try {
            if (airdropData && airdropData._id && web3 && account) {
                setLoading4(true);

                const result: AxiosResponse = await axiosInstance.get('/airdrop/admin/merkleRoot', { params: { airdropObjectId: airdropData._id } });
                let { data, isError, message } = result.data;

                if (isError) {
                    alert(message);
                } else {
                    // console.log(data);
                    let { airdropId: airdropIdHex, merkleRoot, totalCount, totalTokens } = data;
                    if (merkleRoot) {
                        try {

                            const contract = new web3.eth.Contract(
                                airdropContractABI,
                                airdropContractAddress
                            );
                            const gasEstimate = await contract.methods
                                .createAirdrop(airdropIdHex, merkleRoot, totalCount, totalTokens)
                                .estimateGas({ from: account });

                            const currentGasPrice = await web3.eth.getGasPrice();
                            const priorityFee = web3.utils.toWei('3', 'gwei');
                            const totalGasPrice = currentGasPrice + BigInt(priorityFee);

                            await contract.methods
                                .createAirdrop(airdropIdHex, merkleRoot, totalCount, totalTokens)
                                .send({
                                    from: account,
                                    gas: gasEstimate.toString(),
                                    gasPrice: totalGasPrice.toString(),
                                });

                            alert('Airdrop successfully created on-chain.');
                            window.location.reload();
                        } catch (error) {
                            console.log(error)
                            const parseError = (error: any) => {
                                const message = error?.message || 'Transaction failed';
                                const match = message.match(/execution reverted: (.*)"/);
                                return match ? match[1] : message;
                            };

                            const readableError = parseError(error);
                            alert('Error: ' + readableError);
                        }
                    }
                    else {
                        alert("Merkleroot not found");
                    }
                }
                setLoading4(false);
            }
        } catch (error: any) {
            console.log(error)
            setLoading4(false);
            alert(error.message)
        }
    }


    const enableAirdrop = async (): Promise<void> => {
        try {
            if (web3 && account && airdropId) {
                setLoading5(true);
                let airdropIdHex = utils.numberToHex(airdropId);
                airdropIdHex = utils.padLeft(airdropIdHex, 64);

                try {

                    const contract = new web3.eth.Contract(
                        airdropContractABI,
                        airdropContractAddress
                    );

                    const gasEstimate = await contract.methods
                        .enableAirdrop(airdropIdHex)
                        .estimateGas({ from: account });

                    const currentGasPrice = await web3.eth.getGasPrice();
                    const priorityFee = web3.utils.toWei('3', 'gwei');
                    const totalGasPrice = currentGasPrice + BigInt(priorityFee);

                    await contract.methods
                        .enableAirdrop(airdropIdHex)
                        .send({
                            from: account,
                            gas: gasEstimate.toString(),
                            gasPrice: totalGasPrice.toString(),
                        });

                    alert('Airdrop successfully enabled.');
                    window.location.reload();
                } catch (error) {
                    console.log(error)
                    const parseError = (error: any) => {
                        const message = error?.message || 'Transaction failed';
                        const match = message.match(/execution reverted: (.*)"/);
                        return match ? match[1] : message;
                    };

                    const readableError = parseError(error);
                    alert('Error: ' + readableError);
                }
                setLoading5(false);
            }
        } catch (error: any) {
            console.log(error)
            setLoading5(false);
            alert(error.message)
        }
    }
    const disableAirdrop = async (): Promise<void> => {
        try {
            if (web3 && account && airdropId) {
                setLoading5(true);
                let airdropIdHex = utils.numberToHex(airdropId);
                airdropIdHex = utils.padLeft(airdropIdHex, 64);

                try {

                    const contract = new web3.eth.Contract(
                        airdropContractABI,
                        airdropContractAddress
                    );

                    const gasEstimate = await contract.methods
                        .disableAirdrop(airdropIdHex)
                        .estimateGas({ from: account });


                    const currentGasPrice = await web3.eth.getGasPrice();
                    const priorityFee = web3.utils.toWei('3', 'gwei');
                    const totalGasPrice = currentGasPrice + BigInt(priorityFee);

                    // Send the transaction with the calculated gas price and limit
                    await contract.methods
                        .disableAirdrop(airdropIdHex)
                        .send({
                            from: account,
                            gas: gasEstimate.toString(),
                            gasPrice: totalGasPrice.toString(),
                        });

                    alert('Airdrop successfully disabled.');
                    window.location.reload();
                } catch (error) {
                    console.log(error);
                    const parseError = (error: any) => {
                        const message = error?.message || 'Transaction failed';
                        const match = message.match(/execution reverted: (.*)"/);
                        return match ? match[1] : message;
                    };

                    const readableError = parseError(error);
                    alert('Error: ' + readableError);
                }

                setLoading5(false);
            }
        } catch (error: any) {
            console.log(error);
            setLoading5(false);
            alert(error.message);
        }
    };


    return (
        <Card sx={{ maxWidth: "900px", width: "100%", backgroundColor: "#141e43" }}>
            <CardContent>

                <Typography variant="h6" component="div" style={{ fontWeight: "600", textAlign: "center", color: 'white' }}>
                    Airdrop Details
                </Typography>

                {!account &&
                    <Box component="p" sx={{ color: 'white', mt: 2, textAlign: "center" }}>
                        Please connect wallet to proceed.
                    </Box>
                }
                {airdrop && airdropData && !airdropData.isCreated &&
                    <Box component="div" sx={{ color: 'white', mt: 2, textAlign: "center" }}>
                        Airdrop is created on-chain but it's not updated in your DB.
                        <Box mt={2}>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: "#4a4ba7",
                                    textTransform: "none",
                                    height: "30px", // Matches input height
                                    fontSize: "14px", // Adjust text size
                                    padding: "10px 10px", // Adjust padding
                                    '&:hover': {
                                        backgroundColor: "#00ffcc",
                                        color: "black"
                                    },
                                    '&.Mui-disabled': {
                                        backgroundColor: "#ccc",
                                        color: "#666",
                                    },
                                }}
                                onClick={updateCreatedStatus}
                                disabled={loading2}
                            >
                                Update
                            </Button>
                        </Box >
                    </Box>

                }
                {airdropData && airdropData.isCreated && !loading3 && !airdrop &&
                    <Box component="p" sx={{ color: 'white', mt: 2, textAlign: "center" }}>
                        Airdrop is not found on-chain. It might not be created or deleted by admin.
                    </Box>
                }
                {airdropData && !airdropData.isCreated && !loading3 && !airdrop &&
                    <Box component="div" sx={{ color: 'white', mt: 2 }}>
                        <Box sx={{ color: 'white', mt: 2, textAlign: "center" }}>
                            Airdrop is not created on-chain.
                            <Box mt={2}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#4a4ba7",
                                        textTransform: "none",
                                        height: "30px", // Matches input height
                                        fontSize: "14px", // Adjust text size
                                        padding: "10px 10px", // Adjust padding                    

                                        '&:hover': {
                                            backgroundColor: "#00ffcc",
                                            color: "black"
                                        },
                                        '&.Mui-disabled': {
                                            backgroundColor: "#ccc",
                                            color: "#666",
                                        },
                                    }}
                                    onClick={confirmAirdrop}
                                    disabled={loading4}
                                >
                                    Confirm Airdrop
                                </Button>
                            </Box >
                        </Box>

                        <Grid container spacing={2} my={6} sx={{}}>

                            <Grid size={{ xs: 12, md: 6, lg: 6 }}
                                sx={{
                                    color: 'white',
                                }} key={`item-1`}>
                                <div > <span style={{ fontWeight: "600" }}>Airdrop ID :</span> <span>{airdropData.airdropId}</span></div>

                            </Grid>

                            <Grid size={{ xs: 12, md: 6, lg: 6 }}
                                sx={{
                                    color: 'white',
                                }} key={`item-12`}>
                                <div > <span style={{ fontWeight: "600" }}>Date :</span> <span>{moment(airdropData.createdAt).format("yyyy-MM-DD hh:mm a")}</span></div>

                            </Grid>

                            <Grid size={{ xs: 12, md: 6, lg: 6 }}
                                sx={{
                                    color: 'white',
                                }} key={`item-3`}>
                                <div > <span style={{ fontWeight: "600" }}>Total Tokens :</span> <span>{airdropData.totalTokens}</span></div>

                            </Grid>

                            <Grid size={{ xs: 12, md: 6, lg: 6 }}
                                sx={{
                                    color: 'white',
                                }} key={`item-4`}>
                                <div > <span style={{ fontWeight: "600" }}>Total Recipients :</span> <span>{airdropData.totalRecipients}</span></div>

                            </Grid>

                        </Grid>
                    </Box>

                }

                {
                    account && loading && <Typography color="white" sx={{ textAlign: "center" }}>Loading...</Typography>
                }
                {
                    account && !loading && airdrop &&
                    <Grid container spacing={2} my={6} sx={{}}>

                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-5`}>
                            <div > <span style={{ fontWeight: "600" }}>Airdrop ID :</span> <span>{airdropId}</span></div>

                        </Grid>

                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-6`}>
                            <div > <span style={{ fontWeight: "600" }}>Merkle Root :</span> <span>{airdrop?.merkleRoot}</span></div>

                        </Grid>




                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-7`}>
                            <div > <span style={{ fontWeight: "600" }}>Total Tokens :</span> <span>{utils.fromWei(airdrop.totalTokens, "ether")}</span></div>

                        </Grid>

                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-8`}>
                            <div > <span style={{ fontWeight: "600" }}>Claimed Tokens :</span> <span>{utils.fromWei(airdrop.claimedTokens, "ether")}</span></div>

                        </Grid>

                        <Grid size={{ xs: 12, md: 6, lg: 6 }}
                            sx={{
                                color: 'white',
                            }} key={`item-9`}>
                            <div > <span style={{ fontWeight: "600" }}>Status :</span>  {airdrop.isActive == "1" ? <span style={{ color: "#00ffcc" }}>Active</span> : <span style={{ color: "red" }}>Disabled</span>} </div>

                        </Grid>


                        <Grid size={{ xs: 12, md: 6, lg: 6 }}
                            sx={{
                                color: 'white',
                            }} key={`item-10`}>
                            <div > <span style={{ fontWeight: "600" }}>Completed :</span> {airdrop.isCompleted == "1" ? <span style={{ color: "#00ffcc" }}>Yes</span> : <span style={{ color: "red" }}>No</span>}</div>

                        </Grid>


                        <Grid size={{ xs: 12, md: 6, lg: 6 }}
                            sx={{
                                color: 'white',
                            }} key={`item-11`}>
                            <div > <span style={{ fontWeight: "600" }}>Total Recipients :</span> <span>{airdrop.totalCount}</span></div>

                        </Grid>

                        <Grid size={{ xs: 12, md: 6, lg: 6 }}
                            sx={{
                                color: 'white',
                            }} key={`item-12`}>
                            <div > <span style={{ fontWeight: "600" }}>Claimed Recipients :</span> <span>{airdrop.claimedCount}</span></div>

                        </Grid>
                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-13`}>

                            <Box component="div" sx={{ color: 'white', mt: 2, textAlign: "left" }}>
                                Want to   {airdrop.isActive == "1" ? <span style={{ color: "red" }}>Disable Airdrop</span> : <span style={{ color: "#00ffcc" }}>Enable Airdrop</span>} ?
                                <Box mt={2}>
                                    {
                                        airdrop.isActive == "1" &&
                                        <Button
                                            variant="contained"
                                            sx={{
                                                backgroundColor: "#4a4ba7",
                                                textTransform: "none",
                                                height: "30px", // Matches input height
                                                fontSize: "14px", // Adjust text size
                                                padding: "10px 10px", // Adjust padding                    

                                                '&:hover': {
                                                    backgroundColor: "#00ffcc",
                                                    color: "black"
                                                },
                                                '&.Mui-disabled': {
                                                    backgroundColor: "#ccc",
                                                    color: "#666",
                                                },
                                            }}
                                            onClick={disableAirdrop}
                                            disabled={loading5}
                                        >
                                            Disable Airdrop
                                        </Button>
                                    }
                                    {
                                        airdrop.isActive == "0" &&
                                        <Button
                                            variant="contained"
                                            sx={{
                                                backgroundColor: "#4a4ba7",
                                                textTransform: "none",
                                                height: "30px", // Matches input height
                                                fontSize: "14px", // Adjust text size
                                                padding: "10px 10px", // Adjust padding                    

                                                '&:hover': {
                                                    backgroundColor: "#00ffcc",
                                                    color: "black"
                                                },
                                                '&.Mui-disabled': {
                                                    backgroundColor: "#ccc",
                                                    color: "#666",
                                                },
                                            }}
                                            onClick={enableAirdrop}
                                            disabled={loading5}
                                        >
                                            Enable Airdrop
                                        </Button>
                                    }

                                </Box >
                            </Box>

                        </Grid>


                    </Grid>

                }

            </CardContent>
        </Card >
    )
}

export default AirdropDetail;