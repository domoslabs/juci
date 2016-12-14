//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com> 

JUCI.app
.directive("networkConnectionProtoPppoaEdit", function(){
	return {
		templateUrl: "/widgets/proto/network-connection-proto-pppoa-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		replace: true, 
		require: "^ngModel"
	};
})
.directive("networkConnectionProtoPppoaPhysicalEdit", function(){
	return {
		templateUrl: "/widgets/proto/network-connection-standalone-physical.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
})
.directive("networkConnectionProtoPppoaAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/proto/network-connection-proto-pppoa-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});
