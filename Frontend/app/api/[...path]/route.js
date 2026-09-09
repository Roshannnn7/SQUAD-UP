export async function GET(request, { params }) {
    return handle(request, params);
}

export async function POST(request, { params }) {
    return handle(request, params);
}

export async function PUT(request, { params }) {
    return handle(request, params);
}

export async function PATCH(request, { params }) {
    return handle(request, params);
}

export async function DELETE(request, { params }) {
    return handle(request, params);
}

async function handle(request, params) {
    try {
        const rawBackend = (process.env.BACKEND_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
        const pathSegments = Array.isArray(params?.path) ? params.path : [];
        const path = pathSegments.join('/');

        // Ensure Express backend receives /api/* prefix correctly
        let targetPath = '';
        if (rawBackend.endsWith('/api')) {
            targetPath = `/${path}`;
        } else if (path.startsWith('api/') || path === 'api') {
            targetPath = `/${path}`;
        } else {
            targetPath = `/api/${path}`;
        }

        // Preserve all query parameters (e.g. ?unread=true, ?page=1)
        const requestUrl = new URL(request.url);
        const search = requestUrl.search || '';
        const fullTargetUrl = `${rawBackend}${targetPath}${search}`.replace(/([^:]\/)\/+/g, '$1');

        const headers = new Headers();
        // Forward essential request headers
        for (const [key, value] of request.headers.entries()) {
            const lower = key.toLowerCase();
            if (!['host', 'connection', 'content-length'].includes(lower)) {
                headers.set(key, value);
            }
        }

        // Forward body for mutating HTTP methods
        let body = undefined;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            body = await request.arrayBuffer();
        }

        const resp = await fetch(fullTargetUrl, {
            method: request.method,
            headers,
            body,
            redirect: 'follow',
        });

        const contentTypeResp = resp.headers.get('content-type') || '';
        const data = contentTypeResp.includes('application/json')
            ? await resp.json()
            : await resp.text();

        const responseHeaders = new Headers();
        responseHeaders.set('content-type', contentTypeResp || 'application/json');

        // Forward set-cookie if returned by backend
        const setCookie = resp.headers.get('set-cookie');
        if (setCookie) {
            responseHeaders.set('set-cookie', setCookie);
        }

        return new Response(
            typeof data === 'string' ? data : JSON.stringify(data),
            {
                status: resp.status,
                headers: responseHeaders,
            }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: 'Proxy error', details: err?.message || String(err) }),
            { status: 500, headers: { 'content-type': 'application/json' } }
        );
    }
}
