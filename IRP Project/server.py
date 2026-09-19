from flask import Flask, jsonify, send_from_directory
import requests
import math
import sqlite3
import os
import time
from datetime import datetime, timezone

app = Flask(__name__)


# ============================================================
# CONFIGURATION
# ============================================================

AIRPORT_NAME = "London Heathrow"
AIRPORT_CODE = "LHR"

AIRPORT_LAT = 51.4700
AIRPORT_LON = -0.4543

GEOFENCE_RADIUS = 100  # km

DATABASE = "flight_tracker.db"

OPENSKY_URL = "https://opensky-network.org/api/states/all"

# Don't hammer OpenSky.
MIN_REQUEST_INTERVAL = 15

last_request_time = 0
last_successful_aircraft = []
last_successful_time = None


# ============================================================
# OPTIONAL OPENSKY OAUTH
# ============================================================

OPENSKY_CLIENT_ID = os.getenv("OPENSKY_CLIENT_ID")
OPENSKY_CLIENT_SECRET = os.getenv("OPENSKY_CLIENT_SECRET")

access_token = None
access_token_expires = 0


def get_opensky_token():

    global access_token
    global access_token_expires

    if not OPENSKY_CLIENT_ID or not OPENSKY_CLIENT_SECRET:
        return None

    if access_token and time.time() < access_token_expires:
        return access_token

    token_url = (
        "https://auth.opensky-network.org/"
        "auth/realms/opensky-network/protocol/openid-connect/token"
    )

    try:

        response = requests.post(
            token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": OPENSKY_CLIENT_ID,
                "client_secret": OPENSKY_CLIENT_SECRET
            },
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        access_token = data["access_token"]

        expires_in = data.get("expires_in", 1800)

        access_token_expires = time.time() + expires_in - 60

        print("OpenSky OAuth authentication successful.")

        return access_token

    except Exception as error:

        print("OpenSky OAuth failed:", error)

        access_token = None

        return None


# ============================================================
# AIRLINE IDENTIFICATION
# ============================================================
#
# OpenSky provides a callsign such as:
#
# DAL123
# BAW186
# UAE202
# QTR8
#
# The first three letters are commonly the ICAO operator
# designator used in the aircraft callsign.
#
# IMPORTANT:
# This identifies the OPERATING/CALLSIGN carrier.
# It is not necessarily the marketing airline in a codeshare.
#
# ============================================================

AIRLINE_BY_ICAO_CODE = {

    # United States
    "DAL": "Delta Air Lines",
    "AAL": "American Airlines",
    "UAL": "United Airlines",
    "SWA": "Southwest Airlines",
    "ASA": "Alaska Airlines",
    "JBU": "JetBlue Airways",

    # United Kingdom / Ireland
    "BAW": "British Airways",
    "VIR": "Virgin Atlantic",
    "EIN": "Aer Lingus",
    "EXS": "Jet2",
    "EZY": "easyJet",

    # Europe
    "AFR": "Air France",
    "KLM": "KLM Royal Dutch Airlines",
    "DLH": "Lufthansa",
    "EWG": "Eurowings",
    "SWR": "SWISS",
    "ITY": "ITA Airways",
    "IBE": "Iberia",
    "TAP": "TAP Air Portugal",
    "SAS": "SAS Scandinavian Airlines",
    "FIN": "Finnair",
    "LOT": "LOT Polish Airlines",
    "AUA": "Austrian Airlines",
    "THY": "Turkish Airlines",
    "WZZ": "Wizz Air",
    "RYR": "Ryanair",
    "TOM": "TUI Airways",
    "CFG": "Condor",
    "AEA": "Air Europa",

    # Middle East
    "UAE": "Emirates",
    "ETD": "Etihad Airways",
    "QTR": "Qatar Airways",
    "THY": "Turkish Airlines",

    # Saudi Arabia
    "SVA": "Saudia",
    "RXI": "Riyadh Air",

    # Bahrain
    "GFA": "Gulf Air",

    # Kuwait
    "KAC": "Kuwait Airways",
    "JZR": "Jazeera Airways",

    # Oman
    "OMA": "Oman Air",

    # India
    "AIC": "Air India",
    "AXB": "Air India Express",
    "IGO": "IndiGo",
    "SEJ": "SpiceJet",

    # Pakistan
    "PIA": "Pakistan International Airlines",
    "ABQ": "Airblue",
    "SVA": "Saudia",

    # Asia
    "SIA": "Singapore Airlines",
    "CPA": "Cathay Pacific",
    "ANA": "All Nippon Airways",
    "JAL": "Japan Airlines",
    "KAL": "Korean Air",
    "CES": "China Eastern Airlines",
    "CCA": "Air China",
    "CSN": "China Southern Airlines",

    # Australia / New Zealand
    "QFA": "Qantas",
    "VOZ": "Virgin Australia",
    "ANZ": "Air New Zealand",

    # Africa
    "ETH": "Ethiopian Airlines",
    "SAA": "South African Airways",

    # Cargo
    "FDX": "FedEx",
    "UPS": "UPS Airlines",
    "GTI": "Atlas Air",
}


