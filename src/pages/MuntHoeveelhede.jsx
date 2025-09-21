import { useState } from 'react'
import { zarCoins, unionCoins, rsa1Coins, rsa2Coins } from '../muntHoeveelhedeData'
import '../App.css'

function MuntHoeveelhede() {
    const [collapsedEras, setCollapsedEras] = useState({
        ZAR: true,
        Union: true,
        RSA1: true,
        RSA2: true
    })

    const getOrderedDenominations = (coins) => {
        const seen = new Set()
        return coins
            .map(c => c.denomination)
            .filter(denom => {
                if (seen.has(denom)) return false
                seen.add(denom)
                return true
            })
    }

    const getCellStyle = (value) => {
        if (!value || value <= 0) return { backgroundColor: 'transparent' }

        const max = 120000
        const ratio = 1 - Math.sqrt(value) / Math.sqrt(max)
        const alpha = Math.max(0, Math.min(1, ratio)) * 0.8

        return {
            backgroundColor: `rgba(178, 158, 104, ${alpha})`
        }
    }

    const toggleEra = (eraKey) => {
        setCollapsedEras(prev => ({
            ...prev,
            [eraKey]: !prev[eraKey]
        }))
    }

    const buildMatrix = (coins) => {
        const years = [...new Set(coins.map(c => c.year))].sort()
        const denominations = getOrderedDenominations(coins)

        const matrix = years.map(year => {
            const row = { year }
            denominations.forEach(denom => {
                const total = coins
                    .filter(c => c.year === year && c.denomination === denom)
                    .reduce((sum, c) => sum + c.quantity, 0)
                row[denom] = total || ''
            })
            return row
        })

        return { years, denominations, matrix }
    }

    const renderMatrixTable = (coins) => {
        const { years, denominations, matrix } = buildMatrix(coins)

        return (
            <table>
                <thead>
                <tr>
                    <th>Jaar</th>
                    {denominations.map((denom, i) => (
                        <th key={i}>{denom}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {matrix.map((row, i) => (
                    <tr key={i}>
                        <td>{row.year}</td>
                        {denominations.map((denom, j) => (
                            <td key={j} className="dynamic-cell" style={getCellStyle(row[denom])}>
                                {row[denom] ? row[denom].toLocaleString('en-ZA') : ''}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        )
    }

    return (
        <div className="container">
            <h1>Munt Hoeveelhede</h1>
            <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#b0b0b0', marginTop: '-0.5rem', textAlign: 'center' }}>
                Bron:{' '}
                <a
                    href="https://en.numista.com/catalogue/south-africa-1.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#b0b0b0', textDecoration: 'underline' }}
                >
                    Numista, 2025
                </a>
            </p>

            <div className="era-section">
                <h2 className="era-header" onClick={() => toggleEra('ZAR')}>
                    {collapsedEras.ZAR ? '▸' : '▾'} ZAR 1892–1898
                </h2>
                {!collapsedEras.ZAR && renderMatrixTable(zarCoins)}
            </div>

            <div className="era-section">
                <h2 className="era-header" onClick={() => toggleEra('Union')}>
                    {collapsedEras.Union ? '▸' : '▾'} Suid Afrikaanse Unie (SAU) 1923–1960
                </h2>
                {!collapsedEras.Union && renderMatrixTable(unionCoins)}
            </div>

            <div className="era-section">
                <h2 className="era-header" onClick={() => toggleEra('RSA1')}>
                    {collapsedEras.RSA1 ? '▸' : '▾'} RSA Eerste Desimale Reeks 1961–1964
                </h2>
                {!collapsedEras.RSA1 && renderMatrixTable(rsa1Coins)}
            </div>

            <div className="era-section">
                <h2 className="era-header" onClick={() => toggleEra('RSA2')}>
                    {collapsedEras.RSA2 ? '▸' : '▾'} RSA Tweede Desimale Reeks 1964–1990
                </h2>
                {!collapsedEras.RSA2 && renderMatrixTable(rsa2Coins)}
            </div>
        </div>
    )
}

export default MuntHoeveelhede