var fs = require("fs");
var chip8 = require("./chip8");
var readStream = fs.createReadStream("PONG2");
readStream.on("data", function (chunk) {
    chip8.reset();
    chip8.loadRom(chunk);
    ctx.clear();
    while (true) {
        chip8.emulateCycle();
    }
});