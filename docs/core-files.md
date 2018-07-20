CORE OBJECTS
============

The core system of juci is very small. In fact, it is there basically to provide a simple startup code and to bind all other parts together. JUCI is built almost entirely using angular.js and all components are tied together mostly through angular. The core codebase merely provides ways for juci to make RPC calls to the backend and manipulate configuration settings in UCI. The core is located in /juci/src/js/ folder of the source tree.

JUCI is built in such a way that almost every file that exists in juci environment overrides something or extends already existing objects with methods and properties. Usually this is done to angular by adding controllers, directives and factories. But it is also a standard way of extending other parts of the system.

# juci/src/js/app.js

This file takes care of registering angular.run(2) callbacks which will setup the angular application and configure default settings. All run() callbacks will run each time the application is loaded - and configure() callbacks will run before all run callbacks.

# juci/src/js/compat.js

This is the browser compatibility layer for JUCI. It implements methods like Object.assign and Array.find which may not be present in some browsers.

# juci/src/js/config.js

This module contains some key information about the mashin JUCI is running on, including the entire juci config file and the output of the ubus call: "router.system info".

# juci/src/js/events.js

This is the event handler. It facilitates subscription and triggering event callbacks.

# juci/src/js/juci.js

This is main juci library file that is supposed to initialize UCI and UBUS modules. This file supports being loaded standalone for initializing juci library and for running juci UBUS and UCI api inside for example node.js.

# juci/src/js/localStorage.js

JUCI wrapper for localStorage in browser and simulation of localStorage if it is not implemented.

# juci/src/js/navigation.js

This file implements menu navigation model in juci.

# juci/src/js/rpc.js

This library provides interface to ubus RPC on the server.

# juci/src/js/timeout.js

Timeout system for implementing timeouts and intervals of limited lifespan that only live until next page is loaded.

# juci/src/js/tr.js

JUCI language and translation system. This is really just a simple wrapper to make using gettext more convenient.

# juci/src/js/uci.js

JUCI UCI is a JSON structure that maps towards the UCI configurations of the server. It facilitates get/set for each option and a simple way of getting all pending changes it also limits the number of RPC calls by caching the config and only reloading when necessary.
