//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("NetworkEthernetPortCtrl", function($scope, $uci, $tr, gettext, $rpc){
	$scope.has_capability = $rpc.$has_capability;
	$scope.data = {};
	$scope.getItemTitle = function(item) {
		if(!item) return "error";
		return item.name.value || item[".name"];
	}
	$uci.$sync("ports").done(function(){
		$scope.ports = $uci.ports["@ethport"] || [];
		$scope.ports.map(function(port){
			port.$statusList = [
				{ label: $tr(gettext("Port Speed")), value: port.speed.value }
			];
		});
		$scope.sfpports = $uci.ports["@sfpport"] || [];
		$scope.sfpports.map(function(port){
			port.is_fiber = true;
			port.$statusList = [
				{ label: $tr(gettext("Port Speed")), value: port.speed.value }
			];
		});
		$scope.data.ports = [{label:$tr(gettext("None")), value: "none"}].concat($scope.ports.map(function(port){ return {label: port.name.value, value: port.ifname.value};}));
		var uplink = $scope.ports.find(function(port){ return port.uplink.value });
		if(uplink)
			$scope.data.wan_port = uplink.ifname.value;
		else
			$scope.data.wan_port = "none";

		$scope.$watch("data.wan_port", function(value){
			if(!value) return;
			$scope.ports.forEach(function(port, i){
				$scope.ports[i].uplink.value = false;
			});
			if(value !== "none"){
				$scope.ports.forEach(function(port, i){
					if($scope.ports[i].ifname.value === value)
						$scope.ports[i].uplink.value = true;
				});
			}
		});
		$scope.$apply();
	});
});
