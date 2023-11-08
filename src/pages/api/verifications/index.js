export const runtime = 'edge';
const API_URL = process.env.ISSUER_API_URL;
const API_KEY = process.env.ISSUER_API_KEY;
const schemas = [
  {
    schema_id: 'TdaNZ4rTQcgKs4JkTDsSpF:2:FarmID:1.0',
    schema_attributes: [
      'physical_address_line_1',
      'physical_address_line_2',
      'physical_address_city',
      'physical_address_subnational',
      'farm_name',
      'physical_address_country',
      'representative_given_names',
      'representative_family_names',
      'representative_email_address',
      'physical_address_postal_code',
      'representative_mobile_phone_number',
      'fed_farmers_membership_number',
      'company_name',
    ],
  },
];

export default async function handler(req) {

  const body = await req.json();

  if (!body.contact_id) {
    return Response.json({ error: 'Missing contact_id' }, { status: 400 });
  }

  const requestBody = {
    contact_id: body.contact_id,
    invitation_id: body.invitation_id,
    schemas: schemas,
    timeout: null,
    rule: null,
  };

  const res = await fetch(`${API_URL}/api/v1/verifications`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestBody),
  }).catch(e => {
    console.error({ e })
    return Response.json({error: e.message}, { status: 500 });
  })

  const responseBody = await res.json();

  return Response.json(responseBody, { status: res.status });

  console.log("---Requesting verification---");
  let verification = await Axios({
    method: "POST",
    url: `${process.env.ISSUER_API}/api/v1/verifications`,
    data: verificationData,
    headers: {
      "x-api-key": process.env.ISSUER_APIKEY,
    },
  });
  let verificationResponse = verification.data;

  let verificationComplete = await verificationResponse.every((record) => {
    return record.complete === true;
  });

  let x = 0;
  while (verificationComplete !== true && x < 720) {
    function sleep(ms) {
      return new Promise((resolveFunc) => setTimeout(resolveFunc, ms));
    }

    await sleep(5000);

    console.log("---Searching for completed verification records---");
    let newVerificationResponse = [];
    await Promise.all(
      verificationResponse.map(async (verRecord) => {
        let verificationRecord = await Axios({
          method: "GET",
          url: `${process.env.ISSUER_API}/api/v1/verifications/${verRecord.verification_id}`,
          headers: {
            "x-api-key": process.env.ISSUER_APIKEY,
          },
        });

        newVerificationResponse.push(verificationRecord.data);
      })
    );

    verificationResponse = newVerificationResponse;

    verificationComplete = newVerificationResponse.every((record) => {
      return record.complete === true;
    });

    x++;
  }

  if (verificationComplete === true) {
    const findResults = verificationResponse.map((record) => {
      if (record.result === true) {
        return record;
      }
    });

    if (findResults.length === verificationResponse.length) {
      res.status(200).send({ verificationRecords: verificationResponse });
    } else {
      res
        .status(401)
        .send({ message: "Your credentials could not be verified." });
    }
  } else {
    res.status(400).send({
      message: "Failed to complete verification process. Please try again.",
    });
  }
}
