//! Author: Reidar Cederqvist

JUCI.app.directive("firewallParentalControl", function(){
	return {
		templateUrl: "/widgets/firewall-parental-control.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		controller: "firewallParentalControlCtrl",
		require: "^ngModel"
	}
}).controller("firewallParentalControlCtrl", function($scope, $uci, $tr, gettext){
	$scope.$watch("model", function(cl){
		$scope.editRule = null;
		if(!cl || !cl.macaddr) return;
		$scope.rules = [];
		function update(){
			$uci.$sync("firewall").done(function(){
				$scope.rules = $uci.firewall["@rule"].filter(function(rule){
					if(!rule.parental || !rule.parental.value || !rule.src_mac || !rule.src_mac.value || rule.src_mac.value.length !== 1) return false;
					return rule.src_mac.value[0] === cl.macaddr;
				});
				$scope.$apply();
			});
		}update();
		$scope.onDeleteRule = function(rule){
			if(rule && rule.$delete && rule.$delete instanceof Function){
				rule.$delete().done(function(){
					update();
				});
			}
		}
		$scope.onEditRule = function(rule){
			$scope.errors = [];
			if(!rule || !rule.weekdays || !rule.start_time || !rule.stop_time) return;
			$scope.editRule = {
				days: rule.weekdays.value.split(" ").filter(function(x){ return x;}),
				time_start: rule.start_time.value,
				time_end: rule.stop_time.value,
				uci_rule: rule
			}
		}

		$scope.addNewRule = function(){
			$scope.editRule = {
				days: [],
				time_start: "",
				time_end: "",
				uci_rule: "new"
			}
		}

		$scope.onCancelEdit = function(){
			$scope.editRule = null;
		}

		var timeValidator = new UCI.validators.TimeValidator();
		var timespanValidator = new UCI.validators.TimespanValidator();

		$scope.onEditFinish = function(){
			if(!$scope.editRule) return;
			var r = $scope.editRule;
			$scope.errors = [];
			if(!r.days || r.days.length === 0){
				$scope.errors.push($tr(gettext("No day selected!")));
			}
			if(r.time_start === "" || r.time_end === ""){
				$scope.errors.push($tr(gettext("No start and/or end time selected!")));
			}else {
				var er = timeValidator.validate({value:r.time_start}) || timeValidator.validate({value: r.time_end}) ||
					timespanValidator.validate({value: r.time_start+"-"+r.time_end});
				console.log(er);
				if(er) $scope.errors.push(er);
			}
			$scope.errors = $scope.errors.filter(function(er){ return er !== null;});
			if($scope.errors && $scope.errors.length > 0) return;
			var rule = $scope.editRule;
			if(rule.uci_rule === "new"){
				$uci.firewall.$create({
					".type":"rule",
					"name": "Parental Rule",
					"parental":true,
					"src_mac":[cl.macaddr],
					"start_time":rule.time_start,
					"stop_time":rule.time_end,
					"weekdays":rule.days.join(" ")
				}).done(function(rule){
					$scope.editRule = null;
					$scope.rules.push(rule);
					$scope.$apply();
				});
			}else{
				var uci = rule.uci_rule;
				uci.start_time.value = rule.time_start;
				uci.stop_time.value = rule.time_end;
				uci.weekdays.value = rule.days.join(" ");
				$scope.editRule = null;
			}
		}
	}, false);
});
