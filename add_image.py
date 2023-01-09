#!/usr/bin/python3
import os
import sys
import time
import json

import image_tools.imageToEInk as converter

def parse_date(string):
    MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

    month, day = string.split("-")

    if len(month) == 0 or len(day) == 0:
        raise Exception("Invalid Date!")

    try:
        monthIdx = MONTHS.index(month.upper())
    except ValueError:
        raise Exception("Invalid Month!")

    try:
        dayIdx = int(day)
    except ValueError:
        raise Exception("Invalid Day!")

    return monthIdx, dayIdx

if __name__ == "__main__":
    args = 1;
    
    if len(sys.argv) < 1 + args:
        print("Usage: add_image.py [inputFile]")
        exit(-1)

    try:
        for image in sys.argv[2:]:
            env_start_date = os.getenv('START_DATE')
            env_end_date = os.getenv('END_DATE')
            priority = os.getenv('END_DATE')

            startMonth, startDay = parse_date(env_start_date if env_start_date else input("Start day (MMM-DD)? "))
            endMonth, endDay = parse_date(env_end_date if env_end_date else input("End day (MMM-DD)? "))
            try:
                priority = int(priority if priority else input("Priority (>0)? "))
            except ValueError:
                raise Exception("Invalid Priority!")

            outFileName = hex(round(time.time()*1000))[2:]

            outPng = os.path.join(os.path.dirname(__file__), "images", f"{outFileName}.png")
            outRaw = os.path.join(os.path.dirname(__file__), "images", f"{outFileName}.raw")

            print(f"Outputting to {outRaw}")

            converter.convert(image, outPng, outRaw)

            manifestEntry = {
                "raw": outRaw,
                "png": outPng,
                "date_range": {
                    "start_month": startMonth,
                    "start_day": startDay,
                    "end_month": endMonth,
                    "end_day": endDay
                },
                "show": True,
                "priority": priority,
                "last_accessed": {
                    "year": 1970,
                    "month": 1,
                    "day": 1
                }
            }

            with open(f"{os.path.dirname(__file__)}/images/manifest.json", "r+") as f:
                data = json.load(f)
                data["images"].append(manifestEntry)
                f.seek(0)
                f.write(json.dumps(data))
                f.truncate()

    except Exception as e:
        print(e)
        exit(-1)

    