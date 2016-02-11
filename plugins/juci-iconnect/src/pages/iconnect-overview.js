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

JUCI.app.controller("iconnectOverviewPage", function($scope, $rpc, $events){
	$scope.buttons = {}; 

	$events.subscribe("iconnect.hubevent", function(ev){
		console.log("HUBEVENT: "+JSON.stringify(ev)); 
		var type = ev.data.type; 
		var from = ev.data.event.from; 
		var data = ev.data.event.data; 
		// Note: we never can be really sure of the sender of an event, but for demo it is alright. 
		if(!$scope.buttons[from]) return; 
		var btn_id = type.split(".").pop(); 
		var btn = $scope.buttons[from].find(function(x){ return x.id == btn_id; }); 
		if(btn){
			btn.pressed = (data.action == "pressed")?true:false; 
			console.log("SET BUTTON "+btn_id+" for "+from+" to "+btn.pressed); 
		}
		setTimeout(function(){ $scope.$apply(); }, 0);  
	}); 
	
	var cldata = {}; 
	$scope.onDoLedTest = function(cl){
		if(!cldata[cl.id]) cldata[cl.id] = { ledmode: "nromal" }; 
		var data = cldata[cl.id]; 
		var ledmode = data.ledmode; 
		if(ledmode == "test") ledmode = "normal"; 
		else ledmode = "test"; 
		data.settingmode = true; 
		$rpc.iconnect.call({
			host: cl.id,
			object: "leds", 
			method: "set", 
			data: { state: ledmode }
		}).done(function(){
			data.ledmode = ledmode; 
		}).always(function(){
			data.settingmode = false; 
			$scope.$apply(); 
		}); 
		cl.data = data; 
	}; 

	$scope.onUpgrade = function(cl){
		if(confirm("Are you sure you want to do online system upgrade from upgrade server?")){
			$rpc.iconnect.call({
				host: cl.id,
				object: "sysupgrade.example", 
				method: "upgrade", 
				data: {  }
			}).done(function(){
				// none
			}).always(function(){
				$scope.$apply(); 
			}); 
		}
	}

	JUCI.interval.repeat("iconnect-refresh", 2000, function(done){
		$rpc.iconnect.clients().done(function(result){
			var clients = []; 
			async.eachSeries(result.clients, function(cl, next){
				$rpc.iconnect.call({
					host: cl.id, 
					object: "system", 
					method: "board"
				}).done(function(info){
					if(!info || !info.release) { next(); return; } 
					cl.hostname = info.hostname; 
					cl.hardware = info.system; 
					cl.firmware = info.release.version; 
					if(!$scope.buttons[cl.id]) $scope.buttons[cl.id] = [
						{ id: "ECO"}, 
						{ id: "INFO"}, 
						{ id: "WPS"},
						{ id: "DECTS" },
						{ id: "DECTL" }
					]; 
					cl.buttons = $scope.buttons[cl.id]; 
					cl.data = cldata[cl.id]; 
					clients.push(cl); 
				}).always(function(){
					next(); 
				}); 
			}, function(){
				$scope.clients = clients; 
				while($scope.clients.length < 6) $scope.clients.push({dummy: true}); 
				$scope.$apply(); 
				done(); 
			}); 
		}).fail(function(){ done(); }); 
	}); 
}); 
