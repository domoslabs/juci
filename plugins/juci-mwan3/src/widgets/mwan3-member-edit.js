//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("mwan3MemberEdit", function(){
	return {
		templateUrl: "widgets/mwan3-member-edit.html",
		scope: {
			member: "=ngModel"
		},
		controller: "mwan3MemberEditCtrl",
		require: "^ngModel",
		replace: true
	}
}).controller("mwan3MemberEditCtrl", function($scope, $uci){
	$scope.$watch("member", function(iface){
		if(!iface)
			return;
		$scope.interfaces = $uci.mwan3["@interface"].map(function(iface){
			return { label: String(iface[".name"]).toUpperCase(), value: iface[".name"] };
		});
	}, false);
});
