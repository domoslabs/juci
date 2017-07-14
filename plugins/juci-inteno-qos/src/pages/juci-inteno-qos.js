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

JUCI.app.controller("intenoQosCtrl", function($scope, $uci, $tr, gettext, intenoQos, $juciDialog, $firewall){
	$uci.$sync(["qos"]).done(function(){
		$scope.classify = $uci.qos["@classify"];
		$scope.reclassify = $uci.qos["@reclassify"];
		$scope.ifaces = $uci.qos["@interface"];
		$scope.classes = $uci.qos["@class"];
		$scope.classgroups = $uci.qos["@classgroup"];
		$scope.ifaces && $scope.ifaces.length && $scope.ifaces.map(function(iface){
			iface.$statusList = [
				["enabled", $tr(gettext("Enabled"))],
				["download", $tr(gettext("Download Speed"))],
				["upload", $tr(gettext("Upload Speed"))]
			].map(function(pair){
				if(!iface[pair[0]] || iface[pair[0]].value === "") return null;
				return { label: pair[1], value: iface[pair[0]].value };
			}).filter(function(f){ return f !== null; });
		});
		getNetworks();
	});
	function getNetworks(){
		$firewall.getZoneNetworks("wan").done(function(nets){
			$scope.interfaces = nets.filter(function(net){ return !net.ifname.value.match(/^@.*/); })
			.map(function(net){ return {label:String(net.$info.interface).toUpperCase(), value: net.$info.interface}; })
			.filter(function(net){ return !$scope.ifaces.find(function(i){ return i[".name"] == net.value; }); });
			$scope.$apply();
		});
	}
	intenoQos.getDefaultTargets().done(function(targets){
		$scope.targets = targets.map(function(x){ return { label: x, value: x }; }); 
		$scope.$apply(); 
	}); 

	$scope.onAddClass = function(){
		var newClassName = { name : "" };

		$juciDialog.show("new-class-modal", {
			title: $tr(gettext("New Class")),
			model: newClassName,
			on_apply: function(btn, dlg){
				if(newClassName.name.match(/[\W]/) === null) { // If name contains no invalid character
					$uci.qos.$create(
						{
						".type": "class",
						".name": newClassName.name
						}
					).done(function(){ $scope.$apply(); });
					return true;
				}
				else { alert("Class name may only contain characters, numbers and underscore."); }
			},
		}).done(function(){
		}).fail(function(){
		});
	}

	$scope.onAddClassgroup = function(){
		var newClassgroupName = { name : "" };

		$juciDialog.show("new-classgroup-modal", {
			title: $tr(gettext("New Classgroup")),
			model: newClassgroupName,
			on_apply: function(btn, dlg){
				if(newClassgroupName.name.match(/[\W]/) === null) { // If name contains no invalid character
					$uci.qos.$create(
						{
						".type": "classgroup",
						".name": newClassgroupName.name
						}
					).done(function(){ $scope.$apply(); });
					return true;
				}
				else { alert("Classgroup name may only contain characters, numbers and underscore."); }
			},
		}).done(function(){
		}).fail(function(){
		});
	}

	$scope.onAddIface = function(){
		var newIfaceName = { name : "" };

		$juciDialog.show("add-bw-interface-edit", {
			title: $tr(gettext("New Interface")),
			model: newIfaceName,
			on_apply: function(btn, dlg){
				if(newIfaceName.name.match(/[\W]/) === null) { // If name contains no invalid character
					$uci.qos.$create(
						{
						".type": "interface",
						".name": newIfaceName.name
						}
					).done(function(){ $scope.$apply(); });
					return true;
				}
				else { alert("Interface name may only contain characters, numbers and underscore."); }
			},
		}).done(function(){
		}).fail(function(){
		});
	}


	$scope.addClassify = function(){
		$uci.qos.$create({
			".type": "classify"
		}).done(function(){
			$scope.$apply(); 
		}); 
	};
	$scope.addReclassify = function(){
		$uci.qos.$create({
			".type": "reclassify"
		}).done(function(){
			$scope.$apply(); 
		}); 
	};

	$scope.onDeleteIface = function(item){
		if(!item) return;
		item.$delete().done(function(){
			getNetworks();
		});
	};

	$scope.getClassTitle = function(item){
		if(!item) return "";
		return String(item[".name"]);
	}
	$scope.getClassifyTitle = function(item){
		var str = (item.target.value+" "+(item.srchost.value?("(src host: "+item.srchost.value+") "):"")+
					(item.dsthost.value?("(dst host: "+item.dsthost.value+") "):"")+
					(item.proto.value?("(protocol: "+item.proto.value.toUpperCase()+") "):"")+
					(item.ports.value?("(ports: "+item.ports.value+") "):""));
		if(str.length > 53) return str.substring(0, 50)+"...";
		return str;
	}
	$scope.getIfaceTitle = function(item){
		if(!item) return "";
		return String(item[".name"]).toUpperCase();
	};
	$scope.getClassgroupTitle = function(item){
		if(!item) return "";
		return String(item[".name"]);
	}

	$scope.onDeleteRule = function(item){
		if(!item) return; 
		item.$delete().done(function(){
			$scope.$apply(); 
		}); 
	};
});
