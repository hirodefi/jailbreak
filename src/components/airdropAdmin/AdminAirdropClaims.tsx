import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { useWeb3 } from "../../context/web3Context";
import { airdropContractABI, airdropContractAddress } from "../../configs/contract";
import { useLocation } from "react-router-dom";

import axiosInstance from '../../services/axiosInstance';  // Import the custom axios instance


interface Claim {
    address: string;
    airdropId: number;
    amount: number;
    createdAt: string;
    order: number;
}

const AdminAirdropClaims: React.FC = () => {


    const { web3, account, utils } = useWeb3();

    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimsFetched, setClaimsFetched] = useState<boolean>(false);
    const [bitmap, setBitmap] = useState<string>('');
    const [page, setPage] = useState(0);
    const [maxRecords, setMaxRecords] = useState(0);
    const size = 256; // should be always 256


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search); // Parse the query string

    const airdropId = queryParams.get('airdropId');

    useEffect(() => {

        if (account && airdropId) {
            axiosInstance
                .get('/airdrop/admin/claim/all', { params: { airdropId: parseInt(airdropId) } })
                .then((response) => {
                    setClaims(response.data.data.claims);
                    setMaxRecords(response.data.data.claims.length);
                    setLoading(false);
                    setClaimsFetched(true);
                })
                .catch((error) => {
                    alert(error.message)
                    setLoading(false);
                });
        }

    }, [airdropId, account]);


    useEffect(() => {
        if (claimsFetched) {
            fetchAirdropData();
        }
    }, [airdropId, web3, claimsFetched, page]);

    const fetchAirdropData = async (): Promise<void> => {
        if (web3 && airdropId && claims.length) {
            try {
                let airdropIdHex = utils.numberToHex(airdropId);
                airdropIdHex = utils.padLeft(airdropIdHex, 64);

                const contract = new web3.eth.Contract(airdropContractABI, airdropContractAddress);
                const airdrop: bigint = await contract.methods.getClaimedBitmap(airdropIdHex, page).call(); // size should be 256
                if (airdrop !== null || airdrop !== undefined) {
                    let bitmap = airdrop.toString(2).padStart(256, '0');
                    setBitmap([...bitmap].reverse().join(''));
                }
            } catch (error) {
                console.log(error)
            }

        }
    }

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };


    return (
        <Card sx={{ maxWidth: "900px", width: "100%", backgroundColor: "#141e43" }}>
            <CardContent>

                <Typography variant="h6" component="div" style={{ fontWeight: "600", textAlign: "center", color: 'white' }}>
                    Recipients
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
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Sl.No.</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Adress</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {claims.filter((claim) => {
                                    let position = claim.order + 1;
                                    let limit = page * size;
                                    return position >= limit + 1 && position <= limit + size;
                                }).map((claim) => (
                                    <TableRow key={claim.order}>
                                        <TableCell sx={{ color: 'white' }}>{claim.order + 1}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>{claim.address}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>{claim.amount}</TableCell>
                                        <TableCell >
                                            {bitmap !== "" && (
                                                bitmap.charAt(claim.order) == "1" ? <span style={{ color: '#00ffcc' }}>Claimed</span> : <span style={{ color: 'yellow' }}>Pending</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={maxRecords}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={size}
                            rowsPerPageOptions={[]}
                            sx={{ color: "white" }}
                        />
                    </TableContainer>
                )}
            </CardContent>
        </Card >
    )
}

export default AdminAirdropClaims;