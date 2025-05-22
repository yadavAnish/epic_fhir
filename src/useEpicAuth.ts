import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CLIENT_ID,
  REDIRECT_URI,
  SMART_TOKEN_URL,
  CODE_VERIFIER_LOCAL_STORAGE_KEY,
  TOKEN_RESPONSE_LOCAL_STORAGE_KEY
} from './config';

const getSecs = (d: Date) => Math.round(d.getTime() / 1000);

export const useEpicAuth = () => {
  const [tokenResponse, setTokenResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const verifier = localStorage.getItem(CODE_VERIFIER_LOCAL_STORAGE_KEY);

      const tokenStr = localStorage.getItem(TOKEN_RESPONSE_LOCAL_STORAGE_KEY);
      if (tokenStr) {
        const tokenObj = JSON.parse(tokenStr);
        const now = getSecs(new Date());
        if (now < tokenObj.issued_at_in_secs + tokenObj.expires_in) {
          setTokenResponse(tokenObj);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem(TOKEN_RESPONSE_LOCAL_STORAGE_KEY);
        }
      }

      if (code && verifier) {
        try {
          const form = new FormData();
          form.set('grant_type', 'authorization_code');
          form.set('code', code);
          form.set('redirect_uri', REDIRECT_URI);
          form.set('client_id', CLIENT_ID);
          form.set('code_verifier', verifier);

          const res = await axios.postForm(SMART_TOKEN_URL, form);
          const issued_at_in_secs = getSecs(new Date());

          const tokenData = {
            ...res.data,
            issued_at_in_secs,
          };

          localStorage.setItem(TOKEN_RESPONSE_LOCAL_STORAGE_KEY, JSON.stringify(tokenData));
          localStorage.removeItem(CODE_VERIFIER_LOCAL_STORAGE_KEY);
          setTokenResponse(tokenData);
        } catch (e) {
          console.error('Token exchange failed', e);
        }
      }

      setLoading(false);
    };

    fetchToken();
  }, []);

  return { tokenResponse, loading };
};
