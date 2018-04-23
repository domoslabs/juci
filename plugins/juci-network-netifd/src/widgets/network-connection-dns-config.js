//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionDnsConfig", function(){
	return {
		templateUrl: "/widgets/network-connection-dns-config.html",
		scope: {
			interface: "=ngModel"
		},
		controller: "networkConnectionDnsConfig",
		replace: true,
		require: "^ngModel"
	};
})
.controller("networkConnectionDnsConfig", function($scope, $uci, gettext, $tr){
	$scope.dnsServers = [];
	$scope.$watch("interface", function(){
		if(!$scope.interface || !$scope.interface.dns)
			return;
		$scope.dnsServers = [];
		$scope.interface.dns.value.map(function(dns){
			dns.split(" ").map(function(d){
				$scope.dnsServers.push({ value:d });
			});
		});

		$scope.interface.dns.validator = new dnsValidator;

		$scope.$watch("dnsServers", function(){
			if(!$scope.dnsServers || !$scope.interface || !$scope.interface.dns) return;
			$scope.interface.dns.value = $scope.dnsServers.map(function(x){ return x.value});
		}, true);
	}, false);

	var ipv4validator = new $uci.validators.IP4AddressValidator;
	var ipv6validator = new $uci.validators.IP6AddressValidator;

	function dnsValidator(){
		this.validate = function(data){
			if(data.value.find(function(dns){
				if( ipv4validator.validate({value:dns}) != null
				 && ipv6validator.validate({value:dns}) != null) return true;
				return false;
			}) != undefined) return $tr(gettext("All DNS-servers must be valid"));
			if(duplicatesInDnsServers()) return $tr(gettext("All DNS-servers must be unique"));
			return null;
		};
	}

	$scope.addDns = function(){
		$scope.dnsServers.push({ value: ""})
	}

	$scope.removeDns = function(index){
		if($scope.dnsServers[index])
			$scope.dnsServers.splice(index, 1);
	}

	function duplicatesInDnsServers(){
		var dnslist = $scope.dnsServers.map(function(x){ return x.value;});
		var sorted_list = dnslist.sort();
		for(var i = 0; i < sorted_list.length -1; i++){
			if(sorted_list[i+1] == sorted_list[i]) return true;
		}
		return false;
	}
});
