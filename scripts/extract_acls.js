#!/usr/bin/node

const fs = require('fs');
// const JSON = require('JSON');

if (process.argv.length < 4) {
	exit_with_message("usage: " + process.argv[1] + " <file>");
}

const file = process.argv[2];
const out = process.argv[3];

if (!fs.existsSync(file)) {
	exit_with_message("file does not exist");
}
let content;
try {
	const file_string = fs.readFileSync(file, 'utf8');
	content = JSON.parse(file_string);
} catch (e) {
	exit_with_message("error reading JSON. make sure you " + 
			"provice a file witth valid json as argument");
}
let out_obj = [];
let out_str = "";
	
Object.keys(content).forEach(key => {
	out_str = out_str + key + ",";
	const obj = content[key];
	let module = { "acl":key};
	module.description = obj.description || "";
	out_str = out_str + (obj.description || "") + ",";
	module.access = [];
	 // find all ubus calls from read
	if (obj.read && obj.read.ubus){
		Object.keys(obj.read.ubus).forEach(uob => {
			obj.read.ubus[uob].forEach(meth => {
				if (meth === '*')
					meth = "(all methods)";
				out_str = out_str + "ubus call " + uob + " " + meth + ";";
				module.access.push("ubus call " + uob + " " + meth);
			});
		});
	}
	 // find all ubus calls from write (same functionallity as read)
	if (obj.write && obj.write.ubus){
		Object.keys(obj.write.ubus).forEach(uob => {
			obj.write.ubus[uob].forEach(meth => {
				out_str = out_str + "ubus call " + uob + " " + meth + ";";
				module.access.push("ubus call " + uob + " " + meth);
			});
		});
	}
	// find all config for reading
	if (obj.read && obj.read.uci){
		obj.read.uci.forEach(config => {
			out_str = out_str + "read config " + config + ";";
			module.access.push("read config " + config);
		});
	}
	// find all config for writing
	if (obj.write && obj.write.uci){
		obj.write.uci.forEach(config => {
			out_str = out_str + "write config " + config + ";";
			module.access.push("write config " + config);
		});
	}
	// find all events under read
	if (obj.read && obj.read.owsd){
		obj.read.owsd.forEach(e => {
			out_str = out_str + "get event " + e + ";";
			module.access.push("get event " + e);
		});
	}
	// find all events under write
	if (obj.write && obj.write.owsd){
		obj.write.owsd.forEach(e => {
			out_str = out_str + "get event " + e + ";";
			module.access.push("get event " + e);
		});
	}
	// find all juci cpabilities under read
	if (obj.read && obj.read.juci){
		Object.keys(obj.read.juci).forEach(name => {
			obj.read.juci[name].forEach(cap => {
				out_str = out_str + "has juci read " + name + " " + cap + ";";
				module.access.push("has juci read " + name + " " + cap);
			});
		});
	}
	// find all juci cpabilities under write
	if (obj.write && obj.write.juci){
		Object.keys(obj.write.juci).forEach(name => {
			obj.write.juci[name].forEach(cap => {
				out_str = out_str + "has juci write " + name + " " + cap + ";";
				module.access.push("has juci write " + name + " " + cap);
			});
		});
	}
	out_obj.push(module);
	out_str = out_str + "\n";
});

// console.log(JSON.stringify(out_obj, null, 4));

fs.appendFileSync(out, out_str, 'utf8', {flags:'a'});

function exit_with_message(message) {
	console.error(message);
	process.exit(1);
}
