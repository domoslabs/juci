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
		this.system = {}; 
	}

	JUCIConfig.prototype.$init = function(){
		var deferred = $.Deferred(); 
		var self = this; 
		console.log("init: config"); 
			
		// $config.local points to local storage
		self.local = localStorage; 

		async.series([
			function(next){
				if(UBUS.system){
					UBUS.system.board().done(function(info){
						self.board = info; 
					}).always(function(){ next(); }); 
				} else {
					next(); 
				}
			}, function(next){
				// load systemwide settings from juci config
				UCI.$sync("juci").done(function(){
					if(UCI.juci){
						console.log("Using settings from config/juci on router"); 
						self.settings = UCI.juci; 
						deferred.resolve(); 
					} else {
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

