JUCI.app
	.directive("ruleEdit", function () {
		return {
			templateUrl: "/widgets/rule-edit.html",
			scope: {
				param: "=ngModel"
			},
			controller: "ruleEdit",
			replace: true,
			require: "^ngModel"
		};
	})
	.controller("ruleEdit", function ($scope, $config, $rpc, $tr, gettext, $wifilife, $uci) {
		$scope.rule = {
			options: [{ label: "steer", value: "steer" }, { label: "block", value: "block" }]
		}

		function validMac(mac) {
			return mac.length != null && mac.match(/([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/) && mac.length <= 17;
		}

		$scope.$watch("param.bss.value", function (mac) {
			if (mac == null)
				return;

			if (!validMac(mac)) {
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

			if (!validMac(mac)) {
				$scope.param.sta.error = "Invalid MAC";
				document.getElementById("staClass").classList.add('has-error');

			} else {
				$scope.param.sta.error = null;
				document.getElementById("staClass").classList.remove('has-error');
			}
		}, true);

	});
