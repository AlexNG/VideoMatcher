console.log('VK VM 0.1.6 alpha');
let lib = {
    reNoExt: /\..+$/,
    reNoStartName: /\w+,/,
    reNoLoDashNumber: /_+\(?\d+\)?$/,
    reNoEndTags: /\s*([([].+[)\]])$/, // to remove autorename number like btp (2) and my tags
    timeSep: ':',
    vmRequestId: 'video_matcher',
    showMatches: 'show_matches',
    files: {},
    log: function (msg) {
        // console.log('vm: ' + msg);
    },
    timeStrToSecs: function (s, withMillis) {
        let secs = 0, currSecs = withMillis ? 0.001 : 1;
        let parts = s.split(this.timeSep);
        for (let index = parts.length - 1; index >= 0; index--) {
            secs += parseInt(parts[index]) * currSecs; currSecs *= withMillis && index == parts.length - 1 ? 1000 : 60;
        }
        return secs;
    },
    parseMediaInfo: function(csv, final) {
        let lines = csv.toLowerCase().split(String.fromCharCode(13) + String.fromCharCode(10))
        lines.splice(0, 1);
        lines.forEach(line => {
            if (!line || !line.trim().length) {
                return;
            }
            let values = line.split(';');
            let fullFileName = values[4];
            let fileNameParts = fullFileName.split('\\');
            let sTime = values[19].replace(' h ', this.timeSep).replace(' m ', this.timeSep).replace(' s ', this.timeSep).replace(' ms', '');
            let fileNameOnly = fileNameParts[fileNameParts.length - 1].replace(this.reNoExt, '');
            let time = this.timeStrToSecs(sTime, true);
            let other = this.files[fileNameOnly];
            if (other) {
                other.fullFileNames.push(fullFileName);
                other.times.push(time);
            } else {
                this.files[fileNameOnly] = { fullFileNames: [fullFileName], times: [time] };
            }
        });
        if (final) {
            this.names = Object.keys(this.files);
        }
    },
    propFind: function(obj, predicate, props) {
        let prop = (props || Object.keys(obj)).find(p => predicate(obj[p]));
        return prop ? obj[prop] : undefined;
    }
};