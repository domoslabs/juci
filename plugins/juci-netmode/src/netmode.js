JUCI.app.run(function($uci){
	// automatically create the setup section because without it we can not get current netmode (it should actually be there by default, but just in case);
	$uci.$sync("netmode").done(function(){
		if(!$uci.netmode.setup){
			$uci.netmode.$create({".type": "mode", ".name": "setup" }).done(function(){
				$uci.$save();
			});
		}
	});
});

UCI.$registerConfig("netmode");
UCI.netmode.$registerSectionType("mode", {
	"dir":		{ dvalue: '', type: String },
	"detail":	{ dvalue: '', type: String },
	"repeaterready":{ dvalue: 0, type: Number },
	"curmode":	{ dvalue: '', type: String }
});
UCI.netmode.$registerSectionType("netmode", {
	"reboot":		{ dvalue: true, type: Boolean },
	"name":			{ dvalue: '', type: String },
	"desc":			{ dvalue: '', type: String },
	"uplink_band":	{ dvalue: '', type: String },
	"desc_fi":		{ dvalue: '', type: String },
	"desc_en":		{ dvalue: '', type: String },
	"desc_sv":		{ dvalue: '', type: String },
	"conf":			{ dvalue: '', type: String },
	"exp":			{ dvalue: '', type: String },
	"exp_en":		{ dvalue: '', type: String },
	"exp_fi":		{ dvalue: '', type: String },
	"exp_sv":		{ dvalue: '', type: String },
	"askcred":		{ dvalue: false, type: Boolean },
	"ssid":			{ dvalue: '', type: String },
	"key":			{ dvalue: '', type: String }
});

