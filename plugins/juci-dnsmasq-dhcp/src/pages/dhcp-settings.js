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
	$uci.$sync(["dhcp"]).done(function(){
		$scope.dnsmasq = $uci.dhcp["@dnsmasq"][0];
		$scope.hostfiles = $scope.dnsmasq.addnhosts.value.map(function(x){
			return { label: x };
		});
		$scope.bogusnxdomain = $scope.dnsmasq.bogusnxdomain.value.map(function(host){ return { label: host }});
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
		$scope.$apply();
	});	
	$scope.$watch("rebind_domain", function(){
		if(!$scope.server) return;
		$scope.dnsmasq.rebind_domain.value = $scope.rebind_domain.map(function(x){ return x.label });
	}, true);
	$scope.$watch("server", function(){
		if(!$scope.server) return;
		$scope.dnsmasq.server.value = $scope.server.map(function(x){ return x.label });
	}, true);
	$scope.$watch("bogusnxdomain", function(){
		if(!$scope.bogusnxdomain) return;
		$scope.dnsmasq.bogusnxdomain.value = $scope.bogusnxdomain.map(function(x){ return x.label });
	}, true);
	$scope.$watch("hostfiles", function(){
		if(!$scope.hostfiles) return;
		$scope.dnsmasq.addnhosts.value = $scope.hostfiles.map(function(x){return x.label});
	}, true);
	$scope.on_port_change = function(option){
		if($scope.dnsmasq[option] && $scope.dnsmasq[option].value){
			$scope.dnsmasq[option].value = $scope.dnsmasq[option].value.replace(/[^0-9]/g, "");
		}
	};
});
