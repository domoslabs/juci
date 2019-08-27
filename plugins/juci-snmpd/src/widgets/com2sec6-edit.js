JUCI.app
.directive("snmpdCom2sec6Edit", function(){
	return {
		templateUrl: "/widgets/com2sec6-edit.html",
		scope: {
			com2sec6: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	}
});
