/*global Promise:false*/

JUCI.app
.controller("IceClientConfigurationPage", function($scope, $rpc, $uci){
	$uci.$sync("ice").done(function(){
		console.log($uci.ice);

		$scope.ice=$uci.ice.ice;
		$scope.cloud=$uci.ice.cloud;

		$scope.$apply();
	});

	JUCI.interval.repeat("ice",5000,function(next){

		$rpc.$call("juci.ice", "status").done(function(result){
			switch(result.status) {
				case 'Registered':
					$scope.css="label label-success";
					$scope.text=result.status;
				break;
				case 'Unregistered':
					$scope.css="label label-warning";
					$scope.text=result.status;
				break;
				case 'Offline':
					$scope.css="label label-danger";
					$scope.text=result.status;
				break;
				default:
					$scope.css="label label-danger";
					$scope.text="Undefined";
				break;
			}

			$scope.$apply();
		}).fail(function(e){
			console.error("error: "+ JSON.stringify(e));
		}).always(function(){next()});
	});

});

