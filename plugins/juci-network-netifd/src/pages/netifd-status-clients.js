//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("NetifdStatusClientsPage", function($scope, $network){
	$network.getConnectedClients().done(function(clients){
		$scope.clients = clients;
		$scope.$apply();
	});
}); 
