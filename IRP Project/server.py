from flask import Flask, jsonify, send_file
import requests
import math
import sqlite3
from datetime import datetime, timezone
import time
import random


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)


# ============================================================
# AIRPORT SETTINGS
# ============================================================

AIRPORT_NAME = "London Heathrow"
AIRPORT_CODE = "LHR"

AIRPORT_LAT = 51.4700
AIRPORT_LON = -0.4543

GEOFENCE_RADIUS_KM = 100


# ============================================================
# DATABASE
# ============================================================

DATABASE = "flight_tracker.db"


# ============================================================
# OPENSKY SETTINGS
# ============================================================

OPENSKY_URL = "https://opensky-network.org/api/states/all"

# Only contact OpenSky once every 60 seconds.
OPENSKY_CACHE_SECONDS = 60


# ============================================================
# MEMORY CACHE
# ============================================================

last_successful_aircraft = []

last_successful_request_time = 0

last_opensky_error = None


# ============================================================
# DATABASE SETUP
# ============================================================

def setup_database():

    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Flight_Logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            icao24 TEXT,
            callsign TEXT,
            country TEXT,
            latitude REAL,
            longitude REAL,
            altitude REAL,
            velocity REAL,
            heading REAL,
            vertical_rate REAL,
            flight_phase TEXT,
            distance_from_airport REAL
        )
    """)

    connection.commit()

    connection.close()


# ============================================================
# HAVERSINE DISTANCE
# ============================================================

def calculate_distance(lat1, lon1, lat2, lon2):

    R = 6371

    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)

    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return R * c


# ============================================================
# FLIGHT PHASE
# ============================================================

def determine_flight_phase(vertical_rate):

    if vertical_rate is None:
        return "UNKNOWN"

    if vertical_rate > 0.5:
        return "CLIMBING"

    elif vertical_rate < -0.5:
        return "DESCENDING"

    else:
        return "CRUISING"


# ============================================================
# DATABASE LOGGING
# ============================================================

def save_flights_to_database(aircraft_list):

    if not aircraft_list:
        return

    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    timestamp = datetime.now(timezone.utc).isoformat()

    for aircraft in aircraft_list:

        cursor.execute("""
            INSERT INTO Flight_Logs (
                timestamp,
                icao24,
                callsign,
                country,
                latitude,
                longitude,
                altitude,
                velocity,
                heading,
                vertical_rate,
                flight_phase,
                distance_from_airport
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            timestamp,
            aircraft["icao24"],
            aircraft["callsign"],
            aircraft["country"],
            aircraft["latitude"],
            aircraft["longitude"],
            aircraft["altitude"],
            aircraft["velocity"],
            aircraft["heading"],
            aircraft["vertical_rate"],
            aircraft["flight_phase"],
            aircraft["distance_from_airport"]
        ))

    connection.commit()

    connection.close()


# ============================================================
# DEMO AIRCRAFT
# ============================================================
#
# These aircraft are used only when OpenSky is unavailable.
#
# They are positioned around Heathrow so they appear inside
# the 100 km radar circle.
#
# ============================================================

