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
}).controller("qosTabEditCtrl", function($scope, $tr, gettext, $network, $easy_qos){
	$scope.allPriority = [
		{ "label": "Low", "value": "low" },
		{ "label": "Normal", "value": "normal" },
		{ "label": "High", "value": "high" },
	];
	$scope.allClients = [];

	$scope.supportedProtocols=[
		{label:"All", value:"all"},
		{label:"TCP", value:"tcp"},
		{label:"UDP", value:"udp"},
		{label:"TCP/UDP", value:""},
		{label:"ICMP", value:"icmp"}
	];

	$scope.portMapping = $easy_qos.getPortMapping();

	$scope.onAddPort = function (input) {
		if (!$scope.ports)
			$scope.ports = []
		for (var i = 0; i < $scope.ports.length; i++) {
			if ($scope.ports[i].value == input)
				return;
		}
		$scope.ports.push({ value: input.toString() })
	}

	var portMapping = $easy_qos.getPortMapping();

	$scope.$watch("rule", function(rule) {
		if(!rule) return;
		$scope.ports=rule.port.value.map(function(p){return {value: p}});

		$scope.ports = portMapping.map(function (port) {
			return {
				name: port.label, value: String(port.value),
				selected: !!rule.port.value.find(function (p) { return p === port.value })
			};
		});

	}, false);

	$scope.onSelectAll = function (item) {
		$scope.rule.port.value = [];
	};

	$scope.onSelectNone = function (item) {
		$scope.rule.port.value = [];
	};

	$scope.onItemClick = function () {
		$scope.rule.port.value = $scope.ports.filter(function (port) {
			return port.selected;
		}).map(function(port) {
			return port.value;
		})
	};
});
