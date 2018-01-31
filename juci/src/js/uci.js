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

(function(scope){
	var $rpc = scope.UBUS;
	
	function DefaultValidator(){
		this.validate = function(field){
			return null; // return null to signal that there was no error
		}
	}
	
	function TimeValidator(){
		this.validate = function(field){
			if(field.value.match(/[^\d:]/)) return JUCI.$tr(gettext("please enter time in form hh:mm"));
			var parts = field.value.split(":");
			if(parts.length != 2) return JUCI.$tr(gettext("please specify both hour and minute value for time separated by ':'"));
			if(parts[0].length <= 2 && Number(parts[0]) >= 0 && Number(parts[0]) < 24 &&
				parts[1].length <= 2 && Number(parts[1]) >= 0 && Number(parts[1]) < 60){
				return null;
			} else {
				return JUCI.$tr(gettext("please enter valid time in form hh:mm " + field.value));
			}
		}
	}
	
	function TimespanValidator(){
		var timeValidator = new TimeValidator();
		this.validate = function(field){
			var parts = field.value.split("-");
			if(parts.length != 2) return JUCI.$tr(gettext("Please specify both start time and end time for schedule!"));
			var err = timeValidator.validate({ value: parts[0] });
			if(err) return err;
			err = timeValidator.validate({ value: parts[1] });
			if(err) return err;
			function splitToNumber(value) { return value.split(":").map(function(x){ return Number(x); }); };
			var from = splitToNumber(parts[0]);
			var to = splitToNumber(parts[1]);
			if((from[0]*60+from[1]) < (to[0]*60+to[1])) {
				return null;
			} else {
				return JUCI.$tr(gettext("Schedule start time must be lower than schedule end time!"));
			}
		}
	}

	function WeekDayListValidator(){
		this.validate = function(field){
			if(!field.schema.allow) return null;
			var days_valid = field.value.filter(function(x){
				return field.schema.allow.indexOf(x) != -1;
			}).length;
			if(!days_valid) return JUCI.$tr(gettext("Please pick days between mon-sun"));
			return null;
		}
	}

	function PortOrRangeValidator(separator){
		if(!separator){ var separator = ":"; }
		return function(){
			this.validate = function(field){
				var re = new RegExp(separator,"g");
				var separatorsFound = (field.value.match(re) || []).length;
				if(separatorsFound === 0){
					if(!field || !field.value) return null;
					if(field.value.match(/^[0-9]+$/)){
						var num = parseInt(field.value);
						if(num < 1 || num > 65535) return JUCI.$tr(gettext("Port has to be a number between 1 and 65535. Use '")) + separator + JUCI.$tr(gettext("' to define a range."));
					} else {
						return JUCI.$tr(gettext("Port has to be a number between 1 and 65535. Use '")) + separator + JUCI.$tr(gettext("' to define a range."));
					}
					return null;
				}
				else{
					if(!field || !field.value) return null;

					var re = new RegExp("^[0-9]+"+separator+"[0-9]+$");
					if(field.value.match(re)){ //type is port range
						var start = parseInt(field.value.split(separator)[0]);
						var stop = parseInt(field.value.split(separator)[1]);
						if(start < 1 || start > 65535 || stop < 1 || stop > 65535 || start > stop || start == stop) return JUCI.$tr(gettext("Ports has to be between 1 and 65535 and start port must be lower than end port"));
					}
					else{
						return JUCI.$tr(gettext("Port range has to be on the form number")) + separator + JUCI.$tr(gettext("number"));
					}
					return null;
				}
			};
		};
	}

	function PortsOrRangeValidator(separator){
		if(!separator){ var separator = ":"; }
		return function(){
			this.validate = function(field){
				var re = new RegExp(separator,"g");
				var separatorsFound = (field.value.match(re) || []).length;
				if(separatorsFound === 0){
					if(!field || !field.value) return null;
					if(field.value.match(/^[0-9]+( [0-9]+)*$/)){
						var num = parseInt(field.value);
						if(num < 1 || num > 65535) return JUCI.$tr(gettext("Port has to be a number between 1 and 65535. Use '")) + separator + JUCI.$tr(gettext("' to define a range."));
					} else {
						return JUCI.$tr(gettext("Port has to be a number between 1 and 65535. Use '")) + separator + JUCI.$tr(gettext("' to define a range."));
					}
					return null;
				}
				else{
					if(!field || !field.value) return null;

					var re = new RegExp("^[0-9]+"+separator+"[0-9]+$");
					if(field.value.match(re)){ //type is port range
						var start = parseInt(field.value.split(separator)[0]);
						var stop = parseInt(field.value.split(separator)[1]);
						if(start < 0 || start > 65535 || stop < 0 || stop > 65535 || start > stop || start == stop) return JUCI.$tr(gettext("Ports has to be between 1 and 65535 and start port must be lower than end port"));
					}
					else{
						return JUCI.$tr(gettext("Port range has to be on the form number")) + separator + JUCI.$tr(gettext("number"));
					}
					return null;
				}
			};
		};
	}

	function PortValidator(){
		this.validate = function(field){
			if(!field || !field.value) return null;
			if(String(field.value).match(/^[0-9]+$/)){
				var num = parseInt(field.value);
				if(num < 1 || num > 65535) return JUCI.$tr(gettext("Port has to be a number between 1 and 65535"));
			} else {
				return JUCI.$tr(gettext("Port has to be a number between 1 and 65535"));
			}
			return null;
		};	
	}
	function PortRangeValidator(separator){
		if(!separator){ var separator = ":"; }
		this.validate = function(field){
			if(!field || !field.value) return null;

			var re = new RegExp("^[0-9]+"+separator+"[0-9]+$");
			if(field.value.match(re)){ //type is port range
				var start = parseInt(field.value.split(separator)[0]);
				var stop = parseInt(field.value.split(separator)[1]);
				if(start < 1 || start > 65535 || stop < 1 || stop > 65535 || start > stop || start == stop) return JUCI.$tr(gettext("Ports has to be between 1 and 65535 and start port must be lower than end port"));
			}
			else{
				return JUCI.$tr(gettext("Port range has to be on the form number")) + separator + JUCI.$tr(gettext("number"));
			}
			return null;
		};	
	}
	
	function WEPKeyValidator(){
		this.validate = function(field){
			if(field.value === "") return null;
			if(field.value.length>=10 && field.value.length<=26){
				var matches = field.value.match(/[a-f0-9A-F]+/);
				if(matches!==null && field.value.length==matches[0].length){ return null; }
			}
			return JUCI.$tr(gettext("WEP encryption key must be 10-26 hexadecimal characters!"));
		}
	}

	function isNotPrintableASCII(chr){
		if(chr.charCodeAt()<32 || chr.charCodeAt()>126){ return true; }
		else{ return false; }
	}

	function WPAKeyValidator(notAllowedChars){
		return function(){
			this.validate = function(field){
				if(field.value.length < 8 || field.value.length > 63){ return JUCI.$tr(gettext("WPA encryption key must be 8-63 printable ASCII characters!")); }
				for(var i=0; i<field.value.length; i++){
					if(isNotPrintableASCII(field.value.charAt(i))){
						return JUCI.$tr(gettext("WPA encryption key must be 8-63 printable ASCII characters!"));
					}
				}

				if(!notAllowedChars) { return; }
				var chars = notAllowedChars.split("");
				for(var i in chars){
					if(field.value.indexOf(chars[i]) !== -1){
						return JUCI.$tr(gettext("WPA encryption key cannot contain the following characters:")) + " " +notAllowedChars;
					}
				}
			}
		}
	}

	function ASCIIValidator(){
		this.validate = function(field){
			for(var i=0; i<field.value.length; i++){
				if(isNotPrintableASCII(field.value.charAt(i))){
					return JUCI.$tr(gettext("Only printable ASCII characters allowed."));
				}
			}
		}
	}

	function QOSMarkValidator(){
		this.validate = function(field){
			if(!field || !field.value) return null;
			
			if(field.value.match("^0x[0-9A-Fa-f]{4}$|^!0x[0-9A-Fa-f]{4}$") === null){
				return JUCI.$tr(gettext("Invalid mark format: it must be between (!)0x0000 - (!)0xFFFF"));
			}

			return null;
		}
	};

	function ConnbytesValidator(separator){
		if(!separator){ var separator = ":"; }
		this.validate = function(field){
			if(!field || !field.value) return null;

			var re = new RegExp("^[0-9]+"+separator+"[0-9]+$|^[0-9]+$");
			if(field.value.match(re)){ //type is number range
				var start = parseInt(field.value.split(separator)[0]);
				var stop = parseInt(field.value.split(separator)[1]);
				if(stop){
					if(stop <= start){ return JUCI.$tr(gettext("End value has to be larger than start value.")); }
				}
				else{
					if(start <= 0){ return JUCI.$tr(gettext("Size has to be larger than 0.")); }
				}
			}
			else{
				return JUCI.$tr(gettext("Invalid range."));
			}
			return null;
		};	
	}

	function NumberLimitValidator(min, max){
		if(min === undefined || min === null){
			return function(){
				this.validate = function(field){
					if(field.value <= max) return null;
					return JUCI.$tr(gettext("Number value is not within valid range")) + " (<= "+max+")";
				}
			}
		}
		else if(max === undefined || max === null){
			return function(){
				this.validate = function(field){
					if(field.value >= min) return null;
					return JUCI.$tr(gettext("Number value is not within valid range")) + " (>= "+min+")";
				}
			}
		}
		return function(){
			this.validate = function(field){
				if(field.value >= min && field.value <= max) return null;
				return JUCI.$tr(gettext("Number value is not within valid range")) + " ("+min+" - "+max+")";
			}
		}
	}
	
	function IP4AddressValidator(){
		this.validate = function(field){
			var error = JUCI.$tr(gettext("IP Address must be a valid IPv4 address!"));
			if(!field.value || field.value == "") return null;
			if(field.value.match(/^[\.\d]+$/) == null) return error;
			if(field.value.split(".").length != 4 || field.value.split(".")
				.filter(function(part){ return (part !="" && (parseInt(part) < 256))}).length != 4) return error;
			return null;
		}
	};

	function IP4MulticastAddressValidator(){
		this.validate = function(field){
			if(!field.value || field.value == "") return null;
			var error = JUCI.$tr(gettext("Address is not a valid  Multicast address"));
			var ipv4 = new IP4AddressValidator();
			if(ipv4.validate(field) != null) return error;
			if(parseInt(field.value.split(".")[0]) > 239 || parseInt(field.value.split(".")[0]) < 224) return error;
			return null;
		}
	};

	function IP4UnicastAddressValidator(){
		this.validate = function(field){
			var error = JUCI.$tr(gettext("IP Address is not a valid Unicast address!"));
			if(!field.value || field.value == "") return null;
			if(field.value == "0.0.0.0") return error;
			var ip4 = new IP4AddressValidator();
			if(ip4.validate(field) != null) return error;
			var ip4multi = new IP4MulticastAddressValidator();
			if(ip4multi.validate(field) == null) return error; // multicast addresses is not valid unicast address;
			return null;
		};
	};

	function IP4CIDRValidator(){
		this.validate = function(field){
			if(!field.value || field.value == "") return null;
			ipv4 = new IP4AddressValidator();
			if(field.value.split("/").length != 2) return JUCI.$tr(gettext("IP Address must be on the form: IP address/netmask length"));
			var err = ipv4.validate({ value: field.value.split("/")[0] });
			if(err) return err;
			var mask = field.value.split("/")[1];
			if(!mask.match(/^0/) && mask.match(/^[\d]+$/) && parseInt(mask) < 33) return null
			return JUCI.$tr(gettext("Netmask must be a value between 0 and 24"));
		};
	};

	function IPAddressAndIPCIDRValidator(){
		this.validatorIP = new IPAddressValidator();
		this.validatorCIDR4 = new IP4CIDRValidator();
		this.validatorCIDR6 = new IP6CIDRValidator();

		this.validate = function(field){

			var v1=this.validatorIP.validate(field);
			var v2=this.validatorCIDR4.validate(field);
			var v3=this.validatorCIDR6.validate(field);

			console.log(v1,v2,v3);

			if(v1==null || v2==null || v3==null)
				return null;

			return JUCI.$tr(gettext("Not an IP address or IP address with CIDR notation"));
		};
	};

	function IPAddressValidator(){
		this.validate = function(field){
			var ipv4 = new IP4AddressValidator();
			var ipv6 = new IP6AddressValidator();
			if(ipv4.validate(field) == null || ipv6.validate(field) == null) return null
			return JUCI.$tr(gettext("IP Address must be a valid ipv4 or ipv6 address!"));
		}
	};
	
	function IP4NetmaskValidator(){
		this.validate = function(field){
			var error = JUCI.$tr(gettext("Netmask must be a valid IPv4 netmask"));
			if(!field.value || field.value == "") return null;
			var ipv4 = new IP4AddressValidator();
			if(ipv4.validate(field) != null) return error;
			if(!field.value.split(".").map(function(part){return ("00000000" + (parseInt(part) >>> 0)
				.toString(2)).slice(-8);}).join("").match(/^1+0+$/)) return error;
			return null;
		}
	};

	function IP6AddressValidator(){
		this.validate = function(field){
			if(field.value && field.value != "" && !field.value.match("^((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}$")) return JUCI.$tr(gettext("Address must be a valid IPv6 address"));
			return null;
		}
	};

	function IP6CIDRValidator(){
		this.validate = function(field){
			var error = JUCI.$tr(gettext("Address must be a valid IPv6 CIDR Validator (IPv6-address/Mask)"));
			var ip = field.value.split("/")[0];
			var mask = field.value.split("/")[1];
			if(!ip || !mask) return error;
			if(parseInt(mask) > 128 || parseInt(mask) < 1) return error;
			var ip6 = new IP6AddressValidator();
			return ip6.validate({value:ip});
		}
	};

	function IP6HintValidator(){
		this.validate = function(field){
			if(field.value.length<=4){
				var matches = field.value.match(/[a-f0-9A-F]+/);
				if(matches!==null && field.value.length==matches[0].length){ return null; }
			}
			return JUCI.$tr(gettext("IPv6 Prefix Hint must be a hexadecimal number between 1-FFFF"));
		}
	};

	function MACAddressValidator(){
		this.validate = function(field){
			if(!(typeof field.value == "string") ||
				!field.value.match(/^(?:[A-Fa-f0-9]{2}[:-]){5}(?:[A-Fa-f0-9]{2})$/))
				return JUCI.$tr(gettext("Value must be a valid MAC-48 address"));
			return null;
		}
	};

	function MACListValidator(){
		this.validate = function(field){
			if(field.value instanceof Array){
				var errors = [];
				field.value.map(function(value){
					if(!value.match(/^(?:[A-Fa-f0-9]{2}[:-]){5}(?:[A-Fa-f0-9]{2})$/))
						errors.push(JUCI.$tr(gettext("value must be a valid MAC-48 address"))+": "+value);
				});
				if(errors.length) return errors.join(", ");
			}
			return null;
		}
	};

	function HostnameValidator(){
		this.validate = function(field){
			if(!field.value) return;
			if(field.value.length > 256)
				return JUCI.$tr(gettext("Hostname can not be longer than 256 characters"));
			if(!field.value.match(/^[0-9a-z\-_]+$/i))
				return JUCI.$tr(gettext("Hostname can only contain numbers, letters, hyphens and underscores"));
			return null;
		}
	};


	
	var section_types = {};
	function UCI(){
		
	}
	(function(){
		function UCIField(value, schema){
			if(!schema) throw new Error("No schema specified for the field!");
			this.ovalue = value;
			if(value != null && value instanceof Array) {
				this.ovalue = []; Object.assign(this.ovalue, value);
			}
			this.is_dirty = false;
			this.uvalue = undefined;
			this.schema = schema;
			if(schema.validator) this.validator = new schema.validator();
			else this.validator = new DefaultValidator();
		}
		UCIField.prototype = {
			$reset: function(){
				this.uvalue = this.ovalue;
				this.is_dirty = false;
			},
			$reset_defaults: function(){
				if(this.uvalue !== this.schema.dvalue){
					this.uvalue = this.schema.dvalue;
					this.is_dirty = true;
				}
			},
			$begin_edit: function(){
				this.svalue = this.value;
			},
			$cancel_edit: function(){
				if(this.svalue != undefined) this.value = this.svalue;
			},
			$update: function(value, keep_user){
				if(this.ovalue instanceof Array){
					// if user has modified value and we have keep user set then we do not discard his changes
					// otherwise we also update uvalues
					if(!keep_user || !this.dirty) {
						this.uvalue = value;
						this.dirty = false;
					}
					// store original value
					this.ovalue = value;
				} else {
					if(typeof value === "string") value = value.trim();
					if(!keep_user || !this.dirty) {
						this.uvalue = value;
						this.dirty = false;
					}
					this.ovalue = value;
				}
			},
			get value(){
				if(this.schema.type == Boolean){
					var uvalue = (this.uvalue == undefined)?this.ovalue:this.uvalue;
					if(uvalue === "true" || uvalue === "1" || uvalue === "on" || uvalue === "yes") return true;
					else if(uvalue === "false" || uvalue === "0" || uvalue === "off" || uvalue === "no") return false;
				}
				if(this.uvalue == undefined) return this.ovalue;
				else return this.uvalue;
			},
			set value(val){
				if(val === null) val = "";
				// set dirty if not same
				var self = this;
				if(val instanceof Array){
					self.is_dirty = !val.equals(self.uvalue);
				} else {
					self.is_dirty = val != self.ovalue; // nedds to be != due to boolean values
				}
				if(self.ovalue instanceof Array && !(val instanceof Array)) return;
				if(val instanceof Array && self.ovalue instanceof Array){
					self.is_dirty = false;
					if(val.length !== self.ovalue.length) self.is_dirty = true;
					val.forEach(function(x, i){ if(self.ovalue[0] !== x) self.is_dirty = true; });
				}

				// properly handle booleans
				if(this.schema.type == Boolean){
					if(this.ovalue == "on" || this.ovalue == "off") { this.uvalue = (val)?"on":"off"; }
					else if(this.ovalue == "yes" || this.ovalue == "no") { this.uvalue = (val)?"yes":"no"; }
					else if(this.ovalue == "true" || this.ovalue == "false") { this.uvalue = (val)?"true":"false"; }
					else this.uvalue = val;
				} else {
					if(val instanceof Array) {
						this.uvalue = [];
						Object.assign(this.uvalue, val);
					} else {
						this.uvalue = val;
					}
				}
			},
			get error(){
				// make sure we ignore errors if value is default and was not changed by user
				if(this.value === "" && this.schema.required) return JUCI.$tr(gettext("Field is required"));
				if(this.uvalue === this.schema.dvalue || this.uvalue === this.ovalue) return null;
				if(this.validator && this.validator.validate instanceof Function) return this.validator.validate(this);
				return null;
			},
			get valid(){
				if(this.validator && this.validator.validate instanceof Function) return this.validator.validate(this) === null;
				return true;
			},
			set dirty(value){
				this.is_dirty = value;
			},
			get dirty(){
				if(this.uvalue instanceof Array && this.uvalue.equals(this.ovalue)) return false;
				else if(this.uvalue === this.ovalue) return false;
				return this.is_dirty;
			}
		}
		UCI.Field = UCIField;
	})();
	(function(){
		function UCISection(config){
			this[".config"] = config;
		}

		UCISection.prototype.$move = function(index){
			var self = this;
			var type = self[".type"];
			var config = self[".config"];
			if (!self.$index)
				throw new Error("No index set for config " + self[".name"]);
			if (self.$index.current === index)
				return false;
			if(!config)
				throw new Error("Missing .config for " + self[".name"], type);
			var allSections = config["@" + type];
			if(!allSections instanceof Array || allSections.length === 0)
				throw new Error("Missing array of sections for type " + type);

			if(index < 0 || index > allSections.length)
				return false;

			var found = allSections.splice(self.$index.current, 1);
			if(found.length != 1)
				throw new Error("This should never happen");
			var toInsert = found[0];

			allSections.splice(index, 0, toInsert);

			allSections.forEach(function(section, index, array){
				array[index].$index.current = index;
			});
		}

		UCISection.prototype.$update = function(data, opts){
			if(!opts) opts = {};
			if(!(".type" in data)) throw new Error("Supplied object does not have required '.type' field!");
			// try either <config>-<type> or just <type>
			var sconfig = section_types[this[".config"][".name"]];
			if((typeof sconfig) == "undefined") throw new Error("Missing type definition for config "+this[".config"][".name"]+"!");
			var type = 	sconfig[data[".type"]];
			if(!type) {
				console.error("Section.$update: unrecognized section type "+this[".config"][".name"]+"-"+data[".type"]);
				return;
			}
			var self = this;
			self[".original"] = data;
			self[".name"] = data[".name"];
			self[".type"] = data[".type"];
			self[".section_type"] = type;
			
			Object.keys(type).map(function(k){
				var field = self[k];
				if(!field) { field = self[k] = new UCI.Field("", type[k]); }
				var value = type[k].dvalue;
				if(k in data) {
					switch(type[k].type){
						case Number:
							var n = Number(data[k]);
							if(isNaN(n)) n = type.dvalue;
							value = n;
							break;
						case Array:
							if(!(data[k] instanceof Array)) value = data[k].split(" ");
							else value = data[k];
							if(!value) value = [];
							break;
						default:
							value = data[k];
					}
				}
				field.$update(value, opts.keep_user_changes);
			});
		}
		
		UCISection.prototype.$sync = function(){
			var deferred = $.Deferred();
			var self = this;

			$rpc.$call("uci", "get", {
				config: self[".config"][".name"],
				section: self[".name"]
			}).done(function(data){
				self.$update(data.values);
				deferred.resolve();
			}).fail(function(){
				deferred.reject();
			});
			return deferred.promise();
		}

		UCISection.prototype.$delete = function(){
			var self = this;
			if(self[".config"]) return self[".config"].$deleteSection(self);
			var def = $.Deferred();
			return def.reject();
		}
		
		UCISection.prototype.$reset = function(){
			var self = this;
			Object.keys(self).map(function(k){
				if(!(self[k] instanceof UCI.Field)) return;
				if(self[k].$reset)
					self[k].$reset();
			});
		}

		UCISection.prototype.$reset_defaults = function(exc){
			var self = this;
			var exceptions = {}
			if(exc && exc instanceof Array)
				exc.map(function(e){ exceptions[e] = true;});
			Object.keys(self).map(function(k){
				if(!(self[k] instanceof UCI.Field) || exceptions[k]) return;
				if(self[k].$reset_defaults)
					self[k].$reset_defaults();
			});
		}

		UCISection.prototype.$can_edit = function(user){
			if(!user || typeof user !== "string") user = $rpc.$user();
			var self = this;
			if(!self["_access_w"].value.length) return true;
			return self["_access_w"].value.find(function(priv){ return priv === user; }) !== undefined;
		}
		
		UCISection.prototype.$begin_edit = function(){
			var self = this;
			Object.keys(self).map(function(k){
				if(!(self[k] instanceof UCI.Field)) return;
				if(self[k].$begin_edit)
					self[k].$begin_edit();
			});
		}
	
		UCISection.prototype.$cancel_edit = function(){
			var self = this;
			Object.keys(self).map(function(k){
				if(!(self[k] instanceof UCI.Field)) return;
				if(self[k].$cancel_edit)
					self[k].$cancel_edit();
			});
		}

		UCISection.prototype.$getErrors = function(){
			var errors = [];
			var self = this;
			var type = self[".section_type"];
			var name = self[".config"] ? self[".config"][".name"] : "undefined";
			var section;
			if(!self[".name"] || !self[".type"] || !self.$index || !self.$index.current)
				section = "undefined";
			else {
				section = self[".name"];
				if(section.match(/^cfg[0-9a-fA-F]+$/) !== null)
					section = self[".type"]+" "+(self.$index.current+1);
			}
			Object.keys(type).map(function(k){
				if(self[k].value === "" && self[k].schema.required) errors.push(k+" "+JUCI.$tr(gettext("is required")));
				else var err = self[k].error;
				if(err){
					errors.push(JUCI.$tr(gettext("Config")) + ": " + name + " " + JUCI.$tr(gettext("Section")) + ": " + section + " " + JUCI.$tr(gettext("Option")) + ": " + k + ": " + err);
				}
			});
			if(type && type[".validator"] && (type[".validator"] instanceof Function)){
				try {
					var e = type[".validator"](self);
					if(e) errors.push(e);
				} catch(e){
					errors.push(e);
				}
			}
			return errors;
		}
		
		UCISection.prototype.$getChangedValues = function(){
			var type = this[".section_type"];
			if(!type) return {};
			var self = this;
			var changed = {};
			
			//if(type[".validator"] instanceof Function) type[".validator"](self);
			
			Object.keys(type).map(function(k){
				if(self[k] && self[k].dirty){
					changed[k] = self[k].uvalue;
				}
			});
			return changed;
		}
		UCI.Section = UCISection;
	})();
	(function(){
		function UCIConfig(uci, name){
			var self = this;
			self.uci = uci;
			self[".name"] = name;
			self["@all"] = [];
			if(!name in section_types) throw new Error("Missing type definition for config "+name);
			self.deleted_sections = [];
			
			// set up slots for all known types of objects so we can reference them in widgets
			Object.keys(section_types[name]||{}).map(function(type){
				self["@"+type] = [];
			});
			//this["@deleted"] = [];
		}
		
		function _insertSection(self, item){
			var section = new UCI.Section(self);
			section.$update(item);
			var type = "@"+item[".type"];
			if(!(type in self)) self[type] = [];
			self[type].push(section);
			self["@all"].push(section);
			self[item[".name"]] = section;
			section.$index = {
				current: self[type].length - 1,
				old: self[type].length -1
			}
			return section;
		}
		function _updateSection(self, item, opts){
			var section = self[item[".name"]];
			if(section && section.$update) section.$update(item, opts);
		}
		
		function _unlinkSection(self, section){
			// NOTE: can not use filter() because we must edit the list in place
			// in order to play well with controls that reference the list!
			var all = self["@all"];
			for(var i = 0; i < all.length; i++){
				if(all[i][".name"] === section[".name"]) {
					all.splice(i, 1);
					break;
				};
			}
			var jlist = self["@"+section[".type"]]||[];
			for(var j = 0; j < jlist.length; j++){
				if(jlist[j][".name"] === section[".name"]) {
					jlist.splice(j, 1);
					break;
				}
			}
			if(section[".name"]) delete self[section[".name"]];
			if(!section["__new__"])
				self.deleted_sections.push(section);
		}
		
		UCIConfig.prototype.$getErrors = function(){
			var errors = [];
			var self = this;
			Object.keys(self).map(function(x){
				if(self[x] && self[x].constructor == UCI.Section) {
					self[x].$getErrors().map(function(e){
						if(e instanceof Array){
							errors = errors.concat(e);
						}else{
							errors.push(e);
						}
					});
				}
			});
			return errors;
		}
		
		UCIConfig.prototype.$reset = function(){
			var self = this;
			Object.keys(self).map(function(x){
				if(self[x] && self[x].constructor == UCI.Section){
					self[x].$reset();
					if(self[x]["__new__"]) self[x].$delete();
				}
			});
			self[".need_commit"] = false;
		}

		UCIConfig.prototype.$mark_for_reload = function(){
			this.deferred = null;
		}
		
		// reloads data from backend without modifying values set by user
		UCIConfig.prototype.$reload = function(){
			var self = this;
			this.$sync({keep_user_changes: true});
			var def = $.Deferred();
			$rpc.$call("uci", "get", {config: self[".name"]}).done(function(data){
				var vals = data.values;
				Object.keys(vals).filter(function(x){
					return vals[x][".type"] in section_types[self[".name"]];
				}).map(function(k){
					_updateSection(self, vals[k], {keep_user_changes: true});
					def.resolve();
				});
			}).fail(function(){
				def.reject();
			});
			return def.promise();
		}

		UCIConfig.prototype.$sync = function(opts){
			var deferred = $.Deferred();
			var self = this;
			if(!opts) opts = {};

			if(self.deferred) return self.deferred.promise();
			
			self.deferred = deferred;

			var to_delete = {};
			Object.keys(self).map(function(x){
				// prevent deletion of automatically created type sections with default value which are created by registerSectionType..
				if(self[x].constructor == UCI.Section && self[x][".type"] != self[x][".name"]) to_delete[x] = self[x];
			});
		
			$rpc.$call("uci", "revert", {
				config: self[".name"]//,
				//ubus_rpc_session: $rpc.$sid()
			}).always(function(){ // we have to use always because we always want to sync regardless if reverts work or not ( they will not if the config is readonly! )
				$rpc.$call("uci", "get", {
					config: self[".name"]
				}).done(function(data){
					var vals = data.values;
					Object.keys(vals).filter(function(x){
						return vals[x][".type"] in section_types[self[".name"]];
					}).map(function(k){
						if(!(k in self)) _insertSection(self, vals[k]);
						else _updateSection(self, vals[k], opts);
						delete to_delete[k];
					});
					
					// now delete any section that no longer exists in our local cache
					async.eachSeries(Object.keys(to_delete), function(x, next){
						if(!to_delete[x]) { next(); return; }
						var section = to_delete[x];
						_unlinkSection(self, section);
						next();
					}, function(){
						deferred.resolve();
					});
				}).fail(function(){
					deferred.reject();
				});
			});
			return deferred.promise();
		}
		// set object values on objects that match search criteria
		// if object does not exist, then create a new object
		UCIConfig.prototype.set = function(search, values){
			var self = this;
			self["@all"].map(function(item){
				var match = Object.keys(search).filter(function(x){ item[x] != search[x]; }).length == 0;
				if(match){
					Object.keys(values).map(function(x){
						item[x].value = values[x];
					});
				}
			});
		}
		
		UCIConfig.prototype.$registerSectionType = function(name, descriptor, validator){
			var config = this[".name"];
			var conf_type = section_types[config];
			if(name in conf_type) throw new Error("Section "+name+" already defined. Please fix your code!");
			if(typeof conf_type === "undefined") conf_type = section_types[config] = {};
			conf_type[name] = descriptor;
			this["@"+name] = [];
			if(validator !== undefined && validator instanceof Function) conf_type[name][".validator"] = validator;
			conf_type[name]["_access_r"] = { dvalue:[], type: Array };
			conf_type[name]["_access_w"] = { dvalue:[], type: Array };
		}
		
		UCIConfig.prototype.$deleteSection = function(section){
			var self = this;
			var deferred = $.Deferred();
				
			$rpc.$call("uci", "delete", {
				"config": self[".name"],
				"section": section[".name"]
			}).done(function(){
				_unlinkSection(self, section);
				console.log("Deleted section "+self[".name"]+"."+section[".name"]);
				self[".need_commit"] = true;
				deferred.resolve();
			}).fail(function(){
				console.error("Failed to delete section!");
				deferred.reject();
			});
			return deferred.promise();
		}
		
		UCIConfig.prototype.$create = function(item, is_old){
			var self = this;
			if(!(".type" in item)) throw new Error("Missing '.type' parameter!");
			var type = section_types[self[".name"]][item[".type"]];
			if(!type) throw Error("Trying to create section of unrecognized type ("+self[".name"]+"."+item[".type"]+")");
		
			var deferred = $.Deferred();
			
			// TODO: validate values!
			var values = {};
			Object.keys(type).map(function(k){
				if(k in item && item[k] != null && item[k] != undefined) values[k] = item[k];
				else if(type[k].dvalue != null && type[k].dvalue != undefined){
					//if(type[k].required) throw Error("Missing required field "+k);
					values[k] = type[k].dvalue;
				}
			});
			
			if((".name" in item) && (item[".name"] in self)){ // section with specified name already exists
				setTimeout(function(){
					deferred.reject("Section with name "+item[".name"]+" already exists in config "+self[".name"]);
				}, 0);
				return deferred.promise();
			}
			
			$rpc.$call("uci", "add", {
				"config": self[".name"],
				"type": item[".type"],
				"name": item[".name"],
				"values": values
			}).done(function(state){
				console.log("Added new section: "+JSON.stringify(state));
				item[".name"] = state.section;
				self[".need_commit"] = true;
				var section = _insertSection(self, item);
				if(!is_old) section["__new__"] = true;
				deferred.resolve(section);
			}).fail(function(){
				deferred.reject();
			});
			return deferred.promise();
		}
	
		// Change order of two sections.
		UCIConfig.prototype.$save_order = function(type){
			var def = $.Deferred();
			var arr = this["@"+type];
			var self = this;
			if(!arr){
				console.error("UCI."+self[".name"]+".$reorder: section "+type+" is unknown!");
				setTimeout(function(){ def.reject(); }, 0);
				return def.promise();
			}
			var order = arr.map(function(x){ return x[".name"]; }).filter(function(x){ return x; });
			$rpc.$call("uci", "order", {
				config: self[".name"],
				sections: order
			}).done(function(data){
				self[".need_commit"] = true;
				def.resolve(data);
			}).fail(function(){
				def.reject();
			});
			return def.promise();
		}
		
		UCIConfig.prototype.$getWriteRequests = function(){
			var self = this;
			var reqlist = [];
			self["@all"].map(function(section){
				if(section["__new__"]){
					reqlist.push({
						"config": self[".name"],
						"section": section[".name"],
						"new":true
					});
				}
				if(section.$index.current != section.$index.old){
					var found = reqlist.find(function(rq){
						return rq.moved && rq.config === self[".name"] && rq.type === section[".type"];
					});
					if (!found) {
						reqlist.push({
							"config": self[".name"],
							"type": section[".type"],
							"moved": true,
						});
					}
				}
				var changed = section.$getChangedValues();
				if(Object.keys(changed).length){
					reqlist.push({
						"config": self[".name"],
						"section": section[".name"],
						"values": changed
					});
				}
			});
			return reqlist;
		}
		
		UCI.Config = UCIConfig;
	})();
	
	UCI.prototype.$init = function(){
		var deferred = $.Deferred();
		var self = this;
		
		$rpc.$call("uci", "configs").done(function(response){
			var cfigs = response.configs;
			if(!cfigs) { return deferred.reject("could not retrieve list of configs!"); }
			cfigs.map(function(k){
				if(!(k in section_types)) {
					console.log("Missing type definition for config "+k);
					return;
				}
				if(!(k in self)){
					self[k] = new UCI.Config(self, k);
				}
			});
			self.initDone = true;
			deferred.resolve();
		}).fail(function(e){
			deferred.reject(e);
		});
		return deferred.promise();
	}
	
	// returns true if there are uci changes
	UCI.prototype.$hasChanges = function(){
		if(!this.initDone) return;
		return this.$getChanges().length > 0;
	}
	
	UCI.prototype.$getChanges = function(){
		if(!this.initDone) return;
		var changes = [];
		var self = this;
		Object.keys(self).map(function(x){
			if(!self[x] || self[x].constructor != UCI.Config) return;
			if(self[x][".need_commit"]){
				self[x].deleted_sections.map(function(section){
					changes.push({
						config:self[x][".name"],
						section: section[".name"],
						type: "section",
						state: "deleted section"
					});
				});
			}
			self[x].$getWriteRequests().forEach(function(ch){
				if(ch["new"]){
					changes.push({
						type: "section",
						config: ch.config,
						section: ch.section,
						state: "new section"
					});
					return;
				}
				if(ch["moved"]){
					changes.push({
						type: "section",
						config: ch.config,
						section: ch.type,
						state: "new order"
					});
					return;
				}
				Object.keys(ch.values).map(function(opt){
					var o = self[x][ch.section][opt];
					if(o.is_dirty){
						changes.push({
							type: "option",
							config: self[x][".name"],
							section: self[x][ch.section][".name"],
							option: opt,
							uvalue: o.uvalue,
							ovalue: o.ovalue
						});
					}
				});
			});
		});
		return changes;
	}

	UCI.prototype.$registerConfig = function(name){
		if(!(name in section_types)) section_types[name] = {};
		if(!(name in this)) this[name] = new UCI.Config(this, name);
	}
	
	UCI.prototype.$sync = function(configs){
		var deferred = $.Deferred();
		if(!this.initDone) return deferred.reject();
		var self = this;
		
		async.series([
			function(next){
				if(configs == undefined || configs.length == 0) {
					// if no argument provided then we sync all configs
					configs = Object.keys(self).filter(function(x){
						return self[x].constructor == UCI.Config;
					});
					//next(); return;
				} else if(!(configs instanceof Array)) {
					configs = [configs];
				}
				async.eachSeries(configs, function(cf, next){
					if(!(cf in self)) {
						//throw new Error("invalid config name "+cf);
						// NOTE: this can not throw because we need to sync all configs that we can sync
						// TODO: decide on whether to always resolve if at least one config compiles
						// or to always reject if at least one config fails.
						console.error("invalid config name "+cf);
						next();
						return;
					} /*else if(self[cf].$lastSync){
						var SYNC_TIMEOUT = 10000; // probably make this configurable
						if(((new Date()).getTime() - self[cf].$lastSync.getTime()) > SYNC_TIMEOUT){
							next();
							return;
						}
					}*/
					self[cf].$sync().done(function(){
						//self[cf].$lastSync = new Date();
						next();
					}).fail(function(){
						//console.error("Could not sync config "+cf);
						next(); // continue because we want to sync as many as we can!
						//next("Could not sync config "+cf);
					});
				}, function(err){
					next(err);
				});
			}
		], function(err){
			setTimeout(function(){ // in case async did not defer
				if(err) deferred.reject(err);
				else deferred.resolve();
			}, 0);
		});
		return deferred.promise();
	}

	UCI.prototype.$rollback = function(){
		if(!this.initDone) return;
			return $rpc.$call("uci", "rollback");
	}

	UCI.prototype.$save = function(){
		var deferred = $.Deferred();
		if(!this.initDone) return deferred.reject();
		var self = this;
		var writes = [];
		var reorders = [];
		var add_requests = [];
		var errors = [];
		self.deleted_sections = [];
		
		async.series([
			function(next){ // send all changes to the server
				console.log("Checking for errors...");
				Object.keys(self).map(function(k){
					if(self[k].constructor == UCI.Config){
						var err = self[k].$getErrors();
						if(err && err.length) {
							err.map(function(e){
								console.error("UCI error ["+k+"]: "+e);
							});
							errors = errors.concat(err);
							return;
						}
						var reqlist = self[k].$getWriteRequests();
						reqlist.map(function(x){
							if(x["new"])
								return;
							if(x["moved"]){
								reorders.push(x);
							} else
								writes.push(x);
						});
					}
				});
				if(errors.length) {
					deferred.reject(errors);
					return;
				}
				next();
			},
			function(next){
				async.eachSeries(reorders, function(reorder, cb){
					var config = self[reorder.config];
					if(!config || !config.$save_order instanceof Function) {
						throw new Error("couldnt find config " + reorder.config);
						cb();
						return;
					}
					config.$save_order(reorder.type).done(function(){
						var sections_of_type = config["@" + reorder.type] || [];
						// reset the index values
						sections_of_type.forEach(function(section, index, arr){
							arr[index].$index = { old:index, current:index};
						});
					}).always(function(){
						cb();
					});
				}, function(){
					next();
				});
			},
			function(next){
				async.eachSeries(writes, function(cmd, cb){
					$rpc.$call("uci", "set", cmd).done(function(response){
						console.log("... "+cmd.config+": "+JSON.stringify(response));
						self[cmd.config][".need_commit"] = true;
						cb();
					}).fail(function(){
						console.error("Failed to write config "+cmd.config);
						cb();
					});
				}, function(){
					next();
				});
			},
			function(next){
				async.eachSeries(Object.keys(self), function(config, next){
					if(self[config].constructor != UCI.Config || !self[config][".need_commit"]) {
						next();
						return;
					}
					console.log("Committing changes to "+config);
					$rpc.$call("uci", "commit", {config: config}).done(function(){
						self[config][".need_commit"] = false;
						// we need to call mark_for_reload to make sync work (with new changes to how we handle changed fields)
						// the sync is necessary to make sure that all data is reloaded and has correct names after a commit
						// removing this sync will result in weird behaviour such as certain fields not being deleted even
						// though you have called uci delete on them. Basically we currently have to resync the state in order
						// to guarantee more fault tolerant operation.
						self[config].$mark_for_reload();
						self[config].$sync().done(function(){
							next();
						}).fail(function(err){
							console.log("error synching config "+config+": "+err);
							next();
						});
					}).fail(function(err){
						errors.push("could not commit config: "+err);
						next();
					});
				}, function(){
					// this is to always make sure that we do this outside of this code flow
					setTimeout(function(){
						if(errors && errors.length) deferred.reject(errors);
						else deferred.resolve();
					},0);
				});
			}
		]);
		return deferred.promise();
	}
	
	scope.UCI = new UCI();
	scope.UCI.validators = {
		ASCIIValidator: ASCIIValidator,
		WPAKeyValidator: WPAKeyValidator,
		WEPKeyValidator: WEPKeyValidator,
		WeekDayListValidator: WeekDayListValidator,
		TimespanValidator: TimespanValidator,
		PortValidator: PortValidator,
		PortOrRangeValidator: PortOrRangeValidator,
		PortsOrRangeValidator: PortsOrRangeValidator,
		PortRangeValidator: PortRangeValidator,
		ConnbytesValidator: ConnbytesValidator,
		NumberLimitValidator: NumberLimitValidator,
		TimeValidator: TimeValidator,
		MACAddressValidator: MACAddressValidator,
		MACListValidator: MACListValidator,
		IPAddressValidator: IPAddressValidator,
		IP6AddressValidator: IP6AddressValidator,
		IP6CIDRValidator: IP6CIDRValidator,
		IP6HintValidator: IP6HintValidator,
		IP4AddressValidator: IP4AddressValidator,
		IP4NetmaskValidator: IP4NetmaskValidator,
		IP4MulticastAddressValidator: IP4MulticastAddressValidator,
		IP4CIDRValidator: IP4CIDRValidator,
		IP4UnicastAddressValidator: IP4UnicastAddressValidator,
		QOSMarkValidator: QOSMarkValidator,
		HostnameValidator: HostnameValidator,
		IPAddressAndIPCIDRValidator: IPAddressAndIPCIDRValidator
	};
})(typeof exports === 'undefined'? this : global);
