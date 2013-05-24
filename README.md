# BalancerBattle

BalancerBattle was a load test against load balancers / proxies that support
WebSockets. These pieces of technology  are vital if you want to scale to
multiple servers or processes.

The following technologies were tested:

- [http-proxy](http://github.com/nodejitsu/node-http-proxy/), version: 0.10.0
- [nginx](http://nginx.org/), version: 1.3.15 (development release)
- [HAProxy](http://haproxy.1wt.eu/), version: 1.5-dev18 (development release)
- Nothing, just the plain echo server that was used as a control test.

There have been some questions about including
[hipache](https://github.com/dotcloud/hipache). The reason that I have not
included them in my tests is because it's build upon the
[http-proxy](https://github.com/dotcloud/hipache/blob/master/package.json#L18-L23).
They are currently using a fork of the project but it doesn't contain any
performance related patches.

3 different, separate servers were used for testing. All these servers are
hosted at [joyent](http://joyent.com).

1.  Proxy, a 512mb Ubuntu server. This is the server were all the proxy servers
    are installed. **image:** sdc:jpc:ubuntu-12.04:2.4.0
2.  WebSocketServer, a 512mb Node.js smart machine that ran our WebSocket echo
    server. The server is written in Node.js and spread across multiple cores
    using the `cluster` module. **image:** sdc:sdc:nodejs:1.4.0
3.  Thor, another 512mb Node.js smart machine with the same specs as above. This
    was the server were we generated the load from. Thor is a WebSocket load
    generation tool which we've developed. It's released as open source and
    available at http://github.com/observing/thor

## Configuring the Proxy server

The Proxy server was just a clean, bare bones Ubuntu 12.04 server. These are the
steps that were taken to configure and install all the dependencies. To ensure
that everything is up to date we have to run.

```
apt-get upgrade
```

The following dependencies were installed on the system:

- `git` for access to the github repositories.
- `build-essential` for compiling the proxies for source, most of the proxies
  recently got support for WebSockets or HTTPS.
- `libssl-dev` Needed for HTTPS support.
- `libev-dev` Libev required for stud, stud is awesomesss.

```
apt-get install git build-essential libssl-dev libev-dev
```

### Node.js

Node.js is required for the `http-proxy`. While it runs on the latest Node.js
version for these tests were executed under `0.8.19` to ensure compatibility of
all dependencies. It was installed through github.

```
git clone git://github.com/joyent/node.git
cd node
git checkout v0.8.19
./configure
make
make install
```

This also installed the `npm` binary on the system so we can install the
dependencies of this project. Run `npm install .` in the root of this repository
and the `http-proxy` and all it's dependencies are installed automatically.

### Nginx

Nginx is already a widely deployed server. It supports proxing of to different
back end servers but it did not support WebSockets. This got recently added in to
the development branch of Nginx. There for we installed the latest development
version and compiled from source:

**Please note that since writing and testing this, nginx 1.4.0 was shipped and
has support for WebSockets. So if you are reading this and want to deploy in
production I would advice you to use 1.4.0 instead of the development builds**

```
wget http://nginx.org/download/nginx-1.3.15.tar.gz
tar xzvf nginx-1.3.15.tar.gz
cd nginx-1.3.15
./configure --with-http_spdy_module --with-http_ssl_module \
--pid-path=/var/run/nginx.pid --conf-path=/etc/nginx/nginx.conf \
--sbin-path=/usr/local/sbin --http-log-path=/var/log/nginx/access.log \
--error-log-path=/var/log/nginx/error.log --without-http_rewrite_module
```

As you can from the options above we've included SSL, SPDY and configured some
other settings. This yielded the following configuration summary:

```
Configuration summary
  + PCRE library is not used
  + using system OpenSSL library
  + md5: using OpenSSL library
  + sha1: using OpenSSL library
  + using system zlib library

  nginx path prefix: "/usr/local/nginx"
  nginx binary file: "/usr/local/sbin"
  nginx configuration prefix: "/etc/nginx"
  nginx configuration file: "/etc/nginx/nginx.conf"
  nginx pid file: "/var/run/nginx.pid"
  nginx error log file: "/var/log/nginx/error.log"
  nginx http access log file: "/var/log/nginx/access.log"
  nginx http client request body temporary files: "client_body_temp"
  nginx http proxy temporary files: "proxy_temp"
  nginx http fastcgi temporary files: "fastcgi_temp"
  nginx http uwsgi temporary files: "uwsgi_temp"
  nginx http scgi temporary files: "scgi_temp"
```

After this it's just a simple make away:

```
make
make install
```

### HAProxy

HAProxy was already able to proxy WebSockets in `tcp mode` but it's now also
possible to do so in `http mode`. HAProxy also got support for `HTTPS`
termination. So again, we need to install the development branch.

```
wget http://haproxy.1wt.eu/download/1.5/src/devel/haproxy-1.5-dev18.tar.gz
tar xzvf haproxy-1.5-dev18.tar.gz
cd haproxy-1.5-dev18
make TARGET=linux26 USE_OPENSSL=1
make install
```

### Stud

While HAProxy is capable of terminating SSL it's common practise to have stud
in front of HAProxy for SSL offloading. So this is something we want to test as
well.

```
git clone git://github.com/bumptech/stud.git
cd stud
make
make install
```

Now that everything is installed we need to install the configuration files. For
Nginx you can copy & paste the `nginx.conf` from the root of this repository to
`/etct/nginx/nginx.conf`. All the other proxies can be configured on the fly.

## Kernel tuning

After all the proxies are installed we need to do some socket tuning. This
information was generously stolen from the internet:

```
vim /etc/sysctl.conf
```

And set the following values.

```
# General gigabit tuning:
net.core.somaxconn = 16384
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.tcp_syncookies = 1
# this gives the kernel more memory for tcp
# which you need with many (100k+) open socket connections
net.ipv4.tcp_mem = 50576   64768   98152
net.core.netdev_max_backlog = 2500
```

## Benchmarking

There are 2 different tests executed:

1.  Load testing the proxies without SSL. This will purely test the performance
    of WebSocket proxing.
2.  Load testing the proxies **with** SSL. Nobody should be running unsecured
    WebSockets as they have really bad connectivity in browsers. But this adds
    overhead of SSL termination to the proxy.

In addition to different tests we're also testing the different amount of
connections:

- 2k
- 5k
- 10k

And for the equal results:

- 20k
- 30k

Before each test all WebSocketServer is reset and the Proxy re-initiated. Thor
will hammer all the Proxy server with `x` amount of connection with a
`concurrency` of 100. For each established connection one single UTF-8 message
is send and received. After the message is received the connection is closed.

## Running

#### Stud
```
stud --config stud.conf
```

#### HAProxy
```
haproxy -f ./haproxy.cfg
```

#### Nginx
```
nginx
```

#### http-proxy
```
FLAVOR=http node http-proxy.js
```

#### WebSocketServer
```
FLAVOR=http node index.js
```

## Results

The `http-proxy` lives up to it's name, it proxies requests and does it quite
fast. But as it's build on top of Node.js it quite heavy on the memory. Just a
simple node process starts with a 12MB of memory. For the 10K requests it took
around `70mb` of memory. The overhead was of the HTTP proxy was about 5 seconds
if you compare it to control test. The HTTPS test was the slowest of all, but
that was expected as Node.js sucks hairy monkey balls in SSL. Not to mention
that will put your event loop to a grinding halt when it's under severe stress.

There is a [pull request](https://github.com/nodejitsu/node-http-proxy/pull/370)
for the `http-proxy` that will drastically reduce memory consumption. I've
manually applied the patch and saw the memory consumption get cut in half. It's
still using a lot more compared to Nginx after this patch that can easily be
explained because they are all build in pure C.

I had high hopes for Nginx and it did not let me down. It had a peak memory of
10MB and it was really fast. The first time I tested Nginx, it had a horrible
performance. Node was even faster in SSL then Nginx, I felt like failure, I
genuinely sucked a configuring Nginx. But after some quick tips from some
friends it was actually a one line change in the config. I had the wrong
`ciphers` configured. After some quick tweaking and a confirmation using
`openssl s_client -connect server:ip` it was all good and used `RC4` by default
which is really fast.

Up next was HAProxy, it has the same performance profile as NGINX, but lower on
the memory it only required 7MB of memory. ~~The biggest difference was when we
tested with HTTPS. It's was really slow and no where near the performance of
Nginx. Hopefully this will be resolved as it's a development branch we are
testing.~~ Made the same mistake as I did with Nginx, configured the wrong
ciphers which was kindly pointed out on
[HackerNews](https://news.ycombinator.com/item?id=5517258). In addition to
testing HTTPS we also put `stud` in front of it to see what kind of performance
it would yield.

## Conclusions

`http-proxy` it's a great flexible proxy, really easy to extend and build up on.
If you deploy this in production I advice to run `stud` in front of it to take
care of the SSL offloading.

`nginx` and `haproxy` were really close, it's almost not significant enough to
say that one is faster or better then the other. But if you look at it from an
operations stand point. It's easier to deploy and manage a single `nginx` server
instead of `stud` and `haproxy`

### HTTP

Proxy          | Connections | Handshaken (mean) | Latency (mean) | Total
---------------|-------------|-------------------|----------------|----------------
http-proxy     | 10k         | 293 ms            | 44 ms          | 30168 ms
nginx          | 10k         | 252 ms            | 16 ms          | 28433 ms
haproxy        | 10k         | 209 ms            | 18 ms          | 26974 ms
control        | 10k         | 189 ms            | 16 ms          | 25310 ms

**Winner**: Both Nginx and HAProxy are really fast and close to each other.

### HTTPS

Proxy          | Connections | Handshaken (mean) | Latency (mean) | Total
---------------|-------------|-------------------|----------------|----------------
http-proxy     | 10k         | 679 ms            | 62 ms          | 68670 ms
nginx          | 10k         | 470 ms            | 30 ms          | 50180 ms
haproxy        | 10k         | 464 ms            | 25 ms          | 50058 ms
haproxy + stud | 10k         | 492 ms            | 42 ms          | 52403 ms
control        | 10k         | 703 ms            | 65 ms          | 71500 ms

**Winner**: Both Nginx and HAProxy are really fast and close to each other.

All test results are available at:

https://github.com/observing/balancerbattle/tree/master/results

#### Notes

- The performance of the `http-proxy` can vary based on your platform. On Debian
  distributions it's know to add a 200ms latency on top of it. See [305] & [314]
- NGINX has released 1.4 which contains WebSocket support by default. There are
  no major changes made between 1.4 and the version that is tested here so these
  results are valid for the 1.4 release as well.

[305]: https://github.com/nodejitsu/node-http-proxy/issues/305
[314]: https://github.com/nodejitsu/node-http-proxy/issues/314

## Contributions

All the configuration are in the repository, I'm more then happy to see if we
can squeeze more performance out of the servers.
