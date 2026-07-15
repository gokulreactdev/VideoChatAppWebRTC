import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Notifications, Options, VideoPlayer } from "./Components";
import PermissionDenied from "./Components/PermissionDenied";
import { useContext } from "react";
import { SocketContext } from "./SocketContext";
import { AppBar, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderRadius: 15,
    margin: "30px 100px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "600px",
    border: "2px solid #FF0000",
    backgroundColor: "#ffffff",
    color: "#FF0000",

    [theme.breakpoints.down("xs")]: {
      width: "90%",
    },
  },
  image: {
    marginLeft: "15px",
  },
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
}));

function App() {
  const classes = useStyles();
  const { permissionDenied } = useContext(SocketContext);

  return (
    <div className={classes.wrapper}>
      {/* Show permission UI if user denied camera/mic */}
      {permissionDenied && <PermissionDenied />}
      <AppBar position="static" color="inherit" className={classes.appBar}>
        <Typography variant="h4" align="center" style={{ fontWeight: 700 }}>
          StreamConnect
        </Typography>
      </AppBar>

      <VideoPlayer />
      <Options>
        <Notifications />
      </Options>
    </div>
  );
}

export default App;
