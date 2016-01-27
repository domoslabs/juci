

JUCI.app
.controller("juciSettingsUsersPageCtrl", function($scope, $rpc, $uci){
	$uci.$sync("rpcd").done(function(){
		if(!$uci.rpcd) return;
		$scope.users = $uci.rpcd["@login"];
		$scope.$apply();
	});
	$scope.getItemTitle = function(user){
		return user.username.value;
	};
});
