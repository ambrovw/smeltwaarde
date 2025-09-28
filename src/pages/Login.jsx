import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

export default function Login({ setIsLoggedIn }) {
    const navigate = useNavigate();

    const handleLoginSuccess = async (credentialResponse) => {
        try {
            const res = await fetch('https://kajuit.smeltwaarde.co.za/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential })
            });

            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify({
                    name: data.name,
                    email: data.email,
                    role: data.role || 'user',
                    token: credentialResponse.credential
                }));

                setIsLoggedIn(true);
                navigate('/userDetails');
            } else {
                alert('Aanmelding het misluk: ' + data.error);
            }
        } catch (err) {
            alert('Netwerkfout: kon nie verbind nie');
        }
    };

    return (
        <div>
            <h2>Aanmelding</h2>
            <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => alert('Google-aanmelding het misluk')}
                ux_mode="popup"
            />
        </div>
    );
}