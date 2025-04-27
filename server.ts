//import { createServer, IncomingMessage, Server, ServerResponse } from "node:http";
import { parse } from 'node:url';
import next from 'next';
import { WebSocket, WebSocketServer } from 'ws';
//import { Socket } from 'node:net';
import { Server } from "socket.io";
import * as fs from 'fs';
import { exec } from 'child_process';
import * as net from 'net';
import express from 'express';
import bodyParser from 'body-parser';

// Setup Roon
// @ts-ignore
import RoonApi from 'node-roon-api';
// @ts-ignore
import RoonApiImage from 'node-roon-api-image';
// @ts-ignore
import RoonApiStatus from 'node-roon-api-status';
// @ts-ignore
import RoonApiTransport from 'node-roon-api-transport';
// @ts-ignore
import RoonApiBrowse from 'node-roon-api-browse';


// Setup general variables
var EnvPort = Number(process.env.NEXT_PUBLIC_LISTEN_PORT);
const dev = process.env.NODE_ENV !== 'production'

// when using middleware `hostname` and `port` must be provided below
const nextApp = next({ dev })
const handleNextRequests = nextApp.getRequestHandler()

const hostname = 'localhost'
var core: { services: { RoonApiImage: { get_image: (arg0: any, arg1: { scale: string; width: number; height: number; format: string; }, arg2: (cb: any, contentType: any, body: any) => void) => void; }; RoonApiBrowse: { browse: (arg0: any, arg1: (error: any, payload: any) => void) => void; load: (arg0: { hierarchy: string; offset: any; set_display_offset: any; }, arg1: { (error: any, payload: any): void; (error: any, payload: any): void; }) => void; }; }; };
var transport: { subscribe_zones: (arg0: (response: any, data: any) => void) => void; change_volume: (arg0: any, arg1: string, arg2: any) => void; change_settings: (arg0: any, arg1: any[], arg2: (error: any) => void) => void; control: (arg0: any, arg1: string) => void; };
var pairStatus = false;
var zoneStatus: any[] = [];
var zoneList: any[] = [];
var selected_zone_id;
var ir_recv_fifo_name = "./ir_fifo"
var vu_meter_fifo_name = "/tmp/myfifo"

// Read config file
if (EnvPort) {
  var listenPort = EnvPort;
} else {
  var listenPort = 3000;
}
var roonWebSockPort = listenPort + 1;
var vuMeterWebSockPort = listenPort + 2;

//var roonWebSock = new WebSocket(`ws://${hostname}:${roonWebSockPort}`);
//var vuMeterWebSock = new WebSocket(`ws://${hostname}:${vuMeterWebSockPort}`);
var roonWebSock = new Server(roonWebSockPort, {
  cors: {
    origin: [`http://${hostname}:${roonWebSockPort}`],
  },});

var vuMeterWebSock = new Server(vuMeterWebSockPort, {
cors: {
  origin: [`http://${hostname}:${vuMeterWebSockPort}`],
},});


exec("rm -f " + ir_recv_fifo_name + "; mkfifo " + ir_recv_fifo_name, function(error: any, stdout: any, stderr: any) {
  if (error) {
    console.log(error);
    return;
  }
});


vuMeterWebSock.on("connection", function() {

  fs.open(vu_meter_fifo_name, fs.constants.O_RDWR | fs.constants.O_NONBLOCK, (err: any, fd: any) => {
    const pipe = new net.Socket({ fd });
    // Now `pipe` is a stream that can be used for reading from the FIFO.
    pipe.on('data', (data: string | any[]) => {
      // process data ...
        var uint16Arr = convert(data);
        vuMeterWebSock.emit("vu_data", uint16Arr);
    });

    // Handle err
    if (err) {
      console.error('Error occurred handling FIFO', err)
    }
  });

  function convert(byteArray: string | any[]) {
    var value = [];
    for (var i = 0, k = 0; i < byteArray.length; i += 2, k++) {
        value[k] = ( byteArray[i+1] * 256) + byteArray[i];
    }

    return value;
  };

});



