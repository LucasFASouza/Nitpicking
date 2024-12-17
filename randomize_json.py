import json
import random


def randomize_json(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if isinstance(data, dict):
        items = list(data.items())
        random.shuffle(items)
        randomized_data = dict(items)
    elif isinstance(data, list):
        random.shuffle(data)
        randomized_data = data
    else:
        raise ValueError("Unsupported JSON format")

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(randomized_data, f, indent=4)


if __name__ == "__main__":
    input_file = 'files/booster_pack.json'
    output_file = 'files/booster_pack_ran.json'
    randomize_json(input_file, output_file)
