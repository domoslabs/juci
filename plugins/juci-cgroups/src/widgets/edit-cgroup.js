JUCI.app
.directive("editCgroup", function(){
	return {
		templateUrl: "/widgets/edit-cgroup.html",
		scope: {
			instance: "=ngModel"
		},
		replace: true,
		controller: "editCgroupCtrl",
		require: "^ngModel"
	};
})
.controller("editCgroupCtrl", function($scope, $uci){
	$scope.data = {newSetting:"", validSetting: false, error: null};

	function verifyOption(opt){
		if(opt.match("^[a-zA-Z0-9_.]+=[a-zA-Z0-9]+$") === null){ // memory.move_charge_at_immigrate=1
			return false;
		}
		return true;
	}

	$scope.add = function(){
		if(!$scope.instance || !$scope.instance.option){ return; }
		if($scope.instance.option.value === ""){
			$scope.instance.option.value = [$scope.data.newSetting];
			return;
		}

		var tmpList = $scope.instance.option.value.concat([$scope.data.newSetting]);
		$scope.instance.option.value = tmpList;

		$scope.data.newSetting = "";
	};

	$scope.del = function(index){
		if(!$scope.instance || !$scope.instance.option){ return; }

		var tmpList = $scope.instance.option.value.concat();
		tmpList.splice(index,1);
		$scope.instance.option.value = tmpList;
	}

	$scope.$watch("data.newSetting", function(opt){
		if(!$scope.data.newSetting) return;

		if(verifyOption(opt)){ $scope.data.error = null; }
		else{ $scope.data.error = "Valid format: file.name=value"; }
	}, false);
});
