UCI.$registerConfig("easy_qos");
UCI.easy_qos.$registerSectionType("rule", {
	"priority":		{ dvalue: "normal", type: String },
	"macaddr":		{ dvalue: "", type: String },
	"proto":		{ dvalue: "all", type: String },
	"port": 		{ dvalue: [], type: Array, validator: UCI.validators.validPorts},
	"comment":		{ dvalue: "NA", type: String, validator: UCI.validators.validPorts }
});

JUCI.app.factory("$easy_qos", function () {
	var portMapping = [
		{ label: "HTTP", value: 80},
		{ label: "SMTP", value: 25 },
		{ label: "HTTPS", value: 443 },
		{ label: "TELNET", value: 23 },
		{ label: "IMAP", value: 143 },
		{ label: "DNS", value: 53 },
		{ label: "SSH", value: 22 },
		{ label: "POP3", value: 110 }
	];

	return {
		validPort: function (port) {
			if (isNaN(port) || port > Math.floor(port) || /* port is string or decimal */
					port < 0 || port > 65535) /* port is not 16bit integer */
				return false;
			return true;
		},
		getPortMapping: function () {
			return portMapping;
		}
	}
});