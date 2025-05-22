import React, {  } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from "react-router";
import LLMDetail from '../components/llm/LLMDetail';
import LLMChat from '../components/llm/LLMChat';


const LLMDetailPage: React.FC = () => {

    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        navigate(path, { replace: true });
    };





    return (
        <Box sx={{ backgroundColor: "#0d0a29", margin: "0px", py: 4, minHeight: 'calc(100vh - 115px)' }}>
            <Box sx={{ width: "100%", margin: "0 auto", display: "flex", justifyContent: "flex-end", paddingRight: "20px" }} >

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
                    onClick={() => handleNavigate("/llm")}
                >
                    Agents
                </Button>
            </Box>


            <Box display="flex" height="calc(100vh - 200px)" mt={4}>
                {/* Left Section */}
                <Box
                    flex={2}
                    display="flex"
                    justifyContent="center"
                    borderRadius={"10px"}
                    margin={2}
                >
                    <LLMDetail ></LLMDetail>
                </Box>

                {/* Right Section */}
                <Box
                    flex={3}
                    display="flex"
                    margin={2}
                >
                    <LLMChat ></LLMChat>
                </Box>

            </Box>

        </Box>
    )
}

export default LLMDetailPage;
