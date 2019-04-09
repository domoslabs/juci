JUCI.app
.directive("overviewWidget91EasyQoS", function(){
	return {
		templateUrl: "widgets/overview.easyqos.html",
		controller: "overviewWidgetEasyQoS",
		replace: true
	};
})
.controller("overviewWidgetEasyQoS", function($scope, $uci, $tr, gettext, $network, $config){
	$scope.allClients = [];
	$scope.allRules = [];
	var prioCount = 0;

	$network.getConnectedClients().done(function(clients){
		clients.map(function(entry){
			$scope.allClients.push({
				"label": entry.hostname.length ? entry.hostname : entry.macaddr.toUpperCase(),
				"macaddr": entry.macaddr, "switch": false, "ipaddr": entry.ipaddr, "default_rule": false});
		});
		$scope.$apply();
	}).done(function() {
		$uci.$sync("easy_qos").done(function() {
			$scope.allRules = $uci.easy_qos["@rule"] || [];

			$scope.allRules.forEach(function(rule) {
				$scope.allClients.forEach(function(client) {
					if (client.macaddr === rule.macaddr.value) {
						if (rule.proto.value != "all" || (rule.hasOwnProperty("port") && rule.port.value.length != 0))
							return;

						client.rule = rule;
						client.default_rule = true;
						if (rule.priority.value === "high") {
							client.switch = true;
							prioCount++;
						}
					}
				})
			})

			$scope.$apply();
		})
	});

	$scope.href = $config.getWidgetLink("overviewWidget91EasyQoS");
	$scope.onChange = function (client) {
		var prio = client.switch ? "high" : "normal"
		if (client.switch && prioCount >= 3) {
			client.switch = !client.switch;
			client.error = "Maximum three clients can be prioritized.";
			return;
		}

		$scope.allClients.forEach(function(client) {
			client.error = null;
		});

		client.switch ? prioCount ++ : prioCount--;

		if (!client.rule) {
			$uci.easy_qos.$create({
				".type": "rule",
				"priority": prio,
				"macaddr": client.macaddr,
				"proto": "all"
			}).done(function (rule) {
				client.rule = rule;
				$scope.$apply();
			});
		} else {
			if (!client.switch && !client.default_rule)
				client.rule.$delete().done(function() {
					client.rule = null;
					$scope.$apply();
				});
			else
				client.rule.priority.value = prio;


		}
	}
});
