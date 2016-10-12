//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("diagnosticsWidget90Speedtest", function(){
	return {
		scope: true,
		replace: true,
		templateUrl: "/widgets/diagnostics-widget-speedtest.html",
		controller: "diagnosticsWidget90Speedtest"
	};
})
.controller("diagnosticsWidget90Speedtest", function($scope, $rpc, $events, $uci, utilsAddTestserverPicker, $tr, gettext){
	$scope.data = {
		test_type: "up_down",
		result: "",
		state: "",
		manually: false
	}; 
	
	function getDefaultPacketSize(){
		$rpc.$call("juci.speedtest", "get_packet_size").done(function(data){
			$scope.data.downsize = parseInt(data.packetsize_down);
			$scope.data.upsize = parseInt(data.packetsize_up);
			$scope.$apply();
		}).fail(function(e){ console.log(e); });
	}
	getDefaultPacketSize();
	
	$scope.$watch('data.manually', function(new_value){
		if(new_value === true){ getDefaultPacketSize(); }
	}, false);

	function getServers(){
		$scope.allTestServers = $scope.testServers.map(function(x){
			return {
				label: x.server.value + "/" + x.port.value, 
				value: x.server.value
			}
		});
		if($scope.allTestServers.length)
			$scope.data.server = $scope.allTestServers[0].value; 
	}

	$scope.testType = [
		{value:"down", label: $tr(gettext("Down")) },
		{value:"up", label: $tr(gettext("Up")) }, 
		{value:"up_down", label: $tr(gettext("Down and Up")) }
	];

	$uci.$sync("speedtest").done(function(){
		$scope.testServers = $uci.speedtest["@testserver"];
		getServers();
		$scope.$apply();
	});

	$scope.runTest = function(){
		if($scope.data.test_type.indexOf("up") !== -1 && !$scope.data.upsize){ alert("Upstream packet size missing"); return; }
		if($scope.data.test_type.indexOf("down") !==-1 && !$scope.data.downsize){ alert("Downstream packet size missing"); return; }
		if(!$scope.testServers.length){
			window.alert($tr(gettext("Server and port is mandatory")));
			return;
		}
		if($scope.data.state == "running"){
			window.alert($tr(gettext("Only one test can be run at a time")));
			return;
		}
		var server = $scope.testServers.find(function(x){ return $scope.data.server == x.server.value;});
		var port = server.port.value;
		var address = server.server.value;
		$scope.data.state="running";
		var speedtestArgs = {
			"auto": !$scope.data.manually,
			"testmode": $scope.data.test_type,
			"port": port,
			"address": address
		};

		if($scope.data.test_type.indexOf("up") !== -1){
			speedtestArgs.packetsize_up = $scope.data.upsize * 1000000;
		}
		if($scope.data.test_type.indexOf("down") !== -1){
			speedtestArgs.packetsize_down = $scope.data.downsize * 1000000;
		}

		$rpc.$call("juci.speedtest", "run", speedtestArgs).done(function(response){
			if(response && response.message=="success"){
				$scope.data.state="running";
			}else{
				$scope.data.state="";
			}
			$scope.$apply();
		});
		setTimeout(function(){
			if($scope.data.state === "running"){
				$scope.data.state = "error";
				$scope.data.result = $tr(gettext("Unknown error"));
			}
		}, 15000);
	};
	
	$scope.onRemoveAddress = function(){
		var server = $scope.testServers.find(function(x){
			return $scope.data.server == x.server.value
		});
		if(!server){
			alert($tr(gettext("error deleting server")));
			return;
		}
		server.$delete().done(function(){
			getServers();
			$scope.$apply();
		});
	};

	$scope.onAddAddress = function(){
		utilsAddTestserverPicker.show().done(function(data){
			if(!data)return;
			$uci.speedtest.$create({
				".type": "testserver",
				"server": data.address,
				"port": data.port
			}).done(function(){
				getServers();
				$scope.$apply();
			});
		});
	}
	$events.subscribe("juci.utils.speedtest", function(res){
		if(res.data && res.data.status != undefined){
			switch(res.data.status) {
			case 0:
				var upstream = parseInt(res.data.upstream);
				if(upstream == "NaN") {
					upstream = "none"
				}else{
					upstream = upstream / 1000 / 1000;
				}
				var downstream = parseInt(res.data.downstream);
				if(downstream == "NAN"){
					downstream = "none"
				}else{
					downstream = downstream / 1000 / 1000;
				}
				if(res.data.upstream != "none" && res.data.downstream != "none"){
					$scope.data.result=$tr(gettext("Downstream:"))+" " + downstream.toFixed(2) + " " + $tr(gettext("Mbit/s\nUpstream:"))+" " + upstream.toFixed(2) +" "+$tr(gettext("Mbit/s"));
				}else if(res.data.upstream != "none"){
					$scope.data.result=$tr(gettext("Upstream:"))+" " + upstream.toFixed(2) + " "+$tr(gettext("Mbit/s"));
				}else if(res.data.downstream != "none"){
					$scope.data.result=$tr(gettext("Downstream:"))+" " + downstream.toFixed(2) + " "+$tr(gettext("Mbit/s"));
				}else {
					$scope.data.result="No speeds found";
				}
				$scope.data.state="result";
				break;
			case -1:
				$scope.data.result=$tr(gettext("Wrong TP-test address and/or port"));
				$scope.data.state="error";
				break;
			case -2:
				$scope.data.result=$tr(gettext("Wrong TP-test port but correct address"));
				$scope.data.state="error";
				break;
			}
			$scope.$apply();
		}
	});
}); 
