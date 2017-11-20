var fs = require("fs");
//var chip8 = require("./static/scripts/chip8");
//var readStream = fs.createReadStream("./Roms/PONG2");
var express = require('express');
var app = express();

/*readStream.on("data", function (chunk) {
    chip8.reset();
    chip8.loadRom(chunk);
    while (true) {
        chip8.emulateCycle();
    }
});*/

//Set the view engine to EJSs
app.set('view engine', 'ejs');

//Set the available port or 3000
var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';


//Set the static folder
app.use(express.static(__dirname + '/static'));

//Chip 8 Roms
var roms = [
    { name: 'PONG2'},
    { name: 'SPACE INVADERS'},
];

app.get('/', function(req, res) {
    res.render('index', {
        roms: roms
    });
});
server.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});