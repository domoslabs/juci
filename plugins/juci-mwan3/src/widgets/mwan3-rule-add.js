//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("mwan3RuleAdd", function(){
	return {
		templateUrl: "/widgets/mwan3-rule-add.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
})
