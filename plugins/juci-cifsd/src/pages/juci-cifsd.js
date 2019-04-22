JUCI.app
.controller("ServiceCifsdPage", function($scope, $tr, gettext, $uci, $cifsd, $firewall){
	$scope.data = {
		passwd_entries: []
	};
	$cifsd.getConfig().done(function(config){
		$scope.config = config;
		$scope.$apply();
	});

	$cifsd.getShares().done(function(shares){
		$scope.shares = shares;
		shares && shares.length && $scope.shares.map(function(share){
			share.$statusList = [
				["path", $tr(gettext("Path"))],
				["users", $tr(gettext("Allowed users"))],
				["guest_ok", $tr(gettext("Allow Guest Access"))],
				["read_only", $tr(gettext("Read Only"))]
			].map(function(pair){
				if(!share[pair[0]] || share[pair[0]].value === "" || share[pair[0]].value === undefined) return null;
				return { label: pair[1], value: share[pair[0]].value };
			}).filter(function(f){ return f !== null; });
		});
		$scope.$apply();
	});

	$cifsd.getUsers().done(function(users){
		$scope.users = users;
		users && users.length && $scope.users.map(function(user){
			if(user.desc && user.desc.value)
				user.$statusList = [{ label: $tr(gettext("Description")), value: user.desc.value }];
		});
		$scope.$apply();
	});

	$scope.getShareTitle = function(share){
		return share.name.value;
	}

	$scope.onCreateShare = function(){
		$uci.cifsd.$create({
			".type": "share",
			"name": $tr(gettext("NewNetworkShare"))
		}).done(function(){
			$scope.$apply();
		});
	}

	$scope.onDeleteShare = function($item){
		$item.$delete().done(function(){
			$scope.$apply();
		});
	}

	$scope.onCreateUser = function(){
		$uci.cifsd.$create({
			".type": "users",
			"user": "guest"
		}).done(function(){
			$scope.$apply();
		});
	}

	$scope.onDeleteUser = function($item){
		$item.$delete().done(function(){
			$scope.$apply();
		});
	}
});
