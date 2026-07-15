import React, { useContext } from "react";
import { Button, Paper, Typography, makeStyles } from "@material-ui/core";
import { SocketContext } from "../SocketContext";

const useStyles = makeStyles((theme) => ({
  paper: {
    maxWidth: 720,
    margin: "20px auto",
    padding: 20,
    textAlign: "center",
    border: "1px solid #f0f0f0",
    backgroundColor: "#fff3f3",
  },
  actions: {
    marginTop: 16,
    display: "flex",
    justifyContent: "center",
    gap: 12,
  },
}));

const PermissionDenied = () => {
  const classes = useStyles();
  const { permissionError, requestPermissions } = useContext(SocketContext);

  return (
    <Paper className={classes.paper} elevation={3}>
      <Typography variant="h6" gutterBottom>
        Camera & Microphone Access Required
      </Typography>
      <Typography variant="body1">
        This app needs access to your camera and microphone to make video calls.
        {permissionError ? ` (${permissionError})` : ""}
      </Typography>
      <div style={{ marginTop: 12 }}>
        <Typography variant="caption">
          If you denied access, re-enable camera/microphone for this site in
          your browser settings, then press Retry.
        </Typography>
      </div>
      <div className={classes.actions}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => requestPermissions()}
        >
          Retry Permissions
        </Button>
        <Button
          variant="outlined"
          color="default"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </div>
    </Paper>
  );
};

export default PermissionDenied;
