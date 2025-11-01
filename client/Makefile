ifeq ($(OS),Windows_NT)
	SHELL := powershell.exe
	.SHELLFLAGS := -NoProfile -Command
endif

SRCS=$(find src -type f)

build-dev: dist/client

build-prod: node_modules
	npx ng build -c production

node_modules: package.json package-lock.json
	npm ci

dist/client: node_modules
	npx ng build

start: node_modules
	npx ng serve

clean:
ifeq ($(OS),Windows_NT)
	& { exit $$(powershell.exe -NoProfile -Command Remove-Item -ErrorAction Ignore -Recurse dist); }
	& { exit $$(powershell.exe -NoProfile -Command Remove-Item -ErrorAction Ignore -Recurse node_modules); }
	& { exit $$(powershell.exe -NoProfile -Command Remove-Item -ErrorAction Ignore -Recurse .angular); }

else
	rm -rf dist node_modules
endif
