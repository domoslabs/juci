//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("addBwInterfaceEdit", function(){
	return {
		templateUrl: "/widgets/add-bw-interface-edit.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});
