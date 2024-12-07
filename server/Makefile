ifeq ($(OS),Windows_NT)
	SHELL := powershell.exe
	.SHELLFLAGS := -NoProfile -Command
endif

SRCS=$(find src public -type f)

build-prod: node_modules
	npx nest build --builder=webpack
	$(MAKE) dist/node_modules

build-dev: node_modules config.json ${SRCS}
	npx nest build

config.json: config.json.dist
	npx envsub --env-file=../.env config.json.dist config.json

dist/node_modules: node_modules package.json package-lock.json
ifeq ($(OS),Windows_NT)
	move node_modules node_modules_all
	NODE_ENV=production npm ci # Production node_modules - remove dev dependencies
	move node_modules dist/node_modules
	move node_modules_all node_modules
else
	mv node_modules node_modules_all
	NODE_ENV=production npm ci # Production node_modules - remove dev dependencies
	mv node_modules dist/node_modules
	mv node_modules_all node_modules
endif

node_modules: package.json package-lock.json
	npm ci

start: node_modules config.json
	npx nest start --watch

clean:
ifeq ($(OS),Windows_NT)
	& { exit $$(powershell.exe -NoProfile -Command Remove-Item -ErrorAction Ignore -Recurse dist); }
	& { exit $$(powershell.exe -NoProfile -Command Remove-Item -ErrorAction Ignore -Recurse node_modules); }
else
	rm -rf dist node_modules
endif
