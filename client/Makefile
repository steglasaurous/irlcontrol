SRCS=$(find src -type f)

build-dev: dist/client

build-prod: node_modules
	npx ng build -c production

node_modules: package.json package-lock.json
	npm ci

dist/client: node_modules
	npx ng build


clean:
	rm -rf .angular dist node_modules
