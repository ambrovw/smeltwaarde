import { useState, useEffect } from 'react';

export default function useGoldPrice() {
    const [goldPrice, setGoldPrice] = useState(null);
    const [randPerGram, setRandPerGram] = useState(null);
    const [chgXau, setChgXau] = useState(null);
    const [localTime, setLocalTime] = useState(null);
    const [flashPrice, setFlashPrice] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchGoldPrice() {
            try {
                const response = await fetch('https://data-asg.goldprice.org/dbXRates/ZAR');
                const data = await response.json();
                const item = data.items?.[0];

                // Validate numeric fields explicitly (0 should be allowed)
                const hasXau = item && typeof item.xauPrice === 'number' && Number.isFinite(item.xauPrice);
                const hasChg = item && 'chgXau' in item && typeof item.chgXau === 'number' && Number.isFinite(item.chgXau);

                if (hasXau && hasChg) {
                    setFlashPrice(true);
                    setTimeout(() => setFlashPrice(false), 500);
                    setGoldPrice(item.xauPrice);
                    setRandPerGram(item.xauPrice / 31.1035);
                    setChgXau(item.chgXau);

                    // Prefer the millisecond timestamp fields (tsj or ts) for stable parsing
                    const tsMs = (typeof data.tsj === 'number' && Number.isFinite(data.tsj))
                        ? data.tsj
                        : (typeof data.ts === 'number' && Number.isFinite(data.ts) ? data.ts : null);

                    if (tsMs) {
                        const utcDate = new Date(tsMs);
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
                    } else {
                        // Fallback to the provided date string if present
                        setLocalTime(typeof data.date === 'string' ? data.date : '');
                    }

                    setError(null);
                } else {
                    setError('Kon nie goue prysdata laai nie');
                }
            } catch (err) {
                console.error(err);
                setError('Kon nie prysdata laai nie');
            }
        }

        fetchGoldPrice();

        const interval = setInterval(fetchGoldPrice, 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        goldPrice,
        randPerGram,
        chgXau,
        localTime,
        flashPrice,
        error,
    };
}
