JUCI.app
.directive("qosClassgroupsEdit", function(){
	return {
		templateUrl: "/widgets/qos-classgroups-edit.html",
		scope: {
			instance: "=ngModel"
		},
		replace: true,
		controller: "qosClassgroupsCtrl",
		require: "^ngModel"
	};
})
.controller("qosClassgroupsCtrl", function($scope, $uci){
	$uci.$sync("qos").done(function(){
		/*$scope.classgroups = $uci.qos["@classgroup"].map(function(c){
			return { value: c[".name"], label: c[".name"] };
		});
		*/
		$scope.classes = $uci.qos["@class"].map(function(c){
			return { text: c[".name"], value: c[".name"], label: c[".name"] };
		});

//		$scope.lista = [ {text:"HEJ"},{text:"PA"},{text:"deJ"} ];
//		console.log($scope.instance.classes.value);


		$scope.$apply();
	});

});
