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
