import json
import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def insert_data(json_file_path, db_url):
    # Connect to the database
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()

    # Read JSON data from file
    with open(json_file_path, 'r', encoding='utf-8') as json_file:
        data = json.load(json_file)

    # Extract column names from JSON keys
    if isinstance(data, list) and len(data) > 0:
        columns = data[0].keys()
    else:
        raise ValueError("JSON data is empty or not a list")

    starter_id = 45

    # Create insert query dynamically
    insert_query = f"INSERT INTO phrase ({', '.join(columns)}, id) VALUES ({
        ', '.join(['%s'] * (len(columns) + 1))})"

    # Insert data into the database
    for item in data:
        starter_id += 1
        item['id'] = starter_id
        values = [item[column] for column in columns]
        cursor.execute(insert_query, values)

    # Commit the transaction and close the connection
    conn.commit()
    cursor.close()
    conn.close()


if __name__ == "__main__":
    json_file_path = 'files/booster_pack.json'
    db_url = os.getenv("NEXT_PUBLIC_DATABASE_URL")
    insert_data(json_file_path, db_url)
