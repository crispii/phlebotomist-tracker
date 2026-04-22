import { getClinicianStatus } from "./api.js";
import { isPointInPolygon } from "./geolocation.js";
import { sendEmail } from "./emailLogger.js";
import { CLINICIAN_IDS, POLL_INTERVAL } from "./config.js";

const alertedClinicians = new Set();

export function resetAlertedClinicians() {
  alertedClinicians.clear();
}

export async function trackClinicians({
  clinicianIds = CLINICIAN_IDS,
  fetchStatus = getClinicianStatus,
  isInBounds = isPointInPolygon,
  sendAlert = sendEmail,
} = {}) {
  for (const id of clinicianIds) {
    const data = await fetchStatus(id);

    if (!data) {
      if (!alertedClinicians.has(`${id}_endpoint`)) {
        await sendAlert(id, "endpoint_failed");
        alertedClinicians.add(`${id}_endpoint`);
      }
      continue;
    }

    alertedClinicians.delete(`${id}_endpoint`);

    const inBounds = isInBounds(data);

    if (!inBounds) {
      if (!alertedClinicians.has(id)) {
        await sendAlert(id);
        alertedClinicians.add(id);
      }
    } else {
      alertedClinicians.delete(id);
    }
  }
}

export async function startTracking() {
  await trackClinicians();
  setInterval(trackClinicians, POLL_INTERVAL);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startTracking();
}