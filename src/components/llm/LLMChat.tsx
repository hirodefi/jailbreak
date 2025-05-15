import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, List, ListItem, Paper } from '@mui/material';
import { useWeb3 } from '../../context/web3Context';
import { useLocation } from "react-router-dom";
import axiosInstance from '../../services/axiosInstance';
import { AxiosResponse } from 'axios';
import { jailbreakABI, jailbreakContractAddress } from '../../configs/contract';


interface Chat {
    senderType: string;
    senderAddress: string;
    message: string;
    isWon: boolean;
    createdAt: string;
}

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
}





const LLMChat: React.FC = () => {
    const [messages, setMessages] = useState<Chat[]>([]);
    const [input, setInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [agent, setAgent] = useState<Agent>();



    const { account, web3, utils } = useWeb3();

    const chatEndRef = useRef<HTMLDivElement | null>(null);


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search); // Parse the query string

    const agentId = queryParams.get('agentId');



    useEffect(() => {
        fetchAgent();
    }, [agentId, account]);


    useEffect(() => {
        fetchChats();
    }, [account, agentId])


    const fetchAgent = async () => {
        if (account && agentId) {
            console.log(loading, loading2)
            setLoading2(true);
            axiosInstance
                .get('/agent', { params: { agentId: parseInt(agentId) } })
                .then((response) => {
                    setAgent(response.data.data);
                    setLoading2(false);
                })
                .catch((error) => {
                    alert(error.message)
                    setLoading2(false);
                });
        }
    }

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchChats = async () => {
        if (account && agentId) {
            setLoading(true);
            axiosInstance
                .get('/agent-chat/all', { params: { agentId: parseInt(agentId) } })
                .then((response) => {
                    setMessages(response.data.data.chats);
                    setLoading(false);
                    setTimeout(scrollToBottom, 100);
                })
                .catch((error) => {
                    alert(error.message)
                    setLoading(false);
                });
        }
    }


    const handleSendMessage = async () => {
        let message = input.trim();
        if (message) {

            if (account && web3 && agentId && agent && agent.tokenAmount > 0) {
                setSubmitting(true);
                try {

                    const result: AxiosResponse = await axiosInstance.post('/agent-chat', { agentId: parseInt(agentId), message: message });
                    let data = result.data.data;

                    if (data) {

                        const { agentId, messageHash, count } = data;

                        try {

                            const contract = new web3.eth.Contract(
                                jailbreakABI,
                                jailbreakContractAddress
                            );
                            const amountToPay = utils.toWei(agent.tokenAmount, 'ether');

                            let gasEstimate;
                            try {
                                gasEstimate = await contract.methods
                                    .lockTokens(agentId, messageHash, count)
                                    .estimateGas({ from: account, value: amountToPay });
                            } catch (error) {
                                alert("Gas estimation failed");
                                setSubmitting(false);
                                return;
                            }

                            const currentGasPrice = await web3.eth.getGasPrice();
                            const priorityFee = web3.utils.toWei('3', 'gwei');
                            const totalGasPrice = currentGasPrice + BigInt(priorityFee);

                            await contract.methods
                                .lockTokens(agentId, messageHash, count)
                                .send({
                                    from: account,
                                    gas: gasEstimate.toString(),
                                    gasPrice: totalGasPrice.toString(),
                                    value: amountToPay
                                });

                            setInput("");

                            setTimeout(() => {
                                alert('Chat successful.');
                            }, 2000);


                            setTimeout(() => {
                                fetchAgent();
                                fetchChats();
                            }, 3000);
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
                setSubmitting(false);
            }
            else {
                alert("pleaes connect to metamask")
            }
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            height="74vh"
            width="100%"
            mx="auto"
        >
            {/* Chat Messages */}
            <Paper sx={{ overflowY: 'auto', flexGrow: 1, padding: 2 }}>
                <List>
                    {messages.map((msg, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.senderType === 'USER' ? 'flex-start' : 'flex-end',
                            }}
                        >
                            <Box
                                sx={{
                                    maxWidth: '70%',
                                    backgroundColor: msg.senderType === 'USER' ? '#f1f1f1' : '#d1e7ff',
                                    color: '#000',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    borderTopLeftRadius: msg.senderType === 'USER' ? 0 : '12px',
                                    borderTopRightRadius: msg.senderType === 'USER' ? '12px' : 0,
                                }}
                            >

                                <strong>{msg.senderType === 'USER' ? `${msg.senderAddress}` : "Agent"}</strong>: {msg.isWon ? <span style={{ color: "green", fontWeight: "bold" }}> Winner </span> : ""}
                                <div style={{ marginTop: "5px" }}>
                                    {msg.message}
                                </div>
                            </Box>
                        </ListItem>
                    ))}
                </List>
                <div ref={chatEndRef} />
            </Paper>

            {/* Message Input and Send Button */}
            <Box display="flex" alignItems="center" mt={2}>
                <TextField
                    label="Message..."
                    variant="outlined"
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
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
                        mt: 1
                    }}
                />
                <Button
                    variant="contained"
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
                        ml: 2
                    }}
                    disabled={submitting || agent?.isOver}
                    onClick={handleSendMessage}
                >
                    Send
                </Button>
            </Box>
        </Box>
    );
};

export default LLMChat;
