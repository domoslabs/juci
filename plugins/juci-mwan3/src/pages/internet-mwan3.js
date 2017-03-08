JUCI.app
.controller("InternetMwan3Page", function($scope, $uci){
	$uci.$sync("mwan3").done(function(){
		$scope.interfaces = $uci.mwan3["@interface"];
		$scope.members = $uci.mwan3["@member"];
		$scope.policies = $uci.mwan3["@policy"];
		$scope.rules = $uci.mwan3["@rule"];
	});
});
