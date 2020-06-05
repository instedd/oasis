from fastapi import APIRouter
import requests
import pandas as pd
import jenkspy


COVID_WORLD_API_URL = "https://api.covid19api.com/summary"

router = APIRouter()


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
    df = pd.DataFrame(confirmed)

    breaks = jenkspy.jenks_breaks(df["confirmed"], nb_class=5)

    df["group"] = pd.cut(
        df["confirmed"],
        bins=breaks,
        labels=[0.2, 0.4, 0.6, 0.8, 1],
        include_lowest=True,
    )

    response = df.to_dict("records")
    return response
