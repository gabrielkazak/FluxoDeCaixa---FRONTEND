import React, { useCallback } from 'react'
import './FlowPage.css'
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const FlowPage = () => {

    const navigate = useNavigate()
   
    const [id, setId] = useState('')
    const [tipo, setTipo] = useState('');
    const [classificacao, setClassificacao] = useState('');
    const [valor, setValor] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('');
    const [descricao, setDescricao] = useState('');

    useEffect(() => {
        const storedID = localStorage.getItem('id')
        if (storedID) {
            setId(storedID)
        } else {
            navigate('/login')
        }
    }, [navigate])

    const handleCreateFlow = useCallback(async (e) => {
        e.preventDefault();

        const accessToken = sessionStorage.getItem('accessToken');

        const flowData = {
            idUsuario: Number(id),
            tipo,
            classificacao,
            valor: parseFloat(valor),
            formaPagamento,
            dataMovimentacao: new Date().toISOString(),
            descricao
        }

        try {
            const response = await fetch('/api/flows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(flowData)
            })

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

        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro na requisição. Verifique sua conexão com o servidor.');
        }
    }, [id, tipo, classificacao, valor, formaPagamento, descricao])

  return (
     <>
            <div className="d-flex flex-column min-vh-100 bg-light">
                <header className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm p-3">
                    <div className="container-fluid">
                        <h1 className="navbar-brand mb-0 h1 fs-2">Meu Dashboard</h1>
                        <button className="btn btn-success btn-lg border">
                            <a className="btn-flowPage" href="/dashboard">Movimentações</a>
                        </button>
                        <button className="btn btn-danger btn-lg">
                            Deslogar
                        </button>
                    </div>
                </header>

                <main className="flex-grow-1 p-3 p-md-4">
                    <div className="container-fluid py-4 bg-white rounded shadow-sm">
                        <h2 className="text-center text-success mb-4 display-6">Bem-vindo(a) a aba de movimentação</h2>
                        <p className="lead text-center mb-4">
                            Aqui você pode gerar Movimentações de Caixa
                        </p>

                        <div className="row g-4">
                            <div className="col-12 text-center">
                                <div className="card h-100 border-success shadow-sm">
                                    <div className="card-body bg-light-green-subtle">
                                        <h3 className="card-title text-success mb-3">Criar Movimentação de Caixa</h3>

                                        <form onSubmit={handleCreateFlow}>
                                            <div className="mb-3 text-start">
                                                <label htmlFor="tipo" className="form-label">Tipo</label>
                                                <select id="tipo" className="form-select" value={tipo} onChange={e => setTipo(e.target.value)}>
                                                    <option value="">Selecione</option>
                                                    <option value="Entrada">Entrada</option>
                                                    <option value="Saida">Saída</option>
                                                </select>
                                            </div>

                                            <div className="mb-3 text-start">
                                                <label htmlFor="classificacao" className="form-label">Classificação</label>
                                                <select id="classificacao" className="form-select" value={classificacao} onChange={e => setClassificacao(e.target.value)}>
                                                    <option value="">Selecione</option>
                                                    <option value="Venda">Venda</option>
                                                    <option value="Compra">Compra</option>
                                                    <option value="Investimento">Investimento</option>
                                                    <option value="PrestacaoServico">Prestação de Serviço</option>
                                                    <option value="GastoFixo">Gasto Fixo</option>
                                                </select>
                                            </div>

                                            <div className="mb-3 text-start">
                                                <label htmlFor="valor" className="form-label">Valor</label>
                                                <input type="number" id="valor" className="form-control" placeholder="Digite o valor"
                                                    value={valor} onChange={e => setValor(e.target.value)} />
                                            </div>

                                            <div className="mb-3 text-start">
                                                <label htmlFor="formaPagamento" className="form-label">Forma de Pagamento</label>
                                                <select id="formaPagamento" className="form-select" value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}>
                                                    <option value="">Selecione</option>
                                                    <option value="Pix">Pix</option>
                                                    <option value="Dinheiro">Dinheiro</option>
                                                    <option value="Cartao">Cartão</option>
                                                </select>
                                            </div>

                                            <div className="mb-3 text-start">
                                                <label htmlFor="descricao" className="form-label">Descrição</label>
                                                <textarea id="descricao" className="form-control" rows="3" placeholder="Digite uma descrição"
                                                    value={descricao} onChange={e => setDescricao(e.target.value)}></textarea>
                                            </div>

                                            <button type="submit" className="btn btn-success">Salvar Movimentação</button>
                                        </form>

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
        </>
  )
}

export default FlowPage