from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
import cv2
from matplotlib import pyplot as plt
from bson.json_util import dumps

app = Flask(__name__)
app.debug = True
client = MongoClient('localhost', 27017)
db = client.sample
collection = db.location


@app.route('/testDb', methods=['GET'])
def testDb():
    # x = db.users.insert({
    #     "id":
    #     1001,
    #     "user_name":
    #     "rahul",
    #     "name": [{
    #         "first_name": "Rahul"
    #     }, {
    #         "middle_name": ""
    #     }, {
    #         "last_name": "Kumar"
    #     }],
    #     "email":
    #     "rahul@tecadmin.net",
    #     "location":
    #     "dont know"
    # })
    y = dumps((db.users.find({'location': 'dont know'})))
    print("anything")
    return (y)




@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/reference', methods=['POST'])
def trans():
    print(request.files)

@app.route('/', methods=['POST'])
def sendUserData():
    timestamp = request.form['timestamp']
    geo = json.loads(request.form['geo'])
    return jsonify(ok='ok') # TODO return {} etc



@app.route('/reference', methods=['GET'])
def refs():
    return render_template('reference.html')


@app.route('/reference', methods=['POST'])
def sendImg():
    imgbuf = request.files.get('imgbuf')
    timestamp = request.form['timestamp']
    geo = request.form['geo']
    orient = request.form['orient']
    #to store in database
    data = {}
    data['imgbuf'] = imgbuf
    data['timestamp'] = timestamp
    data['orient'] = orient
    #data['lat'] = geo.lat
    #data['lng'] = geo.lng

    #print(dumps((db.users.find({}))))
    db.users.insert(data)

    print(imgbuf)
    return jsonify(
        ok='ok'
    )  # TODO: return {} if the data is incorrect or if there is an error


@app.route('/findLoc', methods=['POST'])
def findLoc():
    print(request.files)
    imgbuf = request.files.get('imgbuf')
    timestamp = request.form['timestamp']
    geo = request.form['geo']
    orient = request.form['orient']
    #to store in database
    data = {}
    data['imgbuf'] = imgbuf
    data['timestamp'] = timestamp
    data['orient'] = orient
    #data['lat'] = geo.lat
    #data['lng'] = geo.lng

    return jsonify(
        ok='ok'
    )  # TODO: return {} if the data is incorrect or if there is an error


@app.route('/map')
def googmap():
    return render_template('map.html')


if __name__ == '__main__':
    app.run()
