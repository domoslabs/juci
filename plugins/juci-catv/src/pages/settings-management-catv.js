//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("settingsManagementCatvCtrl", function($uci, $scope, $tr, gettext){
	$uci.$sync("catv").done(function(){
		$scope.catv = $uci.catv.catv;
		$scope.$apply();
	});
	$scope.filterTypes = [
		{ label: $tr(gettext("47MHz ~ 1000MHz")), value: "1"},
		{ label: $tr(gettext("47MHz ~ 591MHz")), value: "2"},
		{ label: $tr(gettext("47MHz ~ 431MHz")), value: "3"}
	];
	$rpc.$call("catv", "vendornumber").done(function(data){
		if(data["Vendor part number"] && String(data["Vendor part number"]).match(/^OHR-[0-1]001\s*$/) === null){
			$scope.showFilter = true;
		}
	}).fail(function(e){console.log(e);});
});
