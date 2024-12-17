import json
import csv


def json_to_csv(json_file_path, csv_file_path):
    with open(json_file_path, 'r', encoding='utf-8') as json_file:
        data = json.load(json_file)

    with open(csv_file_path, 'w', newline='', encoding='utf-8') as csv_file:
        csv_writer = csv.writer(csv_file)

        # Write headers
        headers = data[0].keys()
        csv_writer.writerow(headers)

        # Write data
        for row in data:
            csv_writer.writerow(row.values())


if __name__ == "__main__":
    json_file_path = 'booster_pack.json'  # Replace with your JSON file path
    # Replace with your desired CSV file path
    csv_file_path = 'files/booster_pack.csv'
    json_to_csv(json_file_path, csv_file_path)
