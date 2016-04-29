
JUCI.app
.directive("qosClassesEdit", function(){
	return {
		templateUrl: "/widgets/qos-classes-edit.html",
		scope: {
			instance: "=ngModel"
		},
		replace: true,
		controller: "qosClassesCtrl",
		require: "^ngModel"
	};
})
.controller("qosClassesCtrl", function($scope, $uci){
	$uci.$sync("qos").done(function(){
		$scope.classes = $uci.qos["@class"].map(function(c){
			return { value: c[".name"], label: c[".name"] };
		});
		$scope.$apply();
	});
});
