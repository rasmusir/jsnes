"use strict";

window.addEventListener("load", () => {
    let nes = new JSNES({
        ui : UI,
        fpsInterval : 250,
        fpsPrintToConsole : false
    });

    nes.ui.loadROM(rom => {
        nes.loadRom(rom);
        nes.start();
    });

    document.querySelector("#save").addEventListener("click", () => {
        localStorage.setItem("save", JSON.stringify(nes.toJSON()));
    });

    document.querySelector("#load").addEventListener("click", () => {
        nes.stop();
        nes.reset();
        nes.fromJSON(JSON.parse(localStorage.getItem("save")));
        nes.start();
    });

});

class UI
{
    constructor(nes)
    {
        this.nes = nes;
        this.canvas = document.createElement("canvas");
        this.canvas.width = 256;
        this.canvas.height = 240;
        this.canvasContext = this.canvas.getContext("2d");

        this.canvasImageData = this.canvasContext.getImageData(0, 0, 256, 240);
        this.resetCanvas();

        window.addEventListener("keydown", event => nes.keyboard.keyDown(event));
        window.addEventListener("keyup", event => nes.keyboard.keyUp(event));
        window.addEventListener("keypress", event => nes.keyboard.keyPress(event));

        this.dynamicAudio = new DynamicAudio({
            swf: nes.opts.swfPath+"dynamicaudio.swf"
        });

        document.body.appendChild(this.canvas);
    }

    writeFrame(buffer, prevBuffer)
    {
        var imageData = this.canvasImageData.data;
        var pixel, i, j;

        for (i=0; i<256*240; i++) {
            pixel = buffer[i];

            if (pixel != prevBuffer[i]) {
                j = i*4;
                imageData[j] = pixel & 0xFF;
                imageData[j+1] = (pixel >> 8) & 0xFF;
                imageData[j+2] = (pixel >> 16) & 0xFF;
                prevBuffer[i] = pixel;
            }
        }

        this.canvasContext.putImageData(this.canvasImageData, 0, 0);
    }

    writeAudio(samples)
    {
        return this.dynamicAudio.writeInt(samples);
    }

    updateStatus(status)
    {
        console.log("Current status:", status);
    }

    resetCanvas()
    {
        this.canvasContext.fillStyle = 'black';
        // set alpha to opaque
        this.canvasContext.fillRect(0, 0, 256, 240);

        // Set alpha
        for (var i = 3; i < this.canvasImageData.data.length-3; i += 4) {
            this.canvasImageData.data[i] = 0xFF;
        }
    }

    loadROM(callback)
    {
        this.updateStatus("Downloading zelda.nes");
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "roms/zelda.nes");
        xhr.overrideMimeType("text/plain; charset=x-user-defined");

        xhr.onload = () => {
            let data = xhr.responseText;
            callback(data);
        };

        xhr.send();
    }
}