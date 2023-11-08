import DashboardLayout from "@/layouts/DashboardLayout";
import {useEffect, useRef, useState} from "react";
import isEmpty from "lodash/isEmpty";
import QRCode from "qrcode.react";
import classNames from "classnames";
import get from "lodash/get";
import Link from "next/link";

function createVerification(contactId, invitationId) {
  return fetch(`/api/verifications`, {
    method: "POST",
    body: JSON.stringify({
      contact_id: contactId,
      invitation_id: invitationId,
    }),
  }).then(r => r.ok ? r.json() : null);
}
function createSession(invitation, sessionId) {
  return new Promise(function (resolve, reject) {
    const oldSession = JSON.parse(localStorage.getItem("session"));
    localStorage.setItem("session", JSON.stringify({
      ...oldSession,
      id: sessionId,
      invitation_id: invitation.invitation_id,
      contact_id: invitation.contact_id,
      state: 'connected',
    }));
    resolve();
  });
}
function createInvitation() {
  return fetch(`/api/invitations`, {method: "POST"}).then(r => r.ok ? r.json() : null)
}
function getVerification(id) {
  return fetch(`/api/verifications/${id}`)
    .then(r => r.ok ? r.json() : null);
}
function getInvitation(id) {
  return fetch(`/api/invitations/${id}`).then(r => r.ok ? r.json() : null);
}
function hasSessionExpired(session) {
  const sessionDate = new Date(session.created_at);
  const now = new Date();
  const diff = now - sessionDate;
  const minutes = Math.floor(diff / 1000 / 60);

  return (minutes > 30);
}
async function findSession(sessionId) {
  console.log('findSession', sessionId)
  if (isEmpty(sessionId)) return null;
  const lsSession = localStorage.getItem("session");
  console.log('lsSession', lsSession)
  return JSON.parse(lsSession);
}
async function findCredential(sessionId) {
  return fetch(`/api/credentials?session_id=${sessionId}`).then(r => r.json());
}
function createCredential(sessionId, attributes) {
  return fetch(`/api/credentials`, {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      attributes,
    })
  }).then(r => r.json());
}

export default function DashboardPage() {
  const [state, setState] = useState('loading');
  const [credential, setCredential] = useState(null);
  const [user, setUser] = useState(null);

  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (window.localStorage.hasOwnProperty('session_id')) {
      setSessionId(localStorage.getItem("session_id"));
    }

    setState('loaded');
  }, [])

  function clearSession() {
    localStorage.removeItem("session");
    setSession(null);
    setState('not_identified');
  }

  useEffect(() => {
    if (isEmpty(session)) {
      return;
    }
    // if (hasSessionExpired(session)) {
    //   clearSession();
    //   return;
    // }
    console.log("session is valid", session);
    setState(session.state);
  }, [session]);

  useEffect(() => {
    if (isEmpty(sessionId)) {
      setState('session_expired');
      return;
    }
    //, findCredential(sessionId)
    Promise.all([findSession(sessionId)])
      .then(r => {
        console.log(r[0]);
        if (r[0] !== null) {
          setSession(r[0]);
        }
        // if (r[1] !== null && r[1].state === 'issued') {
          // setCredential(r[1]);
        // }
      });
  }, [sessionId]);

  const isAuthenticated = !isEmpty(user);
  const isReturningUser = !isEmpty(session) && session.state === 'connected' && !isAuthenticated && isEmpty(credential);
  const hasCredential = !isEmpty(credential);
  const requiresInvitation = !isEmpty(session) && sessionId && state === 'none';
  const isInvalid = isEmpty(session) && !sessionId && state === 'session_expired';

  function handleConnection(invitation) {
    createSession(invitation, sessionId).then(setSession);
  }

  function handleCredential(cred) {
    setCredential(cred);
  }

  function handleCredentialDelete() {
    setCredential(null);
  }

  return (
    <DashboardLayout>
      <div className="py-10 max-w-4xl mx-auto text-[#00304b]">
        <h1>Get your GHG Credential</h1>
        <h4 className="text-xl font-light mb-8">Use your Credential Wallet application to connect and Receive Verifiable Credentials</h4>

        <div>sessionID: {sessionId}</div>
        <div>state: {state}</div>
        <div>requiresInvitation: {requiresInvitation ? 'y' : 'n'}</div>
        <div>hasCredential: {hasCredential ? 'y' : 'n'}</div>
        <div>isAuthenticated: {isAuthenticated ? 'y' : 'n'}</div>
        <div>isReturningUser: {isReturningUser ? 'y' : 'n'}</div>

        {state !== 'loading' && (
          <>
            {/* User has credential, yay */}
            {hasCredential && (<DisplayCredentialComponent credential={credential} session={session} onDelete={handleCredentialDelete}/>)}

            {/* User is coming back after some time, let them present FarmID again */}
            {isReturningUser && (<ReturningUserComponent session={session} onCredential={handleCredential} />)}

            {/* No connection set up yet, allow the user to create it */}
            {requiresInvitation && (<CreateInvitationComponent onConnected={handleConnection}/>)}

            {/* Invalid Session Detected */}
            {isInvalid && (<InvalidSessionComponent/>)}
          </>
        )}

        {state === 'loading' && (<LoadingComponent/>)}


      </div>

    </DashboardLayout>
  )
}

