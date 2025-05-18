import React, { useState } from 'react';

const DiseaseCard = ({ diseaseInfo }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const { name, description, symptoms, causes, treatments, preventions, image } = diseaseInfo || {};
  
  if (!diseaseInfo) return null;
  
  return (
    <div className="disease-card">
      <div className="disease-header" onClick={toggleExpand}>
        <h3>{name}</h3>
        <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>
          {expanded ? '▼' : '▶'}
        </span>
      </div>
      
      <div className="disease-brief">
        {image && (
          <div className="disease-image">
            <img src={image} alt={name} onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/80x80?text=No+Image";
            }} />
          </div>
        )}
        <p>{description}</p>
      </div>
      
      {expanded && (
        <div className="disease-details">
          {symptoms && symptoms.length > 0 && (
            <div className="disease-section">
              <h4>Symptoms:</h4>
              <ul>
                {symptoms.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            </div>
          )}
          
          {causes && causes.length > 0 && (
            <div className="disease-section">
              <h4>Causes:</h4>
              <ul>
                {causes.map((cause, index) => (
                  <li key={index}>{cause}</li>
                ))}
              </ul>
            </div>
          )}
          
          {treatments && treatments.length > 0 && (
            <div className="disease-section">
              <h4>Treatments:</h4>
              <ul>
                {treatments.map((treatment, index) => (
                  <li key={index}>{treatment}</li>
                ))}
              </ul>
            </div>
          )}
          
          {preventions && preventions.length > 0 && (
            <div className="disease-section">
              <h4>Prevention:</h4>
              <ul>
                {preventions.map((prevention, index) => (
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