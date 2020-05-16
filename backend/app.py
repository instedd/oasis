from flask import Flask, render_template, redirect, request
from flask import jsonify
import json
import mysql
import mysql.connector
from flask_cors import CORS

cnx = mysql.connector.connect(user='', password='', database='covid')
cursor = cnx.cursor()
#cursor = cnx.cursor(dictionary=True)

app = Flask(__name__)
#app.config['CORS_HEADERS'] = 'Content-Type'
#app.config['CORS_RESOURCES'] = {r"/*": {"origins": "*"}}
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/', methods=['POST'])
def user_rec():
    email = request.form.get('email')
    cursor.execute("INSERT INTO patient(phone, email) VALUES (%s, %s)", (email, email))
    cnx.commit()
    return redirect('/')

@app.route('/get')
def get():
    return(json.dumps({"email": "John@gmail.com", "name": "John"}))

@app.route('/receive', methods=['POST', 'GET'])
def handle_data():
    jsonData = request.values
    return jsonify(data=jsonData)

@app.route('/register', methods=['GET'])

def register():
    email = request.args.get('email')
    password=request.args.get('password')
    cursor.execute("INSERT INTO patient(email, password) VALUES (%s, %s)", (email, password))
    cnx.commit()
    #cnx.close()
    return 'success'

@app.route('/storesymptoms', methods=['GET'])

def storesymptoms():
    symptoms=request.args.get('symptoms')
    return symptoms['a']

@app.route('/getcounty', methods=['GET', 'POST'])

def getcounty():
    cursor.execute("SELECT * from countycal where date between '2020-05-06' and '2020-05-06'")
    row_headers=[x[0] for x in cursor.description] #this will extract row headers
    rv = cursor.fetchall()
    json_data=[]
    for result in rv:
         json_data.append(dict(zip(row_headers,result)))
    return json.dumps(json_data)

@app.route('/getsdzip', methods=['GET', 'POST'])

def getsdzip():
    cursor.execute("SELECT zip, cases, longitude, latitude from sdzip")
    row_headers=[x[0] for x in cursor.description] #this will extract row headers
    rv = cursor.fetchall()
    json_data=[]
    for result in rv:
         json_data.append(dict(zip(row_headers,result)))
    return json.dumps(json_data)


@app.route('/login', methods=['GET','POST'])

def login():
    email = request.args.get('email')
    password=request.args.get('password')
    cursor.execute("SELECT count(*) FROM patient where email=%s and password=%s", (email, password ))
    result=cursor.fetchone()
    cnx.commit()
    if (result[0]>0):
        return 'success'
    else:
        return 'fail'

if __name__ == '__main__':
    app.run(ssl_context='adhoc')
