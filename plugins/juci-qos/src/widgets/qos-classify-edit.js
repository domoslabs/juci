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
.controller("qosClassifyEdit", function($scope, $uci, $tr, gettext, $network, $qos){
	$scope.data = {
		ports: [],
		portrange: {from:"" , to:""},
		connbytes: {from:"", to:""},
		original: {},
	};
	function getOriginalPortSetting(){ //Assuming only one of ports,dstports,srcports,portrange is set at startup
		if($scope.rule.ports && $scope.rule.ports.value !== ""){
			$scope.data.original.ports = $scope.rule.ports.value;
			$scope.data.original.portfilter = "ports";
			$scope.data.original.portdata = $scope.rule.ports.value.split(",").map(function(port){return {value: port }});
		}
		else if($scope.rule.dstports && $scope.rule.dstports.value !== ""){
			$scope.data.original.dstports = $scope.rule.dstports.value;
			$scope.data.original.portfilter = "dstports";
			$scope.data.original.portdata = $scope.rule.dstports.value.split(",").map(function(port){return {value: port }});
		}
		else if($scope.rule.srcports && $scope.rule.srcports.value !== ""){
			$scope.data.original.srcports = $scope.rule.srcports.value;
			$scope.data.original.portfilter = "srcports";
			$scope.data.original.portdata = $scope.rule.srcports.value.split(",").map(function(port){return {value: port }});
		}
		else if($scope.rule.portrange && $scope.rule.portrange.value !== ""){
			$scope.data.original.portrange = $scope.rule.portrange.value;
			$scope.data.original.portfilter = "portrange";
			$scope.data.original.portdata = {
				from: parseInt($scope.rule.portrange.value.split("-")[0]),
				to: parseInt($scope.rule.portrange.value.split("-")[1])
			}
		}
		$scope.data.portfilter = $scope.data.original.portfilter;
	}

	$scope.directions = [ {value:'in',label:'In'}, {value:'out',label:'Out'}, {value:'',label:'Both'} ];
	$scope.data.portfilters = [
		{ label: 'Ports',	value: 'ports' },
		{ label: 'Source',	value: 'srcports' },
		{ label: 'Destination',	value: 'dstports' },
		{ label: 'Port Range',	value: 'portrange' }
	];
	$scope.data.protocols = [
		{ label: $tr(gettext("All")),		value: '' },
		{ label: $tr(gettext("TCP")),		value: 'tcp' },
		{ label: $tr(gettext("UDP")),		value: 'udp' },
		{ label: $tr(gettext("ICMP")),		value: 'icmp' }
	];
	$network.getConnectedClients().done(function(data){
		$scope.clients = data.map(function(x){
			return {label: x.ipaddr, value: x.ipaddr }
		});
		$scope.$apply();
	});
	$qos.getClassNames().done(function(classes){
		$scope.targets = classes.map(function(x){ 
			return { label: x, value: x };
		});
		$scope.$apply();
	});
	$scope.$watch("rule", function(){
		if(!$scope.rule) return;
		getOriginalPortSetting();

		if($scope.rule.ports && $scope.rule.ports.value !== ""){
			$scope.data.ports = $scope.rule.ports.value.split(",").map(function(port){return {value: port }});
		}else{ $scope.data.ports = []; }

		if($scope.rule.srcports && $scope.rule.srcports.value !== ""){
			$scope.data.srcports = $scope.rule.srcports.value.split(",").map(function(port){return {value: port }});
		}else{ $scope.data.srcports = []; }

		if($scope.rule.dstports && $scope.rule.dstports.value !== ""){
			$scope.data.dstports = $scope.rule.dstports.value.split(",").map(function(port){return {value: port }});
		}else{ $scope.data.dstports = []; }

		if($scope.rule.portrange){
			$scope.data.portrange.from = parseInt($scope.rule.portrange.value.split("-")[0]);
			$scope.data.portrange.to = parseInt($scope.rule.portrange.value.split("-")[1]);
		}		
		if($scope.rule.connbytes){
			$scope.data.connbytes.from = parseInt($scope.rule.connbytes.value.split(":")[0]);
			$scope.data.connbytes.to = parseInt($scope.rule.connbytes.value.split(":")[1]);
		}

		//if($scope.rule.pktsize && $scope.rule.pktsize.value===0){ $scope.rule.pktsize.value = ""; }
	}, false);

	function resetPortFilters(portfilter){
		if (portfilter === "portrange") {
			$scope.data.portrange.from = "";
			$scope.data.portrange.to = "";
		}
		else {
			$scope.data.ports = [];
			$scope.data.srcports = [];
			$scope.data.dstports = [];
		}
		$scope.rule.ports.value = "";
		$scope.rule.srcports.value = "";
		$scope.rule.dstports.value = "";
		$scope.rule.portrange.value = "";

		if (portfilter === $scope.data.original.portfilter){
			$scope.rule[portfilter] = $scope.data.original[portfilter];
			if (portfilter === "portrange") { //deep copy in case of portrange
				$scope.data[portfilter] = {from:$scope.data.original.portdata.from, to:$scope.data.original.portdata.to}
			}
			else { $scope.data[portfilter] = $scope.data.original.portdata; }
		}

	}
	//backend cannot handle multiple port filters simultaneously
	//when port settings are changed, all except the chosen portsetting should be deleted
	$scope.$watch("data.portfilter", function(portfilter){
		if(!$scope.rule){ return; }
		resetPortFilters(portfilter);
	}, true);
	$scope.$watch("data.portrange", function(p){
		if(!$scope.rule){ return; }
		var from = $scope.data.portrange.from;
		var to = $scope.data.portrange.to;
		if(!from && !to){ $scope.rule.portrange.value = ""; }
		if(from && !to){ $scope.rule.portrange.value = from.toString(); }
		if(from && to){ $scope.rule.portrange.value = from.toString() + "-" + to.toString(); }
	}, true);
	//port filtering not applicable to icmp protocol
	$scope.$watch("rule.proto.value", function(proto){
		if(!$scope.rule){ return; }
		if(proto === "icmp"){
			resetPortFilters();
		}
		else{
			resetPortFilters($scope.data.original.portfilter);
		}
		
	}, true);
	$scope.$watch("data.connbytes", function(c){
		if(!$scope.rule){ return; }
		var from = $scope.data.connbytes.from
		var to = $scope.data.connbytes.to

		if(from && !to){
			$scope.rule.connbytes.value = from.toString();
			$scope.data.connbytes.error = null;
		}
		if(from && to){
			if(to > from){
				$scope.rule.connbytes.value = from.toString()+":"+to.toString();
				$scope.data.connbytes.error = null;
			}
			else{ $scope.data.connbytes.error = $tr(gettext("End value has to be larger than start value.")); }
		}
		if(!from && !to){
			$scope.rule.connbytes.value = "";
			$scope.data.connbytes.error = null;
		}
		if(!from && to){
			$scope.data.connbytes.error = $tr(gettext("End value has to be larger than start value."));
		}
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
