JUCI.app.controller("cgroupsCtrl", function($scope, $uci, $juciInputModal, $tr){
	$uci.$sync("cgroups").done(function(data){
		$scope.cgroups = $uci.cgroups;
		$scope.cgroup = $scope.cgroups["@cgroup"];
		$scope.procmap = $scope.cgroups["@procmap"];
		$scope.$apply();
	});







	$scope.onAddCgroup = function(){
		var newCgroupName = {value:""};

		var createCgroup = function(){
			if(newCgroupName.value === ""){ alert("NAMERROR"); return; }
			//if(newClassgroupName.name.match(/[\W]/) === null) { // If name contains no invalid character
			$uci.cgroups.$create(
				{ ".type": "cgroup", ".name": newCgroupName.value }
			).done(function(){ $scope.$apply(); });
			return true;
		}

		$juciInputModal.show("New Cgroup","inputitle",newCgroupName,createCgroup)
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
