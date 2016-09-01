JUCI.app
.controller("PhoneDectPage", function($uci, $scope, $rpc, gettext, $tr, $events){
	$uci.$sync("dect").done(function(){
		$scope.dect = $uci.dect.dect;
		$scope.$apply();
	});

	$events.subscribe("dect", function(event){
		if(!event || !event.data)
			return;
		updateDectStatus();
	});

	var numDevices = 0;

	function updateDectStatus() {
		$rpc.$call("dect", "status").done(function(result){
			$scope.status = result;
			$scope.$apply();
		});
		$rpc.$call("dect", "handset" ,{"list":""}).done(function(result){
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

	$scope.onCancelDECT = function(){
		$rpc.$call("dect", "state", {"registration":"off"}).done(function(){
			updateDectStatus();
		}).fail(function(e){console.log(e);});
	};

	$scope.onStartPairing = function(){
		$rpc.$call("dect", "state", {"registration":"on"}).done(function(){
			updateDectStatus();
		}).fail(function(e){console.log(e);});
	}

	$scope.pinging = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
	function alternatePinging(hs){ $scope.pinging[hs.id]==1 ? $scope.pinging[hs.id]=0 : $scope.pinging[hs.id]=1; };

	$scope.onPingHandset = function(hs){
		alternatePinging(hs);
		if (!$scope.pinging[hs.id]) {
			$rpc.$call("dect", "call", {"terminal": hs.id, "release": (hs.id-1) }).done(function(result){
				//if (result.errstr && result.errstr != "Success") $scope.pinging[hs.id] = 1;
			}).fail(function(e){ console.log(e); });
		} else {
			$rpc.$call("dect", "call", {"terminal": hs.id, "add": (hs.id-1) }).done(function(result){
				//if (result.errstr && result.errstr != "Success") $scope.pinging[hs.id] = 0;
			}).fail(function(e){ console.log(e); });
		}
	}

	$scope.onUnpairHandset = function(hs){
		$rpc.$call("dect", "handset", {"delete": hs.id }).done(function(){updateDectStatus();}).fail(function(e){console.log(e)});
	}

	$scope.toHexString = function(byteArray){
		return byteArray.map(function(byte) {
			return ('0' + byte).slice(-2);
		}).join('')
	}
});
