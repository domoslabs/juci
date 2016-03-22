//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("snmpdGroupEdit", function(){
	return {
		templateUrl: "/widgets/group-edit.html",
		scope: {
			group: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	}
});
