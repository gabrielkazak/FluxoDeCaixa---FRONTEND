// pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../Components/assets/logo.png';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);
  const [flows, setFlows] = useState([]);
  const [loadingFlows, setLoadingFlows] = useState(false);
  const [errorFlows, setErrorFlows] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');
    const storedAccessToken = localStorage.getItem('accessToken');

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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('id');

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
        console.error(
          'Erro ao fazer logout no backend:',
          errorData.message || 'Erro desconhecido'
        );
        alert(
          `Não foi possível deslogar completamente: ${
            errorData.message || 'Verifique sua conexão.'
          }`
        );
      }
    } catch (error) {
      console.error('Erro na requisição de logout:', error);
      alert('Erro de conexão ao tentar deslogar. Por favor, tente novamente.');
    } finally {
      navigate('/login');
    }
  }, [navigate]);

  const handleFetchUsers = useCallback(async () => {
    if (userRole != 'admin') return;
    setLoadingUsers(true);
    setErrorUsers(null);
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
      setErrorUsers(error.message);
      if (
        error.message.includes('Unauthorized') ||
        error.message.includes('Forbidden')
      ) {
        alert(
          'Sua sessão expirou ou não está autorizada. Por favor, faça login novamente.'
        );
        handleLogout();
      }
    } finally {
      setLoadingUsers(false);
    }
  }, [navigate, handleLogout, userRole]);

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
      const dataParsed = data.slice(0, 5);
      setFlows(dataParsed);
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
        handleLogout();
      }
    } finally {
      setLoadingFlows(false);
    }
  }, [navigate, handleLogout]);

  const handleDeleteUser = useCallback(
    async (id) => {
      if (!window.confirm('Tem certeza que deseja excluir este usuário?'))
        return;

      const accessToken = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          alert('Usuário deletado com sucesso.');
          handleFetchUsers();
        } else {
          const errorData = await response.json();
          alert(`Erro: ${errorData.message || 'Erro ao deletar usuário.'}`);
        }
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        alert('Erro ao deletar usuário');
      }
    },
    [handleFetchUsers]
  );

  const handleEdit = (user) => {
    localStorage.setItem('editUser', JSON.stringify(user));
    navigate('/updateUser');
  };

  useEffect(() => {
    if (userRole === 'admin') {
      handleFetchUsers();
    }
  }, [userRole, handleFetchUsers]);

  useEffect(() => {
    handleFetchFlows();
  }, [handleFetchFlows]);

  const loggedUserId = Number(localStorage.getItem('id'));
  const role = localStorage.getItem('userRole')

  return (
    <div className='min-vw-75 d-flex flex-column bg-light'>
      <header className='navbar navbar-expand-lg navbar-dark shadow-sm p-3'>
        <div className='container-fluid d-flex flex-column flex-md-row justify-content-center align-items-center justify-content-md-around align-items-center'>
          <img className='logo' src={logo} alt='' />
          <button className='btn btn-primary btn-lg border'>
            <Link className='btn-flowPage' to='/flowPage'>
              Fazer Movimentação
            </Link>
          </button>
          {role === 'admin' && <button className='btn btn-primary btn-lg border'>
            <Link className='btn-flowPage' to='/register'>
              Criar Usuário
            </Link>
          </button>}
          <button className='btn btn-danger btn-lg my-3' onClick={handleLogout}>
            Deslogar
          </button>
        </div>
      </header>

      <main className='flex-grow-1 p-3 p-md-4'>
        <div className='container-fluid py-4 bg-white rounded shadow-sm'>
          <h2 className='text-center fw-bold mb-4 display-6 text-primary'>
            Bem-vindo(a) ao seu Dashboard {userName}!
          </h2>
          <p className='lead text-center mb-4'>
            Aqui você pode ver informações importantes e acessar as
            funcionalidades do sistema.
            {userRole && <br />}
          </p>

          <div className='row g-4'>
            <div className='col-12 col-md-6 col-lg-5'>
              <div className='card h-100 border-primary shadow-sm'>
                <div className='card-body bg-light-green-subtle'>
                  <h3 className='card-title text-primary mb-3'>Visão Geral</h3>
                  <p className='card-text'>
                    Você está logado como {userRole || 'usuário padrão'}.
                  </p>
                  <h3 className='card-title text-primary mb-3'>
                    Ultimas 5 Movimentações
                  </h3>
                  {flows &&
                    (flows.length > 0 ? (
                      <ul className='list-group list-group-flush'>
                        {flows.map((flow) => (
                          <li key={flow.id} className='list-group-item'>
                            <strong>{flow.tipo}</strong> - {flow.classificacao}{' '}
                            R${String(parseFloat(flow.valor).toFixed(2).replace('.', ','))}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      !loadingFlows &&
                      !errorFlows && (
                        <p className='text-center'>
                          Nenhuma movimentação encontrada.
                        </p>
                      )
                    ))}
                </div>
                <div></div>
              </div>
            </div>

            <div className='col-12 col-md-6 col-lg-7'>
              <div className='card h-100 border-primary shadow-sm'>
                <div className='card-body bg-light-blue-subtle'>
                  <h3 className='card-title text-primary mb-3'>
                    Usuarios cadastrados
                  </h3>
                  {loadingUsers && (
                    <p className='text-center'>Carregando usuários...</p>
                  )}
                  {errorUsers && (
                    <p className='text-danger text-center'>
                      Erro: {errorUsers}
                    </p>
                  )}

                  {userRole === 'admin' &&
                    (users.length > 0 ? (
                      <ul className='list-group list-group-flush'>
                        {users.map((user) => (
                          <li
                            key={user.id}
                            className='list-group-item d-flex justify-content-between align-items-center'
                          >
                            <div>
                              <strong>{user.name}</strong> - {user.email} (
                              {user.role})
                            </div>
                            <div className='d-flex gap-2'>
                              <button
                                className='btn btn-secondary btn-sm'
                                onClick={() => handleEdit(user)}
                              >
                                ✏️ Editar
                              </button>
                              {user.id !== loggedUserId && (
                                <button
                                  className='btn btn-danger btn-sm'
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  🗑 Excluir
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      !loadingUsers &&
                      !errorUsers && (
                        <p className='text-center'>
                          Nenhum usuário cadastrado encontrado.
                        </p>
                      )
                    ))}

                  {userRole === 'user' && (
                    <ul className='list-group list-group-flush'>
                      <li className='list-group-item text-center text-muted'>
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
    </div>
  );
};

export default HomePage;
