import { useEffect, useState } from 'react'
import useGoldPrice from '../hooks/useGoldPrice.js';
import { coins as groupedCoins } from '../goldCoinData.js'
import '../styles/components/SilverCalculator.css';
import { Helmet } from 'react-helmet';

function GoldCalculator() {
    const {
        goldPrice,
        randPerGram,
        chgXau,
        localTime,
        flashPrice,
        error,
    } = useGoldPrice();

    const [adjustmentInput, setAdjustmentInput] = useState('0');
    const [adjustmentPercent, setAdjustmentPercent] = useState(0);
    const adjustedGoldPrice = goldPrice
        ? goldPrice * (1 + adjustmentPercent / 100)
        : null;

    const initializedGroups = Object.fromEntries(
        Object.entries(groupedCoins).map(([groupLabel, coins]) => [
            groupLabel,
            coins.map((coin) => ({ ...coin, quantity: 0 }))
        ])
    )

    // Try to restore persisted state (coin counts, collapsed eras, adjustment input)
    const [coinList, setCoinList] = useState(() => {
        try {
            const raw = localStorage.getItem('gold_state');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.coinList) return parsed.coinList;
            }
        } catch (e) {
            // ignore parse errors
        }
        return initializedGroups;
    })

    const [collapsedEras, setCollapsedEras] = useState(() => {
        try {
            const raw = localStorage.getItem('gold_state');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.collapsedEras) return parsed.collapsedEras;
            }
        } catch (e) {
            // ignore
        }
        const initialState = {}
        // Expand only the group whose label is exactly 'Krugerrand'
        Object.keys(groupedCoins).forEach((groupLabel) => {
            initialState[groupLabel] = groupLabel === 'Krugerrand' ? false : true
        })
        return initialState
    })

    // Track whether we have a saved state for conditional rendering of reset button
    const [hasSaved, setHasSaved] = useState(() => {
        try {
            return !!localStorage.getItem('gold_state');
        } catch (e) {
            return false;
        }
    })

    // show/hide fine details (era/purity/weight)
    const [hideColumns, setHideColumns] = useState(true);

    useEffect(() => {
        const percent = Number(adjustmentInput) || 0
        setAdjustmentPercent(percent)
    }, [adjustmentInput])

    // Helper to determine if current state equals defaults
    const isDefaultState = (cl, ce, adj) => {
        if (String(adj) !== '0') return false;
        // collapsed default: Krugerrand false, others true
        for (const k of Object.keys(groupedCoins)) {
            const expected = k === 'Krugerrand' ? false : true;
            if (ce[k] !== expected) return false;
        }
        // coin quantities default to 0
        for (const coins of Object.values(cl)) {
            for (const coin of coins) {
                if (Number(coin.quantity) !== 0) return false;
            }
        }
        return true;
    }

    // Persist state to localStorage when relevant pieces change.
    // Save only when state differs from defaults; otherwise remove saved state.
    useEffect(() => {
        try {
            if (isDefaultState(coinList, collapsedEras, adjustmentInput)) {
                localStorage.removeItem('gold_state');
                setHasSaved(false);
            } else {
                const toSave = JSON.stringify({ coinList, collapsedEras, adjustmentInput });
                localStorage.setItem('gold_state', toSave);
                setHasSaved(true);
            }
        } catch (e) {
            // ignore storage errors
        }
    }, [coinList, collapsedEras, adjustmentInput]);

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
    };

    const toggleEra = (eraKey) => {
        setCollapsedEras(prev => ({ ...prev, [eraKey]: !prev[eraKey] }))
    }

    // Reset persisted gold state and revert to defaults
    const resetGoldState = () => {
        try { localStorage.removeItem('gold_state'); } catch (e) {}
        setCoinList(initializedGroups);
        const defaultCollapsed = {};
        Object.keys(groupedCoins).forEach((groupLabel) => {
            defaultCollapsed[groupLabel] = groupLabel === 'Krugerrand' ? false : true;
        });
        setCollapsedEras(defaultCollapsed);
        setAdjustmentInput('0');
        setHasSaved(false);
    }

    const totalFineGoldGrams = Object.values(coinList)
        .flat()
        .reduce((sum, coin) => {
            return sum + coin.purity * coin.weight * coin.quantity
        }, 0)

    const totalValue = Object.values(coinList)
        .flat()
        .reduce((sum, coin) => {
            const fineGrams = coin.purity * coin.weight * coin.quantity
            const fineOunces = fineGrams / 31.1035
            return sum + (adjustedGoldPrice || 0) * fineOunces
        }, 0)

    return (
        <div className="scroll-wrapper">
            <Helmet>
                <title>Smeltwaarde | Bereken die goue waarde van ou Suid-Afrikaanse munte</title>
            </Helmet>
            <div className="container">
                {error ? (
                    <p className="error">{error}</p>
                ) : goldPrice ? (
                    <>
                        <div className="header-row">
                            <img src="/smeltwaarde_logo_transparent_bgfill.webp" alt="Smeltwaarde Logo" className="logo" />
                            <div className="header-text">
                                <h1>Goue munt waarde</h1>
                                <p className={`price ${flashPrice ? 'flash' : ''}`}>
                                    R{randPerGram ? randPerGram.toFixed(2) : '–'}/g {'  -  '} R{goldPrice ? goldPrice.toFixed(2) : '–'}/ozt
                                    <span className={`rateChange ${chgXau >= 0 ? 'up' : 'down'}`}>
                                {chgXau >= 0 ? '▲' : '▼'}R{Math.abs(chgXau).toFixed(2)}/ozt
                            </span>
                                </p>
                                <p className="timestamp">{localTime}</p>
                            </div>
                        </div>

                        <div className="adjustment-row">
                            <label
                                htmlFor="adjustment"
                                className="adjustment-label"
                                title="Pas die goue prys aan met 'n persentasie om 'n premie of afslag in te reken."
                            >
                                💡 Premie:
                            </label>
                             <div className="quantity-control">
                                <button type="button" onClick={() => setAdjustmentInput(prev => Math.max(Number(prev) - 0.5, -100))}>-</button>
                                <input id="adjustment" type="number" step="0.5" value={adjustmentInput} onChange={(e) => {
                                    const val = e.target.value;
                                    setAdjustmentInput(val === '' ? '' : Number(val));
                                }} className="quantity-input" />
                                <button type="button" onClick={() => setAdjustmentInput(prev => Math.min(Number(prev) + 0.5, 100))}>+</button>
                                <span className="adjustment-percent">%</span>
                            </div>
                            <button
                                className="action-button"
                                onClick={() => setHideColumns(prev => !prev)}
                            >
                                {hideColumns ? '👁️ Fyn Details' : '🙈 Versteek Era/Fynheid/Gewig/Goud'}
                            </button>
                            {hasSaved && (
                                <button
                                    className="action-button"
                                    onClick={resetGoldState}
                                    title="Herstel goud blad na verstek state"
                                >
                                    🔄 Herstel
                                </button>
                            )}
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
                                             <col className="col-gold" />
                                             <col className="col-each" />
                                             <col className="col-quantity" />
                                             <col className="col-value" />
                                         </colgroup>
                                         <thead>
                                             <tr>
                                                 <th>Munt</th>
                                                 {!hideColumns && <th>Era</th>}
                                                 {!hideColumns && <th>Fynheid</th>}
                                                 {!hideColumns && <th>Gewig (g)</th>}
                                                 {!hideColumns && <th>Goud (g)</th>}
                                                 <th>Elk</th>
                                                 <th>Hoeveelheid</th>
                                                 <th>Waarde (R)</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                            {coins.map((coin, index) => {
                                                const fineGrams = coin.purity * coin.weight * coin.quantity
                                                const fineOunces = fineGrams / 31.1035
                                                const value = (adjustedGoldPrice || 0) * fineOunces
                                                const perItemValue = (adjustedGoldPrice || 0) * (coin.purity * coin.weight / 31.1035)

                                                return (
                                                    <tr key={`${coin.era}-${index}`} className={coin.quantity !== 0 ? 'calc-highlight-row' : ''}>
                                                        <td>{coin.name}</td>
                                                        {!hideColumns && <td>{coin.era}</td>}
                                                        {!hideColumns && <td>{coin.purity}</td>}
                                                        {!hideColumns && <td>{coin.weight}</td>}
                                                        {!hideColumns && <td>{fineGrams.toFixed(2)}</td>}
                                                        <td className="calc-each">R{perItemValue.toFixed(2)}</td>
                                                        <td>
                                                            <div className="quantity-control">
                                                                <button type="button" onClick={() => {
                                                                    const current = coin.quantity === '' || coin.quantity == null ? 0 : Number(coin.quantity);
                                                                    handleQuantityChange(coin, Math.max(current - 1, 0));
                                                                }}>-</button>
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
                                                                <button type="button" onClick={() => {
                                                                    const current = coin.quantity === '' || coin.quantity == null ? 0 : Number(coin.quantity);
                                                                    handleQuantityChange(coin, current + 1);
                                                                }}>+</button>
                                                            </div>
                                                        </td>
                                                        <td className={`value-cell ${coin.quantity !== 0 ? 'calc-highlight-cell' : ''} ${flashPrice ? 'flash' : ''}`}>
                                                            R{value.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                         </tbody>
                                     </table>
                                 )}
                             </div>
                         ))}

                        <div className="totals-row">
                            <div className="totals-item">
                                🪙 Totale goud: <span>{totalFineGoldGrams.toFixed(2)}g</span>
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
        </div>
    )
}

export default GoldCalculator
