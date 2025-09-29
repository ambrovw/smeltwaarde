import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/base/base.css';
import './styles/base/theme.css';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoogleOAuthProvider clientId="480929917712-bni92qjarqs6ufj08s77ul0emsc5dgip.apps.googleusercontent.com">
            <div>
                <App />
            </div>
        </GoogleOAuthProvider>
    </StrictMode>
);
