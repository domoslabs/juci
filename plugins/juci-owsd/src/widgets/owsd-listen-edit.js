//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("owsdListenEdit", function(){
	return {
		templateUrl: "/widgets/owsd-listen-edit.html",
		scope: {
			listen: "=ngModel"
		},
		replace: true,
		controller: "owsdListenEditCtrl"
	}
}).controller("owsdListenEditCtrl", function($scope, $network, $juciDialog, $tr, gettext){
	$scope.$watch("listen", function(listen){
		if(!listen) return;
		$scope.$watch("listen.ipv6.value", function(ipv6){
			if(ipv6 === null || ipv6 === undefined) return;
			if(!ipv6){
				$scope.listen.ipv6only.value = false;
			}
		}, false);
		$network.getNetworks().done(function(networks){
			$scope.networks = networks.map(function(net){ return { label: String(net[".name"]).toUpperCase(), value: net[".name"] }; });
			$scope.$apply();
		});
	}, false);
	$scope.onAddOrigin = function(){
		var model = {};
		$juciDialog.show("owsd-add-item", {
			title:$tr(gettext("Add OWSD Origin")),
			buttons: [
				{ label: $tr(gettext("Add")), value: "add", primary: true },
				{ label: $tr(gettext("Cancel")), value: "cancel"}
			],
			on_button: function(btn, inst){
				if(btn.value == "add"){
					if(!model.name || model.name.length < 1) return;
					$scope.listen.origin.value = $scope.listen.origin.value.concat([model.name]);
					$scope.$apply();
				}
				inst.close();
			},
			model: model
		});
	}
	$scope.onDeleteOrigin = function(item){
		if(!item) return;
		$scope.listen.origin.value = $scope.listen.origin.value.filter(function(o){ return o !== item; });
	}
});
