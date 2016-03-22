//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("qosIfaceEdit", function(){
	return {
		templateUrl: "/widgets/qos-iface-edit.html",
		scope: {
			instance: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});
