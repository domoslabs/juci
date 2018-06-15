JUCI.app.directive("networkDslCreateDevice", function(){
	return {
		templateUrl: "widgets/network-dsl-create-device.html",
		scope: {
			model: "=ngModel",
		},
		replace: true,
		require: "^ngModel",
	};
});
