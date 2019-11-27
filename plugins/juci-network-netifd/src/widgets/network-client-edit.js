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
	$scope.hasGraphObject = function(){
		return $rpc.$has("router.graph","client_traffic");
	}
	$scope.ylabel = "Mbit/s";
	$scope.tick = 4000;
	$scope.id = $scope.model.client.hostname;
	$scope.tableData = {
		rows: []
	};
	$scope.traffic = {};
	$scope.$on("$destroy", function(){
		JUCI.interval.clear("updateTraffic");
	});
	var down_label = $tr(gettext("Download Speed"));
	var up_label = $tr(gettext("Upload Speed"));

	function updateTraffic(){
		if($scope.hasGraphObject()){
			var client_data;
			$rpc.$call("router.graph", "client_traffic").done(function(data){
				if (!data || !data[$scope.model.client.hostname])
					return;
				client_data = data[$scope.model.client.hostname];
				if(client_data.tx_bytes === undefined || client_data.rx_bytes === undefined)
					return;
				$scope.traffic.down = {
					label: down_label,
					value: clean(bytes_to_megabits(client_data.tx_bytes))
				}
				$scope.traffic.up = {
					label: up_label,
					value: clean(bytes_to_megabits(client_data.rx_bytes))
				}
			}).fail(function(e){
				console.error("network-client-edit: " + e);
			}).always(function(){
				if(client_data === undefined || client_data.tx_bytes === undefined || client_data.rx_bytes === undefined)
					return;
				$scope.tableData["rows"][0] = [
					down_label,
					to_kbit_or_mbit_str(client_data.tx_bytes)
				];
				$scope.tableData["rows"][1] = [
					up_label,
					to_kbit_or_mbit_str(client_data.rx_bytes)
				];
				$scope.$apply();
			});
		}
		$rpc.$call("router.network", "clients").done(function(data){
			// rx and tx are inverted by router.network clients
			if (!data || !$scope.model.client.hostname) return;
			Object.keys(data).forEach(function(client){
				if(data[client].hostname !== $scope.model.client.hostname)
					return
				if("tx_bytes" in data[client]){
					$scope.tableData.rows[2] = [
						$tr(gettext("Total Received Data")),
						to_kb_or_mb_str(data[client].tx_bytes)
					];
				}
				if("rx_bytes" in data[client]){
					$scope.tableData.rows[3] = [
						$tr(gettext("Total Transmitted Data")),
						to_kb_or_mb_str(data[client].rx_bytes)
					];
				}
				if(data[client].in_network){
					$scope.tableData.rows[4] = [
						"Total Uptime",
						secs_to_hms(data[client].in_network)
					];
				}
			});
		}).fail(function(e){
			console.error("network-client-edit: "+e);
		}).always(function(){
			$scope.$apply();
		});
	}

	function to_kbit_or_mbit_str(bytes){
		if(bytes * 8 / 1000 / 1000 < 1)
			return bytes_to_kilobits(bytes).toFixed(3) + " kbit/s";

		return bytes_to_megabits(bytes).toFixed(3) + " Mbit/s";
	}
	function to_kb_or_mb_str(bytes){
		if(bytes / 1000 / 1000 < 1)
			return bytes_to_kilobytes(bytes).toFixed(3) + " kB";

		return bytes_to_megabytes(bytes).toFixed(3) + " MB";
	}
	function bytes_to_megabits(bytes){ return ((bytes * 8) / 1000 / 1000); }
	function bytes_to_kilobits(bytes){ return ((bytes * 8) / 1000); }
	function bytes_to_megabytes(bytes){ return (bytes / 1000 / 1000); }
	function bytes_to_kilobytes(bytes){ return (bytes / 1000); }
	function clean(num){
		if (num < 100)
			return num.toFixed(2);
		return Math.round(num).toString();
	}
	function secs_to_hms(secs){
		var s=secs%60;
		var m=Math.floor(secs/60);
		var h=Math.floor(m/60);
		return String(h)+"h "+String(m-h*60)+"m "+String(s)+"s ";
	}

	JUCI.interval.repeat("updateTraffic",$scope.tick,function(next){
		updateTraffic();
		next();
	});

	$scope.$watch("model", function(value){
		if(!value || !value.client || !value.client.macaddr) return;
		if(value.client.network && value.client.duid)
			$scope.hasIPv6 = true;
		var networkList = [];
		$uci.$sync("dhcp").done(function(){
			$scope.staticLeses = $uci.dhcp["@host"];
			$scope.tags = $uci.dhcp["@tag"].map(function(tag){ return { label: String(tag[".name"]).toUpperCase(), value: tag[".name"] }; });
			$scope.client = $scope.staticLeses.filter(function(l){
				return String(l.mac.value).toUpperCase() === String(value.client.macaddr).toUpperCase();
			})[0];
			$scope.$apply();
		});
		$rpc.$call("router.network", "dump").done(function(data){
			networkList = Object.keys(data).map(function(key){ data[key]["name"] = key; return data[key];})
			.filter(function(net){ return net["is_lan"] && net.ipaddr && net.netmask;});

			$scope.$watch("client.ip.value", evalIp, false);
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
		function evalIp(){
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
		}
		function ip_to_host_id(ip){
			var long_ip = ip.split(":").map(function(part){return part.padStart(4, "0");})
			var len = long_ip.length;
			if(long_ip[len - 2] == "0000")
				return long_ip[len -1];
			return long_ip[len-2] + long_ip[len-1];
		}
		$scope.onAddStaticLease = function(){
			var duid = "";
			var host_id = "";
			if (!$scope.model || !$scope.model.client)
				return;
			if ($scope.model.client.ip6addr && $scope.model.client.duid){
				duid = $scope.model.client.duid;
				host_id = ip_to_host_id($scope.model.client.ip6addr);
			}

			$uci.$sync("dhcp").done(function(){
				$uci.dhcp.$create({
					".type":"host",
					ip: $scope.model.client.ipaddr,
					mac: $scope.model.client.macaddr,
					network: $scope.model.client.network,
					name: $scope.model.client.hostname === "*" ? "":$scope.model.client.hostname,
					hostid: host_id,
					duid: duid
				}).done(function(value){
					$scope.client = value;
					$scope.$apply();
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
			if(x === "active_connections") return { label: $tr(gettext("Active Connections")), value: val };
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

