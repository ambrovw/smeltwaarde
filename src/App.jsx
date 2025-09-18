import { useEffect, useState } from 'react'
import './App.css'

function App() {
    const [silverPrice, setSilverPrice] = useState(null)
    const [localTime, setLocalTime] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchSilverPrice() {
            try {
                const response = await fetch('https://data-asg.goldprice.org/dbXRates/ZAR')
                const data = await response.json()

                const item = data.items?.[0]
                if (item && item.xagPrice) {
                    setSilverPrice(item.xagPrice.toFixed(2))

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

    return (
        <div className="container">
            <h1>Live Silver Price</h1>
            {error ? (
                <p className="error">{error}</p>
            ) : silverPrice ? (
                <>
                    <p className="price">R {silverPrice}</p>
                    <p className="timestamp">Last updated: {localTime}</p>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    )
}

export default App