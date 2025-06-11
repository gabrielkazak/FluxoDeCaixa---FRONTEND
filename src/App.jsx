// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importe suas páginas
import AuthPage from './pages/AuthPage/AuthPage';
import ForgotPasswordPage from './pages/RecPasswordPage/RecPasswordPage';
import HomePage from './pages/HomePage/HomePage';

const App = () => {

  const isAuthenticated = true;

    return (
        <Router>
            <Routes>
                {/* Rota para Login/Registro */}
                <Route path="/login" element={<AuthPage />} />

                {/* Rota para Recuperação de Senha */}
                {/* Esta rota vai lidar com /forgot-password e /forgot-password?token=XYZ */}
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />}
                />

                {/* Redireciona a rota raiz para /login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Opcional: Rota para 404 - Página Não Encontrada */}
                <Route path="*" element={<div>404 - Página Não Encontrada</div>} />
            </Routes>
        </Router>
    );
};

export default App;