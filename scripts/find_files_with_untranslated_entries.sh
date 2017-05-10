#!/bin/bash

usage() {
	echo -e "usage: $0 <directory> <language code>\n"
	echo -e "\texample: $0 /path/to/juci/ fi"
	exit
}

[ $# -eq 0 ] && usage

path="$1"
lang="$2"

[ -d "$path" ] || usage

for file in `find "$path" -name "${lang}.po"`; do
	if [ `msgattrib --untranslated $file | grep msgid | wc -l` -ne 0 ]; then
		echo "$file has untranslated entries"
	fi
done
