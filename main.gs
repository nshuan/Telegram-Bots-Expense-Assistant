// Constants

var chat_ID = 'DEFAULT-CHAT-ID'; // if the bot can not find chat id, it will reply back to this chat
const TOKEN = `YOUR-TELEGRAM-BOT-TOKEN`;
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;
const DEPLOYED_URL = 'YOUR-DEPLOYED-URL';

const NAME_SHEET = 'Name sheet'
const SUM_ALL = 'K2';
const USER_COL = 'F';
const DEBT_COL = 'I';
const USER_ROW = 2;
const EXPENSE_COL = 'A';
const EXPENSE_ROW = 6;

const MONEY_BAG_EMOJI = '\uD83D\uDCB0';
const DOUBLE_EXCLAIMATION_EMOJI = '\u203C';
const EXCLAIMATION_EMOJI = '\u2757\uFE0F';

const IGNORE_CAPITAL = false;
const NUM_ROWS_SUBTABLE = 5;

const METHODS = {
  SEND_MESSAGE: 'sendMessage',
  SET_WEBHOOK: 'setWebhook',
  GET_UPDATES: 'getUpdates',
}
const MAX_DESCRIPTION_LEN = 25;
const COMMANDS = {
  HELP: {
    command: 'help',
    description: 'Provides command infors',
    full_des: "For more information on a specific command, type 'HELP [command]'",
    syntax: 'HELP [command]',
    param_des: 'command - displays help information on that command.'
  },
  SPEND: {
    command: 'spend',
    description: 'Add an expense',
    full_des: 'Add an expense',
    syntax: 'SPEND [username] [detail] [value]k',
    param_des: `
      username - user who spends for the expense,
      detail - expense of what?,
      value - paid how much?,
      k - money unit (just type 'k').
    `
  },
  ADD_MEM: {
    command: 'add',
    description: 'Add an user',
    full_des: 'Add new user, this command also updates formulas. New username should be unique and there must not be 2 same usernames in the sheet.',
    syntax: 'ADD [username]',
    param_des: 'username - name of the new user.'
  },
  FIND_MEM: {
    command: 'find',
    description: 'Find an user',
    full_des: 'Find and user that exists in the sheet. This command also show detailed information of this user.',
    syntax: 'FIND [username]',
    param_des: 'username - name of user to find.'
  },
  LIST_MEM: {
    command: 'users',
    description: 'List all users',
    full_des: 'List all users in sheet.',
    syntax: 'USERS',
    param_des: 'No params.'
  },
  SUMMARY: {
    command: 'sum',
    description: 'Summary expenses',
    full_des: 'Show total money spent.',
    syntax: 'SUM',
    param_des: 'No params.'
  },
  EXPENSES: {
    command: 'exps',
    description: 'List all expenses',
    full_des: 'Show detailed information of all expenses.',
    syntax: 'EXPS',
    param_des: 'No params.'
  }
}

// Utils

const toQueryParamsString = (obj) => {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
}

// Telegram APIs

const makeRequest = async (method, queryParams = {}) => {
  const url = `${BASE_URL}/${method}?${toQueryParamsString(queryParams)}`
  const response = await UrlFetchApp.fetch(url);
  return response.getContentText();
}

const sendMessage = (_text) => {
  makeRequest(METHODS.SEND_MESSAGE, {
    chat_id: chat_ID,
    text: _text,
    parse_mode: 'Markdown'
  })
}

const setWebhook = () => {
  makeRequest(METHODS.SET_WEBHOOK, {
    url: DEPLOYED_URL
  })
}

const deleteWebhook = () => {
  var url = "https://api.telegram.org/bot" + TOKEN + "/deleteWebhook";

  var response = UrlFetchApp.fetch(url);
  var responseData = JSON.parse(response.getContentText());

  if (responseData.ok) {
    Logger.log("Webhook deleted successfully.");
  } else {
    Logger.log("Error deleting webhook: " + responseData.error_code + " - " + responseData.description);
  }
}

