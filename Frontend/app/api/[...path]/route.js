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
        const backendBase = process.env.BACKEND_URL || 'http://localhost:5000';
        const path = Array.isArray(params?.path) ? params.path.join('/') : '';
        const url = `${backendBase}/${path}`.replace(/\/{2,}/g, '/').replace('https:/', 'https://').replace('http:/', 'http://');

        const headers = new Headers();
        // Forward content-type and authorization if present
        const reqHeaders = request.headers;
        const contentType = reqHeaders.get('content-type');
        const authorization = reqHeaders.get('authorization');
        if (contentType) headers.set('content-type', contentType);
        if (authorization) headers.set('authorization', authorization);

        // Forward body for non-GET methods
        let body = undefined;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            body = await request.arrayBuffer();
        }

        const resp = await fetch(url, {
            method: request.method,
            headers,
            body,
            redirect: 'follow',
        });

        const contentTypeResp = resp.headers.get('content-type') || '';
        const data = contentTypeResp.includes('application/json')
            ? await resp.json()
            : await resp.text();

        const responseInit = {
            status: resp.status,
            headers: {
                'content-type': contentTypeResp || 'application/json',
            },
        };

        return new Response(
            typeof data === 'string' ? data : JSON.stringify(data),
            responseInit
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: 'Proxy error', details: err?.message || String(err) }),
            { status: 500, headers: { 'content-type': 'application/json' } }
        );
    }
}
