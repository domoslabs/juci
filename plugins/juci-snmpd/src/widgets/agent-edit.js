//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("snmpdSystemEdit", function(){
	return {
		templateUrl: "/widgets/system-edit.html",
		scope: {
			system: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
	}
});
