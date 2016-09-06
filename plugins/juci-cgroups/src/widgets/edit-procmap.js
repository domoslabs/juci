JUCI.app
.directive("editProcmap", function(){
	return {
		templateUrl: "/widgets/edit-procmap.html",
		scope: {
			instance: "=ngModel"
		},
		replace: true,
		controller: "editProcmapCtrl"//,
		//require: "^ngModel"
	};
})
.controller("editProcmapCtrl", function($scope, $uci){
	//$uci.$sync("qos").done(function(){
	//	$scope.classes = $uci.qos["@class"].map(function(c){
	//		return { value: c[".name"], label: c[".name"] };
	//	});
	//	$scope.$apply();
	//});
});
