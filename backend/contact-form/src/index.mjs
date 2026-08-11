const MAX = { naam: 100, epos: 200, boodskap: 3000, selnommer: 30 };

const respond = (statusCode, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});

// Per-container rate limits; with reserved concurrency 2 this caps
// total throughput to a trickle no matter the attack volume.
// Event pings (Deel/Verkoop clicks) get a higher budget than form posts.
const LIMITS = {
    vorm: { windowMs: 60_000, max: 3, start: 0, count: 0 },
    event: { windowMs: 60_000, max: 20, start: 0, count: 0 },
};

const overLimit = (limit, now) => {
    if (now - limit.start > limit.windowMs) {
        limit.start = now;
        limit.count = 0;
    }
    return ++limit.count > limit.max;
};

const postDiscord = async (webhook, content) => {
    if (!webhook) return;
    try {
        await fetch(webhook, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ content: content.slice(0, 1900) }),
        });
    } catch {
        // best effort
    }
};

const handleEvent = async (data, event, now) => {
    if (overLimit(LIMITS.event, now)) {
        return respond(429, { ok: false, error: 'too many requests' });
    }
    const aksie = data.aksie === 'verkoop' ? 'Verkoop' : 'Deel';
    const metaal = String(data.metaal || '?').slice(0, 20);
    const totaal = Number(data.totaal) || 0;
    const soorte = Number(data.soorte) || 0;
    const stuks = Number(data.stuks) || 0;
    const url = String(data.url || '').slice(0, 500);
    const taal = String(data.taal || '?').slice(0, 5);
    const host = String(data.host || '?').slice(0, 50);
    const ua = event.requestContext?.http?.userAgent || '?';
    const ip = event.requestContext?.http?.sourceIp || '?';

    // Rough location from IP; best effort, never holds up the ping for long
    let ligging = '';
    try {
        const res = await fetch(`https://ipwho.is/${ip}`, { signal: AbortSignal.timeout(1500) });
        const geo = await res.json();
        if (geo && geo.success) {
            ligging = ` · ${[geo.city, geo.country].filter(Boolean).join(', ')}`;
        }
    } catch {
        // geo lookup is optional
    }

    const ikoon = aksie === 'Verkoop' ? '💰' : '🔗';
    await postDiscord(process.env.DISCORD_WEBHOOK, [
        `${ikoon} **${aksie}** geklik — ${metaal}, R${totaal.toLocaleString('en-ZA')}`,
        `Munte: ${soorte} soorte, ${stuks} stuks`,
        url ? `Skakel: ${url}` : null,
        `Blad: ${host} (${taal}) · IP: ${ip}${ligging}`,
        `Toestel: ${ua.slice(0, 120)}`,
    ].filter((line) => line !== null).join('\n'));

    return respond(200, { ok: true });
};

export const handler = async (event) => {
    const now = Date.now();

    let data;
    try {
        data = JSON.parse(event.body || '{}');
    } catch {
        return respond(400, { ok: false, error: 'invalid json' });
    }

    if (data.tipe === 'event') return handleEvent(data, event, now);

    if (overLimit(LIMITS.vorm, now)) {
        return respond(429, { ok: false, error: 'too many requests' });
    }

    // Honeypot: real users never fill this hidden field
    if (data.webwerf) return respond(200, { ok: true });

    // Bots submit instantly; humans need at least a few seconds to fill a form.
    // `began` is set by the form when it renders. Fake success to avoid tipping off bots.
    const began = Number(data.began);
    if (!Number.isFinite(began) || now - began < 3000) {
        return respond(200, { ok: true });
    }

    const naam = (data.naam || '').trim().slice(0, MAX.naam);
    const epos = (data.epos || '').trim().slice(0, MAX.epos);
    const boodskap = (data.boodskap || '').trim().slice(0, MAX.boodskap);
    const selnommer = (data.selnommer || '').trim().slice(0, MAX.selnommer);
    const kontakMetode = data.kontakMetode === 'bel' ? 'Bel' : 'WhatsApp';

    if (!naam || !boodskap || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epos)) {
        return respond(400, { ok: false, error: 'missing or invalid fields' });
    }

    await postDiscord(process.env.DISCORD_WEBHOOK_NAVRAE, [
        `📥 **Koop/Verkoop navraag van ${naam}**`,
        `E-pos: ${epos}`,
        selnommer ? `Selnommer: ${selnommer} (verkies ${kontakMetode})` : null,
        '',
        boodskap,
    ].filter((line) => line !== null).join('\n'));

    return respond(200, { ok: true });
};
