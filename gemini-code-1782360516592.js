import { NextResponse } from 'next/server';

function isSuccess(rj, statusCode) {
  if (statusCode !== 200) return false;
  if (!rj || !rj.success) return false;
  
  const data = rj.data || {};
  if (data.error) return false;
  if (data.garena_response && data.garena_response.error) return false;
  if (rj.error) return false;
  
  return true;
}

function getErrorMessage(rj) {
  if (!rj) return 'Unknown Response error';
  if (rj.error) {
    if (typeof rj.error === 'object') {
      return rj.error.garena_response?.error || rj.error.error || rj.error.message || JSON.stringify(rj.error);
    }
    return rj.error;
  }
  if (rj.data?.error) return rj.data.error;
  if (rj.data?.garena_response?.error) return rj.data.garena_response.error;
  if (!rj.success) return rj.message || 'Action processing failed';
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, params } = body;
    
    let url = '';
    let queryParams = new URLSearchParams();
    let headers = {};

    switch (action) {
      case 'send_otp':
        url = 'https://chngemailcode48.vercel.app/send_otp';
        queryParams.append('access_token', params.access_token);
        queryParams.append('email', params.email);
        break;
      case 'verify_otp':
        url = 'https://chngemailcode48.vercel.app/verify_otp';
        queryParams.append('access_token', params.access_token);
        queryParams.append('email', params.email);
        queryParams.append('otp', params.otp);
        break;
      case 'verify_identity':
        url = 'https://chngemailcode48.vercel.app/verify_identity';
        queryParams.append('access_token', params.access_token);
        queryParams.append('code', params.code);
        break;
      case 'create_rebind':
        url = 'https://chngemailcode48.vercel.app/create_rebind';
        queryParams.append('access_token', params.access_token);
        queryParams.append('email', params.email);
        queryParams.append('identity_token', params.identity_token);
        queryParams.append('verifier_token', params.verifier_token);
        break;
      case 'no_sec_otp':
        url = 'https://chngeforgotcrownx72.vercel.app/otp';
        queryParams.append('access_token', params.access_token);
        queryParams.append('current_email', params.current_email);
        break;
      case 'no_sec_verify':
        url = 'https://chngeforgotcrownx72.vercel.app/verify';
        queryParams.append('access_token', params.access_token);
        queryParams.append('current_email', params.current_email);
        queryParams.append('otp', params.otp);
        break;
      case 'no_sec_newotp':
        url = 'https://chngeforgotcrownx72.vercel.app/newotp';
        queryParams.append('access_token', params.access_token);
        queryParams.append('new_email', params.new_email);
        break;
      case 'no_sec_newverify':
        url = 'https://chngeforgotcrownx72.vercel.app/newverify';
        queryParams.append('access_token', params.access_token);
        queryParams.append('new_email', params.new_email);
        queryParams.append('otp', params.otp);
        break;
      case 'no_sec_change':
        url = 'https://chngeforgotcrownx72.vercel.app/change';
        queryParams.append('access_token', params.access_token);
        queryParams.append('new_email', params.new_email);
        queryParams.append('identity_token', params.identity_token);
        queryParams.append('verifier_token', params.verifier_token);
        break;
      case 'security_unbind':
        url = 'https://crownxnewkey10010.vercel.app/securityunbind';
        queryParams.append('access_token', params.access_token);
        queryParams.append('security_code', params.security_code);
        break;
      case 'forgot_unbind':
        url = 'https://crownxforgotremove23.vercel.app/forgotunbind';
        queryParams.append('access_token', params.access_token);
        queryParams.append('identity_token', params.identity_token);
        break;
      case 'check_bind':
        url = 'https://bindinfocrownx612.vercel.app/check';
        queryParams.append('access_token', params.access_token);
        break;
      case 'cancel_bind':
        url = 'https://bindcnclcrownx34.vercel.app/cancelbind';
        queryParams.append('access_token', params.access_token);
        break;
      case 'bind_new_email':
        url = 'https://bindcnclcrownx34.vercel.app/bind';
        queryParams.append('access_token', params.access_token);
        queryParams.append('email', params.email);
        break;
      case 'confirm_bind_new':
        url = 'https://bindcnclcrownx34.vercel.app/confirmbind';
        queryParams.append('access_token', params.access_token);
        queryParams.append('email', params.email);
        queryParams.append('otp', params.otp);
        queryParams.append('security_code', params.security_code);
        break;
      case 'check_links':
        url = 'https://100067.connect.garena.com/bind/app/platform/info/get';
        queryParams.append('access_token', params.access_token);
        headers = {
          'User-Agent': "GarenaMSDK/4.0.19P9(Redmi Note 5 ;Android 9;en;US;)",
          'If-Modified-Since': "Sun, 18 May 2025 09:37:03 GMT"
        };
        break;
      case 'revoke_token':
        url = 'https://crownxrevoker73.vercel.app/revoke';
        queryParams.append('access_token', params.access_token);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid operation call configuration' }, { status: 400 });
    }

    const targetUrl = `${url}?${queryParams.toString()}`;
    const res = await fetch(targetUrl, { method: 'GET', headers });
    
    if (!res.ok && action === 'check_links') {
      return NextResponse.json({ success: false, error: 'Connection failure to validation server nodes.' }, { status: res.status });
    }

    const data = await res.json();
    
    if (action === 'check_links') {
      return NextResponse.json({ success: true, data });
    }

    if (isSuccess(data, res.status)) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json({ success: false, error: getErrorMessage(data) || 'Validation sequence rejected by target host.' });
    }

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}