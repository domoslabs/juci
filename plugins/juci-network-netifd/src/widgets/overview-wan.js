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
	function refresh(){
		var wans,wan_zones;
		async.series([
			function(next){
				$firewall.getWanZones().done(function(wans){
					wan_zones = wans;
				}).always(function(){next()});
			},
			function(next){
				$rpc.$call("network.interface", "dump").done(function(data){
					wans = data.interface.filter(function(iface){
						return wan_zones.find(function(w){
							return w.network.value.find(function(n){ return n === iface.interface;});
						});
					});
				}).fail(function(e){console.log(e);}).always(function(){next();});
			},
			function(next){
				$rpc.$call("router.network", "dump").done(function(data){
					wans = wans.filter(function(w){
						var wan = data[w.interface];
						return wan && wan.defaultroute && wan.ifname && wan.ifname.match(/^[^@].*/);
					});
				}).fail(function(e){console.log(e);}).always(function(){next();});
			}
		], function(){
			$scope.up = false;
			wans.map(function(w){
				if(w.up) $scope.up = true;
			});
			$scope.$apply();
		});
	}refresh();
	$events.subscribe("network.interface", function(res){
		refresh();
	});
})
.controller("overviewWidgetWAN", function($scope, $rpc, $tr, gettext, $events, $firewall, $config){
	$scope.href = $config.getWidgetLink("overviewWidget11WAN");
	JUCI.interval.repeat("update_wan_uptime", 1000, function(next){
		if(!$scope.uptime || $scope.uptime === 0){ next(); return; }
		$scope.uptime ++;
		$scope.$apply();
		next();
	});
	function refresh(){
		var wans,wan_zones;
		async.series([
			function(next){
				$firewall.getWanZones().done(function(wans){
					wan_zones = wans;
				}).always(function(){next()});
			},
			function(next){
				$rpc.$call("network.interface", "dump").done(function(data){
					wans = data.interface.filter(function(iface){
						return wan_zones.find(function(w){
							return w.network.value.find(function(n){ return n === iface.interface;});
						});
					});
				}).fail(function(e){console.log(e);}).always(function(){next();});
			},
			function(next){
				$rpc.$call("router.network", "dump").done(function(data){
					wans = wans.filter(function(w){
						var wan = data[w.interface];
						return wan && wan.defaultroute;
					});
				}).fail(function(e){console.log(e);}).always(function(){next();});
			}
		], function(){
			$scope.data = {ip:[], defaultroute:[], contypes:[], dslUp:"", dslDown:"", dns:[], up:false, linkspeed:""};
			$scope.uptime = 0;
			wans.map(function(w){
				if(w.up) $scope.data.up = true;
				else return;
				if(w["ipv4-address"] && w["ipv4-address"].length)
					w["ipv4-address"].map(function(ip){ if(ip && ip.address) $scope.data.ip.push(ip.address);});
				if(w["ipv6-address"] && w["ipv6-address"].length)
					w["ipv6-address"].map(function(ip){ if(ip && ip.address) $scope.data.ip.push(ip.address);});
				if(w.route && w.route.length){
					w.route.filter(function(r){
						return (r.target === "0.0.0.0" || r.target === "::") && r.nexthop;
					}).map(function(r){ $scope.data.defaultroute.push(r.nexthop); });
				}
				var type = $tr(gettext("Ethernet"));
				if(!w.device && w.l3_device)
					w.device = w.l3_device
				if(!w.device)
					type = $tr(gettext("Unknown"));
				else if(w.device.match(/atm/)) type = $tr(gettext("ADSL"));
				else if(w.device.match(/ptm/)) type = $tr(gettext("VDSL"));
				else if(w.device.match(/wwan/)) type = $tr(gettext("WWAN"));
				if(w.device && w.device.match("eth[0-9].[0-9]")){
					$rpc.$call("router.port", "status", {"port":w.device.substring(0,4)}).done(function(data){
						if(data && data.speed)
							$scope.data.linkspeed = data.speed;
						if(data && data.type)
							type = data.type;
						if($scope.data.contypes.indexOf(type) === -1)
							$scope.data.contypes.push(type);
						$scope.$apply();
					}).fail(function(e){console.log(e);});
				}
				else{
					if($scope.data.contypes.indexOf(type) === -1)
						$scope.data.contypes.push(type);
				}
				if(w.device && w.device.match(/[ap]tm/)){
					$rpc.$call("router.dsl", "stats").done(function(data){
						if(!data || !data.dslstats || !data.dslstats.bearers || data.dslstats.bearers.length < 1) return;
						data.dslstats.bearers.map(function(b){
							if(b.rate_down) $scope.data.dslDown = parseInt(String(b.rate_down))/1000;
							if(b.rate_up) $scope.data.dslUp = parseInt(String(b.rate_up))/1000;
						});
						$scope.$apply();
					});
				}
				if(w["dns-server"] && w["dns-server"].length)
					$scope.data.dns = $scope.data.dns.concat(w["dns-server"]);
				if(w.uptime && typeof w.uptime === "number" && $scope.uptime < w.uptime)
					$scope.uptime = w.uptime;
			});
			Object.keys($scope.data).map(function(k){
				if($scope.data[k] instanceof Array){
					$scope.data[k] = $scope.data[k].filter(function(elem, index, self) {
						return index == self.indexOf(elem);
					});
				}
			});
			$scope.$apply();
		});
	}refresh();
	$events.subscribe("network.interface", function(res){
		refresh();
	});
});
