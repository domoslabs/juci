#!/bin/bash

apt_packages="npm nodejs yui-compressor"
needed=""

for pkg in $apt_packages; do
	if ! dpkg -s $pkg >/dev/null 2>/dev/null; then
		needed="$needed $pkg"
	fi
done

if [ -n "$needed" ]; then
	echo "Need to install dpkg packages [$needed]"
	read -p "Do you approve installation of these packages (y/n): " ans
	if [ "$ans" == "y" ]; then
		sudo apt-get install $needed
	else
		echo "can't continue. aborting!"
		exit 1
	fi

	#less = compile less to css
	#mocha = javascript test framework
	#npm = NPM
	#uglify-js = compressing javascript files
	npm_package="less mocha npm uglify-js"
	needed=""

	# Filter out already installed packages 
	for pkg in $npm_package; do
		if ! npm list -g $pkg >/dev/null 2>/dev/null; then
			needed="$needed $pkg"
		fi
	done

	# install needed packages
	if [ -n "$needed" ]; then
		echo "Need to install npm package $needed"
		for pkg in $needed; do
			sudo npm install -g $pkg
		done
	fi

	sudo chown -R $USER:$USER /home/$USER/.npm/
fi
