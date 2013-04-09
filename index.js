//
// Load in every server flavor, so all server tests have the same initial memory
// consumption.
//
var WebSocketServer = require('ws').Server
  , https = require('https')
  , http = require('http')
  , spdy = require('spdy');

//
// Cluster all the things.
//
var workers = +process.argv[3] || require('os').cpus().length
  , cluster = require('cluster')
  , master = cluster.isMaster;

if (master && workers > 1) {
  console.log('Starting with %d worker processes', workers);

  while (workers--) {
    cluster.fork();
  }

} else {

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
// Setup the WebSocket server.
//
var app = new WebSocketServer({
  server: !secure
  ? server.createServer(fourohfour)
  : server.createServer(options, fourohfour)
});

/**
 * Handle plain HTTP requests, we are only interested in HTTP requests.
 *
 * @param {Request} req HTTP request
 * @param {Response} res HTTP response
 * @api private
 */
function fourohfour(req, res) {
  res.statusCode = 404;
  res.end('ENOTFOUNDNUBCAKE');
}

//
// Start listening to WebSocket requests and send a message once in a while.
//
var connections = 0
  , disconnection = 0
  , messages = 0
  , failures = 0
  , send = 0;

app.on('connection', function connection(socket) {
  ++connections;

  if (connections % 100 === 0) {
    console.log('Received %d connections', connections);
  }

  socket.on('message', function message(data) {
    ++messages;

    if (messages % 100 === 0) {
      console.log(' - Received %d messages', messages);
    }

    socket.send(data, function sending(err) {
      send++;
      if (!err) return;

      ++failures;
      console.error('Error: Failed to send due to reasons: ', err.message);
    });
  });

  socket.on('error', function fucked(err) {
    console.error('Error: Failure on the socket', err.message);
  });

  socket.on('close', function close() {
    ++disconnection;
  });
});

//
// Output some server information.
//
function stats() {
  console.log('');
  console.log('Statistics:');
  console.log('  - Connections established %d', connections);
  console.log('  - Connections disconnected %d', disconnection);
  console.log('  - Messages received %d', messages);
  console.log('  - Messages send %d', send);
  console.log('  - Messages failed %d', failures);
  console.log('');
}

process.once('exit', stats);
process.once('SIGINT', process.exit);

//
// Everything is configured, listen
//
var port = +process.argv[2] || 8080
  , backlog = 3000;

app._server.listen(port, backlog, function listening(err) {
  if (!err) {
    return console.log(
      'BalancerBattleApp (flavor: %s) is listening on port %d', flavor, port
    );
  }

  console.error('Failed to listen on port 8080, due to reasons');
  console.error('  - '+ err.message);
  process.exit(1);
});
}
