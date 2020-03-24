# JUCI Webgui for Embedded Routers


JUCI is a JavaScript-based web interface for broadband routers running iopsysWrt/OpenWrt.

JUCI is built with html5, angularjs and bootstrap:

![Desktop](/media/screenshot.jpg?raw=true "JUCI Screenshot")

JUCI is theme-able and fully mobile-ready (responsive):

![Mobile](/media/mobile.jpg)

# What is JUCI?

If offers you the following:

* Extremely resource-efficient for your device - your router only needs to run the core functions (which can be written in C!) and the GUI itself is running entirely inside the client's browser). You router only computes and sends the minimum information necessary.
* Full mobile support
* Easy to work with - the code uses angular.js and html5, making it extremely easy to add new gui elements to the gui.
* Full control and flexibility - yet many ready-made components: allowing you to pick yourself which level you want to develop on. There are no restrictions to the look and feel of your gui.
* Dynamic theming - you can switch color themes at runtime.
* Full language support - allowing for complete localization of your gui. Language file generation is even partially automatic (for html text). Also supporting dynamically changing language on page without having to reload the application. Also featuring quick debug mode for translations where you can see which strings are missing in currently used language pack.

# Usage on OpenWRT

You can now try JUCI on openwrt.

Here is how to install it:

- Add juci feed to your feeds.conf.default
src-git-full juci https://dev.iopsys.eu/iopsys/juci.git

- Update and install the feed (with -f to force overrides)
./scripts/feeds update juci
./scripts/feeds install -f -p juci -a

- select juci core, iopsys theme and plugins under JUCI menu in menuconfig

For example, you could append this to your .config and then do make defconfig:

	CONFIG_PACKAGE_juci=y
	CONFIG_PACKAGE_juci-config-backup=y
	CONFIG_PACKAGE_juci-ddns=y
	CONFIG_PACKAGE_juci-diagnostics=y
	CONFIG_PACKAGE_juci-dnsmasq-dhcp=y
	CONFIG_PACKAGE_juci-dropbear=y
	CONFIG_PACKAGE_juci-event=y
	CONFIG_PACKAGE_juci-firewall-fw3=y
	CONFIG_PACKAGE_juci-icwmp=y
	CONFIG_PACKAGE_juci-igmpinfo=y
	CONFIG_PACKAGE_juci-minidlna=y
	CONFIG_PACKAGE_juci-mod-status=y
	CONFIG_PACKAGE_juci-mod-system=y
	CONFIG_PACKAGE_juci-mwan3=y
	CONFIG_PACKAGE_juci-network-device=y
	CONFIG_PACKAGE_juci-network-dsl=y
	CONFIG_PACKAGE_juci-network-netifd=y
	CONFIG_PACKAGE_juci-network-port=y
	CONFIG_PACKAGE_juci-openvpn=y
	CONFIG_PACKAGE_juci-owsd=y
	CONFIG_PACKAGE_juci-printer=y
	CONFIG_PACKAGE_juci-qos=y
	CONFIG_PACKAGE_juci-realtime-graphs=y
	CONFIG_PACKAGE_juci-samba=y
	CONFIG_PACKAGE_juci-sfp=y
	CONFIG_PACKAGE_juci-snmpd=y
	CONFIG_PACKAGE_juci-sysupgrade=y
	CONFIG_PACKAGE_juci-upnp=y
	CONFIG_PACKAGE_juci-usb=y
	CONFIG_PACKAGE_juci-voice-client=y
	CONFIG_PACKAGE_juci-wireless=y
	CONFIG_PACKAGE_juci-theme-iopsys=y

- BUILD!


If you go to your router ip you should see the login screen. By default admin
user is used to login but if you don't have password set for admin user you
will not be able to login. So then go to the console and set password for admin
user or change the user used for logging in by editing /etc/config/rpcd and
then do /etc/init.d/rpcd restart.

JUCI also includes a nodejs server which you can do for local testing and for
forwarding jsonrpc calls to your router during testing (juci-local-server).

# Good to know

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

# Backend Code

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

# JUCI Development

JUCI supports local development, this means that you can build the code on your desktop but execute it
towards an actual device.

1. Make sure your mashine is propperly setup (in iopsys repo run ./iop setup_host)

1. Download JUCI:
	git clone git@dev.iopsys.eu:iopsys/juci.git <Folder to clone to>

1. Checkout devel branch:
	git checkout devel

1. Create a Makefile.local:
	copy example-Makefile.local to Makefile.local (cp example-Makefile.local Makefile.local)
	or write your own. This file should contain a list of all plugins that will be compiled when you build locally.
	Make sure that Makefile.local has local=yes in it.

1. build JUCI:
	run "make debug"

1. (optional) create juci-local-server config file.
	copy example.localserver.conf to .localserver.conf (cp example.localserver.conf .localserver.conf)
	or write your own. This file MUST only contain a single valid JSON object with the keys
	"port": <port and "host": <your box> all other keys will be ignored

1. Start local server:
	This is a script that should run in the background all the time so best is to start it in its own taab.
	(If you have setup config you can skip the rest of this step).
	To specify on what ip the remote ubus is add the --host <host> flag to the command, default 192.168.1.1
	To specify on what port the server should run add --port <port> flag to the command, default 3000
	./juci-local-server [--port <PORT>] [--host <HOST>]

1. Open gui in browser:
	In browser go to localhost:PORT and the server will take html and js files from your bin/ directory and make all
	ubus calls etc on the box at the HOST ip

1. Make changes:
	to make changes and see them in browser just run make debug and reload the page in browser.
	(MIGHT BE FIXED)If the change includes css files you have to run make clean && make debug for the changes to take affect


IMPORTANT: if you make any changes to a file that is not html/js/css/less you need to update the box
	with the new files (access.json etc).


## Local OS X Development

JUCI can compile in a OS X environment but some utilities needs to be installed.

Install gettext on Mac OSX

```
brew install gettext

```

Installs the libraries and the utilities:

autopoint envsubst gettext gettext.sh gettextize msgattrib msgcat msgcmp msgcomm msgconv msgen msgexec msgfilter msgfmt msggrep msginit msgmerge msgunfmt msguniq ngettext recode-sr-latin xgettext

But doesn’t add to your path! You need to modify the env. variable $PATH:

```
vi ~/.bash_profile
```

And add to the end or modify previous declarations (do not forget to reopen your terminal):

```
export PATH=${PATH}:/usr/local/opt/gettext/bin
```

Install YUI compressor on Mac OSX

```
brew install yui-compressor
```

With npm install:

```
npm install less --global
```

```
npm install uglify-js --global
```

In the script folder there are several scripts written in JavaScript. They point to NodeJS Linux path, change these to your OS X path.
css-to-js, juci-build-tpl-cache and po2js.

Example) the script css-to-js, change first line to:

```
#!/usr/local/bin/node

```

### grep
If you run into any problems with grep in the build scripts this is most likely due OS X version is based on FreeBSD. The solution is to use brew version of grep i.e. ggrep.

Example) the script extract-strings has the following row:

``` bash
for file in "$@"; do
	# extract all angular filter translations
	grep -RPoin "{{[[:space:]]*'.+?'[[:space:]]*\|[[:space:]]*translate[[:space:]]*}}" 

	....
done

```

change grep to ggrep like this:


```
for file in "$@"; do
	# extract all angular filter translations
	ggrep -RPoin "{{[[:space:]]*'.+?'[[:space:]]*\|[[:space:]]*translate[[:space:]]*}}" 

	....
done

```

And it will work as intended.
