JUCI Webgui for Embedded Routers
--------------------------------

JUCI is a JavaScript-based web interface for broadband routers running Iopsys /
OpenWRT.

JUCI is built with html5, angularjs and bootstrap: 

![Desktop](/media/screenshot.jpg?raw=true "JUCI Screenshot")

JUCI is theme-able and fully mobile-ready (responsive): 

![Mobile](/media/mobile.jpg)

What is JUCI? 
-------------

If offers you the following: 

* Extremely resource-efficient for your device - your router only needs to run the core functions (which can be written in C!) and the gui itself is running entirely inside the client's browser). You router only computes and sends the minimum information necessary. 
* Full mobile support
* Easy to work with - the code uses angular.js and html5, making it extremely easy to add new gui elements to the gui. 
* Full control and flexibility - yet many ready-made components: allowing you to pick yourself which level you want to develop on. There are no restrictions to the look and feel of your gui. 
* Dynamic theming - you can switch color themes at runtime. 
* Full language support - allowing for complete localization of your gui. Language file generation is even partially automatic (for html text). Also supporting dynamically changing language on page without having to reload the application. Also featuring quick debug mode for translations where you can see which strings are missing in currently used language pack. 

How to support JUCI
-------------------

To support JUCI project (or any other GPL project) you can hire one of JUCI
developers on contract basis to help you develop your particular product. You
get plenty of code already in the repository free of charge under the terms of
GPL - and you also get plenty of new features added on your demand. Depending
on their availability, developers may have variable ammounts of time to put
into your project. To get list of JUCI developers, you can clone this repo and
run git shortlog command. 

	git shortlog -s -e -n

Since JUCI is distributed under the terms of GPL, you must also be aware that
any functionality implemented just for you, must, by definition, also fall into
GPL. 

Usage on OpenWRT
----------------

You can now try JUCI on openwrt. 

Here is how to install it:

- Add my feed to your feeds.conf.default
src-git-full juci https://github.com/mkschreder/mks-openwrt-feed.git

- Update and install the feed (with -f to force overrides)
./scripts/feeds update juci
./scripts/feeds install -f -p juci -a

- select juci core, inteno theme and openwrt plugins under JUCI menu in menuconfig
  (NOTE: some plugins conflict with eachother so you can not select
  juci-broadcom-wl and juci-openwrt-wireless at the same time). 

For example, you could append this to your .config and then do make defconfig: 

	CONFIG_PACKAGE_juci-ubus-core=y
	# CONFIG_PACKAGE_juci-broadcom-dsl is not set
	# CONFIG_PACKAGE_juci-broadcom-ethernet is not set
	# CONFIG_PACKAGE_juci-broadcom-vlan is not set
	# CONFIG_PACKAGE_juci-broadcom-wl is not set
	CONFIG_PACKAGE_juci-ddns=y
	CONFIG_PACKAGE_juci-diagnostics=y
	CONFIG_PACKAGE_juci-dnsmasq-dhcp=y
	CONFIG_PACKAGE_juci-dropbear=y
	CONFIG_PACKAGE_juci-ethernet=y
	CONFIG_PACKAGE_juci-event=y
	CONFIG_PACKAGE_juci-firewall-fw3=y
	# CONFIG_PACKAGE_juci-freecwmp is not set
	# CONFIG_PACKAGE_juci-igmpinfo is not set
	# CONFIG_PACKAGE_juci-inteno-multiwan is not set
	# CONFIG_PACKAGE_juci-inteno-router is not set
	# CONFIG_PACKAGE_juci-jquery-console=y
	# CONFIG_PACKAGE_juci-macdb is not set
	CONFIG_PACKAGE_juci-minidlna=y
	CONFIG_PACKAGE_juci-mod-status=y
	CONFIG_PACKAGE_juci-mod-system=y
	# CONFIG_PACKAGE_juci-natalie-dect is not set
	# CONFIG_PACKAGE_juci-netmode is not set
	CONFIG_PACKAGE_juci-network-netifd=y
	CONFIG_PACKAGE_juci-openwrt-wireless=y
	# CONFIG_PACKAGE_juci-router-openwrt is not set
	CONFIG_PACKAGE_juci-samba=y
	CONFIG_PACKAGE_juci-simple-gui=y
	CONFIG_PACKAGE_juci-snmp=y
	CONFIG_PACKAGE_juci-sysupgrade=y
	CONFIG_PACKAGE_juci-uhttpd=y
	CONFIG_PACKAGE_juci-upnp=y
	CONFIG_PACKAGE_juci-usb=y
	# CONFIG_PACKAGE_juci-utils is not set
	CONFIG_PACKAGE_juci-theme-inteno=y
	CONFIG_PACKAGE_juci=y

- BUILD! 

