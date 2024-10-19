import requests
import logging
import os
import csv
import time


def fetch():
    timestamp = str(int(time.time() * 1000))
    endpoint = 'https://www.laundryview.com/api/currentRoomData?school_desc_key=8861&location=415890007&rdm=' + timestamp

    try:
        response = requests.get(endpoint)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f'Error fetching data: {e}')
        return None


def get_usage():
    use_path = os.path.join('data', 'use.csv')
    if os.path.exists(use_path):
        return

    os.makedirs('data', exist_ok=True)

    data = fetch()

    usage = {}

    for appliance in data['objects']:
        if 'appliance_desc' not in appliance:
            continue

        if 'appliance_desc2' in appliance:
            usage[appliance.get('appliance_desc2')
                  ] = 0 if appliance['percentage2'] > 0 else 1

        usage[appliance.get('appliance_desc')
              ] = 0 if appliance['percentage'] > 0 else 1

    with open(use_path, mode='w', newline='') as file:
        writer = csv.DictWriter(file, usage.keys())

        writer.writeheader()
        writer.writerow(usage)


if __name__ == '__main__':
    get_usage()
