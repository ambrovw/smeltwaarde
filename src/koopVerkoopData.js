// Buy/sell rate card. Rates are percentages relative to live melt value
// (smeltwaarde) as computed by the calculators: -15 = 15% below melt, +25 = 25% above.
// Category names/translations live in i18n/translations.js under the same keys.
export const categories = [
    { key: 'kv999', koop: 12.5, verkoop: 25 },
    { key: 'kvZar', koop: -5, verkoop: 7.5 },
    { key: 'kvR1', koop: -12.5, verkoop: 0 },
    { key: 'kvKrone', koop: -15, verkoop: -2.5 },
    { key: 'kvKleinmunt', koop: -15, verkoop: -2.5 },
    { key: 'kv50', koop: -20, verkoop: -7.5 },
    { key: 'kvSterling', koop: -15, verkoop: -2.5 },
    { key: 'kvBuitelands', koop: -25, verkoop: -12.5 },
    { key: 'kvSkroot', koop: -30, verkoop: -7.5 },
];
