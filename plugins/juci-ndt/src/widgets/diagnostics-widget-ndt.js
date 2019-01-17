//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("diagnosticsWidgetNdt", function(){
	return {
		scope: true,
		replace: true,
		templateUrl: "/widgets/diagnostics-widget-ndt.html",
		controller: "diagnosticsWidgetNdt"
	};
})
.controller("diagnosticsWidgetNdt", function($scope, $rpc, $events, $tr, gettext){
	$scope.data = {
		test_type: "up_down",
		result: [],
		state: "",
		auto: false
	};
	$scope.allTestGeoServers = [
		{"label": "Auto", "value": "auto"},
		{"label": "Netherlands", "value": "NL"},
		{"label": "Sweden", "value": "SE"},
		{"label": "Norway", "value": "NO"},
		{"label": "Belgium", "value": "BE"},
		{"label": "Germany", "value": "DE"},
		{"label": "India", "value": "IN"},
		{"label": "Canada", "value": "CA"},
		{"label": "Finland", "value": "FI"}
		];
	$scope.data.geoserver = $scope.allTestGeoServers[0].value;

	function refresh(){
		var def = $.Deferred();
		$rpc.$call("juci.ndt", "ndttest_running").done(function(res){
			if(!res){
				def.reject();
				return;
			}
			if(res.running){
				$scope.data.state = "running";
			}
			else if($scope.data.state !== "error"){
				$scope.data.state = "";
			}
			def.resolve();
		}).fail(function(e){def.reject(e);});
		return def.promise();
	}

	JUCI.interval.repeat("diagnostics-ndttest-running", 10000, function(next){
		refresh().done(function(){
			$scope.$apply();
		}).always(function(){
			next();
		});
	});

	$scope.removeResult = function(res){
		if(!res) return;
		$scope.data.result = $scope.data.result.filter(function(r){
			return r !== res;
		});
	}

	$scope.testType = [
		{value:"down", label: $tr(gettext("Download")) },
		{value:"up", label: $tr(gettext("Upload")) },
		{value:"up_down", label: $tr(gettext("Download/Upload")) }
	];

	$scope.runTest = function(){
		if($scope.data.state === "running") return;
		var geoserver = $scope.data.geoserver;
		$scope.data.state="running";
		var speedtestArgs = {
			"testmode": $scope.data.test_type,
			"geoserver": geoserver,
		};

		$rpc.$call("juci.ndt", "ndttest_start", speedtestArgs).done(function(response){
			if(response && response.message=="success"){
				$scope.data.state="running";
			}else{
				$scope.data.state="";
			}
			$scope.$apply();
		}).fail(function(e){
			console.log(e);
			$scope.data.state = "";
			$scope.$apply();
		});
	};

	$scope.abortTest = function(){
		$rpc.$call("juci.ndt", "ndttest_stop").done(function(response){
			if(response && response.message=="success"){
				$scope.data.state="aborted";
			}else{
				$scope.data.state="";
			}
			$scope.$apply();
		}).fail(function(e){
			console.log(e);
			$scope.data.state = "";
			$scope.$apply();
		});
	};

	$events.subscribe("diagnostics.ndt", function(res){
		if(res.data && res.data.status != undefined){
			switch(res.data.status) {
			case 0:
				var pushMsg="";
				if( ! res.data.label.match(/success/)){
					pushMsg=res.data.label + "\n\n";
				}
				if(res.data.server != "none" && res.data.location !="none"){
					pushMsg+=$tr(gettext("Server:"))+" " + res.data.server + $tr(gettext("\nLocation:"))+" " + res.data.location +"\n\n";
 				}

 				if(res.data.upstream != "none" && res.data.downstream != "none"){
					pushMsg+=$tr(gettext("Downstream:"))+" " + res.data.downstream + $tr(gettext("\nUpstream:"))+" " + res.data.upstream;
 				}else if(res.data.upstream != "none"){
					pushMsg+=$tr(gettext("Upstream:"))+" " + res.data.upstream;
 				}else if(res.data.downstream != "none"){
					pushMsg+=$tr(gettext("Downstream:"))+" " + res.data.downstream;
 				}else {
					pushMsg+=$tr(gettext("No speeds found"));
 				}
				$scope.data.result.push(pushMsg);
 				$scope.data.state="result";
 				break;
			case -1:
				if(res.data.label != "none") {
					$scope.data.result.push(res.data.label);
				} else {
					$scope.data.result.push($tr(gettext("Server not found")));
				}
				$scope.data.state="error";
				break;
			}
			refresh().always(function(){
				$scope.$apply();
			});
		}
	});
});
