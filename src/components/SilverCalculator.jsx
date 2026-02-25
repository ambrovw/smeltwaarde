import { useEffect, useRef, useState } from 'react'
import useSilverPrice from '../hooks/useSilverPrice.js';
import { coins as groupedCoins } from '../coinData.js'
import '../styles/components/SilverCalculator.css';
import {Helmet} from "react-helmet";
import { trackEvent, trackQuantityChangeDebounced } from '../analytics.js';

function SilverCalculator() {

    const {
        silverPrice,
        randPerGram,
        chgXag,
        localTime,
        flashPrice,
        error,
    } = useSilverPrice();

    const [adjustmentInput, setAdjustmentInput] = useState('0');
    const [adjustmentPercent, setAdjustmentPercent] = useState(0);
    const adjustedSilverPrice = silverPrice
        ? silverPrice * (1 + adjustmentPercent / 100)
        : null;
    const initializedGroups = Object.fromEntries(
        Object.entries(groupedCoins).map(([groupLabel, coins]) => [
            groupLabel,
            coins.map((coin) => ({ ...coin, quantity: 0 }))
        ])
    )
    // Restore persisted state if present
     const [coinList, setCoinList] = useState(() => {
         try {
             const raw = localStorage.getItem('silver_state');
             if (raw) {
                 const parsed = JSON.parse(raw);
                 if (parsed && parsed.coinList) return parsed.coinList;
             }
         } catch (e) {}
         return initializedGroups;
     })

     const [collapsedEras, setCollapsedEras] = useState(() => {
         try {
             const raw = localStorage.getItem('silver_state');
             if (raw) {
                 const parsed = JSON.parse(raw);
                 if (parsed && parsed.collapsedEras) return parsed.collapsedEras;
             }
         } catch (e) {}
         const initialState = {}
         Object.keys(initializedGroups).forEach((groupLabel, index) => {
             initialState[groupLabel] = index !== 1 // second group expanded, rest collapsed
         })
         return initialState
     })
    // hasSaved for silver
    const [hasSaved, setHasSaved] = useState(() => {
        try {
            return !!localStorage.getItem('silver_state');
        } catch (e) { return false }
    })

    const toggleEra = (groupLabel) => {
        setCollapsedEras((prev) => {
            const expanded = prev[groupLabel]; // was collapsed → now expanding
            trackEvent('group_toggle', { group_name: groupLabel, expanded, metal: 'silver' });
            return { ...prev, [groupLabel]: !prev[groupLabel] };
        })
    }
    const [hideColumns, setHideColumns] = useState(true);

    // Reset persisted silver state
    const resetSilverState = () => {
        trackEvent('calculator_reset', { metal: 'silver' });
        try { localStorage.removeItem('silver_state'); } catch (e) {}
        setCoinList(initializedGroups);
        const defaultCollapsed = {};
        Object.keys(initializedGroups).forEach((groupLabel, index) => {
            defaultCollapsed[groupLabel] = index !== 1
        });
        setCollapsedEras(defaultCollapsed);
        setAdjustmentInput('0');
    }

    useEffect(() => {
        const parsed = parseFloat(adjustmentInput);
        if (!isNaN(parsed)) {
            setAdjustmentPercent(parsed);
        }
    }, [adjustmentInput]);

    // Persist silver state
    useEffect(() => {
        try {
            // determine default for silver: second group open, others closed, all zeros, adjustment 0
            const defaultCollapsed = {};
            Object.keys(initializedGroups).forEach((groupLabel, index) => {
                defaultCollapsed[groupLabel] = index !== 1;
            })
            const isDefault = (function() {
                if (String(adjustmentInput) !== '0') return false;
                for (const k of Object.keys(initializedGroups)) if (collapsedEras[k] !== defaultCollapsed[k]) return false;
                for (const coins of Object.values(coinList)) for (const c of coins) if (Number(c.quantity) !== 0) return false;
                return true;
            })();
            if (isDefault) {
                localStorage.removeItem('silver_state');
                setHasSaved(false);
            } else {
                localStorage.setItem('silver_state', JSON.stringify({ coinList, collapsedEras, adjustmentInput }));
                setHasSaved(true);
            }
        } catch (e) {}
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
        trackQuantityChangeDebounced(targetCoin, parsedQty, 'silver');
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

        // Fire engagement event once per session when user first has a non-zero total
        const engagementFired = useRef(false);
        useEffect(() => {
            if (totalValue > 0 && !engagementFired.current) {
                engagementFired.current = true;
                trackEvent('calculation_active', {
                    metal: 'silver',
                    total_value: Math.round(totalValue),
                    total_grams: Math.round(totalFineSilverGrams * 100) / 100,
                });
            }
        }, [totalValue]);

        return (
            <div className="scroll-wrapper">

                <Helmet>
                    <title>Smeltwaarde | Silwer munt smeltwaarde sakrekenaar</title>
                    <meta name="description" content="Bereken die smeltwaarde van ou Suid-Afrikaanse silwer munte — ZAR, Unie, RSA, Brits, en VSA. Calculate South African silver coin melt values with live prices." />
                    <meta name="keywords" content="smeltwaarde, silwer munte, silver coins, melt value, junk silver, ZAR coins, Union coins, Krugerrand, South African coins" />
                    <link rel="canonical" href="https://smeltwaarde.co.za/silver" />
                </Helmet>

                <div className="container">
                    {error ? (
                        <p className="error">{error}</p>
                    ) : silverPrice ? (
                        <>
                            <div className="header-row">
                                <img src="/smeltwaarde_logo_transparent_bgfill.webp" alt="Smeltwaarde Logo" className="logo" />
                                <div className="header-text">
                                    <h1>Silwer munt waarde</h1>
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
                                    💡 Premie:
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

                                <button
                                    className="action-button"
                                    onClick={() => setHideColumns(prev => !prev)}
                                >
                                    {hideColumns ? '👁️ Fyn Details' : '🙈 Versteek Era/Fynheid/Gewig/Silwer'}
                                </button>
                                {hasSaved && (
                                    <button
                                        className="action-button"
                                        onClick={resetSilverState}
                                        title="Herstel silwer blad na verstek state"
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
                                                <col className="col-quantity" />
                                                <col className="col-silver" />
                                                <col className="col-value" />
                                            </colgroup>
                                            <thead>
                                            <tr>
                                                <th>Munt</th>
                                                {!hideColumns && <th>Era</th>}
                                                {!hideColumns && <th>Fynheid</th>}
                                                {!hideColumns && <th>Gewig (g)</th>}
                                                {!hideColumns && <th>Silver (g)</th>}
                                                <th>Elk</th>
                                                <th>Hoeveelheid</th>
                                                <th>Waarde (R)</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {coins.map((coin, index) => {
                                                const fineSilverGrams = coin.purity * coin.weight * coin.quantity;
                                                const fineSilverOunces = fineSilverGrams / 31.1035;
                                                const value = adjustedSilverPrice * fineSilverOunces;
                                                const perItemValue = adjustedSilverPrice * (coin.purity * coin.weight / 31.1035);

                                                return (
                                                    <tr key={`${coin.era}-${index}`} className={coin.quantity !== 0 ? 'calc-highlight-row' : ''}>
                                                        <td>{coin.name}</td>
                                                        {!hideColumns && <td>{coin.era}</td>}
                                                        {!hideColumns && <td>{coin.purity}</td>}
                                                        {!hideColumns && <td>{coin.weight}</td>}
                                                        {!hideColumns && <td>{fineSilverGrams.toFixed(2)}</td>}
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
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            ))}

                            <div className="totals-row">
                                <div className="totals-item">
                                    🪙 Totale silwer: <span>{totalFineSilverGrams.toFixed(2)}g</span>
                                </div>
                                <div className="totals-item">
                                    💰 Totale waarde: <span className={flashPrice ? 'flash' : ''}>R {totalValue.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Removed the koop/shop button and navigation to ensure no shop/backend code remains */}
                        </>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </div>
        )
}
export default SilverCalculator