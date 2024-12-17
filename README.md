# School Inspection App
The School Inspection App aims to digitize school inspections to improve planning, reporting, and school management. Built on the DHIS2 platform, it combines interactive maps, standardized forms, and insightful reports with the following goals:
1. Streamline Data Collection: Replace paper-based forms with standardized digital inputs and validations.
2. Facilitate Inspection Planning: Identify schools needing follow-ups or overdue for visits.
3. Generate Reports: Provide actionable feedback to head teachers and support performance tracking.

## Key features
The DHIS2 app provides functionality for planning, registering and reporting school inspections.
1. Plan Inspections
- View schools on an interactive map with color-coded categories:
  - Black: All schools.
  - Red: Schools needing follow-up (low previous scores).
  - Yellow: Schools not visited recently (inspection needed).
  - Green: Schools in good condition.
- Click on a school to see latest data and plan a visit by selecting a date.
2. Conduct Inspections
- Start scheduled inspections or create a new inspection.
- Fill out a standardized form with dynamic "Yes/No" options (skip logic) for assessing facilities and resources.
3. View Reports
- Report Summary: District and school-level overview comparing school inspection data.
- Data Over Time: Visualize a specific school's progress.
- Compare Data: Compare resource conditions across selected schools

## Implementation
The app was implemented on top of the open-source software platform DHIS2, and written in JSX using libraries like React, Leaflet and Chart.js to realize its functionality.

- The app communicates with a DHIS2 server through its API, which allows access to functionality, as well as the ability to read, modify and write data to a DHIS2 instance.
- React allowed the implementation of user interfaces using JavaScript components, such as those made available by the DHIS2 UI Storybook.
- Leaflet provided the functionality of interactive maps, allowing users to engage with and utilize the color-coordinated map in the "Plan visit"-option.
- Chart.js enabled data vizualisation of school data, both registered and fetched from the DHIS2-API, through the use of charts in the "Report"-option.


## Preview
<img src="/src/images/desktop.png"/>
<img src="/src/images/form.png"/>
<img src="/src/images/report.png"/>
<img src="/src/images/overtime.png"/>
<img src="/src/images/compare.png"/>

## Further development
- Add functionality to edit and delete inspections.

# Setup & Dependencies
## Prerequisites
To install required dependencies, run:

```
yarn add @dhis2/cli

npm install react-leaflet@2 leaflet

npm install chart.js react-chartjs-2
```

This project was bootstrapped with [DHIS2 Application Platform](https://github.com/dhis2/app-platform).

## Run the App
`yarn start`
- Runs the app in development mode at `http://localhost:3000`

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
A deployable `.zip` file can be found in `build/bundle`!

See the section about [building](https://platform.dhis2.nu/#/scripts/build) for more information.

### `yarn deploy`

Deploys the built app in the `build` folder to a running DHIS2 instance.<br />
This command will prompt you to enter a server URL as well as the username and password of a DHIS2 user with the App Management authority.<br/>
You must run `yarn build` before running `yarn deploy`.<br />

See the section about [deploying](https://platform.dhis2.nu/#/scripts/deploy) for more information.

## Learn More

You can learn more about the platform in the [DHIS2 Application Platform Documentation](https://platform.dhis2.nu/).

You can learn more about the runtime in the [DHIS2 Application Runtime Documentation](https://runtime.dhis2.nu/).

To learn React, check out the [React documentation](https://reactjs.org/).


