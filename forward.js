'use strict';

//
// Load in every server flavor, so all server tests have the same initial memory
// consumption.
//
var https = require('https')
  , http = require('http')
  , spdy = require('spdy');

//
// Select the server based on the flavor env variable.
//
//     FLAVOR=spdy node index.js    # Start a spdy server.
//     FLAVOR=https node index.js   # Start a https server.
//     FLAVOR=http node index.js    # Start a regular server.
//     node index.js                # Also starts a regular server.
//
var flavor = (process.env.FLAVOR || 'http').toLowerCase()
  , secure = !!~flavor.indexOf('s')
  , server = flavor === 'spdy' ? spdy : (flavor === 'https' ? https : http);

//
// Initialize the SSL
//
var fs = require('fs')
  , options = {
        cert: fs.readFileSync(__dirname +'/ssl/server.crt', 'utf8')
      , key: fs.readFileSync(__dirname +'/ssl/server.key', 'utf8')
    };

//
// Setup the HTTP proxy
//
var Proxy = require('http-proxy').HttpProxy
  , forward = new Proxy({
        target: { host: 'localhost', port: 8080 }
      , maxSockets: 32000
    })
  , server = !secure
    ? server.createServer(regular)
    : server.createServer(options, regular);

server.on('upgrade', upgrade);

/**
 * Proxy regular HTTP.
 *
 * @param {Request} req HTTP request
 * @param {Response} res HTTP response
 * @api private
 */
function regular(req, res) {
  forward.proxyRequest(req, res);
}

/**
 * Proxy upgrade requests.
 *
 * @param {Request} req HTTP request
 * @param {Socket} res Socket
 * @param {Buffer} head Buffered head.
 * @api private
 */
function upgrade(req, res, head) {
  forward.proxyWebSocketRequest(req, res, head);
}

//
// Everything is configured, listen
//
server.listen(8081, function listening(err) {
  if (!err) return console.log('BalancerBattleProxy (flavor: %s) is listening on port 8081', flavor);

  console.error('Failed to listen on port 8081, due to reasons');
  console.error('  - '+ err.message);
  process.exit(1);
});
