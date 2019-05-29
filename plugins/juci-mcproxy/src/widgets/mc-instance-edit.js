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
		var copy = dcopy = [];
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
							all: []
						};

						/* add all @device sections */
						$scope.upstreamInterface.all = $uci.network["@device"].map(function(x){
								return { name: String(x[".name"])+"("+String(x.name.value)+")", value: x.name.value,
										selected: !!instance.upstream.value.find(function(dl)
														{ return dl === x.name.value})};
						});

						/* add whatever is already in config, assuming it is not in device section */
						instance.upstream.value.forEach(function(ifname) {
							if (!$scope.upstreamInterface.all.length ||
									!$scope.upstreamInterface.all.filter(function(x) {return ifname === x.value}).length)
								$scope.upstreamInterface.all.push({
									name: ifname, value: ifname,
									selected: true
								});
						})

						/* add whatver is under section 'wan' option 'ifname' */
						$uci.network.wan.ifname.value.split(' ').forEach(function (ifname) {
							if (!$scope.upstreamInterface.all.length ||
								!$scope.upstreamInterface.all.filter(function (x) {return ifname === x.value }).length)
								$scope.upstreamInterface.all.push({
									name: ifname, value: ifname,
									selected: false
								});
						})

						/* create copies for on-reset, cannot use [...] because old ecma version? */
						ucopy = instance.upstream.value.filter(function() {return true;})
						dcopy = instance.downstream.value.filter(function () { return true; })
						$scope.$apply();
				});

		});

		$scope.retrivalType = [
			{ label: 'WAN', value: 'wan' },
			{ label: 'LAN', value: 'lan' }
		];

		$scope.onSelectAll = function(item) {
				$scope.instance.downstream.value = $scope.downstreamInterface.all.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
				$scope.instance.upstream.value = $scope.upstreamInterface.all.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
		};
		$scope.onSelectNone = function(item) {
				$scope.instance.downstream.value = $scope.downstreamInterface.all.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
				$scope.instance.upstream.value = $scope.upstreamInterface.all.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
		};
		$scope.onItemClick = function(item) {
				$scope.instance.downstream.value = $scope.downstreamInterface.all.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
				$scope.instance.upstream.value = $scope.upstreamInterface.all.filter(function(sel){
						return sel.selected;
				}).map(function(sel){
						return sel.value;
				});
		};
		$scope.onReset = function (direction) {
			if (direction === "upstream")
				$scope.instance.upstream.value = ucopy.filter(function() {return true;});
			else if (direction === "downstream")
				$scope.instance.downstream.value = dcopy.filter(function() {return true;});
		};
});
