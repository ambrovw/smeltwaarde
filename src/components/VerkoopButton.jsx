import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { trackEvent } from '../analytics.js';
import { encodeShareState } from '../shareState.js';
import ContactForm from './ContactForm.jsx';

function VerkoopButton({ metal, coinList, adjustmentInput, totalValue }) {
    const { t } = useLanguage();
    const [show, setShow] = useState(false);
    const hasContent = totalValue > 0;

    const buildBoodskap = () => {
        const lines = Object.values(coinList)
            .flat()
            .filter((coin) => (Number(coin.quantity) || 0) > 0)
            .map((coin) => {
                const era = coin.era && coin.era !== '-' ? ` (${coin.era})` : '';
                return `- ${Number(coin.quantity)} x ${coin.name}${era}`;
            });
        const params = encodeShareState(coinList, adjustmentInput);
        const url = params
            ? `${window.location.origin}${window.location.pathname}?${params.toString()}`
            : '';
        return `${t('kvVerkoopIntro')}\n${lines.join('\n')}\n\n${url}`;
    };

    const openModal = () => {
        trackEvent('verkoop_click', { metal, total_value: Math.round(totalValue) });
        setShow(true);
    };

    return (
        <>
            <button
                className="action-button share-button"
                onClick={openModal}
                title={t('verkoopTooltip')}
                disabled={!hasContent}
            >
                {t('verkoopKnop')}
            </button>
            {show && createPortal(
                <div
                    className="modal-overlay"
                    onMouseDown={(e) => { if (e.target === e.currentTarget) setShow(false); }}
                >
                    <div className="modal-content kv-form-modal">
                        <button className="modal-close" onClick={() => setShow(false)}>&times;</button>
                        <p>{t('kvCta')}</p>
                        <p className="kv-verkoop-disclaimer">
                            <Link to="/koopVerkoop" onClick={() => setShow(false)}>
                                {t('kvVerkoopDisclaimer')}
                            </Link>
                        </p>
                        <ContactForm initialBoodskap={buildBoodskap()} />
                    </div>
                </div>,
                document.getElementById('modal-root')
            )}
        </>
    );
}

export default VerkoopButton;
