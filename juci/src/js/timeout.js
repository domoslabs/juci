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

(function(){
	var _timeouts = {};
	JUCI.interval = {
		once: function(t, fn){
			var i = setTimeout(function _onTimeout(){
				fn(function next(ret, err){
					clearTimeout(i);
					delete _timeouts[name];
				});
			}, t);
			_timeouts[name] = i;
		},
		repeat: function(name, t, fn){
			if(_timeouts[name])return;
			function _onTimeout(){
				fn(function next(ret, err){
					if(!ret) {
						if(!_timeouts[name] || !_timeouts[name].cleared)
							_timeouts[name] = setTimeout(_onTimeout, t);
					}
				});
			}
			//_timeouts[name] = setTimeout(_onTimeout, t);
			_onTimeout();
		},
		clear: function(name, fn){
			if(_timeouts.hasOwnProperty(name)){
				clearTimeout(_timeouts[name]);
				delete _timeouts[name];
				if(fn instanceof Function){
					fn();
				}
			}
		},
		$clearAll: function(){
			Object.keys(_timeouts).map(function(t){
				clearTimeout(_timeouts[t]);
			});
			_timeouts = {};
		}
	};
})();
