const url = "https://3qbqr98twd.execute-api.us-west-2.amazonaws.com/test";

export async function getClinicianStatus(id) {
  try {
    // Fetch clinician status from the API
    const clinician = await fetch(`${url}/clinicianstatus/${id}`);

    if (!clinician.ok) {
      console.log(
        `Alert: api returned ${clinician.status} for clinician status`,
      );
      return null;
    }

    // Parse the response as JSON and return the clinician data
    const clinicianData = await clinician.json();
    return clinicianData;
  } catch (err) {
    console.error(`Error fetching clinician status: ${err}`);
    return null;
  }
}
