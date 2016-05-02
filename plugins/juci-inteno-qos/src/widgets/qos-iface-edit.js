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

	//boolean==true => function körs när hela instance byts. false=>när nåt i instance endras
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
		if($scope.instance && $scope.instance.showdown === false){
			$scope.instance.download.value = "";
		}
	},true);
	$scope.$watch('instance.showup',function(){
		if($scope.instance && $scope.instance.showup === false){
			$scope.instance.download.value = "";
		}
	},true);
});
