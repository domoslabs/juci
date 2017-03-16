//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("mwan3RuleEdit", function(){
	return {
		templateUrl: "widgets/mwan3-rule-edit.html",
		scope: {
			rule: "=ngModel"
		},
		controller: "mwan3RuleEditCtrl",
		require: "^ngModel",
		replace: true
	}
}).controller("mwan3RuleEditCtrl", function($scope, $uci, $tr, gettext){
	$scope.data = {};
	$scope.$watch("rule", function(rule){
		if(!rule)
			return;
		$scope.data.src_ip_any = rule.src_ip.value === "";
		$scope.data.dest_ip_any = rule.dest_ip.value === "";
		$scope.allPolicies = $uci.mwan3["@policy"].map(function(policy){
			return { label: policy[".name"], value: policy[".name"] };
		});
		$scope.allPolicies.push({ label: $tr(gettext("Default")), value: "default" });
		$scope.allProtocols = [
			{ label: $tr(gettext("All")), value: "all" },
			{ label: $tr(gettext("TCP")), value: "tcp" },
			{ label: $tr(gettext("UDP")), value: "udp" },
			{ label: $tr(gettext("ICMP")), value: "icmp" }
		];
		$scope.$watch("data", function(){
			if(!$scope.data)
				return;
			if($scope.data.src_ip_any)
				$scope.rule.src_ip.value = "";
			if($scope.data.dest_ip_any)
				$scope.rule.dest_ip.value = "";
		}, true);
		$scope.$watch("rule.proto.value", function(proto){
			if(!prot)
				return;
			if(!(proto === "tcp" || proto === "udp"))
				$scope.rule.dest_port.value = $scope.rule.dest_port.dvalue;
		}, false);

	}, false);
});
