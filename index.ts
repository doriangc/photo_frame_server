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
            const nextDate = new Date();
            
            if (now.getHours() >= 18) {
                nextDate.setDate(nextDate.getDate()+1);
                nextDate.setHours(3, 0, 0, 0);
            } else if (now.getHours() >= 14) {
                nextDate.setHours(19, 0, 0, 0);
            } else if (now.getHours() >= 10) {
                nextDate.setHours(15, 0, 0, 0);
            } else {
                nextDate.setHours(10, 0, 0, 0);
            }

            console.log(nextDate, "--", now);

            // Sleep in milliseconds
            let sleep = dateDiffInMs(nextDate, now);
            console.log(`Sleep for ${sleep} milliseconds`);

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