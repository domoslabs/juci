//! Author Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionProtoDhcpv6Edit", function(){
	return {
		templateUrl: "/widgets/proto/network-connection-proto-dhcpv6-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoDhcpv6Edit", 
		replace: true, 
		require: "^ngModel"
	};
})
.controller("networkConnectionProtoDhcpv6Edit", function($scope, $uci, $network, $log, $tr, gettext){
	$scope.allReqAddrTypes = [
		{ label: $tr(gettext("Try")), value: "try" }, 
		{ label: $tr(gettext("Force")), value: "force" }, 
		{ label: $tr(gettext("None")), value: "none" }
	]; 
	$scope.allPrefixReqTypes = [
		{ label: "48", value: "48" }, 
		{ label: "52", value: "52" }, 
		{ label: "56", value: "56" }, 
		{ label: "60", value: "60" }, 
		{ label: "64", value: "64" }, 
		{ label: $tr(gettext("Auto")), value: "auto" }, 
		{ label: $tr(gettext("Disabled")), value: "no" }
	]; 
})
.directive("networkConnectionProtoDhcpv6PhysicalEdit", function(){
	return {
		templateUrl: "/widgets/proto/network-connection-standard-physical.html",
		scope: {
			interface: "=ngModel",
			protos: "="
		},
		replace: true,
		require: "^ngModel"
	};
})
.directive("networkConnectionProtoDhcpv6AdvancedEdit", function(){
	return {
		templateUrl: "/widgets/proto/network-connection-proto-dhcpv6-advanced-edit.html",
		scope:	{
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});
