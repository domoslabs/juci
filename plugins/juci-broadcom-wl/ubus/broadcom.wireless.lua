#!/usr/bin/lua

local json = require("juci/json"); 
local juci = require("juci/core"); 

function wireless_scan(opts)
	juci.shell("wlctl scan 2>/dev/null"); 
	print("{}"); 
end

function wireless_scanresults(opts)
	local output = juci.shell("wlctl -i %s scanresults", (opts.device or "wl0")); 
	local aps = {}; 
	local obj = {}; 
	local resp = {}; 

	function store_object() 
		if(obj.rssi and obj.noise) then 
			-- we can only send ints on ubus so we need to return a percentage 0 to 100
			obj.snr = math.floor((1 - (obj.rssi / obj.noise)) * 100); 
		else 
			obj.snr = 0; 
		end

		table.insert(aps, obj) 
	end

	resp["access_points"] = aps; 
	for s in output:gmatch("[^\r\n]+") do
		local fields = {}
		for w in s:gmatch("%S+") do table.insert(fields, w) end
		for i,v in ipairs(fields) do
			if v == "SSID:" then 
				x = {}; 
				for w in s:gmatch("[^\"]+") do table.insert(x, w) end
				if next(obj) ~= nil then store_object() end
				obj = {}; 
				obj["ssid"] = x[2]; 
			end
			if v == "Mode:" then obj["mode"] = fields[i+1] end
			if v == "RSSI:" then obj["rssi"] = tonumber(fields[i+1]) end
			if v == "noise:" then obj["noise"] = tonumber(fields[i+1]) end
			if v == "Channel:" then obj["channel"] = tonumber(fields[i+1]) end
			if v == "BSSID:" then obj["bssid"] = fields[i+1] end
			if v == "multicast" and fields[i+1] == "cipher:" then obj["multicast_cipher"] = fields[i+2] end
			if v == "AKM" then obj["cipher"] = fields[i+2] end
			if v == "Chanspec:" then obj["frequency"] = fields[i+1] end
			if v == "Primary" and fields[i+1] == "channel:" then obj["primary_channel"] = tonumber(fields[i+2]) end
			if v == "WPS:" then obj["wps_version"] = fields[i+1] end
		end
	end
	if next(obj) ~= nil then 
		store_object(); 
	end
	print(json.encode(resp)); 
end

juci.ubus({
	scan = wireless_scan, 
	scanresults = wireless_scanresults
}, arg); 

