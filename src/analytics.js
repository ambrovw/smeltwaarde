/**
 * Centralised Google Analytics (GA4) helpers.
 * All gtag calls go through here so event names and params stay consistent.
 */

export function trackEvent(eventName, params = {}) {
    if (window.gtag) {
        window.gtag('event', eventName, params);
    }
}

export function setUserProperty(name, value) {
    if (window.gtag) {
        window.gtag('set', 'user_properties', { [name]: value });
    }
}

export function trackPageView(path, title) {
    if (window.gtag) {
        window.gtag('event', 'page_view', {
            page_path: path,
            page_title: title,
        });
    }
}

export function trackError(errorType, detail) {
    trackEvent('price_fetch_error', {
        error_type: errorType,
        error_detail: detail,
    });
}

// Debounced quantity-change tracker.
// Groups rapid keystrokes into a single event per coin (1.5 s window).
const _timers = {};

export function trackQuantityChangeDebounced(coin, quantity, metal) {
    const key = `${metal}_${coin.name}_${coin.era}`;
    clearTimeout(_timers[key]);
    _timers[key] = setTimeout(() => {
        trackEvent('hoeveelheid_change', {
            coin_name: coin.name,
            coin_era: coin.era,
            metal,
            value: quantity === '' ? 0 : quantity,
        });
        delete _timers[key];
    }, 1500);
}
