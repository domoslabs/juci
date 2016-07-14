//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("owsdListenEdit", function(){
	return {
		templateUrl: "/widgets/owsd-listen-edit.html",
		scope: {
			listen: "=ngModel"
		},
		replace: true
	}
});
