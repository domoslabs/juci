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

(function($juci){
	function JUCIConfig(){
		this.settings = {}; 
		this.filename = "";
	}

	JUCIConfig.prototype.$init = function(){
		var deferred = $.Deferred(); 
		var self = this; 
			
		// $config.local points to local storage
		self.local = localStorage; 

		async.series([
			function(next){
				UBUS.$call("router.system", "info").done(function(info){
					self.board = info; 
					if(!info.system || !info.system.firmware || !info.system.basemac) return;
					var parts = info.system.firmware.split("_");
					if(parts.length < 2) return;
					var customer = parts[1].split("-")[0];
					self.filename = info.system.hardware + "-" + customer + "-" + info.system.basemac.replace(/:/g, "");
				}).fail(function(){
					self.board = {};
				}).always(function(){ next(); }); 
			}, function(next){
				// load systemwide settings from juci config
				UCI.$sync("juci").done(function(){
					if(UCI.juci){
						self.settings = UCI.juci; 
						self.getWidgetLink = function(widget_name){
							var wid = self.settings["@widget"].find(function(widget){
								return widget.name.value.find(function(name){ return name === widget_name });
							});
							if(wid && wid.link && wid.link.value)
								return wid.link.value;
							return "";
						}
						deferred.resolve(); 
					} else {
						self.getWidgetLink = function(widget_name){ return "";}
						console.warning("Could not load juci config from router. It should exist by default. Please check that you have permissions to access it"); 
						deferred.reject(); 
					}
				}); 
			}
		]); 
		
		return deferred.promise(); 
	}
	$juci.config = new JUCIConfig(); 
	
	JUCI.app.factory('$config', function(){
		return $juci.config; 
	}); 
})(JUCI); 

