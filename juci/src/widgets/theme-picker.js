/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
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
.directive("juciThemePicker", function(){
	return {
		templateUrl: "/widgets/theme-picker.html", 
		replace: true
	 };  
})
.controller("JuciThemePickerController", function($scope, $theme, $config){
	$scope.themes = $config.themes.map(function(x){
		var item = {
			value: x, 
			label: x
		}; 
		if(x == $theme.getCurrentTheme()) $scope.selectedTheme = item; 
		return item; 
	}); 
	if(!$scope.selectedTheme) $scope.selectedTheme = $scope.themes[0]; 
	$scope.onChangeTheme = function(){
		//alert($scope.selectedTheme.id); 
		$theme.changeTheme($scope.selectedTheme.value).done(function(){
			window.location.reload(); 
		});
	}
}); 
