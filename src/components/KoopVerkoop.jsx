import { useState } from 'react';
import { createPortal } from 'react-dom';
import useSilverPrice from '../hooks/useSilverPrice.js';
import { categories } from '../koopVerkoopData.js';
import '../styles/components/SilverCalculator.css';
import '../styles/components/KoopVerkoop.css';
import { Helmet } from 'react-helmet';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import ContactForm from './ContactForm.jsx';

const formatRate = (value) => `${value > 0 ? '+' : ''}${value}%`;

function KoopVerkoop() {
    const { t } = useLanguage();
    const [showForm, setShowForm] = useState(false);

    const {
        silverPrice,
        randPerGram,
        chgXag,
        localTime,
        flashPrice,
    } = useSilverPrice();

    return (
        <div className="scroll-wrapper">
            <Helmet>
                <title>{t('kvHelmetTitle')}</title>
                <meta name="description" content={t('kvDescription')} />
                <meta name="keywords" content="koop silwer munte, verkoop silwer munte, buy silver coins, sell silver coins, Krugerrand, smeltwaarde, melt value, South Africa" />
                <link rel="canonical" href={`${window.location.origin}/koopVerkoop`} />
                <link rel="alternate" hrefLang="af" href="https://smeltwaarde.co.za/koopVerkoop" />
                <link rel="alternate" hrefLang="en" href="https://meltvalue.co.za/koopVerkoop" />
            </Helmet>
            <div className="container page-container kv-container">
                <div className="header-row">
                    <img src="/smeltwaarde_logo_transparent_bgfill.webp" alt="Smeltwaarde Logo" className="logo" />
                    <div className="header-text">
                        <h1>{t('kvTitle')}</h1>
                        {silverPrice && (
                            <>
                                <p className={`price ${flashPrice ? 'flash' : ''}`}>
                                    R{randPerGram.toFixed(2)}/g {'  -  '} R{silverPrice.toFixed(2)}/ozt
                                    <span className={`rateChange ${chgXag >= 0 ? 'up' : 'down'}`}>
                                        {chgXag >= 0 ? '▲' : '▼'}R{Math.abs(chgXag).toFixed(2)}/ozt
                                    </span>
                                </p>
                                <p className="timestamp">{localTime}</p>
                            </>
                        )}
                    </div>
                </div>

                <p className="kv-intro">{t('kvIntro')}</p>

                <table className="coin-table kv-table">
                    <thead>
                        <tr>
                            <th>{t('kvCategory')}</th>
                            <th>{t('kvBuy')}</th>
                            <th>{t('kvSell')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.key}>
                                <td className="kv-category">{t(cat.key)}</td>
                                <td className="kv-rate">{formatRate(cat.koop)}</td>
                                <td className="kv-rate calc-each">{formatRate(cat.verkoop)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="kv-disclaimer">
                    <h2 className="era-header">{t('kvDisclaimerTitle')}</h2>
                    <ul>
                        <li>{t('kvDisc1')}</li>
                        <li>{t('kvDisc2')}</li>
                        <li>{t('kvDisc3')}</li>
                        <li>{t('kvDisc4')}</li>
                        <li>{t('kvDisc5')}</li>
                    </ul>
                </div>

                <button className="action-button share-button kv-cta" onClick={() => setShowForm(true)}>
                    {t('kvCta')}
                </button>
                {showForm && createPortal(
                    <div
                        className="modal-overlay"
                        onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
                    >
                        <div className="modal-content kv-form-modal">
                            <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
                            <p>{t('kvCta')}</p>
                            <ContactForm />
                        </div>
                    </div>,
                    document.getElementById('modal-root')
                )}
            </div>
        </div>
    );
}

export default KoopVerkoop;
