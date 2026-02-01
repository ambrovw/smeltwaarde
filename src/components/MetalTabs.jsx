import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SilverCalculator from './SilverCalculator.jsx'
import GoldCalculator from './GoldCalculator.jsx'
import '../styles/components/Tabs.css'

function MetalTabs({ initialTab }) {
    const [searchParams] = useSearchParams()
    const fromQuery = searchParams.get('tab') === 'gold' ? 'gold' : 'silver'
    const initial = initialTab === 'gold' ? 'gold' : fromQuery
    const [active, setActive] = useState(initial)

    // Update active when route/query or initialTab prop changes
    useEffect(() => {
        const next = initialTab === 'gold' ? 'gold' : (searchParams.get('tab') === 'gold' ? 'gold' : 'silver')
        setActive(next)
    }, [initialTab, searchParams])

    return (
        <div>
            <div className="tabs">
                <button
                    className={`tab ${active === 'silver' ? 'tab--active' : ''}`}
                    onClick={() => setActive('silver')}
                >
                    Silver
                </button>
                <button
                    className={`tab ${active === 'gold' ? 'tab--active' : ''}`}
                    onClick={() => setActive('gold')}
                >
                    Goud
                </button>
            </div>

            <div className="tab-content">
                {active === 'silver' ? <SilverCalculator /> : <GoldCalculator />}
            </div>
        </div>
    )
}

export default MetalTabs
