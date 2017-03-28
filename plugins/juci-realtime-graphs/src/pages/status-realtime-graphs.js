JUCI.app.controller("rtgraphsCtrl", function($scope, $uci, $wireless){
	$scope.data = {};
	var mapIface = {};
	$scope.ylabel = "Mbit/s";

	$uci.$sync("ports").done(function(){
		$scope.portnames = $uci.ports["@all"];
		for (var i in $scope.portnames){
			if (typeof $scope.portnames[i] === 'function') { continue; }
			var key = $scope.portnames[i].ifname.value;
			var val = $scope.portnames[i][".name"];
			mapIface[key] = val;
		}
		$scope.$apply();
	});
	$uci.$sync("wireless").done(function(){
		$scope.wifaces = $uci.wireless["@wifi-iface"];
		for (var i in $scope.wifaces){
			if (!$scope.wifaces[i].ifname) { continue; }
			var key = $scope.wifaces[i].ifname.value;
			var val = $scope.wifaces[i].ssid.value;
			mapIface[key] = val;
		}
		$wireless.getInterfaces().done(function(data){
			for (var i in data) {
				if (typeof data[i] === 'function') { continue; }
				var wdevice = data[i].device.value;
				var wiface = data[i].ifname.value;
				var freq = data[i][".frequency"];
				mapIface[wdevice] = mapIface[wdevice] + " " + freq;
			}
			$scope.$apply();
		});
	});
	$scope.load = {
		"1 min" : 0,
		"5 min" : 0,
		"15 min" : 0
	};
	$scope.connections = {
		"UDP Count" : 0,
		"TCP Count" : 0
	};
	$scope.traffic = {};
	$scope.tableData = {};
	$scope.tick = 4000;

	function to_kbit_or_mbit_str(number) {
		var number_out = number;
		var unit = "Mbit/s"

		if (number_out < 1) {
			number_out = (number_out * 1000);
			unit = "kbit/s";
		}
		number_out = parseFloat(number_out).toFixed(3);

		return String(number_out) +" "+ unit;
	}
	function for_objs_in_obj(obj, f) {
		Object.keys(obj).forEach(function(i){ do_to_each(obj[i], f); });
	}
	function do_to_each(obj, f){
		Object.keys(obj).forEach(function(key){ obj[key]=f(obj[key]); });
	}
	function bits_to_megabits_per_sec(bits){ return ( (bits/1000000) / ($scope.tick/1000) ).toFixed(5); }
	function bits_to_kilobits(bits){ return (bits/1000).toFixed(3); }

	function updateTraffic(){
		$rpc.$call("router.graph", "iface_traffic").done(function(data){
			var traffic = {};
			var newKey = undefined;
			for (var key in data) {
				newKey = mapIface[key];
				if (newKey){ traffic[newKey] = data[key]; }
			}

			for_objs_in_obj(traffic, bits_to_megabits_per_sec);
			$scope.traffic = traffic;

			// show transmitted/received bytes in table
			for (var key in traffic){
				$scope.tableData[key] = { rows:[["Download Speed","0"],["Upload Speed","0"]] };
				$scope.tableData[key]["rows"][0] = ["Download Speed", to_kbit_or_mbit_str($scope.traffic[key]["Downstream"])];
				$scope.tableData[key]["rows"][1] = ["Upload Speed", to_kbit_or_mbit_str($scope.traffic[key]["Upstream"])];
			}

			$scope.$apply();
		}).fail(function(e){console.log(e);});
	}

	function updateLoad(){
		$rpc.$call("router.graph", "load").done(function(data){
			$scope.load = data.load;
			$scope.$apply();
		}).fail(function(e){console.log(e);});
	}

	function updateConnections(){
		$rpc.$call("router.graph", "connections").done(function(data){
			$scope.connections = data.connections;
			$scope.$apply();
		}).fail(function(e){console.log(e);});
	}

	JUCI.interval.repeat("updateTraffic",$scope.tick,function(next){
		updateTraffic();
		next();
	});
	JUCI.interval.repeat("updateLoad",$scope.tick,function(next){
		updateLoad();
		next();
	});
	JUCI.interval.repeat("updateConnections",$scope.tick,function(next){
		updateConnections();
		next();
	});
});
