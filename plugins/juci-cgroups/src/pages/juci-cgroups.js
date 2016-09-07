JUCI.app.controller("cgroupsCtrl", function($scope, $uci, $juciInputModal, $tr){
	$uci.$sync("cgroups").done(function(data){
		$scope.cgroups = $uci.cgroups;
		$scope.cgroup = $scope.cgroups["@cgroup"];
		$scope.procmap = $scope.cgroups["@procmap"];
		$scope.$apply();
	});

	title = "STOR TITEL";
	expl = "SUM EXPL";
	//validator = function(){return null;};//$scope.cgroups[0].options.validator;
	//value = "";//$scope.cgroups[0].options.value;
	//model = {"value":value, "validator":validator };
	$scope.variable = "";
	function printVariable(){console.log($scope.variable);}

	$scope.create = function(){
		$juciInputModal.show("New Cgroup",expl,$scope.variable,printVariable)
			.done().fail();
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
