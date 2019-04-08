JUCI.app
.directive("qosRuleEdit", function(){
	return {
		templateUrl: "/widgets/qos-rule-edit.html",
		scope: {
			rule: "=ngModel"
		},
		replace: true,
		controller: "qosRuleEditCtrl"
	}
}).controller("qosRuleEditCtrl", function($scope, $tr, gettext, $network, $easy_qos){
	$scope.allPriority = [
		{"label":"Lowest", "value":"lowest"},
		{"label":"Low", "value":"low"},
		{"label":"Best Effort", "value":"besteffort"},
		{"label":"Normal", "value":"normal"},
		{"label":"Video", "value":"video"},
		{"label":"Medium", "value":"medium"},
		{"label":"High", "value":"high"},
		{"label":"Highest", "value":"highest"}
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

	$scope.portMapping = $easy_qos.getPortMapping();

	$scope.$watch("rule", function(rule) {
		if(!rule) return;
		$scope.ports=rule.port.value.map(function(p){return {value: p}});
	}, false);

	$scope.onAddPort = function (input) {
		if (!$scope.ports)
			$scope.ports=[]
		for (var i = 0; i < $scope.ports.length; i++) {
			if ($scope.ports[i].value == input)
				return;
		}
		$scope.ports.push({ value: input.toString()})
	}

	$scope.$watch("ports", function(){
		if(!$scope.ports) return;

		error = false;
		for (var i = 0; i < $scope.ports.length; i++){
			if (!$easy_qos.validPort($scope.ports[i].value)) {
				$scope.ports.error ="Ports must be given as integers between 1 and 65535, other input or decimal values will not be commited!"
				error = true;
			}
		}
		if (!error)
			$scope.ports.error = null;
		$scope.rule.port.value = $scope.ports.map(function(p) { return p.value }).filter(function(p) { console.log($easy_qos.validPort(p)); return $easy_qos.validPort(p)});
	}, true);

});