const getChatId = async () => {
  const res = await makeRequest(METHODS.GET_UPDATES);
  console.log("ChatId: ", JSON.parse(res)?.result[0]?.message?.chat?.id)
}

// Google Sheet

const addNewRow = (content = []) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const expenseCol = sheet.getRange(EXPENSE_COL + '1').getColumn();
  const Avals = sheet.getRange(EXPENSE_COL + EXPENSE_ROW.toString() + ':' + EXPENSE_COL).getValues();
  const Alast = Avals.filter(String).length;
  const columnNumber = content.length;
  const newRow = sheet.getRange(Alast + EXPENSE_ROW, expenseCol, 1, columnNumber);
  newRow.setValues([content]);
}

const setCellText = (range, content) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const cell = sheet.getRange(range);
  cell.setValue(content);
}

const shiftRowsUp = () => {
  // todo shift rows up
}

const checkCommandExist = (value, dict) => {
  for (var key in dict) {
    if (dict.hasOwnProperty(key)) {
      if (dict[key].command === value) return true;
    }
  }

  return false;
}

const checkUserExist = (value) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const users = sheet.getRange(USER_COL + USER_ROW + ':' + USER_COL).getValues().filter(String);
  for (var i = 0; i < users.length; i++) {
    for (var j = 0; j < users[i].length; j++) {
      var name = users[i][j].toString();
      var val = value;
      if (IGNORE_CAPITAL) {
        name = name.toLowerCase();
        val = val.toLowerCase();
      }
      if (name === val) {
        return true;
      }
    }
  }
  return false;
}

const updateDebtList = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const Ivals = sheet.getRange(DEBT_COL + USER_ROW + ':' + DEBT_COL).getValues();
  const Ilen = Ivals.filter(String).length;

  for (var i = 0; i < Ilen; i++) {
    const val = sheet.getRange(2 + i, 9, 1, 1);
    var str = val.getFormula().toString();

    // Update the number after '/'
    str = str.replace(/\/\d+/, '/' + Ilen);

    val.setFormula(str);
  }
}

const getUserIndex = (value) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const users = sheet.getRange(USER_COL + USER_ROW + ':' + USER_COL).getValues();
  const totalUser = users.filter(String).length;

  for (var i = 0; i < totalUser; i++) {
    var name = users[i][0].toString();
    var val = value;
    if (IGNORE_CAPITAL) {
      name = name.toLowerCase();
      val = val.toLowerCase();
    }
    if (name === val) return i;
  }

  return -1;
}

const getUserData = (name) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const userIndex = getUserIndex(name);
  if (userIndex === -1) return null;
  const userCol = sheet.getRange(USER_COL + '1').getColumn();
  const data = sheet.getRange(USER_ROW + userIndex, userCol, 1, 5);

  return data;
}

const getUsers = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getRange(USER_COL + USER_ROW + ':' + USER_COL);

  return data;
}

const getExpenseData = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const expenseCount = sheet.getRange(EXPENSE_COL + EXPENSE_ROW + ':' + EXPENSE_COL).getValues().filter(String).length;
  const expenseCol = sheet.getRange(EXPENSE_COL + '1').getColumn();
  const expenses = sheet.getRange(EXPENSE_ROW, expenseCol, expenseCount + 1, 4);

  return expenses;
}

// command

const help = (input = null) => {
  var content = '';
  if (input === null) {
    content = content + COMMANDS.HELP.full_des + '\n';
    for (var key in COMMANDS) {
      var showDes = COMMANDS[key].description;
      if (showDes.length > MAX_DESCRIPTION_LEN) showDes = showDes.slice(0, MAX_DESCRIPTION_LEN);

      content = content + (COMMANDS[key].command.toUpperCase() + ': ').padStart(8) + showDes.padEnd(MAX_DESCRIPTION_LEN) + '\n';
    }
  }
  else {
    for (var key in COMMANDS) {
      var command = COMMANDS[key];
      if (command.command.toLowerCase() === input) {
        content = content + command.syntax + '\n' + '      ' + command.param_des + '\n\n';
        content = content + command.full_des;
      }
    }
  }

  sendMessage(monoText(content));
}

