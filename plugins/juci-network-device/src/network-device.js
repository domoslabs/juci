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

if (!UCI.network)
	UCI.$registerConfig("network");

UCI.network.$registerSectionType("device", {
	"type":		{ dvalue: "8021q", type: String },
	"ifname":	{ dvalue: "", type: String },
	"vid":		{ dvalue: 1, type: Number, validator: UCI.validators.NumberLimitValidator(1, 4096) },
	"priority":	{ dvalue: 0, type: Number, validator: UCI.validators.NumberLimitValidator(0, 7) },
	"name":		{ dvalue: "", type: String }
}, function(section){
	if(!section)
		return null;
	var errors = [];
	// check type
	var types = [ "untagged", "8021q", "8021ad"];
	if (types.indexOf(section.type.value) === -1)
		errors.push(JUCI.$tr(gettext("section")) + " " + section[".name"] + " " + JUCI.$tr(gettext("has invalid type, valid types are")) + JSON.stringify(types));
	var devices = UCI.network["@device"]||[];
	devices.forEach(function(device){
		if(device === section)
			return;
		if(device.vid.value === section.vid.value &&
				device.ifname.value === section.ifname.value &&
				section.type.value !== "untagged")
			errors.push(section[".name"] + ", " + JUCI.$tr(gettext("Duplicate VID and Interface")));
		if(device.name.value === section.name.value)
			errors.push(section[".name"] + ", " + JUCI.$tr(gettext("Duplicate VLAN name")) + " " + section.name.value);
	});

	if(errors.length)
		return errors;
	return null;
});
