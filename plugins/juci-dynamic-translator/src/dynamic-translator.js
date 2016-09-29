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

JUCI.app.factory("dynamicTranslator", function($rootScope, gettextCatalog){
	var strings = []; 
	$rootScope.$on("$locationChangeSuccess", function(){
		//console.log("removing string cache of "+strings.length+" strings."); 
		// reset strings on page
	}); 

	return {
		push: function(opts){
			strings.push(opts); 
		},
		apply: function(){
			strings.map(function(obj){
				var tmp = {}; 
				tmp[obj.msgid] = obj.msgstr; 
				gettextCatalog.setStrings(obj.language, tmp); 
			}); 
		}
	}; 
}); 

JUCI.app.run(function($rootScope, gettextCatalog, dynamicTranslator) {
	var getString = gettextCatalog.getString; 
	gettextCatalog.getString = function(a, b, c){
		var ret = getString.call(this, a, b, c); 
		dynamicTranslator.push({
			language: gettextCatalog.currentLanguage, 
			msgid: a, 
			msgstr: ret
		}); 
		return ret; 
	}
});
