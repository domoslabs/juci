JUCI.app
.controller("PhoneDectPage", function($uci, $scope, $rpc, gettext, $tr, $events){
	$uci.$sync("dect").done(function(){
		$scope.dect = $uci.dect.dect;
		$scope.$apply();
	});

	$events.subscribe("dect", function(event){
		if(!event || !event.data)
			return;

		if (event.data.handset === "add")
			$scope.dismissed = true;

		updateDectStatus();
	});

	var numDevices = 0;
	var timer;

	function updateDectStatus() {
		if(!$rpc.dect || !$rpc.dect.status) return;

		$rpc.dect.status().done(function(result){
			$scope.status = result;
		});

		$rpc.dect.handset({"list":""}).done(function(result){
			if(result.handsets && result.handsets.length !== numDevices){
				numDevices = result.handsets.length;
				$scope.dismissed = true;
			}
			$scope.handset = result;
			$scope.$apply();
		});
	}updateDectStatus();

	$scope.dectModes = [
		{ label: $tr(gettext("Auto")),	value: "auto" },
		{ label: $tr(gettext("On")),	value: "on" },
		{ label: $tr(gettext("Off")),	value: "off" }
	];

	$scope.dismissed = true;
	$scope.onCancelDECT = function(){
		$rpc.dect.state({"registration":"off"});
		clearTimeout(timer);
	};

	if($rpc.dect){
		$scope.onStartPairing = function(){
			$scope.dismissed = false;
			$rpc.dect.state({"registration":"on"});
			timer = setTimeout(function(){$scope.dismissed = true;}, 1000*180);
		}
		$scope.onPingHandset = function(hs){
			//$rpc.dect.call({"terminal": hs.id }).done(function(){});
			$rpc.dect.handset({"pageall":""}).done(function(){});
		}
		$scope.onUnpairHandset = function(hs){
			$rpc.dect.handset({"delete": hs.id }).done(function(){});
		}
	}

	$scope.toHexString = function(byteArray){
		return byteArray.map(function(byte) {
			return ('0' + byte).slice(-2);
		}).join('')
	}
});
