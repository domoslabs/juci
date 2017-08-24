#!/bin/sh

. /usr/share/libubox/jshn.sh

case "$1" in
	list)
		echo '{ "status": {} }'
	;;
	call)
		case "$2" in
			status)
				json_init

				output=`netstat -lpa | grep ice`
				xmpp_client=":5223"
				cloudAuth=`grep -c "cloudfriends_authenticated=false" /etc/iopsys/server.ini`

				if [ `echo $output | grep $xmpp_client | grep -c ESTABLISHED` -gt 0 -a $cloudAuth -eq 0 ]; then
					json_add_string status "Registered"
				elif [ `echo $output | grep -c $xmpp_client` -gt 0 -a $cloudAuth -gt 0 ]; then
					json_add_string status "Unregistered"
				elif [ `echo $output | grep -c $xmpp_client` -eq 0 ]; then
					json_add_string status "Offline"
				else
					json_add_string status "Undefined"
				fi

				json_dump
			;;
		esac
	;;
esac

