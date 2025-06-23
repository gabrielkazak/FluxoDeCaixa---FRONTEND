import { useState, useEffect } from 'react';
import './UpdateUserPage.css';
import person from '../../Components/assets/person.png';
import password from '../../Components/assets/password.png';
import email from '../../Components/assets/email.png';
import { Link, useNavigate } from 'react-router-dom';

const UpdateUserPage = () => {
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [funcao, setFuncao] = useState('');
    const [emailTxt, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('editUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserId(user.id);
            setNome(user.name);
            setFuncao(user.role);
            setEmail(user.email);
        } else {
            alert("Nenhum usuário selecionado para edição.");
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleUpdate = async () => {
        if (!nome.trim() || !funcao || !emailTxt.trim()) {
            alert('Preencha todos os campos (senha pode ser opcional).');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const updateData = {
                name: nome,
                role: funcao,
                email: emailTxt,
            };

            if (senha.trim()) {
                updateData.password = senha;
            }

            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Usuário atualizado com sucesso!');
                localStorage.removeItem('editUser')
                navigate('/dashboard');
            } else {
                alert(result.message || 'Erro ao atualizar.');
                localStorage.removeItem('editUser')
            }
        } catch (error) {
            alert('Erro na requisição.', error);
        }
    };

    const handleExit = () => {
        localStorage.removeItem('editUser')
    }

    return (
        <div className='corpo'>
            <div className='container d-flex flex-column bg-light justify-content-center align-items-center rounded'>
                <div className="header d-flex flex-column justify-content-center align-items-center w-auto my-3">
                    <div className="text fs-1 fw-bold text-primary">Atualizar Cadastro</div>
                    <div className="underline w-100 bg-primary rounded"></div>
                </div>

                <div className="inputs d-flex flex-column my-3 gap-3 rounded">
                    <div className="input d-flex align-items-center m-auto rounded">
                        <img src={person} alt="Nome" />
                        <input type="text" placeholder='Nome' value={nome} onChange={e => setNome(e.target.value)} />
                    </div>

                    <div className="input d-flex align-items-center m-auto rounded w-100 px-2" style={{ height: '50px' }}>
                        <img src={person} alt="Função" style={{ width: '24px', marginRight: '10px' }} />
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

                    <div className="input d-flex align-items-center m-auto rounded">
                        <img src={email} alt="Email" />
                        <input type="email" placeholder='Email' value={emailTxt} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div className="input d-flex align-items-center m-auto rounded">
                        <img src={password} alt="Senha" />
                        <input type="password" placeholder='Nova Senha (opcional)' value={senha} onChange={e => setSenha(e.target.value)} />
                    </div>
                </div>

                <div className="submit-container d-flex gap-3 mx-2 my-5">
                    <div className="submit" onClick={handleUpdate}>Atualizar</div>
                    <div className="submit"><Link className='btn-flowPage' to='/dashboard' onClick={handleExit}>Voltar ao menu</Link></div>
                </div>
            </div>
        </div>
    );
};

export default UpdateUserPage;
