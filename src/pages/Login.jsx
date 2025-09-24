import { GoogleLogin } from '@react-oauth/google';

export default function Login({ setIsLoggedIn }) {
    const handleLoginSuccess = async (credentialResponse) => {
        const res = await fetch('https://kajuit.smeltwaarde.co.za/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: credentialResponse.credential })
        });

        const data = await res.json();
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data));
            setIsLoggedIn(true);
        } else {
            alert('Kon nie aanmeld nie');
        }
    };

    return (
        <div className="login-page">
            <h2>Google Aanmelding</h2>
            <p>Meld aan om jou voorkeure te stoor en toegang tot meer funksies te kry.</p>
            <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => alert('Aanmelding het misluk')}
                useOneTap
            />
            <button onClick={() => localStorage.removeItem('user')}>Teken uit</button>
        </div>
    );
}