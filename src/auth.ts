import pkceChallenge from 'pkce-challenge';
import {
  CLIENT_ID,
  REDIRECT_URI,
  SMART_AUTH_URL,
  FHIR_BASE_URL,
  CODE_VERIFIER_LOCAL_STORAGE_KEY
} from './config';

export const generateAuthorizationUrl = async (): Promise<string> => {
  const { code_verifier, code_challenge } = await pkceChallenge();
  localStorage.setItem(CODE_VERIFIER_LOCAL_STORAGE_KEY, code_verifier);

  const url = new URL(SMART_AUTH_URL);
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('scope', 'openid fhirUser'); // ✅ Correct scope
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', '1234567');
  url.searchParams.set('aud', 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4');
  url.searchParams.set('code_challenge', code_challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  console.log("URL TO string",url)

  return url.toString();
};
