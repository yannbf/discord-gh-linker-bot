import { Client, Message } from 'discord.js'
import { Octokit } from '@octokit/rest'

const client = new Client({
  intents: [
    'Guilds',
    'GuildMessages',
    'GuildMessageReactions',
    'GuildMessageTyping',
  ],
})

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

const GH_URL_REGEX =
  /https:\/\/github.com\/([^\/]+)\/([^\/]+)\/(issues|pull)\/(\d+)/
const BOT_COMMAND = '!link'

// For when a maintainer posts a command in Discord e.g. !link https://the-github-issue-url
client.on('message', async (message: Message) => {
  // Ignore messages sent by the bot or messages without any content
  if (message.author.bot || !message.content) {
    return
  }

  if (!message.content.startsWith(BOT_COMMAND)) return

  const maintainerRole = message.guild?.roles?.cache?.find(
    (role) => role.name === '@maintainer'
  )

  // Error if the bot is not activated by a maintainer
  if (maintainerRole && !message.member?.roles?.cache?.has(maintainerRole.id)) {
    message.reply('Sorry, I can only be used by maintainers!')
    return
  }

  // Check if the message contains a Github issue or pull request URL
  const match = message.content.match(GH_URL_REGEX)

  if (!match) {
    message.reply('Invalid GitHub issue or pull request URL provided!')
    return
  }

  // Get the link of the current Discord conversation/thread
  const conversationLink = message.url

  // In case we need to do extra checks for threads
  // const conversationLink = message.channel.isThread()
  //   ? message.channel.parent?.toString() + message.channel.toString()
  //   : message.channel.toString();

  // Post a new comment to the Github issue mentioning the conversation link
  const [owner, repo, _, issueNumber] = match.slice(1)
  const commentBody = `This issue is being discussed in Discord at ${conversationLink}`
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: parseInt(issueNumber),
    body: commentBody,
  })
})

// For when Github PRs are merged and this is triggered (Via Github Actions)
client.on('githubIssueSolved', async (issueUrl: string) => {
  // Check if the Github issue URL contains a valid issue number
  const match = issueUrl.match(GH_URL_REGEX)
  if (!match) {
    return
  }

  // Get the owner and repo of the Github issue
  const [owner, repo] = match.slice(1, 3)

  // Search for comments made by the bot that reference a Discord message link
  const comments = await octokit.issues.listCommentsForRepo({
    owner,
    repo,
    per_page: 100,
  })

  const discordComments = comments.data.filter((comment) => {
    return (
      comment.user?.login === process.env.DISCORD_BOT_USERNAME &&
      /Discord at .*/.test(comment.body!)
    )
  })

  // Post a message to the Discord thread for each matching comment
  for (const comment of discordComments) {
    const discordMessageLink = comment.body?.match(/Discord at (.*)/)?.[1]
    if (discordMessageLink) {
      const channel = await client.channels.fetch(discordMessageLink)
      if (channel?.isThread()) {
        const thread = await channel.fetch()
        await thread.send(`The linked issue ${issueUrl} has been solved!`)
      }
    }
  }
})

// Listen for the "ready" event
client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
})

// Log in to Discord
client.login(process.env.DISCORD_BOT_TOKEN)
