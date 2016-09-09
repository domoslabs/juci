JUCI.app
.directive("editProcmap", function(){
	return {
		templateUrl: "/widgets/edit-procmap.html",
		scope: {
			instance: "=ngModel"
		},
		replace: true,
		controller: "editProcmapCtrl",
		require: "^ngModel"
	};
})
.controller("editProcmapCtrl", function($scope, $uci){
	$scope.data = {newSetting:"", validSetting: false, error: null};

	function verifyProc(proc){
		if(proc.match("^[a-zA-Z0-9_.]+=[a-zA-Z0-9/._]+$") === null){ // minidlna=3prt/normal
			return false;
		}
		return true;
	}

	$scope.add = function(){
		if(!$scope.instance || !$scope.instance.procmap){ return; }
		if($scope.instance.procmap.value === ""){
			$scope.instance.procmap.value = [$scope.data.newSetting];
			return;
		}

		var tmpList = $scope.instance.procmap.value.concat([$scope.data.newSetting]);
		$scope.instance.procmap.value = tmpList;

		$scope.data.newSetting = "";
	};

	$scope.del = function(index){
		if(!$scope.instance || !$scope.instance.procmap){ return; }

		var tmpList = $scope.instance.procmap.value.concat();
		tmpList.splice(index,1);
		$scope.instance.procmap.value = tmpList;
	}

	$scope.$watch("data.newSetting", function(proc){
		if(!$scope.data.newSetting) return;

		if(verifyProc(proc)){ $scope.data.error = null; }
		else{ $scope.data.error = "Valid format: process_name=directory/sub_directory"; }
	}, false);
});
