//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("netmodePicker", function(){
	return {
		templateUrl: "/widgets/netmode-picker.html",
		scope: {
			model: "=ngModel"
		},
		require: "^ngModel",
		controller: "netmodePickerCtrl",
		replace: true
	};
}).controller("netmodePickerCtrl", function($scope){
	$scope.getDesc = function(){
		if(!$scope.model || !$scope.model.allNetmodes) return "";
		var tmp = $scope.model.allNetmodes.find(function(nm){ return nm.value == $scope.model.selected; });
		if(tmp && tmp.desc) return tmp.desc;
		return "";
	};
});
