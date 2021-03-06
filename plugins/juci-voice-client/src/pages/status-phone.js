//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("PageStatusPhone", function($scope, $rpc, $uci){
	$scope.voice_available = true;
	JUCI.interval.repeat("voice.status", 5000, function(done){
		$uci.$sync("voice_client").done(function(){
			var sipProviders = $uci.voice_client["@sip_service_provider"];
			var telLines = $uci.voice_client["@tel_line"];
			$rpc.$call("voice.asterisk", "status").done(function(data){
				if(data && data.sip){
					var accounts = [];
					var lines = [];
					Object.keys(data.sip).map(function(k){
						var config = sipProviders.find(function(x){ return x[".name"] == k; });
						if(config){
							data.sip[k][".config"] = config;
							accounts.push(data.sip[k]);
						}
					});
					Object.keys(data.tel).map(function(k){
						var config = telLines.find(function(x){ return x[".name"] == k; });
						if(config){
							data.tel[k][".config"] = config;
							lines.push(data.tel[k]);
						}
					});
					$scope.sipAccounts = accounts;
					$scope.telLines = lines;
					$scope.$apply();
					done();
				}
			});
		});
	});
	$scope.reg_status = function(sip){
		if(!sip) return "";
		if(sip.registered) return "registered";
		if(sip.registry_request_sent) return "registry_request_sent";
		return "offline";
	};
});
