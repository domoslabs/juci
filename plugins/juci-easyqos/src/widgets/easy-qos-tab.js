
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
.controller("easyQosTabCtrl", function($scope, $uci, $tr, gettext, $network, $config){
	$uci.$sync("easy_qos").done(function () {
		$scope.allRules = $uci.easy_qos["@rule"] || [];
		$scope.allRules.map(function (rule) {
			rule.$statusList = [
				{ label: $tr(gettext("Priority")), value: rule.priority.value },
				{ label: $tr(gettext("Mac Address")), value: rule.macaddr.value },
				{ label: $tr(gettext("Protocol")), value: rule.proto.value },
				{ label: $tr(gettext("Ports")), value: rule.port.value },
				{ label: $tr(gettext("Comment")), value: rule.comment.value },
			];
		});

		$scope.allRules = $scope.allRules.filter(function (rule) {
			var found = false;
			rule.$statusList.forEach(element => {
				if (element.value === $scope.model.macaddr)
					found = true;
			});

			return found;
		})
		$scope.$apply();
	}).fail(function (e) { console.log(e); });

	$scope.allPriority = [
		{ "label": "Lowest (0)", "value": "lowest" },
		{ "label": "Low (1)", "value": "low" },
		{ "label": "Best Effort (2)", "value": "besteffort" },
		{ "label": "Normal (3)", "value": "normal" },
		{ "label": "Video (4)", "value": "video" },
		{ "label": "Medium (5)", "value": "medium" },
		{ "label": "High (6)", "value": "high" },
		{ "label": "Highest (7)", "value": "highest" }
	];

	$scope.client = [{ label: $scope.model.macaddr.toUpperCase(), value: $scope.model.macaddr}];

	$scope.getRuleTitle = function (item) {
		var na = $tr(gettext("N/A"));
		return String((item.comment.value || na));
	}

	$scope.onAddRule = function () {
		$uci.easy_qos.$create({
			".type": "rule",
			"macaddr": $scope.model.macaddr
		}).done(function (rule) {
			rule.$statusList = [
				{ label: $tr(gettext("Priority")), value: rule.priority.value },
				{ label: $tr(gettext("Mac Address")), value: rule.macaddr.value },
				{ label: $tr(gettext("Protocol")), value: rule.proto.value },
				{ label: $tr(gettext("Ports")), value: rule.port.value },
				{ label: $tr(gettext("Comment")), value: rule.comment.value },
			];
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

	$scope.href = $config.getWidgetLink("overviewWidget91EasyQoS");

});
