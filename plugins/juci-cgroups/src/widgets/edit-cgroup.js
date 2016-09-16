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
.controller("editCgroupCtrl", function($scope, $uci, $juciInputModal){
	$scope.data = {newKnob:"", newValue:"", error:false, errormsg:"Value can only be numbers and characters a-z, A-Z."};

	$rpc.$call("cgroups", "knobs").done(function(data){
		$scope.knobsForSelect = data.knobs;
	}).fail(function(e){ console.log("'ubus call cgroups knobs' failed: "+e); });

	function verifyValue(value){
		if(value.match("^[a-zA-Z0-9]+$")){ // memory.move_charge_at_immigrate=1
			$scope.data.error = false;
			return true;
		}
		$scope.data.error = true;
		return false;
	}
	//function verifySetting(setting){
	//	if(setting.match("^[a-zA-Z0-9_.]+=[a-zA-Z0-9]+$") === null){ // memory.move_charge_at_immigrate=1
	//		return false;
	//	}
	//	return true;
	//}


	$scope.add = function(){
		if(!$scope.instance || !$scope.instance.option){ return; }

		var newSetting = $scope.data.newKnob + "=" + $scope.data.newValue;
		if(!verifyValue($scope.data.newValue)){ return; }

		if($scope.instance.option.value === ""){
			$scope.instance.option.value = [newSetting];
			return;
		}

		var tmpList = $scope.instance.option.value.concat([newSetting]);
		$scope.instance.option.value = tmpList;

		$scope.data.newKnob = "";
		$scope.data.newValue = "";
	};

	$scope.del = function(index){
		if(!$scope.instance || !$scope.instance.option){ return; }

		var tmpList = $scope.instance.option.value.concat();
		tmpList.splice(index,1);
		$scope.instance.option.value = tmpList;
	}
	$scope.$watch("data.newValue", function(value){
		if(!value){ $scope.data.error=false; return; }
		verifyValue(value);
	},false);
});
