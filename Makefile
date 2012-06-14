download-selenium:
	@echo "Downloading Selenium RC"
	@curl -O "http://selenium.googlecode.com/files/selenium-server-standalone-2.15.0.jar"

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

