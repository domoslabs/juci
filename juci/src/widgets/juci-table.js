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
.directive('dynamic', function ($compile) {
	return {
		restrict: 'A',
		replace: true,
		link: function (scope, element, attrs) {
			var childScope;
			scope.$watch(attrs.dynamic, function(html) {
				if(!html)
					return;
				if(childScope){
					childScope.$destroy();
					element.empty();
				}
				try {
					childScope = scope.$new();
					var compiledDirective = $compile(html);
					var directiveElement = compiledDirective(childScope);
					if(directiveElement.length === 0){
						directiveElement = document.createElement("div");
						directiveElement.innerHTML = html;
					}
				} catch(e){
					directiveElement = document.createElement("div");
					directiveElement.innerHTML = html;
				}
				element.append(directiveElement);
			});
		}
	};
})
.directive("juciTable", function($compile){
	return {
		// accepted parameters for this tag
		scope: {
			data: "=",
			columns: "=",
			title: "@",
			noequalize: "="
		},
		templateUrl: "widgets/juci-table.html",
		replace: true,
		controller: "juciTable",
		controllerAs: "ctrl"
		/*link: function(scope, element, attributes){
			 $compile('<juci-progress value="50" total="100"></juci-progress>')(scope, function(cloned, scope){
				 element.html(cloned);
				});
			}*/
	 };
})
.controller("juciTable", function($scope){
	if(!$scope.data)
		$scope.data = {};
	// assign columns from passed argument if present
	if($scope.columns && $scope.columns.length){
		if(!$scope.data.hasOwnProperty("columns"))
			$scope.data.columns = [];
		Object.assign($scope.data.columns, $scope.columns);
	}
	// make all columns the same size
	$scope.cell_class = "";
	$scope.first_cell_class = "";
	var ncols = 0;
	if($scope.data.rows && $scope.data.rows[0]){
		ncols = $scope.data.rows[0].length;
	} else if($scope.data.columns){
		ncols = $scope.data.columns.length;
	} else {
		ncols = 0;
	}
	if(ncols){
		// try to extend first column if the division is not whole number
		if(ncols < 12){
			var w = Math.round(12 / ncols);
			$scope.cell_class = "col-xs-"+w;
			if(((12 / ncols) - w) != 0){
				$scope.first_cell_class="col-xs-"+(12 - w * (ncols - 1));
			} else {
				$scope.first_cell_class= $scope.cell_class;
			}
		}
	}
	$scope.cellClass = function(idx){
		if(idx == 0) return $scope.first_cell_class;
		return $scope.cell_class;
	}
});
