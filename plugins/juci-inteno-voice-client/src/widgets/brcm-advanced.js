//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("phoneBrcmAdvanced", function(){
	return {
		scope: true,
		templateUrl: "widgets/brcm-advanced.html",
		replace: true,
		controller: "brcmAdvancedCtrl"
	};
}).controller("brcmAdvancedCtrl", function($scope, $uci, $tr, gettext, $network, $rpc, $juciDialog, languages){
	$uci.$sync(["voice_client"]).done(function(){
		$scope.brcm = $uci.voice_client.BRCM;
		$scope.$apply();
	});
	$scope.jbimpl = [
		{ label: $tr(gettext("Fixed")),		value: "fixed" },
		{ label: $tr(gettext("Adaptive")),	value: "adaptive" }
	];
	$scope.languages = languages;
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
							$rpc.$call("juci.system", "run", {"method":"reboot"})
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
