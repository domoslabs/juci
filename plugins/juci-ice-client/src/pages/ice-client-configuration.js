JUCI.app
.controller("IceClientConfigurationPage", function($scope, $rpc, $uci, $tr, gettext){
	$uci.$sync("ice").done(function(){
		$scope.ice = $uci.ice.ice;
		$scope.cloud = $uci.ice.cloud;

		$scope.$apply();
	});

	JUCI.interval.repeat("ice",5000,function(next){

		$rpc.$call("juci.ice", "status").done(function(result){
			switch(result.status) {
				case 'Registered':
					$scope.css = "label label-success";
					$scope.text = $tr(gettext("Registered"));
				break;
				case 'Unregistered':
					$scope.css = "label label-warning";
					$scope.text = $tr(gettext("Unregistered"));
				break;
				case 'Offline':
					$scope.css = "label label-danger";
					$scope.text = $tr(gettext("Offline"));
				break;
				default:
					$scope.css = "label label-danger";
					$scope.text = $tr(gettext("Undefined"));
				break;
			}

			$scope.$apply();
		}).fail(function(e){
			console.error("error: "+ JSON.stringify(e));
		}).always(function(){next()});
	});

});

