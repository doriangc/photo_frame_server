import fs, { promises as fsProm } from 'fs';
import net from 'net';
import _ from 'lodash';
import { getNewImage } from './images';
import { dateDiffInMs } from './tools';

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

            const sleep = dateDiffInMs(tomorrow, now);

            sock.write(sleep);
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
        console.log(`Server listening on ${server.address()}`);
    });
})();