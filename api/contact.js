export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const body = req.body || {};

  const name = body.name || body.clientName || body['Client Name'] || body['Name'] || 'Visitor';
  const email = body.email || body.clientEmail || body['Email Address'] || body['Email'] || '';
  const company = body.company || body.clientCompany || body['Company / Fleet'] || body['Company / Organization'] || 'Not specified';

  let topic = body.topic || body.inquiryDomain || body['Topic / Domain'] || body['Primary Service Required'] || '';
  if (!topic && body.targets) {
    topic = 'Free Fleet Scan: ' + body.targets;
  }
  if (!topic) {
    topic = 'General Inquiry';
  }

  const message = body.message || body.clientMessage || body['Message / Scope'] || body['Project Scope & Requirements'] || body.scope || (body.targets ? 'Fleet Targets: ' + body.targets : '');
  const timeline = body.timeline || body['Target Timeline'] || '';

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const subject = `[Dispatch Terminal] ${topic} - ${name}${company !== 'Not specified' ? ' (' + company + ')' : ''}`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0a0f06;color:#eef3ea;padding:24px;border-radius:12px;max-width:600px;border:1px solid #23301a">
      <div style="color:#a8d506;font-size:15px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:4px">Operational Dual-Desk Dispatch // Oversight</div>
      <div style="color:#8ba080;font-size:12px;margin-bottom:18px">Direct inbound transmission from www.oversight.ee</div>
      
      <div style="margin-bottom:14px">
        <div style="color:#8ba080;font-size:11px;font-family:monospace;text-transform:uppercase">Topic</div>
        <div style="font-size:15px;font-weight:600;color:#eef3ea">${topic}</div>
      </div>
      
      <div style="margin-bottom:14px">
        <div style="color:#8ba080;font-size:11px;font-family:monospace;text-transform:uppercase">Client</div>
        <div style="font-size:15px;color:#eef3ea">${name} &lt;<a href="mailto:${email}" style="color:#a8d506">${email}</a>&gt;</div>
      </div>
      
      <div style="margin-bottom:14px">
        <div style="color:#8ba080;font-size:11px;font-family:monospace;text-transform:uppercase">Company / Fleet</div>
        <div style="font-size:15px;color:#eef3ea">${company}</div>
      </div>

      ${timeline ? `<div style="margin-bottom:14px"><div style="color:#8ba080;font-size:11px;font-family:monospace;text-transform:uppercase">Target Timeline</div><div style="font-size:15px;color:#eef3ea">${timeline}</div></div>` : ''}
      
      <div style="margin-bottom:18px">
        <div style="color:#8ba080;font-size:11px;font-family:monospace;text-transform:uppercase">Scope / Requirements</div>
        <div style="background:#12190f;border:1px solid #23301a;border-radius:6px;padding:12px;font-family:monospace;font-size:13px;color:#a8d506;white-space:pre-wrap">${message || 'None provided'}</div>
      </div>
      
      <div style="font-size:11px;color:#5a6e50;border-top:1px solid #1c2915;padding-top:12px">
        Direct Desk Response SLA &lt; 24h &bull; Tallinn European HQ &bull; Al Khobar Desk
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'oversight-mailer/1.0'
      },
      body: JSON.stringify({
        from: 'Oversight <onboarding@resend.dev>',
        to: ['contact@oversight.ee'],
        reply_to: email,
        subject: subject,
        html: html
      })
    });

    const data = await response.json();
    if (response.ok) {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(response.status).json({ success: false, error: data });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
