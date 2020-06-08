from fastapi import APIRouter
import requests
import pandas as pd
import jenkspy


COVID_WORLD_API_URL = "https://api.covid19api.com/summary"
COVID_US_STATES_API_URL = "https://covidtracking.com/api/states"
CLUSTERS = 5
CLUSTERS_LABELS = [0.2, 0.4, 0.6, 0.8, 1]

router = APIRouter()


def cluster_data(confirmed):
    df = pd.DataFrame(confirmed)

    breaks = jenkspy.jenks_breaks(df["confirmed"], nb_class=CLUSTERS)

    df["group"] = pd.cut(
        df["confirmed"],
        bins=breaks,
        labels=CLUSTERS_LABELS,
        include_lowest=True,
    )
    return df.to_dict("records")


@router.get("/world")
def get_covid_world_data():
    r = requests.get(url=COVID_WORLD_API_URL)
    data = r.json()
    countries_data = data["Countries"]
    confirmed = list(
        map(
            lambda entry: {
                "country": entry["Country"],
                "confirmed": entry["TotalConfirmed"],
            },
            countries_data,
        )
    )

    return cluster_data(confirmed)


@router.get("/us-states")
def get_covid_us_states_data():
    r = requests.get(url=COVID_US_STATES_API_URL)
    data = r.json()
    confirmed = list(
        map(
            lambda entry: {
                "state": entry["state"],
                "confirmed": entry["positive"],
            },
            data,
        )
    )
    return cluster_data(confirmed)
