import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import {
  CLIENT_ID,
  REDIRECT_URI,
  CODE_VERIFIER_LOCAL_STORAGE_KEY
} from './config'; // ✅ Make sure path is correct

const Callback: React.FC = () => {
  const navigate = useNavigate();
  console.log("🔁 Inside callback");

  useEffect(() => {
    const exchangeToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const codeVerifier = localStorage.getItem(CODE_VERIFIER_LOCAL_STORAGE_KEY);

      console.log('🔁 Redirected with code:', code);
      console.log('🔐 Retrieved code_verifier:', codeVerifier);

      if (!code || !codeVerifier) {
        console.error('❌ Missing code or verifier.');
        return;
      }

      const form = new FormData();
      form.set('grant_type', 'authorization_code');
      form.set('code', code);
      form.set('redirect_uri', REDIRECT_URI);
      form.set('client_id', CLIENT_ID);
      form.set('code_verifier', codeVerifier);

      try {
        const response = await axios.postForm(
         'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
          form
        );

        const token = response.data;
        console.log('✅ Token received:', token);

        localStorage.setItem('epic_token_response', JSON.stringify({
          ...token,
          issued_at_in_secs: Math.floor(Date.now() / 1000),
        }));

        localStorage.removeItem(CODE_VERIFIER_LOCAL_STORAGE_KEY);
        navigate('/dashboard');
      } catch (error: any) {
        console.error('❌ Token exchange failed:', error.response?.data || error);
      }
    };

    exchangeToken();
  }, [navigate]);

  return <div className="p-6 text-center">Finalizing login...</div>;
};

export default Callback;
