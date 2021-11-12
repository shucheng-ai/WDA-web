import Driver from 'driver.js';
import 'driver.js/dist/driver.min.css';

function createDriver(steps, option, v) {
  let driver = new Driver(option);

  if (v) {
    v.project.cad.driver = driver;
  }

  driver.defineSteps(steps);

  driver.start();

  return driver;
}

export { createDriver };
