//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("phoneSipServiceProvider", function(){
	return {
		scope: true,
		templateUrl: "widgets/sip-service-provider.html",
		replace: true,
		controller: "sipServiceProviderCtrl"
	};
}).controller("sipServiceProviderCtrl", function($scope, $rpc, $uci, $tr, gettext){
	$uci.$sync(["voice_client"]).done(function(){
		$scope.providers = $uci.voice_client["@sip_service_provider"];
		updateStatus();
		$scope.$apply();
	});
	JUCI.interval.repeat("voice.sip-service-provicers", 5000, function(done){
		$rpc.$call("voice.asterisk", "status").done(function(data){
			$scope.sipAccStatus = data.sip;
			updateStatus();
			$scope.$apply();
		}).fail(function(){
			$scope.sipAccStatus = null;
		}).always(function(){done();});
	});
	function updateStatus(){
		if(!$scope.providers || !$scope.providers.length || !$scope.sipAccStatus) return;
		$scope.providers.map(function(prov){
			var data = $scope.sipAccStatus[prov[".name"]];
			if(!data) return;
			data.ipPort = (data.ip && data.port) && data.ip + ":" + data.port;
			prov.$statusList = [["username", $tr(gettext("Username"))],["domain", $tr(gettext("Domain"))],["registration_time", $tr(gettext("Registration Time"))],["ipPort", $tr(gettext("Binding Address"))]].map(function(pair){
				if(!data[pair[0]]) return null;
				return { label: pair[1], value: data[pair[0]] };
			}).filter(function(f){ return f !== null; });
		});
	}
	$scope.getIconStatus = function(item){
		if(!item || !($scope.sipAccStatus && item[".name"])) return "";
		var status = $scope.sipAccStatus[item[".name"]];
		if(status.registered) return "online";
		if(status.registry_request_sent) return "pending";
		return "offline";
	};
	$scope.onAddProvider = function(){
		var number = 0;
		while(number < 100){
			if($scope.providers.filter(function(x){return (x[".name"].split("p")[1] == number)}).length > 0)number ++;
			else break;
		}
		$uci.voice_client.$create({
			".type": "sip_service_provider", 
			".name": "sip" + number, 
			name: $tr(gettext("Account ")) + (number + 1),
			codec0: "alaw",
			ptime_alaw: 20,
			transport: "udp"
		}).done(function(){$scope.$apply()});
	};
	$scope.onDeleteProvider = function(item){
		if(!item) return;
		item.$delete().done(function(){$scope.$apply()});
	};
	$scope.getProviderTitle = function(item){
		var title = (item.name.value == '') ? item.user.value : item.name.value;
		if(title == "") return "Unnamed Account"
		else return title;
	};
	$scope.targets = [{ label: $tr(gettext("Direct")),	value: "direct"  }];
});
