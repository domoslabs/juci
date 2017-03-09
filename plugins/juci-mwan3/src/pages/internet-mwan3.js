JUCI.app
.controller("InternetMwan3Page", function($scope, $uci, $juciConfirm, $juciDialog, $tr, gettext, $firewall){
	$uci.$sync("mwan3").done(function(){
		$scope.interfaces = $uci.mwan3["@interface"];
		$scope.members = $uci.mwan3["@member"];
		$scope.policies = $uci.mwan3["@policy"];
		$scope.rules = $uci.mwan3["@rule"];
		$firewall.getZoneNetworks("wan").done(function(networks){
			$scope.allNetworks = networks;
			$scope.networks = (networks || []).filter(function(net){
				return !($scope.interfaces.find(function(iface){
					return iface[".name"] === net[".name"];
				}));
			});

			$scope.onAddInterface = function(){
				if(!$scope.networks.length)
					return;
				var model = {
					networks: $scope.networks.map(function(net){ return { label: String(net[".name"]).toUpperCase(), value: net[".name"] }; }),
					interface: ""
				};
				$juciDialog.show("mwan3-interface-add", {
					title: $tr(gettext("Add New Interface")),
					on_apply(btn, inst){
						var found = $scope.networks.find(function(net){
							return net[".name"] === model.interface;
						});
						if (!found)
							return;
						$uci.mwan3.$create({
							".type": "interface",
							".name": model.interface
						}).fail(function(e){
							console.log(e);
						}).always(function(){
							inst.close();
							$scope.$apply();
						});
					},
					model: model
				});
			}
			$scope.onDeleteInterface = function(interface){
				if(interface && interface.$delete instanceof Function){
					$juciConfirm.show($tr(gettext("Are you sure you want to delete interface"))
							+ " " + String(interface[".name"]).toUpperCase()).done(function(){
						interface.$delete().done(function(){
							$scope.interfaces.filter(function(iface){
								return iface[".name"] !== interface[".name"];
							});
							var net = $scope.allNetworks.find(function(net){
								return net[".name"] === interface[".name"];
							});
							if(net)
								$scope.networks.push(net);
							$scope.$apply();
						});
					});
				}
			}
		});
	});
});
