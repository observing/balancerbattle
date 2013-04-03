# nginx configuration

The following configuration was used to configure nginx:

```
./configure --with-http_spdy_module
            --with-http_ssl_module
            --without-http_rewrite_module
            --pid-path=/var/run/nginx.pid
            --conf-path=/etc/nginx/nginx.conf
            --sbin-path=/usr/local/sbin
            --http-log-path=/var/log/nginx/access.log
            --error-log-path=/var/log/nginx/error.log
```

Which created the following configuration summary:

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
