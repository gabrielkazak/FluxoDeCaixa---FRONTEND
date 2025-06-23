// App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import useTokenRefresher from './services/Refresh';

// Importe suas páginas
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/LoginPage/LoginPage';
import UpdatePage from './pages/UpdateUserPage/UpdateUserPage';
import ForgotPasswordPage from './pages/RecPasswordPage/RecPasswordPage';
import HomePage from './pages/HomePage/HomePage';
import FlowPage from './pages/FlowPage/FlowPage';
import FlowCrudPage from './pages/FlowCrudPage/FlowCrudPage';
import FilterFlowsPage from './pages/FilterFlowsPage/FilterFlowsPage';

const App = () => {
  const isAuthenticated = true;
  useTokenRefresher();

  return (
    <Router>
      <Routes>
        {/* Rotas para Login/Registro/Update */}
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/updateUser' element={<UpdatePage />} />

        {/* Esta rota vai lidar com /forgot-password e /forgot-password?token=XYZ */}
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />

        <Route
          path='/dashboard'
          element={
            isAuthenticated ? <HomePage /> : <Navigate to='/login' replace />
          }
        />

        <Route path='/flowPage' element={<FlowPage />} />

        <Route path='/allFlows' element={<FlowCrudPage />} />

        <Route path='/filter' element={<FilterFlowsPage />} />

        {/* Redireciona a rota raiz para /login */}
        <Route path='/' element={<Navigate to='/login' replace />} />

        {/* Opcional: Rota para 404 - Página Não Encontrada */}
        <Route path='*' element={<div>404 - Página Não Encontrada</div>} />
      </Routes>
    </Router>
  );
};

export default App;