def identify_airline(callsign):

    if not callsign:
        return "Unknown Operator"

    callsign = callsign.strip().upper()

    # Remove spaces
    callsign = callsign.replace(" ", "")

    # Need at least 3 characters
    if len(callsign) < 3:
        return "Unknown Operator"

    # First three characters = ICAO operator code
    icao_code = callsign[:3]

    airline = AIRLINE_BY_ICAO_CODE.get(icao_code)

    if airline:
        return airline

    return "Unknown Operator"


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

            distance_from_airport REAL,

            airline TEXT,

            origin TEXT,

            destination TEXT

        )
    """)

    # --------------------------------------------------------
    # Add columns if an older database already exists
    # --------------------------------------------------------

    cursor.execute("""
        PRAGMA table_info(Flight_Logs)
    """)

    existing_columns = {
        row[1]
        for row in cursor.fetchall()
    }

    if "airline" not in existing_columns:

        cursor.execute("""
            ALTER TABLE Flight_Logs
            ADD COLUMN airline TEXT
        """)

    if "origin" not in existing_columns:

        cursor.execute("""
            ALTER TABLE Flight_Logs
            ADD COLUMN origin TEXT
        """)

    if "destination" not in existing_columns:

        cursor.execute("""
            ALTER TABLE Flight_Logs
            ADD COLUMN destination TEXT
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
        +
        math.cos(lat1)
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
# OPENSKY REQUEST
# ============================================================

def request_opensky_states():

    global last_request_time

    now = time.time()

    # --------------------------------------------------------
    # Don't make another request too quickly.
    # Return cached data instead.
    # --------------------------------------------------------

    if (
        now - last_request_time
        <
        MIN_REQUEST_INTERVAL
    ):

        if last_successful_aircraft:

            print(
                "OpenSky request cooldown active."
            )

            print(
                "Using last successful OpenSky dataset."
            )

            return last_successful_aircraft, True

    last_request_time = now

    # --------------------------------------------------------
    # Heathrow bounding box
    #
    # This reduces the amount of data downloaded.
    # --------------------------------------------------------

    lamin = 50.5
    lamax = 52.5

    lomin = -2.0
    lomax = 1.2

    params = {
        "lamin": lamin,
        "lamax": lamax,
        "lomin": lomin,
        "lomax": lomax
    }

    headers = {}

    token = get_opensky_token()

    if token:

        headers["Authorization"] = (
            f"Bearer {token}"
        )

    try:

        response = requests.get(
            OPENSKY_URL,
            params=params,
            headers=headers,
            timeout=15
        )

        response.raise_for_status()

        data = response.json()

        states = data.get("states", [])

        print(
            f"OpenSky returned {len(states)} state vectors."
        )

        return states, False

    except requests.exceptions.HTTPError as error:

        print(
            "OpenSky HTTP error:",
            error
        )

        if response.status_code == 429:

            print(
                "OpenSky rate limit reached."
            )

        if last_successful_aircraft:

            print(
                "Using last successful OpenSky dataset."
            )

            return last_successful_aircraft, True

        raise

    except Exception as error:

        print(
            "OpenSky request failed:",
            error
        )

        if last_successful_aircraft:

            print(
                "Using last successful OpenSky dataset."
            )

            return last_successful_aircraft, True

        raise


