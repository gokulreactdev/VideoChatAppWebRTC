import { createContext, useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { io } from "socket.io-client";

const SocketContext = createContext();

const socket = io("http://localhost:8000");

const SocketContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [me, setMe] = useState(null);
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

    socket.on("me", (id) => setMe(id));

    socket.on("calluser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
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
