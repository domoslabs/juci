//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("mwan3MemberAdd", function(){
	return {
		templateUrl: "/widgets/mwan3-member-add.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
})
