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
.controller("SnmpConfigPage", function($scope, $uci, $tr, gettext, $juciConfirm){
	$uci.$sync("snmpd").done(function(){
		$scope.systems = $uci.snmpd["@system"];
		$scope.agents = $uci.snmpd["@agent"];
		$scope.com2secs = $uci.snmpd["@com2sec"];
		$scope.groups = $uci.snmpd["@group"];
		$scope.views = $uci.snmpd["@view"];
		$scope.accesses = $uci.snmpd["@access"];
		$scope.passes = $uci.snmpd["@pass"];
		$scope.enabled = $uci.snmpd.daemon;
		$scope.$apply(); 
	}); 
	var uk = $tr(gettext("Unknown"));
	$scope.getSystemTitle = function(item){
		return item.sysName.value || item.sysContact.value || item.sysLocation.value || $tr(gettext("Unnamed System"));
	};
	$scope.getAgentTitle = function(item){
		return $tr(gettext("Agent ")) + item.agentaddress.value || $tr(gettext("without address"));
	};
	$scope.getCom2secTitle = function(item){
		return item.community.value || item.source.value || item.secname.value || $tr(gettext("Empty Com2sec"));
	};
	$scope.getGroupTitle = function(item){
		return $tr(gettext("Group: ")) + (item.group.value || $tr(gettext("Unknown Group"))) + $tr(gettext(" Version: ")) + (item.version.value || $tr(gettext("Unknown Version"))) + $tr(gettext(" SecName: ")) + (item.secname.value || $tr(gettext("Unknown SecName")));
	};
	$scope.getViewTitle = function(item){
		return item.viewname.value || item.type.value || item.oid.value || item.mask.value || $tr(gettext("Empty View"));
	};
	$scope.getAccessTitle = function(item){
		return $tr(gettext("Group: ")) + (item.group.value || $tr(gettext("Unknown Group"))) + $tr(gettext(" Read: ")) + (item.read.value || uk) + $tr(gettext(" Write: ")) + (item.write.value || uk);
	};
	$scope.getPassTitle = function(item){
		return $tr(gettext("Persist: ")) + item.persist.value + $tr(gettext(" Priority: ")) + (item.priority.value || uk) + $tr(gettext(" MIB OID: ")) + (item.miboid.value || uk) + $tr(gettext(" Program: ")) + (item.program.value || uk);
	};
	$scope.onAddSystem = function(){
		$uci.snmpd.$create({
			".type": "system",
			"name": "New System"
		}).done(function(){
			$scope.$apply();
		});
	};
	$scope.onAddAgent = function(){
		$uci.snmpd.$create({
			".type": "agent",
			"agentaddress": "New Agent Address"
		}).done(function(){
			$scope.$apply();
		});
	};
	$scope.onAddCom2sec = function(){
		$uci.snmpd.$create({
			".type": "com2sec"
		}).done(function(){
			$scope.$apply();
		});
	};
	$scope.onAddGroup = function(){
		$uci.snmpd.$create({
			".type": "group"
		}).done(function(){
			$scope.$apply();
		});
	};
	$scope.onAddView = function(){
		$uci.snmpd.$create({
			".type": "view"
		}).done(function(){
			$scope.$apply();
		});
	};
	$scope.onAddAccess = function(){
		$uci.snmpd.$create({
			".type": "view"
		}).done(function(){
			$scope.$apply();
		});
	};
	$scope.onAddPass = function(){
		$uci.snmpd.$create({
			".type": "pass"
		}).done(function(){
			$scope.$apply();
		});
	};
	$scope.onDeleteSection = function(system){
		$juciConfirm.show($tr(gettext("Are you sure you want to delete System?"))).done(function(res){
			system.$delete().done(function(){$scope.$apply();});
		});
	};
}); 
