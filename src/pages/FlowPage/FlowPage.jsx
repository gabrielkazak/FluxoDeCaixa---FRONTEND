import React, { useCallback } from 'react';
import './FlowPage.css';
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const FlowPage = () => {
  const navigate = useNavigate();

  const [id, setId] = useState('');
  const [tipo, setTipo] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [valor, setValor] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [descricao, setDescricao] = useState('');
  const [balance, setBalance] = useState('');

  const fetchBalance = async () => {
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
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    const storedID = localStorage.getItem('id');
    if (storedID) {
      setId(storedID);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleCreateFlow = useCallback(
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
        const response = await fetch('/api/flows', {
          method: 'POST',
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
        console.log('Movimentação criada com sucesso:', data);
        alert('Movimentação criada com sucesso!');
        setTipo('');
        setClassificacao('');
        setValor('');
        setFormaPagamento('');
        setDescricao('');
        await fetchBalance();
      } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro na requisição. Verifique sua conexão com o servidor.');
      }
    },
    [id, tipo, classificacao, valor, formaPagamento, descricao]
  );

  return (
    <>
      <div className='d-flex flex-column min-vh-100 bg-light'>
        <header className='navbar navbar-expand-lg navbar-dark shadow-sm p-3'>
          <div className='container-fluid d-flex flex-column flex-md-row justify-content-center align-items-center justify-content-md-around align-items-center'>
            <button className='btn btn-primary btn-lg border'>
              <a className='btn-flowPage' href='/allFlows'>
                Ver Movimentações
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
              <>
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
              </>
            )}

            <div className='row g-4'>
              <div className='col-12 text-center'>
                <div className='card h-100 border-primary shadow-sm'>
                  <div className='card-body bg-light-green-subtle'>
                    <h3 className='card-title text-primary mb-3'>
                      Criar Movimentação de Caixa
                    </h3>

                    <form onSubmit={handleCreateFlow}>
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
                          <option value='Venda'>Venda</option>
                          <option value='Compra'>Compra</option>
                          <option value='Investimento'>Investimento</option>
                          <option value='PrestacaoServico'>
                            Prestação de Serviço
                          </option>
                          <option value='GastoFixo'>Gasto Fixo</option>
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
                        <label htmlFor='formaPagamento' className='form-label'>
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
                        ></textarea>
                      </div>

                      <button type='submit' className='btn btn-primary'>
                        Salvar Movimentação
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default FlowPage;