const addMem = (id, name) => {
  if (name.indexOf(' ') !== -1) {
    return sendMessage(monoText(EXCLAIMATION_EMOJI + 'Error: There should not be any space in username!'));
  }

  if (checkUserExist(name)) return sendMessage('Username already exists!');

  const nameSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NAME_SHEET);
  if (nameSheet) {
    var lastRow = nameSheet.getLastRow();
    nameSheet.insertRowAfter(lastRow);
    var range = nameSheet.getRange(lastRow + 1, 1, 1, 1);
    range.setValue(name);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const Fvals = sheet.getRange(USER_COL + '1:' + USER_COL).getValues();
  const Flast = Fvals.filter(String).length;

  const nameCell = sheet.getRange(Flast + 1, 6, 1, 1);
  const moneCell = sheet.getRange(Flast + 1, 7, 1, 1);
  const debtCell = sheet.getRange(Flast + 1, 9, 1, 1);
  nameCell.setValue(name);
  moneCell.setFormula('=SUMIF(C:C;' + nameCell.getA1Notation() + ';D:D)');
  debtCell.setFormula('=$K$2/' + Flast.toString() + '-' + moneCell.getA1Notation());
  updateDebtList();

  return sendMessage(monoText('New slave: ' + name));
}

const findUser = (name) => {
  if (checkUserExist(name) === false) return sendMessage(monoText('Username does not exist!'));

  const userRange = getUserData(name);
  if (userRange !== null) {
    var userData = userRange.getValues().filter(String);
    var content = '';
    content = content + 'Username: ' + name + '\n';
    content = content + 'Expense: ' + MONEY_BAG_EMOJI + formatMoney(userData[0][1]) + '\n';
    content = content + 'Debt: ' + DOUBLE_EXCLAIMATION_EMOJI + formatMoney(userData[0][3]) + '\n';
    return sendMessage(monoText(content));
  }
}

const listUser = () => {
  const users = getUsers().getValues().filter(String);
  const userCount = users.length;
  var content = 'Registered Users:\n';

  for (var i = 0; i < userCount; i++) {
    content = content + users[i][0].toString() + '\n';
  }

  return sendMessage(monoText(content));
}

const listExpense = () => {
  const expenses = getExpenseData().getValues().filter(String);
  const expenseCount = expenses.length;
  var content = "| No | Timestamp    | Who | Spend for                                   | Price     |\n" +
                "|----|--------------|-----|---------------------------------------------|-----------|\n";
  var i = 0;
  while (i < expenseCount - 1) {
    let record = `|${(i + 1)
      .toString()
      .padStart(4, '0')}|${expenses[i][0]
        .toLocaleString('vi-VN', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })}|${expenses[i][2]
          .toString()
          .padEnd(5)}|${expenses[i][1]
            .toString()
            .slice(0, 44)
            .padEnd(45)}|${formatMoney(expenses[i][3])
              .toString()
              .padStart(11)}|\n`;
    content += record;
    i++;
    if (i % NUM_ROWS_SUBTABLE == 0) {
      sendMessage(codeBlockText(content));
      content = "| No | Timestamp    | Who | Spend for                                   | Price     |\n" +
                "|----|--------------|-----|---------------------------------------------|-----------|\n";
    }
  }
  sendMessage(codeBlockText(content));
  return sendMessage(`Found ${expenseCount - 1} spends, open in landscape mode (mobile) or full size mode (desktop) for good view`);
}

const showSummary = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const totalExpenses = sheet.getRange(SUM_ALL).getValue().toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  var content = '';
  const userNum = sheet.getRange(USER_COL + USER_ROW + ':' + USER_COL).getValues().filter(String).length;
  const userCol = sheet.getRange(USER_COL + USER_ROW).getColumn();
  const userDatas = sheet.getRange(USER_ROW, userCol, userNum, 4).getValues();
  for (var i = 0; i < userNum; i++) {
    content = content + userDatas[i][0].toString() + ': ' + MONEY_BAG_EMOJI + formatMoney(userDatas[i][1]) + ', ' + DOUBLE_EXCLAIMATION_EMOJI + formatMoney(userDatas[i][3]) + '\n';
  }

  content = content + '\nTotal expenses: ' + totalExpenses + '\n';
  sendMessage(monoText(content));
}

