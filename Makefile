DIRS-y:=juci 
PLUGINS-y:=plugins

BIN:=bin

BACKEND_BIN_DIR:=$(BIN)/usr/libexec/rpcd/
CODE_DIR:=$(BIN)/www/js
CSS_DIR:=$(BIN)/www/css
TMP_DIR:=tmp
TARGETS:=
PHONY:=debug release clean prepare node_modules 
CP:=cp -Rp 
Q:=@
INSTALL_DIR:=mkdir -p

all: release

-include Makefile.local

define Plugin/Default
	CODE_LOAD:=
	JAVASCRIPT-y:=
	TEMPLATES-y:=
	STYLES-y:=
endef 

define BuildDir-y 
	$(eval BIN:=$(if $(local),bin,bin/$(1)))
	$(eval $(call Plugin/Default))
	$(eval BACKEND_BIN_DIR:=$(BIN)/usr/libexec/rpcd)
	$(eval CODE_DIR:=$(BIN)/www/$(if $(3),$(3),js))
	$(eval PO-y:=po/*.po)
	$(eval JAVASCRIPT-y:=src/*.js src/pages/*.js src/widgets/*.js src/widgets/*/*.js)
	$(eval TEMPLATES-y:=src/widgets/*.html src/pages/*.html src/widgets/*/*.html)
	$(eval STYLES-y:=src/css/*.css)
	$(eval STYLES_LESS-y:=src/css/*.less)
	$(eval PLUGIN_DIR:=$(2))
	$(eval PLUGIN:=$(1))
	$(eval -include $(PLUGIN_DIR)/Makefile)
	$(eval $(Plugin/$(1)))
	$(eval TARGETS+=$(PLUGIN)-install)
	$(eval JAVASCRIPT_$(PLUGIN):=$(wildcard $(addprefix $(PLUGIN_DIR)/,$(JAVASCRIPT-y))))
	$(eval TEMPLATES_$(PLUGIN):=$(wildcard $(addprefix $(PLUGIN_DIR)/,$(TEMPLATES-y))))
	$(eval STYLES_$(PLUGIN):=$(wildcard $(addprefix $(PLUGIN_DIR)/,$(STYLES-y))))
	$(eval STYLES_LESS_$(PLUGIN):=$(wildcard $(addprefix $(PLUGIN_DIR)/,$(STYLES_LESS-y))))
	$(eval PO_$(PLUGIN):=$(wildcard $(addprefix $(PLUGIN_DIR)/,$(PO-y))))
	PHONY += $(PLUGIN)-install
	# ex. tmp/50-my-awesome-plugin.js: first_file.js second_file.js first_po_file.po ...
$(TMP_DIR)/$(if $(CODE_LOAD),$(CODE_LOAD)-,)$(PLUGIN).js: $(JAVASCRIPT_$(PLUGIN)) $(PO_$(PLUGIN))
	@echo -e "\033[0;33m[JS]\t$(PLUGIN) -> $$@\033[m"
	@echo "" > $$@
	$(Q)if [ "" != "$(JAVASCRIPT_$(PLUGIN))" ]; then for file in $(JAVASCRIPT_$(PLUGIN)); do cat $$$$file >> $$@; echo "" >> $$@; done; fi
	$(Q)if [ "" != "$(PO_$(PLUGIN))" ]; then ./scripts/po2js $(PO_$(PLUGIN)) >> $$@; echo "" >> $$@; fi
$(TMP_DIR)/$(PLUGIN).css: $(STYLES_$(PLUGIN)) $(TMP_DIR)/$(PLUGIN)-compiled-styles.css
	@echo -e "\033[0;33m[CSS]\t$(PLUGIN) -> $$@\033[m"
	@echo "" > $$@
	$(Q)if [ "" != "$$^" ]; then for file in $$^; do cat $$$$file >> $$@; echo "" >> $$@; done; fi
$(TMP_DIR)/$(PLUGIN).css.js: $(TMP_DIR)/$(PLUGIN).css
	$(Q)./scripts/css-to-js $$^
$(TMP_DIR)/$(PLUGIN)-compiled-styles.css: $(STYLES_LESS_$(PLUGIN))
	@echo -e "\033[033m[LESS]\t$(PLUGIN) -> $$@\033[m"
	@echo "" > $$@
	$(Q)if [ "" != "$$^" ]; then for file in $$^; do lessc $$$$file >> $$@; echo "" >> $$@; done; fi
$(TMP_DIR)/$(PLUGIN).tpl.js: $(TEMPLATES_$(PLUGIN))
	@echo -e "\033[0;33m[HTML]\t$(PLUGIN) -> $$@\033[m"
	@echo "" > $$@
	$(Q)if [ "" != "$$^" ]; then ./scripts/juci-build-tpl-cache $$^ $$@; fi
$(PLUGIN_DIR)/po/template.pot: $(JAVASCRIPT_$(PLUGIN)) $(TEMPLATES_$(PLUGIN))
	@echo -e "\033[0;33m[POT]\t$(PLUGIN) -> $$@\033[m"
	$(Q)$(INSTALL_DIR) "$$(dir $$@)"
	@echo "" > $$@
	$(Q)if [ "" != "$$^" ]; then ./scripts/extract-strings $$^ > $$@; msguniq $$@ > $$@.tmp; mv $$@.tmp $$@; fi
	@echo "" >> $$@
	@for file in `find $(PLUGIN_DIR)/src/pages/ -name "*.html"`; do PAGE=$$$${file%%.*}; echo -e "# $$$$file \nmsgid \"menu-$$$$(basename $$$$PAGE)-title\"\nmsgstr \"\"\n" >> $$@; done
$(CODE_DIR)/$(if $(CODE_LOAD),$(CODE_LOAD)-,)$(PLUGIN).js: $(TMP_DIR)/$(if $(CODE_LOAD),$(CODE_LOAD)-,)$(PLUGIN).js $(TMP_DIR)/$(PLUGIN).css.js $(TMP_DIR)/$(PLUGIN).tpl.js
	$(Q)$(INSTALL_DIR) "$$(dir $$@)"
	$(Q)cat $$^ > $$@
$(PLUGIN)-install: $(PLUGIN_DIR)/po/template.pot $(CODE_DIR)/$(if $(CODE_LOAD),$(CODE_LOAD)-,)$(PLUGIN).js
	$(call Plugin/$(PLUGIN)/install,$(BIN))
	$(Q)if [ -d $(PLUGIN_DIR)/ubus ]; then mkdir -p $(BACKEND_BIN_DIR); $(CP) $(PLUGIN_DIR)/ubus/* $(BACKEND_BIN_DIR); chmod +x $(BACKEND_BIN_DIR)/*; fi
	$(Q)if [ -f $(PLUGIN_DIR)/menu.json ]; then mkdir -p $(BIN)/usr/share/rpcd/menu.d; $(CP) $(PLUGIN_DIR)/menu.json $(BIN)/usr/share/rpcd/menu.d/$(PLUGIN).json; fi
	$(Q)if [ -f $(PLUGIN_DIR)/access.json ]; then mkdir -p $(BIN)/usr/share/rpcd/acl.d; $(CP) $(PLUGIN_DIR)/access.json $(BIN)/usr/share/rpcd/acl.d/$(PLUGIN).json; fi
endef

ifeq ($(local),true)
$(eval $(call BuildDir-$(CONFIG_PACKAGE_juci),juci,$(CURDIR)/juci/))
$(foreach th,$(wildcard plugins/*),$(eval $(call BuildDir-$(CONFIG_PACKAGE_$(notdir $(th))),$(notdir $(th)),$(th))))
$(foreach th,$(wildcard themes/*),$(eval $(call BuildDir-$(CONFIG_PACKAGE_$(notdir $(th))),$(notdir $(th)),$(th),themes)))
else
ifneq ($(THEME_PATH),)
$(foreach th,$(wildcard $(THEME_PATH)*),$(eval $(call BuildDir-y,$(notdir $(th)),$(th),themes)))
endif
$(foreach th,$(wildcard themes/*),$(eval $(call BuildDir-y,$(notdir $(th)),$(th),themes)))
$(foreach pl,$(wildcard plugins/*),$(eval $(call BuildDir-y,$(notdir $(pl)),$(pl))))
$(eval $(call BuildDir-y,juci,$(CURDIR)/juci/))
endif


export CC:=$(CC)
export CFLAGS:=$(CFLAGS)

ifeq ($(DESTDIR),)
	DESTDIR:=/
endif

.cleaned: Makefile Makefile.local
	@make clean 
	@touch .cleaned

Makefile.local: ;

JSLINT_FILES:=$(wildcard $(PLUGINS-y)/**/src/widgets/*.js $(PLUGINS-y)/**/src/pages/*.js)

prepare: .cleaned	
	@echo "======= JUCI CONFIG ========="
	@echo "TARGETS: $(TARGETS)"
	@echo "DIRS: $(DIRS-y)"
	@./scripts/bootstrap.sh
	$(Q)$(INSTALL_DIR) $(TMP_DIR)
	$(Q)$(INSTALL_DIR) $(BIN)/www/js/
	$(Q)$(INSTALL_DIR) $(BIN)/www/themes/
	$(Q)$(INSTALL_DIR) $(BIN)/www/css/
	$(Q)$(INSTALL_DIR) $(BIN)/sbin/
	$(Q)$(INSTALL_DIR) $(BIN)/usr/bin/
	$(Q)$(INSTALL_DIR) $(BIN)/usr/share/rpcd/menu.d/
	$(Q)$(INSTALL_DIR) $(BIN)/usr/share/rpcd/acl.d/
	$(Q)$(INSTALL_DIR) $(BACKEND_BIN_DIR)
	
node_modules: package.json
	npm install --production

release: prepare node_modules $(TARGETS)
	@echo "======= JUCI RELEASE =========="
	@./scripts/juci-compile
	@cp scripts/juci-update $(BIN)/usr/bin/

debug: prepare node_modules $(TARGETS)
	@echo "======= JUCI DEBUG =========="
	@echo -e "\033[0;33m [GRUNT] $@ \033[m"
	@echo -e "\033[0;33m [UPDATE] $@ \033[m"
	@./scripts/juci-update $(BIN)/www DEBUG
	@cp scripts/juci-update $(BIN)/usr/bin/
	@rm -rf $(BIN)/www/themes/theme.js
	@if [ -f $(BIN)/www/themes/juci-theme-inteno.js ]; then ln -s juci-theme-inteno.js $(BIN)/www/themes/theme.js; fi

DOCS_MD:= README.md $(wildcard juci/docs/*.md docs/*.md $(PLUGINS-y)/**/docs/*.md) docs/juci.md
DOCS_HTML:= $(patsubst %.md,%.html,$(DOCS_MD)) docs/juci.html
PHONY+=docs  
docs: $(DOCS_HTML) 
	@echo -e "\033[0;33m [DOCS] $@ $^ \033[m"
	$(Q)$(INSTALL_DIR) manual/js
	$(Q)$(INSTALL_DIR) manual/css
	@cp juci/src/lib/js/bootstrap.min.js manual/js/
	@cp juci/src/lib/css/bootstrap.min.css manual/css/
	@# remove juci generated md file 
	@rm -f docs/juci.md

docs/juci.md: $(wildcard $(PLUGINS-y)/**/docs/*.md)
	@# for md in $^; do sed -i "/%PLUGINS_TOC%/a [$$(head -n 1 $$md)]($$(basename $${md%.md}))" docs/juci.md; done
	@./scripts/build_docs .

%.html: %.md 
	@echo -e "\033[0;33m[DOC]: $^\033[m"
	$(Q)$(INSTALL_DIR) manual
	@ronn --pipe -f $^ > docs/.tmp.ronn
	@cp docs/page.html.tpl docs/.tmp
	@sed -i -e '/%CONTENT%/r docs/.tmp.ronn' -e 's///' docs/.tmp
	@mv docs/.tmp $(addprefix manual/,$(notdir $@)) 
	@rm -f docs/.tmp.ronn

install: 
	$(INSTALL_DIR) $(BIN)/usr/bin/
	@cp scripts/juci-update $(BIN)/usr/bin/

.PHONY: $(PHONY)

clean: 
	rm -rf ./bin ./tmp ./node_modules
