# Github Issue Resolver Discord Bot

This Discord bot is designed to integrate with Github issues and Discord channels. It allows users to post Github issue URLs in Discord channels and then automatically post a comment on the corresponding Github issue with a link to the Discord channel thread. 

Additionally, when a Github issue is marked as solved, it will post a message in the corresponding Discord channel indicating that the issue has been resolved.

## Installation

To use this bot, you'll need to create a Discord bot and a Github personal access token.

1. Install the dependencies: `yarn install`
2. Copy the `.env.example` file to `.env` and fill in the required variables (see below).
3. Run the bot: `yarn start`

## Configuration

The bot requires the following environment variables to be set:

`DISCORD_TOKEN`: Your Discord bot token.
`DISCORD_WEBHOOK_URL`: The URL of the Discord webhook to post messages to.
`GITHUB_TOKEN`: Your Github personal access token.

## Usage

To use the bot, simply post a Github issue URL in a Discord channel where the bot is present with the following command:

```
!link <issue_url>
```

If the URL is valid, the bot will automatically post a comment on the corresponding Github issue or pull request with a link to the Discord channel thread. When a Github pull request is merged, the bot will post a message in the corresponding Discord channel indicating that the issue has been resolved.

## Limitations

This bot currently only supports commenting on Github pull requests and not issues or other Github features like discussions. Additionally, the bot requires users to have a specific role ("@maintainer") in order to post Github issue URLs in Discord channels.