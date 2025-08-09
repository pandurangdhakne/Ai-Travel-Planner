from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore
import google.generativeai as genai # type: ignore
from dotenv import load_dotenv  # type: ignore
import os
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("⚠ GEMINI_API_KEY not found. Please set it in your .env file.")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')


# Update the SYSTEM_PROMPT to include journey overview information
SYSTEM_PROMPT = """
You are an expert travel planner AI that creates detailed itineraries with journey overviews. 
Your responses must include:

1. ALWAYS INCLUDE:
   - **Journey Overview**:
     * STARTING POINT details (name, address, description)
     * DESTINATION description
     * ROUTE SUMMARY (key highlights of the journey)
   - **Daily Itinerary**:
     * Activities with exact time, duration, cost (in ₹)
     * Precise locations with full address and coordinates (lat/lng)
     * Transportation between locations
   - **Local Transportation Options**:
     * Type (metro/bus/taxi/bicycle/walking/train/tram/ferry)
     * Name of service/system
     * Description
     * Typical costs (in ₹)
     * Helpful tips
   - **Summary**:
     * Total estimated cost (₹)
     * Budget status ("under budget" / "within budget" / "over budget")
     * Key themes
     * List of forts visited (if requested)
     * Destination description
     * Route summary

2. Detailed local transportation options at the destination with:
   - Type (metro/bus/taxi/bicycle/walking/train/tram/ferry)
   - Name of service/system
   - Description
   - Typical costs
   - Helpful tips    

3. BUDGET LOGIC (IN ₹):
   - BEFORE GENERATING A PLAN, CALCULATE THE TOTAL ESTIMATED COST
   - IF total cost **EXCEEDS** user’s budget:
     * IF trip is NOT possible within budget → RETURN message: `"Not possible in this budget, increase your budget"` and DO NOT provide a plan
     * IF budget is low BUT alternative cheaper plan exists → RETURN alternative plan WITHIN budget
   - IF cost is **within budget** → RETURN the plan as normal  
   

Response JSON Format:
{
    "starting_point": {
        "name": "Starting location",
        "address": "Full address",
        "description": "Brief description"
    },
    "itinerary": [
        {
            "day": 1,
            "activities": [
                {
                    "time": "Morning/Afternoon/Evening",
                    "description": "Activity details",
                    "duration": "X hours",
                    "cost": "₹X",
                    "transportation": "Transport method",
                    "location": {
                        "name": "Location name",
                        "address": "Full address",
                        "lat": latitude,
                        "lng": longitude
                    }
                }
            ]
        }
    ],

    "local_transport": [
        {
            "type": "metro",
            "name": "City Metro System",
            "description": "Fast and efficient subway system covering all major areas",
            "cost": "₹2-5 per ride",
            "tips": "Purchase a rechargeable metro card for discounts"
        },
        {
            "type": "taxi",
            "name": "City Cabs",
            "description": "24/7 taxi service available throughout the city",
            "cost": "₹10-30 depending on distance",
            "tips": "Use the official taxi app for better rates"
        }
    ],

    "summary": {
        "total_estimated_cost": "₹X",
        "budget_status": "",
        "key_themes": [],
        "forts_visited": [],
        "destination_description": "",
        "route_summary": ""
    }
}
"""

@app.route('/plan', methods=['POST'])
def plan_trip():
    try:
        data = request.json
        
        # Construct user prompt
        user_prompt = f"""
        Create a detailed travel itinerary from {data.get('startingPoint', 'Not specified')} to {data.get('destination', 'Not specified')}.

        Trip Details:
        - Travel Dates: {data.get('startDate', 'Not specified')} to {data.get('endDate', 'Not specified')}
        - Budget: ₹{data.get('budget', 'Not specified')}
        - Number of Travelers: {data.get('travelers', 1)}
        - Interests: {', '.join(data.get('interests', []))}
        - Special Requirements: {data.get('specialRequirements', 'None')}

        Instructions:
        1. FIRST, check if the total estimated trip cost can be completed within the given budget in Indian Rupees.
        - If NOT possible, reply ONLY with: "Not possible in this budget, increase your budget" and do NOT provide a plan.
        - If a cheaper alternative plan exists, provide it instead (within budget).
        2. If within budget, create:
        - **Journey Overview** with:
            * Starting point details (name, address, description)
            * Destination description
            * Route summary (key highlights)
        - **Daily Itinerary** for each travel day:
            * Time of day, activity description, duration, cost (₹)
            * Exact location names, full addresses, lat/lng coordinates
            * Transportation method between locations
        - **Local Transportation Options** at the destination:
            * Type, name of service, description, cost in ₹, helpful tips
        - **Summary**:
            * Total estimated cost (₹)
            * Budget status ("under budget", "within budget", "over budget")
            * Key themes
            * List of forts visited (if any)
            * Destination description
            * Route summary
                
        Provide a detailed itinerary in the specified JSON format.
        """
        
        # Generate response from Gemini
        response = model.generate_content(SYSTEM_PROMPT + user_prompt)
        
        # Parse the response (Gemini returns Markdown, so we need to extract JSON)
        try:
            # Try to find JSON in the response
            json_str = response.text[response.text.find('{'):response.text.rfind('}')+1]
            itinerary_data = json.loads(json_str)
            return jsonify(itinerary_data)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return jsonify({"error": "Could not parse AI response", "response": response.text}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)