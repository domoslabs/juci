JUCI.app
.directive("uciOptionEdit", function(){
	return {
		templateUrl: "/widgets/uci-option-edit.html",
		scope: {
			param: "=ngModel"
		},
		controller: "uciOptionEdit",
		replace: true,
		require: "^ngModel"
	};
})
.controller("uciOptionEdit", function ($scope, $config, $rpc, $tr, gettext, $wifilife) {
	console.log("hlelo from ctrl")
	console.log($wifilife);
	console.log($scope)
	$scope.steer = $wifilife.steer;
});
