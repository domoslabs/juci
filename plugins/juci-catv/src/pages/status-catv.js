//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("statusCatvCtrl", function($rpc, $scope, $tr, gettext){
	$rpc.$call("catv", "get-all").done(function(data){
		$scope.values = Object.keys(data).map(function(key){
			if(key === "Vendor part number"){
				$scope.hasFilter = (String(data[key]).trim().match(/^OHR-[0-1]001$/))?false:true;
				var name = $scope.hasFilter ? ((String(data[key]).trim().match(/OHR-1001F/)) ? $tr(gettext("CATV-332")):$tr(gettext("CATV-3xx"))) : $tr(gettext("CATV-302"));
				return { key:$tr(gettext("Inteno model")), value: $scope.hasFilter ? $tr(gettext("CATV-332")): $tr(gettext("CATV-302")) };
			}
			if(key === "VPD") return	{ key:key, value: String(data[key]).trim() + " dBm" };
			if(key === "RF") return 	{ key:key, value: (parseFloat(String(data[key]).trim()) + 60) + " dBµV" };
			if(key === "RF enable") return { key:key, value: String(data[key]).trim() };
			if(String(key).match(/^47MHz/)) return { key: "Filter " + key, value: String(data[key]).trim() };
			return null;
		}).filter(function(e){
			if(e === null) return false; //Unwanted values
			if($scope.hasFilter) return true; //if hasFilter all values are wnated
			if(e.key && e.key.match(/^Filter /)) return false; //if not hasFilter "Filter" values are unwanted
			return true;
		});
		$scope.$apply();
	});
});
