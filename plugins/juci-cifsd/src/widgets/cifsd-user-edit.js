JUCI.app
.directive("cifsdUserEdit", function(){
	return {
		scope: {
			user: "=ngModel"
		}, 
		templateUrl: "/widgets/cifsd-user-edit.html", 
		controller: "cifsdUserEdit",
		replace: true
	};
})
.controller("cifsdUserEdit", function($scope, $rpc){
	var passwd_entries = [];

	$rpc.$call("juci.system","passwd_entries").done(function(passwd_entriesIn){
		passwd_entries = passwd_entriesIn.entries;
	});

	$scope.$watch("user", function(user){
		if (!$scope.user || !$scope.user.user){ return; }

		var validUsername = function(){ //TODO: TRANSLATE
			this.validate = function(x){
				if (passwd_entries.indexOf(user.user.value) !== -1) {
					var errormsg = "Share username '"+user.user.value+"' taken or not allowed.";
					return errormsg;
				}
				if (!user.user.value.match(/^[0-9a-zA-Z_.-]+$/)){ // POSIX.1-2008: 3.437 User Name
					var errormsg = "Share username may only contain numbers, english letters, underscore, dot and hyphen.";
					return errormsg;
				}
				if (user.user.value.match(/^[-]+[0-9a-zA-Z_.-]*$/)){ // POSIX.1-2008: 3.437 User Name
					var errormsg = "Share username may not start with a hyphen.";
					return errormsg;
				}

				return null;
			}
		}
		user.user.validator = new validUsername();

	},false);
}); 
