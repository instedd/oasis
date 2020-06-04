import os

from fastapi import FastAPI, Request
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from starlette.responses import JSONResponse
from starlette.templating import Jinja2Templates

from router import api
from auth.main import NotFoundException


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

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")


@app.exception_handler(NotFoundException)
async def not_found_exception_handler(
    request: Request, exc: NotFoundException
):
    return JSONResponse(status_code=404, content={"message": exc.message},)
