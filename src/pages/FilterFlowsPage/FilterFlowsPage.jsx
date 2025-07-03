import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import flowIn from '../../Components/assets/flowIn.png';
import flowOut from '../../Components/assets/flowOut.png';

const apiUrl = import.meta.env.VITE_API_URL;

const FilterFlowsPage = () => {
  const navigate = useNavigate();

  const [balance, setBalance] = useState('');
  const [filter, setFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [params, setParams] = useState('');
  const [flows, setFlows] = useState([]);
  const [caixaFixed, setCaixaFixed] = useState('');
  const [contaFixed, setContaFixed] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const flowsPerPage = 5;

  const indexOfLastFlow = currentPage * flowsPerPage;
  const indexOfFirstFlow = indexOfLastFlow - flowsPerPage;
  const currentFlows = flows.slice(indexOfFirstFlow, indexOfLastFlow);

  const totalPages = Math.ceil(flows.length / flowsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFetchUsers = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar usuários');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      if (
        error.message.includes('Unauthorized') ||
        error.message.includes('Forbidden')
      ) {
        alert(
          'Sua sessão expirou ou não está autorizada. Por favor, faça login novamente.'
        );
      }
    }
  }, [navigate]);

  const fetchBalance = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const balanceAPI = await fetch(`${apiUrl}/api/balance`, {
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

  const fetchFlows = useCallback(async () => {
    if (!params || !filter) return;
    try {
      const accessToken = localStorage.getItem('accessToken');
      let endpoint = '';

      if (filter === 'Data') {
        console.log(params);
        endpoint = `${apiUrl}/api/flows/data/${params}`;
      } else if (filter === 'Usuario') {
        endpoint = `${apiUrl}/api/flows/user/${params}`;
      } else {
        return;
      }

      const response = await fetch(endpoint, {
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
    if (balance?.saldoCaixa != null && balance?.saldoConta != null) {
      setCaixaFixed(
        String(parseFloat(balance.saldoCaixa).toFixed(2)).replace('.', ',')
      );
      setContaFixed(
        String(parseFloat(balance.saldoConta).toFixed(2)).replace('.', ',')
      );
    }
  }, [balance]);

  useEffect(() => {
    fetchFlows();
  }, [params, filter, fetchFlows]);

  const role = localStorage.getItem('userRole');

  return (
    <>
      <div className='d-flex flex-column min-vh-100 min-vw-75 bg-light'>
        <header className='navbar navbar-expand-lg navbar-dark shadow-sm p-3'>
          <div className='container-fluid d-flex flex-column flex-md-row justify-content-center align-items-center justify-content-md-around align-items-center'>
            <button className='btn btn-primary btn-lg border'>
              <a className='btn-flowPage' href='/allFlows'>
                Ver Todas
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
                  <strong className='fw-bold'>R${contaFixed}</strong>
                </p>
                <p className='lead text-center mb-4'>
                  Saldo no caixa{' '}
                  <strong className='fw-bold'>R${caixaFixed}</strong>
                </p>
              </div>
            )}

            <div className='row g-4'>
              <div className='d-flex flex-column justify-content-center align-items-center col-12 text-center'>
                <div className='card border shadow-sm'>
                  <div className='card-body bg-light-green-subtle px-5 mx-5'>
                    <h3 className='card-title text-primary mb-4 text-center'>
                      Filtrar Movimentações
                    </h3>

                    <div className='mb-4'>
                      <label className='form-label fw-bold'>
                        Escolha o filtro:
                      </label>
                      <select
                        value={filter}
                        onChange={(e) => {
                          setFilter(e.target.value);
                          setParams('');
                          setFlows([]);
                        }}
                        className='form-select'
                      >
                        <option value='' disabled>
                          Selecione o filtro
                        </option>
                        <option value='Data'>Data</option>
                        {role === 'admin' && (
                          <option value='Usuario'>Usuário</option>
                        )}
                      </select>
                    </div>

                    {filter === 'Data' && (
                      <div className='mb-4'>
                        <label className='form-label fw-bold'>
                          Selecione a data:
                        </label>
                        <input
                          type='date'
                          className='form-control'
                          value={params}
                          onChange={(e) => setParams(e.target.value)}
                        />
                      </div>
                    )}

                    {filter === 'Usuario' && users.length > 0 && (
                      <div className='mb-4'>
                        <label className='form-label fw-bold'>
                          Selecione o usuário:
                        </label>
                        <select
                          className='form-select'
                          value={params}
                          onChange={(e) => setParams(e.target.value)}
                        >
                          <option value='' disabled>
                            Selecione um usuário
                          </option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {flows.length > 0 && (
                  <>
                    <div className='container d-flex justify-content-center mt-3'>
                      <div
                        className='card w-100 shadow p-4'
                        style={{ maxWidth: '900px' }}
                      >
                        {currentFlows.map((flow) => (
                          <div
                            key={flow.id}
                            className='card mb-3 shadow border-none'
                          >
                            <div className='card-body d-flex'>
                              <img
                                className={`me-3 ${
                                  flow.tipo === 'Entrada'
                                    ? 'bg-success'
                                    : 'bg-danger'
                                } flowImage`}
                                src={flow.tipo === 'Entrada' ? flowIn : flowOut}
                                alt=''
                              />
                              <div className='flex-grow-1'>
                                <div className='d-flex justify-content-between mb-2'>
                                  <p className='mb-0'>
                                    <strong>Tipo:</strong>{' '}
                                    <span
                                      className={`${
                                        flow.tipo === 'Entrada'
                                          ? 'text-success'
                                          : 'text-danger'
                                      } fw-bold`}
                                    >
                                      {flow.tipo}
                                    </span>
                                  </p>
                                  <p className='mb-0'>
                                    <strong>Data:</strong>{' '}
                                    {new Date(
                                      flow.dataMovimentacao
                                    ).toLocaleDateString()}
                                  </p>
                                </div>

                                <div className='d-flex justify-content-between mb-2'>
                                  <p className='mb-0'>
                                    <strong>Valor:</strong>{' '}
                                    <span
                                      className={`${
                                        flow.tipo === 'Entrada'
                                          ? 'text-success'
                                          : 'text-danger'
                                      } fw-bold`}
                                    >
                                      R$
                                      {String(
                                        parseFloat(flow.valor)
                                          .toFixed(2)
                                          .replace('.', ',')
                                      )}
                                    </span>
                                  </p>
                                </div>

                                <div className='d-flex justify-content-between mb-3'>
                                  <p className='mb-0'>
                                    <strong>Forma de Pagamento:</strong>{' '}
                                    {flow.formaPagamento}
                                  </p>
                                </div>

                                {flow.alterado && (
                                  <div className='d-flex justify-content-between mb-3'>
                                    <p className='mb-0'>
                                      <strong>Movimentação Alterada:</strong>{' '}
                                      {flow.alterado}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        <nav className='mt-3'>
                          <ul className='pagination justify-content-center mb-0'>
                            {Array.from({ length: totalPages }, (_, index) => (
                              <li
                                key={index}
                                className={`page-item ${
                                  currentPage === index + 1 ? 'active' : ''
                                }`}
                              >
                                <button
                                  className='page-link'
                                  onClick={() => handlePageChange(index + 1)}
                                >
                                  {index + 1}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </nav>
                      </div>
                    </div>
                  </>
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
