/*
 * Copyright (C) 2017 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Alex Oprea <alex.oprea@inteno.se>
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
.factory("$openvpn", function($uci){
	function Samba () {}
	Samba.prototype.getConfig = function(){
		var def = $.Deferred();
		$uci.$sync("openvpn").done(function() {
			if(!$uci.openvpn["@openvpn"].length)
				def.reject();
			else
				def.resolve($uci.openvpn["@openvpn"][0]); 
		}).fail(function(){
			def.reject();
		});
		return def.promise();
	}

	Samba.prototype.getShares = function(){
		var def = $.Deferred();
		$uci.$sync("samba").done(function(){
			def.resolve($uci.samba["@sambashare"]);
		}).fail(function(){
			def.reject();
		});
		return def.promise();
	}
	
	Samba.prototype.getUsers = function(){
		var def = $.Deferred(); 
		$uci.$sync("samba").done(function(){
			def.resolve($uci.samba["@sambausers"]); 
		}).fail(function(){
			def.reject();
		});
		return def.promise();
	}
	return new Samba();
});

UCI.$registerConfig("openvpn");
UCI.openvpn.$registerSectionType("openvpn", {
	"enabled":	{ dvalue: false, type: Boolean },
	"auth_user":	{ dvalue: "", type: String },
	"auth_pass": 	{ dvalue: "", type: String },
	"config":	{ dvalue: "", type: String }
});