DEMO_AIRCRAFT = [

    # --------------------------------------------------------
    # BRITISH AIRWAYS
    # --------------------------------------------------------

    {
        "icao24": "DEMOBAW01",
        "callsign": "BAW186",
        "country": "United Kingdom",
        "latitude": 51.72,
        "longitude": -0.20,
        "altitude": 9200,
        "velocity": 225,
        "heading": 245,
        "vertical_rate": -4.2
    },

    {
        "icao24": "DEMOBAW02",
        "callsign": "BAW12",
        "country": "United Kingdom",
        "latitude": 51.38,
        "longitude": -0.75,
        "altitude": 6800,
        "velocity": 205,
        "heading": 65,
        "vertical_rate": 3.1
    },


    # --------------------------------------------------------
    # EMIRATES
    # --------------------------------------------------------

    {
        "icao24": "DEMOEK01",
        "callsign": "EK202",
        "country": "United Arab Emirates",
        "latitude": 51.55,
        "longitude": -0.05,
        "altitude": 10400,
        "velocity": 245,
        "heading": 280,
        "vertical_rate": 0.1
    },


    # --------------------------------------------------------
    # QATAR AIRWAYS
    # --------------------------------------------------------

    {
        "icao24": "DEMOQTR01",
        "callsign": "QTR8",
        "country": "Qatar",
        "latitude": 51.25,
        "longitude": -0.30,
        "altitude": 5400,
        "velocity": 190,
        "heading": 15,
        "vertical_rate": -5.0
    },


    # --------------------------------------------------------
    # JAZEERA AIRWAYS 🇰🇼
    # --------------------------------------------------------

    {
        "icao24": "DEMOJ9AIR01",
        "callsign": "J9101",
        "country": "Kuwait",
        "latitude": 51.62,
        "longitude": -0.58,
        "altitude": 7600,
        "velocity": 215,
        "heading": 120,
        "vertical_rate": -1.8
    },

    {
        "icao24": "DEMOJ9AIR02",
        "callsign": "J9125",
        "country": "Kuwait",
        "latitude": 51.31,
        "longitude": -0.12,
        "altitude": 4300,
        "velocity": 175,
        "heading": 310,
        "vertical_rate": 2.7
    },


    # --------------------------------------------------------
    # KUWAIT AIRWAYS 🇰🇼
    # --------------------------------------------------------

    {
        "icao24": "DEMOKU01",
        "callsign": "KU101",
        "country": "Kuwait",
        "latitude": 51.48,
        "longitude": -0.82,
        "altitude": 8500,
        "velocity": 230,
        "heading": 90,
        "vertical_rate": 0.0
    },

    {
        "icao24": "DEMOKU02",
        "callsign": "KU103",
        "country": "Kuwait",
        "latitude": 51.82,
        "longitude": -0.48,
        "altitude": 6100,
        "velocity": 200,
        "heading": 190,
        "vertical_rate": -3.4
    },


    # --------------------------------------------------------
    # SAUDIA 🇸🇦
    # --------------------------------------------------------

    {
        "icao24": "DEMOSV01",
        "callsign": "SV101",
        "country": "Saudi Arabia",
        "latitude": 51.68,
        "longitude": -0.72,
        "altitude": 9700,
        "velocity": 240,
        "heading": 135,
        "vertical_rate": 0.3
    },

    {
        "icao24": "DEMOSV02",
        "callsign": "SV107",
        "country": "Saudi Arabia",
        "latitude": 51.20,
        "longitude": -0.65,
        "altitude": 7200,
        "velocity": 210,
        "heading": 35,
        "vertical_rate": 4.0
    },


    # --------------------------------------------------------
    # RIYADH AIR 🇸🇦
    # --------------------------------------------------------

    {
        "icao24": "DEMORX01",
        "callsign": "RX101",
        "country": "Saudi Arabia",
        "latitude": 51.57,
        "longitude": -0.40,
        "altitude": 11200,
        "velocity": 255,
        "heading": 250,
        "vertical_rate": 0.0
    },

    {
        "icao24": "DEMORX02",
        "callsign": "RX105",
        "country": "Saudi Arabia",
        "latitude": 51.42,
        "longitude": -0.05,
        "altitude": 5900,
        "velocity": 195,
        "heading": 330,
        "vertical_rate": -2.4
    },


    # --------------------------------------------------------
    # OMAN AIR 🇴🇲
    # --------------------------------------------------------

    {
        "icao24": "DEMOWY01",
        "callsign": "WY101",
        "country": "Oman",
        "latitude": 51.76,
        "longitude": -0.02,
        "altitude": 8900,
        "velocity": 235,
        "heading": 210,
        "vertical_rate": 1.5
    },

    {
        "icao24": "DEMOWY02",
        "callsign": "WY105",
        "country": "Oman",
        "latitude": 51.34,
        "longitude": -0.92,
        "altitude": 4800,
        "velocity": 180,
        "heading": 75,
        "vertical_rate": -4.0
    },


    # --------------------------------------------------------
    # GULF AIR 🇧🇭
    # --------------------------------------------------------

    {
        "icao24": "DEMOGF01",
        "callsign": "GF1",
        "country": "Bahrain",
        "latitude": 51.52,
        "longitude": -0.90,
        "altitude": 10300,
        "velocity": 250,
        "heading": 155,
        "vertical_rate": 0.0
    },

    {
        "icao24": "DEMOGF02",
        "callsign": "GF5",
        "country": "Bahrain",
        "latitude": 51.30,
        "longitude": -0.48,
        "altitude": 6500,
        "velocity": 205,
        "heading": 300,
        "vertical_rate": 2.2
    },


    # --------------------------------------------------------
    # AIR FRANCE
    # --------------------------------------------------------

    {
        "icao24": "DEMOAF01",
        "callsign": "AF1381",
        "country": "France",
        "latitude": 51.60,
        "longitude": -0.92,
        "altitude": 7800,
        "velocity": 220,
        "heading": 80,
        "vertical_rate": -1.2
    },


    # --------------------------------------------------------
    # LUFTHANSA
    # --------------------------------------------------------

    {
        "icao24": "DEMOLH01",
        "callsign": "LH920",
        "country": "Germany",
        "latitude": 51.22,
        "longitude": -0.08,
        "altitude": 8200,
        "velocity": 225,
        "heading": 270,
        "vertical_rate": 0.4
    },


    # --------------------------------------------------------
    # TURKISH AIRLINES
    # --------------------------------------------------------

    {
        "icao24": "DEMOTK01",
        "callsign": "TK1971",
        "country": "Türkiye",
        "latitude": 51.78,
        "longitude": -0.85,
        "altitude": 6900,
        "velocity": 210,
        "heading": 165,
        "vertical_rate": -3.0
    }

]


