import { useEffect, useState } from 'react'
import { coins as initialCoins } from './coinData'
import './App.css'

function App() {
    const [silverPrice, setSilverPrice] = useState(null)
    const [localTime, setLocalTime] = useState(null)
    const [error, setError] = useState(null)
    const [coinList, setCoinList] = useState(initialCoins)

    useEffect(() => {
        async function fetchSilverPrice() {
            try {
                const response = await fetch('https://data-asg.goldprice.org/dbXRates/ZAR')
                const data = await response.json()
                const item = data.items?.[0]

                if (item && item.xagPrice && data.date) {
                    setSilverPrice(item.xagPrice)

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
        const interval = setInterval(fetchSilverPrice, 10000)
        return () => clearInterval(interval)
    }, [])

    const handleQuantityChange = (index, newQty) => {
        const updated = [...coinList]
        updated[index].quantity = Number(newQty)
        setCoinList(updated)
    }

    const totalFineSilverGrams = coinList.reduce((sum, coin) => {
        return sum + coin.purity * coin.weight * coin.quantity
    }, 0)

    const totalFineSilverOunces = totalFineSilverGrams / 31.1035
    const totalValue = silverPrice ? totalFineSilverOunces * silverPrice : 0

    return (
        <div className="container">
            {error ? (
                <p className="error">{error}</p>
            ) : silverPrice ? (
                <>
                    <div className="header-row">
                        <img
                            src="/smeltwaarde_logo_transparent_bgfill.png"
                            alt="Smeltwaarde Logo"
                            className="logo"
                        />
                        <div className="header-text">
                            <h1>Silver munt waarde</h1>
                            <p className="price">Huidige koers: R {silverPrice.toFixed(2)}/ozt</p>
                            <p className="timestamp">{localTime}</p>
                        </div>
                    </div>

                    <table>
                        <colgroup>
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '13%' }} />
                            <col style={{ width: '18%' }} />
                            <col style={{ width: '17%' }} />
                        </colgroup>
                        <thead>
                        <tr>
                            <th>Munt</th>
                            <th>Era</th>
                            <th>Fynheid</th>
                            <th>Gewig (g)</th>
                            <th>Hoeveelheid</th>
                            <th>Fyn silver (g)</th>
                            <th>Waarde (R)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {coinList.map((coin, index) => {
                            const fineSilverGrams = coin.purity * coin.weight * coin.quantity
                            const fineSilverOunces = fineSilverGrams / 31.1035
                            const value = silverPrice * fineSilverOunces
                            return (
                                <tr key={index} className={`row-${coin.era.replace(/[^a-z0-9]/gi, '')}`}>
                                    <td>{coin.name}</td>
                                    <td>{coin.era}</td>
                                    <td>{coin.purity}</td>
                                    <td>{coin.weight}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            value={coin.quantity}
                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            style={{ width: '60px' }}
                                        />
                                    </td>
                                    <td>{fineSilverGrams.toFixed(2)}</td>
                                    <td>{value.toFixed(2)}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>

                    <div className="totals-row">
                        <h2>🪙 Totaal fyn silver: {totalFineSilverGrams.toFixed(2)}g</h2>
                        <h2>💰 Totale waarde: R {totalValue.toFixed(2)}</h2>
                    </div>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    )
}

export default App