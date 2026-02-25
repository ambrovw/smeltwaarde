import { useState, useEffect } from 'react';
import { trackError } from '../analytics.js';

// Shared USD/ZAR rate — refreshes every 5 minutes.
// Uses open.er-api.com (free, no key, CORS enabled).
let cachedRate = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

async function fetchRate() {
    if (cachedRate && Date.now() - cacheTimestamp < CACHE_TTL) return cachedRate;

    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data.result === 'success' && data.rates?.ZAR) {
        cachedRate = data.rates.ZAR;
        cacheTimestamp = Date.now();
        return cachedRate;
    }
    throw new Error('USD/ZAR rate unavailable');
}

export default function useUsdZar() {
    const [rate, setRate] = useState(cachedRate);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;

        async function load() {
            try {
                const r = await fetchRate();
                if (active) { setRate(r); setError(null); }
            } catch (err) {
                if (active) {
                    setError(err.message);
                    trackError('usd_zar_error', err.message);
                }
            }
        }

        load();
        const interval = setInterval(load, CACHE_TTL);
        return () => { active = false; clearInterval(interval); };
    }, []);

    return { rate, error };
}
