JUCI.app
.directive("qosClassgroupsEdit", function(){
	return {
		templateUrl: "/widgets/qos-classgroups-edit.html",
		scope: {
			instance: "=ngModel"
		},
		replace: true,
		controller: "qosClassgroupsCtrl",
		require: "^ngModel"
	};
})
.controller("qosClassgroupsCtrl", function($scope, $uci, $tr){
	$scope.$watch("instance", function(){
		if(!$scope.instance) return;
		$uci.$sync("qos").done(function(){

			$scope.dummy = {value:""};
			$scope.addedClasses = $scope.instance.classes.value.map(function(c){
				return { value: c, label: c };
			});
			$scope.allClasses = $uci.qos["@class"].map(function(c){
				return { value: c[".name"], label: c[".name"] };
			});
			var addedClassNames = $scope.addedClasses.map(function(x){ return x.value; });
			$scope.unAddedClasses = $scope.allClasses.filter(function(x){
				return addedClassNames.indexOf(x.value) === -1;
			});

			$scope.delClassFromGroup = function(className){
				$scope.instance.classes.value = $scope.instance.classes.value.filter(function(c){
					return c !== className
				});
			};
			$scope.addClassToGroup = function(className){
				$scope.instance.classes.value = $scope.instance.classes.value.concat([className]);
			};

			$scope.reloadClasses = function(){
				$scope.addedClasses = $scope.instance.classes.value.map(function(c){
					return { value: c, label: c };
				});
				$scope.allClasses = $uci.qos["@class"].map(function(c){
					return { value: c[".name"], label: c[".name"] };
				});

				var addedClassNames = $scope.addedClasses.map(function(x){ return x.value; });
				$scope.unAddedClasses = $scope.allClasses.filter(function(x){
					return addedClassNames.indexOf(x.value) === -1;
				});
			}

			$scope.$apply();
		});
	}, false);
});
