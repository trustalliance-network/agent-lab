const API_URL = process.env.ISSUER_API_URL;
const API_KEY = process.env.ISSUER_API_KEY;
import { faker } from '@faker-js/faker';

export const runtime = 'edge';

function generateData(co2e) {
  const startDate = new Date('2022-07-01');
  const endDate = new Date('2023-07-01');
  const avg = co2e/12;
  const data = [];
  let previousValue = 0;
  let previousDate = startDate;
  while (previousDate < endDate) {
    const value = faker.number.float({min: avg-(avg/faker.number.int({min: 1, max: 15})), max: avg+(avg/faker.number.int({min: 1, max: 15}))});
    data.push({
      date: previousDate.toISOString().substring(0, 7),
      value: value.toFixed(2),
    });
    previousValue = value;
    previousDate = new Date(previousDate.setMonth(previousDate.getMonth() + 1));
  }
  return data.map((d, i) => {
    return `${d.date},${d.value}`;
  });
}
function isEmpty(str) {
  return (!str || 0 === str.length);
}
function getFullAddress(attributes) {
  return [
    attributes.physical_address_line_1,
    attributes.physical_address_line_2,
    attributes.physical_address_city,
    attributes.physical_address_postal_code,
    attributes.physical_address_subnational,
    attributes.physical_address_country,
  ].filter(s => !isEmpty(s)).join(", ");
}

function isBrent(data) {
  return data.attributes.farm_name.toLowerCase().toLowerCase("glencoe");
}

function generateRandomCredential(data) {

  const co2e = faker.number.int({ min: 2000, max: 3000 });
  const n2o = faker.number.int({ min: 500, max: 900 });

  return {
    report_id: 'GHG',
    organisation_id: data.attributes.farm_name,
    organisation_address: getFullAddress(data.attributes),
    full_report_pdf_url: `https://assets.myenviro-nz.org/apps/${process.env.APP_ID}/ghg-report.pdf`,
    period_start_date: '2022-07',
    period_end_date: '2023-06',
    report_issuer: process.env.APP_ID,
    co2e: String(co2e),
    baseline: String(faker.number.int({ min: co2e, max: 3000 })),
    target: String(faker.number.int({ min: 2000, max: co2e })),
    ch4: generateData(co2e).join("\n"),
    n2o: generateData(n2o).join("\n"),
    total: generateData(co2e+(n2o*2)).join("\n"),
  }
}
const brentCh4 = [
  '2022-07,257.28',
  '2022-08,257.36',
  '2022-09,257.79',
  '2022-10,267.95',
  '2022-11,320.92',
  '2022-12,392.61',
  '2023-01,402.12',
  '2023-02,369.53',
  '2023-03,367.25',
  '2023-04,302.88',
  '2023-05,258.97',
  '2023-06,274.48',
];
const brentN2o = [
  '2022-07,54.41',
  '2022-08,56.40',
  '2022-09,56.56',
  '2022-10,57.02',
  '2022-11,67.49',
  '2022-12,75.04',
  '2023-01,84.43',
  '2023-02,77.93',
  '2023-03,70.23',
  '2023-04,63.59',
  '2023-05,54.71',
  '2023-06,59.24',
];
const brentTotal = [
  '2022-07,311.69',
  '2022-08,313.76',
  '2022-09,314.35',
  '2022-10,324.97',
  '2022-11,388.41',
  '2022-12,467.65',
  '2023-01,486.55',
  '2023-02,447.46',
  '2023-03,437.48',
  '2023-04,366.47',
  '2023-05,313.68',
  '2023-06,333.72',
]
function generateBrentCredential(data) {
  const co2e = 2253.59;

  return {
    report_id: 'GHG',
    organisation_id: data.attributes.farm_name,
    organisation_address: getFullAddress(data.attributes),
    full_report_pdf_url: `https://assets.myenviro-nz.org/apps/${process.env.APP_ID}/ghg-report.pdf`,
    period_start_date: '2022-07',
    period_end_date: '2023-06',
    report_issuer: process.env.APP_ID,
    co2e: String(co2e),
    baseline: String(2500),
    target: String(2200),
    ch4: brentCh4.join("\n"),
    n2o: brentN2o.join("\n"),
    total: brentTotal.join("\n"),
  }
}

export default async function onRequestGet(req) {
  const data = await req.json();

  const claimsList = isBrent(data)
    ? generateBrentCredential(data)
    : generateRandomCredential(data);

  const requestBody = {
    "contact_id": data.contact_id,
    "invitation_id": null,
    "schema_id": 'QNetK7HNqt4mdmWRKGxzrZ:2:GHG_Report:1.0',
    "attributes": Object.entries(claimsList).map(([name, value]) => ({name, value})),
  }

  const url = `${API_URL}/api/v1/credentials`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const json = await response.json();

  if (!response.ok) {
    return Response.json({body: json, requestBody}, { status: response.status });
  }

  if (json.error) {
    return Response.json({errors: json, requestBody}, { status: 400 });
  }

  return Response.json({
    ...json,
    apistatus: response.status,
  }, { status: 200 });

}
