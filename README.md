# IRL Control

This is an assembly of server components and tools to enable IRL streaming to OBS.  

It consists of:

- SLS - an SRT relay that can receive and relay an SRT stream to OBS.  It also offers stats to monitor the health of the stream.
- NOALBS - A system that monitors the health of the SRT stream and will change OBS scenes as needed for low-bitrate and offline states.
- irlcontrol - An SRT monitor and twitch chat tool that can be used on a mobile device to show stream status and chat, with alerts when the stream is in a low bitrate situation or offline. 
- RTMP - Optionally, a configuration for an RTMP server to serve a similar function as SRT - just using the older RTMP protocol.  Useful for devices that will only send using RTMP like the GoPro.

## QuickStart

1. Install docker desktop (or equivalent) on the machine you wish to run the server on.  
2. Copy settings.env.dist to settings.env
3. Edit settings.env with a text editor to add values appropriate for you.
4. In a terminal (ex: Windows Terminal), run the following command to start the system with defaults:

```bash 
docker compose up -d
```

This will start an SRT server on port 30000, and the irl control tool on port 3000.  Please note that you'll also need to 
open these ports in your firewall for it to be able to receive video and requests outside of your local network.  This
varies widely from internet provider to router manufacturer.  In short, usually look for a setting on your router like "Port Forwarding"
and open "30000" and "3000" to the machine on your network running this server.

# Development

Info below here is useful if you'd like to contribute to the code base.  

IRL Control has a nestjs-based server using socket.io as the websocket gateway, and an Angular-based client to render the frontend. 

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

