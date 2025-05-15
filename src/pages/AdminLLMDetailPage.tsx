import React from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from "react-router";
import AdminLLMSummary from '../components/llmAdmin/AdminLLMSummary';
import AdminLLMDetail from '../components/llmAdmin/AdminLLMDetail';


const AdminLLMDetailPage: React.FC = () => {

    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        navigate(path, { replace: true });
    };

    return (
        <Box sx={{ backgroundColor: "#0d0a29", margin: "0px", py: 4, minHeight: 'calc(100vh - 115px)' }}>
            <Box sx={{ maxWidth: "900px", width: "100%", margin: "0 auto", display: "flex", justifyContent: "flex-end" }} >


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
                    onClick={() => handleNavigate("/admin/llm")}
                >
                    Agents
                </Button>
            </Box>
            <Box sx={{ mt: 2, mb: 4, display: 'flex', justifyContent: 'center' }} >
                <AdminLLMDetail></AdminLLMDetail>
            </Box>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }} >
                <AdminLLMSummary></AdminLLMSummary>

            </Box>
        </Box>
    )
}

export default AdminLLMDetailPage;
