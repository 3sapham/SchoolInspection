import classes from "../App.module.css";
import { Tag } from "@dhis2/ui";

export function FormBox(props) {
  return (
    <div className={classes.innerBoxTag}>
      <Tag neutral>{props.tagName}</Tag>
      <div className={classes.innerBoxContent}>
        {React.Children.map(
          props.children,
          (
            child // Map through each child element passed to the component
          ) => (
            <div key={child.key}>{child}</div>
          )
        )}
      </div>
    </div>
  );
}
