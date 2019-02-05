JUCI.app
.controller("EasyqosPageCtrl", function($scope, $uci, $tr, gettext){

	$uci.$sync("easy_qos").done(function(){
		$scope.allRules = $uci.easy_qos["@rule"] || [];
		$scope.allRules.map(function(rule){
			rule.$statusList = [
				{ label: $tr(gettext("Priority")), value: rule.priority.value },
				{ label: $tr(gettext("Mac Address")), value: rule.macaddr.value },
				{ label: $tr(gettext("Protocol")), value: rule.proto.value },
				{ label: $tr(gettext("Ports")), value: rule.port.value },
				{ label: $tr(gettext("Comment")), value: rule.comment.value },
			];
		});
		$scope.$apply();
	}).fail(function(e){console.log(e);});


	$scope.getRuleTitle = function(item){
		var na = $tr(gettext("N/A"));
		return String((item.comment.value ||  na));
	}

	$scope.onAddRule = function(){
		$uci.easy_qos.$create({
			".type":"rule",
		}).done(function(rule){
			$scope.$apply();
		});
	}

	$scope.onDeleteRule = function(item){
		if(!item || !item.$delete) return;
		item.$delete().done(function(){
			$scope.$apply();
		});
	}
});
