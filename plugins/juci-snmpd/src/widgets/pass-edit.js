//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("snmpdPassEdit", function(){
	return {
		templateUrl: "/widgets/pass-edit.html",
		scope: {
			pass: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	}
});
