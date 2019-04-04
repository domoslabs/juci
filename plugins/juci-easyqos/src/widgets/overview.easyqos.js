
JUCI.app
.directive("overviewWidget91EasyQoS", function(){
	return {
		templateUrl: "widgets/overview.easyqos.html",
		controller: "overviewWidgetEasyQoS",
		replace: true
	};
})
.controller("overviewWidgetEasyQoS", function($scope, $uci, $tr, gettext, $network, $config){
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

	$network.getConnectedClients().done(function(clients){
		clients.map(function(entry){
			$scope.allClients.push({
				"label": entry.hostname.length ? entry.hostname : entry.macaddr.toUpperCase(),
				"value": entry.macaddr, "selected":""});
		});
		$scope.$apply();
	});
	$scope.allRules = [];
	$scope.onApplyRule = function(value, client){
		$uci.easy_qos.$create({
			".type":"rule",
			"priority": value,
			"macaddr": client.value,
			"proto": "all"
		}).done(function(){
			$scope.$apply();
		});
	}
	$scope.href = $config.getWidgetLink("overviewWidget91EasyQoS");

});
