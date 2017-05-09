#!/bin/bash

usage() {
	echo -e "usage: $0 <path> <language/all>\n"
	echo -e "\texample: $0 /dir/to/juci/ fi"
	exit
}

if [ $# -eq 0 ]; then
	usage
fi

path="$1"
lang="$2"

update() {
	local language=$1
	for file in `find "$path" -name "${language}.po"`; do
		potfile="`dirname $file`/template.pot"
		if [ ! -f "$potfile" ]; then
			echo "Warning missing template.pot file $potfile"
		else
			echo "processing $file"
			msgmerge --update -q $file "$potfile"
		fi
	done
}

[ -d "$1" ] || usage

if [ "$lang" == "all" -o "$lang" == "All" -o "$lang" == "ALL" ]; then
	# update all po files
	for lang in `find . -name '[a-z][a-z].po' -printf "%f\n" | sort -u | grep -o '^[a-z][a-z]'`; do
		update "$lang"
	done
else
	update "$lang"
fi
