JUCI.app
	.directive("wifilifeRuleEdit", function () {
		return {
			templateUrl: "/widgets/wifilife-rule-edit.html",
			scope: {
				param: "=ngModel"
			},
			controller: "wifilifeRuleEdit",
			replace: true,
			require: "^ngModel"
		};
	})
	.controller("wifilifeRuleEdit", function ($scope, $wifilife) {
		$scope.rule = {
			options: [{ label: "steer", value: "steer" }, { label: "block", value: "block" }]
		}

		$scope.$watch("param.bss.value", function (mac) {
			if (mac == null)
				return;

			if (!$wifilife.validMac(mac)) {
				$scope.param.bss.error = "Invalid MAC";
				document.getElementById("bssClass").classList.add('has-error');

			} else{
				$scope.param.bss.error = null;
				document.getElementById("bssClass").classList.remove('has-error');
			}
		}, true);

		$scope.$watch("param.sta.value", function (mac) {
			if (mac == null)
				return;

			if (!$wifilife.validMac(mac)) {
				$scope.param.sta.error = "Invalid MAC";
				document.getElementById("staClass").classList.add('has-error');

			} else {
				$scope.param.sta.error = null;
				document.getElementById("staClass").classList.remove('has-error');
			}
		}, true);

	});
