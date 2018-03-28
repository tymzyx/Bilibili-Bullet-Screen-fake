'use strict';

function secondToTime(result) {
    let h = Math.floor(result / 3600);
    let m = Math.floor((result / 60 % 60));
    let s = Math.floor((result % 60));
    let time = h + ":" + m + ":" + s;
    return time;
}


export default {
    secondToTime
}