Menus can be configured in /etc/config/juci. As a start you can use
juci.config.example and copy it to your router /etc/config/juci. Then you can
modify it to get the menus you want.  A better menu system is on the todo
list.. 

If you go to your router ip you should see the login screen. By default admin
user is used to login but if you don't have password set for admin user you
will not be able to login. So then go to the console and set password for admin
user or change the user used for logging in by editing /etc/config/rpcd and
then do /etc/init.d/rpcd restart. 

If you can not login, it could be that you have not installed all juci packages
correctly. JUCI requires modified versions of rpcd and uhttpd. In the case that
you did not install the feed with "-f" option, you will not be overriding rpcd
and so you will not be able to login. 

JUCI also includes a nodejs server which you can do for local testing and for
forwarding jsonrpc calls to your router during testing (juci-local-server). 

The GPL
-------

Software should be impossible to lock down. 

JUCI uses GPL as primary license for all code, data and documentation. 

You may use juci in any commertial application, firmware or embedded device
without fearing any consequences other than being ready to make your own
version of JUCI freely available to your customers to change and redistribute.

Contribution
------------

If you want to work on juci or if you are using juci yourself and make
modifications to it, it is usually a good idea if you submit your modifications
as patches. This can be done by using "git format-patch --stdout" and then
submitting the patch to me by email or through the JUCI github page at
https://github.com/mkschreder/juci.git. 

