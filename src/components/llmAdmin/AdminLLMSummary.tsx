import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useLocation } from "react-router-dom";

import axiosInstance from '../../services/axiosInstance';
import { useWeb3 } from "../../context/web3Context";

interface Summary {
    senderAddress: string;
    attempts: number;
}

const AdminLLMSummary: React.FC = () => {

    const { account } = useWeb3();


    const [summary, setSummary] = useState<Summary[]>([]);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search); // Parse the query string

    const agentId = queryParams.get('agentId');

    useEffect(() => {

        if (agentId && account) {
            axiosInstance
                .get('/agent-chat/admin/summary', { params: { agentId: parseInt(agentId) } })
                .then((response) => {
                    setSummary(response.data.data.summary);
                    setLoading(false);
                })
                .catch((error) => {
                    alert(error.message)
                    setLoading(false);
                });
        }

    }, [agentId, account]);




    return (
        <Card sx={{ maxWidth: "900px", width: "100%", backgroundColor: "#141e43" }}>
            <CardContent>

                <Typography variant="h6" component="div" style={{ fontWeight: "600", textAlign: "center", color: 'white' }}>
                    Players
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
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Attempts</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {summary.map((item, index) => (
                                    <TableRow key={item.senderAddress}>
                                        <TableCell sx={{ color: 'white' }}>{index + 1}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>{item.senderAddress}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>{item.attempts}</TableCell>

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

export default AdminLLMSummary;