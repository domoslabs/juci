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

UCI.$registerConfig("dropbear"); 
UCI.dropbear.$registerSectionType("dropbear", {
	//"enable": 				{ dvalue: true, type: Boolean }, //Set to 0 to disable starting dropbear at system boot.
	"verbose": 				{ dvalue: false, type: Boolean }, //Set to 1 to enable verbose output by the start script.
	"BannerFile": 			{ dvalue: "", type: String} , //Name of a file to be printed before the user has authenticated successfully.
	"PasswordAuth": 		{ dvalue: true, type: Boolean }, //Set to 0 to disable authenticating with passwords.
	"Port": 				{ dvalue: 22, type: Number, validator: UCI.validators.PortValidator }, //Port number to listen on.
	"RootPasswordAuth": 	{ dvalue: true, type: Boolean }, //Set to 0 to disable authenticating as root with passwords.
	"RootLogin": 			{ dvalue: true, type: Boolean }, //Set to 0 to disable SSH logins as root.
	"GatewayPorts": 		{ dvalue: false, type: Boolean }, //Set to 1 to allow remote hosts to connect to forwarded ports.
	"Interface": 			{ dvalue: "", type: String }, //Tells dropbear to listen only on the specified interface.1)
	"rsakeyfile": 			{ dvalue: "", type: String }, //Path to RSA file
	"dsskeyfile": 			{ dvalue: "", type: String }, //Path to DSS/DSA file
	"SSHKeepAlive": 		{ dvalue: 300, type: Number }, //Keep Alive
	"IdleTimeout": 			{ dvalue: 0, type: Number } //Idle Timeout 
}); 
