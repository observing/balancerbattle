# BalancerBattle

The load balancer / proxy test for WebSockets. Which is the absolute best for
real-time communication.

## The tests

- 2k connections each connections sends one message and dies.
- 5k connections each connections sends one message and dies.
- 10k connections each connections sends one message and dies.

All tests are done over plain `ws` and `wss` to test their SSL termination
skills.

## The proxies

- Nothing, this is used for a control test
- HTTP-Proxy, open source proxy written in Node.js by Nodejitsu
- Nginx, know to be really fast and has WebSocket support in development channel

To be tested:

- HAProxy (with stud?)

## Results

The test results are in the `results` folder for this repo. The setup
information for these benchmarks is described in the setup.md.
