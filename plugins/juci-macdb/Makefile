define Plugin/juci-macdb/install 
	$(Q)$(INSTALL_DIR) $(1)/usr/share/macdb/
	$(Q)$(INSTALL_DIR) $(1)/usr/bin/
	$(Q)$(CP) $(PLUGIN_DIR)/src/macdb.txt $(1)/usr/share/macdb/db.txt
	$(Q)$(CP) $(PLUGIN_DIR)/src/maclookup $(1)/usr/bin
endef 	
