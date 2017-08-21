//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("omcProxyEdit", function(){
	return {
		templateUrl: "/widgets/omc-proxy-edit.html",
		scope: {
			proxy: "=ngModel"
		},
		replace: true,
		controller: "omcProxyEditCtrl"
	}
}).controller("omcProxyEditCtrl", function($scope, $firewall, $juciDialog, $tr, gettext){
	$scope.scopes = [
		{ label: $tr(gettext("Global")), value: "global" },
		{ label: $tr(gettext("Organization")), value: "organization" },
		{ label: $tr(gettext("Site")), value: "site" },
		{ label: $tr(gettext("Admin")), value: "admin" },
		{ label: $tr(gettext("Realm")), value: "realm" }
	];
	$scope.$watch("proxy", function(proxy){
		if(!proxy) return;
		$scope.downlinks = {
		};
		$firewall.getZoneNetworks("lan").done(function(networks){
			$scope.downlinks.all = networks.map(function(net){ return { name: String(net[".name"]).toUpperCase(), value: net[".name"], selected: !!proxy.downlink.value.find(function(dl){ return dl === net[".name"] }) }; });
			$scope.$apply();
		});
		$firewall.getZoneNetworks("wan").done(function(networks){
			$scope.uplinks = networks.map(function(net){ return { label: String(net[".name"]).toUpperCase(), value: net[".name"] }; });
			$scope.$apply();
		});
	}, false);
	$scope.onItemClick = function(item){
		if(!$scope.proxy || !$scope.proxy.downlink || !$scope.downlinks ||
				!($scope.downlinks.selected && $scope.downlinks.selected instanceof Array)) return;
		$scope.proxy.downlink.value = $scope.downlinks.selected.filter(function(sel){
			return sel.selected;
		}).map(function(sel){
			return sel.value;
		});
	};
});
