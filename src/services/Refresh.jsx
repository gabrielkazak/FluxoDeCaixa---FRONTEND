import { useEffect } from 'react';

const useTokenRefresher = () => {
    useEffect(() => {
        const refreshToken = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) return;

                const response = await fetch('/api/auth/refresh', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('accessToken', data.accessToken);
                } else {
                    console.warn('Falha ao atualizar token');
                }
            } catch (error) {
                console.error('Erro ao tentar refresh do token:', error);
            }
        };

        refreshToken();
        const interval = setInterval(refreshToken, 900000);

        return () => clearInterval(interval);
    }, []);
};

export default useTokenRefresher;
