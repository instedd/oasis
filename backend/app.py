from fastapi import FastAPI
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
import os
import mysql.connector

app = FastAPI()
templates = Jinja2Templates(directory='templates')
cnx = mysql.connector.connect(host=os.environ['DATABASE_HOST'], user='root', password='', database='covid')
cursor = cnx.cursor()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.route('/')
async def homepage(request):
    template = "index.html"
    context = {"request": request}
    return templates.TemplateResponse(template, context)

@app.get("/api")
def read_root():
    return "Welcome to oasis api 🌴"

@app.get('/api/getcounty')
def getcounty():
    cursor.execute("SELECT * from countycal where date between '2020-05-06' and '2020-05-06'")
    row_headers=[x[0] for x in cursor.description] #this will extract row headers
    rv = cursor.fetchall()
    json_data=[]
    for result in rv:
         json_data.append(dict(zip(row_headers,result)))
    return json_data
