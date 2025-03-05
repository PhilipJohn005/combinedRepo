# Project Setup Guide

## Running the Login Server

To start the login server, follow these steps:

1. Start the backend server:
   ```sh
   node --loader ts-node/esm src/Backend/server.ts
   ```

2. Start the frontend:
   ```sh
   npm run dev
   ```

3. Expose the local server using `ngrok`:
   ```sh
   ngrok http <localhost-port>
   ```
   - Replace `<localhost-port>` with the port your server is running on.
   - Copy the generated `ngrok` URL and set it as the domain of the bot.

4. Open the bot's URL in a web browser.

## Running the Webhook

To set up and run the webhook, follow these steps:

1. Navigate to the functions directory:
   ```sh
   cd functions
   ```

2. Compile the functions to generate `index.js` in the `lib` folder:
   ```sh
   npm run build
   ```

3. Move back to the root directory and start Firebase emulators:
   ```sh
   cd ..
   firebase emulators:start
   ```
   - This should run on port `5001`.

4. Expose the webhook endpoint using `ngrok`:
   ```sh
   ngrok http 5001
   ```
   - Copy the generated `ngrok` URL.

5. Attach the webhook to the Telegram bot:
   ```sh
   Invoke-WebRequest -Uri "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<NGROK_URL>/crypto-cb142/us-central1/telegramWebhook" -Method Post
   ```
   - Replace `<YOUR_BOT_TOKEN>` with your actual bot token.
   - Replace `<NGROK_URL>` with the generated `ngrok` URL.

6. Send a message to the bot to test the webhook.

## Sending a Message via Python Script

To send a message using the Python script:

1. Navigate to the `functions/src` directory:
   ```sh
   cd functions/src
   ```

2. Run the Python script:
   ```sh
   python pythonscript.py
   ```

This completes the setup and execution process for both login and webhook functionality.

