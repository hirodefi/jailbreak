import React from 'react';
import { Box } from '@mui/material';
import UserAirdropClaims from '../components/airdrop/UserAirdropClaims';

const AirdropHomePage: React.FC = () => {
    return (
        <Box sx={{ backgroundColor: "#0d0a29", margin: "0px", py: 4, minHeight: 'calc(100vh - 115px)' }}>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }} >
                <UserAirdropClaims></UserAirdropClaims>
            </Box>

        </Box>
    )
}


export default AirdropHomePage;
