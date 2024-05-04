To create a twitch_token.json so that EventSub events work in chat:

Using the twitch CLI, assuming it's been configured with the client id and secret:

```bash
twitch token -u --scopes "chat:read chat:edit channel:read:subscriptions moderator:read:followers bits:read channel:moderate channel:read:redemptions channel:read:polls channel:read:hype_train" 
```

It will return a user access token and a refresh token.  Create a twitch_token.json file with the following content:

```json

{
  "accessToken": "PASTE USER ACCESS TOKEN HERE",
  "refreshToken": "PASTE REFRESH TOKEN HERE",
  "scope": [
    "chat:read",
    "chat:edit",
    "channel:read:subscriptions",
    "moderator:read:followers",
    "bits:read",
    "channel:moderate",
    "channel:read:redemptions",
    "channel:read:polls",
    "channel:read:hype_train"
  ],
  "expiresIn": 0,
  "obtainmentTimestamp": 0
}
```
