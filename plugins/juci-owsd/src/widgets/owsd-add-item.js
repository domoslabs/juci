//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("owsdAddItem", function(){
	return {
		templateUrl: "widgets/owsd-add-item.html",
		scope: {
			model: "=ngModel"
		},
		replace: true
	}
});
