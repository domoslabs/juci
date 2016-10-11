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
	$rpc.$call("juci.sysupgrade", "check", {"type": "online"}).done(function(response){
		response.online = "http://someaddress.se/something/image.y2";
		console.log("test " + response.online);
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
	$scope.onUpgrade = function(){
		$juciDialog.show(null, {
			title: $tr(gettext("Do you want to keep settings?")),
			buttons: [
				{ label: $tr(gettext("Yes")), value: "keep", primary: true },
				{ label: $tr(gettext("No")), value: "nokeep" },
				{ label: $tr(gettext("Cancel")), value: "cancel" }
			],
			content: '<p>'+$tr(gettext("If you click 'Yes' all settings will be saved. If you want to have a clean install click 'No'. To close this dialog click 'Cancel'"))+'</p>',
			on_button: function(btn, inst){
				if(btn.value === "cancel"){
					inst.close();
					return;
				}
				$scope.showUpgradeStatus = true;
				$scope.message = $tr(gettext("Your box is upgrading"));
				$rpc.$call("juci.sysupgrade", "start", {"path":$scope.upgrade.path, "keep":(btn.value === "keep")?1:0});
				setTimeout(function(){$scope.error = $tr(gettext("Something went wrong! Try again later"));}, 50000);
				inst.close();
			}
		});
	}
	$scope.onClose = function(){$scope.showUpgradeStatus = false;};
	$events.subscribe("sysupgrade", function(result){
		if(!result || !result.data || !result.data.status) return;
		if(result.data && result.data.status && result.data.status == "failed") {
			$scope.showUpgradeStatus = 0;
			$scope.$apply();
			$juciDialog.show(null, {
				title: $tr(gettext("Image check failed")),
				buttons: [{ label: $tr(gettext("OK")), value: "ok", primary: true }],
				on_button: function(btn, inst){
					inst.dismiss("ok");
				},
				content: ($tr(gettext("Error: ")) + result.data.test)
			});
			return;
		}
		window.location = "/reboot.html";
	});
});
