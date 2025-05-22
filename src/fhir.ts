// src/utils/fhir.ts
import axios from 'axios';


export const getPatientInfo = async (): Promise<any> => {
  const accessToken = sessionStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const baseUrl = 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';
  console.log(baseUrl)

  // Option 1: Use fhirUser claim from ID token (if you stored it)
  const idToken = sessionStorage.getItem('id_token');
  if (!idToken) throw new Error('No ID token');

  const payload = JSON.parse(atob(idToken.split('.')[1]));
  const fhirUser = payload.fhirUser; // should be like "Patient/123"
  console.log("Fhir User",fhirUser)

  const response = await axios.get(`${baseUrl}/${fhirUser}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/fhir+json',
    },
  });
  console.log(response.data)

  return response.data;
};
