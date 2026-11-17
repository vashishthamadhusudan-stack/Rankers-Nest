const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const crypto = require("node:crypto");

admin.initializeApp();
const db = admin.firestore();
const PUSH_PUBLISH_SECRET = defineSecret("PUSH_PUBLISH_SECRET");
const SITE_URL = "https://vashishthamadhusudan-stack.github.io/Rankers-Nest/";

function tokenId(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

exports.subscribeToUpdates = onCall({ region: "us-central1" }, async (request) => {
  const token = request.data && request.data.token;
  if (typeof token !== "string" || token.length < 50 || token.length > 8192) {
    throw new HttpsError("invalid-argument", "A valid push token is required.");
  }
  const id = tokenId(token);
  await db.collection("pushSubscribers").doc(id).set({
    token,
    device: String((request.data && request.data.device) || "Web").slice(0, 40),
    subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    active: true
  }, { merge: true });
  return { subscribed: true };
});

exports.publishSiteUpdate = onRequest({
  region: "us-central1",
  secrets: [PUSH_PUBLISH_SECRET],
  cors: false,
  timeoutSeconds: 120
}, async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  const authHeader = req.get("authorization") || "";
  const supplied = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const expected = PUSH_PUBLISH_SECRET.value();
  if (!supplied || supplied.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
    return res.status(401).send("Unauthorized");
  }

  const update = req.body && req.body.update;
  if (!update || typeof update.title !== "string" || typeof update.url !== "string") {
    return res.status(400).send("Missing update.title or update.url");
  }
  const safeUrl = new URL(update.url, SITE_URL);
  if (safeUrl.origin !== new URL(SITE_URL).origin) {
    return res.status(400).send("Update URL must stay on Rankers Nest");
  }
  const title = update.title.slice(0, 140);
  const body = String(update.description || "A new Physics resource is available.").slice(0, 220);
  const date = String(update.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const id = crypto.createHash("sha256").update(date + "|" + title + "|" + safeUrl.href).digest("hex");
  const sentRef = db.collection("sentSiteUpdates").doc(id);
  const claim = await db.runTransaction(async tx => {
    const existing = await tx.get(sentRef);
    if (existing.exists) return false;
    tx.create(sentRef, { title, url: safeUrl.href, date, startedAt: admin.firestore.FieldValue.serverTimestamp(), status: "sending" });
    return true;
  });
  if (!claim) return res.status(200).json({ ok: true, duplicate: true, sent: 0 });

  const snapshot = await db.collection("pushSubscribers").where("active", "==", true).get();
  const docs = snapshot.docs;
  let sent = 0, failed = 0;
  const invalidRefs = [];
  for (let i = 0; i < docs.length; i += 500) {
    const chunk = docs.slice(i, i + 500);
    const tokens = chunk.map(doc => doc.get("token")).filter(Boolean);
    if (!tokens.length) continue;
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      data: {
        title: "Rankers Nest: New Update",
        body: title + " — " + body,
        url: safeUrl.href,
        tag: "rn-update-" + id.slice(0, 16)
      },
      webpush: { headers: { Urgency: "high", TTL: "86400" }, fcmOptions: { link: safeUrl.href } }
    });
    sent += response.successCount;
    failed += response.failureCount;
    response.responses.forEach((result, index) => {
      const code = result.error && result.error.code;
      if (code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token") invalidRefs.push(chunk[index].ref);
    });
  }
  if (invalidRefs.length) {
    const batch = db.batch();
    invalidRefs.forEach(ref => batch.delete(ref));
    await batch.commit();
  }
  await sentRef.set({
    status: "complete", sent, failed, subscriberCount: docs.length,
    finishedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  return res.status(200).json({ ok: true, sent, failed, subscribers: docs.length });
});