# ============================================================
# BUILD DEMO DATA
# ============================================================

def get_demo_aircraft():

    demo_list = []

    for aircraft in DEMO_AIRCRAFT:

        # Make a copy so the original coordinates stay clean.
        plane = aircraft.copy()

        # Slight movement so demo planes don't look completely frozen.
        plane["latitude"] += random.uniform(-0.005, 0.005)
        plane["longitude"] += random.uniform(-0.005, 0.005)

        # Slightly vary altitude and speed.
        if plane["altitude"] is not None:
            plane["altitude"] += random.randint(-100, 100)

        if plane["velocity"] is not None:
            plane["velocity"] += random.uniform(-3, 3)

        # Determine phase.
        plane["flight_phase"] = determine_flight_phase(
            plane["vertical_rate"]
        )

        # Calculate distance from Heathrow.
        plane["distance_from_airport"] = calculate_distance(
            AIRPORT_LAT,
            AIRPORT_LON,
            plane["latitude"],
            plane["longitude"]
        )

        demo_list.append(plane)

    return demo_list


# ============================================================
# GET LIVE OPENSKY DATA
# ============================================================

def get_live_aircraft():

    global last_successful_aircraft
    global last_successful_request_time
    global last_opensky_error

    current_time = time.time()


    # --------------------------------------------------------
    # USE CACHE
    # --------------------------------------------------------

    if (
        last_successful_aircraft
        and
        current_time - last_successful_request_time
        < OPENSKY_CACHE_SECONDS
    ):

        print("Using cached OpenSky data...")

        return last_successful_aircraft, "LIVE_CACHE"


    # --------------------------------------------------------
    # REQUEST OPENSKY
    # --------------------------------------------------------

    print("Fetching live OpenSky data...")

    try:

        response = requests.get(
            OPENSKY_URL,
            timeout=15,
            headers={
                "User-Agent":
                "GlobalFlightRadar-CollegeProject/1.0"
            }
        )

        response.raise_for_status()

        data = response.json()

        states = data.get("states", [])

        aircraft_list = []


        # ----------------------------------------------------
        # PROCESS STATE VECTORS
        # ----------------------------------------------------

        for aircraft in states:

            if len(aircraft) < 12:
                continue


            icao24 = aircraft[0]

            callsign = (
                aircraft[1].strip()
                if aircraft[1]
                else "Unknown"
            )

            country = aircraft[2] or "Unknown"

            longitude = aircraft[5]

            latitude = aircraft[6]

            altitude = aircraft[7]

            velocity = aircraft[9]

            heading = aircraft[10]

            vertical_rate = aircraft[11]


            # Need a valid position.
            if latitude is None or longitude is None:
                continue


            # ------------------------------------------------
            # 100 KM GEOFENCE
            # ------------------------------------------------

            distance = calculate_distance(
                AIRPORT_LAT,
                AIRPORT_LON,
                latitude,
                longitude
            )


            if distance > GEOFENCE_RADIUS_KM:
                continue


            # ------------------------------------------------
            # FLIGHT PHASE
            # ------------------------------------------------

            flight_phase = determine_flight_phase(
                vertical_rate
            )


            aircraft_list.append({

                "icao24": icao24,

                "callsign": callsign,

                "country": country,

                "latitude": latitude,

                "longitude": longitude,

                "altitude": altitude,

                "velocity": velocity,

                "heading": heading,

                "vertical_rate": vertical_rate,

                "flight_phase": flight_phase,

                "distance_from_airport": distance

            })


        # ----------------------------------------------------
        # SUCCESS
        # ----------------------------------------------------

        last_successful_aircraft = aircraft_list

        last_successful_request_time = time.time()

        last_opensky_error = None


        print(
            "OpenSky success:",
            len(aircraft_list),
            "aircraft inside geofence"
        )


        # Save live data.
        save_flights_to_database(
            aircraft_list
        )


        return aircraft_list, "LIVE"


    # ========================================================
    # OPENSKY ERROR
    # ========================================================

    except requests.exceptions.HTTPError as error:

        last_opensky_error = str(error)

        print(
            "OpenSky HTTP error:",
            error
        )


        # ----------------------------------------------------
        # FIRST CHOICE:
        # LAST SUCCESSFUL DATA
        # ----------------------------------------------------

        if last_successful_aircraft:

            print(
                "Using last successful OpenSky data."
            )

            return (
                last_successful_aircraft,
                "LIVE_CACHED"
            )


        # ----------------------------------------------------
        # NO CACHE:
        # USE DEMO MODE
        # ----------------------------------------------------

        print(
            "No cached data available."
        )

        print(
            "Switching to DEMO aircraft."
        )

        return (
            get_demo_aircraft(),
            "DEMO"
        )


    except requests.exceptions.RequestException as error:

        last_opensky_error = str(error)

        print(
            "OpenSky connection error:",
            error
        )


        if last_successful_aircraft:

            print(
                "Using last successful OpenSky data."
            )

            return (
                last_successful_aircraft,
                "LIVE_CACHED"
            )


        print(
            "Switching to DEMO aircraft."
        )

        return (
            get_demo_aircraft(),
            "DEMO"
        )


    except Exception as error:

        last_opensky_error = str(error)

        print(
            "Unexpected OpenSky error:",
            error
        )


        if last_successful_aircraft:

            return (
                last_successful_aircraft,
                "LIVE_CACHED"
            )


        return (
            get_demo_aircraft(),
            "DEMO"
        )


