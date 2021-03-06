/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */

JUCI.app
.directive("overviewWidget11WAN", function(){
	return {
		templateUrl: "widgets/overview-wan.html",
		controller: "overviewWidgetWAN",
		replace: true
	};
})
.directive("overviewStatusWidget11WAN", function(){
	return {
		templateUrl: "widgets/overview-wan-small.html",
		controller: "overviewWidgetSmallWan",
		replace: true
	};
})
.filter('formatTimer', function() {
    return function(seconds) {
		var numdays = Math.floor(seconds / 86400);
		var numhours = Math.floor((seconds % 86400) / 3600);
		var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
		var numseconds = ((seconds % 86400) % 3600) % 60;
		var sec = (numseconds < 10)? '0' + numseconds : '' + numseconds;
		if (numdays > 0) { return (numdays + 'd ' + numhours + 'h ' + numminutes + 'm ' + sec + 's');}
		if (numhours > 0) { return (numhours + 'h ' + numminutes + 'm ' + sec + 's');}
		if (numminutes > 0) { return (numminutes + 'm ' + sec + 's');}
		return (sec+ 's');
    };
})
.controller("overviewWidgetSmallWan", function($scope, $firewall, $rpc, $events, $config){
	$scope.href = $config.getWidgetLink("overviewWidget11WAN");
	JUCI.interval.repeat("wan_small_check_internet", 10000, function(next){
		refresh();
		next();
	});
	function refresh(){
		$rpc.$call("juci.network", "online").done(function(res){
			$scope.up = res && res.online;
			$scope.$apply();
		}).fail(function(er){console.log(er);});
	}
	refresh();
	$events.subscribe("network.interface", function(res){
		refresh();
	});
	$events.subscribe("hotplug.switch", function(res){
		refresh();
	});
})
.controller("overviewWidgetWAN", function($scope, $rpc, $tr, gettext, $events, $firewall, $config, $juciDialog, $localStorage){
	$scope.href = $config.getWidgetLink("overviewWidget11WAN");
	$scope.hideFixError = $localStorage.getItem("hideFixError") == "true";
	$scope.fixErrorOpen = false;
	$scope.data = {ip:[], defaultroute:[], contypes:[], dslUp:"", dslDown:"", dns:[], linkspeed:""};
	JUCI.interval.repeat("update_wan_uptime", 1000, function(next){
		if(!$scope.uptime || $scope.uptime === 0){ next(); return; }
		$scope.uptime ++;
		$scope.$apply();
		next();
	});
	$scope.fixError = function(){
		if($scope.hideFixError || $scope.fixErrorOpen)
			return;
		$scope.fixErrorOpen = true;
		var model = {
			hideFixError: $scope.hideFixError,
		};
		$juciDialog.show("overview-wan-fix", {
			title: $tr(gettext("Diagnose Internet Connection")),
			size: "md",
			buttons: [ { label: $tr(gettext("Close")), value:"close", primary: true } ],
			on_button: function(btn, inst){
				if(typeof model.hideFixError === "boolean"){
					$scope.hideFixError = model.hideFixError;
					$localStorage.setItem("hideFixError", model.hideFixError);
				}
				$scope.fixErrorOpen = false;
				inst.close();
			},
			model:model
		});
	}

	function dsl_stats(type){
		if(type.match(/[AV]DSL/)){
			$rpc.$call("dsl", "status").done(function(data){
				if(!data || !data.line || data.line.length < 1 || !data.line[0].channel || data.line[0].channel.length < 1) return;
				data.line[0].channel.map(function(c){
					if (c.actndr.ds) $scope.data.dslDown = parseInt(String(c.actndr.ds))/1000;
					else $scope.data.dslDown = "";
					if(c.actndr.us) $scope.data.dslUp = parseInt(String(c.actndr.us))/1000;
					else $scope.data.dslUp = "";
				});
				$scope.$apply();
			}).fail(function(er){$scope.data.dslUp = $scope.data.dslDown = ""; console.log(er);});
		}
	}
	JUCI.interval.repeat("wan_check_internet", 10000, function(next){
		refresh().always(function(){
			update_online();
		});
		next();
	});

	function update_online(){
		var def = $.Deferred();
		$rpc.$call("juci.network", "online").done(function(res){
			$scope.online = res && res.online;
			$scope.$apply();
			def.resolve();
		}).fail(function(er){console.log(er); def.reject(er);});
		return def.promise();
	}

	function refresh(){
		var wan_zonrs = [];
		var def = $.Deferred();
		$firewall.getZoneNetworks("wan").done(function(nets){
			$scope.wans = nets.filter(function(w){
				return w.$info && w.defaultroute && w.defaultroute.value;
			});
			if($scope.wans.length === 0){
				def.resolve();
				return;
			}
			var link_up = false;
			async.eachSeries($scope.wans, function(wan, next){
				$rpc.$call("juci.network", "has_link", {"interface":wan[".name"]}).done(function(data){
					if(data && data.has_link)
						link_up = true;
				}).fail(function(e){
					console.log(e);
				}).always(function(){
					next();
				});
			}, function(){
				$scope.data.up = link_up;
				$scope.uptime = 0;
				var ip = [];
				var defaultroute = [];
				var contypes = [];
				var dns = [];
				var linkspeed = "";
				async.eachSeries($scope.wans, function(wan, cb){
					var w = wan.$info;
					if(!w.up){
						cb();
						return;
					}
					if(w["ipv4-address"] && w["ipv4-address"].length)
						w["ipv4-address"].map(function(p){ if(p && p.address) ip.push(p.address);});
					if(w["ipv6-address"] && w["ipv6-address"].length)
						w["ipv6-address"].map(function(p){ if(p && p.address) ip.push(p.address);});
					if(w.route && w.route.length){
						w.route.filter(function(r){
							return (r.target === "0.0.0.0" || r.target === "::") && r.nexthop;
						}).map(function(r){ defaultroute.push(r.nexthop); });
					}
					if(w["dns-server"] && w["dns-server"].length)
						dns = dns.concat(w["dns-server"]);
					if(w.uptime && typeof w.uptime === "number" && $scope.uptime < w.uptime)
						$scope.uptime = w.uptime;
					var type = $tr(gettext("Ethernet"));
					if(!w.device && w.l3_device)
						w.device = w.l3_device
					if(!w.device)
						type = $tr(gettext("Unknown"));
					else if(w.device.match(/atm/)) type = $tr(gettext("ADSL"));
					else if(w.device.match(/nas/)) type = $tr(gettext("ADSL"));
					else if(w.device.match(/ptm/)) type = $tr(gettext("VDSL"));
					else if(w.device.match(/wwan/)) type = $tr(gettext("WWAN"));
					if(w.device && w.device.match("eth[0-9].[0-9]") || w.device.match("br-")){
						$rpc.$call("router.port", "status", {"port":w.device}).done(function(data){
							if(data && data.speed)
								linkspeed = data.speed;
							if(data && data.type)
								type = data.type;
							if(contypes.indexOf(type) === -1)
								contypes.push(type);
							dsl_stats(type);
						}).fail(function(er){
							console.log(er);
						}).always(function(){
							cb();
						});
					}
					else{
						if(contypes.indexOf(type) === -1)
							contypes.push(type);
						dsl_stats(type);
						cb();
					}
				}, function(){
					$scope.data.ip = ip;
					$scope.data.defaultroute = defaultroute;
					$scope.data.contypes = contypes;
					$scope.data.dns = dns;
					$scope.data.linkspeed = linkspeed;
					Object.keys($scope.data).map(function(k){
						if($scope.data[k] instanceof Array){
							$scope.data[k] = $scope.data[k].filter(function(elem, index, self) {
								return index == self.indexOf(elem);
							});
						}
					});
					$scope.$apply();
					def.resolve();
				});
			});
		}).fail(function(){ def.reject();});
		return def.promise();
	}
	refresh().done(function(){;
		update_online().done(function(){
			if($scope.wans.length && (!$scope.online || !$scope.data.up))
				$scope.fixError();
		});
	});

	$events.subscribe("network.interface", function(res){
		refresh();
		update_online();
	});
	$events.subscribe("hotplug.switch", function(res){
		refresh();
		update_online();
	});
});
