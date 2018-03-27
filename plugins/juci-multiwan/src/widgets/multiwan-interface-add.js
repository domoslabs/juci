//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("multiwanInterfaceAdd", function(){
	return {
		templateUrl: "/widgets/multiwan-interface-add.html",
		scope: {
			model: "=ngModel"
		},
		require: "^ngModel",
		replace: true
	}
});
