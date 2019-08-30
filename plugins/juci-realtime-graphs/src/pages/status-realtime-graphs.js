JUCI.app.controller("rtgraphsCtrl", function($scope, $rpc, $tr, gettext, $network, $uci){
	$scope.ylabel = "Mbit/s";
	var names = {};
	var directions = {};
	var upstream = $tr(gettext("Upstream"));
	var downstream = $tr(gettext("Downstream"));

	async.series([get_adapters, get_directions], function(e){
		if (e)
			console.error(e);
		JUCI.interval.repeat("updateRealtimeData",$scope.tick,function(next){
			updateTraffic();
			updateLoad();
			updateConnections();
			next();
		});
		$scope.$apply();
	});

	function get_adapters(callback) {
		$network.getAdapters().done(function(adapters){
			adapters = adapters.filter(function(a) {
				return a.up && a.device && a.name;
			})

			$uci.$sync(["network", "wireless"]).done(function() {

				/* iterate all network interfaces */
				$uci.network["@interface"].forEach(function(interface) {
					if (interface[".name"] === "loopback")
						return;

					$rpc.$call("network.interface." + interface[".name"], "status").done(function(res) {
						/* if network interface is not up - do nothing */
						if (!res.up)
							return;

						if (interface.type.value === "bridge") {
							/* if interface is a bridge - iterate all ifnames and wireless wifi-ifaces that matches network */
							interface.ifname.value.split(" ").forEach(function(ifname) {
								var adapter = adapters.find(function(a) { return a.device === ifname})
								if (!adapter || !adapter.device)
									return

								names[adapter.device] = adapter.name;
								if (adapter.type === "wireless")
									names[adapter.device]+=" (" + adapter.frequency + ")";
							})

							$uci.wireless["@wifi-iface"].filter(function(iface) {
								return iface.network.value === interface[".name"]
							}).map(function(iface) {
								return adapters.find(function(a) { return a.device === iface.ifname.value })
							}).forEach(function(adapter) {
								if (!adapter || !adapter.device)
									return
								names[adapter.device] = adapter.name + " (" + adapter.frequency + ")";
							})
						} else {
							/* if interface is not a bridge use whichever is the layer3 drive */
							var adapter = adapters.find(function(a) { return a.device === res.l3_device})
							if (!adapter || !adapter.device)
								return;

							names[adapter.device] = adapter.name;
							if (adapter.type === "wireless")
								names[adapter.device]+=" (" + adapter.frequency + ")";
						}
					});
				})
			})
		}).always(function() {
			callback();
		})
	}

	function get_directions(callback){
		$rpc.$call("router.port", "status").done(function(ports){
			Object.keys(ports).forEach(function(key){
				directions[key] = ports[key].direction;
			});
		}).always(function(){
			callback();
		});
	}

	function to_kb_or_mb_str(bytes){
		if(bytes * 8 / 1024 / 1024 < 1)
			return bytes_to_kilobits(bytes).toFixed(3) + " kbit/s";

		return bytes_to_megabits(bytes).toFixed(3) + " Mbit/s";
	}
	function bytes_to_megabits(bytes){ return ((bytes * 8) / 1000 / 1000); }
	function bytes_to_kilobits(bytes){ return ((bytes * 8) / 1000); }
	function clean(num){
		if (num < 100)
			return num.toFixed(2);
		return Math.round(num).toString();
	}

	function updateTraffic(){
		$rpc.$call("router.graph", "iface_traffic").done(function(data){
			var traffic = {};
			var tbData = {};
			var newKey = undefined;
			Object.keys(data).map(function(ifname){
				var iface = data[ifname];
				var name = names[ifname];
				var direction = directions[ifname];// || "up";
				if(!iface || !name)
					return;
				var up;
				var down;

				if (direction === "down"){
					up = iface.rx_bytes;
					down = iface.tx_bytes;
				}else{
					up = iface.tx_bytes;
					down = iface.rx_bytes;
				}
				traffic[name] = {};
				traffic[name].up = {
					label: upstream,
					value: clean(bytes_to_megabits(up))
				}
				traffic[name].down = {
					label: downstream,
					value: clean(bytes_to_megabits(down))
				}
				tbData[name] = {};
				tbData[name].rows = [
					[
						$tr(gettext("Download Speed")),
						to_kb_or_mb_str(down)
					],
					[
						$tr(gettext("Upload Speed")),
						to_kb_or_mb_str(up)
					]
				];
			});

			$scope.traffic = traffic;
			$scope.tableData = tbData;
			$scope.$apply();
		}).fail(function(e){console.log(e);});

	}

	function updateLoad(){
		$rpc.$call("router.graph", "load").done(function(data){
			if(!data || !data.load)
				return;
			$scope.load = {};
			$scope.load[$tr(gettext("1 minute"))] = data.load.min_1;
			$scope.load[$tr(gettext("5 minutes"))] = data.load.min_5;
			$scope.load[$tr(gettext("15 minutes"))] = data.load.min_15;
			$scope.$apply();
		}).fail(function(e){console.log(e);});
	}

	function updateConnections(){
		$rpc.$call("router.graph", "connections").done(function(data){
			if(!data)
				return;
			$scope.connections = {};
			$scope.connections[$tr(gettext("TCP Connections"))] = data.tcp;
			$scope.connections[$tr(gettext("UDP Connections"))] = data.udp;
			$scope.$apply();
		}).fail(function(e){console.log(e);});
	}
});
