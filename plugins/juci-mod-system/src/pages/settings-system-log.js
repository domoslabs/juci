//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("SettingsSystemLog", function($scope, $uci, $tr, gettext){
	$uci.$sync("system").done(function(){
		if(!$uci.system["@system"] || !$uci.system["@system"].length) return;
		$scope.system = $uci.system["@system"][0];
		$scope.$apply();
	});
	$scope.loglevels = [
		{ label: $tr(gettext("Emergency")), value: 1 },
		{ label: $tr(gettext("Alert")), value: 2 },
		{ label: $tr(gettext("Critical")), value: 3 },
		{ label: $tr(gettext("Error")), value: 4 },
		{ label: $tr(gettext("Warning")), value: 5 },
		{ label: $tr(gettext("Notice")), value: 6 },
		{ label: $tr(gettext("Info")), value: 7 },
		{ label: $tr(gettext("Debug")), value: 8 }
	];
	$scope.cronloglevels = [
		{ label: $tr(gettext("Everything")), value: 0 },
		{ label: $tr(gettext("High verbosity")), value: 4 },
		{ label: $tr(gettext("Low verbosity")), value: 7 },
		{ label: $tr(gettext("Executions and Errors")), value: 8 },
		{ label: $tr(gettext("Only Errors")), value: 9 }
	];
	$scope.protos = [
		{ label: $tr(gettext("UDP")), value: "udp" },
		{ label: $tr(gettext("TCP")), value: "tcp" }
	];
	$scope.types = [
		{ label: $tr(gettext("Circular")), value: "circular" },
		{ label: $tr(gettext("File")), value: "file" }
	];
});
