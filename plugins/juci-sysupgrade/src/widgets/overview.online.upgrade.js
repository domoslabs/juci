//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("overviewStatusWidget99OnlineUpgrade", function(){
	return {
		templateUrl: "/widgets/overview.online.upgrade.small.html",
		controller: "overviewWidgetOnlineUpgradeCtrl",
		replace: true
	}
})
.controller("overviewWidgetOnlineUpgradeCtrl", function($scope, $juciDialog, $tr, gettext, $events){
	$scope.upgrade = {
		exist: false,
		name: "",
		name_full: ""
	}
	$rpc.$call("juci.system.upgrade", "run", {"method":"check","args":JSON.stringify({type: "online"})}).done(function(response){
		if(response.online) {
			var split = response.online.split("/");
			$scope.upgrade.path = response.online;
			$scope.upgrade.name = split[split.length -1];
			$scope.upgrade.exist = true;
		} else {
			$scope.upgrade.name = "";
			$scope.upgrade.name_full = "";
			$scope.upgrade.exist = false;
		}
		$scope.$apply();
	}).fail(function(e){console.log(e);});
	var confText = '<p>'+$tr(gettext("If you klick 'Yes' all settings will be saved, if you want to have a clen install click 'No', to close this dialog klick 'Cancel'"))+'</p>';
	var modalText = confText;
	$scope.onUpgrade = function(){
		$juciDialog.show(null, {
			title: $tr(gettext("Do you want to keep settings?")),
			buttons: [
				{ label: $tr(gettext("Yes")), value: "keep", primary: true },
				{ label: $tr(gettext("No")), value: "nokeep" },
				{ label: $tr(gettext("Cancel")), value: "cancel" }
			],
			content: modalText,
			on_button: function(btn, inst){
				switch(btn.value){
					case "keep":
						$scope.upgrade.keep = true;
						inst.close();
						$scope.showUpgradeStatus = true;
						$scope.message = $tr(gettext("Your box is upgrading"));
						$rpc.$call("juci.system.upgrade", "run", {"method":"test","args":JSON.stringify({"path":$scope.upgrade.path})}).fail(function(e){
							$scope.errror = e;
							$scope.$apply();
						});
						setTimeout(function(){$scope.error = $tr(gettext("Something went wrong! Try again later"));}, 50000);
						break;
					case "nokeep":
						$scope.upgrade.keep = false;
						inst.close();
						$scope.showUpgradeStatus = true;
						$scope.message = $tr(gettext("Your box is upgrading"));
						$rpc.$call("juci.system.upgrade", "run", {"method":"test","args":JSON.stringify({"path":$scope.upgrade.path})}).fail(function(e){
							$scope.errror = e;
							$scope.$apply();
						});
						setTimeout(function(){$scope.error = $tr(gettext("Something went wrong! Try again later"));}, 50000);
						break;
					default:
						inst.close();
				}
			}
		});
	}
	$events.subscribe("sysupgrade-test", function(result){
		if(result.data && result.data.error && result.data.stdout) {
			$scope.showUpgradeStatus = 0;
			$scope.$apply();
			$juciDialog.show(null, {
				title: $tr(gettext("Image check failed")),
				buttons: [{ label: $tr(gettext("OK")), value: "ok", primary: true }],
				on_button: function(btn, inst){
					inst.dismiss("ok");
				},
				content: ($tr(gettext("Error: ")) + result.data.stdout)
			});
			return;
		}
		$scope.message = $tr(gettext("Upgrading"));
		$scope.$apply();
		$rpc.$call("juci.system.upgrade", "run", {"method":"start","args":JSON.stringify({"path": $scope.upgrade.path, "keep": (($scope.upgrade.keep)?1:0)})});
		setTimeout(function(){ window.location = "/reboot.html";}, 3000);
	});
});
