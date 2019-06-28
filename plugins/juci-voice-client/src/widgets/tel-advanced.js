//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("phoneTelAdvanced", function(){
	return {
		scope: true,
		templateUrl: "widgets/tel-advanced.html",
		replace: true,
		controller: "telAdvancedCtrl"
	};
}).controller("telAdvancedCtrl", function($scope, $uci, $tr, gettext, $network, $rpc, $juciDialog){
	$uci.$sync(["voice_client"]).done(function(){
		$scope.tel = $uci.voice_client.TEL;
		$scope.$apply();
	});
	$scope.jbimpl = [
		{ label: $tr(gettext("Fixed")),		value: "fixed" },
		{ label: $tr(gettext("Adaptive")),	value: "adaptive" }
	];

	$rpc.$call("voice.asterisk", "supported_countries", {}).done(function (countries) {
		$scope.languages = countries.countries.map(function(country) {
			return { label: $tr(gettext(country.country)), value: country.code};
		})
		$scope.$apply();
	});

	$scope.on_language_change = function(){
		setTimeout(function(){
			$juciDialog.show("reboot-dialog", {
				buttons: [
					{ label: $tr(gettext("Yes")), value: "apply", primary: true },
					{ label: $tr(gettext("No")), value: "cancel" }
				],
				on_apply: function(btn){
					if(btn.value == "apply"){
						$uci.$save().done(function(){
							$rpc.$call("juci.system", "reboot", {})
							console.log("rebooting");
							location = "/reboot.html";
						});
					}
					return true;
				}
			});	 
		}, 0);
	};
});
