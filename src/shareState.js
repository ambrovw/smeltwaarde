// Encode/decode calculator state (coin quantities + premium) for shareable URLs.
// Format: ?deel=<gi>-<ci>-<qty>_<gi>-<ci>-<qty>&premie=<pct>
// gi/ci are group/coin indexes into the coin data module.

export function encodeShareState(coinList, adjustmentInput) {
    const parts = [];
    Object.values(coinList).forEach((coins, gi) => {
        coins.forEach((coin, ci) => {
            const qty = Number(coin.quantity) || 0;
            if (qty > 0) parts.push(`${gi}-${ci}-${qty}`);
        });
    });
    if (parts.length === 0) return null;
    const params = new URLSearchParams();
    params.set('deel', parts.join('_'));
    const adj = Number(adjustmentInput) || 0;
    if (adj !== 0) params.set('premie', String(adj));
    return params;
}

export function decodeShareState(search, initializedGroups) {
    try {
        const params = new URLSearchParams(search);
        const deel = params.get('deel');
        if (!deel) return null;
        const coinList = Object.fromEntries(
            Object.entries(initializedGroups).map(([label, coins]) => [
                label,
                coins.map((coin) => ({ ...coin }))
            ])
        );
        const groups = Object.values(coinList);
        let found = false;
        for (const part of deel.split('_')) {
            const [gi, ci, qty] = part.split('-').map(Number);
            const coin = groups[gi] && groups[gi][ci];
            if (coin && Number.isFinite(qty) && qty > 0) {
                coin.quantity = qty;
                found = true;
            }
        }
        if (!found) return null;
        const adj = parseFloat(params.get('premie'));
        return {
            coinList,
            adjustmentInput: Number.isFinite(adj) ? String(adj) : '0'
        };
    } catch {
        return null;
    }
}
