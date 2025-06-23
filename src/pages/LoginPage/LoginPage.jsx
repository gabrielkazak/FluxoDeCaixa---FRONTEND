import { useState } from 'react'
import './LoginPage.css'
import password from '../../Components/assets/password.png'
import email from '../../Components/assets/email.png'
import { Link, useNavigate } from 'react-router-dom'

const LoginPage = () => {
    const navigate = useNavigate();
    const [emailTxt, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleLogin = async () => {
        if (!emailTxt.trim() || !senha.trim()) {
            alert('Preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailTxt, password: senha })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Login realizado com sucesso!');
                localStorage.setItem('id', result.user.id);
                localStorage.setItem('userName', result.user.name);
                localStorage.setItem('userRole', result.user.role);
                localStorage.setItem('accessToken', result.accessToken);
                navigate('/dashboard');
            } else {
                alert(result.message || 'Erro no login.');
            }
        } catch (error) {
            alert('Erro na requisição.', error);
        }
    };

    return (
        <div className='corpo'>
            <div className='container d-flex flex-column bg-light justify-content-center align-items-center rounded'>
                <div className="header d-flex flex-column justify-content-center align-items-center w-auto my-3">
                    <div className="text fs-1 fw-bold text-primary">Login</div>
                    <div className="underline w-100 bg-primary rounded"></div>
                </div>

                <div className="inputs d-flex flex-column my-3 gap-3 rounded">
                    <div className="input d-flex align-items-center m-auto rounded">
                        <img src={email} alt="Email" />
                        <input type="email" placeholder='Email' value={emailTxt} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="input d-flex align-items-center m-auto rounded">
                        <img src={password} alt="Senha" />
                        <input type="password" placeholder='Senha' value={senha} onChange={e => setSenha(e.target.value)} />
                    </div>
                </div>

                <div className="forgot-password py-1 fs-6 text-secondary">
                    Esqueceu sua senha? <Link to={"/forgot-password"}>Clique aqui</Link>
                </div>

                <div className="submit-container d-flex gap-3 mx-2 my-5">
                    <div className="submit" onClick={handleLogin}>Login</div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
