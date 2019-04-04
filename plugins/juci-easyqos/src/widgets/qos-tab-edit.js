JUCI.app
.directive("qosTabEdit", function(){
	return {
		templateUrl: "/widgets/qos-tab-edit.html",
		scope: {
			rule: "=ngModel"
		},
		replace: true,
		controller: "qosTabEditCtrl"
	}
}).controller("qosTabEditCtrl", function($scope, $tr, gettext, $network){
	$scope.allPriority = [
		{"label":"Lowest (0)", "value":"lowest"},
		{"label":"Low (1)", "value":"low"},
		{"label":"Best Effort (2)", "value":"besteffort"},
		{"label":"Normal (3)", "value":"normal"},
		{"label":"Video (4)", "value":"video"},
		{"label":"Medium (5)", "value":"medium"},
		{"label":"High (6)", "value":"high"},
		{"label":"Highest (7)", "value":"highest"}
	];
	$scope.allClients = [];

	$scope.supportedProtocols=[
		{label:"All", value:"all"},
		{label:"TCP", value:"tcp"},
		{label:"UDP", value:"udp"},
		{label:"TCP/UDP", value:""},
		{label:"ICMP", value:"icmp"}
	];

	$scope.$watch("rule", function(rule) {
		if(!rule) return;
		$scope.ports=rule.port.value.map(function(p){return {value: p}});
	}, false);

	$scope.$watch("ports", function(){
		if(!$scope.ports) return;
		$scope.rule.port.value = $scope.ports.map(function(p) { return p.value });
	}, true);
});
