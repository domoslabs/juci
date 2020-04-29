UCI.$registerConfig("domosdq");

UCI.domosdq.$registerSectionType("deltaq_probe", {
    "cloudurl":						{ dvalue: '', type: String },
	"interfaces":					{ dvalue: '', type: String },
    "pingcount":	{ dvalue: 1800, type: Number },
    "pingperiod_ms":	{ dvalue: 1800, type: Number },
    "sendtocloudperiod":	{ dvalue: 1800, type: Number },
});

UCI.domosdq.$registerSectionType("daemon", {
    "enable":	{ dvalue: 1, type: Number },
});



// domosdq.probe.cloudurl='https://nextreleasev8domos.azurewebsites.net'
// domosdq.probe.interfaces='wl0,wl1'
// domosdq.probe.ping2_enable='1'
// domosdq.probe.pingcount='60'
// domosdq.probe.pingperiod_ms='10000'
// domosdq.probe.sendtocloudperiod='3600'
// domosdq.daemon=daemon
// domosdq.daemon.enable='1'
