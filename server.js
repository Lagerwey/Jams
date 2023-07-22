
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const WebSocket = require("socket.io");
// Setup Roon
var RoonApi = require("node-roon-api");
var RoonApiImage = require("node-roon-api-image");
var RoonApiStatus = require("node-roon-api-status");
var RoonApiTransport = require("node-roon-api-transport");
var RoonApiBrowse = require("node-roon-api-browse");


// Setup general variables
var EnvPort = Number(process.env.NEXT_PUBLIC_LISTEN_PORT);
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
var core, transport;
var pairStatus = 0;
var zoneStatus = [];
var zoneList = [];
var webSock;

// Read config file
if (EnvPort) {
  var listenPort = EnvPort;
} else {
  var listenPort = 3000;
}
var webSocketPort = listenPort + 1;

var webSock = require("socket.io")(webSocketPort, {
    cors: {
      origin: [`http://${hostname}:${listenPort}`],
    },});

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, listenPort })
const handle = app.getRequestHandler()


app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      if (parsedUrl.query.url !== undefined &&
          parsedUrl.query.url.startsWith('/roonapi/getImage')) {
        var split_str = parsedUrl.query.url.split('=');
        var image_key = split_str[1];
        await core.services.RoonApiImage.get_image(
          image_key,
          { scale: "fit", width: 1080, height: 1080, format: "image/jpeg" },
          function(cb, contentType, body) {
            res.contentType = contentType;
      
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            res.end(body, "binary");
          }
        );
      } else if (parsedUrl.query.url !== undefined &&
                 parsedUrl.query.url.startsWith('/roonapi/goRefreshBrowse')) {
        await refresh_browse(req.body.zone_id, req.body.options, function(payload) {
          res.send({ data: payload });
        });
      } else if (parsedUrl.query.url !== undefined &&
                 parsedUrl.query.url.startsWith('/roonapi/goLoadBrowse')) {
        await load_browse(req.body.listoffset, function(payload) {
          res.send({ data: payload });
        });
      } else {
        await handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  server.once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  server.listen(listenPort, () => {
    console.log(`> Ready on http://${hostname}:${listenPort}`)
  })
})


var roon = new RoonApi({
  extension_id: "com.jams.control",
  display_name: "JAMS",
  display_version: "1.0.0",
  publisher: "Marco Lagerwey",
  // log_level: "none",
  email: "masked",
  website: "https://github.com/Lagerwey/Jams",

  core_paired: function(core_) {
    core = core_;

    pairStatus = true;
    webSock.emit("pairStatus", JSON.parse('{"pairEnabled": ' + pairStatus + "}"));

    transport = core_.services.RoonApiTransport;

    transport.subscribe_zones(function(response, data) {
      var i, x, y, zone_id, display_name;
      if (response == "Subscribed") {
        for (x in data.zones) {
          zone_id = data.zones[x].zone_id;
          display_name = data.zones[x].display_name;
          var item = {};
          item.zone_id = zone_id;
          item.display_name = display_name;

          zoneList.push(item);
          zoneStatus.push(data.zones[x]);
        }

        removeDuplicateList(zoneList, "zone_id");
        removeDuplicateStatus(zoneStatus, "zone_id");
      } else if (response == "Changed") {
        for (i in data) {
          if (i == "zones_changed" || i == "zones_seek_changed") {
            for (x in data.zones_changed) {
              for (y in zoneStatus) {
                if (zoneStatus[y].zone_id == data.zones_changed[x].zone_id) {
                  zoneStatus[y] = data.zones_changed[x];
                }
              }
            }
            webSock.emit("zoneStatus", zoneStatus);
          } else if (i == "zones_added") {
            for (x in data.zones_added) {
              zone_id = data.zones_added[x].zone_id;
              display_name = data.zones_added[x].display_name;

              item = {};
              item.zone_id = zone_id;
              item.display_name = display_name;

              zoneList.push(item);
              zoneStatus.push(data.zones_added[x]);
            }

            removeDuplicateList(zoneList, "zone_id");
            removeDuplicateStatus(zoneStatus, "zone_id");
          } else if (i == "zones_removed") {
            for (x in data.zones_removed) {
              zoneList = zoneList.filter(function(zone) {
                return zone.zone_id != data.zones_removed[x];
              });
              zoneStatus = zoneStatus.filter(function(zone) {
                return zone.zone_id != data.zones_removed[x];
              });
            }
            removeDuplicateList(zoneList, "zone_id");
            removeDuplicateStatus(zoneStatus, "zone_id");
          }
        }
      }
    });
  },

  core_unpaired: function(core_) {
    pairStatus = false;
    webSock.emit("pairStatus", JSON.parse('{"pairEnabled": ' + pairStatus + "}"));
  }
});

