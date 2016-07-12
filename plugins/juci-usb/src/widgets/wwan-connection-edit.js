//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("wwanConnectionEdit", function(){
	return {
		templateUrl: "widgets/wwan-connection-edit.html",
		controller: "wwanConnectionEditCtrl",
		scope: {
			model:"=ngModel"
		},
		replace:true
	};
}).controller("wwanConnectionEditCtrl", function($scope, $tr, gettext){
	$scope.$watch("model", function(model){
		if(!model) return;
		$scope.allZones = model.zones.map(function(zone){ return { label: String(zone.name.value).toUpperCase(), value: zone[".name"] };});
		$scope.allZones.push({label:$tr(gettext("No Zone")), value: ""});
		if(model.zones && model.zones.length){
			$scope.selectedZone = model.zones[0][".name"];
		}
	});
	$scope.$watch("selectedZone", function(value){
		$scope.model.zones.map(function(z){
			var is_in = z.network.value.find(function(n){ return n === $scope.model.con[".name"];}) || false;
			if(z[".name"] === value){
				if(!is_in)
					z.network.value = [$scope.model.con[".name"]].concat(z.network.value);
			}
			else{
				if(is_in)
					z.network.value = z.network.value.filter(function(n){ return n !== $scope.model.con[".name"];});
			}
		});
	}, true);
});
