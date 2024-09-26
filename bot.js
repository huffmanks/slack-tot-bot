const { App } = require("@slack/bolt");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: false,
});

const API_URL = (date) => `https://dish.avifoodsystems.com/api/menu-items?date=${date.toLocaleDateString()}&locationId=93&mealId=144`;

const TEAM_OMC_GROUP_ID = "SBNJ40AAX";
const TEAM_OMC_CHANNEL_ID = "C01JKP6LBD3";
const APP_DM_CHANNEL_ID = "UFF0H819S";

async function fetchItems(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    console.log("fetchItems()", error);
    return [];
  }
}

async function checkForTots() {
  const date = new Date();
  const items = await fetchItems(API_URL(date));

  const hasTots = items.some((item) => item.name.toLowerCase().includes("tots"));

  return hasTots;
}

async function sendDailyUpdate() {
  try {
    const hasTots = await checkForTots();

    if (hasTots) {
      await app.client.chat.postMessage({
        channel: TEAM_OMC_CHANNEL_ID,
        text: `<!subteam^${TEAM_OMC_GROUP_ID}> there is tots today at Burwell! 🎉`,
      });
    } else {
      await app.client.chat.postMessage({
        channel: APP_DM_CHANNEL_ID,
        text: `No tots today in Burwell. 🥲`,
      });
    }
  } catch (error) {
    console.log("sendDailyUpdate()", error);
    return;
  }
}

(async () => {
  try {
    await app.start();
    console.log(`\n⚡️ Slack bot is running!\nNODE_ENV: ${process.env.NODE_ENV}`);

    await sendDailyUpdate();
  } catch (error) {
    console.log("init_", error);
  } finally {
    await app.stop();
  }
})();