# ============================================================
# NORMALIZE FLIGHT NUMBER
# ============================================================

def normalize_flight_number(flight_number):

    return (
        flight_number
        .strip()
        .upper()
        .replace(" ", "")
    )


# ============================================================
# LIVE FLIGHTS API
# ============================================================

@app.route("/api/flights")
def flights_api():

    aircraft, source = get_live_aircraft()


    return jsonify({

        "source": source,

        "airport": AIRPORT_NAME,

        "airport_code": AIRPORT_CODE,

        "radius_km": GEOFENCE_RADIUS_KM,

        "aircraft": aircraft,

        "count": len(aircraft),

        "last_successful_update": (
            datetime.fromtimestamp(
                last_successful_request_time,
                timezone.utc
            ).isoformat()
            if last_successful_request_time
            else None
        ),

        "error": last_opensky_error

    })


# ============================================================
# FLIGHT HISTORY API
# ============================================================

@app.route("/api/flight-history/<flight_number>")
def flight_history(flight_number):

    search_value = normalize_flight_number(
        flight_number
    )


    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()


    cursor.execute("""
        SELECT
            timestamp,
            callsign,
            icao24,
            country,
            latitude,
            longitude,
            altitude,
            velocity,
            heading,
            vertical_rate,
            flight_phase,
            distance_from_airport

        FROM Flight_Logs

        WHERE
            UPPER(REPLACE(callsign, ' ', '')) = ?
            OR
            UPPER(icao24) = ?

        ORDER BY id ASC

        LIMIT 500
    """, (
        search_value,
        search_value
    ))


    rows = cursor.fetchall()

    connection.close()


    if not rows:

        return jsonify({

            "found": False,

            "callsign": search_value,

            "icao24": None,

            "country": "Unknown",

            "record_count": 0,

            "history": []

        })


    history = []


    for row in rows:

        history.append({

            "timestamp": row[0],

            "callsign": row[1],

            "icao24": row[2],

            "country": row[3],

            "latitude": row[4],

            "longitude": row[5],

            "altitude": row[6],

            "velocity": row[7],

            "heading": row[8],

            "vertical_rate": row[9],

            "flight_phase": row[10],

            "distance_from_airport": row[11]

        })


    return jsonify({

        "found": True,

        "callsign": rows[0][1],

        "icao24": rows[0][2],

        "country": rows[0][3],

        "record_count": len(history),

        "history": history

    })


