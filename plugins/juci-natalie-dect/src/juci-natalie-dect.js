
UCI.$registerConfig("dect"); 
UCI.dect.$registerSectionType("dect", {
	"radio":	{ dvalue: 'auto', type: String }
});

JUCI.app
.controller("PhoneDectPage", function($uci, $scope, $rpc, gettext, $tr, $events){
	$uci.$sync("dect").done(function(){
		$scope.dect = $uci.dect.dect;
		$scope.$apply();
	});
	$events.subscribe("dect", function(event){
		if(event && event.data && (event.data.handset === "add")){
			$scope.dismissed = true;
		}
	});
	$scope.dectModes = [
		{ label: $tr(gettext("Auto")),	value: "auto" },
		{ label: $tr(gettext("On")),	value: "on" },
		{ label: $tr(gettext("Off")),	value: "off" }
	];
	var timer;
	$scope.dismissed = true;
	$scope.onCancelDECT = function(){
		$rpc.dect.state({"registration":"off"});
		$scope.dismissed = true;
		clearTimeout(timer);
	};
	$scope.toHexaDecimal = function(string){
		var ret = "";
		for(var i = 0; i < string.length;i+=2){
			ret += string.substr(i, 2) + " ";
		}
		return ret;
	};
	var numDevices = 0;
	if($rpc.juci && $rpc.dect){
		JUCI.interval.repeat("dect.refresh", 1000, function(done){
			$rpc.dect.status({"":""}).done(function(result){
				$scope.status = result;
				$scope.$apply();
				done();
			});

			$rpc.dect.handset({"list":""}).done(function(result){
				if(result.handsets && result.handsets.length !== numDevices){
					numDevices = result.handsets.length;
					$scope.dismissed = true;
				}
				$scope.handset = result;
				$scope.$apply();
				done();
			});
		});
		$scope.onStartPairing = function(){
			$scope.dismissed = false;
			$rpc.dect.state({"registration":"on"});
			timer = setTimeout(function(){$scope.dismissed = true;}, 1000*180);
		}
		$scope.onPingHandset = function(hs){
			$rpc.dect.call({"terminal":JSON.stringify({ id: hs.id })}).done(function(){
			});
		}
	}
});
