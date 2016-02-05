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

(function(scope){
	function supports_html5_storage() {
		try {
			return window && 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	}
	var fake_storage = {}; 
	function JUCILocalStorage(){
		this.getItem = function(item){ 
			if(supports_html5_storage()) return window.localStorage.getItem(item); 
			else return fake_storage[item]; 
		}; 
		this.setItem = function(item, value){
			if(supports_html5_storage()) return window.localStorage.setItem(item, value); 
			else fake_storage[item] = value; 
			return fake_storage[item]; 
		}
	}
	scope.localStorage = new JUCILocalStorage(); 
})(typeof exports === 'undefined'? this : global); 

