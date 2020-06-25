// DOM accessing file

/*
// put lib to console
function fuzzySearch(domVideo) { console.log(domVideo); return 100; } // to test with iterateVideosInDom()
// */

function iterateVideosInDom(videosList) {
    lib.log(`iterateVideosInDom for ${videosList.names.length} item(s)`);
    let safeGetInnerText = function(elem) {
        return elem ? elem.innerText : null;
    }
    let selectors = [
        { video: '.mv_playlist_item', time: '.mv_playlist_item_duration', name: '.mv_playlist_item_title' }, // video view - right to video
        { video: '.mv_recom_item', time: '.mv_recom_item_duration', name: '.mv_recom_title' }, // video view - right to comments
        { video: '.video_item', time: '.video_thumb_label', name: '.video_item_title' } // album grid view
    ];
    let found;
    selectors.forEach(function (selector) {
        let elems = document.querySelectorAll(selector.video);
        if (elems.length) {
            found = true;
        }
        for (var i = 0; i < elems.length; ++i) {
            let label = elems[i].querySelector(selector.name.toLowerCase());
            let name = safeGetInnerText(label);
            if (!name) { // Suggested videos on other tab or smth. else
                continue;
            }
            let domVideo = {
                name: name,
                time: lib.timeStrToSecs(elems[i].querySelector(selector.time).innerText)
            };
            setMatch(label, fuzzySearch(domVideo, videosList));
        }
    });
    if (!found) {
        lib.log('selectors not matched');
    }
}

function setMatch(elem, match) {
    let cl = elem.classList;
    cl.remove('vm_red'); // partial name match, 2 sec time diff
    cl.remove('vm_yellow'); // partial name match, no more than 1 sec time diff
    cl.remove('vm_green'); // exact name match, no more than 1 sec time diff
    cl.toggle('vm_checked', true);
    if (!match) {
        return;
    }
    lib.log(`${elem.innerText} : ${match.level} ${match.byTime}`);
    if (match.byTime) {
        cl.add('vm_blue');
        return;
    }
    cl.add(match.level >= 99 ? 'vm_green' : (match.level >= 74 ? 'vm_yellow' : 'vm_red'));
}

function prepareFuzzyName(name){
    let s = name.replace(lib.reNoStartName, '')
        .replace(lib.reNoLoDashNumber, '')
        .replace(lib.reNoEndTags, '');
    // lib.log(`prepareFuzzyName : ${name} : ${s}`);
    return s;
}

function getNameMatchLevel(file, level) {
    return file ? { file: file, level: level } : null;
}

function fuzzySearch(domVideo, videosList) {
    let name = domVideo.name.toLowerCase();
    let match = getNameMatchLevel(videosList.files[name], 100)
        || getNameMatchLevel(
            videosList.files[videosList.names.find(n => prepareFuzzyName(name) == prepareFuzzyName(n))], 75);
    if (match)
    {
        let times = match.file.times.filter(t => Math.abs(t - domVideo.time) < 3);
        match.level = times.find(t => Math.abs(t - domVideo.time) < 2)
            ? match.level
            : (times.length ? match.level * 0.75 : 0);
    } else {
        if (lib.propFind(videosList.files, (f) => f.times.find(t => Math.abs(t - domVideo.time) < 1), videosList.names)) {
            match = { level: 50, byTime: true };
        }
    }
    lib.log(`fuzzySearch : ${name} : ${match}`);
    return match;
}
// ------------------- /|\ test in browser

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
      if (request.type != lib.vmRequestId || request.op != lib.showMatches) {
          return;
      }
      iterateVideosInDom(request.data);
  }
);