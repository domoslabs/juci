define Plugin/juci

	CODE_LOAD:=01

	STYLES-y:=
	STYLES-y+=src/lib/css/abn_tree.css
	STYLES-y+=src/lib/css/angular-ui-switch.min.css
	STYLES-y+=src/lib/css/angular-ui.min.css
	STYLES-y+=src/lib/css/awesome-bootstrap-checkbox.css
	STYLES-y+=src/lib/css/bootstrap-select.min.css
	STYLES-y+=src/lib/css/bootstrap.min.css
	STYLES-y+=src/lib/css/dropdown-multi-select.css
	STYLES-y+=src/lib/css/font-awesome.min.css
	STYLES-y+=src/lib/css/ionicons.min.css
	STYLES-y+=src/lib/css/ng-tags-input.css
	STYLES-y+=src/lib/css/ng-tags-input.bootstrap.css
	STYLES-y+=src/lib/css/nga.min.css
	STYLES-y+=src/lib/css/normalize.css
	STYLES-y+=src/lib/css/select.min.css
	STYLES-y+=src/lib/css/vis.min.css
	
	JAVASCRIPT-y:=
	JAVASCRIPT-y+=src/lib/js/async.js
	JAVASCRIPT-y+=src/lib/js/vis.js
	JAVASCRIPT-y+=src/lib/js/js-schema.min.js
	JAVASCRIPT-y+=src/lib/js/require.js
	JAVASCRIPT-y+=src/lib/js/jquery.min.js
	JAVASCRIPT-y+=src/lib/js/cytoscape.min.js
	JAVASCRIPT-y+=src/lib/js/bootstrap.min.js
	JAVASCRIPT-y+=src/lib/js/angular.min.js
	JAVASCRIPT-y+=src/lib/js/angular-ui.min.js
	JAVASCRIPT-y+=src/lib/js/angular-ui-router.js
	JAVASCRIPT-y+=src/lib/js/angular-gettext.min.js
	JAVASCRIPT-y+=src/lib/js/angular-prompt.js
	JAVASCRIPT-y+=src/lib/js/bootstrap-select.min.js
	JAVASCRIPT-y+=src/lib/js/abn_tree_directive.js
	JAVASCRIPT-y+=src/lib/js/select.min.js
	JAVASCRIPT-y+=src/lib/js/angular-animate.min.js
	JAVASCRIPT-y+=src/lib/js/angular-drag-and-drop-lists.js
	JAVASCRIPT-y+=src/lib/js/angular-ui-bootstrap-juci.min.js
	JAVASCRIPT-y+=src/lib/js/jquery-jsonrpc.js
	JAVASCRIPT-y+=src/lib/js/angular-ui-switch.min.js
	JAVASCRIPT-y+=src/lib/js/angular-modal-service.min.js
	JAVASCRIPT-y+=src/lib/js/angular-checklist-model.js
	JAVASCRIPT-y+=src/lib/js/dropdown-multi-select.js
	JAVASCRIPT-y+=src/lib/js/ng-tags-input.js

	JAVASCRIPT-y+=src/js/compat.js
	JAVASCRIPT-y+=src/js/rpc.js
	JAVASCRIPT-y+=src/js/uci.js
	JAVASCRIPT-y+=src/js/juci.js
	JAVASCRIPT-y+=src/js/app.js
	JAVASCRIPT-y+=src/js/localStorage.js
	JAVASCRIPT-y+=src/js/config.js
	JAVASCRIPT-y+=src/js/navigation.js
	JAVASCRIPT-y+=src/js/status.js
	JAVASCRIPT-y+=src/js/events.js
	JAVASCRIPT-y+=src/js/tr.js
	JAVASCRIPT-y+=src/js/theme.js
	JAVASCRIPT-y+=src/js/timeout.js
	JAVASCRIPT-y+=src/factories/*.js
	JAVASCRIPT-y+=src/widgets/*.js
	JAVASCRIPT-y+=src/pages/*.js
endef

define Plugin/juci/install
	$(Q)$(INSTALL_DIR) $(1)/www/
	$(Q)$(CP) $(PLUGIN_DIR)/src/favicon.ico $(1)/www/
	$(Q)$(CP) $(PLUGIN_DIR)/src/img/ $(1)/www/
	$(Q)$(CP) $(PLUGIN_DIR)/src/fonts/ $(1)/www/
	$(Q)$(CP) $(PLUGIN_DIR)/src/lib/fonts/ $(1)/www/
	$(Q)$(CP) $(PLUGIN_DIR)/reboot.html $(1)/www/	
	$(Q)$(CP) $(PLUGIN_DIR)/initfail.html $(1)/www/	
endef
