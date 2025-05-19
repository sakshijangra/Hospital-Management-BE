import React, { useState } from 'react';

const DiseaseCard = ({ diseaseInfo }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Check if diseaseInfo is valid and contains required fields
  if (!diseaseInfo || !diseaseInfo.name) {
    return null;
  }
  
  const { name, description, symptoms, causes, treatments, preventions } = diseaseInfo;
  
  // Ensure arrays exist
  const symptomsList = symptoms || [];
  const causesList = causes || [];
  const treatmentsList = treatments || [];
  const preventionsList = preventions || [];
  
  return (
    <div className="disease-card">
      <div className="disease-header" onClick={toggleExpand}>
        <h4>{name}</h4>
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
      </div>
      
      <div className="disease-description">
        <p>{description}</p>
      </div>
      
      {expanded && (
        <div className="disease-details">
          {symptomsList.length > 0 && (
            <div className="detail-section">
              <h5>Symptoms</h5>
              <ul>
                {symptomsList.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            </div>
          )}
          
          {causesList.length > 0 && (
            <div className="detail-section">
              <h5>Causes</h5>
              <ul>
                {causesList.map((cause, index) => (
                  <li key={index}>{cause}</li>
                ))}
              </ul>
            </div>
          )}
          
          {treatmentsList.length > 0 && (
            <div className="detail-section">
              <h5>Treatments</h5>
              <ul>
                {treatmentsList.map((treatment, index) => (
                  <li key={index}>{treatment}</li>
                ))}
              </ul>
            </div>
          )}
          
          {preventionsList.length > 0 && (
            <div className="detail-section">
              <h5>Prevention</h5>
              <ul>
                {preventionsList.map((prevention, index) => (
                  <li key={index}>{prevention}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiseaseCard;