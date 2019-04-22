JUCI.app
.factory("$cifsd", function($uci){
	function Cifsd () {}
	Cifsd.prototype.getConfig = function(){
		var def = $.Deferred(); 
		$uci.$sync("cifsd").done(function(){
			if(!$uci.cifsd["@global"].length) def.reject(); 
			else def.resolve($uci.cifsd["@global"][0]); 
		}).fail(function(){
			def.reject();
		});  
		return def.promise(); 
	}

	Cifsd.prototype.getShares = function(){
		var def = $.Deferred(); 
		$uci.$sync("cifsd").done(function(){
			def.resolve($uci.cifsd["@share"]); 
		}).fail(function(){
			def.reject();
		}); 
		return def.promise();  
	}
	
	Cifsd.prototype.getUsers = function(){
		var def = $.Deferred(); 
		$uci.$sync("cifsd").done(function(){
			def.resolve($uci.cifsd["@users"]); 
		}).fail(function(){
			def.reject(); 
		}); 
		return def.promise(); 
	}
	return new Cifsd(); 
}); 

UCI.$registerConfig("cifsd"); 
UCI.cifsd.$registerSectionType("global", {
	"server_string":			{ dvalue: "", type: String }, 
	"workgroup":	{ dvalue: "", type: String },
	"netbios_name":	{ dvalue: "", type: String },
	"charset": 		{ dvalue: "", type: String },
	"homes":		{ dvalue: false, type: Boolean },
	"interface":	{ dvalue: "", type: String }
}); 

UCI.cifsd.$registerSectionType("share", {
	"name":			{ dvalue: "", type: String }, 
	"path":			{ dvalue: "/mnt", type: String },
	"users":		{ dvalue: "", type: String }, // comma separated list
	"read_only":	{ dvalue: "no", type: Boolean }, // Yes/no
	"guest_ok":		{ dvalue: "no", type: Boolean }, // Yes/no
	"create_mask":	{ dvalue: "0744", type: String }, 
	"dir_mask":		{ dvalue: "0755", type: String }, 
	"veto_files":	{ dvalue: "", type: String } 
}); 

UCI.cifsd.$registerSectionType("users", {
	"user":			{ dvalue: "", type: String }, 
	"password":		{ dvalue: "", type: String },
	"desc": 		{ dvalue: "", type: String }
}); 
