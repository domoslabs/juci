//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("statusCatvCtrl", function($rpc, $scope){
	if($rpc.catv["get-all"]().done(function(data){
		console.log(data);
	});
});
