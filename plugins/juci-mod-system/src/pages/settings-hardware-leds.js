
JUCI.app
.controller("ManagementLedsCtrl", function($scope, $uci){
	var ledNames = [];
	$scope.ledStatus = {};
	$scope.ledEnabled = {};

	JUCI.interval.repeat("update_leds", 5000, function(done){
		$uci.$sync("leds").done(function(){
			$scope.leds = $uci.leds["@led"];
			ledNames = $scope.leds.map(function(x){ return x['.name']; });
			async.each(
				ledNames, 
				function(ledName, callback){
					$scope.ledEnabled[ledName] = $uci.leds[ledName].enable.value;
					$rpc.$call("juci.system","led_status",{"name":ledName}).done(function(data){
						$scope.ledStatus[ledName] = data.state;
						callback();
					}).fail(function(e){ callback(e); });
				},
				function(err){
					if(err){ console.log(err); }
					else{
						paintLeds();
						done();
					}
				}
			);
			$scope.$apply();
		});
	});
	function paintLeds(){
		ledNames.forEach(
			function(nameIn){
				var htmlCode = document.getElementById(nameIn);
				if(!htmlCode){ return; }

				if($scope.ledEnabled[nameIn]===false){ htmlCode.style.color="lightgrey"; }
				else if($scope.ledStatus[nameIn]==="off"){ htmlCode.style.color="lightgrey"; }
				else if($scope.ledStatus[nameIn]==="ok"){ htmlCode.style.color="#64BD63"; }
				else if($scope.ledStatus[nameIn]==="eok"){ htmlCode.style.color="#409AB3"; }
				else if($scope.ledStatus[nameIn]==="error"){ htmlCode.style.color="#E52B38"; }
			}
		);
	}
});
