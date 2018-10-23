JUCI.app
.directive("uciOptionEdit", function(){
	return {
		templateUrl: "/widgets/uci-option-edit.html",
		scope: {
			param: "=ngModel"
		},
		controller: "uciOptionEdit",
		replace: true,
		require: "^ngModel"
	};
})
.controller("uciOptionEdit", function ($scope, $config, $rpc, $tr, gettext) {
	console.log("hlelo from ctrl")

	console.log("33", $scope)
	$scope.rmVictim = function (victim) {
		console.log($scope.param.victims.value);
		console.log($scope.param.victimsList);
		console.log($scope.param.nonVictims)
		if (victim == null)
			return;

		$scope.param.victims.value = $scope.param.victims.value.filter(includedVictim => includedVictim.indexOf(victim) < 0);
		$scope.param.victimsList = $scope.param.victimsList.filter(pair => pair.value.indexOf(victim) < 0);
		$scope.param.nonVictims.push({ label: victim, value: victim })
	}

	$scope.addVictim = function (victim) {
		if (victim == null)
			return;

		let victims = $scope.param.victims.value.filter(validMac); // not sure why we gotta filter it into new array..
		victims.push(victim);
		$scope.param.victims.value = victims;
		$scope.param.victimsList.push({ label: victim, value: victim })
		$scope.param.nonVictims = $scope.param.nonVictims.filter(pair => pair.value.indexOf(victim) < 0);
	};

	function validMac(mac) {
		return mac.length != null && mac.match(/([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/) && mac.length <= 17;
	}
	$scope.addVictimMan = function (victim) {
		if (victim == null || victim.length == 0) {
			$scope.param.victimError = $tr(gettext("Please enter a MAC"));
			return;
		}

		if (!validMac(victim)) {
			$scope.param.victimError = $tr(gettext("Invalid MAC, please give in the format aa:bb:cc:dd:ee:ff"));
			return;
		}

		if ($scope.param.victims.value.some(excluded => victim.indexOf(excluded) >= 0)) {
			$scope.param.victimError = $tr(gettext("The MAC is already excluded!"));
			return;
		}

		$scope.param.victimError = null;
		$scope.addVictim(victim);
	}

});
