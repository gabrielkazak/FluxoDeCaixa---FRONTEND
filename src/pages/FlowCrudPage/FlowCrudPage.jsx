import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlowCrudPage.css';

const FlowCrudPage = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState('');
    const [flows, setFlows] = useState([]);
    const [loadingFlows, setLoadingFlows] = useState(false);
    const [errorFlows, setErrorFlows] = useState(null);

    const [action, setAction] = useState('SeeAll'); // SeeAll e Update

    const [flowId, setFlowID] = useState('')
    const [id, setId] = useState('');
    const [tipo, setTipo] = useState('');
    const [classificacao, setClassificacao] = useState('');
    const [valor, setValor] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('');
    const [descricao, setDescricao] = useState('');

    const fetchBalance = useCallback(async () => {
        try {
            const accessToken = sessionStorage.getItem('accessToken');

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

    const handleFetchFlows = useCallback(async () => {
        setLoadingFlows(true);
        setErrorFlows(null);
        const accessToken = sessionStorage.getItem('accessToken');

        if (!accessToken) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('/api/flows/all', {
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
            console.error('Erro ao buscar movimentações:', error);
            setErrorFlows(error.message);
            if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
                alert('Sua sessão expirou ou não está autorizada. Por favor, faça login novamente.');
            }
        } finally {
            setLoadingFlows(false);
        }
    }, [navigate]);

    useEffect(() => {
        handleFetchFlows();
    }, [handleFetchFlows]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    useEffect(() => {
        const storedID = localStorage.getItem('id');
        if (!storedID) {
            navigate('/login');
        }
    }, [navigate]);

    const handleUpdateFlow = useCallback(async (e) => {
        e.preventDefault();

        const accessToken = sessionStorage.getItem('accessToken');

        const flowData = {
            idUsuario: Number(id),
            tipo,
            classificacao,
            valor: parseFloat(valor),
            formaPagamento,
            dataMovimentacao: new Date().toISOString(),
            descricao,
        };

        console.log('dados enviados', flowData)
        console.log('id da movimentação', flowId)
        console.log(`enviado dados para /api/flows/${flowId}`)

        try {
            const response = await fetch(`/api/flows/${flowId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(flowData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar movimentação');
            }

            const data = await response.json();
            console.log('Movimentação Atualizada com sucesso:', data);
            alert('Movimentação Atualizada com sucesso!');
            setTipo('');
            setClassificacao('');
            setValor('');
            setFormaPagamento('');
            setDescricao('');
            await fetchBalance();
            handleFetchFlows();
            setAction('SeeAll');

        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro na requisição. Verifique sua conexão com o servidor.');
        }
    }, [flowId, id, tipo, classificacao, valor, formaPagamento, descricao, fetchBalance, handleFetchFlows]);

    const handleEditClick = (flow) => {
        setFlowID(flow.id)
        setId(localStorage.getItem('id'));
        setTipo(flow.tipo);
        setClassificacao(flow.classificacao);
        setValor(flow.valor);
        setFormaPagamento(flow.formaPagamento);
        setDescricao(flow.descricao);
        setAction('Update');
    };

    return (
        <>
            <div className="d-flex flex-column min-vh-100 bg-light">
                <header className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm p-3">
                    <div className="container-fluid">
                        <button className="btn btn-success btn-lg border">
                            <a className="btn-flowPage" href="/allFlows">
                                Ver Movimentações
                            </a>
                        </button>
                        <button className="btn btn-success btn-lg border">
                            <a className="btn-flowPage" href="/dashboard">
                                Voltar a Dashboard
                            </a>
                        </button>
                    </div>
                </header>

                <main className="flex-grow-1 p-3 p-md-4">
                    <div className="container-fluid py-4 bg-white rounded shadow-sm">
                        <h2 className="text-center text-success mb-4 display-6">Bem-vindo(a) a aba de movimentação</h2>
                        {balance && (
                            <div className="d-flex justify-content-between">
                                <p className="lead text-center mb-4">
                                    Saldo na conta <strong>R${balance.saldoConta}</strong>
                                </p>
                                <p className="lead text-center mb-4">
                                    Saldo no caixa <strong>R${balance.saldoCaixa}</strong>
                                </p>
                            </div>
                        )}

                        {action === 'SeeAll' && (
                            <div className="row g-4">
                                <div className="col-12 text-center">
                                    <div className="card h-100 border-success shadow-sm">
                                        <div className="card-body bg-light-green-subtle">
                                            <h3 className="card-title text-success mb-3">Movimentações Recentes</h3>
                                            {loadingFlows && <p>Carregando movimentações...</p>}
                                            {errorFlows && <p className="text-danger">Erro: {errorFlows}</p>}
                                            {flows.length > 0 ? (
                                                <ul className="list-group list-group-flush">
                                                    {flows.map((flow) => (
                                                        <li key={flow.id} className="list-group-item">
                                                            <div className="d-flex flex-column">
                                                                <div className="d-flex justify-content-between mb-2">
                                                                    <p className="mb-0">
                                                                        <strong>Tipo:</strong> {flow.tipo}
                                                                    </p>
                                                                    <p className="mb-0">
                                                                        <strong>Classificação:</strong> {flow.classificacao}
                                                                    </p>
                                                                </div>

                                                                <div className="d-flex justify-content-between mb-2">
                                                                    <p className="mb-0">
                                                                        <strong>Valor:</strong> R${flow.valor}
                                                                    </p>
                                                                    <p className="mb-0">
                                                                        <strong>Forma de Pagamento:</strong> {flow.formaPagamento}
                                                                    </p>
                                                                </div>

                                                                <div className="d-flex justify-content-between mb-3">
                                                                    <p className="mb-0">
                                                                        <strong>Data:</strong> {new Date(flow.dataMovimentacao).toLocaleDateString()}
                                                                    </p>
                                                                    <p className="mb-0">
                                                                        <strong>Descrição:</strong> {flow.descricao}
                                                                    </p>
                                                                </div>
                                                                <div className="d-flex justify-content-center">
                                                                    <button
                                                                        className="btn btn-secondary btn-sm"
                                                                        onClick={() => handleEditClick(flow)} // Call handleEditClick with the flow data
                                                                    >
                                                                        &#x270E; Editar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                !loadingFlows && !errorFlows && <p>Nenhuma movimentação encontrada.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {action === 'Update' && (
                            <div className="row g-4">
                                <div className="col-12 text-center">
                                    <div className="card h-100 border-success shadow-sm">
                                        <div className="card-body bg-light-green-subtle">
                                            <h3 className="card-title text-success mb-3">Atualizar Movimentação de Caixa</h3>

                                            <form onSubmit={handleUpdateFlow}>
                                                <div className="mb-3 text-start">
                                                    <label htmlFor="tipo" className="form-label">
                                                        Tipo
                                                    </label>
                                                    <select
                                                        id="tipo"
                                                        className="form-select"
                                                        value={tipo}
                                                        onChange={(e) => setTipo(e.target.value)}
                                                    >
                                                        <option value="">Selecione</option>
                                                        <option value="Entrada">Entrada</option>
                                                        <option value="Saida">Saída</option>
                                                    </select>
                                                </div>

                                                <div className="mb-3 text-start">
                                                    <label htmlFor="classificacao" className="form-label">
                                                        Classificação
                                                    </label>
                                                    <select
                                                        id="classificacao"
                                                        className="form-select"
                                                        value={classificacao}
                                                        onChange={(e) => setClassificacao(e.target.value)}
                                                    >
                                                        <option value="">Selecione</option>
                                                        <option value="Venda">Venda</option>
                                                        <option value="Compra">Compra</option>
                                                        <option value="Investimento">Investimento</option>
                                                        <option value="PrestacaoServico">Prestação de Serviço</option>
                                                        <option value="GastoFixo">Gasto Fixo</option>
                                                    </select>
                                                </div>

                                                <div className="mb-3 text-start">
                                                    <label htmlFor="valor" className="form-label">
                                                        Valor
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="valor"
                                                        className="form-control"
                                                        placeholder="Digite o valor"
                                                        value={valor}
                                                        onChange={(e) => setValor(e.target.value)}
                                                    />
                                                </div>

                                                <div className="mb-3 text-start">
                                                    <label htmlFor="formaPagamento" className="form-label">
                                                        Forma de Pagamento
                                                    </label>
                                                    <select
                                                        id="formaPagamento"
                                                        className="form-select"
                                                        value={formaPagamento}
                                                        onChange={(e) => setFormaPagamento(e.target.value)}
                                                    >
                                                        <option value="">Selecione</option>
                                                        <option value="Pix">Pix</option>
                                                        <option value="Dinheiro">Dinheiro</option>
                                                        <option value="Cartao">Cartão</option>
                                                    </select>
                                                </div>

                                                <div className="mb-3 text-start">
                                                    <label htmlFor="descricao" className="form-label">
                                                        Descrição
                                                    </label>
                                                    <textarea
                                                        id="descricao"
                                                        className="form-control"
                                                        rows="3"
                                                        placeholder="Digite uma descrição"
                                                        value={descricao}
                                                        onChange={(e) => setDescricao(e.target.value)}
                                                    />
                                                </div>

                                                <button type="submit" className="btn btn-success">
                                                    Salvar Movimentação
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <footer className="bg-dark text-white text-center py-3 shadow-top">
                    <p className="mb-0">&copy; 2025 Meu App. Todos os direitos reservados.</p>
                </footer>
            </div>
        </>
    );
};

export default FlowCrudPage;
