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
.factory("$usb", function($rpc){
	function USB(){
		
	}
	
	USB.prototype.getDevices = function(){
		var def = $.Deferred(); 
		$rpc.$call("router.usb", "status").done(function(res){
			var usbs = Object.keys(res).map(function(usb){
				return res[usb];
			});
			if(usbs) def.resolve(usbs);
			else def.resolve([]);
		});
		return def.promise();
	}

	USB.prototype.annotateAdapters = function(adapters){
		var def = $.Deferred();
		var self = this;
		self.getDevices().done(function(devs){
			var filtered = devs.filter(function(dev){
				return dev.netdevice && (String(dev.netdevice).match(/^eth/) || String(dev.netdevice).match(/^usb/));
			});
			adapters.map(function(a){
				var match = filtered.find(function(f){ return f.netdevice === a.device; });
				if(match){
					a.name = match.description || match.product || a.name || "";
					a.type = "eth-port";
					match["__added__"] = true
				}
			});
			filtered.map(function(f){
				if(f["__added__"])return;
				adapters.push({
					name: f.description || f.product || "",
					type: "eth-port",
					device: f.netdevice
				});
			});
			def.resolve();
		}).fail(function(e){
			console.log(e);
			return def.reject();
		});
		return def.promise();
	};
	
	return new USB(); 
}).run(function($events){	
	$events.subscribe("usb.device.add", function(event){
		console.log("USB Plugged in: "+JSON.stringify(event)); 
	});
});  

JUCI.app.run(function($usb, $ethernet){
	$ethernet.addSubsystem($usb);
});
