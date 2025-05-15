import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, Grid, Button, Box } from '@mui/material';
import { useWeb3 } from "../../context/web3Context";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router';
import moment from "moment";
import axiosInstance from '../../services/axiosInstance';


interface Agent {
    _id: string;
    agentId: string;
    agentTask: string;
    taskHash: string;
    tokenAmount: number;
    startTime: number;
    maxEndTime: number;
    endTime: number;
    isCreated: boolean;
    isOver: boolean;
    breakAttempts: number;
    winner: string;
    airdropId: number;
    createdAt: string;
    updatedAt: string;
    winnerPrize:number;
}


const AdminLLMDetail: React.FC = () => {


    const { account } = useWeb3();
    const [agent, setAgent] = useState<Agent>();
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search); // Parse the query string

    const agentId = queryParams.get('agentId');



    useEffect(() => {
        fetchAgent();
    }, [agentId, account]);



    const fetchAgent = async () => {
        if (account && agentId) {
            setLoading(true);
            axiosInstance
                .get('/agent/admin', { params: { agentId: parseInt(agentId) } })
                .then((response) => {
                    setAgent(response.data.data);
                    setLoading(false);
                })
                .catch((error) => {
                    alert(error.message)
                    setLoading(false);
                });
        }
    }


    const handleNavigate = (path: string) => {
        navigate(path, { replace: true });
    };


    return (
        <Card sx={{ maxWidth: "900px", width: "100%", backgroundColor: "#141e43" }}>
            <CardContent>

                <Typography variant="h6" component="div" style={{ fontWeight: "600", textAlign: "center", color: 'white' }}>
                    Agent Details
                </Typography>

                {!account &&
                    <Box component="p" sx={{ color: 'white', mt: 2, textAlign: "center" }}>
                        Please connect wallet to proceed.
                    </Box>
                }

                {
                    account && loading && <Typography color="white" sx={{ textAlign: "center" }}>Loading...</Typography>
                }

                <Box component="div" sx={{ color: 'white', mt: 2 }}>

                    {agent && !loading && <Grid container spacing={2} my={6} sx={{}}>

                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-1`}>
                            <div > <span style={{ fontWeight: "600" }}>Agent ID :</span> <span>{agent.agentId}</span></div>

                        </Grid>

                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-2`}>
                            <div > <span style={{ fontWeight: "600" }}>Fee :</span> <span>{agent.tokenAmount}</span></div>

                        </Grid>

                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-16`}>
                            <div > <span style={{ fontWeight: "600" }}>Winner Prize :</span> <span>{agent.winnerPrize || 0}</span></div>

                        </Grid>

                        <Grid size={{ xs: 12, md: 6, lg: 6 }}
                            sx={{
                                color: 'white',
                            }} key={`item-3`}>
                            <div > <span style={{ fontWeight: "600" }}>Attempts :</span> <span>{agent.breakAttempts}</span></div>

                        </Grid>


                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-4`}>
                            <div > <span style={{ fontWeight: "600" }}>Task :</span> <span>{agent.agentTask}</span></div>

                        </Grid>


                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-5`}>
                            <div > <span style={{ fontWeight: "600" }}>Task Hash :</span> <span>{agent.taskHash}</span></div>

                        </Grid>



                        <Grid size={{ xs: 12, md: 6, lg: 6 }}
                            sx={{
                                color: 'white',
                            }} key={`item-6`}>
                            <div > <span style={{ fontWeight: "600" }}>Status :</span> <span>{agent.isOver ? <span style={{ color: "red" }}> Closed </span> : <span style={{ color: "#00ffcc" }}>Open</span>}</span></div>

                        </Grid>


                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-7`}>

                        </Grid>


                        <Grid size={{ xs: 12, md: 6, lg: 6 }}
                            sx={{
                                color: 'white',
                            }} key={`item-8`}>
                            <div > <span style={{ fontWeight: "600" }}>Created  :</span> <span>{moment(agent.createdAt).format("yyyy-MM-DD hh:mm a")}</span></div>

                        </Grid>

                        <Grid size={{ xs: 12, md: 6, lg: 6 }}
                            sx={{
                                color: 'white',
                            }} key={`item-9`}>
                            <div > <span style={{ fontWeight: "600" }}>Start :</span> {agent.startTime && <span>{moment.unix(agent.startTime).format("yyyy-MM-DD hh:mm a")}</span>}</div>

                        </Grid>

                        <Grid size={{ xs: 12, md: 6, lg: 6 }}
                            sx={{
                                color: 'white',
                            }} key={`item-10`}>
                            <div > <span style={{ fontWeight: "600" }}>Max End :</span> {agent.maxEndTime && <span>{moment.unix(agent.maxEndTime).format("yyyy-MM-DD hh:mm a")}</span>} </div>

                        </Grid>

                        <Grid size={{ xs: 12, md: 6, lg: 6 }}
                            sx={{
                                color: 'white',
                            }} key={`item-11`}>
                            <div > <span style={{ fontWeight: "600" }}>End :</span>  {agent.endTime && <span>{moment.unix(agent.endTime).format("yyyy-MM-DD hh:mm a")}</span>}</div>

                        </Grid>


                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-12`}>

                        </Grid>



                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-13`}>
                            <div > <span style={{ fontWeight: "600" }}>Winner :</span> <span>{agent.winner}</span></div>

                        </Grid>

                        <Grid size={{ xs: 12, md: 12, lg: 12 }}
                            sx={{
                                color: 'white',
                            }} key={`item-14`}>
                            <div >
                                <span style={{ fontWeight: "600" }}>Airdrop ID :</span>
                                {agent.airdropId &&
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
                                        onClick={() => handleNavigate(`/admin/airdrop/detail?airdropId=${agent.airdropId}`)}
                                    >
                                        {agent.airdropId}
                                    </Button>
                                }
                            </div>

                        </Grid>

                    </Grid>}


                </Box>


            </CardContent>
        </Card >
    )
}

export default AdminLLMDetail;