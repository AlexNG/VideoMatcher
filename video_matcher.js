// background file - setting up plugin, accessing OS

let mediaInfoUrl = // 'http://localhost:3000/d/MediaInfo_Example_Alex_VK_VideoMatcher_Test.csv'; // home test
	[// 'http://localhost/VideoMatcherTest/all.csv'
'I_Storage_Videos2.csv',
'I_Storage_VK.csv',
'M-VK.csv'
	]; // test @ work

/*
// put lib to console
function sendActiveTabMessage(a, o) { console.log(o); }
let mediaInfoUrl = 'http://localhost:3000/d/MediaInfo_Example.csv';
// */

// ------------------- \|/ test in browser by performMatching()
function performMatching(urlIndex) {
    lib.log('performMatching');
    fetch('http://localhost/VideoMatcherTest/' + mediaInfoUrl[urlIndex]).then(response =>
    {
        response.text().then(csv => {
            let final = mediaInfoUrl.length == urlIndex + 1;
            lib.parseMediaInfo(csv, final);
            if (final) {
                sendActiveTabMessage(lib.showMatches, { files: lib.files, names: lib.names });
            }
            else {
                performMatching(urlIndex + 1);
            }
        });
    }, lib.log(`Failed fetching ${mediaInfoUrl[urlIndex]}`));
}
// ------------------- /|\ test in browser

function sendActiveTabMessage(op, data) { // 2
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: lib.vmRequestId, op: op, data: data });
    });
}

chrome.contextMenus.create({ // 1
    "id": lib.requestId, "title": "VideoMatcher", "contexts": ["page", "selection", "link", "editable", "image", "video"],
    "onclick": function () {
        performMatching(0);
    }
});