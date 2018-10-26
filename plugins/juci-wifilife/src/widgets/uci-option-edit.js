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
.controller("uciOptionEdit", function ($scope) {
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
