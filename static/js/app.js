// Page state
var app = new $.Machine({
  map: null,
  mapElement: $('#map')[0],
  destination: { latitude: null, longitude: null },
  marker: null,
  hasCamera: true,
  video: $('video')[0],
  photoCanvas: null,
  photoContext: null,
  iv: 0,
  heartbeat: false,
  geoIv: 0,
  geo: { latitude: null, longitude: null }
});

// Events
$.targets({

  load () {
    app.emit('init');
  },

  resize () { app.emit('resize') },

  deviceorientation (e) {
    var alpha;
    // Check for iOS property
    if (e.webkitCompassHeading) alpha = e.webkitCompassHeading;
    // non iOS
    else {
      alpha = e.alpha;
      // Assume Android stock
      if (!window.chrome) alpha = alpha-270
    }
    // $('#debug')[0].textContent = alpha
  },

  app: {

    init () {
      this.map = initMap();
      let photoCanvas = this.photoCanvas = document.createElement('canvas');
      this.photoContext = photoCanvas.getContext('2d');
      app.emit('resize');
      for (let c of 'Where do you want to go today?')
        $.pipe('title', () => new Promise(r => setTimeout(() => r($('#title')[0].textContent += c), 50)))
    },

    chooseDest () {
      let body = new FormData(),
          latitude = this.map.center.lat(), longitude = this.map.center.lng(),
          destination = this.destination = { latitude, longitude };
      body.append('timestamp', Date.now());
      body.append('geo', JSON.stringify({ destination }));
      return fetch('/', {method: 'POST', body})
        .then(res => res.json()).then(data => {
          if ('ok' in data) return app.emitAsync('startCamera')
            .catch(e => {
              this.hasCamera = false;
              $('#displayToggle')[0].classList.add('hide');
              $('.feedback').forEach(el => el.classList.toggle('active'))
            })
            .then(() => app.emitAsync('showDest'));
          else throw new Error('Could not post data')
        })
        .catch(console.log)
    },

    setMarker (lat, lng) {
      this.marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map
      });
    },

    setZoom (curLat, curLng) {
      let {latitude, longitude} = this.destination,
          vmin = Math.min(document.body.clientHeight, document.body.clientWidth) / 2;
      let dist = getDistanceFromLatLon(latitude, longitude, curLat, curLng);
      // $('#debug')[0].textContent = dist
      this.map.setOptions({zoom: getZoomLevel(latitude, dist, vmin)});
    },

    showDest () {
      let {latitude, longitude} = this.destination;
      this.mapElement.childNodes[0].remove();
      this.mapElement = $('#destMap')[0];
      this.map = initMap();
      this.map.setOptions({draggable: false});
      app.emit('setMarker', latitude, longitude);

      $('section').forEach(el => el.classList.toggle('active'));

      this.geoIv = navigator.geolocation.watchPosition(
        pos => app.emit('updateGeo', pos),
        console.log,
        { enableHighAccuracy: true }
      );
    },

    heartbeat (on) {
      this.heartbeat = on ?
        this.iv = setTimeout(() => {}, 1000) :
        clearTimeout(this.iv)
    },

    sendData (latitude, longitude) {
      let body = new FormData(), update = { latitude, longitude };
      body.append('timestamp', Date.now());
      body.append('geo', JSON.stringify({ update }));
      return fetch('/', {method: 'POST', body})
    },


    // Camera image

    resize () { // Change image resolution here
      let { clientWidth, clientHeight } = document.body;
      this.photoCanvas.width = clientWidth / 4;
      this.photoCanvas.height = clientHeight / 4;
      $('canvas')[0].width = $('video')[0].width = clientWidth;
      $('canvas')[0].height = $('video')[0].height = clientHeight;
    },


    // Geolocation

    updateGeo (pos) {
      let { latitude, longitude } = pos.coords;
      this.geo = { latitude, longitude };
      let gGeo = new google.maps.LatLng(...Object.values(this.geo));
      this.map.setCenter(gGeo)
      app.emit('setZoom', latitude, longitude);
      app.emit('sendData', latitude, longitude)
    },


    // Orientation
    updateOrient () {
      this.orient
    },


    // Camera
    startCamera () {
      if (navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia({
          video: { width: 4800, height: 6400, facingMode: { exact: 'environment' } }
        }).then(s => {
          this.video.srcObject = s;
          this.video.onloadedmetadata = () => this.video.play();
        }).catch(e => { throw e })
      } else throw new Error('Can\'t connect camera')
    }

  }
});

$.queries({
  '#map': {
    touchstart () { $.pipe('titleblur', () => new Promise(r => setTimeout(() => r($('#title')[0].classList.add('blur')), 500))) },
    touchend () { $.pipe('titleblur', () => new Promise(r => setTimeout(() => r($('#title')[0].classList.remove('blur')), 500))) }
  },
  '#title': {
    click () {
      app.emit('chooseDest')
    }
  },
  '#displayToggle': {
    click () {
      $('.feedback').forEach(el => el.classList.toggle('active'))
      this.textContent = $('.feedback.active')[0].id === 'ar' ? 'Show map' : 'Show AR'
    }
  }
});

function initMap () {
  return new google.maps.Map(app.state().mapElement, {
    center: {lat: -27.497561, lng: 153.013302},
    zoom: 16,
    disableDefaultUI: true
  });
}

function getZoomLevel (lat, dist, vmin) {
  let raw = Math.log(vmin * 156543.03392 * Math.cos(lat * Math.PI / 180) / dist) / Math.LN2;
  return Math.max(Math.min(Math.floor(raw), 20), 1)
}

function getDistanceFromLatLon(lat1,lon1,lat2,lon2) {
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }
  var R = 6371000;
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}
