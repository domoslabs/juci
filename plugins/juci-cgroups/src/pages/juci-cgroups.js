JUCI.app.controller("cgroupsCtrl", function($scope, $uci, $juciInputModal, $tr){
	$scope.data = {newProc:"", newValue:""};
	$uci.$sync("cgroups").done(function(data){
		$scope.cgroups = $uci.cgroups;
		$scope.cgroup = $scope.cgroups["@cgroup"];
		$scope.procmaps = $scope.cgroups.procmap.procmap;
		$scope.cgroupsForJuciSelect = $scope.cgroup.map(function(x){ 
			var name = x[".name"];
			if(name !== "_root_"){ name = name.replace(/_/g,"/"); }
			return { label: name, value: name };
		});
		function getDotName(obj){ return obj[".name"]; }
		function hasUnderscore(str){ return str.indexOf("_")!==-1; }
		function underscore2Slash(str){ return str.replace(/_/g,"/"); }
		$scope.cgroupsForSelect = $scope.cgroup.map(getDotName).filter(hasUnderscore).map(underscore2Slash);

		$rpc.$call("cgroups", "procs").done(function(data){
			$scope.procsForSelect = data.procs;
		}).fail(function(e){ console.log("'ubus call cgroups procs' failed: "+e); });

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

	function verifyProcmap(proc){
		if(proc.match("^[a-zA-Z0-9_.]+=[a-zA-Z0-9/._]+$") === null){ // minidlna=3prt/normal
			return false;
		}
		return true;
	}

	$scope.addProcmap = function(){
		var newSetting = $scope.data.newProc + "=" + $scope.data.newValue;

		//if($scope.instance.procmap.value === ""){
		//	$scope.instance.procmap.value = [newSetting];
		//	return;
		//}

		var tmpList = $scope.procmaps.value.concat([newSetting]);
		$scope.procmaps.value = tmpList;

		$scope.data.newProc = "";
		$scope.data.newValue = "";
	};

	$scope.delProcmap = function(index){
		var tmpList = $scope.procmaps.value.concat();
		tmpList.splice(index,1);
		$scope.procmaps.value = tmpList;
	}
});
