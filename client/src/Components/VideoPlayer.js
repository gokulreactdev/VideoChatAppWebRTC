import { Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import React from "react";
import { SocketContext } from "../SocketContext";
import { useContext } from "react";

const useStyles = makeStyles((theme) => ({
  video: {
    width: "550px",
    [theme.breakpoints.down("xs")]: {
      width: "300px",
    },
  },
  gridContainer: {
    justifyContent: "center",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  paper: {
    padding: "10px",
    border: "2px solid black",
    margin: "10px",
  },
}));

const VideoPlayer = () => {
  const styles = useStyles();
  const {
    name,
    callAccepted,
    myVideoRef,
    userVideoRef,
    callEnded,
    stream,
    call,
  } = useContext(SocketContext);

  return (
    <Grid container className={styles.gridContainer}>
      {stream && (
        <Paper className={styles.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {name || "Name"}
            </Typography>
            <video
              playsInline
              muted
              ref={myVideoRef}
              autoPlay
              className={styles.video}
            />
          </Grid>
        </Paper>
      )}
      {callAccepted && !callEnded && (
        <Paper className={styles.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {call?.name || "Name"}
            </Typography>
            <video
              playsInline
              ref={userVideoRef}
              autoPlay
              className={styles.video}
            />
          </Grid>
        </Paper>
      )}
    </Grid>
  );
};

export default VideoPlayer;
