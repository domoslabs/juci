//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("snmpdAccessEdit", function(){
	return {
		templateUrl: "/widgets/access-edit.html",
		scope: {
			access: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	}
});
