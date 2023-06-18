# NGINX RTMP server
How to build:

```
docker build -t steglasaurous/rtmp-server .
```

How to run it:

```
docker run \
-e "TWITCH_STREAM_KEY=abc123 TWITCH_CLIENT_ID=aaaaa TWITCH_CLIENT_SECRET=bbbb TWITCH_BROADCASTER_ID=123456789 YOUTUBE_STREAM_KEY=def234" \
--name rtmp \
-p 1935:1935 \
-p 8090:8090 \
-d steglasaurous/rtmp-server
```

```
 docker run --env-file=.env \
 --name rtmp \
 -p 1935:1935 \
 -p 8090:8090 \
 -d steglasaurous/rtmp-server
```

Env file should contain:

```
TWITCH_STREAM_KEY=abc123 
TWITCH_CLIENT_ID=aaaaa 
TWITCH_CLIENT_SECRET=bbbb 
TWITCH_BROADCASTER_ID=123456789 
YOUTUBE_STREAM_KEY=def234
```