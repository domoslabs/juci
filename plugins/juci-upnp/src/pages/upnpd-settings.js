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
.controller("UPNPMainPage", function($scope, $uci, $systemService, $network, $firewall, $upnp, $tr, gettext, $rpc){
	JUCI.interval.repeat("upnp-status-refresh", 5000, function(done){
		$rpc.$call("juci.upnpd", "ports", {}).done(function(result){
			$scope.upnpOpenPorts = result.ports;
			$scope.$apply();
		}).always(function(){done();});
	});
	$scope.networks = [];
	$systemService.find("miniupnpd").done(function(service){
		$scope.service = service;
		$scope.$apply();
	});

	$scope.acls = [];
	$scope.action = [
		{ label: $tr(gettext("Allow")),	value:"allow" },
		{ label: $tr(gettext("Deny")),	value:"deny" }
	];

	$scope.onStartStopService = function(){
		if(!$scope.service) return;
		if($scope.service.running){
			$scope.service.stop().done(function(){
				$scope.$apply();
			});
		} else {
			$scope.service.start().done(function(){
				$scope.$apply();
			});
		}
	}

	$scope.onEnableDisableService = function(){
		if(!$scope.service) return;
		if($scope.service.enabled){
			$scope.service.disable().done(function(){
				$scope.$apply();
			});
		} else {
			$scope.service.enable().done(function(){
				$scope.$apply();
			});
		}
	}

	$upnp.getConfig().done(function(config){
		$scope.upnp = config;
		$scope.acls = $uci.upnpd["@perm_rule"];
		$network.getNetworks().done(function(data){
			$scope.nets = data;
			var net = data.find(function(net){ return net[".name"] === $scope.upnp.internal_iface.value;});
			if($scope.upnp.internal_iface) setip($scope.upnp.internal_iface.value);
			$scope.$watch("upnp.internal_iface.value", function(iface){
				setip(iface);
			}, false);
			$scope.networks = data.map(function(x){
				return {
					label: String(x[".name"]).toUpperCase(),
					value: x[".name"]
				}
			});
			$scope.$apply();
		});
	});
	function setip(lan){
		if(!$scope.nets || !$scope.nets.length || !lan) return;
		var net = $scope.nets.find(function(net){
			return net[".name"] === lan;
		});
		if(net && net.$info && ((net.$info["ipv4-address"] && net.$info["ipv4-address"].length) ||
						net.$info["ipv6-address"] && net.$info["ipv6-address"] && net.$info["ipv6-address"].length)){
			$scope.intiface = net.$info["ipv4-address"][0].address || net.$info["ipv6-address"][0].address;
		}
	}

	$scope.onAclMoveUp = function(acl){
		var arr = $uci.upnpd["@perm_rule"];
		var idx = arr.indexOf(acl);
		// return if either not found or already at the top
		if(idx == -1 || idx == 0) return;
		arr.splice(idx, 1);
		arr.splice(idx - 1, 0, acl);
		$uci.upnpd.$save_order("perm_rule");
	}

	$scope.onAclMoveDown = function(acl){
		var arr = $uci.upnpd["@perm_rule"];
		var idx = arr.indexOf(acl);
		// return if either not found or already at the bottom
		if(idx == -1 || idx == arr.length - 1) return;
		arr.splice(idx, 1);
		arr.splice(idx + 1, 0, acl);
		$uci.upnpd.$save_order("perm_rule");
	}

	$scope.onAclAdd = function(){
		$uci.upnpd.$create({
			".type": "perm_rule"
		}).done(function(){
			$scope.$apply();
		});
	}

	$scope.onAclRemove = function(acl){
		if(!acl) return;
		acl.$delete().done(function(){
			$scope.$apply();
		});
	}
});
