JUCI.app.
	controller("createRule", function ($scope, $config, $rpc, $tr, gettext, $modalInstance, $uci) {
	$scope.rule = {
		sta: undefined,
		type: undefined,
		bss: undefined,
		//duration: 0,
		options: [{ label: "steer", value: "steer" }, { label: "block", value: "block" }],
		error: undefined
	}

	console.log("33", $scope)

	function validMac(mac) {
		return mac.length != null && mac.match(/([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/) && mac.length <= 17;
	}

	$scope.ok = function () {
		if ($scope.rule.action == null) {
			$scope.rule.error = $tr(gettext("Please provide rule type."));
			return;
		} else if ($scope.rule.bss == null) {
			$scope.rule.error = $tr(gettext("Please select an access point."));
			return;
		} else if ($scope.rule.sta == null || !validMac($scope.rule.sta)) {
			$scope.rule.error = $tr(gettext("Please provide a valid client MAC address."));
			return;
		}

		$uci.wifilife.$create({
			".type": "rule_custom",
			"action": $scope.rule.action,
			"sta": $scope.rule.sta,
			"bss": $scope.rule.bss,
			//"duration": $scope.rule.duration
		}).done(function (section) {
			section.$statusList = [];
			section.$statusList.push({ label: $tr(gettext("Action")), value: $scope.rule.action })
			section.$statusList.push({ label: $tr(gettext("STA")), value: $scope.rule.sta })
			section.$statusList.push({ label: $tr(gettext("BSS")), value: $scope.rule.bss })
			//section.$statusList.push({ label: $tr(gettext("Duration")), value: $scope.rule.duration })
			$scope.$apply();
			$modalInstance.close(section);
		});
	}

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
