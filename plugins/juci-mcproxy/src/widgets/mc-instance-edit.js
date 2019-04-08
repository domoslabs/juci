JUCI.app
.directive("mcInstanceEdit", function(){
		return {
				templateUrl: "/widgets/mc-instance-edit.html",
				scope: {
						instance: "=ngModel"
				},
				replace: true,
				controller: "mcInstanceEditCtrl"
		}
}).controller("mcInstanceEditCtrl", function($scope, $network, $uci, $tr, gettext){
		$scope.$watch("instance", function(instance) {
				if(!instance) return;
				$uci.$sync("network").done(function() {
						var bridge_element = $uci.network["@interface"].map(function(x){
								if (x.type.value === "bridge") {
										var bridge_name = "br-"+x[".name"];
										return { name: bridge_name + "(" + String(x.ifname.value) +")", value: bridge_name,
												selected: !!instance.downstream.value.find(function(dl)
																{ return dl === bridge_name})};
								}
						});
						$scope.downstreamInterface = {
						};
						$scope.downstreamInterface.all = $uci.network["@device"].map(function(x){
								return { name: String(x[".name"])+"("+String(x.name.value)+")", value: x.name.value,
										selected: !!instance.downstream.value.find(function(dl)
														{ return dl === x.name.value})};
						});
						bridge_element.forEach(function(element){
								if( element !== undefined ) {
										$scope.downstreamInterface.all.push(element);
								}
						});
						$scope.upstreamInterface = {
						};
						$scope.upstreamInterface.all = $uci.network["@device"].map(function(x){
								return { name: String(x[".name"])+"("+String(x.name.value)+")", value: x.name.value,
										selected: !!instance.upstream.value.find(function(dl)
														{ return dl === x.name.value})};
						});
						$scope.$apply();
				});

		});

		$scope.retrivalType = [
			{ label: 'WAN', value: 'wan' },
			{ label: 'LAN', value: 'lan' }
		];

		$scope.onSelectAll = function(item) {
				$scope.instance.downstream.value = $scope.downstreamInterface.selected.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
				$scope.instance.upstream.value = $scope.upstreamInterface.selected.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
		};
		$scope.onSelectNone = function(item) {
				$scope.instance.downstream.value = $scope.downstreamInterface.selected.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
				$scope.instance.upstream.value = $scope.upstreamInterface.selected.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
		};
		$scope.onItemClick = function(item) {
				$scope.instance.downstream.value = $scope.downstreamInterface.selected.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
				$scope.instance.upstream.value = $scope.upstreamInterface.selected.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
		};
});
