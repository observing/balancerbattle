# http-proxy

### 5000 requests mixed with messaging

Small hit with 5000 reaquests, all sending a single message using `time ./charge -n 5000`

```
We have won the battle. (\/)(;,,;)(\/) woop woop woop


Statistics:
  - Connections established 5000
  - Connections disconnected 0
  - Messages received 5000
  - Messages send 5000
  - Messages failed 0


real  0m23.341s
user	0m7.150s
sys	0m1.670s
```

### 10000 requests mixed with messaging

Small hit with 10k requests, all sending one single message using `time ./charge -n 10000`

```
We have won the battle. (\/)(;,,;)(\/) woop woop woop


Statistics:
  - Connections established 10000
  - Connections disconnected 0
  - Messages received 10000
  - Messages send 10000
  - Messages failed 0


real  1m4.579s
user	0m18.450s
sys	0m5.370s
```

### 20000 requests, pointless

There's not enough memory on the machine to do this properly but what ever ;)

```
We have won the battle. (\/)(;,,;)(\/) woop woop woop


Statistics:
  - Connections established 20000
  - Connections disconnected 0
  - Messages received 20000
  - Messages send 20000
  - Messages failed 0


real  5m42.187s
user	1m8.180s
sys	0m56.040s
```
