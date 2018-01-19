JUCI.app.controller("rtgraphsCtrl", function($scope, $uci, $wireless, $rpc, $tr, gettext){
	var mapIface = {};
	$scope.ylabel = "Mbit/s";
	var ports;
	var upstream = $tr(gettext("Upstream"));
	var downstream = $tr(gettext("Downstream"));

	async.series([get_ports_config, get_ports_status, get_wifi, get_usb], function(e){
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

	function get_ports_config(callback){
		$uci.$sync("ports").done(function(){
			$scope.portnames = $uci.ports["@all"];
			$scope.portnames.forEach(function(portname){
				if (!portname || !portname.ifname)
					return;
				var key = portname.ifname.value;
				var value = portname[".name"];
				mapIface[key] = value;
			});
			mapIface['atm0'] = 'DSL';
			mapIface['ptm0'] = 'DSL';
		}).always(function(){
			callback();
		});
	}

	function get_wifi(callback){
		$wireless.getInterfaces().done(function(ifaces){
			ifaces.forEach(function(iface){
				if (!iface || !iface.device ||
					!iface.$info || !iface.$info.ssid)
					return;
				var wdev= iface.device.value
				var ssid = iface.$info.ssid;
				var freq = iface[".frequency"];
				mapIface[wdev] = ssid + " " + freq;
			});
		}).always(function(){
			callback();
		});
	}

	function get_usb(callback){
		$rpc.$call("router.usb", "status").done(function(res){
			Object.keys(res).map(function(key){
				var usb = res[key];
				if (usb.netdevice)
					mapIface[usb.netdevice]=usb.product;
			});
		}).always(function(){
			callback();
		});
	}

	function get_ports_status(callback){
		$rpc.$call("router.port", "status").done(function(data){
			ports = data;
		}).fail(function(e){
			console.log(e);
		}).always(function(e){
			callback();
		});

	}

	function to_kb_or_mb_str(bytes){
		if(bytes * 8 / 1024 / 1024 < 1)
			return bytes_to_kilobits(bytes).toFixed(3) + " kbit/s";

		return bytes_to_megabits(bytes).toFixed(3) + " Mbit/s";
	}
	function bytes_to_megabits(bytes){ return ((bytes * 8) / 1024 / 1024); }
	function bytes_to_kilobits(bytes){ return ((bytes * 8) / 1024); }
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
				var name = mapIface[ifname];
				if(!iface || !name)
					return;
				var port = ports[ifname];
				if (!port){
					// WARNING: uggly hack to map eth0 in ports config
					// to eth0.1 in all other places (Broadcom)
					Object.keys(ports).forEach(function(key){
						if (key.indexOf(ifname) >= 0)
							port = ports[key];
					});
				}
				if (!port || !port.direction)
					return;
				var direction = port.direction;
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
				traffic[name][upstream] = clean(bytes_to_megabits(up));
				traffic[name][downstream] = clean(bytes_to_megabits(down));
				tbData[name] = {};
				tbData[name].rows = [
					[
						$tr(gettext("Download Speed")),
						to_kb_or_mb_str(up)
					],
					[
						$tr(gettext("Upload Speed")),
						to_kb_or_mb_str(down)
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
