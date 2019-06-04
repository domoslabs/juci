/*
 * Copyright (C) 2019 iopsys Software Solutions AB. All rights reserved.
 *
 * Author: Vivek Dutta <v.dutta@gxgroup.eu>
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
.controller("McproxyPageCtrl", function($scope, $uci, $tr, gettext, $juciDialog, $network, $rpc){
	$scope.clients = [{ label: "Custom Entry", value: "custom" }];

	var blockCpy = [];

	$uci.$sync("mcproxy").done(function(){
		$scope.mcproxy = $uci.mcproxy['mcproxy'];
		$scope.allInstances = $uci.mcproxy["@instance"] || [];

		$scope.blockTable = $uci.mcproxy.blocked || {};
		$scope.update = [];
		$scope.blockBehaviour = $uci.mcproxy['blockrule'] || {};
		$scope.exception = []

		if(Object.keys($scope.blockTable).length > 0) {
			blockCpy = $scope.blockTable.entries.value.filter(function() {return true;});
			$scope.update = $scope.blockTable.entries.value.map(function () { return true; });
			$scope.exception = $scope.blockTable.entries.value.map(function(e){
				return e.replace('(*|', '').replace(')','');
			});
		}

		$scope.protocol = [
			{label:'IGMPv1 (IPv4)',value:'IGMPv1'},
			{label:'IGMPv2 (IPv4)',value:'IGMPv2'},
			{label:'IGMPv3 (IPv4)',value:'IGMPv3'},
			{label:'MLDv1 (IPv6)', value:'MLDv1'},
			{label:'MLDv2 (IPv6)',value:'MLDv2'}];

		$scope.allInstances.map(function(instance){
			instance.$statusList = [
				{ label: $tr(gettext("Enable")), value: !(instance.disabled.value) },
				{ label: $tr(gettext("Name")), value: instance.name.value },
				{ label: $tr(gettext("Uplink")), value: instance.upstream.value.join(", ") },
				{ label: $tr(gettext("Downlink")), value: instance.downstream.value.join(", ") },];
		});

		$scope.$apply();
	}).fail(function(e){console.log(e);});

	$scope.getmcInstanceTitle = function(item){
		var na = $tr(gettext("N/A"));
		return String((item.name.value ||  na));
	}

	var mcast = new $uci.validators.IP4MulticastAddressValidator;
	var ipv6 = new $uci.validators.IP6AddressValidator;
	var ip6range = new $uci.validators.IP6CIDRValidator;

	var pushClient = function (ip) {
		$scope.update.push(true);
		var ent = "(*|" + String(ip) + ")";
		$scope.exception.push(ip);
		$scope.blockTable.entries.value.push(ent);
		$scope.blockTable.entries.is_dirty = !arrayEquals($scope.blockTable.entries.value, blockCpy);
	}

	var arrayEquals = function(a1, a2) {
		var i = a1.length;
		if (i != a2.length)
			return false;
		while (i--) {
			if (a1[i] !== a2[i]) return false;
		}
		return true
	}

	$scope.onUpdateIp = function (ip, index) {
		$scope.update = $scope.update.map(function(entry, i) { return i !== index; });
		/*$scope.exception[index] = ip;
		$scope.blockTable.entries.value[index] = "(*|" + ip + ")";
		$scope.blockTable.entries.is_dirty = true;*/
	}

	$scope.onAddIp = function (ip, index) {
		if (!ip)
			return;

		var er = [mcast.validate({ value: ip }), ipv6.validate({ value: ip }), ip6range.validate({ value: ip })].filter(function (x) { return x !== null; })

		if ($scope.exception.includes(ip)) {
			$scope.McastIpErr = $tr(gettext("Address has already been added!"));
			return;
		}

		if (er.length === 3) {
			$scope.McastIpErr = $tr(gettext("Invalid multicast addresses!"));
			return;
		}

		$scope.McastIpErr = null;

		// Create uci segments if not present
		if (Object.keys($scope.blockTable).length == 0) {
			console.log("create block table!");
			$uci.mcproxy.$create({
				".type": "table",
				".name": "blocked",
				"name": "blocked"
			}).done(function () {
				$uci.$save();
			});
		}

		if (Object.keys($scope.blockBehaviour).length == 0 && $scope.allInstances.length) {
			console.log("create blockrule!");
			$uci.mcproxy.$create({
				".type": "behaviour",
				".name": "blockrule",
				"whitelist": false,
				"table": "blocked",
				"section": "upstream",
				"interface": $scope.allInstances[0].upstream.value,
				"instance": $scope.allInstances[0].name.value,
				"entries": []
			}).done(function () {
				$uci.$save();
			}).done(function() {
				pushClient(ip);
			});
		} else {
			pushClient(ip);
		}
	}

	$scope.onAddInstance = function(){
		$uci.mcproxy.$create({
			".type":"instance",
		}).done(function(instance){
			$scope.$apply();
		});
	}

	$scope.onDeleteInstance = function(item){
		if(!item || !item.$delete) return;
		item.$delete().done(function(){
			$scope.$apply();
		});
	}

	$scope.onRemoveIp = function (item, index) {
		if (!item) return;

		$scope.exception.splice(index, 1);
		$scope.blockTable.entries.value.splice(index, 1);
		$scope.blockTable.entries.is_dirty = !arrayEquals($scope.blockTable.entries.value, blockCpy);
	}
});
