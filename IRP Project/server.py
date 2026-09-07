from flask import Flask, jsonify, send_file
import requests
import math
import sqlite3
from datetime import datetime, timezone
import time


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

# Minimum time between actual OpenSky requests
# The browser can request /api/flights every 20 seconds,
# but OpenSky will only be contacted once every 60 seconds.
OPENSKY_CACHE_SECONDS = 60


# ============================================================
# MEMORY CACHE
# ============================================================

last_successful_aircraft = []

last_opensky_request_time = 0

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
# SAVE FLIGHTS TO DATABASE
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
# GET LIVE OPENSKY DATA
# ============================================================

def get_live_aircraft():

    global last_successful_aircraft
    global last_opensky_request_time
    global last_successful_request_time
    global last_opensky_error

    current_time = time.time()

    # --------------------------------------------------------
    # CACHE
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
    # MAKE REQUEST
    # --------------------------------------------------------

    last_opensky_request_time = current_time

    print("Fetching live OpenSky data...")

    try:

        response = requests.get(
            OPENSKY_URL,
            timeout=15,
            headers={
                "User-Agent": "GlobalFlightRadar-CollegeProject/1.0"
            }
        )

        response.raise_for_status()

        data = response.json()

        states = data.get("states", [])

        aircraft_list = []


        # ----------------------------------------------------
        # PROCESS AIRCRAFT
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


            # Need a valid position
            if latitude is None or longitude is None:
                continue


            # ------------------------------------------------
            # GEOFENCE
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
        # SAVE SUCCESSFUL DATA
        # ----------------------------------------------------

        last_successful_aircraft = aircraft_list

        last_successful_request_time = time.time()

        last_opensky_error = None


        print(
            "OpenSky success:",
            len(aircraft_list),
            "aircraft inside geofence"
        )


        # Save to database
        save_flights_to_database(
            aircraft_list
        )


        return aircraft_list, "LIVE"


    # ========================================================
    # RATE LIMIT / OTHER ERROR
    # ========================================================

    except requests.exceptions.HTTPError as error:

        last_opensky_error = str(error)

        print(
            "OpenSky HTTP error:",
            error
        )


        # ----------------------------------------------------
        # IMPORTANT:
        # Don't kill the radar if OpenSky temporarily
        # rate-limits us.
        # ----------------------------------------------------

        if last_successful_aircraft:

            print(
                "OpenSky unavailable."
            )

            print(
                "Showing last successful flight data."
            )

            return (
                last_successful_aircraft,
                "LIVE_CACHED"
            )


        # No previous data exists yet
        return [], "RATE_LIMITED"


    except requests.exceptions.RequestException as error:

        last_opensky_error = str(error)

        print(
            "OpenSky connection error:",
            error
        )


        if last_successful_aircraft:

            print(
                "Showing last successful flight data."
            )

            return (
                last_successful_aircraft,
                "LIVE_CACHED"
            )


        return [], "OFFLINE"


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


        return [], "ERROR"


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


    # --------------------------------------------------------
    # Search by callsign OR ICAO24 internally
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # No history
    # --------------------------------------------------------

    if not rows:

        return jsonify({

            "found": False,

            "callsign": search_value,

            "icao24": None,

            "country": "Unknown",

            "record_count": 0,

            "history": []

        })


    # --------------------------------------------------------
    # Convert rows to JSON
    # --------------------------------------------------------

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
    print("       GLOBAL FLIGHT RADAR")
    print("==============================================")
    print("")
    print("Radar mode: LIVE OPENSKY")
    print("Airport:", AIRPORT_NAME)
    print("Airport code:", AIRPORT_CODE)
    print("Geofence:", GEOFENCE_RADIUS_KM, "km")
    print("Database logging: ENABLED")
    print("OpenSky cache:", OPENSKY_CACHE_SECONDS, "seconds")
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