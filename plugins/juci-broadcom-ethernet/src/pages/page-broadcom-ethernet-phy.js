//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("PageBroadcomEthernetPhy", function($scope, $uci, $broadcomEthernet, $tr, gettext, $rootScope){
	$scope.data = {};
	$scope.getItemTitle = function(item) {
		if(!item) return "error";
		return item.name.value || item[".name"];
	}
	$uci.$sync(["ports", "layer2_interface_ethernet"]).done(function(){
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
		if($uci.layer2_interface_ethernet.Wan){
			$scope.data.wan_port = $uci.layer2_interface_ethernet.Wan.baseifname.value;
			$scope.config = $uci.layer2_interface_ethernet.Wan;
		}else{
			$scope.data.wan_port = "none";
		}
		$scope.$watch("data.wan_port", function(value){
			if(!value) return;
			if(value === "none"){
				$broadcomEthernet.configureWANPort(null);
				$scope.config = null;
			}else{
				$broadcomEthernet.configureWANPort(value).done(function(){
					$scope.config = $uci.layer2_interface_ethernet.Wan;
					$scope.$apply();
				});
			}
		});
		$scope.$apply();
	});
});
