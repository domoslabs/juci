//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("snmpdAgentEdit", function(){
	return {
		templateUrl: "/widgets/agent-edit.html",
		scope: {
			system: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	}
});
