/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
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
.directive("dhcpLeasesWidget", function(){
	return {
		scope: true,
		templateUrl: "/widgets/dhcp-leases-widget.html",
		controller:	"dhcpLeasesWidget"
	}
})
.controller("dhcpLeasesWidget", function($rpc, $uci, $scope, $firewall){
	var lanNets = [];
	$firewall.getZoneNetworks("lan").done(function(nets){
		lanNets = nets;
		JUCI.interval.repeat("dhcp-leases", 5000, function(done){refresh();done();});
	});
	function refresh(){
		//lanNets.map(function(net){
			$rpc.$call("router", "leases", {family:4}).done(function(res){
				$scope.ipv4leases = Object.keys(res).map(function(k){return res[k];});
			});

			$rpc.$call("router", "leases", {family:6}).done(function(res){
				$scope.ipv6leases = Object.keys(res).map(function(k){return res[k];});
			});

			$scope.$apply();
		//});
	}refresh();
			
	JUCI.interval.repeat("leases-update-time", 1000, function(done){
		if(!$scope.ipv4leases) { done();return;}
		$scope.ipv4leases.map(function(lease){
			if(lease.leasetime > Date.now()) lease.leasetime += 1;
			if(lease.leasetime === Date.now()) refresh();
		});

		if(!$scope.ipv6leases) { done();return;}
		$scope.ipv6leases.map(function(lease){
			if(lease.leasetime > Date.now()) lease.leasetime += 1;
			if(lease.leasetime === Date.now()) refresh();
		});

		$scope.$apply();
		done();
	});
	function pad(a){
		if(a < 10) return "0"+a;
		return ""+a;
	}
	$scope.to_time_remaining = function(time){
		var date_now = new Date();
		var time_now = date_now.getTime();
		var time_left = (time - (time_now /1000))
		var days = Math.floor(time_left / 86400)
		time_left = time_left - days * 86400;
		var h = Math.floor(time_left / 3600);
		time_left = time_left - h * 3600;
		var m = Math.floor(time_left / 60);
		var s = Math.round(time_left - m * 60);
		if( days > 0){
			return (pad(days) + " " + pad(h) + ":" + pad(m) + ":" + pad(s)); 
		}
		return (pad(h) + ":" + pad(m) + ":" + pad(s));
	};
});
