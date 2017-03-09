//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("mwan3InterfaceAdd", function(){
	return {
		templateUrl: "/widgets/mwan3-interface-add.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
})
