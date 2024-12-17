## Dependencies needed

### To install dhis2

`yarn add @dhis2/cli`

### To be able to see map

`npm install react-leaflet@2 leaflet`

### To be able to see charts

`npm install chart.js`
`npm install react-chartjs-2`

This project was bootstrapped with [DHIS2 Application Platform](https://github.com/dhis2/app-platform).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner and runs all available tests found in `/src`.<br />

See the section about [running tests](https://platform.dhis2.nu/#/scripts/test) for more information.

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

## Functionality

The DHIS2 app provides functionality for planning, registering and reporting school inspections.

- The school planner provides an overview of schools and their need for inspections, allowing school inspectors to plan visits accordingly. The overview is presented by a map, where the colored clickable dots represent the schools and their varying needs for inspections. Their significance is described by a sidebar with clickable categories, which filter the display of schools according to category of "need-for-visit" chosen:

  - Black: Shows all schools.
  - Red: Schools vith a low score from previous visit, and in need for a follow-up.
  - Yellow: Schools that have not been visited in a while, and consequently in need for inspection.
  - Green: Schools in good condition and in need.
    When clicking a dot, and overview of previous registered data appear along with the option to "Plan visit" for the chosen school. A visit is planned by simply chosing and confirming a date.

- The option of school inspection allows school inspectors to register the condition and data of a school through a standardized form. This functionality is provided by the "Scheduled Inspection", where inspections for scheduled can be initiated by their respective "Start inspection"-buttons. It is also possible to access an empty form with no pre-determined association to a school by choosing "Create New School Inspection". The form is designed with the aim of collecting standardized data. It provides the School inspectors with options to verify whether facilities and resources are available through "Yes/no" options. The dynamic properties of the form allow the availablity of the option for assessing facilities/resources only when they are present and "Yes" is chosen.

- The report provides and overview of the welfare and progress of schools, based on the data collected through the "School inspection"-form.
  - "Report summary" provides a summary of all schools within a district,merging and comparing their data to visualize the state and progress of their resources and over all school conditions.
  - "Data over time" presents the collected data of a specific school, vizualising the progress of their availability of resources.
  - "Compare Data" allow for the comparison of the resource/fascilities conditions of schools chosen by the user.

## Implementation

The app was implemented on top of the open-source software platform DHIS2, and written in JSX using libraries like React, Leaflet and Chart.js to realize its functionality.

- The app communicates with a DHIS2 server through its API, which allows access to functionality, as well as the ability to read, modify and write data to a DHIS2 instance.
- React allowed the implementation of user interfaces using JacaScript components, such as those made available by the DHIS2 UI Storybook.
- Leaflet provided the functionality of interactive maps, allowing users to engage with and utilize the color-coordinated map in the "Plan visit"-option.
- Chart.js enabled data vizualisation of school data, both registered and fetched from the DHIS2-API, through the use of charts in the "Report"-option.

## Further development

For further development, we want to include the ability to edit and delete inspection forms in the "School Inspection Overview". Due to constraints in terms of time and permission access to the API, this was not fully achieved until the project deadline. The "Edit" and "Delete" buttons are therefore displayed to express desired functionality.