For detailed instructions on how to submit patches see: 
[Submitting Patches](https://github.com/mkschreder/juci/blob/master/docs/submitting-patches.md)

If you make any significant patches to JUCI to accomodate your project needs,
it is very good if you submit them upstream to main juci project because your
changes are likely to become obsolete within a few months unless they are
integrated into the main project. 

Copyright Assignment
--------------------

As a contributor to the JUCI project you remain as the holder of the copyright
of your own contribution. Even if the copyright, under any circumstances, gets
reassigned to someone else - you as the original owner of your contribution
still retain all rights and benefits of a copyright holder to relicense and
redistribute the code as your own. (note that GPL code that has once been
released under GPL can not ever be made private in it's already released form.
Only later versions can be made private - if you are the copyright holder.)
Such a situation is however very unlikely to occur, unless someone decides to
breach the GPL and do something stupid. 

Good to know
------------

Addons can be developed on top of juci by creating package that installs js and
css files into the router /www folder and then runs juci-update at postinstall
(index.html is actually generated automatically). 

In most cases you will never need to modify core juci code. If you need to
change behavior of some function, you can always override the public function
in javascript without having to modify the original implementation. 

Juci uses modified version of uhttpd that can serve gz files with proper
content type based on actual gzipped content. 

JUCI also uses modified versions of ubus and rpcd on openwrt which you can also
install from the feed (using -f option). 

Getting started
---------------

New: you can now find compiled juci manuals here:
[http://mkschreder.github.io/juci/](http://mkschreder.github.io/juci/)

JUCI is designed to work primarily on OpenWRT based systems. Even if you surely
can use this code on other systems as well, a lot of functionality is
implemented in the backend using OpenWRT tools and packages. So you will
naturally need to build your firmware using openwrt to get the most of juci. 

To install necessary tools to compile JUCI you can use the file
./scripts/ubuntu-bootstrap.sh. Run it using sudo.  

JUCI is a collection of many files including individual javascript files, html
templates, translations and styles (written in LESS). All of these files need
to be built into a set of modules which can then be included as scripts into an
index.html page. This is done using make. 

	make - without any arguments builds production files (minified and gzipped). 
	make debug - builds uncompressed files for use with juci-local-server. 

When developing, it can be very good to use local server because it allows you
to continuously test your changes locally. Local server is a small program
written using node.js that starts a local http server while forwarding ubus
calls to a real box.

To run local server for testing new gui elements during development: 

	./juci-local-server --host <your router ip with juci installed>
	
	now go to http://localhost:3000/ to see the local gui. 

	when you make changes in code, run make debug again and reload the local page. 

Common Issues
------------

* I visit the home page and can not see anything. The homepage is blank. 

	Solution: open up your browser console and see if you have some error printed there.

* Juci fails to start. Says juci.ui.menu ubus call is missing. 

	Solution: make sure ubus-scriptd is running on the router. And make sure it
	loads all scripts without errors. To check, do /etc/init.d/ubus-scriptd
	stop and then just run ubus-scriptd. It will print a trace. Now cancel it
	with ctrl+c and once you fix the errors restart it using
	/etc/init.d/ubus-scriptd start. Then make sure the necessary call is
	present in output of "ubus list"

* I get to login page but can not login. What is the password? 

	Solution: the login user is set in /etc/config/rpcd. Password is the unix
	password for that user - which you can change using passwd <username>. 

* I can login but get a big fat error box with a lot of text mentioning angular. 

	Solution: this means that some module completely failed to initialize or
	that you have syntax error somewhere or that you have duplicate controller
	names or anything else that will cause an exception in angular. Usually the
	first thing to do is check browser console for any messages before the
	error. Then check the cryptic anuglar message mentioned in the error to get
	a clue on what to do next.

* My page xyz can not access ubus. I get "Access Denied" in browser console. 

	Solution: check that you have proper acl permissions configured in your
	access.json file in your plugin (if it is not there then create it - use
	existing plugins to see how). Then copy this file to your router and
	restart rpcd (/etc/init.d/rpcd restart). Then it should work. 

* My build process just hangs at line that contains "npm"

	Solution: build process needs connection to the internet to download
	necessary dependencies for some build scripts. If it is not possible then
	programs like "npm" may block indefinetely. 

* Compilation fails at "Compiling css/..juci.css.."

	Solution: this happens when yui-compressor (css minifier (which is written
	in java)) runs out of memory. This file tends to get large, and minifier
	needs more memory. Make sure your java VM is configured to use larger stack
	size (I find it amazing how easily java always wastes memory). 

Unit testing
------------

NOTE: unit testing is no longer supported for now since sep 2015! But old files
are still there. 

Previously it was possible to run juci core in node js and make ubus calls
directly from command line. This functionality is still there and is
implemented in lib-juci in tests directory, but it has not been used for a
while so probably things have become outdated there. It would be nice in the
future to actually make most of the angular factories standalone modules
available through nodejs. This is not a difficult task because the code itself
is very easy to make into a standalone library not dependent on angular. 

This is on the list of things to be done. 

Using UCI from the web console
-------------------------------

It is possible to use UCI directly from your browser console. When you open
your console you will have a global uci object defined in the application.

	$uci.$sync("wireless") // will sync the wireless table
	$uci.$sync(["wireless", "hosts"]) // will sync both wireless and hosts configs. 
	
	$uci.wireless.wl0.channel.value = 1 // will set channel value to 1 
	
	$uci.$save() // will save the uci config
	
All of the above methods return a promise. So if you need to run code AFTER the
operation completes, you have to set the done (or fail/always) callback for the returned
promise. You do it like this:  

	$uci.$sync("wireless").done(function(){
		console.log("Channel: "+$uci.wireless.wl0.channel.value); 
	}).fail(function(){
		console.log("Failed to sync tables!"); 
	}).always(function(){
		console.log("Done!"); 
	}); 
	
When you invoke $sync() the uci code will load the specified configs into
memory. The config types must be defined in your plugin first, so that fields
that are not present in the configs can be created with their default values.

For more details on how this is done, check the .js files in the plugins under
src/ folder (not pages and widgets, but the main plugin file which is usually
called plugin-name.js or just main.js). 

Just like in command line uci, JUCI gives you several ways to access config
elements: 

	$uci.wireless["@all"] // list of all sections in the wireless config
	$uci.wireless["@wifi-device"] // list of only the wifi device sections
	$uci.wireless.wl0 // access wl0 section by name (all sections that have a name can be accessed like this)
	$uci.wireless.cfg012345 // access a section with an automatically created uci name. 
	
Each field in uci section has a "value" member which is current value of that
field. So if you use uci sections in your gui elements you have to use .value
in order to set their values. 

JUCI also retains the default and original values of each field so that you can
revert the value to what it was when you loaded the config. 

It is also possible to attach validators to each field. Examples are in uci.js
file. 

Backend Code 
------------

Juci backend mostly consists of scripts that implement ubus functions which
become available to the gui code through json rpc. These scripts are simple
glue that juci uses to interact with the rest of the system. You can place
these scripts in ubus/ folder of your plugin. Each script should have a
globally unique name (preferably a name that identifies it as being part of a
specific plugin) and it will be placed into /usr/lib/ubus/juci folder on the
router. 

All of these scripts are then managed by ubus-scriptd service on the router
which makes then available on ubus.

ubus-scriptd supports both batch scripts and services. Most of juci backend
tasks are usually batch scripts that become ubus objects.  

Further information
-------------------

JUCI documentation can definitely be improved. You can speed up this process by
posting your questions on the issues board on juci github page
(https://github.com/mkschreder/juci/issues). 

License Notice
--------------

Contributors: 
	- Noel Wuyts <skype: noel.wuyts>: angular, widgets, development
	- Feten Besbes <skype: feten_besbes>: css

Project lead: Martin K. Schröder <mkschreder.uk@gmail.com>

Copyright (C) 2012-2013 Inteno Broadband Technology AB. All rights reserved.

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
version 2 as published by the Free Software Foundation.

	This program is distributed in the hope that it will be useful, but
	WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
	General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
	02110-1301 USA