nextApp.prepare().then(() => {
  const server = express();

  server.use(bodyParser.json({ limit: '5MB' }))

  server.all('*', (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url || '', true)
      
      if (parsedUrl.query.url !== undefined &&
        String(parsedUrl.query.url).startsWith('/roonapi/getImage')) {
        var split_str = String(parsedUrl.query.url).split('=');
        var image_key = split_str[1];
        core.services.RoonApiImage.get_image(
          image_key,
          { scale: "fit", width: 1080, height: 1080, format: "image/jpeg" },
          function(cb, contentType, body) {
            res.contentType = contentType;

            res.writeHead(200, { "Content-Type": "image/jpeg" });
            res.end(body, "binary");
          }
        );
      } else if (parsedUrl.href !== undefined &&
                 parsedUrl.href.startsWith('/roonapi/goRefreshBrowse')) {
        refresh_browse(req.body.zone_id, req.body.options, function(payload) {
          res.send(payload);
        });
      } else if (parsedUrl.href !== undefined &&
                 parsedUrl.href.startsWith('/roonapi/goLoadBrowse')) {
        load_browse(req.body.listoffset, function(payload: any) {
          res.send(payload);
        });
      } else {
        handleNextRequests(req, res);
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  server.listen(listenPort, (err: any) => {
    if (err) {
      throw err
    }    
    console.log(`> Ready on http://localhost:${listenPort}`);
  })
})


var roon = new RoonApi({
  extension_id: "com.jams.control",
  display_name: "JAMS",
  display_version: "2.0.0",
  publisher: "Marco Lagerwey",
  log_level: "none",
  email: "masked",
  website: "https://github.com/Lagerwey/Jams",

  core_paired: function(core_: { services: any; }) {
    core = core_;

    pairStatus = true;
    roonWebSock.emit("pairStatus", JSON.parse('{"pairEnabled": ' + pairStatus + "}"));

    transport = core_.services.RoonApiTransport;

    transport.subscribe_zones(function(response, data) {
      var i, x: string | number, y, zone_id, display_name;
      if (response == "Subscribed") {
        for (x in data.zones) {
          zone_id = data.zones[x].zone_id;
          display_name = data.zones[x].display_name;
          var item:any = {};
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
            roonWebSock.emit("zoneStatus", zoneStatus);
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

  core_unpaired: function() {
    pairStatus = false;
    roonWebSock.emit("pairStatus", JSON.parse('{"pairEnabled": ' + pairStatus + "}"));
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
function removeDuplicateList(array: any[], property: string) {
  var x;
  var new_array = [];
  var lookup:any = {};
  for (x in array) {
    lookup[array[x][property]] = array[x];
  }

  for (x in lookup) {
    new_array.push(lookup[x]);
  }

  zoneList = new_array;
  roonWebSock.emit("zoneList", zoneList);
}

// Remove duplicates from zoneStatus array
function removeDuplicateStatus(array: any[], property: string) {
  var x;
  var new_array = [];
  var lookup:any = {};
  for (x in array) {
    lookup[array[x][property]] = array[x];
  }

  for (x in lookup) {
    new_array.push(lookup[x]);
  }

  zoneStatus = new_array;
  roonWebSock.emit("zoneStatus", zoneStatus);
}

function refresh_browse(zone_id: any, options: any, callback: { (payload: any): void; (arg0: any): void; }) {
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
        var listoffset:any = payload.list.display_offset;
      } else {
        var listoffset:any = 0;
      }
      core.services.RoonApiBrowse.load(
        {
          hierarchy: "browse",
          offset: listoffset,
          set_display_offset: listoffset
        },
        function(_error, payload) {
          callback(payload);
        }
      );
    }
  });
}

function load_browse(listoffset: any, callback: { (payload: any): void; (arg0: any): void; }) {
  core.services.RoonApiBrowse.load(
    {
      hierarchy: "browse",
      offset: listoffset,
      set_display_offset: listoffset
    },
    function(_error, payload) {
      callback(payload);
    }
  );
}

// fs.open(ir_recv_fifo_name, fs.constants.O_RDWR | fs.constants.O_NONBLOCK, (err, fd) => {
//   const pipe = new net.Socket({ fd });
//   // Now `pipe` is a stream that can be used for reading from the FIFO.
//   pipe.on('data', (data) => {
//     // process data ...
//     ir_cmd = String(data).replaceAll("\n", "");
//     switch (ir_cmd) {
//       case "KEY_BLUE":
//         console.log("KEY BLUE!!!");
//         break;
//       case "KEY_PLAY":
//         transport.control(msg, "playpause");
//         break;
//       case "KEY_PREV":
//         transport.control(msg, "previous");
//         break;
//       case "KEY_NEXT":
//         transport.control(msg, "next");
//         break;
//       case "KEY_FF":
//         console.log("KEY FORWARDS!!!");
//         break;
//       case "KEY_REW":
//         console.log("KEY REWIND!!!");
//         break;
//       case "KEY_STOP":
//         transport.control(msg, "stop");
//         break;
//       default:
//         console.log("ERROR: Received an unknown IR command (" + ir_cmd + ")");
//         break;
//     }
//   });

//   // Handle err
//   if (err) {
//     console.error('Error occurred handling FIFO', err)
//   }
// });



// // ---------------------------- WEB SOCKET --------------
roonWebSock.on("connection", function(socket:any ) {
  roonWebSock.emit("pairStatus", JSON.parse('{"pairEnabled": ' + pairStatus + "}"));
  roonWebSock.emit("zoneList", zoneList);
  roonWebSock.emit("zoneStatus", zoneStatus);

  socket.on("getZone", function() {
    roonWebSock.emit("zoneStatus", zoneStatus);
  });

  socket.on("changeVolume", function(msg: { output_id: any; volume: any; }) {
    transport.change_volume(msg.output_id, "absolute", msg.volume);
  });

  socket.on("changeSetting", function(msg: { setting: string; value: any; zone_id: any; }) {
    var settings: any = {};

    if (msg.setting == "shuffle") {
      settings.shuffle = msg.value;
    } else if (msg.setting == "auto_radio") {
      settings.auto_radio = msg.value;
    } else if (msg.setting == "loop") {
      settings.loop = msg.value;
    }

    transport.change_settings(msg.zone_id, settings, function(error) {});
  });

  socket.on("goPrev", function(msg: any) {
    transport.control(msg, "previous");
  });

  socket.on("goNext", function(msg: any) {
    transport.control(msg, "next");
  });

  socket.on("goPlayPause", function(msg: any) {
    transport.control(msg, "playpause");
  });

  socket.on("goPlay", function(msg: any) {
    transport.control(msg, "play");
  });

  socket.on("goPause", function(msg: any) {
    transport.control(msg, "pause");
  });

  socket.on("goStop", function(msg: any) {
    transport.control(msg, "stop");
  });
});






