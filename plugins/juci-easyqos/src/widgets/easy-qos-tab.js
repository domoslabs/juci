
JUCI.app
.directive("easyQosTab", function(){
	return {
		templateUrl: "widgets/easy-qos-tab.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		controller: "easyQosTabCtrl",
		require: "^ngModel"
	};
})
.controller("easyQosTabCtrl", function($scope, $uci, $tr, gettext, $network, $config, $easy_qos){
	$uci.$sync("easy_qos").done(function () {
		$scope.allRules = $uci.easy_qos["@rule"] || [];
		$scope.allRules = $scope.allRules.filter(function (rule) {
			return (rule.macaddr.value === $scope.model.macaddr);
		})
		$scope.$apply();
	}).fail(function (e) { console.log(e); });

	$scope.editRule = null;
	var portMapping = $easy_qos.getPortMapping();

	$scope.allPriority = [
		{ "label": "Low", "value": "low" },
		{ "label": "Normal", "value": "normal" },
		{ "label": "High", "value": "high" },
	];

	$scope.client = [{ label: $scope.model.macaddr.toUpperCase(), value: $scope.model.macaddr}];
	$scope.getPorts = function (rule) {
		if (rule == undefined || rule.port == undefined)
			return;

		if (rule.port.value.length == 0)
			return "All";

		var ports = portMapping.map(function(port) {
			return rule.port.value.includes(String(port.value)) ? port.label : null
		}).filter(function(port) {
			return port != null;
		});

		return ports.join(", ");
	}

	$scope.getRuleTitle = function (item) {
		var na = $tr(gettext("N/A"));
		return String((item.comment.value || na));
	}

	$scope.onAddRule = function () {
		$uci.easy_qos.$create({
			".type": "rule",
			"macaddr": $scope.model.macaddr
		}).done(function (rule) {
			$scope.allRules.push(rule);
			$scope.$apply();
		});
	}

	$scope.onDeleteRule = function (item) {
		if (!item || !item.$delete) return;
		item.$delete().done(function () {
			$scope.allRules = $scope.allRules.filter(function(rule) {
				return !(rule == item)
			})
			$scope.$apply();
		});
	}

	$scope.onEditRule = function (rule) {
		console.log($scope.editRule, $scope.rule, rule);
		if ($scope.rule == undefined || $scope.rule == rule)
			$scope.editRule = !$scope.editRule;

		if (!$scope.editRule)
			$scope.rule = undefined
		else
			$scope.rule = rule;
	}

	$scope.onEditFinish = function () {
		$scope.rule = undefined
		$scope.editRule = false;
	}

	//$scope.href = $config.getWidgetLink("overviewWidget91EasyQoS");

});
