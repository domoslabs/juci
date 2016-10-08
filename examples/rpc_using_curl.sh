curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "method":"call","params":["","session","access",{"scope": "ubus", "object": "router.system", "function": "info"}], "id":"1"}' http://192.168.1.1/ubus

curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "method":"call","params":["00000000000000000000000000000000","router.dsl","stats",{}], "id":"1"}' http://192.168.1.1/ubus

