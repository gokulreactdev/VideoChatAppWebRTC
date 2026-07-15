import { createContext, useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { io } from "socket.io-client";

const SocketContext = createContext();

// Connect to backend URL from env. For combined deploys prefer same origin.
const backendUrl =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof window !== "undefined" ? window.location.origin : "/");

const socketOptions = {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
};

const socket = io(backendUrl, socketOptions);
// Debug logs for socket connection
console.log("Socket backendUrl:", backendUrl);
socket.on("connect", () => console.log("Socket connected (client)", socket.id));
socket.on("connect_error", (err) =>
  console.error("Socket connect_error (client):", err),
);
socket.on("disconnect", (reason) =>
  console.log("Socket disconnected (client):", reason),
);

const SocketContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [me, setMe] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [call, setCall] = useState(null);
  const [callEnded, setCallEnded] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [name, setName] = useState("");
  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const connectPeerRef = useRef();

  useEffect(() => {
    const requestMedia = () => {
      setPermissionDenied(false);
      setPermissionError(null);
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
          setStream(currentStream);
          if (myVideoRef.current) myVideoRef.current.srcObject = currentStream;
        })
        .catch((err) => {
          console.warn("getUserMedia error:", err);
          setPermissionDenied(true);
          setPermissionError(err?.message || "Permission denied");
        });
    };

    requestMedia();

    // socket event handlers
    socket.on("connect", () => setConnectionStatus("connected"));
    socket.on("disconnect", () => setConnectionStatus("disconnected"));
    socket.on("connect_error", () => setConnectionStatus("error"));

    socket.on("me", (id) => setMe(id));

    socket.on("calluser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });

    // cleanup listeners on unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("me");
      socket.off("calluser");
    };
  }, []);

  const requestPermissions = async () => {
    try {
      setPermissionDenied(false);
      setPermissionError(null);
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(currentStream);
      if (myVideoRef.current) myVideoRef.current.srcObject = currentStream;
      return true;
    } catch (err) {
      console.warn("requestPermissions error:", err);
      setPermissionDenied(true);
      setPermissionError(err?.message || "Permission denied");
      return false;
    }
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answercall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      userVideoRef.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectPeerRef.current = peer;
  };
  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("calluser", {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (currentStream) => {
      userVideoRef.current.srcObject = currentStream;
    });

    socket.on("callaccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectPeerRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectPeerRef.current.destroy();
    window.location.reload();
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideoRef,
        userVideoRef,
        stream,
        permissionDenied,
        permissionError,
        connectionStatus,
        requestPermissions,
        name,
        setName,
        me,
        callEnded,
        callUser,
        leaveCall,
        answerCall,
        connectPeerRef,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContextProvider, SocketContext };
