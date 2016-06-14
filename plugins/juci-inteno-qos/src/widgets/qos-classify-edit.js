/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
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
.directive("qosClassifyEdit", function(){
	return {
		templateUrl: "/widgets/qos-classify-edit.html",
		scope: {
			rule: "=ngModel"
		},
		controller: "qosClassifyEdit",
		replace: true,
		require: "^ngModel"
	};
})
.controller("qosClassifyEdit", function($scope, $uci, $tr, gettext, $network, intenoQos){
	$scope.data = {
		ports: [],
		portrange: {from:"" , to:""},
		connbytes: {from:"", to:""}
	};
	$scope.directions = [ {value:'in',label:'In'}, {value:'out',label:'Out'}, {value:'',label:'Both'} ];
	$scope.tcpflags = {};
	$scope.tcpflags.all = [
		{value:'SYN',label:'SYN'},
		{value:'ACK',label:'ACK'},
		{value:'FIN',label:'FIN'},
		{value:'RST',label:'RST'},
		{value:'URG',label:'URG'},
		{value:'PSH',label:'PSH'}];
	$scope.data.precedence = [
		{ label: $tr(gettext("All")),	value: '' },
		{ label: '0',					value: '0' },
		{ label: '1',					value: '8 10 12 14' },
		{ label: '2',					value: '16 18 20 22' },
		{ label: '3',					value: '24 26 28 30' },
		{ label: '4',					value: '32 34 36 38' },
		{ label: '5',					value: '40 46' },
		{ label: '6',					value: '48' },
		{ label: '7',					value: '56' }
	];
	$scope.data.protocols = [
		{ label: $tr(gettext("All")),		value: '' },
		{ label: $tr(gettext("TCP")),		value: 'tcp' },
		{ label: $tr(gettext("UDP")),		value: 'udp' },
		{ label: $tr(gettext("ICMP")),		value: 'icmp' }
	];
	
	$scope.addSelectedTCPflags = function(){
		function getValue(x){ return x.value; }
		$scope.rule.tcpflags.value = $scope.tcpflags.selected.map(getValue).join();
	};

	$network.getConnectedClients().done(function(data){
		$scope.clients = data.map(function(x){
			return {label: x.ipaddr, value: x.ipaddr }
		});
		$scope.$apply();
	});
	intenoQos.getClassNames().done(function(classes){
		$scope.targets = classes.map(function(x){ 
			return { label: x, value: x };
		});
		$scope.$apply();
	});
	$scope.$watch("rule", function(){
		if(!$scope.rule) return;
		$scope.tcpflags.selected = $scope.rule.tcpflags.value.split(",");
		function isSelected(flag){ return $scope.tcpflags.selected.indexOf(flag) > -1; }
		function makeSelected(obj){ obj.selected = isSelected(obj.value); }
		$scope.tcpflags.all.forEach(makeSelected);

		$scope.data.ports = $scope.rule.ports.value.split(",").map(function(port){return {value: port }});
		if($scope.rule.srcports){
			$scope.data.srcports = $scope.rule.srcports.value.split(",").map(function(port){return {value: port }});
		}else{ $scope.data.srcports = []; }
		if($scope.rule.dstports){
			$scope.data.dstports = $scope.rule.dstports.value.split(",").map(function(port){return {value: port }});
		}else{ $scope.data.dstports = []; }

		if($scope.rule.portrange){
			$scope.data.portrange.from = parseInt($scope.rule.portrange.value.split("-")[0]);
			$scope.data.portrange.to = parseInt($scope.rule.portrange.value.split("-")[1]);
		}else{
			$scope.data.portrange.from = 0;
			$scope.data.portrange.to = 0;
		}
		
		if($scope.rule.connbytes){
			$scope.data.connbytes.from = parseInt($scope.rule.connbytes.value.split(":")[0]);
			$scope.data.connbytes.to = parseInt($scope.rule.connbytes.value.split(":")[1]);
		}

		//if($scope.rule.pktsize && $scope.rule.pktsize.value===0){ $scope.rule.pktsize.value = ""; }
	}, false);

	$scope.$watch("data.portrange", function(p){
		if(!$scope.rule){ return; }

		$scope.rule.portrange.value = p.from.toString() + "-" + p.to.toString();

		if(p.to > p.from){ $scope.rule.portrange.error = null; }
	}, true);
	$scope.$watch("data.connbytes", function(c){ //TODO: FIX THIS AND ADD VALIDATOR
		if(!$scope.rule){ return; }
		var from = $scope.data.connbytes.from
		var to = $scope.data.connbytes.to
		if(from && !to){ $scope.rule.connbytes.value = from.toString(); }
		if(from && to){ $scope.rule.connbytes.value = from.toString()+":"+to.toString(); }
		if(!from && !to){ $scope.rule.connbytes.value = ""; }

	}, true);

	$scope.onAddPort = function(){
		$scope.rule.ports.value = $scope.data.ports.map(function(p){return p.value; }).join(",");
	}
	$scope.onAddSrcPort = function(){
		$scope.rule.srcports.value = $scope.data.srcports.map(function(p){return p.value; }).join(",");
	}
	$scope.onAddDstPort = function(){
		$scope.rule.dstports.value = $scope.data.dstports.map(function(p){return p.value; }).join(",");
	}

	$scope.evalPort = function(port){
		if(port.value.match(/^[0-9]+$/) && parseInt(port.value) < 65536) return true;
		return false;
	}
});
