import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';

function decodeEmail() {
    const parts = ['\x61\x64\x6d\x69\x6e', '\x73\x6d\x65\x6c\x74\x77\x61\x61\x72\x64\x65\x2e\x63\x6f\x2e\x7a\x61'];
    return parts[0] + '@' + parts[1];
}

export default function ContactLink() {
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState(null);

    const openModal = () => {
        setEmail(decodeEmail());
        setShowModal(true);
    };

    return (
        <>
            <div className="contact-row">
                <button className="footer-cta" onClick={openModal}>
                    {t('footerCta')}
                </button>
            </div>
            {showModal && email && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        <p>{t('footerModalText')}</p>
                        <a href={`mailto:${email}`} className="modal-email">
                            {email}
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}
