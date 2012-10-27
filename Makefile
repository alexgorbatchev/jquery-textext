PATH := "/Applications/Firefox.app/Contents/MacOS":$(PATH)

selenium:
	@echo "Starting Selenium RC server"
	@cd tests && java -jar selenium-server-standalone-2.15.0.jar -firefoxProfileTemplate "./firefox_profile"

download-selenium:
	@echo "Downloading Selenium RC"
	@cd tests && curl -O "http://selenium.googlecode.com/files/selenium-server-standalone-2.15.0.jar"

install-textext:
	@echo "Installing TextExt.js dependencies"
	@git submodule init
	@git submodule update
	@npm install

install:
	@echo "Installing dependencies for jQuery TextExt.js plugin"
	@make install-textext
	@make download-selenium
	@echo "Success"

