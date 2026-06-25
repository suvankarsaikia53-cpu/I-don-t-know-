"use client";
import { useState } from 'react';

export default function HomeDashboard() {
  const [activeTab, setActiveTab] = useState('status_check');
  const [token, setToken] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form Field Component States
  const [email, setEmail] = useState('');
  const [curEmail, setCurEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [secCode, setSecCode] = useState('');
  const [workflow, setWorkflow] = useState({});

  const pushLog = (text, isErr = false) => {
    setLogs((prev) => [...prev, { msg: text, err: isErr, id: Date.now() + Math.random() }]);
  };

  const executeAction = async (action, additionalParams = {}) => {
    if (!token) {
      pushLog("Execution halted: Missing active validation token string.", true);
      return { success: false };
    }
    setLoading(true);
    try {
      const response = await fetch('/api/garena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params: { access_token: token, ...additionalParams } }),
      });
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (e) {
      setLoading(false);
      pushLog(`Exception failure: ${e.message}`, true);
      return { success: false, error: e.message };
    }
  };

  const handleStatusCheck = async () => {
    const res = await executeAction('check_bind');
    if (res.success) {
      const data = res.data.data || res.data;
      pushLog(`--> Operational Status: ${data.status || 'Active'}`);
      pushLog(`--> Summary Status: ${data.summary || 'Clear'}`);
      pushLog(`--> Assigned Email Address: ${data.current_email || data.email || 'Unassigned'}`);
      if (data.countdown_human) pushLog(`--> Security Countdown Event: ${data.countdown_human}`);
    } else {
      pushLog(`Fetch Error: ${res.error}`, true);
    }
  };

  const handlePlatformCheck = async () => {
    const res = await executeAction('check_links');
    if (res.success) {
      const platformMap = { 3: "Facebook", 8: "Gmail", 10: "iCloud", 5: "VK", 11: "Twitter", 7: "Huawei" };
      const bounded = res.data.bounded_accounts || [];
      const available = res.data.available_platforms || [];
      
      pushLog("=== BOUND SUB-LINKS SECURED ===");
      if(bounded.length === 0) pushLog("No secondary profiles active.");
      bounded.forEach(item => {
        if (platformMap[item.platform]) {
          pushLog(`Profile: ${platformMap[item.platform]} | Connected ID: ${item.user_info?.email || 'Hidden Data'}`);
        }
      });
    } else {
      pushLog(`Extraction Error: ${res.error}`, true);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '50px auto', padding: '24px', backgroundColor: '#111', borderRadius: '8px', border: '1px solid #222' }}>
      <h3 style={{ margin: '0 0 20px 0', letterSpacing: '0.5px' }}>SYSTEM CONTROL INTERFACE</h3>
      
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '6px' }}>Authentication Key String (Access Token)</label>
        <input 
          type="text" 
          value={token} 
          onChange={(e) => setToken(e.target.value)} 
          placeholder="Ex: Input unique key string sequences..."
          style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
        {[
          { id: 'status_check', label: 'Monitor Node' },
          { id: 'change_flow', label: 'Identity Update' },
          { id: 'unbind_flow', label: 'Unbind Sequence' },
          { id: 'termination', label: 'Wipe Controls' }
        ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => { setActiveTab(t.id); setWorkflow({}); }}
            style={{ 
              padding: '8px 14px', 
              backgroundColor: activeTab === t.id ? '#fff' : '#222', 
              color: activeTab === t.id ? '#000' : '#ccc', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '13px'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#161616', padding: '20px', borderRadius: '6px', border: '1px solid #252525', minHeight: '120px' }}>
        {activeTab === 'status_check' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleStatusCheck} disabled={loading} style={{ padding: '10px 16px', cursor: 'pointer' }}>Query Account Overview</button>
            <button onClick={handlePlatformCheck} disabled={loading} style={{ padding: '10px 16px', cursor: 'pointer' }}>Query Associated Platform Bindings</button>
          </div>
        )}

        {activeTab === 'change_flow' && (
          <div>
            <h4 style={{ margin: '0 0 10px 0' }}>Request Account Registration Alteration</h4>
            {!workflow.step && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="email" placeholder="New structural email string" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '8px' }} />
                <button onClick={async () => {
                  const r = await executeAction('send_otp', { email });
                  if(r.success) { pushLog("OTP Verification payload broadcasted successfully."); setWorkflow({ step: 2, email }); }
                  else pushLog(`Error routing request: ${r.error}`, true);
                }}>Transmit Verification Key</button>
              </div>
            )}
            {workflow.step === 2 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="One-time system OTP string" value={otp} onChange={(e) => setOtp(e.target.value)} style={{ padding: '8px' }} />
                <button onClick={async () => {
                  const r = await executeAction('verify_otp', { email: workflow.email, otp });
                  if(r.success) { pushLog("Authorization token generated cleanly."); setWorkflow({ step: 3, email: workflow.email, vt: r.data.verifier_token || r.data.data?.verifier_token }); }
                  else pushLog(`Verification failed: ${r.error}`, true);
                }}>Verify Code Payload</button>
              </div>
            )}
            {workflow.step === 3 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Active security access pin" value={secCode} onChange={(e) => setSecCode(e.target.value)} style={{ padding: '8px' }} />
                <button onClick={async () => {
                  const r = await executeAction('verify_identity', { code: secCode });
                  if(r.success) {
                    const iden = r.data.identity_token || r.data.data?.identity_token;
                    const finalRes = await executeAction('create_rebind', { email: workflow.email, verifier_token: workflow.vt, identity_token: iden });
                    if (finalRes.success) { pushLog(`Transaction complete. Profile shifted to: ${workflow.email}`); setWorkflow({}); }
                    else pushLog(`System update execution error: ${finalRes.error}`, true);
                  } else pushLog(`Identity confirmation failure: ${r.error}`, true);
                }}>Complete Structural Shift</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'unbind_flow' && (
          <div>
            <h4 style={{ margin: '0 0 12px 0' }}>Profile Severing Pipeline</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="text" placeholder="Security PIN code" value={secCode} onChange={(e) => setSecCode(e.target.value)} style={{ padding: '8px' }} />
              <button onClick={async () => {
                const r = await executeAction('security_unbind', { security_code: secCode });
                if (r.success) pushLog("Unlinking request registered successfully into the standard 15-day hold stack.");
                else pushLog(`Sever sequence error: ${r.error}`, true);
              }}>Direct Disconnect with PIN</button>
            </div>
          </div>
        )}

        {activeTab === 'termination' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={async () => {
              const r = await executeAction('cancel_bind');
              if(r.success) pushLog("Running modifications/pending transitions canceled successfully.");
              else pushLog(`Execution Error: ${r.error}`, true);
            }} style={{ backgroundColor: '#700', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '4px', cursor: 'pointer' }}>Wipe Pending Requests</button>

            <button onClick={async () => {
              const r = await executeAction('revoke_token');
              if(r.success) pushLog("Active authorization key parameters cleared from running state layers.");
              else pushLog(`Revocation Error: ${r.error}`, true);
            }} style={{ backgroundColor: '#444', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '4px', cursor: 'pointer' }}>Invalidate Application Token Context</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px', backgroundColor: '#000', padding: '14px', borderRadius: '4px', border: '1px solid #1a1a1a' }}>
        <div style={{ fontSize: '11px', color: '#666', borderBottom: '1px solid #111', paddingBottom: '6px', marginBottom: '8px', textTransform: 'uppercase' }}>Terminal Console Output Stream</div>
        <div style={{ maxHeight: '180px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5' }}>
          {logs.length === 0 && <div style={{ color: '#333' }}>No stream events recorded. State idle.</div>}
          {logs.map((l) => (
            <div key={l.id} style={{ color: l.err ? '#ff4d4d' : '#00e676' }}>
              &gt; {l.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}