// Extract label & price

const monoText = (text) => {
  return '`' + text + '`';
}

const boldText = (text) => {
  return '**' + text + '**';
}

const italicText = (text) => {
  return '*' + text + '*';
}

const codeBlockText = (text, language = 'txt') => {
  return '```' + language + '\n' + text + '\n' + '```';
}

const formatMoney = (value) => {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

const getMultiplyBase = (unitLabel) => {
  switch (unitLabel) {
    case 'k':
    case 'K':
    case 'nghìn':
    case 'ng':
    case 'ngàn':
      return 1000;
    case 'lít':
    case 'lit':
    case 'l':
      return 100000;
    case 'củ':
    case 'tr':
    case 'm':
    case 'M':
      return 1000000;
    default:
      return 1;
  }
};

const addExpense = (text, user) => {
  if (checkUserExist(user) === false) return sendMessage(monoText(EXCLAIMATION_EMOJI + 'Error: Username not found!'));

  const regex = /(.*)\s(\d*)(\w*)/g;
  const label = text.replace(regex, '$1').slice(user.length + 1);
  const priceText = text.replace(regex, '$2');
  const unitLabel = text.replace(regex, '$3');
  const time = new Date().toLocaleString();
  const price = Number(priceText) * getMultiplyBase(unitLabel);

  addNewRow([time, label, user, price]);
}

// Webhooks

const doPost = (request) => {
  const contents = JSON.parse(request.postData.contents);
  const message = contents.message;
  const text = message.text;
  const type = text.split(' ');
  var command = '';
  var user = '';

  chat_ID = message?.chat?.id;

  if (text === `/start`) return sendMessage(monoText('Welcome! This is your expense assistant. Type HELP to see available commands.'));

  if (type === null || type.length === 0) return sendMessage(monoText(EXCLAIMATION_EMOJI + 'Error: Syntax error!'));
  command = type[0].toLowerCase();

  if (checkCommandExist(command, COMMANDS) === false) return sendMessage(monoText('Command not found!'));


  if (command === COMMANDS.HELP.command) {
    if (type.length < 2) return help();
    return help(text.slice(command.length + 1).toLowerCase());
  }
  if (command === COMMANDS.ADD_MEM.command) {
    if (type.length < 2) return sendMessage(monoText(EXCLAIMATION_EMOJI + 'Error: Syntax error!'));
    user = text.slice(command.length + 1);
    return addMem(message.from.id, user);
  }
  if (command === COMMANDS.FIND_MEM.command) {
    if (type.length < 2) return sendMessage(monoText(EXCLAIMATION_EMOJI + 'Error: Syntax error!'));
    user = text.slice(command.length + 1);
    return findUser(user);
  }
  if (command === COMMANDS.LIST_MEM.command) {
    if (type.length > 1) return sendMessage(monoText(EXCLAIMATION_EMOJI + 'Error: Syntax error!'));
    return listUser();
  }
  if (command === COMMANDS.SPEND.command) {
    if (type.length < 4) return sendMessage(monoText(EXCLAIMATION_EMOJI + 'Error: Syntax error!'));
    user = type[1];
    addExpense(text.slice(command.length + 1), user);
    showSummary();
  }
  if (command === COMMANDS.SUMMARY.command) {
    if (type.length > 1) return sendMessage(monoText(EXCLAIMATION_EMOJI + 'Error: Syntax error!'));
    return showSummary();
  }
  if (command === COMMANDS.EXPENSES.command) {
    if (type.length > 1) return sendMessage(monoText(EXCLAIMATION_EMOJI + 'Error: Syntax error!'));
    return listExpense();
  }
}
