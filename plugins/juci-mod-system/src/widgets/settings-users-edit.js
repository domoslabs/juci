

JUCI.app
.directive("settingsUsersEdit", function(){
	return {
		templateUrl: "/widgets/settings-users-edit.html",
		scope: {
			user: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "settingsUsersEditCtrl"
	};
})
.controller("settingsUsersEditCtrl", function($scope){
	$rpc.session.list().done(function(data){
		$scope.allAccessGroups = Object.keys(data.acls["access-group"]);
		$scope.$apply();
	 });
	 $scope.$watch("user", function(){
	 	if(!$scope.user || !$scope.user.write || !$scope.user.read) return;
		$scope.accesslist = $scope.allAccessGroups.map(function(acc){
			var write = ($scope.user.write.value.find(function(w){return w == acc}) == null ? false: true);
			var read =  ($scope.user.read.value.find(function(r){return r == acc}) == null ? false: true);
			return { name: acc, read: (write || read), write: write};
		});
		//console.log($scope.accesslist);
	}, false);
	$scope.$watch("accesslist", function(accesslist){
		if(!accesslist || !(accesslist instanceof Array)) return;
		var i = 0;
		var access;
		while(access = accesslist[i]){
			if(access.read == false && access.write == true){
				$scope.accesslist[i].read = true;
			}
			var read = access.read;
			var write = access.write;
			var old_write = ($scope.user.write.value.find(function(w){ return w == access.name; }) != null);
			var old_read = old_write || ($scope.user.read.value.find(function(r){ return r == access.name; }) != null);
			if(write != old_write){
				console.log("owrite: " + old_write + " write: " + write);
			}
			if(read != old_read){
				console.log("oread: " + old_read + " read: " + read)
			}
			i++;
		}
		console.log($scope.user);
	}, true);
});
