import React, { useState, ChangeEvent, FormEvent } from "react";
import { Typography, Card, CardContent, Button, Box, TextField } from '@mui/material';
import { useWeb3 } from "../../context/web3Context";

import { useNavigate } from "react-router";
import axiosInstance from '../../services/axiosInstance';
import { AxiosResponse } from "axios";
import { jailbreakABI, jailbreakContractAddress } from "../../configs/contract";


interface FormData {
    task: string;
    tokenAmount: number;
    agentTime: number;
    winnerPrize: number;
}

const AdminCreateLLm: React.FC = () => {

    const navigate = useNavigate();

    const { account, web3 } = useWeb3();

    const [formData, setFormData] = useState<FormData>({
        task: '',
        tokenAmount: 0,
        agentTime: 3600,
        winnerPrize: 0
    });

    const [submitting, setSubmitting] = useState(false);


    const handleNavigate = (path: string) => {
        navigate(path, { replace: true });
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (name == "agentTime") {
            setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
        }
        else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.tokenAmount <= 0) {
            alert("please provide a valid fee");
            return;
        }
        if (formData.winnerPrize < 0) {
            alert("please provide a valid winner prize");
            return;
        }
        if (formData.agentTime < 60) {
            alert("please provide a valid time");
            return;
        }
        if (account && web3) {
            setSubmitting(true);

            try {
                const result: AxiosResponse = await axiosInstance.post('/agent/admin', { task: formData.task, tokenAmount: formData.tokenAmount, agentTime: formData.agentTime, winnerPrize: formData.winnerPrize });
                let { data, isError, message } = result.data;
                if (isError) {
                    alert(message);
                } else {
                    // console.log(data);
                    let { agentId, taskHash, tokenAmount, agentTime } = data;
                    if (agentId) {
                        try {

                            const contract = new web3.eth.Contract(
                                jailbreakABI,
                                jailbreakContractAddress
                            );
                            const gasEstimate = await contract.methods
                                .createAgent(agentId, taskHash, tokenAmount, agentTime)
                                .estimateGas({ from: account });

                            const currentGasPrice = await web3.eth.getGasPrice();
                            const priorityFee = web3.utils.toWei('3', 'gwei');
                            const totalGasPrice = currentGasPrice + BigInt(priorityFee);

                            await contract.methods
                                .createAgent(agentId, taskHash, tokenAmount, agentTime)
                                .send({
                                    from: account,
                                    gas: gasEstimate.toString(),
                                    gasPrice: totalGasPrice.toString(),
                                });

                            alert('Agent successfully created on-chain.');
                            handleNavigate("/admin/llm");
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
                        alert("AgentId not found");
                    }
                }
                setSubmitting(false);
            } catch (error: any) {
                console.log(error)
                setSubmitting(false);
                alert(error.message)
            }
        }
    };

    return (
        <Card sx={{ maxWidth: "900px", width: "100%", backgroundColor: "#141e43" }}>
            <CardContent>

                <Typography variant="h6" component="div" style={{ fontWeight: "600", textAlign: "center", color: 'white' }}>
                    Create Agent
                </Typography>

                {!account &&
                    <Box component="p" sx={{ color: 'white', mt: 2, textAlign: "center" }}>
                        Please connect wallet to proceed.
                    </Box>
                }
                {account &&
                    <Box component="form"
                        onSubmit={handleSubmit}
                        display="flex"
                        flexDirection="column"
                        gap={2}
                        width={500}
                        mx="auto"
                        mt={4}>

                        <TextField
                            label="Task"
                            type="text"
                            name="task"
                            value={formData.task}
                            onChange={handleChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'white',
                                        height: '50px'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'white', // White border on hover
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white', // White border when focused
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                        height: '100%'
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'white', // Change label color to white
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'white', // Change label color to white when focused
                                },
                            }}
                        />
                        <TextField
                            label="Fee"
                            type="number"
                            name="tokenAmount"
                            value={formData.tokenAmount}
                            onChange={handleChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'white',
                                        height: '50px'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'white', // White border on hover
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white', // White border when focused
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                        height: '100%'
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'white', // Change label color to white
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'white', // Change label color to white when focused
                                },
                            }}
                            slotProps={{
                                htmlInput: {
                                    step: 'any',
                                    min: 0,  // Minimum value
                                },
                            }}
                        />
                        <TextField
                            label="Winner Prize"
                            type="number"
                            name="winnerPrize"
                            value={formData.winnerPrize}
                            onChange={handleChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'white',
                                        height: '50px'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'white', // White border on hover
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white', // White border when focused
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                        height: '100%'
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'white', // Change label color to white
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'white', // Change label color to white when focused
                                },
                            }}
                            slotProps={{
                                htmlInput: {
                                    step: 'any',
                                    min: 0,  // Minimum value
                                },
                            }}
                        />

                        <TextField
                            label="Time in seconds"
                            type="number"
                            name="agentTime"
                            value={formData.agentTime}
                            onChange={handleChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'white',
                                        height: '50px'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'white', // White border on hover
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white', // White border when focused
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                        height: '100%'
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'white', // Change label color to white
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'white', // Change label color to white when focused
                                },
                            }}
                            slotProps={{
                                htmlInput: {
                                    min: 60,
                                },
                            }}
                        />


                        <Button
                            variant="contained"
                            type="submit"
                            sx={{
                                backgroundColor: "#4a4ba7",
                                textTransform: "none",
                                height: "45px", // Matches input height
                                fontSize: "16px", // Adjust text size
                                padding: "10px 20px", // Adjust padding
                                '&:hover': {
                                    backgroundColor: "#4a4ba7",
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: "#ccc",
                                    color: "#666",
                                },
                            }}
                            disabled={submitting}
                        >
                            Submit
                        </Button>
                    </Box>

                }

            </CardContent>
        </Card >
    )
}

export default AdminCreateLLm;