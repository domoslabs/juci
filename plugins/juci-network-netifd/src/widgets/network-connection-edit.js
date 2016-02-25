//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionEdit", function($scope, $uci, $network, $rpc, $log, $tr, gettext, $juciConfirm, $juciDialog){
	$scope.expanded = true; 
	$scope.existingHost = { }; 
	
	$scope.allInterfaceTypes = [
		{ label: $tr(gettext("Standalone")), value: "" }, 
		{ label: $tr(gettext("AnyWAN")), value: "anywan" }, 
		{ label: $tr(gettext("Bridge")), value: "bridge" }
	]; 
	 $scope.showPhysical = function(){
	 	if(!$scope.interface) return false;
	 	return $scope.allProtocolTypes.find(function(x){ if(x.value == $scope.interface.proto.value) return x.physical;}) != undefined;
	};
	
	$scope.allProtocolTypes = $network.getProtocolTypes();
	$rpc.juci.network.protocols().done(function(data){
		$scope.protocolTypes = $scope.allProtocolTypes.filter(function(x){
			if(x.value == "static" || x.value == "none") return true; //should allways be there
			return data.protocols.find(function(p){ return p == x.value }) != undefined;
		});
	});
	var standard_exc = ["macaddr","mtu","auto","metric"];
	var exceptions = {
		"none":		["ifname","type"],
		"static":	["ifname","type","ipaddr","netmask","gateway","broadcast","ip6addr","ip6gw","ip6assign","ip6hint","ip6prefix","dns"],
		"dhcp":		["ifname","type","broadcast","hostname","clientid","vendorid","dns","peerdns","defaultroute"],
		"dhcpv6":	["ifname","type","reqaddress","reqprefix","clientid","dns","defaultroute","peerdns","ip6prefix"],
		"ppp":		["device","username","password","_keepalive_interval","_keepalive_failure","demand","defaultrout","peerdns","dns","ipv6"],
		"pppoe":	["ifname","username","password","ac","service","_keepalive_interval","_keepalive_failure","demand","defaultroute","peerdns","dns","ipv6"],
		"pppoa":	["ifname","username","password","_keepalive_interval","_keepalive_failure","demand","defaultroute","peerdns","dns","ipv6"],
		"3g":		["device","service","apn","pincode","username","password","_keepalive_interval","_keepalive_failure","demand","defaultroute","peerdns","dns","ipv6"],
		"4g":		["device","service","comdev","modem","apn","pincode","username","password","hostname","broadcast","defaultroute","peerdns","dns","clientid","vendorid"],
		"pptp":		["server","username","password","defaultroute","peerdns","dns","_keepalive_interval","_keepalive_failure","demand"],
		"6in4":		["ipaddr","peeraddr","ip6addr","ip6prefix","_update","tunelid","username","password","defaultroute","ttl"],
		"6to4":		["ipaddr","defaultroute","ttl"],
		"6rd":		["ipaddr","peeraddr","ip6prefix","ip6prefixlen","ip4prefixlen","defaultroute","ttl"],
		"dslite":	["peeraddr","ip6addr","tunlink","ttl"],
		"l2tp":		["server","username","password","ipv6","defaultroute","peerdns","dns"]
	}

	$scope.ifstatus = function(){
		if(!$scope.interface || !$scope.interface.$info || $scope.interface.$info.pending == undefined || $scope.interface.$info.up == undefined) return $tr(gettext("ERROR"));
		return ($scope.interface.$info.pending) ? $tr(gettext("PENDING")) : (($scope.interface.$info.up) ? $tr(gettext("UP")) : $tr(gettext("DOWN")));
	};
	$scope.onChangeProtocol = function(value, oldvalue){
		if(value == oldvalue) return;
		$juciConfirm.show($tr(gettext("Are you sure you want to switch? Your settings will be lost!<br />The only way to get it back is to reload the page")))
		.done(function(data){
			if(data == "cancel"){
				$scope.interface.proto.value = oldvalue;
			}
			if(data == "ok"){
				var exc = [];
				if(exceptions[value]){
					exc = exceptions[value].concat(standard_exc);
				}
				$scope.interface.$reset_defaults(exc);
				$scope.interface.proto.value = value;
			}
			setProto($scope.interface.proto.value);
			$scope.$apply();
		});
	};

	function setProto(proto){
		$scope.interface.$proto_editor = "<network-connection-proto-"+proto+"-edit ng-model='interface'/>"; 
		$scope.interface.$proto_editor_ph = "<network-connection-proto-"+proto+"-physical-edit ng-model='interface' protos='allInterfaceTypes' />"; 
		$scope.interface.$proto_editor_ad = "<network-connection-proto-"+proto+"-advanced-edit ng-model='interface' />"; 
	};	
	JUCI.interval.repeat("load-info", 5000, function(done){
		if(!$scope.interface || !$rpc.network.interface || !$rpc.network.interface.dump) return;
		$rpc.network.interface.dump().done(function(ifaces){
			$scope.interface.$info = ifaces.interface.find(function(x){ return x.interface == $scope.interface[".name"]; });
			$scope.$apply();
		});
	});
	$scope.$watch("interface.type.value", function(value){
		if(!$scope.interface) return; 
		$scope.interface.$type_editor = "<network-connection-type-"+($scope.interface.type.value||'none')+"-edit ng-model='interface'/>"; 
	}); 
	$scope.$watch("interface", function(){
		if(!$scope.interface) return; 
		setProto($scope.interface.proto.value);
		$scope.interface.$type_editor = "<network-connection-type-"+($scope.interface.type.value||'none')+"-edit ng-model='interface'/>"; 
	}, false); 
}); 
