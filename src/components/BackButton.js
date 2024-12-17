import classes from "../App.module.css";
import { Button, IconArrowLeft24 } from "@dhis2/ui";

export function BackButton(props) {
  return (
    <Button
      large
      icon={<IconArrowLeft24 />}
      ariaLabel="Button"
      name="Primary button"
      onClick={() => props.activePageHandler("Home")}
      title="Button"
      value="default"
      className={classes.redirectButton}
    >
      Go back
    </Button>
  );
}
