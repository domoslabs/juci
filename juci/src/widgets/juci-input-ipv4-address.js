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
.directive("juciInputIpv4Address", function () {
	return {
		templateUrl: "/widgets/juci-input-ipv4-address.html",
		controller: "juciInputIpv4Address",
		restrict: 'E',
		scope: {
				placeholder: "@",
				ngModel: "="
		},
		require: "ngModel"
	};
})
.controller("juciInputIpv4Address", function($scope, $attrs, $parse, $uci){
	$scope.data = { parts: [ "0", "0", "0", "0" ] };
	$scope.placeholders = ["...","...","...","..."];

	var ngModel = $parse($attrs.ngModel);

	// extract model into the parts
	$scope.$watch("ngModel", function(value){
		if(value === undefined || typeof value != "string") return;
		var parts = value.split(".");
		$scope.data.parts = [];
		parts.forEach(function(v, i){
			$scope.data.parts[i] = v;
		});
	},true);

	$scope.$watch("placeholder", function(){
		if(!$scope.placeholder || typeof $scope.placeholder != "string") return;
		var validator = new $uci.validators.IP4AddressValidator();
		if(validator.validate({value:$scope.placeholder}) == null){
			$scope.placeholders = $scope.placeholder.split(".");
		}
	}, false);

	// reassemble model when parts change
	$scope.updateModel = function() {
		console.log("Assemble parts: "+$scope.data.parts);
		var ipaddr = $scope.data.parts.join(".");
		if(ipaddr == "..." || ipaddr == ".." || ipaddr == ".") ipaddr = "";
		if($scope.ngModel != ipaddr) ngModel.assign($scope.$parent, ipaddr);
	};
	
	$scope.onCopy = function(ev){
		if(ev.originalEvent.clipboardData && ev.originalEvent.clipboardData.setData){
			ev.originalEvent.clipboardData.setData("text/plain", $scope.data.parts.join(".")); 
			ev.preventDefault(); 
		}
	}

	$scope.onPaste = function(ev){
		var ip = ev.originalEvent.clipboardData.getData('text/plain');
		if(!ip) return;
		var parts = ip.split(".");
		if(parts.length != 4) return;
		parts.forEach(function(v, i){ $scope.data.parts[i] = v; });
		$scope.updateModel();
	}
}).directive('juciInputIpv4AutoMoveOnDot', function() {
  return {
    restrict: 'A',
    link: function($scope,elem,attrs) {
      elem.bind('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 190) {
			e.preventDefault();
			var inputs = elem.parent().parent().parent().find(":input"); 
			var next = inputs.eq(inputs.index(elem) + 1); 
			var cur = inputs.eq(inputs.index(elem)); 
			next.attr("ovalue", next.val()).val("").focus(); 
			if(cur.attr("ovalue") && cur.val() == "") cur.val(cur.attr("ovalue")); 
        }
      });
    }
  }
});

