//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("qosIfaceEdit", function(){
	return {
		templateUrl: "/widgets/qos-iface-edit.html",
		scope: {
			instance: "=ngModel"
		},
		replace: true,
		controller: "qosIfaceEditCtrl",
		require: "^ngModel"
	};
})
.controller("qosIfaceEditCtrl", function($scope, $uci){
	$uci.$sync("qos").done(function(){
		$scope.allClassgroups = $uci.qos["@classgroup"].map(function(cg){
			return { value: cg[".name"], label: cg[".name"] };
		});
		$scope.$apply();
	});
});
