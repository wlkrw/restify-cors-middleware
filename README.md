# restify-cors-middleware

> CORS middleware with full [W3C spec](www.w3.org/TR/cors) support.

## Usage

```js
var corsMiddleware = require('restify-cors-middleware');

var cors = corsMiddleware({
  origins: ['http://api.myapp.com', 'http://web.myapp.com'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
});

server.pre(cors.preflight);
server.use(cors.actual);
```

## Allowed origins

If you understand the security implication, you can choose to return `Access-Control-Allow-Origin: *` with every response, regardless of the origin.

```js
origins: ['*']
```

For better control, you should specify which origins are allowed specifically.

```js
origins: [
  'http://myapp.com',
  'http://*.myotherapp.com'
]
```

In this case, it will only set CORS headers when applicable. The `Access-Control-Allow-Origin` header will be set to the actual origin that matched, on a per-request basis. The person making the request will not know about the full configuration, like other allowed domains or any wildcards in use.

## Performance vs security

Specifying a list of allowed origins is the safest option. However depending on your setup you might notice a hit in performance, since any reverse proxies will have to vary their cache depending on the request `Origin`.

## Compliance to the spec

See [unit tests](https://github.com/TabDigital/restify-cors-middleware/tree/master/test) for examples of preflight and actual requests.
