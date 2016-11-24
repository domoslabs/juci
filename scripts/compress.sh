#!/bin/sh
BIN=$1
[ -z $BIN ] && BIN=bin
for file in $(find ${BIN} -type f | grep -v "\.gz" | grep "/www/"); do
	gzip -f ${file}
done