var svc_status = new RoonApiStatus(roon);

roon.init_services({
  required_services: [RoonApiTransport, RoonApiImage, RoonApiBrowse],
  provided_services: [svc_status]
});

svc_status.set_status("Extension enabled", false);

roon.start_discovery();

// Remove duplicates from zoneList array
function removeDuplicateList(array, property) {
  var x;
  var new_array = [];
  var lookup = {};
  for (x in array) {
    lookup[array[x][property]] = array[x];
  }

  for (x in lookup) {
    new_array.push(lookup[x]);
  }

  zoneList = new_array;
  webSock.emit("zoneList", zoneList);
}

// Remove duplicates from zoneStatus array
function removeDuplicateStatus(array, property) {
  var x;
  var new_array = [];
  var lookup = {};
  for (x in array) {
    lookup[array[x][property]] = array[x];
  }

  for (x in lookup) {
    new_array.push(lookup[x]);
  }

  zoneStatus = new_array;
  webSock.emit("zoneStatus", zoneStatus);
}

function refresh_browse(zone_id, options, callback) {
  options = Object.assign(
    {
      hierarchy: "browse",
      zone_or_output_id: zone_id
    },
    options
  );

  core.services.RoonApiBrowse.browse(options, function(error, payload) {
    if (error) {
      console.log(error, payload);
      return;
    }

    if (payload.action == "list") {
      var items = [];
      if (payload.list.display_offset > 0) {
        var listoffset = payload.list.display_offset;
      } else {
        var listoffset = 0;
      }
      core.services.RoonApiBrowse.load(
        {
          hierarchy: "browse",
          offset: listoffset,
          set_display_offset: listoffset
        },
        function(error, payload) {
          callback(payload);
        }
      );
    }
  });
}

function load_browse(listoffset, callback) {
  core.services.RoonApiBrowse.load(
    {
      hierarchy: "browse",
      offset: listoffset,
      set_display_offset: listoffset
    },
    function(error, payload) {
      callback(payload);
    }
  );
}

// // ---------------------------- WEB SOCKET --------------
webSock.on("connection", function(socket) {
  webSock.emit("pairStatus", JSON.parse('{"pairEnabled": ' + pairStatus + "}"));
  webSock.emit("zoneList", zoneList);
  webSock.emit("zoneStatus", zoneStatus);

  socket.on("getZone", function() {
    webSock.emit("zoneStatus", zoneStatus);
  });

  socket.on("changeVolume", function(msg) {
    transport.change_volume(msg.output_id, "absolute", msg.volume);
  });

  socket.on("changeSetting", function(msg) {
    var settings = [];

    if (msg.setting == "shuffle") {
      settings.shuffle = msg.value;
    } else if (msg.setting == "auto_radio") {
      settings.auto_radio = msg.value;
    } else if (msg.setting == "loop") {
      settings.loop = msg.value;
    }

    transport.change_settings(msg.zone_id, settings, function(error) {});
  });

  socket.on("goPrev", function(msg) {
    transport.control(msg, "previous");
  });

  socket.on("goNext", function(msg) {
    transport.control(msg, "next");
  });

  socket.on("goPlayPause", function(msg) {
    transport.control(msg, "playpause");
  });

  socket.on("goPlay", function(msg) {
    transport.control(msg, "play");
  });

  socket.on("goPause", function(msg) {
    transport.control(msg, "pause");
  });

  socket.on("goStop", function(msg) {
    transport.control(msg, "stop");
  });
});







