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
	$scope.knobsForSelect = [];
	$scope.knobsForSelectDefault = [];

	$rpc.$call("cgroups", "knobs").done(function(data){
		function removeReleaseAgent(str){ return str==="release_agent" ? false:true; }
		$scope.knobsForSelectDefault = data.knobs.filter(removeReleaseAgent);
	}).fail(function(e){ console.log("'ubus call cgroups knobs' failed: "+e); });

	function verifyValue(value){
		if(value.match("^[a-zA-Z0-9]+$")){ // memory.move_charge_at_immigrate=1
			$scope.data.error = false;
			return true;
		}
		$scope.data.error = true;
		return false;
	}

	function alreadyAdded(knob){ 
		if(!$scope.instance.option.value){ return false; }

		function knobInStr(str){ return str.indexOf(knob)!==-1; }
		if($scope.instance.option.value.find(knobInStr)){ return true; }
		return false;
	}

	$scope.add = function(){
		if(!$scope.instance || !$scope.instance.option){ return; }

		var newKnob = $scope.data.newKnob;
		if(alreadyAdded(newKnob)){ alert("Variable "+newKnob+" already set."); return; }
		if(!verifyValue($scope.data.newValue)){ return; }
		var newSetting = newKnob + "=" + $scope.data.newValue;

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
	});

	$scope.$watch("instance", function(instance){
		if(!instance){return;}
		var name = instance[".name"];
		if(name === "_root_"){
			name = "";
		}
		else{
			name = name.replace(/_/g,"/");
		}
		$rpc.$call("cgroups", "knobs", {'cgroup':name}).done(function(data){
			if(data.knobs.length!==0){ $scope.knobsForSelect = data.knobs; }
			else{ $scope.knobsForSelect = $scope.knobsForSelectDefault; }
			$scope.$apply();
		}).fail(function(e){ console.log("'ubus call cgroups knobs' failed: "+e); });
	});
});
