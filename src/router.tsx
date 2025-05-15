import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AirdropHomePage from './pages/AirdropHomePage';
import AdminAirdropHomePage from './pages/AdminAirdropHomePage';
import AdminAirdropDetailPage from './pages/AdminAirdropDetailPage';
import AdminAirdropCreatePage from './pages/AdminAirdropCreatePage';
import LLMHomePage from './pages/LLMHomePage';
import AdminLLMHomePage from './pages/AdminLLMHomePage';
import AdminLayout from './layouts/AdminLayout';
import AdminLLMCreatePage from './pages/AdminLLMCreatePage';
import AdminLLMDetailPage from './pages/AdminLLMDetailPage';
import LLMDetailPage from './pages/LLMDetailPage';




const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Layout will wrap all the routes */}
            <Route path="/" element={<MainLayout />}>
                {/* Define child routes */}
                <Route index element={<Navigate to="llm" replace />} />

                <Route path="llm">
                    <Route index element={<LLMHomePage />} />
                    <Route path='detail' element={<LLMDetailPage />} />
                </Route>
                <Route path='airdrop' element={<AirdropHomePage />} />
                

            </Route>
            <Route path="admin" element={<AdminLayout />}>

                <Route index element={<Navigate to="airdrop" replace />} />

                <Route path="airdrop">
                    <Route index element={<AdminAirdropHomePage />} />
                    <Route path="create" element={<AdminAirdropCreatePage />} />
                    <Route path="detail" element={<AdminAirdropDetailPage />} />
                </Route>
                <Route path="llm">
                    <Route index element={<AdminLLMHomePage />} />
                    <Route path="create" element={<AdminLLMCreatePage />} />
                    <Route path="detail" element={<AdminLLMDetailPage />} />
                </Route>

            </Route>
        </Routes>
    );
};

export default AppRoutes;