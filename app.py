from flask import Flask, render_template
from flask_sockets import Sockets
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

app = Flask(__name__)
app.debug = True

sockets = Sockets(app)

@app.route('/')
def index():
    return render_template('index.html')

@sockets.route('/ws')
def trans(ws):
    while not ws.closed:
        gevent.sleep(0.1)
        message = ws.receive()
        if message:
            dir(message)


if __name__ == '__main__':
    pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler) \
          .serve_forever()
