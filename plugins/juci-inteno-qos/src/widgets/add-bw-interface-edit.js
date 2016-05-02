//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("addBwInterfaceEdit", function(){
	return {
		scope: {
			newIface: "=ngModel"
		},
		replace: true,
		templateUrl: "/widgets/add-bw-interface-edit.html"
		//require: "^ngModel"
	};
});
