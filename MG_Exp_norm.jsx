import React, { useState } from "react";

function MGSimulation() {
  const [lambda, setLambda] = useState(2);  // Added state for lambda
  const [mu, setMu] = useState(2.58);
  const [sd, setSd] = useState(2.58);
  const [num, setNum] = useState(5);
  const [server, setServer] = useState(1);
  const [data, setData] = useState(null);

  const ExpCumulative = (lamb, k) => {
    let cumulativeProb = 0;
    for (let x = 0; x <= k; x++) {
       const m=1/lamb
       const prob = 1-(Math.exp(-m*x)) ;
      cumulativeProb += prob;
    }
    return cumulativeProb;
  };


  const generateData = (mu, sd) => {
    const random = Math.random;
    const serviceTimes = Array(num)
      .fill(0)
      .map(() => {
        let service;
        do {
          const r1 = random();
          const r2 =random();
          service = Math.round( mu + sd * (Math.cos(2 * Math.PI * r1) * Math.sqrt(-2 * Math.log(r2))));  // Uniform distribution without rounding
        } while (service < 1); // Ensure service time is greater than 1
        return service;
      });
    

    const ranges = [];
    const cpArray = [];
    let previousCp = 0;

    for (let i = 0; i < num; i++) {
      const cp = ExpCumulative(lambda, i);  // Using lambda here
      ranges.push({ lower: previousCp, upper: cp, minVal: i });
      cpArray.push(cp);
      previousCp = cp;
    }

    const interArrival = [0];
    for (let i = 1; i < num; i++) {
      let ia;
      do {
        ia = random();
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
      iaFinalArray.push(iaFinal);  // Ensure iaFinal is properly set here
    });

    const patientDetails = [];
    let previousCpForIA = 0;
    for (let i = 0; i < num; i++) {
      const cpVal = ExpCumulative(lambda, i);
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
        iaFinal: iaFinal,  // Ensure iaFinal is valid here
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
    const serverTasks = Array(server)
      .fill(0)
      .map(() => []);

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
        assignedServer = serverAvailability.indexOf(Math.min(...serverAvailability));
      }

      Start_Time[i] = Math.max(serverAvailability[assignedServer], arrivalTimes[i]);
      Finish_Time[i] = Start_Time[i] + serviceTimes[i];
      Turnaround_Time[i] = Finish_Time[i] - arrivalTimes[i];
      Response_Time[i] = Start_Time[i] - arrivalTimes[i];
      Waiting_Time[i] = Turnaround_Time[i] - serviceTimes[i];
      serverAvailability[assignedServer] = Finish_Time[i];

      serverTasks[assignedServer].push({
        start: Start_Time[i],
        finish: Finish_Time[i],
        process: i,
      });
    });

    const metrics = {
      serverTasks,
      avgWT: Waiting_Time.reduce((a, b) => a + b) / num,
      avgRT: Response_Time.reduce((a, b) => a + b) / num,
      avgTAT: Turnaround_Time.reduce((a, b) => a + b) / num,
      avgST: serviceTimes.reduce((a, b) => a + b) / num,
      utilization:
        (Finish_Time.reduce((a, b) => a + b) - Start_Time.reduce((a, b) => a + b)) /
        (server * Math.max(...Finish_Time)),
    };

    setData({
      patientDetails,
      serviceTimes,
      arrivalTimes,
      Start_Time,
      Finish_Time,
      Turnaround_Time,
      Waiting_Time,
      Response_Time,
      metrics,
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
        <label>Mu: </label>
        <input
          type="number"
          value={mu}
          onChange={(e) => setMu(parseFloat(e.target.value))}
        />
        <label>Standard Deviation: </label>
        <input
          type="number"
          value={sd}
          onChange={(e) => setSd(parseFloat(e.target.value))}
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
      <button onClick={() => {
        console.log('Running simulation...');
        generateData(mu,sd);
        }}>Run Simulation</button>

      </div>
      {data && (
        <>
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
              {data.patientDetails.map((patient, i) => (
                <tr key={i}>
                  <td>{patient.patientNo}</td>
                  <td>{patient.serviceTime}</td>
                  <td>{patient.cpLookup}</td>
                  <td>{patient.cp}</td>
                  <td>{patient.min}</td>
                  <td>{patient.iaRange}</td>
                  <td>{patient.iaFinal}</td>
                  <td>{patient.arrival}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Patient Details</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Patient #</th>
                <th>Service Time</th>
                <th>Arrival Time</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Response Time</th>
                <th>Turnaround Time</th>
                <th>Waiting Time</th>
              </tr>
            </thead>
            <tbody>
              {data.patientDetails.map((patient, i) => (
                <tr key={i}>
                  <td>{patient.patientNo}</td>
                  <td>{patient.serviceTime}</td>
                  <td>{patient.arrival}</td>
                  <td>{data.Start_Time[i]}</td>
                  <td>{data.Finish_Time[i]}</td>
                  <td>{data.Response_Time[i]}</td>
                  <td>{data.Turnaround_Time[i]}</td>
                  <td>{data.Waiting_Time[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Simulation Metrics</h2>
          <p>Average Waiting Time: {data.metrics.avgWT}</p>
          <p>Average Response Time: {data.metrics.avgRT}</p>
          <p>Average Turnaround Time: {data.metrics.avgTAT}</p>
          <p>Average Service Time: {data.metrics.avgST}</p>
          <p>Server Utilization: {data.metrics.utilization}</p>
        </>
      )}
    </div>
  );
}

export default MGSimulation;
