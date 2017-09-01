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
.factory("$juciDialog", function($modal, $network, $tr, gettext, $modal){
	return {
		show: function(widget, opts){
			var def = $.Deferred(); 
			if(!opts) opts = {}; 
			
			if(!opts.buttons) opts.buttons = [ 
				{ label: $tr(gettext("Apply")), value: "apply", primary: true }, 
				{ label: $tr(gettext("Cancel")), value: "cancel" }
			]; 
			if(!opts.on_button) opts.on_button = function(btn, inst){
				if(btn.value == "cancel") inst.dismiss("cancel"); 
				if(btn.value == "apply") {
					if(opts.on_apply && typeof opts.on_apply == "function") {
						if(opts.on_apply(btn, inst)) inst.close(); 
					}
				}
			}
			if(opts.size == undefined) opts.size = "lg";
			if(widget == null && !opts.content) opts.widget = "<div></div>";
			if(widget == null && opts.content) opts.widget = opts.content;
			else opts.widget = "<" + widget + " ng-model='model'/>"; 
			var modalInstance = $modal.open({
				animation: false,
				backdrop: "static", 
				keyboard: false,
				size: opts.size,
				windowClass: (opts.big)?"big-modal-window":"",
				templateUrl: opts.templateUrl || 'widgets/juci-dialog.html',
				controller: opts.controller || 'juciDialog',
				resolve: {
					dialogOptions: function () {
						return opts; 
					}
				}
			});

			modalInstance.result.then(function (data) {
				setTimeout(function(){ // do this because the callback is called during $apply() cycle
					def.resolve(data); 
				}, 0); 
			}, function () {
					
			}).finally(function(){
				modalInstance.$destroy();

			});
			
			return def.promise(); 
		} 
	}; 
})
.controller("juciDialog", function($scope, $modalInstance, dialogOptions, gettext){
	var opts = dialogOptions; 
	$scope.opts = dialogOptions; 
	$scope.data = {}; 
	$scope.model = dialogOptions.model; 
	$scope.on_button = opts.on_button || function (btn) {
		if(dialogOptions.validate && typeof dialogOptions.validate == "function" && !dialogOptions.validate(btn)){
			return; 
		}
		if(dialogOptions.on_button && typeof dialogOptions.on_button == "function"){
			dialogOptions.on_button(btn, $modalInstance); 
		}
	};
	$scope.on_button_click = function(btn){
		return $scope.on_button(btn, $modalInstance); 
	}
}); 