function DisplayCredentialComponent({ credential, session, onDelete }) {
  function handleDeleteCredentialClick() {
    if (confirm('Are you sure you want to reset your Scope 3 Emissions data?')) {
      fetch(`/api/credentials?session_id=${session.id}`, {
        method: "DELETE",
      }).then(() => {
        onDelete();
      });
    }
  }
  return (
    <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden border border-[#00304b]">
      <h1 className="text-xl leading-tight border-b bg-[#333] text-white bg-[#00304b] px-4 py-4 font-semibold">Your Scope 3 Has been Verified</h1>
      <div className="grid grid-cols-2 bg-white gap-4 p-6">
        {Object.keys(get(credential, 'claims', {})).map((k, i) => (
          <div key={i} className="max-h-64 overflow-hidden ellipsis">
            <div className="text-gray-600 mb-1 text-xs">{k}: </div>
            <div className="text-black text-md">
              <ClaimItem name={k} value={get(credential, `claims.${k}`)}/>
            </div>
          </div>
        ))}
      </div>
      <div>
        <button className="btn btn-danger hover:text-red-600" onClick={handleDeleteCredentialClick}>Delete Credential</button>
      </div>
    </div>
  )
}

function InvalidSessionComponent() {
  return (
    <div>
      <h2 className="text-rose-400">Invalid Session, Please restart the demo</h2>
      <a href={process.env.NEXT_PUBLIC_DEMO_URL}><span className="underline">Click here</span> to go back to the demo homepage</a>
    </div>
  )
}

function ClaimItem({ name, value }) {
  switch (name) {
    case 'representative_id':
      return <a href={`mailto:${value}`} className="underline">{value}</a>
    case 'satellite_image_url':
      return <img src={value} alt="" className="!h-64 !w-auto"/>
    case 'ncap_score':
      return <h1 className="text-3xl font-bold">{value}</h1>
    case 'shape_geo_json':
      return <div className="">{value}</div>
    default:
      return <span>{value}</span>
  }
}


function ReturningUserComponent({ session, existingVerification = null, onCredential }) {

  const [state, setState] = useState({status: 'pending',});
  // const [user, setUser] = useState(null);

  const user = {
    id: session.contact_id,
    // invitation_id: session.invitation_id,
    attributes: {
      farm_name: 'abc123',
      physical_address_line_1: 'abc123',
      physical_address_line_2: 'abc123',
      physical_address_postal_code: 'abc123',
      physical_address_city: 'abc123',
      physical_address_subnational: 'abc123',
    }
  }

  const planHeader = (<Link className="block leading-tight hover:text-gray-100" href="/">
    <div className="font-semibold leading-tight">{get(user, 'attributes.farm_name')}</div>
    <div className="text-xs">
      {get(user, 'attributes.physical_address_line_1')}&nbsp;
      {get(user, 'attributes.physical_address_line_2')}&nbsp;
      {get(user, 'attributes.physical_address_postal_code')}&nbsp;
      {get(user, 'attributes.physical_address_city')}&nbsp;
      {get(user, 'attributes.physical_address_subnational')}
    </div>
  </Link>)

  function handleGHGClick() {
    const sessionId = window.sessionStorage.getItem('session_id');
    const body = {
      session_id: sessionId,
      contact_id: user.id,
      attributes: user.attributes,
    }
    setState({
      status: 'issuing_credential',
      ...body
    });

    fetch(`/api/credentials`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(r => {
      if (r.ok) {
        setState({
          status: 'issuance_successful',
        });

        return r.json()
      }

      throw new Error(r.statusText);
    }).catch(err => {
      setState({
        status: 'issuance_failed',
        error: err.message,

      });
      console.error({err});
    })
  }

  return (
    <div className="py-12 ">
      <div className="mb-12">
        <h3>Reporting</h3>
      </div>

      <div className="panel mb-4">
        <div className="panel-header flex items-centerpy-4">
          <div className="text-sm font-semibold ">GHG Report</div>
        </div>
        <div className="panel-body p-8">
          <button
            onClick={handleGHGClick}
            className={classNames({
              "btn btn-primary": true,
              "opacity-50 !cursor-not-allowed": ["issuing_credential"].includes(state.status),
            })}
            disabled={["issuing_credential"].includes(state.status)}
          >
            {state.status === 'issuing_credential' && ('Issuing credential...')}
            {state.status === 'issuance_successful' && ('Credential issued successfully')}
            {state.status === 'issuance_failed' && ('Credential failed')}
            {state.status === 'pending' && ('Issue GHG Credential')}
          </button>
        </div>
      </div>

      <div className="panel mb-4">
        <div className="panel-header flex items-center px-8 py-4">
          <div className="text-sm font-semibold ">
            C02-E GREENHOUSE GAS EMISSIONS (Kg/ha) Jul 22 - Jun 23
          </div>
        </div>
        <div className="panel-body p-8">
          <img src="/panel-graph-one.png" alt=""/>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header flex items-center px-8 py-4">
          <div className="text-sm font-semibold ">
            C02-E GREENHOUSE GAS EMISSIONS (Kg/ha) Jul 22 - Jun 23
          </div>
        </div>
        <div className="panel-body p-8">
          <img src="/panel-graph-two.png" alt=""/>
        </div>
      </div>
    </div>
  )
}

function LoadingComponent() {
  return (
    <div>
      Loading..
    </div>
  )
}

function CreateInvitationComponent({ onConnected }) {
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const interval = useRef(null);

  function handleInviteClick() {
    setIsLoading(true);
    createInvitation()
      .then(setInvitation)
      .catch(err => {
        console.error({err});
      });
  }

  useEffect(() => {
    if (isEmpty(invitation)) return;

    interval.current = setInterval(() => {
      handleInvitationSync();
    }, 2500);

    return () => {
      clearInterval(interval.current);
    }
  }, [invitation]);

  async function handleInvitationSync() {
    getInvitation(invitation.invitation_id)
      .then(inv => {
        setInvitation(inv.invitation);

        if (inv.invitation.state === 'active') {
          return onConnected(inv.invitation)
        }
      })
  }

  const hasInvitation = !isEmpty(invitation) && invitation.invitation_url;

  return (
    <div>
      {!hasInvitation && (
        <button className="btn btn-primary" onClick={handleInviteClick}>Connect to Credential Wallet</button>
      )}

      {hasInvitation && (
        <div className="mb-4">
          <div className="p-2 rounded border bg-white inline-block">
            <QRCode
              value={invitation.invitation_url}
              size={256}
              renderAs="svg"
            />
            <div className="bg-blue-100 p-2 border-blue-600 text-blue-600 font-semibold text-sm text-center">Scan using your Credential Wallet</div>
          </div>
        </div>
      )}
    </div>
  )
}
