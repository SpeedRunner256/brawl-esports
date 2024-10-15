# Brawl stars eSports bot

## What is it?

This is just a small and simple discord bot to get eSports information (via
liquipediadb API) and brawlers info through the brawlify API.

## Installation & Configuration

To install dependencies:

```bash
deno install
```

Node AND Bun will not work without some rewriting - like the jsr imports or
"file://" in the main file.

To get the bot working, just open the powershell or bash script
(setup.ps1/setup.sh) depending on which side of the universe you belong to.

1. To get a discord token, follow any tutorial online - there are hundreds.
2. Paste the bot's ID as client id and the guild you want the bot to be in as
   your Guild id.
3. To get a liquipedia token, go to their discord server, see #api-help, and
   fill the form on the first pinned message. Wait for them to accept and then
   enter your API key here.

Finally, get the bot in a server (you already did this by getting a guild ID),
and register the commands to your server.

```bash
deno run register
```

Now, turn the bot on (deno run bot) and in any chat type out /configure and fill
it in, without it the bot won't _really_ work.
