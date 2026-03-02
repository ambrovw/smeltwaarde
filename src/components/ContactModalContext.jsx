import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';

function decodeEmail() {
    const parts = ['\x61\x64\x6d\x69\x6e', '\x73\x6d\x65\x6c\x74\x77\x61\x61\x72\x64\x65\x2e\x63\x6f\x2e\x7a\x61'];
    return parts[0] + '@' + parts[1];
}

const ContactModalContext = createContext();

export function useContactModal() {
    return useContext(ContactModalContext);
}

export function ContactModalProvider({ children }) {
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState(null);

    const openModal = () => {
        setEmail(decodeEmail());
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    return (
        <ContactModalContext.Provider value={{ openModal }}>
            {children}
            {showModal && email && createPortal(
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>&times;</button>
                        <p>{t('footerModalText')}</p>
                        <a href={`mailto:${email}`} className="modal-email">
                            {email}
                        </a>
                    </div>
                </div>,
                document.getElementById('modal-root')
            )}
        </ContactModalContext.Provider>
    );
}
