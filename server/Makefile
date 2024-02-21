SRCS=$(find src public -type f)

build-prod: node_modules
	npx nest build --builder=webpack
	$(MAKE) dist/node_modules

build-dev: node_modules ${SRCS}
	npx nest build

dist/node_modules: node_modules package.json package-lock.json
	mv node_modules node_modules_all
	NODE_ENV=production npm ci # Production node_modules - remove dev dependencies
	mv node_modules dist/node_modules
	mv node_modules_all node_modules

node_modules: package.json package-lock.json
	npm ci

clean:
	rm -rf dist node_modules
