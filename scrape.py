import csv
import os
from datetime import datetime, timezone, timedelta
from fetch import fetch
import time

est = timezone(timedelta(hours=-5.0))
weeks = str((datetime.now(est) - datetime(2024, 10, 19, tzinfo=est)).days // 7)
use_path = os.path.join('data', 'use.csv')
laundry_path = os.path.join('data', weeks + '.csv')


def main():
    data = fetch()

    # no data or faulty response
    if not data or not 'objects' in data:
        with open(laundry_path, 'a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['','','','',''])
        return

    in_use = []
    extracted = {'W_util': 0, 'D_util': 0, 'W': 0, 'D': 0, 'downtime': 0}

    # get current usage data
    for appliance in data['objects']:
        if 'appliance_desc' not in appliance:
            continue

        appliance_type = appliance['appliance_type']

        if 'appliance_desc2' in appliance:
            if 0 < appliance['percentage2'] < 1:
                extracted[appliance_type + '_util'] += 1 - appliance['percentage2']
                extracted[appliance_type] += 1
                in_use.append(appliance['appliance_desc2'])

        if 0 < appliance['percentage'] < 1:
            extracted[appliance_type + '_util'] += 1 - appliance['percentage']
            extracted[appliance_type] += 1
            in_use.append(appliance['appliance_desc'])

    extracted['W_util'] = int(extracted['W_util'] * 100)
    extracted['D_util'] = int(extracted['D_util'] * 100)

    # track downtime
    rows = []
    ids = []
    downtime = 0
    with open(use_path, mode='r', newline='') as file:
        reader = csv.DictReader(file)
        rows = list(reader)
        ids = rows[0].keys()

        for id in ids:
            usage = 0 if id in in_use else (int(rows[0][str(id)]) + 1)
            downtime += usage
            rows[0][str(id)] = usage
    extracted['downtime'] = int(downtime * 10 / 17)

    with open(laundry_path, 'a', newline='') as file:
        writer = csv.DictWriter(file, extracted.keys())
        writer.writerow(extracted)

    with open(use_path, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=ids)
        writer.writeheader()
        writer.writerows(rows)


if __name__ == '__main__':
    start = time.monotonic_ns()
    iterations = 0

    while iterations < 240:
        main()
        if iterations < 239:
            time.sleep(60.0 - ((time.monotonic_ns() - start) / (10 ** 9)) % 60.0)
        iterations += 1