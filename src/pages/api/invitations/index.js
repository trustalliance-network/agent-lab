
const API_URL = process.env.ISSUER_API_URL;
const API_KEY = process.env.ISSUER_API_KEY;

export const runtime = 'edge';
const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}

export default function handler(req) {
  if (req.method === 'POST') {
    return createInvitation(req)
  }

  return createInvitation(req)
}

async function createInvitation(req, res) {
  const body = {
    alias: "API Invitation",
    invitation_type: "CV1",
    invitation_mode: "once",
    accept: "auto",
    public: false,
    invitation_role: "Holder",
    their_label: "ThaLabel",
    invitation_label: "CV1",
    invitation_description: "Invitation created through API",
    invitation_status: "active",
    uses_allowed: "",
  }

  const response = await fetch(`${API_URL}/api/v1/invitations`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const responseBody = await response.json();

  return new Response(JSON.stringify(responseBody), {status:200});
}

