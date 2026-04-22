import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { trackClinicians, resetAlertedClinicians } from "../src/index.js";

beforeEach(() => {
  resetAlertedClinicians();
});

const fakeData = {
  features: [{ geometry: { type: "Point", coordinates: [0, 0] } }],
};

test("sends endpoint_failed alert when status fetch returns null", async () => {
  const alerts = [];

  await trackClinicians({
    clinicianIds: [1],
    fetchStatus: async () => null,
    isInBounds: () => true,
    sendAlert: async (id, type = "out_of_zone") => alerts.push({ id, type }),
  });

  assert.deepEqual(alerts, [{ id: 1, type: "endpoint_failed" }]);
});

test("does not resend endpoint_failed alert on consecutive failures", async () => {
  const alerts = [];

  const opts = {
    clinicianIds: [1],
    fetchStatus: async () => null,
    isInBounds: () => true,
    sendAlert: async (id, type = "out_of_zone") => alerts.push({ id, type }),
  };

  await trackClinicians(opts);
  await trackClinicians(opts);

  assert.deepEqual(alerts, [{ id: 1, type: "endpoint_failed" }]);
});

test("clears the endpoint_failed alert when API recovers", async () => {
  const alerts = [];
  const sendAlert = async (id, type = "out_of_zone") => alerts.push({ id, type });

  await trackClinicians({
    clinicianIds: [1],
    fetchStatus: async () => null,
    isInBounds: () => true,
    sendAlert,
  });

  await trackClinicians({
    clinicianIds: [1],
    fetchStatus: async () => fakeData,
    isInBounds: () => true,
    sendAlert,
  });

  await trackClinicians({
    clinicianIds: [1],
    fetchStatus: async () => null,
    isInBounds: () => true,
    sendAlert,
  });

  assert.deepEqual(alerts, [
    { id: 1, type: "endpoint_failed" },
    { id: 1, type: "endpoint_failed" },
  ]);
});

test("sends out of zone alert when clinician is outside polygon", async () => {
  const alerts = [];

  await trackClinicians({
    clinicianIds: [2],
    fetchStatus: async () => fakeData,
    isInBounds: () => false,
    sendAlert: async (id, type = "out_of_zone") => alerts.push({ id, type }),
  });

  assert.deepEqual(alerts, [{ id: 2, type: "out_of_zone" }]);
});

test("does not resend out of zone alert on consecutive out-of-zone polls", async () => {
  const alerts = [];

  const opts = {
    clinicianIds: [2],
    fetchStatus: async () => fakeData,
    isInBounds: () => false,
    sendAlert: async (id, type = "out_of_zone") => alerts.push({ id, type }),
  };

  await trackClinicians(opts);
  await trackClinicians(opts);

  assert.deepEqual(alerts, [{ id: 2, type: "out_of_zone" }]);
});

test("resends out of zone alert after a clinician returns to zone and leaves again", async () => {
  const alerts = [];
  const sendAlert = async (id, type = "out_of_zone") => alerts.push({ id, type });

  await trackClinicians({
    clinicianIds: [2],
    fetchStatus: async () => fakeData,
    isInBounds: () => false,
    sendAlert,
  });

  await trackClinicians({
    clinicianIds: [2],
    fetchStatus: async () => fakeData,
    isInBounds: () => true,
    sendAlert,
  });

  await trackClinicians({
    clinicianIds: [2],
    fetchStatus: async () => fakeData,
    isInBounds: () => false,
    sendAlert,
  });

  assert.deepEqual(alerts, [
    { id: 2, type: "out_of_zone" },
    { id: 2, type: "out_of_zone" },
  ]);
});

test("does not send alert when a clinician is in bounds", async () => {
  const alerts = [];

  await trackClinicians({
    clinicianIds: [3],
    fetchStatus: async () => fakeData,
    isInBounds: () => true,
    sendAlert: async (id, type = "out_of_zone") => alerts.push({ id, type }),
  });

  assert.deepEqual(alerts, []);
});

test("does not check bounds when fetch returns null", async () => {
  let called = false;

  await trackClinicians({
    clinicianIds: [1],
    fetchStatus: async () => null,
    isInBounds: () => {
      called = true;
      return true;
    },
    sendAlert: async () => {},
  });

  assert.equal(called, false);
});

test("handles multiple clinicians independently", async () => {
  const alerts = [];
  const sendAlert = async (id, type = "out_of_zone") => alerts.push({ id, type });

  const outOfZoneData = { out: true };

  await trackClinicians({
    clinicianIds: [1, 2, 3],
    fetchStatus: async (id) => {
      if (id === 2) return null;      
      if (id === 3) return outOfZoneData; 
      return fakeData;                 
    },
    isInBounds: (data) => data !== outOfZoneData,
    sendAlert,
  });

  assert.deepEqual(alerts, [
    { id: 2, type: "endpoint_failed" },
    { id: 3, type: "out_of_zone" },
  ]);
});