// CloudFront Function: viewer-request
// Routes requests to the correct language index file based on Host header.
// Also handles SPA routing (non-asset paths → index file).
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    var host = request.headers.host.value;
    var isEn = host === 'meltvalue.co.za';

    // Root or index requests → correct language file
    if (uri === '/' || uri === '/index.html' || uri === '/index-en.html') {
        request.uri = isEn ? '/index-en.html' : '/index.html';
        return request;
    }

    // Static assets (have a file extension) → pass through
    if (/\.\w+$/.test(uri)) {
        return request;
    }

    // SPA route → serve correct language index
    request.uri = isEn ? '/index-en.html' : '/index.html';
    return request;
}
