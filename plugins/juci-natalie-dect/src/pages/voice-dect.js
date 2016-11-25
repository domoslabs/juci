JUCI.app
.controller("PhoneDectPage", function($uci, $scope, $rpc, gettext, $tr, $events){
	$uci.$sync("dect").done(function(){
		$scope.dect = $uci.dect.dect;
		$scope.dectRadioFix = {"value":$scope.dect.radio.value};
		$scope.$apply();
	});
	$scope.changeRadio = function(value){
		$rpc.$call("uci", "set", {
			config:"dect",
			section:"dect",
			values: {
				radio:value
			}
		}).done(function(){
			$rpc.$call("uci", "commit", {
				config:"dect"
			}).done(function(){
				$scope.dect.$sync();
			});
		});
	}
	$scope.hscall = {};

	$events.subscribe("dect", function(event){
		if(!event || !event.data)
			return;
		if(event.data.registration)
			updateDectStatus();
		else if(event.data.handset)
			updateDectHandsets();
		else if(event.data.terminal && event.data.dialed){
			$scope.hscall[parseInt(event.data.terminal) + 1] = event.data.dialed;
			$scope.$apply();
		}
	});

	function updateDectStatus() {
		$rpc.$call("dect", "status").done(function(result){
			$scope.status = result;
			$scope.$apply();
		});
	}updateDectStatus();
	function updateDectHandsets() {
		$rpc.$call("dect", "handset" ,{"list":""}).done(function(result){
			result.handsets.map(function(hs){
				if(hs.hook === "onhook")
					$scope.hscall[hs.id] = "";
			});
			$scope.handset = result;
			$scope.$apply();
		});
	}updateDectHandsets();

	$scope.dectModes = [
		{ label: $tr(gettext("Auto")),	value: "auto" },
		{ label: $tr(gettext("On")),	value: "on" },
		{ label: $tr(gettext("Off")),	value: "off" }
	];

	$scope.onCancelDECT = function(){
		$rpc.$call("dect", "state", {"registration":"off"}).done(function(){
		}).fail(function(e){console.log(e);});
	};

	$scope.onStartPairing = function(){
		$rpc.$call("dect", "state", {"registration":"on"}).done(function(){
			updateDectStatus();
		}).fail(function(e){console.log(e);});
	}

	$scope.onPingHandset = function(hs){
		if (hs.hook === "offhook") {
			$rpc.$call("dect", "call", {"terminal": hs.id, "release": (hs.id-1) }).done(function(result){
			}).fail(function(e){ console.log(e); });
		} else {
			$rpc.$call("dect", "call", {"terminal": hs.id, "add": (hs.id-1) }).done(function(result){
			}).fail(function(e){ console.log(e); });
		}
	}

	$scope.onUnpairHandset = function(hs){
		$rpc.$call("dect", "handset", {"delete": hs.id }).done(function(){updateDectStatus();}).fail(function(e){console.log(e)});
	}

	$scope.toHexString = function(byteArray){
		return byteArray.map(function(b){
			var a = b.toString(16).toUpperCase();
			if(a.length === 1)
				a = "0" + a;
			return a;
		}).join(" ");
	}
});
