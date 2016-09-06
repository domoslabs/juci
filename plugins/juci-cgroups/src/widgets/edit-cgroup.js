JUCI.app
.directive("editCgroup", function(){
	return {
		templateUrl: "/widgets/edit-cgroup.html",
		scope: {
			instance: "=ngModel"
		},
		replace: true,
		controller: "editCgroupCtrl"//,
		//require: "^ngModel"
	};
})
.controller("editCgroupCtrl", function($scope, $uci){
	//$uci.$sync("qos").done(function(){
	//	$scope.classes = $uci.qos["@class"].map(function(c){
	//		return { value: c[".name"], label: c[".name"] };
	//	});
	//	$scope.$apply();
	//});
});
