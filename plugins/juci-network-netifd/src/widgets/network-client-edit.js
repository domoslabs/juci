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
		require: "^ngModel",
	};  
}).controller("networkClientEdit", function($scope, $uci, $tr, gettext){
	$scope.tick = 2000;
	$scope.avgTraffic = {
		rows: [
			["Received Mbit/s", 0],
			["Transmitted Mbit/s", 0],
		]
	};
	$scope.$on("$destroy", function(){
		JUCI.interval.clear("updateTraffic");
	});

	function updateTraffic(){
		$rpc.$call("router.graph", "client_traffic").done(function(data){
			$scope.traffic = data[$scope.model.client.hostname];
			$scope.avgTraffic["rows"][0] = ["Received Mbit/s", ($scope.traffic["Received bytes"]/($scope.tick/1000)) *8 /1000000];
			$scope.avgTraffic["rows"][1] = ["Transmitted Mbit/s", ($scope.traffic["Transmitted bytes"]/($scope.tick/1000)) *8 /1000000];
			$scope.$apply();
		}).fail(function(e){console.log(e);});
	}
	updateTraffic();
	setTimeout(function(){ $scope.id = $scope.model.client.hostname; }, 3000);

	JUCI.interval.repeat("updateTraffic",$scope.tick,function(next){
		updateTraffic();
		next();
	});

	$scope.$watch("model", function(value){
		if(!value || !value.client || !value.client.macaddr) return;
		var networkList = [];
		$uci.$sync("dhcp").done(function(){
			$scope.staticLeses = $uci.dhcp["@host"];
			$scope.client = $scope.staticLeses.filter(function(l){
				return l.mac.value === value.client.macaddr;
			})[0];
			$scope.$apply();
		});
		$rpc.$call("router.network", "dump").done(function(data){
			networkList = Object.keys(data).map(function(key){ data[key]["name"] = key; return data[key];})
			.filter(function(net){ return net["is_lan"] && net.ipaddr && net.netmask;});
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
		$scope.$watch("client.ip.value", function(){
			if(!$scope.client) return;
			var cl = $scope.client.ip;
			if(!cl.value || cl.error !== null || !networkList){
				$scope.inNetwork = "";
				return;
			}
			net = networkList.find(function(net){
				var net_ip_parts = String(net.ipaddr).split(".").map(function(p){return parseInt(p);}).filter(function(p){ return isNaN(p) === false;});
				var net_mk_parts = String(net.netmask).split(".").map(function(p){return parseInt(p);}).filter(function(p){ return isNaN(p) === false;});
				var cli_ip_parts = String(cl.value).split(".").map(function(p){return parseInt(p);}).filter(function(p){ return isNaN(p) === false;});
				if(net_ip_parts.length !== 4 || net_mk_parts.length !== 4 || cli_ip_parts.length !== 4) return false;
				var net_ip_bin = net_ip_parts.map(function(p){ var s = p.toString(2); while(s.length < 8){ s = "0" + s;}; return s;}).join("");
				var net_mk_bin = net_mk_parts.map(function(p){ var s = p.toString(2); while(s.length < 8){ s = "0" + s;}; return s;}).join("");
				var cli_ip_bin = cli_ip_parts.map(function(p){ var s = p.toString(2); while(s.length < 8){ s = "0" + s;}; return s;}).join("");
				for(var i = 0; i < 24; i++){
					if((net_ip_bin[i] & net_mk_bin[i]) !==  + (net_mk_bin[i] & cli_ip_bin[i]))
						return false;
				}
				return true;
			});
			if(net){
				$scope.inNetwork = net.name;
				$scope.cssClass="warning";
				return;
			}
			$scope.inNetwork = $tr(gettext("Not in any configured network"));
			$scope.cssClass="danger";
		}, false);
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

