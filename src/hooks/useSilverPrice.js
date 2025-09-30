import { useState, useEffect } from 'react';

export default function useSilverPrice() {
    const [silverPrice, setSilverPrice] = useState(null);
    const [randPerGram, setRandPerGram] = useState(null);
    const [chgXag, setChgXag] = useState(null);
    const [localTime, setLocalTime] = useState(null);
    const [flashPrice, setFlashPrice] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchSilverPrice() {
            try {
                const response = await fetch('https://data-asg.goldprice.org/dbXRates/ZAR');
                const data = await response.json();
                const item = data.items?.[0];

                if (item && item.xagPrice && item.chgXag && data.date) {
                    setFlashPrice(true);
                    setTimeout(() => setFlashPrice(false), 500);
                    setSilverPrice(item.xagPrice);
                    setRandPerGram(item.xagPrice / 31.1035);
                    setChgXag(item.chgXag);

                    const utcDate = new Date(data.tsj);
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
                }
            } catch (err) {
                setError('Failed to fetch silver price');
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