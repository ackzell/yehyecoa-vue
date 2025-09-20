# yehyecoa-vue party-kit

This is the way we communicate real time updates between yehyecoa-vue instances.
The goal is to have updates not only instructor -> attendees, but to be able to create rooms that enable pair / group sessions for in-workshop exercises.

As of writing this update, the main job of this service is to provide the real time comms as a backend service, but note that there are client side files that can be deployed to Partykit and that can be leveraged to create a dashboard to determine active connections, create the rooms to pair people, start 1-1 sessions with attendees, etc.

# Original Readme:
## 🎈 party-kit

Welcome to the party, pal!

This is a [Partykit](https://partykit.io) project, which lets you create real-time collaborative applications with minimal coding effort.

[`server.ts`](./src/server.ts) is the server-side code, which is responsible for handling WebSocket events and HTTP requests. [`client.ts`](./src/client.ts) is the client-side code, which connects to the server and listens for events.

You can start developing by running `npm run dev` and opening [http://localhost:1999](http://localhost:1999) in your browser. When you're ready, you can deploy your application on to the PartyKit cloud with `npm run deploy`.

Refer to our docs for more information: https://github.com/partykit/partykit/blob/main/README.md. For more help, reach out to us on [Discord](https://discord.gg/g5uqHQJc3z), [GitHub](https://github.com/partykit/partykit), or [Twitter](https://twitter.com/partykit_io).
