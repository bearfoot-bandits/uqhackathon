from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)
app.debug = True



@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


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
    # geo = json.loads(request.form['geo'])
    # orient = request.form['orient']

    print(imgbuf)
    return jsonify(ok='ok') # TODO: return {} if the data is incorrect or if there is an error



@app.route('/map')
def googmap():
    return render_template('map.html')


if __name__ == '__main__':
    app.run()
