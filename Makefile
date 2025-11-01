build: build-dev

build-dev:
	$(MAKE) -C server build-dev
	$(MAKE) -C client build-dev

build-prod:
	$(MAKE) -C server build-prod
	$(MAKE) -C client build-prod

start-server:
	$(MAKE) -C server start

start-client:
	$(MAKE) -C client start

clean:
	$(MAKE) -C server clean
	$(MAKE) -C client clean

.PHONY: build build-dev build-prod clean
