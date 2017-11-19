var chip8 = {
  keyboard: new Array(16),
  registers: new Array(16),
  memory: new Array(4096),
  I: 0, //Index
  pc: 0x200, // Program counter starts at 0x200
  opCode: 0,
  display: new Array(64 * 32),
  delayTimer: 0,
  soundTimer: 0,
  drawFlag: 0,
  stack: new Array(16),
  position: 0,
  fontset:
  [
    0xF0, 0x90, 0x90, 0x90, 0xF0, //0
    0x20, 0x60, 0x20, 0x20, 0x70, //1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, //2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, //3
    0x90, 0x90, 0xF0, 0x10, 0x10, //4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, //5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, //6
    0xF0, 0x10, 0x20, 0x40, 0x40, //7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, //8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, //9
    0xF0, 0x90, 0xF0, 0x90, 0x90, //A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, //B
    0xF0, 0x80, 0x80, 0x80, 0xF0, //C
    0xE0, 0x90, 0x90, 0x90, 0xE0, //D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, //E
    0xF0, 0x80, 0xF0, 0x80, 0x80  //F
  ],
  reset: function () {
    console.log('reset')
    //Reset memory
    for (i = 0; i < this.memory.length; i++) {
      if (i < 80)
        this.memory[i] = this.fontset[i];
      else this.memory[i] = 0;
    }
    //Reset the keyboard and this.registers
    for (i = 0; i < 16; i++) {
      this.keyboard[i] = 0;
      this.registers[i] = 0;
      this.stack[i] = 0;
    }
    //Reset screen
    for (i = 0; i < 64; i++) {
      this.display[i] = new Array();
      for (j = 0; j < 32; j++) {
        this.display[i][j] = 0;
      }
    }
    //Reset timers
    this.delayTimer = 0;
    this.soundTimer = 0;
    //Reset Program Counter
    this.pc = 0x200;
    //Reset op code
    this.opCode = 0;
    //Reset Index
    this.I = 0;
    //Reset this.position
    this.position = 0;
  },
  loadRom: function (data) {
    data.map((elem, i) => {
      this.memory[i + 512] = elem; //512 == 0x200, it's where our program counter will start reading at memory
    });
  },
  showMemory: function () {
    let counter = 0;
    console.log("memory = [");
    while (counter < this.memory.length - 1) {
      console.log(this.memory[counter].toString(16), this.memory[counter + 1].toString(16), this.memory[counter + 2].toString(16), this.memory[counter + 3].toString(16),
        this.memory[counter + 4].toString(16), this.memory[counter + 5].toString(16), this.memory[counter + 6].toString(16), this.memory[counter + 7].toString(16),
        this.memory[counter + 8].toString(16), this.memory[counter + 9].toString(16), this.memory[counter + 10].toString(16), this.memory[counter + 11].toString(16),
        this.memory[counter + 12].toString(16), this.memory[counter + 13].toString(16), this.memory[counter + 14].toString(16), this.memory[counter + 15].toString(16),
        this.memory[counter + 16].toString(16), this.memory[counter + 17].toString(16), this.memory[counter + 18].toString(16), this.memory[counter + 19].toString(16),
        this.memory[counter + 20].toString(16));
      counter += 21;
    }
    console.log("]");
  },
  showRegisters: function () {
    let counter = 0;
    for (i = 0; i < this.registers.length; i++) {
      console.log("registers [", i.toString(16), "] = ", this.registers[i].toString(16));
    }
  },
  emulateCycle: function () {
    this.opCode = this.memory[this.pc] << 8 | this.memory[this.pc + 1];
    console.log("emulateCycle: this.opCode = ", this.opCode.toString(16), "I = ", this.I.toString(16), "stack = ", this.stack[this.position].toString(16),
      "memory [", this.pc, "]");

    switch (this.opCode & 0xF000) {
      case 0x0000:
        switch (this.opCode & 0x000F) {
          case 0x0000:
            for (i = 0; I < 2048; i++)
              this.display[i] = 0x0;
            this.drawFlag = 1;
            this.pc += 2;
            break;

          case 0x000E:
            this.position = this.position - 1;
            this.pc = this.stack[this.position];
            this.pc += 2;
            break;

          default:
            console.log("Unknown opCode[0x0000]:", this.opCode.toString(16));
            console.log("OpCode switchs 00E0 e 0x00EE");
        }
        break;

      case 0x1000:
        this.pc = this.opCode & 0x0FFF;
        break;

      case 0x2000:
        this.stack[this.position] = this.pc;
        this.pc = this.opCode & 0x0FFF;
        this.position++;
        break;

      case 0x3000:
        if (this.registers[(this.opCode & 0x0F00) >> 8] == (this.opCode & 0x00FF))
          this.pc += 4;
        else
          this.pc += 2;

        break;

      case 0x4000:
        if (this.registers[(this.opCode & 0x0F00) >> 8] != (this.opCode & 0x00FF))
          this.pc += 4;
        else
          this.pc += 2;
        break;

      case 0x5000:
        if (this.registers[(this.opCode & 0x0F00) >> 8] == this.registers[(this.opCode & 0x00F0) >> 4])
          this.pc += 4;
        else
          this.pc += 2;

        break;

      case 0x6000:
        console.log(((this.opCode & 0x0F00) >> 8));
        this.registers[(this.opCode & 0x0F00) >> 8] = (this.opCode & 0x00FF);
        this.pc += 2;
        break;

      case 0x7000:
        this.registers[(this.opCode & 0x0F00) >> 8] = this.registers[(this.opCode & 0x0F00) >> 8] + (this.opCode & 0x00FF);
        this.pc += 2;
        break;

      case 0x8000:
        switch (this.opCode & 0x000F) {
          case 0x0000:
            this.registers[(this.opCode & 0x0F00) >> 8] = this.registers[(this.opCode & 0x00F0) >> 4];
            this.pc += 2;
            break;

          case 0x0001:
            this.registers[(this.opCode & 0x0F00) >> 8] = this.registers[(this.opCode & 0x0F00) >> 8] | this.registers[(this.opCode & 0x00F0) >> 4];
            this.pc += 2;
            break;

          case 0x0002:
            this.registers[(this.opCode & 0x0F00) >> 8] = this.registers[(this.opCode & 0x0F00) >> 8] & this.registers[(this.opCode & 0x00F0) >> 4];
            this.pc += 2;
            break;

          case 0x0003:
            this.registers[(this.opCode & 0x0F00) >> 8] = this.registers[(this.opCode & 0x0F00) >> 8] ^ this.registers[(this.opCode & 0x00F0) >> 4];
            this.pc += 2;
            break;

          case 0x0004:
            this.registers[(this.opCode & 0x0F00) >> 8] = this.registers[(this.opCode & 0x0F00) >> 8] + this.registers[(this.opCode & 0x00F0) >> 4];
            if (this.registers[(this.opCode & 0x00F0) >> 4] > (0xFF - this.registers[(this.opCode & 0x0F00) >> 8]))
              this.registers[15] = 1;
            else
              this.registers[15] = 0;
            this.pc += 2;
            break;

          case 0x0005:
            if (this.registers[(this.opCode & 0x00F0) >> 4] > this.registers[(this.opCode & 0x0F00) >> 8])
              this.registers[15] = 0;
            else
              this.registers[15] = 1;

            this.registers[(this.opCode & 0x0F00) >> 8] = this.registers[(this.opCode & 0x0F00) >> 8] - this.registers[(this.opCode & 0x00F0) >> 4];

            this.pc += 2;
            break;

          case 0x0006:
            this.registers[15] = this.registers[(this.opCode & 0x0F00) >> 8] & 0x01;
            this.registers[(this.opCode & 0x0F00) >> 8] = this.registers[(this.opCode & 0x0F00) >> 8] >> 1;
            this.pc += 2;
            break;

          case 0x0007:
            if (this.registers[(this.opCode & 0x0F00) >> 8] > this.registers[(this.opCode & 0x00F0) >> 4])
              this.registers[15] = 0;
            else
              this.registers[15] = 1;

            this.registers[(this.opCode & 0x0F00) >> 8] = this.registers[(this.opCode & 0x0F00) >> 4] - this.registers[(this.opCode & 0x00F0) >> 8];
            this.pc += 2;
            break;

          case 0x000E:
            this.registers[15] = this.registers[(this.opCode & 0x0F00) >> 8] >> 7;
            this.registers[(this.opCode & 0x0F00) >> 8] = this.registers[(this.opCode & 0x0F00) >> 8] << 1;
            this.pc += 2;
            break;

          default:
            console.log("Unknown opCode [0x8000]:", this.opCode.toString(16));
            console.log("OpCode switchs 0x8000");
        }
        break;

      case 0x9000:
        if (this.registers[(this.opCode & 0x0F00) >> 8] != this.registers[(this.opCode & 0x00F0) >> 4])
          this.pc += 4;
        else
          this.pc += 2;
        break;

      case 0xA000:
        I = (this.opCode & 0x0FFF);
        this.pc += 2;
        break;

      case 0xB000:
        this.pc = this.registers[0] + (this.opCode & 0x0FFF);
        break;

      case 0xC000:
        this.registers[(this.opCode & 0x0F00) >> 8] = (this.opCode & 0x00FF) & (rand() % 0xFF);
        this.pc += 2;
        break;

      case 0xD000:
        {
          var x = this.registers[(this.opCode & 0x0F00) >> 8];
          var y = this.registers[(this.opCode & 0x00F0) >> 4];
          var height = this.opCode & 0x000F;
          var pixel;

          this.registers[15] = 0;
          for (line_y = 0; line_y < height; line_y++) {
            pixel = this.memory[i + line_y];
            for (line_x = 0; line_x < 8; line_x++) {

              if ((pixel & (0x80 >> line_x)) != 0) {

                if (this.display[(x + line_x + ((y + line_y) * 64))] == 1)
                  this.registers[15] = 1;
                this.display[x + line_x + ((y + line_y) * 64)] ^= 1;
              }
            }
          }

          this.drawFlag = 1;
          this.pc = this.pc + 2;
        }
        break;

      case 0xE000:
        switch (this.opCode & 0x00FF) {
          case 0x009E:
            if (keyboard[this.registers[(this.opCode & 0x0F00) >> 8]] != 0)
              this.pc += 4;
            else
              this.pc += 2;
            break;

          case 0x00A1:
            if (keyboard[this.registers[(this.opCode & 0x0F00) >> 8]] == 0)
              this.pc += 4;
            else
              this.pc += 2;
            break;

          default:
            console.log("Unknown opCode [0x8000]:", this.opCode.toString(16));
            console.log("OpCode switchs 0xE000");
        }
        break;

      case 0xF000:
        switch (this.opCode & 0x00FF) {
          case 0x0007:
            this.registers[(this.opCode & 0x0F00) >> 8] = this.timerDelay;
            this.pc += 2;
            break;

          case 0x000A:
            {
              var key_pressed = 0;
              for (i = 0; i < 16; i++) {
                if (keyboard[i] != 0) {
                  this.registers[(this.opCode & 0x0F00) >> 8] = i;
                  key_pressed = 1;
                }
              }
              if (keyboard[i] != 1)
                return;

              this.pc += 2;
            }
            break;

          case 0x0015:
            this.timerDelay = this.registers[(this.opCode & 0x0F00) >> 8];
            this.pc += 2;
            break;

          case 0x0018:
            this.soundTimer = this.registers[(this.opCode & 0x0F00) >> 8];
            this.pc += 2;
            break;

          case 0x001E:
            if (I + this.registers[(this.opCode & 0x0F00) >> 8] > 0xFFF)
              this.registers[15] = 1;
            else
              this.registers[15] = 0;

            I = I + this.registers[(this.opCode & 0x0F00) >> 8];
            this.pc += 2;
            break;

          case 0x0029:
            this.I = this.registers[(this.opCode & 0x0F00) >> 8] * 0x5;
            this.pc += 2;
            break;

          case 0x0033:
            this.memory[I] = this.registers[(this.opCode & 0x0F00) >> 8] / 100;
            this.memory[I + 1] = (this.registers[(this.opCode & 0x0F00) >> 8] / 10) % 10;
            this.memory[I + 2] = (this.registers[(this.opCode & 0x0F00) >> 8] % 100) % 10;
            this.pc += 2;
            break;

          case 0x0055:
            for (i = 0; i <= this.registers[(this.opCode & 0x0F00) >> 8]; i++)
              memory[I + i] = this.registers[i];
            this.pc += 2;
            break;

          case 0x0065:
            for (i = 0; i <= ((this.opCode & 0x0F00) >> 8); i++)
              this.registers[i] = this.memory[this.I + i];
            this.pc += 2;
            break;

          default:
            console.log("Unknown opCode [0x8000]:", this.opCode.toString(16));
            console.log("OpCode switchs 0xF000");
        }
        break;

      default:
        console.log("Unknown opCode [0x8000]:", this.opCode.toString(16));
    }
  }
}

module.exports = chip8;