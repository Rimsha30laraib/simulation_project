import React, { useState } from "react";

function MultiServerSimulation() {
  const [lambda, setLambda] = useState(2.96);
  const [mu, setMu] = useState(2.58);
  const [num, setNum] = useState(5);
  const [server, setServer] = useState(2);
  const [results, setResults] = useState(null);

  const poissonCumulative = (lamb, k) => {
    let cumulativeProb = 0;
    for (let x = 0; x <= k; x++) {
      const prob = (Math.exp(-lamb) * Math.pow(lamb, x)) / factorial(x);
      cumulativeProb += prob;
    }
    return cumulativeProb;
  };

  const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));

  const runSimulation = () => {
    const serviceTimes = Array.from({ length: num }, () => {
      let service;
      do {
        const randomNumber = Math.random();
        service = Math.round(-mu * Math.log(randomNumber));
      } while (service < 1);
      return service;
    });

    const ranges = [];
    let previousCp = 0;
    const cpArray = [];
    for (let i = 0; i < num; i++) {
      const cp = poissonCumulative(lambda, i);
      ranges.push({ lower: previousCp, upper: cp, minVal: i });
      cpArray.push(cp);
      previousCp = cp;
    }

    const interArrival = [0];
    for (let i = 1; i < num; i++) {
      let ia;
      do {
        ia = Math.random();
      } while (ia >= cpArray[cpArray.length - 1]);
      interArrival.push(ia);
    }

    let arrival = 0;
    const arrivalTimes = [];
    const iaFinalArray = [];

    interArrival.forEach((ia) => {
      let iaFinal = -1;
      ranges.forEach((range) => {
        if (range.lower <= ia && ia < range.upper) {
          iaFinal = range.minVal;
        }
      });

      arrival += iaFinal;
      arrivalTimes.push(arrival);
      iaFinalArray.push(iaFinal); // Ensure iaFinal is properly set here
    });

    const patientDetails = [];
    let previousCpForIA = 0;
    for (let i = 0; i < num; i++) {
      const cpVal = poissonCumulative(lambda, i);
      const minVal = i;
      const iaRange = `${previousCpForIA.toFixed(6)} - ${cpVal.toFixed(6)}`;
      const iaFinal = iaFinalArray[i]; // Correctly using iaFinal from iaFinalArray

      patientDetails.push({
        patientNo: i + 1,
        serviceTime: serviceTimes[i],
        cpLookup: previousCpForIA.toFixed(6),
        cp: cpVal.toFixed(6),
        min: minVal,
        iaRange,
        iaFinal: iaFinal, // Ensure iaFinal is valid here
        arrival: arrivalTimes[i],
      });
      previousCpForIA = cpVal;
    }

    const Start_Time = Array(num).fill(0);
    const Finish_Time = Array(num).fill(0);
    const Turnaround_Time = Array(num).fill(0);
    const Waiting_Time = Array(num).fill(0);
    const Response_Time = Array(num).fill(0);

    const serverAvailability = Array(server).fill(0);
    const serverTasks = Array(server).fill(0).map(() => []);
    const serverBusyTime = Array(server).fill(0);

    const processOrder = [...Array(num).keys()].sort(
      (a, b) => arrivalTimes[a] - arrivalTimes[b]
    );

    processOrder.forEach((i) => {
      let assignedServer = -1;
      for (let s = 0; s < server; s++) {
        if (serverAvailability[s] <= arrivalTimes[i]) {
          assignedServer = s;
          break;
        }
      }

      if (assignedServer === -1) {
        assignedServer = serverAvailability.indexOf(
          Math.min(...serverAvailability)
        );
      }

      Start_Time[i] = Math.max(
        serverAvailability[assignedServer],
        arrivalTimes[i]
      );
      Finish_Time[i] = Start_Time[i] + serviceTimes[i];
      Turnaround_Time[i] = Finish_Time[i] - arrivalTimes[i];
      Response_Time[i] = Start_Time[i] - arrivalTimes[i];
      Waiting_Time[i] = Turnaround_Time[i] - serviceTimes[i];

      serverAvailability[assignedServer] = Finish_Time[i];
      serverBusyTime[assignedServer] += serviceTimes[i];
      serverTasks[assignedServer].push({
        start: Start_Time[i],
        finish: Finish_Time[i],
        process: i,
      });
    });

    const serverUtilization = serverBusyTime.map(
      (busyTime) => busyTime / serviceTimes.reduce((a, b) => a + b, 0)
    );

    const metrics = {
      avgWT: Waiting_Time.reduce((a, b) => a + b) / num,
      avgRT: Response_Time.reduce((a, b) => a + b) / num,
      avgTAT: Turnaround_Time.reduce((a, b) => a + b) / num,
      avgST: serviceTimes.reduce((a, b) => a + b) / num,
      overallUtilization: serverUtilization.reduce((a, b) => a + b, 0),
    };

    setResults({
      patientDetails: {
        serviceTimes,
        arrivalTimes,
        Start_Time,
        Finish_Time,
        Turnaround_Time,
        Waiting_Time,
        Response_Time,
        cpLookup: patientDetails.map((detail) => detail.cpLookup),
        cp: patientDetails.map((detail) => detail.cp),
        min: patientDetails.map((detail) => detail.min),
        iaRange: patientDetails.map((detail) => detail.iaRange),
        iaFinal: patientDetails.map((detail) => detail.iaFinal),
      },
      metrics,
      serverUtilization,
      serverTasks,
    });
  };

  return (
    <div>
      <h1>Multi-Server Simulation</h1>
      <div>
        <label>Lambda (λ): </label>
        <input
          type="number"
          value={lambda}
          onChange={(e) => setLambda(parseFloat(e.target.value))}
        />
        <label>Mu (μ): </label>
        <input
          type="number"
          value={mu}
          onChange={(e) => setMu(parseFloat(e.target.value))}
        />
        <label>Number of Patients: </label>
        <input
          type="number"
          value={num}
          onChange={(e) => setNum(parseInt(e.target.value))}
        />
        <label>Number of Servers: </label>
        <input
          type="number"
          value={server}
          onChange={(e) => setServer(parseInt(e.target.value))}
        />
        <button onClick={runSimulation}>Run Simulation</button>
      </div>

      {results && (
        <div>
          <h2>Patient Details with IA Information</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Patient #</th>
                <th>Service Time</th>
                <th>CP Lookup</th>
                <th>CP</th>
                <th>MIN</th>
                <th>IA RANGE</th>
                <th>IA FINAL</th>
                <th>ARRIVAL</th>
              </tr>
            </thead>
            <tbody>
              {results.patientDetails.serviceTimes.map((_, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{results.patientDetails.serviceTimes[i]}</td>
                  <td>{results.patientDetails.cpLookup[i]}</td>
                  <td>{results.patientDetails.cp[i]}</td>
                  <td>{results.patientDetails.min[i]}</td>
                  <td>{results.patientDetails.iaRange[i]}</td>
                  <td>{results.patientDetails.iaFinal[i]}</td>
                  <td>{results.patientDetails.arrivalTimes[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Patient Details</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Patient #</th>
                <th>Arrival Time</th>
                <th>Service Time</th>
                <th>Start Time</th>
                <th>Finish Time</th>
                <th>Turnaround Time</th>
                <th>Waiting Time</th>
                <th>Response Time</th>
              </tr>
            </thead>
            <tbody>
              {results.patientDetails.serviceTimes.map((_, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{results.patientDetails.arrivalTimes[i]}</td>
                  <td>{results.patientDetails.serviceTimes[i]}</td>
                  <td>{results.patientDetails.Start_Time[i]}</td>
                  <td>{results.patientDetails.Finish_Time[i]}</td>
                  <td>{results.patientDetails.Turnaround_Time[i]}</td>
                  <td>{results.patientDetails.Waiting_Time[i]}</td>
                  <td>{results.patientDetails.Response_Time[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Server Utilization</h3>
          <table border="1">
            <thead>
              <tr>
                <th>Server</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {results.serverUtilization.map((utilization, i) => (
                <tr key={i}>
                  <td>Server {i + 1}</td>
                  <td>{utilization}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h3>Metrics</h3>
          <p>Average Waiting Time: {results.metrics.avgWT}</p>
          <p>Average Response Time: {results.metrics.avgRT}</p>
          <p>Average Turnaround Time: {results.metrics.avgTAT}</p>
          <p>Average Service Time: {results.metrics.avgST}</p>
          {/* <p>Overall Server Utilization: {results.metrics.overallUtilization}</p> */}

         
        </div>
      )}
    </div>
  );
}

export default MultiServerSimulation;