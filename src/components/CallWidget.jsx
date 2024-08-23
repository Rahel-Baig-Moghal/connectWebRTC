import React, { useState } from 'react';
import { ConnectClient, StartWebRTCContactCommand, StopContactCommand } from "@aws-sdk/client-connect";

const CallWidget = () => {
  const [contactId, setContactId] = useState(null);
  const [callInProgress, setCallInProgress] = useState(false);
  const [error, setError] = useState(null);

  const client = new ConnectClient({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    }
  });

  const startCall = async () => {
    const input = {
      ContactFlowId: import.meta.env.VITE_CONTACT_FLOW_ID, // required
      InstanceId: import.meta.env.VITE_INSTANCE_ID, // required
      ParticipantDetails: {
        DisplayName: "Agent Name", // required
      },
      AllowedCapabilities: {
        Customer: {
          Video: "SEND",
        },
        Agent: {
          Video: "SEND",
        },
      },
    };

    const command = new StartWebRTCContactCommand(input);

    try {
      const response = await client.send(command);
      setContactId(response.ContactId);
      setCallInProgress(true);
      console.log("Call started:", response);
    } catch (err) {
      setError(err);
      console.error("Error starting call:", err);
    }
  };

  const endCall = async () => {
    if (!contactId) {
      return;
    }

    const input = {
      ContactId: contactId,
      InstanceId: import.meta.env.VITE_INSTANCE_ID, // required
    };

    const command = new StopContactCommand(input);

    try {
      await client.send(command);
      setCallInProgress(false);
      setContactId(null);
      console.log("Call ended");
    } catch (err) {
      setError(err);
      console.error("Error ending call:", err);
    }
  };

  return (
    <div style={styles.widget}>
      {!callInProgress ? (
        <button onClick={startCall} style={styles.button}>
          Start Call
        </button>
      ) : (
        <>
          <p>Call in progress...</p>
          <button onClick={endCall} style={styles.button}>
            End Call
          </button>
        </>
      )}
      {error && <p style={styles.error}>Error: {error.message}</p>}
    </div>
  );
};

const styles = {
  widget: {
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    width: '200px',
    textAlign: 'center',
    backgroundColor: '#f8f8f8',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    margin: '10px 0',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default CallWidget;
