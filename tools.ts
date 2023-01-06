const dateDiffInMs = (a: Date, b: Date) => {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
    const utc2 = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
    
    return Math.abs(utc2 - utc1)
}

const dateDiffInDays = (a: Date, b: Date) => {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

  
    return Math.floor(dateDiffInMs(a, b) / _MS_PER_DAY);
}

export { dateDiffInMs, dateDiffInDays };