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
.directive("juciDhcpOptionsEditor", function () {
	return {
		templateUrl: "/widgets/juci-dhcp-options-editor.html",
		controller: "juciDhcpOptionsEditorCtrl",
		restrict: 'E',
		scope: {
			normal: "=option",
			forced: "=optionForced"
		},
		require: "^option"
	};
})
.controller("juciDhcpOptionsEditorCtrl", function($scope, $tr, gettext){
        $scope.$watch("normal", function(normal){
                if(!normal)
                        return;
                $scope.options = [];
                normal.value.forEach(function(opt){
                        var parts = opt.split(",");
                        var id = parts[0];
                        parts.shift();
                        var value = parts.join(",");
                        $scope.options.push({
                                id:id,
                                value:value,
                                force:false
                        });
                });
                if($scope.forced){
                        $scope.forced.value.forEach(function(opt){
                                var parts = opt.split(",");
                                var id = parts[0];
                                parts.shift();
                                var value = parts.join(",");
                                $scope.options.push({
                                        id:id,
                                        value:value,
                                        force:true
                                });
                        });
                }
	}, false);
	$scope.$watch("options", function(options, oldOptions){
		if(!options || oldOptions == options) return
		var tmp_normal = [];
		var tmp_forced = [];
		options.forEach(function(opt){
			if(opt.force)
				tmp_forced.push(opt.id + "," + opt.value);
			else
				tmp_normal.push(opt.id + "," + opt.value);
		});
		$scope.normal.value = tmp_normal;
		if($scope.forced)
			$scope.forced.value = tmp_forced;
	}, true);
	$scope.addDHCPOption = function(){
		$scope.options.push({
			id:0,
			value:"",
			force:false
		});
	}
	$scope.deleteDHCPOption = function(opt){
		$scope.options = $scope.options.filter(function(option){
			return option !== opt;
		});
	}
});
