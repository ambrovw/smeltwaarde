import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useContactModal } from './ContactModalContext.jsx';

export default function ContactLink() {
    const { t } = useLanguage();
    const { openModal } = useContactModal();

    return (
        <div className="contact-row">
            <button className="footer-cta" onClick={openModal}>
                {t('footerCta')}
            </button>
        </div>
    );
}
