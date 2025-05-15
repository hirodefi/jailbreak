import React from "react";
import { Outlet, useNavigate } from "react-router";
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { NavLink } from "react-router-dom";

import { useWeb3 } from '../context/web3Context'; // Import useWeb3 from your context


const AdminLayout: React.FC = () => {

    const { connectMetaMask, disconnectMetaMask, account } = useWeb3();
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        navigate(path);
    };


    return (
        <Box sx={{ padding: "0px" }}>

            {/* Header */}
            <AppBar position="sticky" sx={{ backgroundColor: "#131a35" }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Box
                        component="img"
                        src="/logo2.png"
                        alt="Logo"
                        sx={{ height: 60, cursor: "pointer" }}
                        onClick={() => handleNavigate("/")}
                    />

                    {/* Centered Navigation Links */}
                    <Box sx={{
                        display: 'flex',
                        gap: 3,
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                    }}>

                        <NavLink
                            to="/admin/airdrop"
                            style={({ isActive }) => ({
                                textDecoration: isActive ? 'underline' : 'none',
                                color: isActive ? '#00ffcc' : 'white',
                                fontWeight: isActive ? 'bold' : 'normal',
                                fontSize: "18px"

                            })}
                        >
                            Airdrop
                        </NavLink>
                        <NavLink
                            to="/admin/llm"
                            style={({ isActive }) => ({
                                textDecoration: isActive ? 'underline' : 'none',
                                color: isActive ? '#00ffcc' : 'white',
                                fontWeight: isActive ? 'bold' : 'normal',
                                fontSize: "18px"

                            })}
                        >
                            LLM
                        </NavLink>
                    </Box>

                    {account ? (
                        <Button
                            variant="contained"
                            // onClick={connectMetaMask}
                            sx={{ textTransform: 'none', backgroundColor: "#2a3144" }}
                            onClick={disconnectMetaMask}
                        >
                            <Box
                                component="img"
                                src="/metamask.svg" // Path to your MetaMask SVG in the public folder
                                alt="MetaMask Icon"
                                sx={{ width: 25, height: 25, mr: 1 }} // Adjust width and height as needed
                            />
                            Disconnect
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            // onClick={connectMetaMask}
                            sx={{ textTransform: 'none', backgroundColor: "#2a3144" }}
                            onClick={connectMetaMask}
                        >
                            <Box
                                component="img"
                                src="/metamask.svg" // Path to your MetaMask SVG in the public folder
                                alt="MetaMask Icon"
                                sx={{ width: 25, height: 25, mr: 1 }} // Adjust width and height as needed
                            />
                            Connect
                        </Button>
                    )}

                </Toolbar>
            </AppBar>

            {/* Main content */}
            <Container disableGutters maxWidth={false}
                sx={{
                    maxWidth: '100%',
                }} >
                <Box my={0} mx={0}  >
                    {/* Outlet renders the matched child route */}
                    <Outlet />
                </Box>
            </Container>

            {/* Footer */}
            <footer  >
                <Box py={2} sx={{ backgroundColor: "#131a35" }} color="white" textAlign="center">
                    <Typography variant="body2">© 2025 STAR SWAP</Typography>
                </Box>
            </footer>
        </Box>
    );
};

export default AdminLayout;
