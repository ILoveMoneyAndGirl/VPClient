var extension;
function addMessage(message, parent, msgType) {
    var msgStr = "";
    var cls = "";
    if (msgType == "error") cls = "info error";
    else if (msgType == "info") cls = "info";
    msgStr = '<span class="' + cls + '">' + message + "</span>";
    $(msgStr).appendTo(parent)
}
function removeMessage(parent) {
    parent.find("span").remove()
}
$(document).ready(function() {
    // console.log("ready................................................enter")
    extension = chrome.extension.getBackgroundPage(); (function() {
        chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
            var callback;
            try {
                    // console.log("ready...... callback");
                    // console.log(request.callback);
           
                window[request.callback](request.data,request);
                // window["fccc"](request.data,request);
     
            } catch(exception) {}
            // if (typeof callback === "function")new callback(request.data,request);
            // else;
        })
    })()
});

function MyLog(data){
    console.log(data);
}