import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

from router import api


async def homepage(request, exec):
    template = "index.html"
    context = {"request": request}
    return templates.TemplateResponse(template, context)


app = FastAPI(exception_handlers={404: homepage})

templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="static"), name="static")

origins = (
    ["http://ui.oasis.lvh.me:3000", "http://localhost:3000"]
    if os.environ.get("DEV")
    else []
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["DELETE", "GET", "POST", "PUT"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api")
