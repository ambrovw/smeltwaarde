import { useEffect, useState } from 'react'
import { coins as groupedCoins } from '../coinData.js'
import '../styles/components/SilverCalculator.css';

function SilverCalculator() {

    const [chgXag, setChgXag] = useState(null);
    const [silverPrice, setSilverPrice] = useState(null)
    const [adjustmentInput, setAdjustmentInput] = useState('0');
    const [adjustmentPercent, setAdjustmentPercent] = useState(0);
    const adjustedSilverPrice = silverPrice
        ? silverPrice * (1 + adjustmentPercent / 100)
        : null;
    const [localTime, setLocalTime] = useState(null)
    const [error, setError] = useState(null)
    const [randPerGram, setRandPerGram] = useState(null)
    const [flashPrice, setFlashPrice] = useState(false)
    const initializedGroups = Object.fromEntries(
        Object.entries(groupedCoins).map(([groupLabel, coins]) => [
            groupLabel,
            coins.map((coin) => ({ ...coin, quantity: 0 }))
        ])
    )
    const [coinList, setCoinList] = useState(initializedGroups)
    const [collapsedEras, setCollapsedEras] = useState(() => {
        const initialState = {}
        Object.keys(coinList).forEach((groupLabel, index) => {
            initialState[groupLabel] = index !== 0 // first group expanded, rest collapsed
        })
        return initialState
    })
    const toggleEra = (groupLabel) => {
        setCollapsedEras((prev) => ({
            ...prev,
            [groupLabel]: !prev[groupLabel]
        }))
    }

    useEffect(() => {
        const parsed = parseFloat(adjustmentInput);
        if (!isNaN(parsed)) {
            setAdjustmentPercent(parsed);
        }
    }, [adjustmentInput]);


    useEffect(() => {
            async function fetchSilverPrice() {
                try {
                    const response = await fetch('https://data-asg.goldprice.org/dbXRates/ZAR')
                    const data = await response.json()
                    const item = data.items?.[0]

                    if (item && item.xagPrice && item.chgXag && data.date) {
                        setFlashPrice(true)
                        setTimeout(() => setFlashPrice(false), 500) // Flash lasts 500ms
                        setSilverPrice(item.xagPrice)
                        setRandPerGram(item.xagPrice / 31.1035)
                        setChgXag(item.chgXag);

                        const utcTimestamp = data.tsj
                        const utcDate = new Date(utcTimestamp)

                        const saDate = utcDate.toLocaleString('af-ZA', {
                            timeZone: 'Africa/Johannesburg',
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        })
                        setLocalTime(saDate)
                        setError(null)
                    } else {
                        setError('Price data unavailable')
                    }
                } catch (err) {
                    setError('Failed to fetch silver price')
                }
            }

            fetchSilverPrice()
            const interval = setInterval(fetchSilverPrice, 30000)
            return () => clearInterval(interval)
        }, [])

    const handleQuantityChange = (targetCoin, newQty) => {
        const parsedQty = newQty === '' ? '' : Math.max(Number(newQty), 0);

        const updated = Object.fromEntries(
            Object.entries(coinList).map(([groupLabel, coins]) => [
                groupLabel,
                coins.map((coin) =>
                    coin.name === targetCoin.name && coin.era === targetCoin.era
                        ? { ...coin, quantity: parsedQty }
                        : coin
                )
            ])
        );

        setCoinList(updated);

        // Trigger Google Analytics event
        if (window.gtag) {
            window.gtag('event', 'hoeveelheid_change', {
                event_category: 'Input',
                event_label: `${targetCoin.name} (${targetCoin.era})`,
                value: parsedQty === '' ? 0 : parsedQty
            });
        }
    };

        const totalFineSilverGrams = Object.values(coinList)
            .flat()
            .reduce((sum, coin) => {
                return sum + coin.purity * coin.weight * coin.quantity
            }, 0)

        const totalValue = Object.values(coinList)
            .flat()
            .reduce((sum, coin) => {
                const fineSilverGrams = coin.purity * coin.weight * coin.quantity
                const fineSilverOunces = fineSilverGrams / 31.1035
                return sum + adjustedSilverPrice * fineSilverOunces
            }, 0)

        return (
            <div className="container">
                {error ? (
                    <p className="error">{error}</p>
                ) : silverPrice ? (
                    <>
                        <div className="header-row">
                            <img src="/smeltwaarde_logo_transparent_bgfill.png" alt="Smeltwaarde Logo" className="logo" />
                            <div className="header-text">
                                <h1>Silver munt waarde</h1>
                                <p className={`price ${flashPrice ? 'flash' : ''}`}>
                                    R{randPerGram.toFixed(2)}/g {'  -  '} R{silverPrice.toFixed(2)}/ozt
                                    <span className={`rateChange ${chgXag >= 0 ? 'up' : 'down'}`}>
                            {chgXag >= 0 ? '▲' : '▼'}R{Math.abs(chgXag).toFixed(2)}/ozt
                        </span>
                                </p>
                                <p className="timestamp">{localTime}</p>
                            </div>
                        </div>

                        <div className="adjustment-row">
                            <label
                                htmlFor="adjustment"
                                className="adjustment-label"
                                title="Pas die silwerprys aan met 'n persentasie om 'n premie of afslag in te reken."
                            >
                                💡 Afslag/Premie:
                            </label>
                            <div className="quantity-control">
                                <button
                                    type="button"
                                    onClick={() => setAdjustmentInput(prev => Math.max(Number(prev) - 0.5, -100))}
                                >
                                    -
                                </button>
                                <input
                                    id="adjustment"
                                    type="number"
                                    step="0.5"
                                    value={adjustmentInput}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setAdjustmentInput(val === '' ? '' : Number(val));
                                    }}
                                    className="quantity-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setAdjustmentInput(prev => Math.min(Number(prev) + 0.5, 100))}
                                >
                                    +
                                </button>
                                <span className="adjustment-percent">%</span>
                            </div>
                        </div>

                        {Object.entries(coinList).map(([groupLabel, coins]) => (
                            <div key={groupLabel}>
                                <h2 className="era-header" onClick={() => toggleEra(groupLabel)}>
                                    {collapsedEras[groupLabel] ? '▸' : '▾'} {groupLabel}
                                </h2>

                                {!collapsedEras[groupLabel] && (
                                    <table className="coin-table">
                                        <colgroup>
                                            <col className="col-name" />
                                            <col className="col-era" />
                                            <col className="col-purity" />
                                            <col className="col-weight" />
                                            <col className="col-quantity" />
                                            <col className="col-silver" />
                                            <col className="col-value" />
                                        </colgroup>
                                        <thead>
                                        <tr>
                                            <th>Munt</th>
                                            <th>Era</th>
                                            <th>Fynheid</th>
                                            <th>Gewig (g)</th>
                                            <th>Hoeveelheid</th>
                                            <th>Silver (g)</th>
                                            <th>Waarde (R)</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {coins.map((coin, index) => {
                                            const fineSilverGrams = coin.purity * coin.weight * coin.quantity;
                                            const fineSilverOunces = fineSilverGrams / 31.1035;
                                            const value = adjustedSilverPrice * fineSilverOunces;
                                            return (
                                                <tr key={`${coin.era}-${index}`} className={coin.quantity !== 0 ? 'highlight-row' : ''}>
                                                    <td>{coin.name}</td>
                                                    <td>{coin.era}</td>
                                                    <td>{coin.purity}</td>
                                                    <td>{coin.weight}</td>
                                                    <td>
                                                        <div className="quantity-control">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const current = coin.quantity === '' || coin.quantity == null ? 0 : Number(coin.quantity);
                                                                    handleQuantityChange(coin, Math.max(current - 1, 0));
                                                                }}
                                                            >
                                                                -
                                                            </button>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={coin.quantity}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    handleQuantityChange(coin, val === '' ? '' : Number(val));
                                                                }}
                                                                className="quantity-input"
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const current = coin.quantity === '' || coin.quantity == null ? 0 : Number(coin.quantity);
                                                                    handleQuantityChange(coin, current + 1);
                                                                }}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>{fineSilverGrams.toFixed(2)}</td>
                                                    <td className={`value-cell ${coin.quantity !== 0 ? 'highlight-cell' : ''} ${flashPrice ? 'flash' : ''}`}>
                                                        {value.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ))}

                        <div className="totals-row">
                            <div className="totals-item">
                                🪙 Totale silver: <span>{totalFineSilverGrams.toFixed(2)}g</span>
                            </div>
                            <div className="totals-item">
                                💰 Totale waarde: <span className={flashPrice ? 'flash' : ''}>R {totalValue.toFixed(2)}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        )
}
export default SilverCalculator