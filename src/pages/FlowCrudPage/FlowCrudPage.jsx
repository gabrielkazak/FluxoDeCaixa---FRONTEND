import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import './FlowCrudPage.css';

let chartInstance = null;


const FlowCrudPage = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState('');
  const [chartBalance, setChartBalance] = useState([])
  const [flows, setFlows] = useState([]);
  const [loadingFlows, setLoadingFlows] = useState(false);
  const [errorFlows, setErrorFlows] = useState(null);

  const [action, setAction] = useState('SeeAll');

  const [flowId, setFlowID] = useState('');
  const [id, setId] = useState('');
  const [tipo, setTipo] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [valor, setValor] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [descricao, setDescricao] = useState('');

  const fetchBalance = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      const balanceAPI = await fetch('/api/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
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

  const fetchBalanceForChart = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      const chartApi = await fetch('api/balance/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await chartApi.json()
      setChartBalance(data)
    } catch (error) {
      console.error('Erro ao buscar o historico de saldo',error)
    }
  }, []);

  const handleFetchFlows = useCallback(async () => {
    setLoadingFlows(true);
    setErrorFlows(null);
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/flows/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
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
      if (
        error.message.includes('Unauthorized') ||
        error.message.includes('Forbidden')
      ) {
        alert(
          'Sua sessão expirou ou não está autorizada. Por favor, faça login novamente.'
        );
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
    fetchBalanceForChart()
  }, [fetchBalanceForChart])

  useEffect(() => {
    const storedID = localStorage.getItem('id');
    if (!storedID) {
      navigate('/login');
    }
  }, [navigate]);

  const handleUpdateFlow = useCallback(
    async (e) => {
      e.preventDefault();

      const accessToken = localStorage.getItem('accessToken');

      const flowData = {
        idUsuario: Number(id),
        tipo,
        classificacao,
        valor: parseFloat(valor),
        formaPagamento,
        dataMovimentacao: new Date().toISOString(),
        descricao,
      };

      try {
        const response = await fetch(`/api/flows/${flowId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
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
    },
    [
      flowId,
      id,
      tipo,
      classificacao,
      valor,
      formaPagamento,
      descricao,
      fetchBalance,
      handleFetchFlows,
    ]
  );

  const handleEditClick = (flow) => {
    setFlowID(flow.id);
    setId(localStorage.getItem('id'));
    setTipo(flow.tipo);
    setClassificacao(flow.classificacao);
    setValor(flow.valor);
    setFormaPagamento(flow.formaPagamento);
    setDescricao(flow.descricao);
    setAction('Update');
  };

  const handleChartBuild = (chartBalance) => {
    const data = chartBalance.map(item => new Date(item.data).toLocaleDateString('pt-BR'));

    const saldoConta = chartBalance.map(item => item.saldoConta);
    const saldoCaixa = chartBalance.map(item => item.saldoCaixa);

    const ctx = document.getElementById('fluxoCaixaChart').getContext('2d');

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data,
        datasets: [
          {
            label: 'Saldo na Conta',
            data: saldoConta,
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.1)',
          },
          {
            label: 'Saldo no Caixa',
            data: saldoCaixa,
            borderColor: 'green',
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Fluxo de Caixa em Tempo Real'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        interaction: {
          mode: 'nearest',
          intersect: false
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Data'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Valor (R$)'
            }
          }
        }
      }
    });
  }

  useEffect(() => {
    if (chartBalance.length > 0) {
      handleChartBuild(chartBalance);
    }
  }, [chartBalance]);

  const classificacoes = [
    { label: 'Venda', tipo: 'Entrada' },
    { label: 'PrestacaoServico', tipo: 'Entrada' },
    { label: 'Compra', tipo: 'Saida' },
    { label: 'Investimento', tipo: 'Saida' },
    { label: 'GastoFixo', tipo: 'Saida' }
  ];

  const classificacoesFiltradas = classificacoes.filter(
    (item) => item.tipo === tipo
  );

  return (
    <>
      <div className='d-flex flex-column min-vh-100 min-vw-75 bg-light'>
        <header className='navbar navbar-expand-lg navbar-dark shadow-sm p-3'>
          <div className='container-fluid d-flex flex-column flex-md-row justify-content-center align-items-center justify-content-md-around align-items-center'>
            <button className='btn btn-primary btn-lg border'>
              <a className='btn-flowPage' href='/filter'>
                Filtrar Movimentações
              </a>
            </button>
            <button className='btn btn-primary btn-lg border'>
              <a className='btn-flowPage' href='/flowPage'>
                Criar Movimentação
              </a>
            </button>
            <button className='btn btn-primary btn-lg border my-3'>
              <a className='btn-flowPage' href='/dashboard'>
                Voltar a Dashboard
              </a>
            </button>
          </div>
        </header>

        <main className='flex-grow-1 p-3 p-md-4'>
          <div className='container-fluid py-4 bg-white rounded shadow-sm'>
            {balance && (
              <div className='d-flex justify-content-between'>
                <p className='lead text-center mb-4'>
                  Saldo na conta{' '}
                  <strong className='fw-bold'>R${balance.saldoConta}</strong>
                </p>
                <p className='lead text-center mb-4'>
                  Saldo no caixa{' '}
                  <strong className='fw-bold'>R${balance.saldoCaixa}</strong>
                </p>
              </div>
            )}

            {action === 'SeeAll' && (
              <div className='row g-4'>
                <div className='col-12 text-center'>
                  <div className='card border shadow-sm ms-5 me-5'>
                    <div className='card-body bg-light-green-subtle px-5 mx-5'>
                      <h3 className='card-title text-primary mb-3'>
                        Todas as Movimentações no Sistema
                      </h3>
                      {loadingFlows && <p>Carregando movimentações...</p>}
                      {errorFlows && (
                        <p className='text-danger'>Erro: {errorFlows}</p>
                      )}
                      <canvas id="fluxoCaixaChart" width="800" height="400"></canvas>
                      {flows.length > 0 ? (
                        <ul className='list-group list-group-flush'>
                          {flows.map((flow) => (
                            <li key={flow.id} className='list-group-item'>
                              <div className='d-flex flex-column'>
                                <div className='d-flex justify-content-between mb-2'>
                                  <p className='mb-0'>
                                    <strong>Tipo:</strong> {flow.tipo}
                                  </p>
                                  <p className='mb-0'>
                                    <strong>Classificação:</strong>{' '}
                                    {flow.classificacao}
                                  </p>
                                </div>

                                <div className='d-flex justify-content-between mb-2'>
                                  <p className='mb-0'>
                                    <strong>Valor:</strong> R${flow.valor}
                                  </p>
                                  <p className='mb-0'>
                                    <strong>Forma de Pagamento:</strong>{' '}
                                    {flow.formaPagamento}
                                  </p>
                                </div>

                                <div className='d-flex justify-content-between mb-3'>
                                  <p className='mb-0'>
                                    <strong>Data:</strong>{' '}
                                    {new Date(
                                      flow.dataMovimentacao
                                    ).toLocaleDateString()}
                                  </p>
                                  <p className='mb-0'>
                                    <strong>Descrição:</strong> {flow.descricao}
                                  </p>
                                </div>
                                <div className='d-flex justify-content-center'>
                                  <button
                                    className='btn btn-secondary btn-sm'
                                    onClick={() => handleEditClick(flow)}
                                  >
                                    &#x270E; Editar
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        !loadingFlows &&
                        !errorFlows && <p>Nenhuma movimentação encontrada.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {action === 'Update' && (
              <div className='row g-4'>
                <div className='col-12 text-center'>
                  <div className='card h-100 border-primary shadow-sm'>
                    <div className='card-body bg-light-green-subtle'>
                      <h3 className='card-title fw-bold mb-3'>
                        Atualizar Movimentação de Caixa
                      </h3>

                      <form onSubmit={handleUpdateFlow}>
                        <div className='mb-3 text-start'>
                          <label htmlFor='tipo' className='form-label'>
                            Tipo
                          </label>
                          <select
                            id='tipo'
                            className='form-select'
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                          >
                            <option value=''>Selecione</option>
                            <option value='Entrada'>Entrada</option>
                            <option value='Saida'>Saída</option>
                          </select>
                        </div>

                        <div className='mb-3 text-start'>
                          <label htmlFor='classificacao' className='form-label'>
                            Classificação
                          </label>
                          <select
                            id='classificacao'
                            className='form-select'
                            value={classificacao}
                            onChange={(e) => setClassificacao(e.target.value)}
                          >
                            <option value=''>Selecione</option>
                          {classificacoesFiltradas.map((item) => (
                            <option key={item.label} value={item.label}>
                              {item.label === 'PrestacaoServico'
                                ? 'Prestação de Serviço'
                                : item.label === 'GastoFixo'
                                ? 'Gasto Fixo'
                                : item.label}
                            </option>
                          ))}
                        </select>
                        </div>

                        <div className='mb-3 text-start'>
                          <label htmlFor='valor' className='form-label'>
                            Valor
                          </label>
                          <input
                            type='number'
                            id='valor'
                            className='form-control'
                            placeholder='Digite o valor'
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                          />
                        </div>

                        <div className='mb-3 text-start'>
                          <label
                            htmlFor='formaPagamento'
                            className='form-label'
                          >
                            Forma de Pagamento
                          </label>
                          <select
                            id='formaPagamento'
                            className='form-select'
                            value={formaPagamento}
                            onChange={(e) => setFormaPagamento(e.target.value)}
                          >
                            <option value=''>Selecione</option>
                            <option value='Pix'>Pix</option>
                            <option value='Dinheiro'>Dinheiro</option>
                            <option value='Cartao'>Cartão</option>
                          </select>
                        </div>

                        <div className='mb-3 text-start'>
                          <label htmlFor='descricao' className='form-label'>
                            Descrição
                          </label>
                          <textarea
                            id='descricao'
                            className='form-control'
                            rows='3'
                            placeholder='Digite uma descrição'
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                          />
                        </div>

                        <button type='submit' className='btn btn-primary'>
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
      </div>
    </>
  );
};

export default FlowCrudPage;
