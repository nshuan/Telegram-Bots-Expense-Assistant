# Telegram-Bots-Expense-Assistant

This project contains a Telegram bot for tracking expenses. It utilizes Google Apps Script to handle bot interactions and Google Sheets as a backend to store expense data.

## Constants Description
Replace these field with your information.

### `TOKEN`
- Description: Your telegram Bot API token.
- Usage: This token is used to authenticate requests to the Telegram Bot API.

### `BASE_URL`
- Description: Base URL for Telegram Bot API requests.
- Usage: This URL is used to construct API endpoints for sending requests to the Telegram Bot API.
  
### `chat_ID`
- Description: Default chat ID of the user or group where the bot sends messages when it can not get the chat id of the message sender.

### `DEPLOYED_URL`
- Description: URL of the deployed Google Apps Script web app.
- Usage: This URL is used as an endpoint for receiving incoming messages and processing bot commands.

### `NAME_SHEET`
- Description: Name of the Google Sheets sheet containing usernames. The first row in this sheet should always be the title.

### `SUM_ALL`
- Description: Cell address for the total sum of expenses.

### `USER_COL`
- Description: Column letter for the username column in the expense sheet.

### `DEBT_COL`
- Description: Column letter for the debt column in the expense sheet.

### `USER_ROW`
- Description: Row number for the starting row of username in the expense sheet.

### 'EXPENSE_COL'
- Description: Column letter for the expense column in the expense sheet.

### `EXPENSE_ROW`
- Description: Row number for the starting row of expense data in the expense sheet.

## Usage
To use this Telegram Expense Tracker Bot:

1. Set up a Google Sheets spreadsheet to store expense data. Sample sheet as the image in preview.png.
2. Replace the constants in the code with your own values.
3. Deploy the Google Apps Script web app using the provided code.
   - Replace TOKEN with your bot token.
   - Replace `chat_ID` with your desired default chat ID. You can get the chat ID where messages are sent by using `getChatId()` function. Remember to `deleteWebhook()` first.
   - Deploy.
   - Get the deploy url in the popup. Replace `DEPLOYED_URL` with your received url.
   - Run `setWebhook()`.
4. Interact with the bot in your Telegram chat to track expenses.

