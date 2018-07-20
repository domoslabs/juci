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
.directive("juciThemePicker", function(){
	return {
		templateUrl: "/widgets/theme-picker.html", 
		replace: true,
		controller: "JuciThemePickerController"
	 };  
})
.controller("JuciThemePickerController", function($rpc, $scope, $config){
	$scope.selectedTheme = $config.get("settings.juci.theme");
	$rpc.$call("juci.core", "get_themes").done(function(data){
		if(data && data.themes) {
			$scope.themes = data.themes.map(function(theme){
				return { value: theme.theme, label: theme.label };
			});
		}
		$scope.$apply();
	}).fail(function(e){
		console.error("couldn't call juci.core get_themes", e);
	});
}); 
