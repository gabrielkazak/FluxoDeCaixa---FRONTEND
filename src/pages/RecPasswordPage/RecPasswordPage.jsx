import React, { useEffect, useState } from 'react';
import './RecPasswordPage.css';
import emailIcon from '../../Components/assets/email.png';
import passwordIcon from '../../Components/assets/password.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const RecPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const [action, setAction] = useState('sendEmail');

    const [emailTxt, setEmailTxt] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    useEffect(() => {
        if (token) {
            setAction('changePassword');
            setFeedbackMessage('Por favor, digite sua nova senha.');

            setEmailTxt('');
        } else {
            setAction('sendEmail');
            setFeedbackMessage('');
    
            setNewPassword('');
            setConfirmNewPassword('');
        }
    }, [token, location.search]);

    const handleSubmitSendEmail = async () => {
        if (!emailTxt.trim()) {
            setFeedbackMessage('Por favor, digite seu e-mail.');
            return;
        }
        setFeedbackMessage('Enviando e-mail...');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailTxt })
            });

            const result = await response.json();
            if (response.ok) {
                setAction('emailSent');
                setEmailTxt(''); 
                setFeedbackMessage('Email enviado');
            } else {
                setFeedbackMessage(result.message || 'Erro ao enviar o e-mail de redefinição.');
            }
        } catch (error) {
            console.error('Erro ao enviar o e-mail de redefinição:', error);
            setFeedbackMessage('Erro ao enviar o e-mail de redefinição. Verifique sua conexão ou tente novamente mais tarde.');
        }
    };

    const handleSubmitChangePassword = async () => {
        if (!newPassword.trim() || !confirmNewPassword.trim()) {
            setFeedbackMessage('Por favor, preencha a nova senha e a confirmação.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setFeedbackMessage('As senhas não coincidem.');
            return;
        }
        if (newPassword.length < 8) {
            setFeedbackMessage('A senha deve ter no mínimo 8 dígitos.');
            return;
        }
        if (!token) {
            setFeedbackMessage('Token de redefinição não encontrado na URL.');
            return;
        }
        setFeedbackMessage('Redefinindo senha...');

        try {
            const response = await fetch(`/api/auth/reset-password?token=${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPassword: newPassword }),
            });

            const result = await response.json();

            if (response.ok) {
                alert('Senha redefinida com sucesso! Você pode fazer login agora.');
                navigate('/login');
            } else {
                setFeedbackMessage(result.message || 'Erro ao redefinir senha. O token pode ser inválido ou expirado.');
            }
        } catch (error) {
            console.error('Erro na requisição de redefinição:', error);
            setFeedbackMessage('Erro na conexão. Tente novamente.');
        }
    };

    return (
        <div className='container rec-pass d-flex flex-column bg-light justify-content-center align-items-center rounded text-center'>
            <div className='header d-flex flex-column justify-content-center align-items-center w-auto my-3'>
                <div className='text fs-3 fw-bold'>Recuperação de Senha</div>
                <div className='underline w-100 bg-success rounded'></div>
            </div>

            {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}

            {action === 'sendEmail' && (
                <>
                    <div className='action-text fs-5'>
                        Digite seu e-mail para receber um link de redefinição de senha.
                    </div>
                    <div className='inputs d-flex flex-column my-3 rounded w-75'>
                        <div className='input d-flex align-items-center m-auto rounded w-100 px-2'>
                            <img src={emailIcon} alt='Ícone de e-mail' style={{ width: '24px', marginRight: '10px' }}/>
                            <input
                                className='form-control w-100'
                                type='email'
                                placeholder='Email'
                                value={emailTxt}
                                onChange={(e) => setEmailTxt(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className='submit-container'>
                        <div className='submit' onClick={handleSubmitSendEmail}>
                            Enviar Email de Redefinição
                        </div>
                    </div>
                </>
            )}

            {action === 'emailSent' && (
                <>
                    <div className='action-text fs-5'>
                        Um e-mail foi enviado para você com instruções para redefinir sua senha.
                        Caso não apareça na sua caixa de entrada, verifique a pasta de spam.
                        <br /><br />
                        Se você não receber o e-mail dentro de 15 minutos,
                        <span onClick={() => {
                            setAction('sendEmail');
                            setFeedbackMessage('');
                        }} className="try-again-link text-success"> clique aqui</span> para tentar novamente.
                    </div>
                </>
            )}

            {action === 'changePassword' && (
                // --- UI para MUDAR A SENHA (com token) ---
                <>
                    <div className='inputs gap-3 d-flex flex-column my-3 rounded w-75'>
                        <div className='input d-flex align-items-center m-auto rounded w-100 px-2'>
                            <img src={passwordIcon} alt='Ícone de nova senha' />
                            <input
                                className='confirm-password form-control w-100'
                                type='password'
                                placeholder='Nova Senha'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className='input d-flex align-items-center m-auto rounded w-100 px-2'>
                            <img src={passwordIcon} alt='Ícone de confirmação de senha' />
                            <input 
                                className='confirm-password form-control w-100'
                                type='password'
                                placeholder='Confirme a Senha'
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className='submit-container d-flex '>
                        <div className='submit w-100' onClick={handleSubmitChangePassword}>
                            Redefinir Senha
                        </div>
                    </div>
                </>
            )}

            <div className='forgot-password fs-6 my-3 text-secondary'>
                Retornar ao Login?<Link to={'/login'}> <span>Clique aqui</span></Link>
            </div>
        </div>
    );
};

export default RecPasswordPage;