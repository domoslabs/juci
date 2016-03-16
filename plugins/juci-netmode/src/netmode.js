JUCI.app.run(function($uci){
	// automatically create the setup section because without it we can not get current netmode (it should actually be there by default, but just in case);
	$uci.$sync("netmode").done(function(){
		$uci.netmode.$create({".type": "mode", ".name": "setup" }).done(function(){
			$uci.$save(); 
		}); 
	}); 
}); 

UCI.$registerConfig("netmode"); 
UCI.netmode.$registerSectionType("mode", {
	"dir":		{ dvalue: '', type: String }, 
	"detail":	{ dvalue: '', type: String }, 
	"curmode":	{ dvalue: '', type: String }
}); 
UCI.netmode.$registerSectionType("netmode", {
	"reboot":	{ dvalue: true, type: Boolean },
	"name":		{ dvalue: '', type: String }, 
	"desc":		{ dvalue: '', type: String }, 
	"conf":		{ dvalue: '', type: String }, 
	"exp":		{ dvalue: '', type: String }
}); 

