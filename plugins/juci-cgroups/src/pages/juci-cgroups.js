JUCI.app.controller("cgroupsCtrl", function($scope, $uci, $juciInputModal, $tr){
	$uci.$sync("cgroups").done(function(data){
		$scope.cgroups = $uci.cgroups;
		$scope.cgroup = $scope.cgroups["@cgroup"];
		$scope.procmap = $scope.cgroups.procmap;
		$scope.cgroupsForJuciSelect = $scope.cgroup.map(function(x){ 
			var name = x[".name"];
			if(name !== "_root_"){ name = name.replace(/_/g,"/"); }
			return { label: name, value: name };
		});

		$scope.cgroup.forEach(function(grp,ind){
			grp.$buttons = [ { label: $tr(gettext("Add subgroup")), on_click: onAddSubgroup }, ];
			if(!grp.option || !grp.option.value){ return; }
			grp.$statusList = grp.option.value.map(function(x){
				return { label: x.split("=")[0], value: x.split("=")[1]};

			});
		});
		
		$scope.$apply();
	});

	$scope.onAddCgroup = function(){
		var newCgroupName = {value:""};

		var createCgroup = function(){
			if(!newCgroupName.value.match("^[a-zA-Z0-9]+$")){ alert("Cgroup name can only contain characters A-Z, a-z and numbers 0-9"); return; }
			$uci.cgroups.$create(
				{ ".type": "cgroup", ".name": newCgroupName.value }
			).done(function(){ $scope.$apply(); });
			return true;
		}

		$juciInputModal.show("New Cgroup","Cgroup name",newCgroupName,createCgroup)
		.done().fail();
	}
	var onAddSubgroup = function(grp){
		var newCgroupName = {value:""};
		var parentName = grp[".name"];

		var createSubgroup = function(){
			if(!newCgroupName.value.match("^[a-zA-Z0-9]+$")){ alert("Cgroup name can only contain characters A-Z, a-z and numbers 0-9"); return; }
			$uci.cgroups.$create(
				{ ".type": "cgroup", ".name": parentName+"_"+newCgroupName.value }
			).done(function(){ $scope.$apply(); });
			return true;
		}

		$juciInputModal.show("New Subgroup for "+parentName,"Cgroup name",newCgroupName,createSubgroup)
		.done().fail();
	}


	$scope.onDelete = function(item){
		if(!item) return;
		item.$delete().done(function(){
			$scope.$apply();
		});
	};

	$scope.getName = function(item){
		if(!item) return "";
		return String(item[".name"]);
	}
});
