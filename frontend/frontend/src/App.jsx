

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------


import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { LeafyGreen } from 'lucide-react';
// import bgVideo from "./assets/bg-video.mp4"; // put your video in src/assets







function App() {
  const [formData, setFormData] = useState({
    startingPoint: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: 1,
    interests: [],
    specialRequirements: '',
    includeForts: true
  });

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const interestOptions = [
    'Adventure', 'History', 'Architecture', 'Nature', 'Photography',
    'Cultural', 'Food', 'Shopping', 'Relaxation', 'Beaches'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInterestChange = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/plan', formData);
      setItinerary(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate itinerary');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Simple map embed
  const SimpleMap = ({ location }) => (
    <div className="map-container">
      <iframe
        title="location-map"
        width="100%"
        height="400"
        src={`https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
        style={{ border: 0 }}
        allowFullScreen
      />
    </div>
  );

  // Direction map showing route
  const DirectionMap = ({ start, end }) => (
    <div className="map-container">
      <iframe
        title="direction-map"
        width="100%"
        height="400"
        src={`https://www.google.com/maps?q=${encodeURIComponent(start)}%20to%20${encodeURIComponent(end)}&output=embed`}
        style={{ border: 0 }}
        allowFullScreen
      />
    </div>
  );

  // Transport type to emoji mapping
  const transportEmoji = {
    metro: '🚇',
    bus: '🚌',
    taxi: '🚖',
    bicycle: '🚲',
    walking: '🚶‍♂️',
    train: '🚂',
    tram: '🚊',
    ferry: '⛴️',
    scooter: '🛴',
    rideshare: '🚗'
  };

  return (

<>
    <div className="app adventure-theme">
      <header className="header">
        <h1 className="title-glitch">AI Travel Planner</h1>
        <p className="subtitle" style={{color:'whitesmoke'}}> Adventure is calling, and I must go—again!  </p>
        <div className="compass-icon">🏰</div>
      </header>
      
      <div className="container">
        <form onSubmit={handleSubmit} className="form adventure-form">
          <div className="form-group">
            <label>Starting Point</label>
            <input
              type="text"
              name="startingPoint"
              value={formData.startingPoint}
              onChange={handleChange}
              required
              placeholder="City or address where your journey begins"
            />
          </div>

          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              required
              placeholder="City or place you want to visit"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate}
                onChange={handleChange}
                style={{background:"skyblue"}}
              />
            </div>
           
            <div className="form-group">
              <label>End Date</label>
              <input 
                type="date" 
                name="endDate" 
                value={formData.endDate}
                onChange={handleChange}
                style={{background:"skyblue"}}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Budget</label>
              <input 
                type="number" 
                name="budget" 
                value={formData.budget}
                onChange={handleChange}
                min="0"
                placeholder="Estimated total budget"
              />
            </div>
            
            <div className="form-group">
              <label>Travelers</label>
              <input 
                type="number" 
                name="travelers" 
                value={formData.travelers}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Interests</label>
            <div className="interests-container">
              {interestOptions.map(interest => (
                <button
                  type="button"
                  key={interest}
                  className={`interest-btn ${formData.interests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => handleInterestChange(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Special Requirements</label>
            <textarea 
              name="specialRequirements" 
              value={formData.specialRequirements}
              onChange={handleChange}
              rows="3"
              placeholder="Accessibility needs, dietary restrictions, etc."
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="includeForts"
                checked={formData.includeForts}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              Include historical forts in itinerary
            </label>
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                Planning Your Adventure...
              </>
            ) : (
              'Generate Itinerary'
            )}
          </button>
        </form>
        
        {error && (
          <div className="error">
            <p>{error}</p>
            <p>Please check your inputs and try again.</p>
          </div>
        )}
        
        {itinerary && (
          <div className="itinerary-container slide-up">
            {/* Journey Overview Section */}
            <div className="journey-overview">
              <h3>Your Journey Route</h3>
              <DirectionMap 
                start={itinerary.starting_point?.address || formData.startingPoint}
                end={formData.destination}
              />
              
              <div className="route-details">
                <div className="route-point start-point">
                  <h4>Starting Point</h4>
                  <p className="location-name">{itinerary.starting_point?.name}</p>
                  <p className="location-address">{itinerary.starting_point?.address}</p>
                  {itinerary.starting_point?.description && (
                    <p className="location-description">{itinerary.starting_point?.description}</p>
                  )}
                </div>
                
                <div className="route-point end-point">
                  <h4>Destination</h4>
                  <p className="location-name">{formData.destination}</p>
                  {itinerary.summary?.destination_description && (
                    <p className="location-description">{itinerary.summary.destination_description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Local Transport Options Section */}
            <div className="local-transport-section">
              <h3>Local Transportation Options at {formData.destination}</h3>
              <div className="transport-grid">
                {itinerary.local_transport?.map((transport, index) => (
                  <div key={index} className={`transport-card ${transport.type}`}>
                    <div className="transport-icon">
                      {transportEmoji[transport.type] || '🚏'}
                    </div>
                    <div className="transport-details">
                      <h4>{transport.name}</h4>
                      <p className="transport-description">{transport.description}</p>
                      <div className="transport-info">
                        <span className="transport-cost">💵 {transport.cost || 'Varies'}</span>
                        {transport.tips && (
                          <span className="transport-tips">💡 {transport.tips}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary Details */}
            <h2>Your {itinerary.summary?.key_themes?.join(', ')} Itinerary</h2>
            <div className="summary">
              <p><strong>Total Estimated Cost:</strong> {itinerary.summary?.total_estimated_cost}</p>
              <p><strong>Budget Status:</strong> {itinerary.summary?.budget_status}</p>
              
              {itinerary.summary?.forts_visited?.length > 0 && (
                <div className="forts-summary">
                  <h4>Forts You'll Visit:</h4>
                  <div className="forts-list">
                    {itinerary.summary.forts_visited.map((fort, index) => (
                      <div key={index} className="fort-item">
                        <span className="fort-icon">🏰</span>
                        <span>{fort}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {itinerary.itinerary?.map(day => (
              <div key={day.day} className="day-card">
                <h3>Day {day.day}{day.date && ` (${day.date})`}</h3>
                <div className="activities">
                  {day.activities?.map((activity, idx) => (
                    <div key={idx} className={`activity ${activity.location?.type === 'fort' ? 'fort-activity' : ''}`}>
                      <div className="activity-time">{activity.time}</div>
                      <div className="activity-details">
                        <h4>
                          {activity.description}
                          {activity.location?.type === 'fort' && (
                            <span className="fort-badge">🏰 Fort Visit</span>
                          )}
                        </h4>
                        <p className="activity-meta">
                          <span>⏱️ {activity.duration}</span>
                          <span>💰 {activity.cost}</span>
                          {activity.transportation && (
                            <span>🚗 {activity.transportation}</span>
                          )}
                        </p>
                        {activity.location && (
                          <p className="location">
                            <strong>📍 Location:</strong> {activity.location.name}, {activity.location.address}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="map-section">
              <h3>Destination Map</h3>
              <SimpleMap location={formData.destination} />
            </div>
          </div>
        )}
      </div>

      {/* Background elements */}
      <div className="adventure-bg-elements">
        <div className="clouds"></div>
        <div className="mountains"></div>
        <div className="fort-silhouette"></div>
      </div>



      {/* <video autoPlay muted loop id="bg-video">
        <source src={bgVideo} type="video/mp4" />
        
      </video> */}



    </div>


</>    

  );
}

export default App;