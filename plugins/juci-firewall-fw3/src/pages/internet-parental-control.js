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
.controller("InternetParentalControlPage", function($scope, $uci, $network, $tr, gettext){
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

	$scope.getHostname = function(mac){
		if(!$scope.connectedHosts || !$scope.connectedHosts.length) return "";
		var host = $scope.connectedHosts.find(function(host){ return host.value === mac;});
		if(host && host.label) return host.label;
		return "";
	}


	$uci.$sync("firewall").done(function(){
		$scope.accessRules = $uci.firewall["@rule"].filter(function(x){
			return x.parental.value;
		});
		$scope.validateMAC = function(mac) { return (new UCI.validators.MACAddressValidator()).validate({value: mac}); }
		$scope.validateTimeSpan = function(range) { return (new UCI.validators.TimespanValidator()).validate({value: range})};
		$scope.validateTime = function(time){ return (new UCI.validators.TimeValidator()).validate({value: time })}

		function updateRules(){
			$scope.accessRules = $uci.firewall["@rule"].filter(function(rule){
				return rule.parental.value;
			});
		} updateRules();
		$scope.onCreateAccessRule = function(){
			$scope.errors = [];
			$scope.rule = {
				days: [],
				macList: [],
				uci_rule: "new",
				time_start: "",
				time_end: ""
			};
		}

		$scope.onEditAccessRule = function(rule){
			$scope.errors = [];
			$scope.rule = {
				days: rule.weekdays.value.split(" ").filter(function(x){ return x !== "";}),
				macList: rule.src_mac.value.map(function(x){ return { mac: x }; }),
				time_start: rule.start_time.value,
				time_end: rule.stop_time.value,
				uci_rule: rule
			};
		}

		$scope.onDeleteAccessRule = function(rule){
			rule.$delete().done(function(){
				updateRules();
				$scope.$apply();
			});
		}
		$scope.onAcceptEdit = function(){
			var r = $scope.rule;
			if(!r) return;
			$scope.errors = [];
			if(!r.days || r.days.length === 0){
				$scope.errors.push($tr(gettext("No day selected!")));
			}
			if(!r.macList || r.macList.length === 0){
				$scope.errors.push($tr(gettext("No target host selected!")));
			}else{
				$scope.rule.macList.map(function(k){
					$scope.errors.push($scope.validateMAC(k.mac));
				});
			}
			if(r.time_start === "" || r.time_end === ""){
				$scope.errors.push($tr(gettext("No start and/or end time selected!")));
			}else {
				var er = $scope.validateTime(r.time_start) || $scope.validateTime(r.time_end) ||
					$scope.validateTimeSpan(r.time_start+"-"+r.time_end);
				if(er) $scope.errors.push(er);
			}
			$scope.errors = $scope.errors.filter(function(er){ return er !== null;});
			if($scope.errors && $scope.errors.length > 0) return;
			var rule = r.uci_rule;
			if(rule === "new"){
				$uci.firewall.$create({
					".type": "rule",
					"parental": true,
					"name": $tr(gettext("Parental Rule"))
				}).done(function(rule){
					finish(rule, r);
					$scope.$apply();
				});
			}else{
				finish(rule, r);
			}
		}
		function finish(rule, r){
			var uciErr = rule.$getErrors();
			if(uciErr && uciErr.length > 0) $scope.errors.concat(uciErr);
			if($scope.errors && $scope.errors.length > 0) return;

			rule.src_mac.value = $scope.rule.macList.map(function(k){
				return k.mac;
			});
			rule.weekdays.value = $scope.rule.days.join(" ");
			rule.start_time.value = r.time_start;
			rule.stop_time.value = r.time_end;
			if(rule[".new"]) {
				rule[".new"] = false;
			}
			updateRules();
			$scope.rule = null;
		}

		$scope.onCancelEdit = function(){
			$scope.rule = null;
		}
	});
});
