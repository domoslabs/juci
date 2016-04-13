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
.controller("InternetParentalControlPage", function($scope, $uci, $rpc, $network, $tr, gettext){
	$scope.urlList = [];
	$scope.macList = []; 
	$scope.errors = []; 
	$scope.connectedHosts = []; 
	
	$network.getConnectedClients().done(function(clients){
		$scope.connectedHosts = clients.map(function(client){
			return { 
				label: (client.hostname||"*")+" ("+client.ipaddr+")", 
				value: client.macaddr 
			}; 
		}); 
		$scope.$apply(); 
	});
	
	async.series([
		function(next){
			$uci.$sync("firewall").done(function(){
				$scope.firewall = $uci.firewall; 
				if(!$uci.firewall.urlblock){
					$uci.firewall.$create({".type": "urlblock", ".name": "urlblock"}).done(function(){
						$uci.$save().always(function(){ next(); }); 
					}); 
				} else {
					next(); 
				}
			}).always(function(){next();}); 
		}, function(next){
			// create url blocking section if it does not exist
			if(!$uci.firewall.urlblock){
				$uci.firewall.$create({
					".type": "urlblock", 
					".name": "urlblock"
				}).always(function(){
					next(); 
				}); 
			} else {
				next(); 
			}
		}, function(next){
			$rpc.juci.system.time.run({"method":"timediff"}).done(function(data){
				$scope.diff = data.diff;
			}).always(function(){next();});
		}], function(){
			$scope.accessRules = $uci.firewall["@rule"].filter(function(x){
				return x.parental.value; 
			}); 
			$scope.urlblock = $uci.firewall.urlblock; 
			$scope.urlblock.url.value.map(function(x){ $scope.urlList.push({url: x}); }); 
			$scope.urlblock.src_mac.value.map(function(x){ $scope.macList.push({mac: x}); }); 

			$scope.validateMAC = function(mac) { return (new UCI.validators.MACAddressValidator()).validate({value: mac}); }
			$scope.validateTimeSpan = function(range) { return (new UCI.validators.TimespanValidator()).validate({value: range})}; 
			
			$scope.onAddURL = function(){
				$scope.urlList.push({url: ""}); 
			}
			$scope.onDeleteURL = function(url){
				$scope.urlList = $scope.urlList.filter(function(x){
					return x.url != url; 
				}); 
			}
			
			$scope.$watch("urlList", function(){
				$scope.urlblock.url.value = $scope.urlList.map(function(k){
					return k.url; 
				}); 
			}, true);
			$scope.$watch("macList", function(){
				$scope.urlblock.src_mac.value = $scope.macList.map(function(k){
					return k.mac; 
				}); 
			}, true);
			
			function updateRules(){
				$scope.accessRules = $uci.firewall["@rule"].filter(function(rule){
					return rule.parental.value; 
				}); 
			} updateRules(); 
			$scope.convertTime = function(orig, diff){
				if(orig.match(/^[0-9]+:.+$/) == null || typeof diff != "number") return;
				var parts = orig.split(":");
				var new_hour = parseInt(parts[0]) + diff;
				if(new_hour < 10) parts[0] = "0"+new_hour;
				else parts[0] = ""+new_hour;
				return parts.join(":");
			};
			$scope.onCreateAccessRule = function(){
				console.log("Adding rule.."); 
				$uci.firewall.$create({
					".type": "rule", 
					"parental": true
				}).done(function(rule){
					rule[".new"] = true; 
					rule.name.value = $tr(gettext("Parental Rule")); 
					$scope.rule = {
						time_start: rule.start_time.value, 
						time_end: rule.stop_time.value, 
						days: rule.weekdays.value.split(" "), 
						macList: rule.src_mac.value.map(function(x){ return { mac: x }; }), 
						uci_rule: rule
					}; 
					$scope.$apply(); 
				}); 
			}
			
			$scope.onEditAccessRule = function(rule){
				$scope.rule = {
					time_start: $scope.convertTime(rule.start_time.value, $scope.diff),
					time_end: $scope.convertTime(rule.stop_time.value, $scope.diff),
					days: rule.weekdays.value.split(" "), 
					macList: rule.src_mac.value.map(function(x){ return { mac: x }; }), 
					uci_rule: rule
				}; 
			}
			
			$scope.onDeleteAccessRule = function(rule){
				rule.$delete().done(function(){
					updateRules(); 
					$scope.$apply(); 
				}); 
			}

			function removeDuplicates(){
				if(!$scope.errors || $scope.errors.length === 0) return;
				map = {};
				$scope.errors.map(function(er){
					if(!map[er]) map[er] = true;
				});
				$scope.errors = Object.keys(map);
			}
			$scope.onAcceptEdit = function(){
				if($scope.rule.macList.find(function(k){
					return $scope.validateMAC(k.mac); 
				})) return; 
				
				var rule = $scope.rule.uci_rule; 
				if(rule[".new"]) {
					$scope.accessRules.push(rule); 
					rule[".new"] = false; 
				}
				rule.src_mac.value = $scope.rule.macList.map(function(k){
					return k.mac; 
				}); 
				$scope.errors = rule.$getErrors();
				if(!$scope.rule.time_start || !$scope.rule.time_end){
					$scope.errors.push($tr(gettext("No start and/or end time given!")));
				}else {
					$scope.errors.concat($scope.validateTimeSpan($scope.rule.time_start+"-"+$scope.rule.time_end)).filter(function(x){ return x; }); 
				}
				removeDuplicates();
				if(!$scope.errors || $scope.errors.length == 0)
					rule.start_time.value = $scope.convertTime($scope.rule.time_start, -$scope.diff);
					rule.stop_time.value = $scope.convertTime($scope.rule.time_end, -$scope.diff); 
					rule.weekdays.value = $scope.rule.days.join(" "); 
					$scope.rule = null; 
			}
			
			$scope.onCancelEdit = function(){
				if($scope.rule && $scope.rule.uci_rule){
					if($scope.rule.uci_rule[".new"])
						$scope.rule.uci_rule.$delete(); 
					else 
						$scope.rule.uci_rule.$reset(); 
				}
				$scope.rule = null; 
			}
			
			$scope.$apply(); 
		}
	); 
}); 
