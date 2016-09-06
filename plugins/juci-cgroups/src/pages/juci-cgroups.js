JUCI.app.controller("cgroupsCtrl", function($scope, $uci){
	$uci.$sync("cgroups").done(function(data){
		$scope.cgroups = $uci.cgroups;
		$scope.cgroup = $scope.cgroups["@cgroup"];
		$scope.procmap = $scope.cgroups["@procmap"];
		$scope.$apply();
	});


	$scope.add = function(){

	}
	$scope.getName = function(item){
		if(!item) return "";
		return String(item[".name"]);
	}
	$scope.delete = function(item){
		if(!item) return;
		item.$delete().done(function(){
			console.log("DELETED");
		});
	};
});
