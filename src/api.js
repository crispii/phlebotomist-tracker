const url = "https://3qbqr98twd.execute-api.us-west-2.amazonaws.com/test";

export async function getClinicianStatus(id) {
  try {
    const clinician = await fetch(`${url}/clinicianstatus/${id}`);

    if (!clinician.ok) {
      console.log(`Api returned ${clinician.status} for clinician status`);
      return null;
    }
    const clinicianData = await clinician.json();
    return clinicianData;
  } catch (err) {
    console.error(`Error fetching clinician status: ${err}`);
    return null;
  }
}
