const { App } = require("@slack/bolt");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  port: process.env.PORT || 3001,
});

const API_URL = (date) => `https://dish.avifoodsystems.com/api/menu-items?date=${date.toLocaleDateString()}&locationId=93&mealId=144`;

const TEAM_OMC_CHANNEL_ID = "C01JKP6LBD3";
const TEAM_OMC_GROUP_ID = "SBNJ40AAX";

async function fetchItems(url) {
  try {
    const response = await fetch(url);
    const data = response.json();

    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
}

async function checkForTots() {
  const date = new Date();
  const items = await fetchItems(API_URL(date));

  const hasTots = items.some((item) => item.name.toLowerCase().includes("tots"));

  return hasTots;
}

app.command("/tots", async ({ command, ack, respond }) => {
  await ack();

  const hasTots = await checkForTots();

  if (hasTots) {
    await respond(`Yes <@${command.user_id}>, there is tots today at Burwell! 🎉`);
  }
});

(async () => {
  const hasTots = await checkForTots();

  if (hasTots) {
    await app.client.chat.postMessage({
      channel: TEAM_OMC_CHANNEL_ID,
      text: `<!subteam^${TEAM_OMC_GROUP_ID}> there is tots today at Burwell! 🎉`,
    });
  }

  await app.start();
  console.log("⚡️ Slack bot is running!");
})();
