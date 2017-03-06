JUCI.app.controller("rtgraphsCtrl", function($scope, $uci, $wireless){
	$scope.data = {};
	var mapIface = {};
	/*
	$scope.min_avg_max = {
		load : { min:0, avg:0, max:0, tot:0 },
		traffic : { min:0, avg:0, max:0, tot:0 },
		connections : { min:0, avg:0, max:0, tot:0 }
	};
	*/
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
	$scope.tick = 2000;

	function updateTraffic(){
		$rpc.$call("router.graph", "iface_traffic").done(function(data){
			var traffic = {};
			var newKey = undefined;
			for (var key in data) {
				newKey = mapIface[key];
				if (!newKey){ continue; }
				traffic[newKey] = data[key];
			}
			$scope.traffic = traffic;
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
