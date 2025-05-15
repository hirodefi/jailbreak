import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, Button, Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useWeb3 } from "../../context/web3Context";
import ExcelJS from 'exceljs';

import { validator } from 'web3-validator';
import { useNavigate } from "react-router";
import axiosInstance from '../../services/axiosInstance';


interface Airdrop {
    address: string;
    amount: number;
}

const CreateAirdropList: React.FC = () => {

    const navigate = useNavigate();

    const { account, utils } = useWeb3();

    const [submitting, setSubmitting] = useState(false);

    const [data, setData] = useState<Airdrop[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    const [duplicateData, setDuplicateData] = useState<Airdrop[]>([]);


    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setData([]);
        setDuplicateData([]);
        setTotalAmount(0);

        const workbook = new ExcelJS.Workbook();
        const buffer = await file.arrayBuffer();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0]; // First sheet

        const rows: Airdrop[] = [];
        const duplicates: Airdrop[] = [];
        let hasError = false;
        let errorMessage = "";

        worksheet.eachRow((row: any, rowIndex) => {

            try {
                if (rowIndex > 1 && row?.values) {

                    let [address, amount] = row.values.slice(1);

                    if (!address || !amount) {
                        throw new Error(`Invalid data at row ${rowIndex}`);
                    }

                    address = address.trim().toLowerCase();
                    let amountEth = utils.toWei(amount, "ether");

                    const errors = validator.validate(['address', 'uint256'], [address, amountEth], { silent: true });
                    if (errors) {
                        throw new Error(`Invalid data at row ${rowIndex}: ${errors.toString()}`);
                    }

                    const isExist = rows.some((v) => v.address == address);

                    if (isExist) {
                        duplicates.push({
                            address: address,
                            amount: amount
                        });
                    }
                    else {

                        rows.push({
                            address: address,
                            amount: amount
                        });
                    }
                }
            } catch (error: any) {
                hasError = true;
                errorMessage = error.message || "Unknown error in Excel file";
            }

        });

        if (hasError) {
            alert(errorMessage);
            return;
        }
        if (rows.length > 256) {
            alert("more than 256 recipients");
            return;
        }

        const calculatedAmount = rows.reduce((sum, { amount }) => {
            return sum + amount;
        }, 0)


        setData(rows);
        setDuplicateData(duplicates);
        setTotalAmount(calculatedAmount);
    };

    useEffect(() => {

    }, [data, duplicateData]);

    const uploadAirdrop = async (): Promise<void> => {
        if (account) {
            setSubmitting(true);
            axiosInstance
                .post('/airdrop/admin', { recipients: data, totalCount: data.length, totalAmount: totalAmount })
                .then((response) => {
                    setSubmitting(false);
                    if (response.data.isError) {
                        alert(response.data.message);
                    }
                    else {
                        handleNavigate("/admin/airdrop");
                        alert(response.data.message);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    alert(error.message)
                    setSubmitting(false);
                });
        }

    }


    const handleNavigate = (path: string) => {
        navigate(path, { replace: true });
    };

    const isDisabled = () => {
        return submitting || duplicateData.length > 0 || data.length == 0;
    };


    return (
        <Card sx={{ maxWidth: "900px", width: "100%", backgroundColor: "#141e43" }}>
            <CardContent>

                <Typography variant="h6" component="div" style={{ fontWeight: "600", textAlign: "center", color: 'white' }}>
                    List Airdrop
                </Typography>

                <Box component="p" sx={{ color: 'orange', mt: 2, textAlign: "center" }}>
                    List can have atmost 256 recipients
                </Box>

                {!account &&
                    <Box component="p" sx={{ color: 'white', mt: 2, textAlign: "center" }}>
                        Please connect wallet to proceed.
                    </Box>
                }
                {account &&

                    <Box mt={2}>
                        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                            <Button variant="contained" component="label" sx={{
                                textTransform: "none",
                            }}>
                                Load Excel
                                <input type="file" hidden accept=".xlsx, .xls" onChange={(e) => {
                                    handleUpload(e);
                                    e.target.value = '';
                                }} />
                            </Button>
                            <Button
                                variant="outlined"
                                href="/airdrop_sample.xlsx"
                                download
                                sx={{ textTransform: "none", color: "white", borderColor: "white" }}
                            >
                                Sample Excel
                            </Button>
                        </Box>

                        {
                            duplicateData.length &&
                            <Box mt={2}>
                                <Box component="p" sx={{ color: 'red', mt: 2, textAlign: "left", fontSize: "18px", fontWeight: "600" }} >
                                    Your Excel file has duplicate entries. Please update before airdropping.
                                </Box>
                                <Box mt={2} color={"orange"}>
                                    {duplicateData.map((row, index) => (
                                        <div key={index}>{row.address} | {row.amount}</div>
                                    ))}
                                </Box>
                            </Box>
                        }

                        <TableContainer component={Paper} sx={{ mt: 2, backgroundColor: "#141e43", boxShadow: "none" }}>
                            <Table sx={{ minWidth: 650 }} aria-label="claims table">
                                <TableHead >
                                    <TableRow>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Sl.No.</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Address</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((claim, index) => (
                                        <TableRow key={index}>
                                            <TableCell sx={{ color: 'white' }}>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell sx={{ color: 'white' }}>{claim.address}</TableCell>
                                            <TableCell sx={{ color: 'white' }}>{claim.amount}</TableCell>

                                        </TableRow>
                                    ))}

                                </TableBody>
                            </Table>
                        </TableContainer>



                        <Grid container spacing={2} mt={6} sx={{}}>

                            <Grid size={{ xs: 12, md: 12, lg: 12 }}
                                sx={{
                                    color: 'white',
                                }} key={`item-1`}>
                                <div > <span style={{ fontWeight: "600" }}>Total Recipients :</span> <span>{data.length}</span></div>

                            </Grid>

                            <Grid size={{ xs: 12, md: 12, lg: 12 }}
                                sx={{
                                    color: 'white',
                                }} key={`item-2`}>
                                <div > <span style={{ fontWeight: "600" }}>Total Amount :</span> <span>{totalAmount}</span></div>

                            </Grid>

                        </Grid>
                        <Box mt={3}>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: "#4a4ba7",
                                    textTransform: "none",
                                    '&:hover': {
                                        backgroundColor: "#00ffcc",
                                        color: "black"
                                    },
                                    '&.Mui-disabled': {
                                        backgroundColor: "#ccc",
                                        color: "#666",
                                    },
                                }}
                                onClick={uploadAirdrop}
                                disabled={isDisabled()}
                            >
                                Upload to Server
                            </Button>
                        </Box>

                    </Box>
                }

            </CardContent>
        </Card >
    )
}

export default CreateAirdropList;