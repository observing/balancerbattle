# Test details

These tests were spinning up `x` connections. The connections were spinned up
with a maximum concurrency of 100. When the connection was opened, one single
message was send to the WebSocket server which echo'ed it back to the client.
After the message was received, the connection was closed again.

The WebSocket server was spead over `24` processes as the Joyent smartmachine
presented us with that many virtual cpu's.

The `thor` load tester was using `6` processes which was forced using
`--workers`.
