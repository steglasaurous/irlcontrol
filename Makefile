build-dev:
	$(MAKE) -C server build-dev
	$(MAKE) -C client build-dev

build-prod:
	$(MAKE) -C server build-prod
	$(MAKE) -C client build-prod

# For dev builds, this puts together environment configs based on the dists and .env vars.
# This requires envsubst to be available to work correctly.
server/config.json: server/config.json.dist
	export $$(cat .env | grep "^[^#]" | xargs) && envsubst < server/config.json.dist > server/config.json

clean:
	$(MAKE) -C server clean
	$(MAKE) -C client clean
