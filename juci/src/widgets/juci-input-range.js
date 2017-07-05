JUCI.app
.directive("juciInputRange", function () {
	return {
		templateUrl: "/widgets/juci-input-range.html",
		restrict: 'E',
		replace: true,
		scope: {
			model: "=ngModel", 
			min: "@min",
			max: "@max",
			delimiter: "@delimiter"
		},
		//require: "ngModel", 
		controller: "juciInputRange"
	};
})
.controller("juciInputRange", function($scope, $log, $parse, $attrs) {
	$scope.data = {
		isRange: false,
		from: "",
		to: ""
	};
	if(!$scope.delimiter){ $scope.delimiter = "-" }; //default delimiter
	$scope.expandSizeRange = function(){
		$scope.data.isRange = !$scope.data.isRange;
	}

	// when the model is changed, update data.from and data.to
	$scope.$watch("model", function(value){
		if(!$scope.model){ return; }
		if(value.indexOf($scope.delimiter) !== -1){ // if model is a range
			$scope.data.from = parseInt($scope.model.split($scope.delimiter)[0]);
			$scope.data.to = parseInt($scope.model.split($scope.delimiter)[1]);
		}		
	});

	$scope.$watch("data", function(value){
		if(!$scope.data){ return; }
		// if user opened with expand button indicating a range
		if($scope.data.isRange){
			if($scope.data.from && $scope.data.from !== ""){
				if($scope.data.to && $scope.data.to !== ""){
					$scope.model = String($scope.data.from) + $scope.delimiter + String($scope.data.to);
				}
			}
		}
		else{// if user closed with expand button indicating a single value 
			if($scope.data.from && $scope.data.from !== ""){
				$scope.model = String($scope.data.from);
			}
		}
	}, true);
});
