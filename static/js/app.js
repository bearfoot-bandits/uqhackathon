// Page state
var app = new $.Machine({
  video: $('video')[0],
  canvas: null,
  context: null,
  iv: 0,
  heartbeat: false
});

// Events
$.targets({

  load () {
    app.emit('init');
    $.pipe('heartbeat', () => app.emitAsync('startCamera'))
  },

  resize () { app.emit('resize') },

  app: {

    init () {
      let canvas = this.canvas = document.createElement('canvas');
      this.context = canvas.getContext('2d');
      app.emit('resize')
    },

    resize () { // Change image resolution here
      this.canvas.width = document.body.clientWidth / 4;
      this.canvas.height = document.body.clientHeight / 4;
    },

    startCamera () {
      if (navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia({
          video: { width: 4800, height: 6400, facingMode: { exact: 'environment' } }
        }).then(s => {
          this.video.srcObject = s;
          this.video.onloadedmetadata = () => this.video.play();
        }).catch(e => { throw e.message })
      } else throw 'Can\'t connect camera'
    },

    heartbeat (on) {
      this.heartbeat = on ?
        this.iv = setTimeout(() => $.pipe('heartbeat',
          () => app.emitAsync('sendData'),
          () => app.emitAsync('heartbeat', this.heartbeat)), 1000) :
        clearTimeout(this.iv)
    },

    sendData () {
      let { width, height } = this.canvas;
      this.context.drawImage(this.video, 0, 0, width, height);
      let { data } = this.context.getImageData(0, 0, width, height),
          body = new FormData();
      console.log(data)
      body.append('timestamp', Date.now());
      body.append('imgbuf', new Blob([data]), 'imgbuf');
      body.append('geo', null);
      body.append('orient', null);
      return fetch('/reference', {method: 'POST', body})
        .then(res => res.json()).then(data => {
          if ('ok' in data) {
            $('.debug')[0].textContent = ''
          } else {
             throw new Error('Could not post data')
          }
        })
        .catch(e => $('.debug')[0].textContent = e.message)
    }

  }
});

$.queries({
  button: {
    'touchdown mousedown' () {
      this.disabled = true;
      $.pipe('heartbeat', () => {
        this.disabled = false;
        switch (this.dataset.state) {
          case 'off': this.dataset.state = 'on';
          return app.emitAsync('heartbeat', true)
          case 'on': this.dataset.state = 'off';
          return app.state().heartbeat = false
        }
      })
    }
  }
})
