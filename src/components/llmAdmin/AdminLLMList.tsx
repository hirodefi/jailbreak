import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { useWeb3 } from "../../context/web3Context";
import moment from "moment";
import { useNavigate } from "react-router";

import axiosInstance from '../../services/axiosInstance';


interface Agent {
    agentId: number;
    agentTask: string;
    tokenAmount: number;
    isCreated: boolean;
    isOver: boolean;
    breakAttempts: number;
    winner: string;
    airdropId: number;
    createdAt: string;
}

const AdminLLMList: React.FC = () => {

    const { account } = useWeb3();

    const [agents, setAgents] = useState<Agent[]>([]);
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
                .get('/agent/admin/all', { params: { page, size } })
                .then((response) => {
                    setAgents(response.data.data.records);
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
                    Agents
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
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Agent ID</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}> Task</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}> Fee</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}> Onchain</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Attempts</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Created On</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Details</TableCell>



                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {agents.map((agent) => (
                                    <TableRow key={agent.agentId}>
                                        <TableCell sx={{ color: 'white' }}>{agent.agentId}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>{agent.agentTask}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>{agent.tokenAmount}</TableCell>
                                        <TableCell sx={{}}>

                                            {agent.isCreated ? <span style={{ color: "#00ffcc" }}>Yes</span> : <span style={{ color: "red" }}>No</span>}

                                        </TableCell>
                                        <TableCell sx={{}}>
                                            {agent.isOver ? <span style={{ color: "red" }}>Closed</span> : <span style={{ color: "#00ffcc" }}>Open</span>}                                            </TableCell>
                                        <TableCell sx={{ color: 'white' }}>{agent.breakAttempts}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>
                                            {moment(agent.createdAt).format('yyyy-MM-DD')}
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
                                                onClick={() => handleNavigate(`detail?agentId=${agent.agentId}`)}
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

export default AdminLLMList;