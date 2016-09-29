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

	$scope.$watch('instance',function(){
		if(!$scope.instance){ return; }
		if($scope.instance.download.value > 0){
			$scope.instance.showdown = true;
		}
		if($scope.instance.upload.value > 0){
			$scope.instance.showup = true;
		}
	},false);
	
	$scope.$watch('instance.showdown',function(){
		if($scope.instance){
			if($scope.instance.showdown === false){
				$scope.instance.download.value = "";
			}
			if($scope.instance.showdown === true && $scope.instance.download.ovalue){
				$scope.instance.download.value = $scope.instance.download.ovalue;
			}
		}
	},true);
	$scope.$watch('instance.showup',function(){
		if($scope.instance){
			if($scope.instance.showup === false){
				$scope.instance.upload.value = "";
			}
			if($scope.instance.showup === true && $scope.instance.upload.ovalue){
				$scope.instance.upload.value = $scope.instance.upload.ovalue;
			}
		}
	},true);
});
