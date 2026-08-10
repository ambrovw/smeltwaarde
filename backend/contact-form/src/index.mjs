import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const ses = new SESv2Client({ region: 'eu-west-1' });

const TO = 'admin@smeltwaarde.co.za';
const FROM = 'webvorm@smeltwaarde.co.za';
const MAX = { naam: 100, epos: 200, boodskap: 3000, selnommer: 30 };

const respond = (statusCode, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});

// Per-container rate limit; with reserved concurrency 2 this caps
// total throughput to a trickle no matter the attack volume.
const RATE = { windowMs: 60_000, max: 3 };
let windowStart = 0;
let windowCount = 0;

export const handler = async (event) => {
    const now = Date.now();
    if (now - windowStart > RATE.windowMs) {
        windowStart = now;
        windowCount = 0;
    }
    if (++windowCount > RATE.max) {
        return respond(429, { ok: false, error: 'too many requests' });
    }

    let data;
    try {
        data = JSON.parse(event.body || '{}');
    } catch {
        return respond(400, { ok: false, error: 'invalid json' });
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

    const selLine = selnommer ? `Selnommer: ${selnommer} (verkies ${kontakMetode})\n` : '';

    await ses.send(new SendEmailCommand({
        FromEmailAddress: FROM,
        Destination: { ToAddresses: [TO] },
        ReplyToAddresses: [epos],
        Content: {
            Simple: {
                Subject: { Data: `Koop/Verkoop navraag van ${naam}` },
                Body: {
                    Text: {
                        Data: `Naam: ${naam}\nE-pos: ${epos}\n${selLine}\n${boodskap}\n\n--\nGestuur vanaf die smeltwaarde.co.za koop/verkoop vorm.`,
                    },
                },
            },
        },
    }));

    return respond(200, { ok: true });
};
