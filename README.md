# UFC DISCORD BOT

## What was my problem?

- One of the problems I was facing was that sometimes I ended up getting some emails from the systems or professors at my university in which it was often important and I ended up forgetting to read them.

- So as I use discord a lot and own a server of mine and some friends. So I thought, "Why not create a bot in discord that would send me these notifications?"

## How was it developed?

- The algorithm in theory is simple, basically the server should log into my email every 5 minutes, collect the emails based on the "unread" filter, received in the last 24 hours and also based on the email domains of my university.

- I had to use the simple-imap library where she is responsible for making the request with the imap protocol for my personal email (gmail)

  - Since his communication is basically via events and callbacks, I decided to focus on improving the architecture of the FetchMailService class to be able to fit in and when to end the request send an event called finished-read-messages and disconnect from the server.

- During development I saw that the imap e-mail request service does not listen when a new e-mail is delivered to the message box, so I decided to create the WatchMailService that is responsible for using fetchmailservice from time to time (specified), so by default in the implementation I left the search for new emails every 5 minutes.

- With virtually everything ready, it was enough to create a bot in discord and make the connection with it, it is very simple only has the functionality of sending emails to a specific channel.

- Thus, the WatchMailService class dependencies on DiscordService and FetchMailService, so whenever an email is read, the WatchMailService class the 'finish-read-messages' event sends the message to the discord service, which in turn sends it to my channel in the discord.

- I also tried to use TDD always performing unit tests while implementing the system.

- And finally, I'm using CI/CD to keep the code quality and avoid problems in production. The github actions of this repository run the tests whenever a pull request is made, so we can be assured that the functionality will not be broken and when the code goes to the main branch the deploy will be done automatically.

- Because it is a simple application with two processes I decided to deploy on heroku

## How to run?

- First step: Clone this repository
  ```bash
  git clone https://github.com/henricker/college-notification-discord
  ```
- Second: Create your bot in discord and add to your server.
- Thrid: Create a .env file and add its variables.
- Four: Crie o container com o docker
  ```bash
  docker-compose up -d
  ```
