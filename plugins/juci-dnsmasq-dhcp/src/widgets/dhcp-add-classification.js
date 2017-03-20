//!Author: Reidar Cederqivst <reidar.cederqvist@gmail.com>

JUCI.app
.directive("dhcpAddClassification", function(){
	return {
		templateUrl: "/widgets/dhcp-add-classification.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});
