JUCI.app.
factory("$password", function($modal){
	return {
		change: function(closable, user){
			var def = $.Deferred();
			var modalInstance = $modal.open({
				animation: false,
				backdrop: "static",
				keyboard: false,
				templateUrl: "widgets/juci-password-change.html",
				controller: "juciPasswordChangeCtrl",
				resolve: {
					closable: function(){return closable;},
					user: function(){return user}
				}
			});
			modalInstance.result.then(function (data) {
				setTimeout(function(){ // do this because the callback is called during $apply() cycle
					def.resolve(data);
				}, 0);
			}, function () {

			}).finally(function(){
				modalInstance.$destroy();

			});

			return def.promise();
		}
	};
})
.controller("juciPasswordChangeCtrl", function($scope, $modalInstance, closable, $rpc, gettext, $tr, user){
	$scope.closable = closable;
	$scope.errors = [];
	$scope.new_pass = "";
	$scope.cur_pass = "";
	$scope.rep_pass = "";
	$scope.showPassword = false;
	$scope.on_close = function(){
		$modalInstance.close();
	}
	$scope.on_submit = function(btn){
		$scope.errors = [];
		if($scope.cur_pass === "")
			$scope.errors.push($tr(gettext("You MUST enter current password")));
		if($scope.new_pass === "")
			$scope.errors.push($tr(gettext("You MUST enter new password")));
		if($scope.new_pass !== $scope.rep_pass)
			$scope.errors.push($tr(gettext("New passwords does not match")));
		if($scope.new_pass === $scope.cur_pass)
			$scope.errors.push($tr(gettext("New password can not be same as Current password")));
		if($scope.errors.length !== 0)
			return;
		$rpc.$call("router.system", "password_set", {
			user: user,
			password: $scope.new_pass,
			curpass: $scope.cur_pass
		}).done(function(data){
			$modalInstance.close();
		}).fail(function(data){
			$scope.errors.push($tr(gettext("Was unable to set password. Please make sure you have entered correct current password!")));
			$scope.$apply();
		});
	}

	function measureStrength(p) {
		var strongRegex = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
		var mediumRegex = new RegExp("^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
		var enoughRegex = new RegExp("(?=.{4,}).*", "g");

		if(strongRegex.test(p)) return 3;
		if(mediumRegex.test(p)) return 2;
		if(enoughRegex.test(p)) return 1;
		return 0;
	}

	$scope.$watch("new_pass", function(value){
		$scope.passwordStrength = measureStrength(value);
	}, true);
});
