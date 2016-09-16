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
.directive("networkClientEdit", function(){
	return {
		templateUrl: "/widgets/network-client-edit.html", 
		controller: "networkClientEdit", 
		scope: {
			model: "=ngModel"
		},
		replace: true, 
		require: "^ngModel"
	};  
}).controller("networkClientEdit", function($scope, $uci, $tr, gettext){	
	$scope.$watch("model", function(value){
		if(!value || !value.client || !value.client.macaddr) return;
		$uci.$sync("dhcp").done(function(){
			$scope.staticLeses = $uci.dhcp["@host"];
			$scope.client = $scope.staticLeses.filter(function(l){
				return l.mac.value === value.client.macaddr;
			})[0];
			$scope.$apply();
		});
		$scope.edit_hostname = function(){
			$scope.disabled = true;
			$uci.dhcp.$create({
				".type":"host",
				"mac": value.client.macaddr
			}).done(function(cl){
				$scope.client = cl;
				$scope.$apply();
			});
		}
		$scope.onAddStaticLease = function(){
			$uci.$sync("dhcp").done(function(){
				$uci.dhcp.$create({
					".type":"host",
					ip: $scope.model.client.ipaddr,
					mac: $scope.model.client.macaddr,
					network: $scope.model.client.network,
					name: $scope.model.client.hostname
				}).done(function(value){
					$scope.client = value;
				});
			});
		}
		$scope.onDeleteStaticLease = function(){
			if(!$scope.client || !$scope.client.$delete) return;
			$scope.disabled = false;
			$scope.client.$delete().done(function(){
				$scope.client = null;
				$scope.$apply();
			});
		}
		$scope.values = Object.keys(value.client).map(function(x){
			var val = value.client[x];
			if(x === "ipaddr") return { label: $tr(gettext("IP Address")), value: val };
			if(x === "ip6addr") return { label: $tr(gettext("IPv6 Address")), value: val };
			if(x === "duid") return { label: $tr(gettext("DUID")), value: val };
			if(x === "macaddr") return { label: $tr(gettext("MAC Address")), value: String(val).toUpperCase() };
			if(x === "dhcp") return { label: $tr(gettext("DHCP")), value: String(val).charAt(0).toUpperCase() + String(val).slice(1) };
			if(x === "connected") return { label: $tr(gettext("Connected")), value: String(val).charAt(0).toUpperCase() + String(val).slice(1) };
			if(x === "wireless") $scope.wireless = val;
			if(!($scope.wireless) && x === "linkspeed") return { label: $tr(gettext("Link Speed")), value: val };
			return null;
		}).filter(function(x){ return x !== null;});
		if($scope.wireless){
			$scope.wirelessValues = Object.keys(value.client).map(function(x){
				var val = value.client[x];
				if(x === "n_cap") return { label: $tr(gettext("N Mode")), value: String(val).charAt(0).toUpperCase() + String(val).slice(1) };
				if(x === "vht_cap") return { label: $tr(gettext("VHT Mode")), value: String(val).charAt(0).toUpperCase() + String(val).slice(1) };
				if(x === "wme") return { label: $tr(gettext("WME")), value: String(val).charAt(0).toUpperCase() + String(val).slice(1) };
				if(x === "ps") return { label: $tr(gettext("Power Save")), value: String(val).charAt(0).toUpperCase() + String(val).slice(1) };
				if(x === "frequency") return { label: $tr(gettext("Frequency")), value: val };
				if(x === "rssi") return { label: $tr(gettext("RSSI")), value: val + " dBm" };
				if(x === "snr") return { label: $tr(gettext("SNR")), value: val + " dBm" };
				if(x === "idle") return { label: $tr(gettext("Idle")), value: val + " s" };
				if(x === "in_network") return { label: $tr(gettext("In Network")), value: val + " s" };
				if(x === "tx_bytes") return { label: $tr(gettext("TX Bytes")), value: val };
				if(x === "rx_bytes") return { label: $tr(gettext("RX Bytes")), value: val };
				if(x === "tx_rate") return { label: $tr(gettext("TX Rate")), value: Math.floor(parseInt(val)/1000) + " Mbps" };
				if(x === "rx_rate") return { label: $tr(gettext("RX Rate")), value: Math.floor(parseInt(val)/1000) + " Mbps" };
				return null;
			}).filter(function(x){ return x !== null;});
		}
	},false);
}); 

