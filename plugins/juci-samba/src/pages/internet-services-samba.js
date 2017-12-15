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
.controller("ServiceSambaPage", function($scope, $tr, gettext, $uci, $samba, $firewall){
	$scope.data = {
		networks: [],
		output: [],
		passwd_entries: []
	};
	$firewall.getZoneNetworks("lan").done(function(nets){
		$scope.data.networks = nets.map(function(net){
			return { label: String(net[".name"]).toUpperCase(), value: net[".name"] };
		});
		$samba.getConfig().done(function(config){
			$scope.config = config;
			var saved_nets = $scope.config.interface.value.split(" ").filter(function(sn){
				return $scope.data.networks.find(function(net){return (net.value == sn);}) != null;
			});
			$scope.data.networks.map(function(net){
				net.selected = (saved_nets.find(function(sn){return net.value == sn;}) != null) ? true : false;
			});
			$scope.config.interface.value = saved_nets.join(" ");
			$scope.$apply();
		});
	});
	$scope.$watch("data.output", function(output){
		if(!$scope.data || !$scope.config) return;
		$scope.config.interface.value = output.map(function(net){return net.value;}).join(" ");
	}, false);

	$samba.getShares().done(function(shares){
		$scope.shares = shares;
		shares && shares.length && $scope.shares.map(function(share){
			share.$statusList = [
				["path", $tr(gettext("Path"))],
				["users", $tr(gettext("Allowed users"))],
				["guest_ok", $tr(gettext("Allow Guest Access"))],
				["read_only", $tr(gettext("Read Only"))]
			].map(function(pair){
				if(!share[pair[0]] || share[pair[0]].value === "" || share[pair[0]].value === undefined) return null;
				return { label: pair[1], value: share[pair[0]].value };
			}).filter(function(f){ return f !== null; });
		});
		$scope.$apply();
	});

	$samba.getUsers().done(function(users){
		$scope.users = users;
		users && users.length && $scope.users.map(function(user){
			if(user.desc && user.desc.value)
				user.$statusList = [{ label: $tr(gettext("Description")), value: user.desc.value }];
		});
		$scope.$apply();
	});

	$scope.getSambaShareTitle = function(share){
		return share.name.value;
	}

	$scope.onCreateShare = function(){
		$uci.samba.$create({
			".type": "sambashare",
			"name": $tr(gettext("New samba share"))
		}).done(function(){
			$scope.$apply();
		});
	}

	$scope.onDeleteShare = function($item){
		$item.$delete().done(function(){
			$scope.$apply();
		});
	}

	$scope.onCreateUser = function(){
		$uci.samba.$create({
			".type": "sambausers",
			"user": "guest"
		}).done(function(){
			$scope.$apply();
		});
	}

	$scope.onDeleteUser = function($item){
		$item.$delete().done(function(){
			$scope.$apply();
		});
	}
});
