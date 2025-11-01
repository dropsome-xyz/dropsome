export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const isWs = path.startsWith('/api/rpc-ws/');
    const isHttp = path.startsWith('/api/rpc/');

    const endpoint = env.RPC_URL;
    if (!endpoint) {
      return new Response(JSON.stringify({ error: 'RPC_URL not configured' }), { status: 500 });
    }

    if (isWs) {
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket', { status: 400 });
      }

      const targetUrl = endpoint.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');

      const wsPair = new WebSocketPair();
      const [client, server] = Object.values(wsPair);

      server.accept();

      const targetSocket = new WebSocket(targetUrl);
      let hasClosed = false;

      const messageQueue = [];

      const closeBoth = (code, reason, err) => {
        if (hasClosed) return;
        hasClosed = true;
        if (err) console.error('WS close error:', err);

        try { server.close(code, reason); } catch (e) { }
        try { targetSocket.close(code, reason); } catch (e) { }
      };

      targetSocket.addEventListener('open', () => {
        while (messageQueue.length > 0 && targetSocket.readyState === WebSocket.OPEN) {
          const msg = messageQueue.shift();
          targetSocket.send(msg);
        }
      });

      targetSocket.addEventListener('message', (event) => {
        try {
          if (server.readyState === WebSocket.OPEN) {
            server.send(event.data);
          }
        } catch (e) {
          closeBoth(1011, 'Proxy error client send', e);
        }
      });

      targetSocket.addEventListener('close', (e) => closeBoth(e.code, e.reason));
      targetSocket.addEventListener('error', (e) => closeBoth(1011, 'Upstream error', e));

      server.addEventListener('message', (event) => {
        try {
          if (targetSocket.readyState === WebSocket.OPEN) {
            targetSocket.send(event.data);
          } else if (targetSocket.readyState === WebSocket.CONNECTING) {
            messageQueue.push(event.data);
          } else {
            closeBoth(1011, 'Upstream not open');
          }
        } catch (e) {
          closeBoth(1011, 'Proxy error upstream send', e);
        }
      });

      server.addEventListener('close', (e) => closeBoth(e.code, e.reason));
      server.addEventListener('error', (e) => closeBoth(1011, 'Client error', e));

      const heartbeat = setInterval(() => {
        if (hasClosed) {
          clearInterval(heartbeat);
          return;
        }
        if (server.readyState !== WebSocket.OPEN ||
          (targetSocket.readyState !== WebSocket.OPEN && targetSocket.readyState !== WebSocket.CONNECTING)) {
          closeBoth(1006, "Heartbeat failure");
        }
      }, 10000);

      return new Response(null, { status: 101, webSocket: client });
    }

    if (isHttp) {
      const response = await fetch(endpoint, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      return new Response(response.body, { status: response.status, headers: response.headers });
    }

    return new Response('Not found', { status: 404 });
  },
};
