import { getClinicianStatus } from "./api.js";
import { isPointInPolygon } from "./geolocation.js";
import { sendEmail } from "./emailLogger.js";
import { CLINICIAN_IDS, POLL_INTERVAL } from "./config.js";

const prevStatus = {};

async function trackClinicians() {
  for (const id of CLINICIAN_IDS) {
    const data = await getClinicianStatus(id);

    if (!data) {
      continue;
    }

    const inBounds = isPointInPolygon(data);

    if (!inBounds && prevStatus[id] !== "outOfBounds") {
      await sendEmail(id);
      prevStatus[id] = "outOfBounds";
    } else {
      prevStatus[id] = "inBounds";
    }
  }
}

async function startTracking() {
  await trackClinicians();
  setInterval(trackClinicians, POLL_INTERVAL);
}

startTracking();
