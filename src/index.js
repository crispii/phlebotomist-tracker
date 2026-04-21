import { getClinicianStatus } from "./api.js";
import { isPointInPolygon } from "./geolocation.js";
import { sendEmail } from "./emailLogger.js";
import { CLINICIAN_IDS, POLL_INTERVAL } from "./config.js";

async function trackClinicians() {
  for (const id of CLINICIAN_IDS) {
    const data = await getClinicianStatus(id);

    if (!data) {
      continue;
    }

    const inBounds = isPointInPolygon(data);

    if (!inBounds) {
      await sendEmail(id);
    }
  }
}

async function startTracking() {
  await trackClinicians();
  setInterval(trackClinicians, POLL_INTERVAL);
}

startTracking();
