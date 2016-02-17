

JUCI.app
.directive("settingsUsersEdit", function(){
	return {
		templateUrl: "/widgets/settings-users-edit.html",
		scope: {
			user: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "settingsUsersEditCtrl"
	};
})
.controller("settingsUsersEditCtrl", function($scope, $rpc, $uci){
	var user_acls = {};
	$scope.$watch("user", function(user){
		$scope.allAccessGroups = [];
		$scope.data = {
			pages: [],
			this_user_type: ""
		};
		user_acls = {};
		if(!user) return;
		async.series([
			function(next){
				$rpc.session.list().done(function(data){
					$scope.allAccessGroups = Object.keys(data.acls["access-group"]);
				 }).always(function(){next();});
			},
			function(next){
				console.log(user);
				if(user.write.value.find(function(w){ return w == "user-support"; })){
					$scope.data.this_user_type = "user-support";
				}
				$scope.user.write.value.map(function(w){
					user_acls[w] = true;
				});
				next();
			},
			function(next){
				$uci.$sync(["rpcd","juci"]).done(function(){
					$scope.data.pages = $uci.juci["@menu"].map(function(menu){
						if(menu.acls.value.find(function(acl){
							return !user_acls[acl];
						})){
							menu["_access"] = false;
						}else{
							menu["_access"] = true;
						}
						if(menu.acls.value.length == 0) menu["_disabled"] = true;
						return menu;
					});
				}).always(function(){next();});
			}],
		function(){
			$scope.onSwitch = function(page){
				var tmp = [];
				if($scope.user.username.value == "user"){
					page.acls.value.map(function(acl){
						if(!page["_access"] && acl == "user-support")return;
						if(!page["_access"] && acl == "user-admin") return;
						tmp.push(acl);
					});
					if(page["_access"])tmp.push("user-support");
					page.acls.value = tmp;
				}else{
					page.acls.value.map(function(acl){
						if(!page["_access"] && acl == "user-admin")return;
						tmp.push(acl);
					});
					if(page["_access"])tmp.push("user-admin");
					page.acls.value = tmp;
				}
				console.log(page);
			};
			$scope.$apply();
		});
	}, false);
	JUCI.interval.repeat("test-user-asdfasdf", 1000, function(done){
		if(!$scope.data || !$scope.data.pages || !$uci || !$uci.juci["@menu"]){
			done();
			return;
		}
		$scope.data.pages = $uci.juci["@menu"].map(function(menu){
			if(menu.acls.value.find(function(acl){
				return !user_acls[acl];
			})){
				menu["_access"] = false;
			}else{
				menu["_access"] = true;
			}
			if(menu.acls.value.length == 0) menu["_disabled"] = true;
			return menu;
		});
		$scope.$apply();
		done();
	});
});
