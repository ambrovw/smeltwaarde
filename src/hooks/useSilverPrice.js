import { useState, useEffect, useRef } from 'react';
import { trackError } from '../analytics.js';

export default function useSilverPrice() {
    const [silverPrice, setSilverPrice] = useState(null);
    const [randPerGram, setRandPerGram] = useState(null);
    const [chgXag, setChgXag] = useState(null);
    const [localTime, setLocalTime] = useState(null);
    const [flashPrice, setFlashPrice] = useState(false);
    const [error, setError] = useState(null);
    const prevPrice = useRef(null);

    useEffect(() => {
        async function fetchSilverPrice() {
            try {
                const [metalRes, fxRes] = await Promise.all([
                    fetch('https://api.gold-api.com/price/XAG'),
                    fetch('https://open.er-api.com/v6/latest/USD'),
                ]);
                const metalData = await metalRes.json();
                const fxData = await fxRes.json();

                const usdPrice = metalData?.price;
                const zarRate = fxData?.rates?.ZAR;

                if (typeof usdPrice === 'number' && Number.isFinite(usdPrice) && zarRate) {
                    const zarPrice = usdPrice * zarRate;

                    setFlashPrice(true);
                    setTimeout(() => setFlashPrice(false), 500);
                    setSilverPrice(zarPrice);
                    setRandPerGram(zarPrice / 31.1034768);

                    // Calculate change from previous fetch
                    if (prevPrice.current !== null) {
                        setChgXag(zarPrice - prevPrice.current);
                    } else {
                        setChgXag(0);
                    }
                    prevPrice.current = zarPrice;

                    const utcDate = new Date(metalData.updatedAt);
                    const saDate = utcDate.toLocaleString('af-ZA', {
                        timeZone: 'Africa/Johannesburg',
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    });
                    setLocalTime(saDate);
                    setError(null);
                } else {
                    setError('Price data unavailable');
                    trackError('silver_price_error', 'Price data unavailable');
                }
            } catch (err) {
                setError('Failed to fetch silver price');
                trackError('silver_price_error', err.message || 'fetch failed');
            }
        }

        fetchSilverPrice();
        const interval = setInterval(fetchSilverPrice, 30000);
        return () => clearInterval(interval);
    }, []);

    return {
        silverPrice,
        randPerGram,
        chgXag,
        localTime,
        flashPrice,
        error,
    };
}
