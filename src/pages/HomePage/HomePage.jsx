// pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Nome do arquivo CSS ajustado

const HomePage = () => {
    const navigate = useNavigate();

    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [errorUsers, setErrorUsers] = useState(null);

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        const storedRole = localStorage.getItem('userRole');
        const storedAccessToken = sessionStorage.getItem('accessToken');

        if (storedName && storedRole && storedAccessToken) {
            setUserName(storedName);
            setUserRole(storedRole);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = useCallback(async () => {
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        sessionStorage.removeItem('accessToken');

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('Logout realizado com sucessso');
            } else {
                const errorData = await response.json();
                console.error('Erro ao fazer logout no backend:', errorData.message || 'Erro desconhecido');
                alert(`Não foi possível deslogar completamente: ${errorData.message || 'Verifique sua conexão.'}`);
            }
        } catch (error) {
            console.error('Erro na requisição de logout:', error);
            alert('Erro de conexão ao tentar deslogar. Por favor, tente novamente.');
        } finally {
            navigate('/login');
        }
    }, [navigate]);

    const handleFetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        setErrorUsers(null);
        const accessToken = sessionStorage.getItem('accessToken');

        if (!accessToken) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao buscar usuários');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            setErrorUsers(error.message);
            if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
                 alert('Sua sessão expirou ou não está autorizada. Por favor, faça login novamente.');
                 handleLogout();
            }
        } finally {
            setLoadingUsers(false);
        }
    }, [navigate, handleLogout]);

    useEffect(() => {
        if (userRole === 'admin') {
            handleFetchUsers();
        }
    }, [userRole, handleFetchUsers]);

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <header className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm p-3">
                <div className="container-fluid">
                    <h1 className="navbar-brand mb-0 h1 fs-2">Meu Dashboard</h1>
                    <button
                        className="btn btn-danger btn-lg"
                        onClick={handleLogout}
                    >
                        Deslogar
                    </button>
                </div>
            </header>

            <main className="flex-grow-1 p-3 p-md-4">
                <div className="container-fluid py-4 bg-white rounded shadow-sm">
                    <h2 className="text-center text-success mb-4 display-6">Bem-vindo(a) ao seu Dashboard {userName}!</h2>
                    <p className="lead text-center mb-4">
                        Aqui você pode ver informações importantes e acessar as funcionalidades do sistema.
                        {userRole && <br />}
                    </p>

                    <div className="row g-4">
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="card h-100 border-success shadow-sm">
                                <div className="card-body bg-light-green-subtle">
                                    <h3 className="card-title text-success mb-3">Visão Geral</h3>
                                    <p className="card-text">Você está logado como {userRole || 'usuário padrão'}.</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-md-6 col-lg-8">
                            <div className="card h-100 border-primary shadow-sm">
                                <div className="card-body bg-light-blue-subtle">
                                    <h3 className="card-title text-primary mb-3">Usuarios cadastrados</h3>
                                    {loadingUsers && <p className="text-center">Carregando usuários...</p>}
                                    {errorUsers && <p className="text-danger text-center">Erro: {errorUsers}</p>}

                                    {userRole === 'admin' && (
                                        users.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {users.map((user) => (
                                                    <li key={user.id} className="list-group-item">
                                                        <strong>{user.name}</strong> - {user.email} ({user.role})
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            !loadingUsers && !errorUsers && <p className="text-center">Nenhum usuário cadastrado encontrado.</p>
                                        )
                                    )}

                                    {userRole === 'user' && (
                                        <ul className="list-group list-group-flush">
                                            <li className="list-group-item text-center text-muted">
                                                Você não tem acesso ao conteúdo de admin.
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-dark text-white text-center py-3 shadow-top">
                <p className="mb-0">&copy; 2025 Meu App. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

export default HomePage;