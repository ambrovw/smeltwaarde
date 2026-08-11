// Backend endpoint (Lambda Function URL) for the contact form and Discord event pings.
export const CONTACT_ENDPOINT = 'https://nw4p7lq2hyrj2ja44bgtciope40arrlq.lambda-url.eu-west-1.on.aws/';

// Fire-and-forget Discord notification for a Deel/Verkoop click.
export function notifyEvent(aksie, metaal, coinList, totalValue, url) {
    const coins = Object.values(coinList).flat().filter((c) => (Number(c.quantity) || 0) > 0);
    const payload = {
        tipe: 'event',
        aksie,
        metaal,
        totaal: Math.round(totalValue),
        soorte: coins.length,
        stuks: coins.reduce((sum, c) => sum + Number(c.quantity), 0),
        url,
        taal: document.documentElement.lang || '?',
        host: window.location.hostname,
    };
    fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
    }).catch(() => {});
}
