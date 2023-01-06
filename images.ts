import { promises as fsProm } from 'fs';
import _ from 'lodash';
import { dateDiffInDays } from './tools';

type ImageData = {
    images: {
        raw: string,
        png: string,
        date_range: {
            start_month: number,
            start_day: number,
            end_month: number,
            end_day: number
        },
        show: boolean,
        priority: number,
        last_accessed: {
            year: number,
            month: number,
            day: number
        }
    }[]
};


const EXPECTED_BUFFER_SIZE = 600 * 448 / 2;

const getNewImage = async (): Promise<Buffer> => {
    let candidates: string[] = [];
    let priority = -1;

    const manifest = await fsProm.readFile('./images/manifest.json', 'utf8');

    // parse JSON string to JSON object
    const image_data: ImageData = JSON.parse(manifest);
    const today = new Date();

    for (const image of image_data.images) {
        if (!image.show) continue;

        console.log(`Considering ${image.png}`);

        // Determine when this photo starts becoming active
        const spansNewYear = image.date_range.end_month < image.date_range.start_month;

        // const lastAccessedId = 31 * image.last_accessed.month * 31 + image.last_accessed.day;
        const todayDayId = 31 * today.getMonth() + today.getDate();
        const startDayId = 31 * image.date_range.start_month + image.date_range.start_day;
        const endDayId = 31 * image.date_range.end_month + image.date_range.end_day;

        // console.log(todayDayId, startDayId, endDayId, spansNewYear);


        const lastAccessed = new Date(image.last_accessed.year, image.last_accessed.month, image.last_accessed.day);
        const diffDays = dateDiffInDays(today, lastAccessed);

        // If this photo was shown in the last three months, skip.
        if (diffDays < 90) {
            console.log(`Skipping because photo shown only ${diffDays} days ago`)
            continue;
        }

        // If today out of range for this picure, then skip
        if ((todayDayId < startDayId || todayDayId > endDayId) && !spansNewYear) {
            console.log("Skipping because falls outside time frame (does not span New Year)");
            continue;
        };
        // If today out of range for this picture if spans across new year, then skip
        if (todayDayId < startDayId && todayDayId > endDayId && spansNewYear) {
            console.log("Skipping because falls outside time frame (spans New Year)");
            continue;
        }

        // If lower than currently established priority, then skip.
        if (image.priority < priority) {
            console.log("Skipping because lower than priority")
            continue;
        }

        // If higher priority than all current pics, then clear everything else
        if (image.priority > priority) {
            console.log("Clearing all due to higher priority")
            candidates = [];
            priority = image.priority;
        }

        candidates.push(image.raw);
    }

    const candidateFile = _.sample(candidates) ?? "images/default.raw";
    console.log(`Chose ${candidateFile}`)


    const file = await fsProm.open(candidateFile, 'r');
    const buffer = Buffer.alloc(EXPECTED_BUFFER_SIZE);
    await file.read(buffer, 0, EXPECTED_BUFFER_SIZE);

    return buffer;
};

export { getNewImage };