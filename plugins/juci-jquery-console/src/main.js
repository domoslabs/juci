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

jQuery(function($, undefined) {
	$(document).ready(function(){
		(function($) {
			$.fn.tilda = function(eval, options) {
				if ($('body').data('tilda')) {
						return $('body').data('tilda').terminal;
				}
				this.addClass('tilda');
				options = options || {};
				eval = eval || function(command, term) {
						term.echo("you don't set eval for tilda");
				};
				var settings = {
						prompt: 'JUCI> ',
						name: 'juci',
						height: 300,
						enabled: false,
						greetings: 'JUCI Command Console',
						keypress: function(e) {
								if (e.which == 167) {
										return false;
								}
						}
				};
				if (options) {
						$.extend(settings, options);
				}
				this.append('<div class="td"></div>');
				var self = this;
				self.terminal = this.find('.td').terminal(eval,
																							 settings);
				var focus = false;
				$(document.documentElement).keypress(function(e) {
					if (e.charCode == 167) { // §
						self.slideToggle('fast');
						self.terminal.focus(focus = !focus);
					}
				});
				var _log = console.log;
				var _error = console.error; 
				console.log = function(str){
					self.terminal.echo("\x1b[32m"+str+"\x1b[m"); 
					_log.call(console, str); 
				}
				console.error = function(str){
					self.terminal.echo("\x1b[31m"+str+"\x1b[m"); 
					_error.call(console, str); 
				}
				console.warning = function(str){
					self.terminal.echo("\x1b[33m"+str+"\x1b[m"); 
				}
				$('body').data('tilda', this);
				this.hide();
				return self;
			};
    })(jQuery);
    $("body").append('<div id="tilda"></div>'); 
    $('#tilda').tilda(function(command, terminal) {
      if (command !== '') {
				try {
					var result = window.eval(command);
					if (result !== undefined) {
						terminal.echo(new String(result));
					}
				} catch(e) {
					terminal.error(new String(e));
				}
			} else {
				 term.echo('');
			}
    });
    
	}); 
});
