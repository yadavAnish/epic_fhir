


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const FHIR_BASE_URL = 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';

// const Dashboard: React.FC = () => {
//   const [patient, setPatient] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPatient = async () => {
//       const tokenData = JSON.parse(localStorage.getItem('epic_token_response') || '{}');
//       const accessToken = tokenData.access_token;
//       let patientId = tokenData.patient;

//       try {
//         const idToken = tokenData.id_token;
//         const payload = JSON.parse(atob(idToken.split('.')[1]));
//         patientId = payload.sub;
//       } catch (err) {
//         console.error('❌ Could not decode id_token:', err);
//       }

//       if (!accessToken || !patientId) {
//         setError('❌ Missing accessToken or patientId');
//         setLoading(false);
//         return;
//       }

//       try {
//         console.log('📥 inside fetchPatient');
//         const res = await axios.get(
//           `${FHIR_BASE_URL}/Patient/${patientId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               Accept: 'application/fhir+json',
//             },
//           }
//         );
//         setPatient(res.data);
//       } catch (err: any) {
//         console.error('❌ Error fetching patient:', err);
//         setError(`❌ ${err.response?.status}: ${JSON.stringify(err.response?.data || err.message)}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPatient();
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div style={{ color: 'red' }}>{error}</div>;

//   const name = patient?.name?.[0];
//   return (
//     <div>
//       <h2>Patient Info</h2>
//       <p><strong>Name:</strong> {name?.given?.join(' ')} {name?.family}</p>
//       <p><strong>Gender:</strong> {patient.gender}</p>
//       <p><strong>DOB:</strong> {patient.birthDate}</p>
//       <p><strong>ID:</strong> {patient.id}</p>
//     </div>
//   );
// };

// export default Dashboard;





import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FHIR_BASE_URL = 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';

const Dashboard: React.FC = () => {
  const [patient, setPatient] = useState<any>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const tokenData = JSON.parse(localStorage.getItem('epic_token_response') || '{}');
      const accessToken = tokenData.access_token;
      let patientId = tokenData.patient;

      try {
        const idToken = tokenData.id_token;
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        patientId = payload.sub;
      } catch (err) {
        console.error('❌ Could not decode id_token:', err);
      }

      if (!accessToken || !patientId) {
        setError('❌ Missing accessToken or patientId');
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/fhir+json',
      };

      try {
        const [patientRes, obsRes, condRes, allergyRes] = await Promise.all([
          axios.get(`${FHIR_BASE_URL}/Patient/${patientId}`, { headers }),
          axios.get(`${FHIR_BASE_URL}/Observation?patient=${patientId}&category=vital-signs`, { headers }),
          axios.get(`${FHIR_BASE_URL}/Condition?patient=${patientId}`, { headers }),
          axios.get(`${FHIR_BASE_URL}/AllergyIntolerance?patient=${patientId}`, { headers }),
        ]);

        setPatient(patientRes.data);
        setObservations(obsRes.data.entry?.map((e: any) => e.resource) || []);
        setConditions(condRes.data.entry?.map((e: any) => e.resource) || []);
        setAllergies(allergyRes.data.entry?.map((e: any) => e.resource) || []);
      } catch (err: any) {
        console.error('❌ Error fetching data:', err);
        setError(`❌ ${err.response?.status}: ${JSON.stringify(err.response?.data || err.message)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const name = patient?.name?.[0];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">🧍 Patient Info</h2>
      <p><strong>Name:</strong> {name?.given?.join(' ')} {name?.family}</p>
      <p><strong>Gender:</strong> {patient.gender}</p>
      <p><strong>DOB:</strong> {patient.birthDate}</p>
      <p><strong>ID:</strong> {patient.id}</p>

      <h3 className="text-xl font-semibold mt-4">📊 Observations</h3>
      <ul>
        {observations.map((obs, index) => (
          <li key={index}>
            {obs.code?.text || obs.code?.coding?.[0]?.display}: {obs.valueQuantity?.value} {obs.valueQuantity?.unit}
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mt-4">🩺 Conditions</h3>
      <ul>
        {conditions.map((cond, index) => (
          <li key={index}>
            {cond.code?.text || cond.code?.coding?.[0]?.display} — {cond.clinicalStatus?.text}
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mt-4">⚠️ Allergies</h3>
      <ul>
        {allergies.map((allergy, index) => (
          <li key={index}>
            {allergy.code?.text || allergy.code?.coding?.[0]?.display} — {allergy.reaction?.[0]?.manifestation?.[0]?.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
