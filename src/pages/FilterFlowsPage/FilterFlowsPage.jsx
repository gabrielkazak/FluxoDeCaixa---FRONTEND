import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FilterFlowsPage = () => {
    const navigate = useNavigate();

    const [balance, setBalance] = useState('');
    const [filter, setFilter] = useState('');
    const [users, setUsers] = useState([]);
    const [params, setParams] = useState('');
    const [flows, setFlows] = useState([]);

    const handleFetchUsers = useCallback(async () => {
        const accessToken = localStorage.getItem('accessToken');
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
            if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
                alert('Sua sessão expirou ou não está autorizada. Por favor, faça login novamente.');
            }
        }
    }, [navigate]);

    const fetchBalance = useCallback(async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const balanceAPI = await fetch('/api/balance', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!balanceAPI.ok) {
                const errorData = await balanceAPI.json();
                throw new Error(errorData.message || 'Erro ao buscar saldo');
            }

            const data = await balanceAPI.json();
            setBalance(data);
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    }, []);

    const fetchFlows = useCallback(async () => {
        if (!params || !filter) return;
        try {
            const accessToken = localStorage.getItem('accessToken');
            let endpoint = '';

            if (filter === 'Data') {
                console.log(params)
                endpoint = `/api/flows/data/${params}`;
            } else if (filter === 'Usuario') {
                endpoint = `/api/flows/user/${params}`;
            } else {
                return;
            }

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao buscar movimentações');
            }

            const data = await response.json();
            setFlows(data);
        } catch (error) {
            alert('Erro ao buscar as movimentações', error);
        }
    }, [filter, params]);

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'admin') {
            handleFetchUsers();
        }
    }, [handleFetchUsers]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    useEffect(() => {
        fetchFlows();
    }, [params, filter, fetchFlows]);

    return (
        <>
            <div className="d-flex flex-column min-vh-100 min-vw-75 bg-light">
                <header className="navbar navbar-expand-lg navbar-dark shadow-sm p-3">
                    <div className="container-fluid d-flex flex-column flex-md-row justify-content-center align-items-center justify-content-md-around align-items-center">
                        <button className="btn btn-primary btn-lg border">
                            <a className="btn-flowPage" href="/allFlows">Ver Todas</a>
                        </button>
                        <button className="btn btn-primary btn-lg border">
                            <a className="btn-flowPage" href="/flowPage">Criar Movimentação</a>
                        </button>
                        <button className="btn btn-primary btn-lg border my-3">
                            <a className="btn-flowPage" href="/dashboard">Voltar a Dashboard</a>
                        </button>
                    </div>
                </header>

                <main className="flex-grow-1 p-3 p-md-4">
                    <div className="container-fluid py-4 bg-white rounded shadow-sm">
                        {balance && (
                            <div className="d-flex justify-content-between">
                                <p className="lead text-center mb-4">
                                    Saldo na conta <strong className='fw-bold'>R${balance.saldoConta}</strong>
                                </p>
                                <p className="lead text-center mb-4">
                                    Saldo no caixa <strong className='fw-bold'>R${balance.saldoCaixa}</strong>
                                </p>
                            </div>
                        )}

                        <div className="row g-4">
                            <div className="d-flex flex-column justify-content-center align-items-center col-12 text-center">
                                <div className="card border shadow-sm mx-5">
                                    <div className="card-body bg-light-green-subtle px-5 mx-5">
                                        <h3 className="card-title text-primary mb-4 text-center">Filtrar Movimentações</h3>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold">Escolha o filtro:</label>
                                            <select
                                                value={filter}
                                                onChange={e => {
                                                    setFilter(e.target.value);
                                                    setParams('');
                                                    setFlows([]);
                                                }}
                                                className="form-select"
                                            >
                                                <option value="" disabled>Selecione o filtro</option>
                                                <option value="Data">Data</option>
                                                <option value="Usuario">Usuário</option>
                                            </select>
                                        </div>

                                        {filter === 'Data' && (
                                            <div className="mb-4">
                                                <label className="form-label fw-bold">Selecione a data:</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={params}
                                                    onChange={e => setParams(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        {filter === 'Usuario' && users.length > 0 && (
                                            <div className="mb-4">
                                                <label className="form-label fw-bold">Selecione o usuário:</label>
                                                <select
                                                    className="form-select"
                                                    value={params}
                                                    onChange={e => setParams(e.target.value)}
                                                >
                                                    <option value="" disabled>Selecione um usuário</option>
                                                    {users.map(user => (
                                                        <option key={user.id} value={user.id}>{user.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Lista de movimentações */}
                                {flows.length > 0 && (
                                    <div className="card border shadow-sm mx-5 mt-4">
                                        <div className="card-body px-4">
                                            <h4 className="card-title text-center mb-4 text-primary">Movimentações Encontradas</h4>
                                            <ul className="list-group list-group-flush">
                                                {flows.map(flow => (
                                                    <li key={flow.id} className="list-group-item">
                                                        <div className="container-fluid">
                                                            <div className="row mb-2">
                                                                <div className="col-md-6">
                                                                    <strong>Tipo:</strong> {flow.tipo}
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <strong>Classificação:</strong> {flow.classificacao}
                                                                </div>
                                                            </div>

                                                            <div className="row mb-2">
                                                                <div className="col-md-6">
                                                                    <strong>Valor:</strong> R${flow.valor}
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <strong>Forma de Pagamento:</strong> {flow.formaPagamento}
                                                                </div>
                                                            </div>

                                                            <div className="row mb-2">
                                                                <div className="col-md-6">
                                                                    <strong>Data:</strong> {new Date(flow.dataMovimentacao).toLocaleDateString()}
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <strong>Descrição:</strong> {flow.descricao}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div> 
                </main>
            </div>
        </>
    );
};

export default FilterFlowsPage;
