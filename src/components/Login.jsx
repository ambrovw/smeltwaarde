import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import '../styles/components/Login.css';

export default function Login({ setIsLoggedIn, setUser }) {
    const navigate = useNavigate();

    const handleLoginSuccess = async (credentialResponse) => {
        try {
            const token = credentialResponse.credential;
            localStorage.setItem('token', token);

            const res = await fetch('https://kajuit.smeltwaarde.co.za/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await res.json();
            if (data.success) {
                setUser(data);
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
        <div className="scroll-wrapper">
            <div className="container login-container">
                <h2>Aanmelding</h2>
                <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => alert('Google-aanmelding het misluk')}
                    ux_mode="popup"
                    class="login-button"
                />
            </div>
        </div>
    );
}