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
.controller("dhcpSettingsPage", function($scope, $uci, $tr, gettext, $juciDialog){

	function codeInjectFilter(option) {
		var corrupt = false;
		option.forEach(file => {
			console.log(file);
			if (file.label.match(/^.*[$`\r\n\t]|(\\r)|(\\n)|(\\t)+.*$/))
				corrupt = true;
		});

		return corrupt;
	}

	$uci.$sync(["dhcp"]).done(function(){
		$scope.data = {
			input: [],
		}
		$scope.dnsmasq = $uci.dhcp["@dnsmasq"][0];
		if(!$scope.dnsmasq){
			console.error("missing dnsmasq section in dhcp config");
			return;
		}
		$rpc.$call("router.network", "dump").done(function(networks){
			Object.keys(networks).forEach(function(network){
				var name;
				if(networks[network].proto === "none")
					name = network + " " + $tr(gettext("Unmanaged"));
				else
					name = network + " " + $tr(gettext("Managed"));
				var net = {
					label: network,
					label_long: name,
					selected: $scope.dnsmasq.notinterface.value.some(function(iface){return iface === network;})
				}
				$scope.data.input.push(net);
			});
			$scope.$apply();
		}).fail(function(e){
			console.error("error getting networks", e);
		});
		$scope.onItemClick = function(data){
			if(data.selected)
				$scope.dnsmasq.notinterface.value = $scope.dnsmasq.notinterface.value.concat([data.label]);
			else{
				$scope.dnsmasq.notinterface.value = $scope.dnsmasq.notinterface.value.filter(function(name){ return name === data.label});
			}
		}
		$scope.hostfiles = $scope.dnsmasq.addnhosts.value.map(function(x){
			return { label: x };
		});
		$scope.bogusnxdomain = $scope.dnsmasq.bogusnxdomain.value.map(function(host){ return { label: host }});
		$scope.tags = $uci.dhcp["@tag"];
		$scope.server = $scope.dnsmasq.server.value.map(function(server){ return { label: server }});
		$scope.rebind_domain = $scope.dnsmasq.rebind_domain.value.map(function(domain){ return { label: domain }});
		$scope.classes = {
			"mac":		{ label: $tr(gettext("MAC Class")), value: "mac" },
			"vendorclass":	{ label: $tr(gettext("Vendor ID")), value: "vendorclass" },
			"userclass":	{ label: $tr(gettext("User Class")), value: "userclass" },
			"circuitid":	{ label: $tr(gettext("Circuit ID")), value: "circuitid" },
			"remoteid":	{ label: $tr(gettext("Remote ID")), value: "remoteid" },
			"subscrid":	{ label: $tr(gettext("Subscriber ID")), value: "subscrid" }
		}
		$scope.classList = Object.keys($scope.classes).map(function(cl){ return  $scope.classes[cl]; });

		$scope.classifications = (
			$uci.dhcp["@vendorclass"] || []).concat(
			$uci.dhcp["@mac"] || []).concat(
			$uci.dhcp["@userclass"] || []).concat(
			$uci.dhcp["@circuitid"] || []).concat(
			$uci.dhcp["@remoteid"] || []).concat(
			$uci.dhcp["@subscrid"] || []);
		$scope.onAddClassification = function(){
			var model = {
				classifications: $scope.classList,
				model: "vendorclass"
			}
			$juciDialog.show("dhcp-add-classification", {
				title: $tr(gettext("Select type of Classification")),
				model: model,
				on_apply: function(btn, inst){
					if(!$scope.classes.hasOwnProperty(model.model))
						return false;
					$uci.dhcp.$create({
						".type":model.model,
					}).done(function(res){
						$scope.classifications.push(res);
						$scope.$apply();
					}).fail(function(e){
						console.log(e);
					}).always(function(){
						inst.close();
					});
				}
			});
		}
		$scope.onDeleteClassification = function(c){
			if(c && c.$delete instanceof Function){
				c.$delete().done(function(){
					$scope.classifications = $scope.classifications.filter(function(cl){
						return cl[".name"] !== c[".name"];
					});
					$scope.$apply();
				});
			}
		}
		$scope.onAddTag = function(){
			var model = {name:"", error: null};
			$juciDialog.show("dhcp-add-tag", {
				title: $tr(gettext("Add new Tag")),
				model: model,
				on_apply: function(btn, inst){
					if(!model.name){
						model.error = $tr(gettext("Name can not be empty"));
						return;
					}
					if(model.name.match(/[^a-zA-Z0-9_]/)){
						model.error = $tr(gettext("Invalid name, it may only contain (a-z, A-Z, 0-9 and _)"));
						return;
					}
					$uci.dhcp.$create({
						".type":"tag",
						".name":model.name
					}).always(function(){
						inst.close();
					});
				}
			});
		}
		$scope.onDeleteTag = function(tag){
			if(tag && tag.$delete instanceof Function){
				tag.$delete().done(function(){
					$scope.$apply();
				});
			}
		}
		$scope.$apply();
	});
	$scope.$watch("rebind_domain", function(){
		if(!$scope.server) return;

		if (codeInjectFilter($scope.rebind_domain)) {
			$scope.dnsmasq.rebindError = "Input may not containing $, \\n, \\r, \\t or `";
			return;
		}

		$scope.dnsmasq.rebindError = undefined;
		$scope.dnsmasq.rebind_domain.value = $scope.rebind_domain.map(function(x){ return x.label });
	}, true);
	$scope.$watch("server", function(){
		if(!$scope.server) return;
		if (codeInjectFilter($scope.server)) {
			$scope.dnsmasq.forwardError = "Input may not containing $, \\n, \\r, \\t or `";
			return;
		}

		$scope.dnsmasq.forwardError = undefined;
		$scope.dnsmasq.server.value = $scope.server.map(function(x){ return x.label });
	}, true);
	$scope.$watch("bogusnxdomain", function(){
		if(!$scope.bogusnxdomain) return;

		if (codeInjectFilter($scope.bogusnxdomain)) {
			$scope.dnsmasq.bogusError = "Input may not containing $, \\n, \\r, \\t or `";
			return;
		}
		$scope.dnsmasq.bogusError = undefined;

		$scope.dnsmasq.bogusnxdomain.value = $scope.bogusnxdomain.map(function(x){ return x.label });
	}, true);
	$scope.$watch("hostfiles", function(){
		if(!$scope.hostfiles) return;

		if (codeInjectFilter($scope.hostfiles)) {
			$scope.dnsmasq.fileError = "Input may not containing $, \\n, \\r, \\t or `";
			return;
		}

		$scope.dnsmasq.fileError = undefined;
		$scope.dnsmasq.addnhosts.value = $scope.hostfiles.map(function(x){return x.label});
	}, true);
	$scope.on_port_change = function(option){
		if($scope.dnsmasq[option] && $scope.dnsmasq[option].value){
			$scope.dnsmasq[option].value = $scope.dnsmasq[option].value.replace(/[^0-9]/g, "");
		}
	};
});
