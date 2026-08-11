import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { trackEvent } from '../analytics.js';

import { CONTACT_ENDPOINT as ENDPOINT } from '../notify.js';

function ContactForm({ initialBoodskap = '' }) {
    const { t } = useLanguage();
    const [naam, setNaam] = useState('');
    const [epos, setEpos] = useState('');
    const [boodskap, setBoodskap] = useState(initialBoodskap);
    const [notas, setNotas] = useState('');
    const [selnommer, setSelnommer] = useState('');
    const [kontakMetode, setKontakMetode] = useState('whatsapp');
    const [webwerf, setWebwerf] = useState(''); // honeypot
    const [began] = useState(() => Date.now()); // anti-bot: minimum time-to-submit
    const [status, setStatus] = useState('idle'); // idle | sending | sent | error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        trackEvent('contact_form_submit', {});
        const volleBoodskap = notas.trim()
            ? `${boodskap}\n\nNotas:\n${notas.trim()}`
            : boodskap;
        try {
            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ naam, epos, boodskap: volleBoodskap, selnommer, kontakMetode, webwerf, began }),
            });
            const body = await res.json();
            if (!res.ok || !body.ok) throw new Error('send failed');
            setStatus('sent');
        } catch {
            setStatus('error');
        }
    };

    if (status === 'sent') {
        return <p className="kv-form-status kv-form-status--ok">{t('kvFormSukses')}</p>;
    }

    return (
        <form className="kv-form" onSubmit={handleSubmit}>
            <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                placeholder={t('kvFormNaam')}
                maxLength={100}
                required
            />
            <input
                type="email"
                value={epos}
                onChange={(e) => setEpos(e.target.value)}
                placeholder={t('kvFormEpos')}
                maxLength={200}
                required
            />
            <div className="kv-form-selrow">
                <input
                    type="tel"
                    value={selnommer}
                    onChange={(e) => setSelnommer(e.target.value)}
                    placeholder={t('kvFormSel')}
                    maxLength={30}
                />
                {selnommer.trim() !== '' && (
                    <div className="kv-form-metode" role="group" aria-label={t('kvFormMetode')}>
                        <button
                            type="button"
                            className={kontakMetode === 'bel' ? 'aktief' : ''}
                            onClick={() => setKontakMetode('bel')}
                        >
                            {t('kvFormBel')}
                        </button>
                        <button
                            type="button"
                            className={kontakMetode === 'whatsapp' ? 'aktief' : ''}
                            onClick={() => setKontakMetode('whatsapp')}
                        >
                            WhatsApp
                        </button>
                    </div>
                )}
            </div>
            <textarea
                value={boodskap}
                onChange={(e) => setBoodskap(e.target.value)}
                placeholder={t('kvFormBoodskap')}
                maxLength={3000}
                rows={5}
                readOnly={initialBoodskap !== ''}
                required
            />
            {initialBoodskap !== '' && (
                <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder={t('kvFormNotas')}
                    maxLength={1000}
                    rows={3}
                />
            )}
            <input
                type="text"
                value={webwerf}
                onChange={(e) => setWebwerf(e.target.value)}
                className="kv-form-webwerf"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
            />
            {status === 'error' && (
                <p className="kv-form-status kv-form-status--fout">{t('kvFormFout')}</p>
            )}
            <button
                type="submit"
                className="action-button share-button kv-form-stuur"
                disabled={status === 'sending'}
            >
                {status === 'sending' ? t('kvFormSending') : t('kvFormStuur')}
            </button>
        </form>
    );
}

export default ContactForm;
