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

JUCI.app.run(function($uci, $rpc, $tr, gettext, upgradePopup){
	var upgrades = []; 
	
	async.series([
		function(next){
			$uci.$sync("system").done(function(){
				if(!$uci.system.upgrade) {
					$uci.system.$create({ ".type": "upgrade", ".name": "upgrade" }).done(function(section){
						$uci.$save().done(function(){
							console.log("Created missing section system.upgrade in UCI!"); 
							next(); 
						}); 
					}); 
				} else {
					next(); 
				}
			}); 
		}, 
		function(next){
			$rpc.juci.system.upgrade.check().done(function(response){
				if(response.all && response.all.length) {
					/*upgradePopup.show({ images: response.all.map(function(x){ return { label: x, value: x }; }) }).done(function(selected){
						$rpc
					}); */
					if(confirm($tr(gettext("A new system software upgrade is available. Do you want to visit upgrade page and upgrade now?")))) {
						window.location = "/#!/settings-upgrade"; 
					}
				} 
				next(); 
			}); 
		}
	], function(){
		
	}); 
}); 
