import * as functions from "firebase-functions";
import admin from "firebase-admin";
import fetch from "node-fetch";
import AWS from "aws-sdk";
import fs from "fs";


const service = JSON.parse(fs.readFileSync(new URL('../src/crp.json', import.meta.url), 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(service as admin.ServiceAccount),
});

const db = admin.firestore();

console.log("Firebase Admin initialized with project:", service.project_id);

const TELEGRAM_BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const sqs = new AWS.SQS({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
async function sendToSQS(chatId: number, text:string) {
  const params = {
    MessageBody: JSON.stringify({ chatId, text }),
    QueueUrl: "https://sqs.eu-north-1.amazonaws.com/730335250189/webHookQueue.fifo",
    MessageGroupId: "TelegramGroup",
    MessageDeduplicationId: `${chatId}-${Date.now()}`,
  };

  try {
    await sqs.sendMessage(params).promise();
    console.log("Message sent to SQS:", params);
  } catch (error) {
    console.error("Error to send:",error);
  }
}

async function sendMessage(chatId: number, text:string) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export const telegramWebhook = functions.https.onRequest(async (req, res) => {
  console.log("Received Telegram update:", JSON.stringify(req.body, null, 2));

  if (req.body.message) {
    const chatId = req.body.message.chat.id;
    const text = req.body.message.text;

    const userRef = db.collection("users").doc(String(chatId));
    const userDoc = await userRef.get();

    if (text === "/start") {
      if (!userDoc.exists) {
        await userRef.set({ step: "awaiting_email" });
        await sendMessage(chatId, "Please enter your email to login:");
      } else {
        await sendMessage(chatId, "You are already logged in. Say something!");
      }
    } else {
      if (userDoc.exists) {
        const userData = userDoc.data();

        if (userData && userData.step === "awaiting_email") {
          await userRef.update({ email: text, step: "awaiting_password" });
          await sendMessage(chatId, "Please entre your password:");
        } else if (userData && userData.step === "awaiting_password") {
          const email = userData.email;
          const password = text;

          try {
            const userRecord = await admin.auth().getUserByEmail(email);
            console.log(`Userrecord is : ${userRecord}`)
          } catch {
            await admin.auth().createUser({ email, password });
          }
          await userRef.update({ step:"loggedin"});
          await sendMessage(chatId,"You are now logged in");
        } else {
          await sendToSQS(chatId, text);
        }
      } else {
        await sendMessage(chatId, "Pleas start by typing /start");
      }
    }
  }
  res.sendStatus(200);
});


