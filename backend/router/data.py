import functools
from collections import defaultdict

import pandas as pd
import requests
from fastapi import APIRouter, Depends
from sigfig import round

import jenkspy

from NytLiveCounty import models
from database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import func

COVID_WORLD_API_URL = "https://api.covid19api.com/summary"
COVID_US_STATES_API_URL = (
    "https://api.covidtracking.com/v1/states/current.json"
)
COVID_SD_ZIP_CODE_API_URL = (
    "https://gis-public.sandiegocounty.gov/arcgis/rest/services/Hosted"
    "/COVID_19_Statistics__by_ZIP_Code/FeatureServer/0/query?f=json"
    "&where=1%3D1&outFields=ziptext,created_date,rate_100k,case_count,"
    "updatedate&returnGeometry=false"
    "&spatialRel=esriSpatialRelIntersects&outFields"
    "=*&orderByFields=updatedate%20DESC"
    "&outSR=102100&resultOffset=0&resultRecordCount=113"
)
CLUSTERS = 5
CLUSTERS_LABELS = [0.2, 0.4, 0.6, 0.8, 1]

router = APIRouter()


class DataScope:
    ADM0 = "adm0"  # Base administrative area (countries)
    ADM1 = "adm1"  # First level administrative area (states/provinces)
    ADM2 = "adm2"  # Counties (not zip codes anymore)
    ADM3 = "adm3"  # Zip codes


def fetch_world_data():
    try:
        r = requests.get(url=COVID_WORLD_API_URL)
    except requests.exceptions.RequestException as e:
        print("WARNING: Unable to receive data from api.covid19api.com")
        print(e)
        print("Continuing without it...")
        return []

    data = r.json()
    countries_data = data["Countries"]
    confirmed = list(
        map(
            lambda entry: {
                "name": entry["Country"],
                "confirmed": entry["TotalConfirmed"],
                "scope": DataScope.ADM0,
            },
            countries_data,
        )
    )
    return confirmed


def fetch_us_states_data():
    r = requests.get(url=COVID_US_STATES_API_URL)
    data = r.json()
    confirmed = list(
        map(
            lambda entry: {
                "name": entry["state"],
                "confirmed": entry["positive"],
                "scope": DataScope.ADM1,
                "parent": "US",
            },
            data,
        )
    )
    return confirmed


def fetch_sd_zip_code_data():
    r = requests.get(url=COVID_SD_ZIP_CODE_API_URL)
    data = r.json()
    features = data["features"]
    confirmed = list(
        map(
            lambda entry: {
                "name": entry["attributes"]["ziptext"],
                "confirmed": entry["attributes"]["case_count"]
                if entry["attributes"]["case_count"]
                else 0,
                "scope": DataScope.ADM3,
            },
            features,
        )
    )

    return confirmed


def fetch_county_data(db: Session = Depends(get_db)):
    most_recent_date = db.query(func.max(models.NytLiveCounty.date)).first()[0]
    result = (
        db.query(models.NytLiveCounty)
        .filter(models.NytLiveCounty.date == most_recent_date)
        .all()
    )
    confirmed = [
        {
            "name": record.county,
            "confirmed": record.confirmed_cases,
            "case_count": record.cases,
            "fips": record.fips,
            "parent": record.state,
            "scope": DataScope.ADM2,
        }
        for record in result
    ]

    return confirmed


def cluster_data(confirmed, clusters_config=None):
    if len(confirmed) == 0:
        return {"data": [], "clusters": []}

    if clusters_config is None:
        clusters_config = {"clusters": CLUSTERS, "labels": CLUSTERS_LABELS}

    df = pd.DataFrame(confirmed)
    df = df.dropna(how="any", axis=0)

    breaks = jenkspy.jenks_breaks(
        df["confirmed"], nb_class=clusters_config["clusters"]
    )

    rounded_breaks = list(map(lambda limit: round(limit, sigfigs=3), breaks))

    df["group"] = pd.cut(
        df["confirmed"],
        bins=breaks,
        labels=clusters_config["labels"],
        include_lowest=True,
    )
    df = df.where(pd.notnull(df), None)  # convert NaN to None
    non_inclusive_lower_limits = list(
        map(lambda limit: 0 if limit == 0 else limit + 1, rounded_breaks)
    )  # add 1 to all limits (except 0)
    return {
        "data": df.to_dict("records"),
        "clusters": list(zip(non_inclusive_lower_limits, rounded_breaks[1:])),
    }


@router.get("/county")
def get_covid_county_data(db: Session = Depends(get_db)):
    confirmed = fetch_county_data(db)
    return cluster_data(confirmed)


@router.get("/world")
def get_covid_world_data():
    confirmed = fetch_world_data()
    return cluster_data(confirmed)


@router.get("/us-states")
def get_covid_us_states_data():
    confirmed = fetch_us_states_data()
    return cluster_data(confirmed)


@router.get("/sd-zip")
def get_covid_sd_zip_code_data():
    confirmed = fetch_sd_zip_code_data()
    return cluster_data(confirmed)


@router.get("/all")
def get_all_data(db: Session = Depends(get_db)):
    countries = fetch_world_data()
    us_states = fetch_us_states_data()
    county_data = fetch_county_data(db)
    sd_zip = fetch_sd_zip_code_data()
    cluster_labels = [0.2, 0.4, 0.6, 0.8, 1]

    clustered_data = cluster_data(
        countries + us_states + county_data + sd_zip,
        clusters_config={"clusters": 5, "labels": cluster_labels},
    )

    grouped_data = functools.reduce(group_by_scope, clustered_data["data"], {})

    print(grouped_data.keys())

    grouped_data[DataScope.ADM1] = group_by_parent(
        grouped_data[DataScope.ADM2]
    )

    return {
        "data": grouped_data,
        "clusters": clustered_data["clusters"],
        "groups": cluster_labels,
    }


def group_by_scope(base, entry):
    scope = entry["scope"]
    if scope not in base:
        base[scope] = []
    base[scope].append(entry)
    return base


def group_by_parent(children):
    temp = defaultdict(list)
    for c in children:
        temp[c["parent"]].append(c)
    return temp