# ============================================================
# DATABASE STATS
# ============================================================

@app.route("/api/database-stats")
def database_stats():

    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()


    cursor.execute("""
        SELECT COUNT(*)
        FROM Flight_Logs
    """)

    total_records = cursor.fetchone()[0]


    cursor.execute("""
        SELECT COUNT(DISTINCT icao24)
        FROM Flight_Logs
    """)

    unique_aircraft = cursor.fetchone()[0]


    connection.close()


    return jsonify({

        "total_records": total_records,

        "unique_aircraft": unique_aircraft

    })


# ============================================================
# MAIN MAP
# ============================================================

@app.route("/")
def home():

    return send_file("map.html")


# ============================================================
# 3D MAP
# ============================================================

@app.route("/3d")
def three_d():

    return send_file("3d.html")


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    setup_database()


    print("")
    print("==============================================")
    print("        GLOBAL FLIGHT RADAR")
    print("==============================================")
    print("")
    print("Radar mode: LIVE OPENSKY + DEMO FALLBACK")
    print("Airport:", AIRPORT_NAME)
    print("Airport code:", AIRPORT_CODE)
    print("Geofence:", GEOFENCE_RADIUS_KM, "km")
    print("Database logging: ENABLED")
    print("OpenSky cache:", OPENSKY_CACHE_SECONDS, "seconds")
    print("Demo airlines: Jazeera, Kuwait Airways, Saudia,")
    print("               Riyadh Air, Oman Air, Gulf Air")
    print("")
    print("Open browser:")
    print("http://127.0.0.1:5000")
    print("")
    print("==============================================")
    print("")


    app.run(
        debug=False,
        host="127.0.0.1",
        port=5000
    )