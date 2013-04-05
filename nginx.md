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

And last but not least, the nginx.conf


```conf
worker_processes  1;

events {
  worker_connections 20000;
}

http {
  include       mime.types;
  default_type  application/octet-stream;

  #
  # Some default configuration.
  #
  sendfile           on;
  tcp_nopush         on;
  keepalive_timeout  65;

  #
  # A list with load balancing backends hashed on IP for sticky load balancing.
  #
  upstream realtime {
    ip_hash;

    server localhost:8080;
  }

  server {
    listen       8082;
    server_name  localhost;

    #
    # Proxy settings
    #
    proxy_pass http://realtime
    proxy_redirect      off;
    proxy_set_header    Host              $host;
    proxy_set_header    X-Real-IP         $remote_addr;
    proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header    X-Forwarded-Proto $scheme;

    # WebSocket specific
    proxy_http_version 1.1;
    proxy_set_header    Upgrade           $http_upgrade;
    proxy_set_header    Connection        "upgrade";

    #
    # Specific for comet or long running HTTP requests, don't buffer up the
    # response from origin servers but send them directly to the client.
    #
    proxy_buffering     off;

    #
    # Bump the timeout's so someting sensible so our connections don't
    # disconnect automatically. We've set it to 12 hours.
    #
    proxy_connect_timeout 43200000;
    proxy_read_timeout    43200000;
    proxy_send_timeout    43200000;
    timeout               43200000;
  }

  # HTTPS server
  #
  #server {
  #  listen       443;
  #  server_name  localhost;

  #  ssl                  on;
  #  ssl_certificate      cert.pem;
  #  ssl_certificate_key  cert.key;

  #  ssl_session_timeout  5m;

  #  ssl_protocols  SSLv2 SSLv3 TLSv1;
  #  ssl_ciphers  HIGH:!aNULL:!MD5;
  #  ssl_prefer_server_ciphers   on;

  #  location / {
  #      root   html;
  #      index  index.html index.htm;
  #  }
  #}
}
```
