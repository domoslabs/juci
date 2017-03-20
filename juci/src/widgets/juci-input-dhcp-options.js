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
.directive("juciInputDhcpOptions", function () {
	return {
		templateUrl: "/widgets/juci-input-dhcp-options.html",
		controller: "juciInputDhcpOptionsCtrl",
		restrict: 'E',
		scope: {
			list: "=ngModel"
		},
		require: "ngModel"
	};
})
.controller("juciInputDhcpOptionsCtrl", function($scope, $tr, gettext){
	$scope.$watch("list", function(list){
		if(!list)
			return;
		$scope.data = {
			number: null,
			value: ""
		};
		$scope.deleteDHCPOption = function(opt){
			$scope.list = $scope.list.filter(function(item){ return item !== opt; });
		}
		$scope.addDHCPOption = function(){
			var num = $scope.data.number;
			var val = $scope.data.value;
			if(!num || !val)
				return;
			if(num >= 255 || num <= 0){
				alert($tr(gettext("Tag must be 1-254.")));
				return;
			}
			if($scope.list.indexOf(num+","+val) === -1){
				var newList = $scope.list.slice();
				newList.push(num+","+val);
				$scope.list = newList;
				$scope.data.number = null;
				$scope.data.value = "";
			}
			else{
				alert(newString+" " + $tr(gettext("Already added.")));
			}
		}
	}, false);
});
