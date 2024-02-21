build-dev:
	$(MAKE) -C server build-dev
	$(MAKE) -C client build-dev

build-prod:
	$(MAKE) -C server build-prod
	$(MAKE) -C client build-prod

clean:
	$(MAKE) -C server clean
	$(MAKE) -C client clean
