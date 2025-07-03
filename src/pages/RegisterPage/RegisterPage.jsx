import { useState } from 'react';
import './RegisterPage.css';
import person from '../../Components/assets/person.png';
import password from '../../Components/assets/password.png';
import email from '../../Components/assets/email.png';
import { Link, useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState(localStorage.getItem('firstUser') ? 'admin' : '');
  const [emailTxt, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const firstAccess = localStorage.getItem('firstUser')

  if (firstAccess) {
    if (funcao !== 'admin') setFuncao('admin');
  }

  const handleRegister = async () => {
    if (!nome.trim() || !funcao || !emailTxt.trim() || !senha.trim()) {
      alert('Preencha todos os campos.');
      return;
    }

    try {
      let token = localStorage.getItem('accessToken');
      if (!token) {
        token = localStorage.getItem('firstUser')
      }
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: nome,
          role: funcao,
          email: emailTxt,
          password: senha,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Cadastro realizado com sucesso!');
        localStorage.removeItem('firstUser');
        navigate('/dashboard');
      } else {
        alert(result.message || 'Erro no cadastro.');
      }
    } catch (error) {
      alert('Erro na requisição.', error);
    }
  };

  return (
    <div className='corpo'>
      <div className='container d-flex flex-column bg-light justify-content-center align-items-center rounded'>
        <div className='header d-flex flex-column justify-content-center align-items-center w-auto my-3'>
          <div className='text fs-1 fw-bold text-primary'>Cadastro</div>
          <div className='underline w-100 bg-primary rounded'></div>
        </div>

        <div className='inputs d-flex flex-column my-3 gap-3 rounded'>
          <div className='input d-flex align-items-center m-auto rounded'>
            <img src={person} alt='Nome' />
            <input
              type='text'
              placeholder='Nome'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div
            className='input d-flex align-items-center m-auto rounded w-100 px-2'
            style={{ height: '50px' }}
          >
            <img
              src={person}
              alt='Função'
              style={{ width: '24px', marginRight: '10px' }}
            />
            <select
              className='form-select border-0 bg-transparent p-0'
              value={funcao}
              onChange={(e) => setFuncao(e.target.value)}
              disabled={!!firstAccess} // <-- desativa se for primeiro acesso
              style={{ fontSize: '19px', color: '#797979', width: '100%' }}
            >
              <option value='' disabled>
                Função
              </option>
              <option value='admin'>Admin</option>
              <option value='user'>User</option>
            </select>
          </div>

          <div className='input d-flex align-items-center m-auto rounded'>
            <img src={email} alt='Email' />
            <input
              type='email'
              placeholder='Email'
              value={emailTxt}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='input d-flex align-items-center m-auto rounded'>
            <img src={password} alt='Senha' />
            <input
              type='password'
              placeholder='Senha'
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
        </div>

        <div className='submit-container d-flex gap-3 mx-2 my-5'>
          <div className='submit' onClick={handleRegister}>
            Cadastrar
          </div>
          <div className='submit'>
            <Link className='btn-flowPage' to='/dashboard'>
              Voltar ao menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
