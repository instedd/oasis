import functools
from collections import defaultdict

import pandas as pd
import requests
from fastapi import APIRouter
from sigfig import round

import jenkspy

COVID_WORLD_API_URL = "https://api.covid19api.com/summary"
COVID_US_STATES_API_URL = "https://covidtracking.com/api/states"
CLUSTERS = 5
CLUSTERS_LABELS = [0.2, 0.4, 0.6, 0.8, 1]

router = APIRouter()


class DataScope:
    ADM0 = "adm0"  # Base administrative area (countries)
    ADM1 = "adm1"  # First level administrative area (states/provinces)


def fetch_world_data():
    r = requests.get(url=COVID_WORLD_API_URL)
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


def cluster_data(confirmed, clusters_config=None):
    if clusters_config is None:
        clusters_config = {"clusters": CLUSTERS, "labels": CLUSTERS_LABELS}

    df = pd.DataFrame(confirmed)

    breaks = jenkspy.jenks_breaks(
        df["confirmed"], nb_class=clusters_config["clusters"]
    )

    rounded_breaks = list(map(lambda limit: round(limit, sigfigs=3), breaks))

    df["group"] = pd.cut(
        df["confirmed"],
        bins=rounded_breaks,
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


@router.get("/world")
def get_covid_world_data():
    confirmed = fetch_world_data()
    return cluster_data(confirmed)


@router.get("/us-states")
def get_covid_us_states_data():
    confirmed = fetch_us_states_data()
    return cluster_data(confirmed)


@router.get("/all")
def get_all_data():
    countries = fetch_world_data()
    us_states = fetch_us_states_data()
    cluster_labels = [0.2, 0.4, 0.6, 0.8, 1]

    clustered_data = cluster_data(
        countries + us_states,
        clusters_config={"clusters": 5, "labels": cluster_labels},
    )

    grouped_data = functools.reduce(group_by_scope, clustered_data["data"], {})

    grouped_data[DataScope.ADM1] = group_by_parent(
        grouped_data[DataScope.ADM1]
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
