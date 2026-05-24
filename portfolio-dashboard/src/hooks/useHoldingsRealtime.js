import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as signalR from '@microsoft/signalr';
import { holdingsApi } from '../services/api/holdingsApi';
import {
  getPortfolioHubUrl,
  HOLDINGS_UPDATED_EVENT,
} from '../services/signalr/config';

let sharedConnection = null;
let subscriberCount = 0;
let startPromise = null;
const statusListeners = new Set();

function notifyStatus(status) {
  statusListeners.forEach((listener) => listener(status));
}

function getConnection() {
  if (!sharedConnection) {
    sharedConnection = new signalR.HubConnectionBuilder()
      .withUrl(getPortfolioHubUrl())
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    sharedConnection.onreconnecting(() => notifyStatus('reconnecting'));
    sharedConnection.onreconnected(() => notifyStatus('connected'));
    sharedConnection.onclose(() => notifyStatus('disconnected'));
  }
  return sharedConnection;
}

function ensureStarted(connection) {
  if (connection.state === signalR.HubConnectionState.Connected) {
    return Promise.resolve();
  }
  if (connection.state === signalR.HubConnectionState.Connecting && startPromise) {
    return startPromise;
  }
  startPromise = connection.start().finally(() => {
    startPromise = null;
  });
  return startPromise;
}

function scheduleStop() {
  setTimeout(() => {
    if (subscriberCount === 0 && sharedConnection) {
      sharedConnection.stop().catch(() => {});
      sharedConnection = null;
      startPromise = null;
    }
  }, 0);
}

/**
 * Subscribes to server-pushed holdings updates (replaces polling).
 * Returns live connection status for the UI.
 */
export function useHoldingsRealtime() {
  const dispatch = useDispatch();
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const connection = getConnection();
    subscriberCount += 1;

    const onStatus = (status) => setConnectionStatus(status);
    statusListeners.add(onStatus);

    const onHoldingsUpdated = (holdings) => {
      dispatch(
        holdingsApi.util.upsertQueryData('getHoldings', undefined, holdings),
      );
    };

    connection.on(HOLDINGS_UPDATED_EVENT, onHoldingsUpdated);

    let active = true;

    ensureStarted(connection)
      .then(() => {
        if (active) {
          setConnectionStatus('connected');
        }
      })
      .catch((err) => {
        if (active && !err?.message?.includes('stopped during negotiation')) {
          setConnectionStatus('disconnected');
          console.warn('SignalR connection failed:', err);
        }
      });

    return () => {
      active = false;
      subscriberCount -= 1;
      statusListeners.delete(onStatus);
      connection.off(HOLDINGS_UPDATED_EVENT, onHoldingsUpdated);
      scheduleStop();
    };
  }, [dispatch]);

  return connectionStatus;
}
