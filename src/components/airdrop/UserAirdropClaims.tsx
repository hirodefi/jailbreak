import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useWeb3 } from "../../context/web3Context";
import { airdropContractAddress, airdropContractABI } from "../../configs/contract";
import moment from "moment";

import axiosInstance from '../../services/axiosInstance';  // Import the custom axios instance
import { AxiosResponse } from "axios";


interface Claim {
    address: string;
    airdropId: number;
    amount: number;
    createdAt: string;
    isClaimed: '' | 'true' | 'false';
    _id: string;
}

const UserAirdropClaims: React.FC = () => {


    const { web3, account, utils } = useWeb3();

    const [claims, setClaims] = useState<Claim[]>([]);
    const [claimsFetched, setClaimsFetched] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);



    useEffect(() => {

        if (account) {
            setLoading(true);
            axiosInstance
                .get('/airdrop/claim/all', { params: { address: account } }) // Now using the axios instance with interceptors
                .then((response) => {
                    setClaims(response.data.data.claims);
                    setLoading(false);
                    setClaimsFetched(true);
                })
                .catch((error) => {
                    alert(error.message)
                    setLoading(false);
                });
        }

    }, [account]);


    useEffect(() => {
        if (claimsFetched) {
            fetchUserClaims();
        }
    }, [account, web3, claimsFetched])

    const fetchUserClaims = async (): Promise<void> => {
        if (web3 && account && claims.length) {
            try {
                const options = {
                    filter: {
                        user: [account]
                    },
                    fromBlock: 0,
                    toBlock: 'latest',
                }
                const contract = new (web3.eth.Contract as any)(airdropContractABI, airdropContractAddress);
                const events = await contract.getPastEvents("ClaimedToken", options);

                let result = claims.map((claim) => {
                    let flag = events.some((item: any) => {
                        return utils.hexToNumberString(item.returnValues.airdropId) === `${claim.airdropId}`;
                    })
                    return { ...claim, isClaimed: (flag ? 'true' : 'false') as '' | 'true' | 'false' }
                })

                setClaims(result);
            } catch (error) {
                // console.log(error);
            }

        }
    }


    const claimToken = async (id: string): Promise<void> => {
        if (account && web3 && id) {
            setLoading2(true);
            try {

                const result: AxiosResponse = await axiosInstance.get('/airdrop/merkleProof', { params: { claimObjectId: id } });
                let data = result.data.data;

                if (data) {

                    const { airdropId, amount, proofIndex, proof } = data;

                    try {

                        const contract = new web3.eth.Contract(
                            airdropContractABI,
                            airdropContractAddress
                        );
                        let gasEstimate;
                        try {
                            gasEstimate = await contract.methods
                                .claim(airdropId, amount, proofIndex, proof)
                                .estimateGas({ from: account });
                        } catch (error) {
                            alert("Gas estimation failed");
                            setLoading2(false);
                            return;
                        }

                        const currentGasPrice = await web3.eth.getGasPrice();
                        const priorityFee = web3.utils.toWei('3', 'gwei');
                        const totalGasPrice = currentGasPrice + BigInt(priorityFee);

                        await contract.methods
                            .claim(airdropId, amount, proofIndex, proof)
                            .send({
                                from: account,
                                gas: gasEstimate.toString(),
                                gasPrice: totalGasPrice.toString(),
                            });

                        alert('Claim successful.');
                        window.location.reload();
                    }
                    catch (error) {
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
            } catch (error: any) {
                console.log(error);
                alert(error.message)
            }
            setLoading2(false);
        }
        else {
            alert("pleaes connect to metamask")
        }
    }


    return (
        <Card sx={{ maxWidth: "900px", width: "100%", backgroundColor: "#141e43" }}>
            <CardContent>

                <Typography variant="h6" component="div" style={{ fontWeight: "600", textAlign: "center", color: 'white' }}>
                    My Claims
                </Typography>

                {!account &&
                    <Box component="p" sx={{ color: 'white', mt: 2, textAlign: "center" }}>
                        Please connect wallet to proceed.
                    </Box>
                }
                {
                    account && loading && <Typography color="white" sx={{ textAlign: "center" }}>Loading...</Typography>
                }
                {account && !loading && (
                    <TableContainer component={Paper} sx={{ mt: 2, backgroundColor: "#141e43", boxShadow: "none" }}>
                        <Table sx={{ minWidth: 650 }} aria-label="claims table">
                            <TableHead >
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Airdrop ID</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Credited</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {claims.map((claim) => (
                                    <TableRow key={claim.airdropId}>
                                        <TableCell sx={{ color: 'white' }}>{claim.airdropId}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>{claim.amount} S</TableCell>
                                        <TableCell sx={{ color: 'white' }}>
                                            {moment(claim.createdAt).format('yyyy-MM-DD')}
                                        </TableCell>

                                        <TableCell sx={{}}>
                                            {
                                                claim.isClaimed === 'true' && <span style={{ color: "#00ffcc" }}>Claimed</span>}
                                            {

                                                claim.isClaimed === 'false' &&
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
                                                    disabled={loading2}
                                                    onClick={() => claimToken(claim._id)}
                                                >
                                                    Claim
                                                </Button>

                                            }

                                        </TableCell>

                                    </TableRow>
                                ))}

                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card >
    )
}

export default UserAirdropClaims;