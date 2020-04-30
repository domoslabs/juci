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

UCI.$registerConfig("domos");
UCI.domos.$registerSectionType("domos_config", {
    "speedtest_server":		{ dvalue: 'http://speedtest1.telenor.net/mini', type: String },
    "iperf_server":		    { dvalue: 'speedtest.nextgentel.no', type: String },
    "iperf_port":		    { dvalue: '5201', type: String },
    "iperf_protocol":		{ dvalue: '0', type: String },
    "iperf_scantime":		{ dvalue: '60', type: String },
    "latencytarget":		{ dvalue: 'google.com', type: String },
    "latencypingamount":	{ dvalue: '5', type: String },
    "traceroute_server":	{ dvalue: 'google.com', type: String },
    "traceroute_pings":		{ dvalue: '5', type: String },
    "apscan_duration":		{ dvalue: '5', type: String },
    "apscan_dwell_time":	{ dvalue: '200', type: String },
    "apscan_2g_enable":		{ dvalue: '1', type: String },
    "apscan_5g_enable":		{ dvalue: '1', type: String },
    "wifilatency_interval":	{ dvalue: '100', type: String },
    "wifilatency_wakeups":	{ dvalue: '10', type: String },
    "wifilatency_packets":	{ dvalue: '40', type: String },
    "routerid_as_mac":		{ dvalue: '0', type: String },
    "bsdata_interval":		{ dvalue: '10', type: String },
    "rates_interval":		{ dvalue: '5', type: String },
    "natconnections_max":	{ dvalue: '0', type: String },
    "dhcpdiscovery_enable":	{ dvalue: '0', type: String },
    "twampserver_enable":	{ dvalue: '0', type: String },
    "chanim_interval":		{ dvalue: '0', type: String },
});

UCI.$registerConfig("domosqos");
UCI.domosqos.$registerSectionType("domosqos", {
    "use_ipset":	{ dvalue: '1', type: String },
    "start_ndpireader_enabled":	{ dvalue: '0', type: String },
    "ndpireader_interface":	{ dvalue: 'br-lan', type: String },
    "interface_to_limit":	{ dvalue: 'wlan2', type: String },
    "kill_ndpireader_cpu":	{ dvalue: '70', type: String },
    "bandwidth_limit_max":	{ dvalue: '200', type: String },
    "bandwidth_limit_min":	{ dvalue: '10', type: String },
    "bandwidth_down_step":	{ dvalue: '5', type: String },
    "bandwidth_up_step":	{ dvalue: '1', type: String },
    "bandwidth_interval":	{ dvalue: '200000', type: String },
    "good_rtt_before_up":	{ dvalue: '1', type: String },
    "bad_rtt_before_down":	{ dvalue: '1', type: String },
    "number_ping_to_store":	{ dvalue: '20', type: String },
    "flowfile_path":	{ dvalue: '/tmp/ndpiflows.json', type: String },
    "servicefile_path":	{ dvalue: '/etc/domos-qos-daemon.conf', type: String },
    "tree_files_path":	{ dvalue: '/etc/domos-dt-bandwidth/bare_fping_bw_limit_tuner', type: String },
    "tree_cases_file":	{ dvalue: '/tmp/cases_data.csv', type: String },
});
