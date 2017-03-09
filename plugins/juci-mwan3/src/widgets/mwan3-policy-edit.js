//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("mwan3PolicyEdit", function(){
	return {
		templateUrl: "widgets/mwan3-policy-edit.html",
		scope: {
			policy: "=ngModel"
		},
		controller: "mwan3PolicyEditCtrl",
		require: "^ngModel",
		replace: true
	}
}).controller("mwan3PolicyEditCtrl", function($scope, $uci){
	$scope.members = {
		input: [],
		output: [],
	}
	$scope.$watch("policy", function(policy){
		if(!policy)
			return;
		$scope.reloadMembers = function(){
			$scope.members.input = $uci.mwan3["@member"].map(function(member){
				var selected = (policy.use_member.value.find(function(mem){
					return mem === member[".name"];
				})) !== undefined;
				return { label: member[".name"], selected: selected };
			});
		}
		$scope.reloadMembers();
		$scope.$watch("members.output", function(out){
			if(!out)
				return;
			$scope.policy.use_member.value = out.filter(function(member){
				return member.selected;
			}).map(function(member){
				return member.label;
			});
		}, false);
	}, false);
});
