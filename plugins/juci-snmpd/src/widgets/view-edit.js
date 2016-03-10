//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("snmpdViewEdit", function(){
	return {
		templateUrl: "/widgets/view-edit.html",
		scope: {
			view: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
	}
});
