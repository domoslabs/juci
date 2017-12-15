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

(function($juci){
	function JUCIThemeManager(){
		this.currentTheme = null; 
		this.themes = {}; 
		this.loadTheme = function(theme_id){
			if(theme_id == "default") theme_id = "inteno"; 
			var deferred = $.Deferred(); 
			var self = this; 
			var themes = this.themes; 
			if(!(theme_id in themes)) {
				var theme_root = "themes/"+theme_id; 
				$.getJSON(theme_root+"/theme.json").done(function(data){
					if(!data) return; 
					
					
					themes[theme_id] = data; 
					if(data.scripts){
						async.eachSeries(data.scripts, function(script, next){
							if(!JUCI_COMPILED){
								require([theme_root + "/"+script], function(module){
									next(); 
								}); 
							} else {
								next(); 
							}
						}, function(){
							deferred.resolve(data); 
						}); 
					} else {
						deferred.resolve(data); 
					}
				}).fail(function(){
					console.log("Could not retreive theme config for theme: "+theme_id); 
					self.changeTheme("default"); 
				}); 
			} else {
				deferred.resolve(themes[theme_id]); 
			}
			return deferred.promise(); 
		}; 
		this.changeTheme = function(theme_id){
			var deferred = $.Deferred(); 
			this.loadTheme(theme_id).done(function(theme){
				$juci.config.theme = theme_id; 
				localStorage.setItem("theme", theme_id); 
				var theme_root = "themes/"+theme_id; 
				$("head link[data-theme-css]").remove(); 
				if(theme.styles){
					theme.styles.map(function(x){
						var style = $('<link href="'+theme_root+'/' + x + '" rel="stylesheet" data-theme-css/>');
						style.appendTo('head'); 
					}); 
				}
				deferred.resolve(); 
			}).fail(function(){
				deferred.reject(); 
				// error
			}); 
			return deferred.promise(); 
		};  
		this.getCurrentTheme = function(){
			return localStorage.getItem("theme"); 
		}, 
		this.getAvailableThemes = function(){
			return this.themes; 
		}
	}; 
	JUCI.theme = new JUCIThemeManager(); 
	JUCI.app.factory('$theme', function($rootScope, $config, $localStorage, $http){
		return JUCI.theme; 
	}); 
})(JUCI); 
