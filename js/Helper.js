export default class Helper {
    static arrayToRanges(arr) {
        let ranges = [];
        for (let i=0; i<arr.length; i++) {
            if(i == 0 || arr[i] != arr[i-1]+1) {
                ranges.push([arr[i], arr[i]]);
            } else {
                ranges[ranges.length-1][1] = arr[i];
            }
        }
        let prettyRanges = ranges.map(r=>r[0] == r[1] ? r[0] : `${r[0]}-${r[1]}`);
        return prettyRanges.join(', ');
    }

    static colorToHexString(color) {
        return '#' + color.map(c=>c.toString(16).padStart(2, '0')).join('');
    }

    static loopValue(min, max, val) {
        if(isNaN(val)) return min;
        if(val < min) return max;
        if(val > max) return min;
        return val;
    }

    static readByteString(buffer, offset, length) {
        const byteArray = new Uint8Array(buffer, offset, length);
        let byteString = '';
        for(let i = 0; i < byteArray.length; i++) {
            byteString += String.fromCharCode(byteArray[i]);
        }
        return byteString;
    }

    static create3DArray(x, y, z) {
        return new Array(x).fill(0).map(()=>new Array(y).fill(0).map(()=>new Array(z).fill(0)));
    }
}