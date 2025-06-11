import { useState } from 'react'
import './AuthPage.css'

import person from '../../Components/assets/person.png'
import password from '../../Components/assets/password.png'
import email from '../../Components/assets/email.png'
import { Link, useNavigate } from 'react-router-dom'

const AuthPage = () => {

    const navigate = useNavigate()
    const [action, setAction] = useState('Login');
    
    const [nome, setNome] = useState('');
    const [funcao, setFuncao] = useState('');
    const [emailTxt, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleSubmit = async () => {
        const endpoint = action === 'Login' ? '/api/auth/login' : '/api/auth/register';

        const data = {
            name: nome,
            role: funcao,
            email: emailTxt,
            password: senha
        };

        if (action === 'Cadastrar') {
            // Validações para o Cadastro
            if (!nome.trim()) {
                alert('Por favor, digite seu nome.');
                return;
            }
            if (!funcao) {
                alert('Por favor, selecione sua função.');
                return;
            }
            data.nome = nome.trim();
            data.funcao = funcao;
        }

        if (!emailTxt.trim()) {
            alert('Por favor, digite seu e-mail.');
            return;
        }
        if (!senha.trim()) {
            alert('Por favor, digite sua senha.');
            return;
        }


        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Sucesso:', result);
                if (action === 'Cadastrar') {
                    alert('Cadastro realizado com sucesso! Agora você pode fazer login.');
                    setNome('');
                    setFuncao('');
                    setEmail('');
                    setSenha('');
                    setAction('Login');
                } else {
                    alert('Login realizado com sucesso!');
                    localStorage.setItem('userName', result.user.name);
                    localStorage.setItem('userRole', result.user.role);
                    sessionStorage.setItem('accessToken', result.accessToken);
                    navigate('/dashboard');
                }
            } else {
                if (response.status >= 400 && response.status < 500) {
                    alert(`Erro: ${result.message || 'Verifique os dados informados.'}`);
                } else {
                    console.error('Erro no servidor:', result.message);
                    alert('Erro no servidor. Tente novamente mais tarde.');
                }
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro na requisição. Verifique sua conexão com o servidor.');
        }
    }

    const handleSwitch = (mode) => {
        setAction(mode);
        setNome('');
        setFuncao('');
        setEmail('');
        setSenha('');
    };

    return (
        <div className='container d-flex flex-column bg-light justify-content-center align-items-center rounded'>
            <div className="header d-flex flex-column justify-content-center align-items-center w-auto my-3">
                <div className="text fs-1 fw-bold text-success">{action}</div>
                <div className="underline w-100 bg-success rounded"></div>
            </div>
            <div className="inputs d-flex flex-column my-3 gap-3 rounded">
                {action === "Login" ? <div></div> :
                    <>
                        <div className="input d-flex align-items-center m-auto rounded">
                            <img src={person} alt="Ícone de pessoa" />
                            <input type="text" placeholder='Nome' value={nome} onChange={e => setNome(e.target.value)} />
                        </div>

                        <div className="input d-flex align-items-center m-auto rounded w-100 px-2" style={{ height: '50px' }}>
                            <img src={person} alt="Ícone de pessoa" style={{ width: '24px', marginRight: '10px' }} />
                            <select
                                className='form-select border-0 bg-transparent p-0'
                                value={funcao}
                                onChange={e => setFuncao(e.target.value)}
                                style={{ fontSize: '19px', color: '#797979', width: '100%' }}
                            >
                                <option value="" disabled>Função</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                        </div>

                    </>
                }

                <div className="input d-flex align-items-center m-auto rounded">
                    <img src={email} alt="Ícone de e-mail" />
                    <input type="email" placeholder='Email' value={emailTxt} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="input d-flex align-items-center m-auto rounded">
                    <img src={password} alt="Ícone de senha" />
                    <input type="password" placeholder='Senha' value={senha} onChange={e => setSenha(e.target.value)} />
                </div>
            </div>
            {action === "Cadastrar" ? <div></div> : <div className="forgot-password py-1 fs-6 text-secondary">Esqueceu sua senha? <Link to={"/forgot-password"}><span>Clique aqui</span></Link></div>}
            <div className="submit-container d-flex gap-3 mx-2 my-5">
                <div className={action === "Cadastrar" ? "submit" : "submit gray"} onClick={() => action === "Cadastrar" ? handleSubmit() : handleSwitch("Cadastrar")}> Cadastrar </div>
                <div className={action === "Login" ? "submit" : "submit gray"} onClick={() => action === "Login" ? handleSubmit() : handleSwitch("Login")}> Login</div>
            </div>
        </div>
    )
}

export default AuthPage;