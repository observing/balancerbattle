The tests were preformed against a Joyent Ubuntu 12.04 image with 512mb of
memory. This was a clean machine and the following steps were taken to configure
the machine and install it's dependencies:

All packages were updated before installation by running;

```
apt-get upgrade
```

After that the `git` binary was installed on the machine so we can access this
repository.

```
apt-get install build-essential
```

The `build-essential` was installed as it's required to build both `node` as
well as `nginx` from source. After the installation `node` was installed by
cloning the Github repository. The `v0.8.19` branch was installed as most
modules are not yet running stable under node's recent stable releases. I did
not want it to compromise the integrity of these tests.

```
git clone git://github.com/joyent/node.git
cd node
git checkout v0.8.19
./configure
make
make install
```

Up next was installing `nginx`, we installed the latest development release
which was `1.3.15` at the time of this writing.

```
wget http://nginx.org/download/nginx-1.3.15.tar.gz
tar xzvf nginx-1.3.15.tar.gz
cd nginx-1.3.15
```

As we want to have `ssl` support we need to install `libssl-dev` which will
install the latest openssl library.

```
apt-get install libssl-dev
```

After that we configure nginx with all options requried for this test.

```
./configure --with-http_spdy_module --with-http_ssl_module
--pid-path=/var/run/nginx.pid --conf-path=/etc/nginx/nginx.conf
--sbin-path=/usr/local/sbin --http-log-path=/var/log/nginx/access.log
--error-log-path=/var/log/nginx/error.log --without-http_rewrite_module
```

Which yields the following nginx summary.

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

After this it's just a simple `make` && `make install`. Now that all dependencies
were installed we need to do some basic socket tuning.

```
vi /etc/sysctl.conf

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

After this the configuration was updated with details from `nginx.conf` which is in
the root of this repository. Added this file at `/etc/nginx/nginx.conf` Now we
have finally got everything installed and we can continue with testing the
server using `thor`.
