var restify   = require('restify');
var origin    = require('./origin');

//
// For now we use the "default headers" from restify.CORS
// Maybe this should just be a global setting on this module
// (ie. list of extra Access-Control-Expose-Headers, regardless of what the middleware config says)
//

//
// TODO:
// Handle the spec better around "simple methods" and "simple headers".
//

var DEFAULT_ALLOW_HEADERS = restify.CORS.ALLOW_HEADERS;
var HTTP_NO_CONTENT = 204;

exports.handler = function(options) {

  //
  // If origins = ['*'] then we always set generic CORS headers
  // This is the simplest case, similar to what restify.fullResponse() used to do
  // Must must keep the headers generic because they can be cached by reverse proxies
  //

  if (origin.generic(options.origins)) {

    return function(req, res, next) {
      if (req.method !== 'OPTIONS') return next();

      res.once('header', function() {
        var allowedHeaders = DEFAULT_ALLOW_HEADERS.concat(['x-requested-with'])
                                                  .concat(options.allowHeaders);
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', false); // not compatible with *
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      });

      res.send(HTTP_NO_CONTENT);
    };

  }

  //
  // This is the "better" option where we have a list of origins
  // In this case, we return customised CORS headers for each request
  // And must set the "Vary: Origin" header
  //

  return function(req, res, next) {
    if (req.method !== 'OPTIONS') return next();

    // 6.2.1 and 6.2.2
    originHeader = req.headers['origin'];
    if (origin.allowed(options.origins || [], originHeader) === false) return next();

    // 6.2.3
    requestedMethod = req.headers['access-control-request-method'];
    if (!requestedMethod) return next();
    allowedMethods = [requestedMethod, 'OPTIONS'];

    // 6.2.4
    allowedHeaders = DEFAULT_ALLOW_HEADERS.concat(['x-requested-with'])
                                          .concat(options.allowHeaders);

    res.once('header', function() {

      // 6.2.7
      res.header('Access-Control-Allow-Origin', originHeader);
      res.header('Access-Control-Allow-Credentials', true);

      // 6.2.9
      res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));

      // 6.2.10
      res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));

      // 6.4
      res.header('Vary', 'Origin');
    });

    res.send(HTTP_NO_CONTENT);
  };

};

