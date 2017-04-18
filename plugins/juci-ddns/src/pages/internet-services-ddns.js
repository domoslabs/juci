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
.controller("DDNSPage", function ($scope, $uci, $tr, gettext, $rpc) {
	$scope.data = {}; 
	$uci.$sync(["ddns"]).done(function () {
		$scope.ddns_list = $uci.ddns["@service"]; 
		JUCI.interval.repeat("juci-ddns-status-update", 10000, function(next){update();next();});
	}); 

	function add_zero(num){
		if(num < 10)
			return ("0" + num);
		return "" + num;
	}

	function sec_to_string(sec){
		if(sec < 60)
			return sec + " " + ((sec === 1) ? $tr(gettext("Second")) : $tr(gettext("Seconds")));
		if(sec < 60 * 60)
			return Math.floor(sec / 60) + ":" + add_zero(sec%60);
		return Math.floor(sec/(60*60)) + ":" + add_zero(Math.floor(sec/60)%60) + ":" + add_zero(sec%60);
	}

	function set_values(ddns){
		ddns.$statusList = [
			["service_name", $tr(gettext("Provider"))],
			["domain", $tr(gettext("Domain name"))],
			["username", $tr(gettext("Username"))],
		].map(function(pair){
			if(!ddns[pair[0]] || !ddns[pair[0]].value) return null;
			return { label: pair[1], value: ddns[pair[0]].value };
		}).filter(function(f){ return f !== null; });
		if(!ddns_status){
			callback();
			return;
		}
		if(ddns_status.running !== undefined)
			ddns.$statusList.push({ label: $tr(gettext("Status")), value: ddns_status.running });
		if(ddns_status.next_update)
			ddns.$statusList.push({ label: $tr(gettext("Next update in")), value: sec_to_string(ddns_status.next_update) });
		if(ddns_status.errors && ddns_status.errors instanceof Array){
			for(i=ddns_status.errors.length; i > 0 && (ddns_status.errors.length - i) < 5; i--)
				ddns.$statusList.push({ label: $tr(gettext("Error")), value: ddns_status.errors[i-1] });
		}
		if(ddns_status.warnings && ddns_status.warnings instanceof Array){
			for(i=ddns_status.warnings.length; i > 0 && (ddns_status.warnings.length - i) < 5; i--)
				ddns.$statusList.push({ label: $tr(gettext("Warning")), value: ddns_status.warnings[i-1] });
		}
	}

	var ddns_status;
	var n=0;
	function update(){
		if(!$scope.ddns_list || !$scope.ddns_list.length)
			return;
		async.each($scope.ddns_list, function(ddns, callback){
			var i;
			$rpc.$call("juci.ddns", "status", { "service": ddns['.name'] }).done(function(ret){
				ddns_status = ret;
			}).always(function(){
				set_values(ddns);
				callback();
			});
		}, function(){
			$scope.$apply();
		});
		$scope.$apply();
	}

	function getNumber(){
		var done = false;
		var i = 0;
		while(!done){
			i = i + 1;
			if($scope.ddns_list.find(function(ddns){
				return ddns[".name"] === "Ddns_"+i;
			}) === undefined) done = true;
		}
		return i;
	}

	$scope.onAddDdnsSection = function(){
		$uci.ddns.$create({
			".type": "service", 
			".name": "Ddns_"+getNumber(),
			"enabled": true
		}).done(function(){
			$scope.$apply(); 
		}); 
	} 

	$scope.onRemoveDdnsSection = function(ddns){
		if(!ddns) return; 
		ddns.$delete().done(function(){
			$scope.$apply(); 
		});  
	}

	$scope.getItemTitle = function(item){
		return item[".name"]; 
	}
});
