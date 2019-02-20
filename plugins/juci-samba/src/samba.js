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
.factory("$samba", function($uci){
	function Samba () {}
	Samba.prototype.getConfig = function(){
		var def = $.Deferred(); 
		$uci.$sync("samba").done(function(){
			if(!$uci.samba["@samba"].length) def.reject(); 
			else def.resolve($uci.samba["@samba"][0]); 
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

UCI.$registerConfig("samba"); 
UCI.samba.$registerSectionType("samba", {
	"name":			{ dvalue: "", type: String }, 
	"workgroup":	{ dvalue: "", type: String },
	"description":	{ dvalue: "", type: String },
	"charset": 		{ dvalue: "", type: String },
	"homes":		{ dvalue: false, type: Boolean },
	"interface":	{ dvalue: "", type: String }
}); 

UCI.samba.$registerSectionType("sambashare", {
	"name":			{ dvalue: "", type: String, validator: UCI.validators.CodeInjectionValidator },
	"path":			{ dvalue: "/mnt", type: String },
	"users":		{ dvalue: "", type: String }, // comma separated list
	"read_only":	{ dvalue: "no", type: Boolean }, // Yes/no
	"guest_ok":		{ dvalue: "no", type: Boolean }, // Yes/no
	"create_mask":	{ dvalue: "0700", type: String }, 
	"dir_mask":		{ dvalue: "0700", type: String } 
}); 

UCI.samba.$registerSectionType("sambausers", {
	"user":			{ dvalue: "", type: String }, 
	"password":		{ dvalue: "", type: String },
	"desc": 		{ dvalue: "", type: String }
}); 
