import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

function MGSimulate() {
  const navigate = useNavigate();
  const [arrivalDistribution, setArrivalDistribution] = useState('Uniform');
  const [serviceDistribution, setServiceDistribution] = useState('Normal');

  const handleSubmit = () => {

    if (arrivalDistribution === 'Normal' && serviceDistribution === 'Normal') {
      navigate('/GG_norm_norm'); // Navigate when conditions are met
    } 
    if (arrivalDistribution === 'Normal' && serviceDistribution === 'Uniform') {
      navigate('/GG_norm_uni'); // Navigate when conditions are met
    } 
    if (arrivalDistribution === 'Uniform' && serviceDistribution === 'Uniform') {
      navigate('/GG_uni_uni'); // Navigate when conditions are met
    } 
    if (arrivalDistribution === 'Uniform' && serviceDistribution === 'Normal') {
      navigate('/GG_uni_norm'); // Navigate when conditions are met
    } 
    else {
      console.log(`Selected Arrival: ${arrivalDistribution}, Service: ${serviceDistribution}`); // Log selected values if conditions don't match
    }
  };

  return (
    <div>
      <h1>G/G/S Simulation</h1>
      <div>
        <label>Arrival Distribution: </label>
        <select 
          value={arrivalDistribution} 
          onChange={(e) => setArrivalDistribution(e.target.value)}
        >
          <option value="Normal">Normal</option>
          <option value="Uniform">Uniform</option>
        </select>
      </div>

      <div>
        <label>Service Distribution: </label>
        <select 
          value={serviceDistribution} 
          onChange={(e) => setServiceDistribution(e.target.value)}
        >
          <option value="Normal">Normal</option>
          <option value="Uniform">Uniform</option>
        </select>
      </div>

      <button onClick={handleSubmit}>Start Simulation</button>
    </div>
  );
}

export default MGSimulate;
