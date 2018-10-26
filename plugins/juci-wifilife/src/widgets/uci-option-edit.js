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
	$scope.rmVictim = function (victim) {
		if (victim == null)
			return;

		$scope.param.victims.value = $scope.param.victims.value.filter(includedVictim => includedVictim.indexOf(victim) < 0);
		$scope.param.victimsList = $scope.param.victimsList.filter(pair => pair.value.indexOf(victim) < 0);
		$scope.param.nonVictims.push({ label: victim, value: victim })
	}

	$scope.addVictim = function (victim) {
		if (victim == null)
			return;

		$scope.param.victims.value = $scope.param.victims.value.filter($wifilife.validMac).push(victim);
		$scope.param.victimsList.push({ label: victim, value: victim })
		$scope.param.nonVictims = $scope.param.nonVictims.filter(pair => pair.value.indexOf(victim) < 0);
	};

	$scope.addVictimMan = function (victim) {
		if (victim == null || victim.length == 0) {
			$scope.param.victimError = $tr(gettext("Please enter a MAC"));
			return;
		}

		if (!$wifilife.validMac(victim)) {
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

	Array.prototype.swap = function (x, y) {
		let b = this[x];
		this[x] = this[y];
		this[y] = b;
		return this;
	}

	$scope.onMoveUp = function(idx) {
		$scope.param.params.value = $scope.param.params.value.slice().swap(idx, idx - 1); //slice to workaround uci not recording the initial change...?
	}

	$scope.onMoveDown = function (idx) {
		$scope.param.params.value = $scope.param.params.value.slice().swap(idx, idx + 1);
	}

	$scope.getTitle = function (title) {
		return title.split("_").map(elem => elem.charAt(0).toUpperCase() + elem.substr(1)).join(" ");
	}

});
