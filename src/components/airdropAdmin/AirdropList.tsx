import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { useWeb3 } from "../../context/web3Context";
import moment from "moment";
import { useNavigate } from "react-router";

import axiosInstance from '../../services/axiosInstance';  // Import the custom axios instance


interface Airdrop {
    totalRecipients: number;
    airdropId: number;
    totalTokens: number;
    isCreated: boolean;
    createdAt: string
}

const AirdropList: React.FC = () => {

    const { account } = useWeb3();

    const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [maxRecords, setMaxRecords] = useState(0);

    const navigate = useNavigate();

    const size = 5;


    const handleNavigate = (path: string) => {
        navigate(path);
    };

    useEffect(() => {

        if (account) {
            axiosInstance
                .get('/airdrop/admin/all', { params: { page, size } }) // Now using the axios instance with interceptors
                .then((response) => {
                    setAirdrops(response.data.data.records);
                    setMaxRecords(response.data.data.maxRecords || 0);
                    setLoading(false);
                })
                .catch((error) => {
                    alert(error.message)
                    setLoading(false);
                });
        }

    }, [account, page]);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };



    return (
        <Card sx={{ maxWidth: "900px", width: "100%", backgroundColor: "#141e43" }}>
            <CardContent>

                <Typography variant="h6" component="div" style={{ fontWeight: "600", textAlign: "center", color: 'white' }}>
                    Airdrops
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
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Recipients</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tokens</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Created</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Action</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {airdrops.map((airdrop) => (
                                    <TableRow key={airdrop.airdropId}>
                                        <TableCell sx={{ color: 'white' }}>{airdrop.airdropId}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>{airdrop.totalRecipients}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>{airdrop.totalTokens}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>
                                            {moment(airdrop.createdAt).format('yyyy-MM-DD')}
                                        </TableCell>
                                        <TableCell sx={{}}>
                                            {/* Claimed */}

                                            {airdrop.isCreated ? <span style={{ color: "#00ffcc" }}>Created</span> : <span style={{ color: "yellow" }}>Pending</span>}

                                        </TableCell>
                                        <TableCell sx={{}}>
                                            {/* Claimed */}

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
                                                onClick={() => handleNavigate(`detail?airdropId=${airdrop.airdropId}`)}
                                            >
                                                Details
                                            </Button>
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

export default AirdropList;