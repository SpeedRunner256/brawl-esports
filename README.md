# Brawl stars eSports bot

To install dependencies:

```bash
bun install
```

You can probably use node too but I haven't tried it yet.
...or whatever package manager you use.

To get it working, firstly, make a .env file and put the following:-

```dotenv
DISCORD_TOKEN
CLIENT_ID
GUILD_TOKEN
LIQUID_TOKEN
```

1. To get a discord token, follow any tutorial online - there are hundreds.
2. Paste the bot's ID as client id and the guild you want the bot to be in as your Guild id.
3. To get a liquipedia token, go to their discord server, see #api-help, and fill the form on the first pinned message. Wait for them to accept and then enter your API key here.

Secondly, make a folder named "db" and in it add these files.

```bash
mkdir db
cd ./db
touch brawler.json map.json match.json player.json team.json
```

Thirdly, register the commands to your server using

```bash
bun register
```

Now, if there are any errors, contact me lmao idk.
