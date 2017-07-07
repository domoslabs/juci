
JUCI.app
.directive("qosClassesEdit", function(){
	return {
		templateUrl: "/widgets/qos-classes-edit.html",
		scope: {
			instance: "=ngModel"
		},
		replace: true,
		controller: "qosClassesCtrl",
		require: "^ngModel"
	};
})
.controller("qosClassesCtrl", function($scope, $uci){
	$scope.priosums = [];
	$uci.$sync("qos").done(function(){
		$scope.getPrio = [];
		$uci.qos["@class"].forEach(function(c){
			$scope.getPrio[c[".name"]] = c.priority;
		});
		$scope.classgroups = $uci.qos["@classgroup"].map(function(cg){
			return { name:cg[".name"], classes:cg.classes };
		});
		$scope.$apply();
	});
	function sum_prios(cgrp){
		var out = 0;
		cgrp.classes.value.forEach( function(c){ out += $scope.getPrio[c].value; } );
		return out;
	}
		function grpHasClass(cgrp){
			if(cgrp.classes.value.indexOf($scope.instance[".name"]) !== -1){ return true; }
			else{ return false; }
		}
	$scope.$watch("instance.priority.value", function(value){
		if(!$scope.instance){ return; }
		$scope.priosums = $scope.classgroups.filter(grpHasClass).map(function(cgrp){
			//return cgrp.name + " total: " + String(sum_prios(cgrp)) + "======" + String(100*value/sum_prios(cgrp)) + "%";
			return {cgrpname:cgrp.name, percentage:(100*value/sum_prios(cgrp)).toFixed(2)};
		});
	}, true);
});
