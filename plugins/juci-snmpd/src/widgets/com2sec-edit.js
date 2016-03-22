//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("snmpdCom2secEdit", function(){
	return {
		templateUrl: "/widgets/com2sec-edit.html",
		scope: {
			com2sec: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	}
});
