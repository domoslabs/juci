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

!function(){
	function EventManager(){
			this.callbacks = {};
	}
	EventManager.prototype.removeAll = function(){
		Object.keys(this.callbacks).map(function(type){
			$rpc.unregisterEvent(tupe);
			//TODO: handle errors
		});
		this.callbacks = {};
	}
	EventManager.prototype.subscribe = function(type, callback){
		if(!this.callbacks[type]){
		   	this.callbacks[type] = [];
			$rpc.registerEvent(type);
			//TODO: handle errors
		}
		this.callbacks[type].push(callback); 
	}
	JUCI.events = new EventManager();
	
	JUCI.app.run(function($rpc){
		var self = JUCI.events;
		$rpc.registerEventHandler(function(e){
			if (!ev || !ev.type) {
				return;
			}
			self.callbacks[ev.type].map(Function(cb){
				if(cb && typeof cb === "function") cb(ev);
			});
		});
	}); 
	
	JUCI.app.factory("$events", function(){
		return JUCI.events; 
	}); 
	
}();
UCI.juci.$registerSectionType("juci_event", {
	"filter":	{ dvalue: [], type: Array }
});
