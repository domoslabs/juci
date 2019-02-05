JUCI.app
.directive("ruleEdit", function(){
	return {
		templateUrl: "/widgets/rule-edit.html",
		scope: {
			rule: "=ngModel"
		},
		replace: true,
		controller: "ruleEditCtrl"
	}
}).controller("ruleEditCtrl", function($scope, $tr, gettext, $network){
	$scope.allPriority = [
		{"label":"Lowest (0)", "value":"lowest"},
		{"label":"Low (1)", "value":"low"},
		{"label":"Best (2)", "value":"best"},
		{"label":"Normal (3)", "value":"normal"},
		{"label":"Video (4)", "value":"video"},
		{"label":"Medium (5)", "value":"medium"},
		{"label":"High (6)", "value":"high"},
		{"label":"Highest (7)", "value":"highest"}
	];
	$scope.allClients = [];

	$network.getConnectedClients().done(function(clients){
		clients.map(function(entry){
			$scope.allClients.push({"label": String(entry.hostname) + "(" + String(entry.macaddr) + ")",
				"value": String(entry.macaddr)});
		});
		$scope.$apply();
	});
	
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