# ============================================================
# GET LIVE AIRCRAFT
# ============================================================

def get_live_aircraft():

    global last_successful_aircraft
    global last_successful_time

    raw_states, using_cache = (
        request_opensky_states()
    )

    aircraft_list = []

    # --------------------------------------------------------
    # Parse OpenSky state vectors
    # --------------------------------------------------------

    for aircraft in raw_states:

        try:

            icao24 = aircraft[0]

            callsign = (
                aircraft[1].strip()
                if aircraft[1]
                else "Unknown"
            )

            country = aircraft[2]

            longitude = aircraft[5]

            latitude = aircraft[6]

            altitude = aircraft[7]

            on_ground = aircraft[8]

            velocity = aircraft[9]

            heading = aircraft[10]

            vertical_rate = aircraft[11]

            geo_altitude = aircraft[13]

            squawk = aircraft[14]

            position_source = aircraft[16]

            # ------------------------------------------------
            # We need a valid position.
            # ------------------------------------------------

            if latitude is None or longitude is None:
                continue

            # ------------------------------------------------
            # Calculate distance from Heathrow.
            # ------------------------------------------------

            distance = calculate_distance(
                AIRPORT_LAT,
                AIRPORT_LON,
                latitude,
                longitude
            )

            # ------------------------------------------------
            # 100 km geofence.
            # ------------------------------------------------

            if distance > GEOFENCE_RADIUS:
                continue

            # ------------------------------------------------
            # Identify airline from callsign.
            # ------------------------------------------------

            airline = identify_airline(
                callsign
            )

            # ------------------------------------------------
            # OpenSky live state vectors do NOT reliably
            # provide live commercial origin/destination.
            #
            # DO NOT GUESS.
            # ------------------------------------------------

            origin = None
            destination = None

            flight_phase = (
                determine_flight_phase(
                    vertical_rate
                )
            )

            aircraft_info = {

                "icao24": icao24,

                "callsign": callsign,

                "flight_number": callsign,

                "airline": airline,

                "operator": airline,

                "origin": origin,

                "destination": destination,

                "country": country,

                "latitude": latitude,

                "longitude": longitude,

                "altitude": altitude,

                "geo_altitude": geo_altitude,

                "velocity": velocity,

                "heading": heading,

                "vertical_rate": vertical_rate,

                "flight_phase": flight_phase,

                "distance_from_airport": distance,

                "on_ground": on_ground,

                "squawk": squawk,

                "position_source": position_source
            }

            aircraft_list.append(
                aircraft_info
            )

        except Exception as error:

            print(
                "Aircraft parsing error:",
                error
            )

            continue

    # --------------------------------------------------------
    # Only replace cache after a REAL successful request.
    # --------------------------------------------------------

    if not using_cache:

        last_successful_aircraft = (
            aircraft_list
        )

        last_successful_time = (
            datetime.now(timezone.utc)
            .isoformat()
        )

        print(
            f"OpenSky live update: "
            f"{len(aircraft_list)} aircraft "
            f"within {GEOFENCE_RADIUS} km."
        )

    else:

        print(
            f"Returning cached dataset: "
            f"{len(aircraft_list)} aircraft."
        )

    return aircraft_list, using_cache


# ============================================================
# SAVE FLIGHTS TO DATABASE
# ============================================================

def save_flights_to_database(
    aircraft_list
):

    if not aircraft_list:
        return

    connection = sqlite3.connect(
        DATABASE
    )

    cursor = connection.cursor()

    timestamp = (
        datetime.now(timezone.utc)
        .isoformat()
    )

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
                distance_from_airport,
                airline,
                origin,
                destination

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

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

            aircraft["distance_from_airport"],

            aircraft["airline"],

            aircraft["origin"],

            aircraft["destination"]

        ))

    connection.commit()

    connection.close()


# ============================================================
# API: LIVE FLIGHTS
# ============================================================

