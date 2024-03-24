import { Button } from "@mantine/core";
import { NavLink } from "@remix-run/react";
import classes from "./NewRadioshowButton.module.css";
console.log(classes);

export const NewRadioshowButton = () => {
  return (
    <NavLink to={"/create"}>
      <Button
        className={"pulse-new-radioshow-button"}
        size="lg"
        variant="filled"
        radius={"lg"}
        style={{ position: "fixed", right: 30, bottom: 50, zIndex: 1000 }}
      >
        新規登録
      </Button>
    </NavLink>
  );
};
