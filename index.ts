import fs, { promises as fsProm } from 'fs';

import { Int64BE } from "int64-buffer";
import _ from 'lodash';
import { dateDiffInMs } from './tools';
import { getNewImage } from './images';
import net from 'net';

const PORT = 9383;
const HOST = "0.0.0.0";

const onClientConnected = (sock: any) => {
    var remoteAddress = sock.remoteAddress + ':' + sock.remotePort;
    console.log('New client connected: %s', remoteAddress);

    sock.on('data', async (data: any) => {
        console.log('%s Says: %s', remoteAddress, data);

        if (data.includes("get_picture")) {
            let currentImageBuffer = await getNewImage();
            sock.write(currentImageBuffer);
        } else if (data.includes("get_sleep_duration")) {
            const now = new Date();
            
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate()+1);
            tomorrow.setHours(3, 0, 0, 0);

            console.log(tomorrow, "--", now);

            // Sleep in milliseconds
            let sleep = dateDiffInMs(tomorrow, now);
            console.log(`Sleep for ${sleep} milliseconds`);
            sleep = 20*1000;

            // Force to 64 bits
            var sleepUs = new Int64BE(sleep * 1000);
            console.log(`Sleep for ${sleepUs.toString()} microseconds`);

            const outData = sleepUs.toBuffer();

            console.log(outData);

            sock.write(outData);
        } else {
            sock.write("????");
        }
    });

    sock.on('close', () => {
        console.log('connection from %s closed', remoteAddress);
    });

    sock.on('error', (err: any) => {
        console.log('Connection %s error: %s', remoteAddress, err.message);
    });
}

(async () => {
    console.log("Starting photo frame server...");

    const server = net.createServer(onClientConnected);

    server.listen(PORT, HOST, function () {
        console.log(`Server listening on ${JSON.stringify(server.address())}`);
    });
})();