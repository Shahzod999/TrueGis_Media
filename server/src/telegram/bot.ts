import TelegramBot from "node-telegram-bot-api";
// тестирование
const botStart = async () => {
  const token = process.env.TELEGRAM_BOT_TOKEN || "";
  const webAppUrl = process.env.WEB_APP_URL || "https://gxfl20sh-5173.euw.devtunnels.ms";
  const bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match ? match[1] : "";
    bot.sendMessage(chatId, resp);
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    const timestamp = msg.date; // Unix timestamp

    // Преобразуем Unix timestamp в читаемый формат
    const date = new Date(timestamp * 1000);
    const formattedTime = date.toLocaleString("ru-RU", {
      timeZone: "Asia/Tashkent",
    });
    console.log(`Получено сообщение: ${text} от ${chatId} в ${formattedTime}`);

    if (text == "/start") {
      try {
        await bot.sendMessage(chatId, "круто ниже кнопка на сайт", {
          reply_markup: {
            inline_keyboard: [[{ text: "Перейти на сайт", web_app: { url: webAppUrl } }]],
          },
        });
      } catch (error) {
        console.log("Ошибка при отправке сообщения:", error instanceof Error ? error.message : String(error));
      }
    }
  });
};

export default botStart;
