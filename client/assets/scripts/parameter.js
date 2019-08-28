var PageName = {
    loginPage: "login.html",
    mainPage: "main.html",
    popupPage: "popup.html",
    goodsPage: "goods.html"
};

function getHost(url) {
    var host = "NULL";
    if (typeof url == "undefined" || null == url) return host;
    url = url.toLowerCase();
    var regex = /.*\:\/\/([^\/]*).*/;
    if (url.indexOf("://") == -1) url = "http://" + url;
    var match = url.match(regex);
    if (typeof match != "undefined" && null != match) host = match[1];
    return host
}
function getDomain(host) {
    if (host) {
        var parts = host.split(".");
        if (parts.length >= 3) {
            parts.shift();
            return parts.join(".")
        }
    }
    return host
}
function isInList(str, list) {
    for (var i in list) if (list[i] == str) return true;
    return false
}
function mergeParams(args) {
    var params;
    if ("undefined" == typeof extension) params = {
        lastUser: getLastLoginName(),
        version: version
    };
    else params = {
        lastUser: extension.getLastLoginName(),
        version: extension.version
    };
    params = jQuery.extend(params, args);
    return JSON.stringify(params)
}
function checkUserCookie() {
    var length = arguments.length;
    var params, success_cb, failure_cb;
    if (length == 1) success_cb = arguments[0];
    else if (length == 2) if (typeof arguments[0] == "function") {
        success_cb = arguments[0];
        failure_cb = arguments[1]
    } else {
        params = arguments[0];
        success_cb = arguments[1]
    } else {
        params = arguments[0];
        success_cb = arguments[1];
        failure_cb = arguments[2]
    }
    var cookie = "undefined" == typeof extension ? getCookie() : extension.getCookie();
    if (cookie == null) if ("function" == typeof failure_cb) failure_cb(params);
    else if ("undefined" == typeof extension) reset();
    else extension.reset();
    else if (typeof success_cb == "function") success_cb(cookie, params)
};