@app.route("/api/flights")
def api_flights():

    try:

        aircraft, using_cache = (
            get_live_aircraft()
        )

        # ----------------------------------------------------
        # IMPORTANT:
        # Only write fresh OpenSky data.
        #
        # If we're returning cached data after a 429,
        # don't duplicate old records in SQLite.
        # ----------------------------------------------------

        if not using_cache:

            save_flights_to_database(
                aircraft
            )

        return jsonify({

            "source": "OpenSky",

            "cached": using_cache,

            "updated_at": (
                last_successful_time
            ),

            "airport": AIRPORT_NAME,

            "airport_code": AIRPORT_CODE,

            "radius_km": GEOFENCE_RADIUS,

            "aircraft": aircraft

        })

    except Exception as error:

        print(
            "API /api/flights error:",
            error
        )

        return jsonify({

            "error": str(error),

            "source": "OpenSky"

        }), 503


# ============================================================
# API: FLIGHT HISTORY
# ============================================================

@app.route(
    "/api/flight-history/<flight_number>"
)
def flight_history(flight_number):

    search_value = (
        flight_number
        .strip()
        .upper()
    )

    connection = sqlite3.connect(
        DATABASE
    )

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            timestamp,
            callsign,
            icao24,
            country,
            airline,
            origin,
            destination,
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
            UPPER(callsign) = ?
            OR UPPER(icao24) = ?

        ORDER BY id ASC

        LIMIT 500
    """, (

        search_value,
        search_value

    ))

    rows = cursor.fetchall()

    connection.close()

    # --------------------------------------------------------
    # Nothing found
    # --------------------------------------------------------

    if not rows:

        return jsonify({

            "found": False,

            "flight_number": search_value,

            "record_count": 0,

            "history": []

        })

    # --------------------------------------------------------
    # Build history
    # --------------------------------------------------------

    history = []

    for row in rows:

        history.append({

            "timestamp": row[0],

            "callsign": row[1],

            "icao24": row[2],

            "country": row[3],

            "airline": row[4],

            "origin": row[5],

            "destination": row[6],

            "latitude": row[7],

            "longitude": row[8],

            "altitude": row[9],

            "velocity": row[10],

            "heading": row[11],

            "vertical_rate": row[12],

            "flight_phase": row[13],

            "distance_from_airport": row[14]

        })

    first = rows[0]

    return jsonify({

        "found": True,

        "flight_number": search_value,

        "callsign": first[1],

        "icao24": first[2],

        "country": first[3],

        "airline": first[4],

        "origin": first[5],

        "destination": first[6],

        "record_count": len(history),

        "history": history

    })


# ============================================================
# API: DATABASE STATS
# ============================================================

@app.route("/api/database-stats")
def database_stats():

    connection = sqlite3.connect(
        DATABASE
    )

    cursor = connection.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM Flight_Logs
    """)

    total_records = (
        cursor.fetchone()[0]
    )

    cursor.execute("""
        SELECT COUNT(DISTINCT icao24)
        FROM Flight_Logs
    """)

    unique_aircraft = (
        cursor.fetchone()[0]
    )

    connection.close()

    return jsonify({

        "total_records": total_records,

        "unique_aircraft": unique_aircraft

    })


# ============================================================
# SERVE MAP
# ============================================================

@app.route("/")
def home():

    return send_from_directory(
        ".",
        "map.html"
    )


# ============================================================
# SERVE 3D MAP
# ============================================================

@app.route("/3d")
def three_d():

    return send_from_directory(
        ".",
        "3d.html"
    )


# ============================================================
# STARTUP
# ============================================================

if __name__ == "__main__":

    setup_database()

    print("")
    print("==========================================")
    print("       GLOBAL FLIGHT RADAR")
    print("==========================================")
    print("")
    print("Source: OpenSky Network")
    print("Airport:", AIRPORT_NAME)
    print("Airport Code:", AIRPORT_CODE)
    print("Geofence:", GEOFENCE_RADIUS, "km")
    print("")
    print("Airline identification: ENABLED")
    print("Database logging: ENABLED")
    print("OpenSky caching: ENABLED")
    print("")
    print("Live radar:")
    print("http://127.0.0.1:5000")
    print("")
    print("==========================================")

    app.run(
        debug=False,
        host="127.0.0.1",
        port=5000
    )