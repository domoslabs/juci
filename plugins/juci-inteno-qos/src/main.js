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


UCI.$registerConfig("qos");
UCI.qos.$registerSectionType("classify", {
	"target":	{ dvalue:'Normal', type: String },
	"ports":	{ dvalue: '', type: String },
	"comment":	{ dvalue: '', type: String },
	"dscp":		{ dvalue: '', type: String },
	"srchost":	{ dvalue: '', type: String, validator: UCI.validators.IPAddressValidator },
	"dsthost":	{ dvalue: '', type: String, validator: UCI.validators.IPAddressValidator },
	"proto":	{ dvalue: '', type: String }
});
UCI.qos.$registerSectionType("classgroup", {
	"classes":	{ dvalue: 'Priority Express Normal Bulk', type: String },
	"default": 	{ dvalue: 'Normal', type: String }
});
UCI.qos.$registerSectionType("interface", {
	"classgroup":	{ dvalue: "Default", type: String },
	"download":		{ dvalue: '', type: Number },
	"enabled":		{ dvalue: false, type: Boolean },
	"overhead":		{ dvalue: false, type: Boolean },
	"upload":		{ dvalue: '', type: Number }
});

JUCI.app.factory("intenoQos", function($uci){
	function Qos(){ }
	Qos.prototype.getDefaultTargets = function(){
		var def = $.Deferred(); 
		$uci.$sync(["qos"]).done(function(){
			var targets = []; 
			if($uci.qos.Default){
				targets = $uci.qos.Default.classes.value.split(" ").map(function(x){
					//if(x == "Bulk") return { label: $tr(gettext("Low")), value: x };
					return x; 
				});
			}
			def.resolve(targets); 
		}).fail(function(){ def.reject(); });
		return def.promise(); 
	} 

	return new Qos(); 
}); 
