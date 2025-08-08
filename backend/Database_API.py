from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    "host": "localhost",
    "username": "root",
    "password": "root",
    "database": "car_show"
}

def get_db_connection():
    """Establishes and returns a new DB connection"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Error connectiong to MySQL: {e}")
        return None
    
def row_to_dict(cursor, row):
    """Converts a database row to a dictionary using cursor description"""
    if row is None:
        return None
    
    #Get column names from cursor description
    columns = [desc[0] for desc in cursor.description]

    #Create a dictionary from column names and row values
    data = dict(zip(columns, row))

    #convert 'finished' (TINYINT(1)) to boolean
    if 'finished' in data:
        data['finished'] = bool(data['finished']) # Convert 0/1 to False/True

    #Forces use of date only not datetime
    if 'show_date' in data and data['show_date']:
        data['show_date'] = data['show_date'].strftime('%Y-%m-%d')

    return data

@app.route('/')
def home():
    """Basic home route to confirm API is running"""
    return jsonify({"message": "Welcome to the car_show API! /"})

#Get all Shows
@app.route('/shows', methods=['GET'])
def get_shows():
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = conn.cursor(dictionary=True)  # Changed to dictionary=True
        cursor.execute("SELECT * FROM show_ground")
        shows = cursor.fetchall()  # Now returns list of dicts
        cursor.close()
        return jsonify(shows), 200
    except Error as e:
        print(f"Error fetching shows: {e}")
        return jsonify({"error": f"Failed to retrieve shows: {e}"}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

# GET a single show by ID
@app.route('/show/<int:show_ground_id>', methods=['GET'])
def get_show(show_ground_id):
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor(dictionary=True)  # Changed to dictionary=True
        cursor.execute("SELECT show_ground_id, show_name, show_country, show_county, show_postcode, show_date, show_description FROM show_ground WHERE show_ground_id = %s", (show_ground_id,))
        show = cursor.fetchone()  # Now returns a dict or None
        cursor.close()

        if show:
            return jsonify(show), 200
        else:
            return jsonify({"message": "Show not found"}), 404
    except Error as e:
        print(f"Error fetching Show: {e}")
        return jsonify({"error": f"Failed to retrieve Show: {e}"}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()


# Get all cars by show_ground_id
@app.route('/cars/<int:show_ground_id>', methods=['GET'])
def get_cars_by_show_id(show_ground_id):
    conn = None
    try:
        # 1. Establish database connection
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500
        
        # 2. Use dictionary=True so you get rows as dicts
        cursor = conn.cursor(dictionary=True)

        # 3. Use parameterized SQL (safe from injection)
        sql = """
            SELECT c.car_id, c.car_brand, c.car_model, c.car_year, c.car_reg, 
            sg.show_ground_id, sg.show_name
            FROM car c
            JOIN car_at_show cas ON c.car_id = cas.car_id
            JOIN show_ground sg ON cas.show_ground_id = sg.show_ground_id
            WHERE sg.show_ground_id = %s
        """
        cursor.execute(sql, (show_ground_id,))

        # 4. Fetch all rows as dictionaries
        cars = cursor.fetchall()

        # 5. Cleanup
        cursor.close()
        return jsonify(cars), 200

    except Error as e:
        print(f"Error fetching cars: {e}")
        return jsonify({"error": f"Failed to retrieve cars: {e}"}), 500

    finally:
        if conn and conn.is_connected():
            conn.close()


@app.route('/owners', methods=['POST'])
def add_owner():
    conn = None
    try:
        # 1. Get JSON data from the request
        data = request.get_json()

        # Validate required fields
        required_fields = ['owner_first_name', 'owner_last_name', 'owner_email', 'owner_phone']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required owner fields"}), 400

        # 2. Establish DB connection
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500

        # 3. Create cursor
        cursor = conn.cursor()

        # 4. SQL Insert statement
        sql = """
            INSERT INTO `owner` (`owner_first_name`, `owner_last_name`, `owner_email`, `owner_phone`)
            VALUES (%s, %s, %s, %s)
        """
        values = (
            data['owner_first_name'],
            data['owner_last_name'],
            data['owner_email'],
            data['owner_phone']
        )
        cursor.execute(sql, values)
        conn.commit()

        # 5. Return the newly inserted owner ID
        owner_id = cursor.lastrowid
        cursor.close()
        return jsonify({"message": "Owner added successfully", "owner_id": owner_id}), 201

    except Error as e:
        print(f"Error adding owner: {e}")
        return jsonify({"error": f"Failed to add owner: {e}"}), 500

    finally:
        if conn and conn.is_connected():
            conn.close()


@app.route('/cars', methods=['POST'])
def add_car():
    conn = None
    try:
        data = request.get_json()
        required_fields = ['car_brand', 'car_model', 'car_year', 'car_reg', 'owner_email']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required car fields"}), 400

        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor(dictionary=True)

        # Lookup owner_id by email
        cursor.execute("SELECT owner_id FROM owner WHERE owner_email = %s", (data['owner_email'].lower(),))
        owner = cursor.fetchone()
        if not owner:
            cursor.close()
            return jsonify({"error": "Owner not found"}), 404

        owner_id = owner['owner_id']

        # Check for existing car by registration (and owner)
        cursor.execute("SELECT car_id FROM car WHERE car_reg = %s AND owner_id = %s", (data['car_reg'], owner_id))
        existing_car = cursor.fetchone()
        if existing_car:
            car_id = existing_car['car_id']
            cursor.close()
            return jsonify({"message": "Car already exists", "car_id": car_id, "existing": True}), 200

        # Insert car with owner_id
        sql = """
            INSERT INTO `car` (`car_brand`, `car_model`, `car_year`, `car_reg`, `owner_id`)
            VALUES (%s, %s, %s, %s, %s)
        """
        values = (
            data['car_brand'],
            data['car_model'],
            data['car_year'],
            data['car_reg'],
            owner_id
        )
        cursor.execute(sql, values)
        conn.commit()

        car_id = cursor.lastrowid
        cursor.close()
        return jsonify({"message": "Car added successfully", "car_id": car_id, "existing": False}), 201

    except Error as e:
        print(f"Error adding car: {e}")
        return jsonify({"error": f"Failed to add car: {e}"}), 500

    finally:
        if conn and conn.is_connected():
            conn.close()


@app.route('/car_at_show', methods=['POST'])
def add_car_at_show():
    conn = None
    try:
        data = request.get_json()
        required_fields = ['car_id', 'show_ground_id']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor()
        sql = """
            INSERT INTO `car_at_show` (`car_id`, `show_ground_id`)
            VALUES (%s, %s)
        """
        cursor.execute(sql, (data['car_id'], data['show_ground_id']))
        conn.commit()
        cursor.close()
        return jsonify({"message": "Car associated with show successfully"}), 201

    except Error as e:
        print(f"Error associating car with show: {e}")
        return jsonify({"error": f"Failed to associate car with show: {e}"}), 500

    finally:
        if conn and conn.is_connected():
            conn.close()



@app.route('/remove_car_from_show', methods=['DELETE'])
def remove_car_from_show():
    conn = None
    try:
        data = request.get_json()
        required_fields = ['car_id', 'show_ground_id', 'owner_email']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor(dictionary=True)
        # Find owner_id by email
        cursor.execute("SELECT owner_id FROM owner WHERE owner_email = %s", (data['owner_email'].lower(),))
        owner = cursor.fetchone()
        if not owner:
            cursor.close()
            return jsonify({"error": "Owner not found"}), 404

        owner_id = owner['owner_id']

        # Check car ownership
        cursor.execute("SELECT * FROM car WHERE car_id = %s AND owner_id = %s", (data['car_id'], owner_id))
        car = cursor.fetchone()
        if not car:
            cursor.close()
            return jsonify({"error": "Car not found or you are not the owner"}), 403

        # Remove only from car_at_show
        cursor.execute("DELETE FROM car_at_show WHERE car_id = %s AND show_ground_id = %s", (data['car_id'], data['show_ground_id']))
        conn.commit()
        cursor.close()
        return jsonify({"message": "Car removed from this show"}), 200

    except Error as e:
        print(f"Error removing car from show: {e}")
        return jsonify({"error": f"Failed to remove car from show: {e}"}), 500

    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/update_car', methods=['PUT'])
def update_car():
    conn = None
    try:
        data = request.get_json()
        required_fields = ['car_id', 'owner_email']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields (car_id and owner_email)"}), 400

        car_id = data['car_id']
        owner_email = data['owner_email'].lower()

        # Optional fields to update
        updatable_fields = ['car_brand', 'car_model', 'car_year', 'car_reg']
        update_data = {key: data[key] for key in updatable_fields if key in data}

        if not update_data:
            return jsonify({"error": "No fields provided to update"}), 400

        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor(dictionary=True)

        # Verify owner
        cursor.execute("SELECT owner_id FROM owner WHERE owner_email = %s", (owner_email,))
        owner = cursor.fetchone()
        if not owner:
            cursor.close()
            return jsonify({"error": "Owner not found"}), 404

        owner_id = owner['owner_id']

        # Verify car ownership
        cursor.execute("SELECT * FROM car WHERE car_id = %s AND owner_id = %s", (car_id, owner_id))
        car = cursor.fetchone()
        if not car:
            cursor.close()
            return jsonify({"error": "Car not found or you are not the owner"}), 403

        # Build dynamic SQL for update
        set_clause = ", ".join(f"{key} = %s" for key in update_data.keys())
        values = list(update_data.values())
        values.append(car_id)

        update_query = f"UPDATE car SET {set_clause} WHERE car_id = %s"
        cursor.execute(update_query, tuple(values))
        conn.commit()
        cursor.close()

        return jsonify({"message": "Car updated successfully"}), 200

    except Error as e:
        print(f"Error updating car: {e}")
        return jsonify({"error": f"Failed to update car: {e}"}), 500

    except Exception as e:
        return jsonify({"error": f"Internal server error: {e}"}), 500

    finally:
        if conn and conn.is_connected():
            conn.close()

    

if __name__ == "__main__":
    app.run(debug=True, port=5000)