# Test details

These tests are used to see how the proxies perform under message heavy load.
Each connection sends 100 messages each.

The 5k tests used an upgraded `thor` and `WebSocketServer`. They were
automatically resized to 2GB instances intead of the `512mb` memory that they
were using. The server that ran the proxy remains unchanged during this test.

## http-proxy
- Received a peak memory of 152mb for 1k connections with a CPU blasting around
  60 - 99%
- Received a peak memory of 280mb for 1k connections with a CPU blasting around
  60 - 99%
- Received a peak of memory 450mb for 5k connections with a CPU blasting around
  60 - 99%

## nginx

- Received a peak memory of 26mb for 1k connections with a CPU blasting around
  10 - 20%
- Received a peak memory of 35mb for 2k connections with a CPU blasting arnoud
  10 - 20%
- Received a peak memory of 35mb for 5k connections with a CPU blasting around
  10 - 20%

## haproxy

- Received a peak memory of 35mb for 1k connections with a CPU blasting around
  14 - 30%
- Received a peak memory of 50mb for 2k connections with a CPU blasting around
  14 - 30%
- Received a peak memory of 53mb for 5k connections with a CPU blasting around
  20 - 30%
