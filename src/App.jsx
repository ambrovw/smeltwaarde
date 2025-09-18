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

                if (item && item.xagPrice) {
                    setSilverPrice(item.xagPrice)

                    const utcTimestamp = data.tsj
                    const localDate = new Date(utcTimestamp)
                    const formatted = localDate.toLocaleString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    })
                    setLocalTime(formatted)
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
            <h1>Silver Munt Waarde</h1>
            {error ? (
                <p className="error">{error}</p>
            ) : silverPrice ? (
                <>
                    <p className="price">Koers: R {silverPrice.toFixed(2)}/ozt</p>
                    <p className="timestamp">{localTime}</p>

                    <table>
                        <thead>
                        <tr>
                            <th>Munt</th>
                            <th>Era</th>
                            <th>Fynheid</th>
                            <th>Gewig (g)</th>
                            <th>Hoeveelheid</th>
                            <th>Fyn Silver (oz)</th>
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
                                    <td>{fineSilverOunces.toFixed(3)}</td>
                                    <td>{value.toFixed(2)}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>

                    <h2>Totaal Fyn Silver: {totalFineSilverOunces.toFixed(3)} oz</h2>
                    <h2>Totale Waarde: R {totalValue.toFixed(2)}</h2>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    )
}

export default App