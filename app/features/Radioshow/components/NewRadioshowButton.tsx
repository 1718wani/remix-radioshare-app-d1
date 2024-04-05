import { Button } from "@mantine/core";
import { NavLink } from "@remix-run/react";
import classes from "../../../styles/pulseNewButton.module.css";

export const NewRadioshowButton = () => {
  return (
    <NavLink to={"/create"}>
      <Button
        className={"pulse-new-button"}
        size="lg"
        variant="filled"
        radius={"lg"}
        style={{ position: "fixed", right: 30, bottom: 50, zIndex: 3 }}
        key={classes.pulse}
      >
        新規登録
      </Button>
    </NavLink>
  );
};
