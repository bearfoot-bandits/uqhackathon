from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.debug = True

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/', methods=['POST'])
def trans():
    print(request.files)
    
    imgbuf = request.files.get('imgbuf')
    timestamp = request.form['timestamp']
    geo = request.form['geo']
    orient = request.form['orient']

    print(imgbuf)
    return jsonify(ok='ok') # TODO: return {} if the data is incorrect or if there is an error



if __name__ == '__main__':
    app.run()
