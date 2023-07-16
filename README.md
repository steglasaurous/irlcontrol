# IRL Control

This is an assembly of server components and tools to enable IRL streaming to OBS.

It consists of:

- SLS - an SRT relay that can receive and relay an SRT stream to OBS. It also offers stats to monitor the health of the
  stream.
- NOALBS - A system that monitors the health of the SRT stream and will change OBS scenes as needed for low-bitrate and
  offline states.
- irlcontrol - An SRT monitor and twitch chat tool that can be used on a mobile device to show stream status and chat,
  with alerts when the stream is in a low bitrate situation or offline.
- RTMP - Optionally, a configuration for an RTMP server to serve a similar function as SRT - just using the older RTMP
  protocol. Useful for devices that will only send using RTMP like the GoPro.

## QuickStart

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) on the machine you wish to run the server
   on.
2. Copy settings.env.dist to settings.env
3. Edit settings.env with a text editor to add values appropriate for you.
4. In a terminal (ex: Windows Terminal), run the following command to start the system with defaults:

```bash 
docker compose up -d
```

This will start an SRT server on port 30000, and the irl control tool on port 443 and 80 (regular webserver port).
Please note that you'll also need to open these ports in your firewall for it to be able to receive video and requests
outside your local network. This varies widely from internet provider to router manufacturer. In short, usually look
for a setting on your router like "Port Forwarding" and open "30000", "443" and "80" to the machine on your network
running this server.

# Setting up your cameras and OBS

Although you can use any app that uses SRT to send and receive streams, for my IRL streams I use [Larix Broadcaster](https://softvelum.com/larix/)
with my iPhone 14, and on an older iPhone I use the irlcontrol monitor in my web browser to monitor the stream and twitch chat,
along with an audio stream playing from my machine at home, so I can hear OBS noises, TTS and background music.

Here's how I set things up for myself.

I'll assume that you've installed irlcontrol as per the quickstart above.

## Phone Setup - Main Camera
On your phone you'll use for your main camera: 

1. Install Larix Broadcaster.
2. Open Larix Broadcaster, tap on the settings gear in the upper right corner.
3. Tap "Connections"
4. Tap the "+" in the upper right corner to add a new connection.  Use the following settings:
   5. Name: Whatever makes sense to you, like 'home' or 'main cam'
   6. URL: srt://123.123.123.123.nip.io:30000 - Replace "123.123.123.123" with your actual IP address running irlcontrol
   7. Latency: 1000 - This setting works for me, but you can adjust up or down as needed. (higher = more stable but more delay)
   8. streamid: public/live/feed1
9. Tap "Save" to save the connection
10. When returning to the connections list, make sure your new connection has a checkmark on it.  You can tap on the connection to enable/disable it. 

At this point, you can start streaming with defaults, however see below for settings I use and what tweaks help for video quality.

## OBS Setup

To show the stream coming from your phone in OBS:

1. Create a new Media Source.
2. Use the following settings:
   3. Un-check "Local file"
   4. Check "Restart playback when source becomes active"
   5. Network buffering: 0MB
   6. Input: srt://localhost:30000?streamid=play/live/feed1
   7. Input format: mpegts
   8. Reconnect Delay: 3s
   9. Check "Show nothing when playback ends"
   10. All other settings are fine at their defaults.
11. Press OK

Now to test, on your phone, start the stream by hitting the circle button.  After about 3-5 seconds, you should see your stream show in OBS!

## Using the irlcontrol monitor

To see your stream status and chat in one screen, open your spare phone's web browser and goto your IP address with `.nip.io` at the end. 
Ex: `https://123.123.123.123.nip.io`.  You should then see video status and your twitch chat shown.  Note that the site will make
noise when your stream is in low bitrate or offline states, and when it comes back into a good state.  

## Hearing audio in your headphones from stream

This can get complicated depending on how complex your stream setup is, but there are some more straight forward ways of 
getting the audio coming from OBS and other tools (ex: a TTS app like Speaker.bot) back to you so you can interact with 
your stream more easily.  Here's what I use.  

### Use Virtual Audio Cable and Discord



## Larix Broadcaster Video Settings I Use

For video settings in Larix Broadcaster, this can vary depending on what kind of quality you want and how much data you want to use.  
I'll share what I use.  You can find these settings in "Video" under the main settings menu.

- Resolution: 1920x1080
- Frame rate: 30fps
- Stabilization Mode: Auto
- Bitrate: 8000kbps - Note this is somewhat high and can chew through data (around 3.6GB per hour), but the resulting video looks quite good.  The default is 2000kbps (0.9GB per hour) - I find you tend to get noticeable artifacting happening at this level.
- Format: HEVC - Note recently Larix decided to charge for features like HEVC encoding. The default H.264 still works, it's just less efficient in crunching down the video data. (HEVC typically gets 30% smaller for the same level of quality)
- Adaptive Bitrate Streaming - Mode: Hybrid - This is how the encoder will adapt to bad network conditions, reducing the bitrate to 25% of what you set if network conditions are bad, then raise it up over time to restore the original target bitrate.
- Audio settings I've generally left as-is, using a Mono audio channel (which is my LAV mic I wear), 128kbps bitrate
- Advanced:
  - Unsent threshold: Never - I HIGHLY recommend setting this to never, especially if you want to keep any other additional video feeds in sync.  With this turned on, it will buffer up to the given amount of video when it reconnects after a disconnection, which introduces up to that amount of additional delay to your stream.  


# Development

Info below here is useful if you'd like to contribute to the code base.

IRL Control has a nestjs-based server using socket.io as the websocket gateway, and an Angular-based client to render
the frontend.

## Setup

Create configuration file based on config.dist.json.

NPM install all the things

```
cd server && npm i && cd ..
cd client && npm i && cd ..
```

Starting the server:

```
cd server
npm run start
```

Starting the client (development):

```
cd client
npx ng serve
```

# Todo

- [x] Setup chat component so it scrolls (+scroll to latest)
- [x] Add sounds for low bitrate/rtt, return to normal and disconnect
- [ ] Add notification/sound for disconnection from websocket server
- [ ] Add distance & speed from RTIRL
- [ ] Reduce size of charts, ideally put behind the current numbers for bitrate, etc
- [ ] Add Streamdeck buttons (or at least triggers for actions?)
- [ ] Add 'raid' button to 'easy-raid' :)

# Packaging for release

- [ ] SLS: Allow config for passworded connections
- [ ] Move code base to github (clean out PII first)

