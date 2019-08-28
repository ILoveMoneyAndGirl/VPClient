var websocket = null;
var version = "1.0.0";
var versionStatus = 0;
var ModelType = {
    needed: "needed",
    always: "always",
    closed: "closed"
};
var invationCode = null;
var defaultModel = ModelType.needed;
var count = 0;
var serverIndex = 0;

var defaultPAC = "function FindProxyForURL(url, host){return 'DIRECT';}";
var invat_link = "https://chrome.google.com/webstore/detail/%E5%A3%81%E8%99%8E%E6%BC%AB%E6%AD%A5/iahlmnbegagknnkkldncbplimibpcomf?utm_campaign=en&utm_source=en-et-na-us-oc-webstrhm&utm_medium=et";
var praise_link = "https://chrome.google.com/webstore/detail/%E5%A3%81%E8%99%8E%E6%BC%AB%E6%AD%A5/iahlmnbegagknnkkldncbplimibpcomf?utm_campaign=en&utm_source=en-et-na-us-oc-webstrhm&utm_medium=et";
var pacConfig = {
    mode: "pac_script",
    pacScript: {
        data: defaultPAC
    }
};
var proxy = null;
var storage = window.localStorage;
var cookies = chrome.cookies;

init();


function tip(){

chrome.management.getAll(function(e){
    var d=[];
    var t="检测到与以下插件权限冲突:\n";
        for (var i = 0; i < e.length; i++) {
            if(e[i].enabled){
                for (var j = 0; j < e[i].permissions.length; j++) {
                    if(e[i].permissions[j]=="proxy"&&e[i].name!="壁虎漫步"){
                        d.push(i);
                    }
                };
            }
        };

      for (var i = 0; i < d.length; i++) {
            t+=i+1+":"+e[d[i]].name+"\n";

        };
        if(d.length>0){
            if(window.confirm(t+"点击‘确认’ 暂时禁用")){
                for (var i = 0; i < d.length; i++) {
                    chrome.management.setEnabled(e[d[i]].id,false, function(){});

                 };
              }else{
                clearVipCookies();
             }
        }
    })

}
function init() {

    tip();
    setIconStart();
    getInfo();

    initCookies();
    initProxy();
    pingServer();
    addStorageListener();
    initWebRequest();
}
function opPageOnInstall() {
    var install = storage.getItem("install");
    if (!install) {
        storage.setItem("install", true);
        openLoginPage()
    }
}
function fetchPacCallback(data) {
  
    if (versionStatus == 0 || versionStatus == 1) {
        Domains.saveList(data.urlList);
        proxyListSetting(data.prxList);
        showNotices(data.notices)
    } else {
        setProxy();
        Domains.clear();
        opPageOnInstall()
    }
}
function showNotices(notices) {
  
    if (notices) {
       console.log("?????--notices.lengthnotices.lengthnotices.lengthnotices.length->")
        console.log(notices.length)
                console.log(notices)

        for (var i = 0; i < notices.length; i++) {
            var notice = notices[i];
              console.log(notice.content)
            var notification = new Notification(notice.title ? notice.title: "\u901a\u77e5", {
                body: notice.content,
                icon: "/assets/images/gecko 128x128.png"
            })
        }
    }
}
function setProxy(pac) {
    if (!pac || pac == null || $.trim(pac) == "") pac = defaultPAC;
    pacConfig.pacScript.data = pac;
    proxy.settings.set({
        value: pacConfig
    },
    function() {})

}
function initProxy() {
    if (chrome.experimental !== undefined && chrome.experimental.proxy !== undefined) proxy = chrome.experimental.proxy;
    else if (chrome.proxy !== undefined) proxy = chrome.proxy;
    else {
        alert("Need proxy api support, please update your Chrome");
        return
    }
    setProxy()
}
function initCookies() {
    if (chrome.experimental !== undefined && chrome.experimental.cookies !== undefined) cookies = chrome.experimental.cookies;
    else if (chrome.cookies !== undefined) cookies = chrome.cookies;
    else {
        alert("Need cookies support, please allow cookies setting");
        return
    }
}
function initWebSocket(key, callback) {
    var uri = getWSServer();
    if (websocket == null || websocket.readyState != 1) {
        if ("WebSocket" in window)
        {   
            websocket = new WebSocket(uri + "?" + key);

           
        }
        else if ("MozWebSocket" in window)
        {
            websocket = new MozWebSocket(uri);
         
       
        }
        else {
            alert("your browser not support websocket!");
            return
        }
        bindWebSocketEvent(callback)
    }
}
function bindWebSocketEvent(callback) {
    websocket.onopen = function(event) {
        count = 0;
        if (callback) callback();
        if (Domains.getList() == null) fetchPacData();
        else {
            var data = {
                action: "loadPxyList",
                cookie: getCookie(),
                callback: "fetchPxyCallback",
                disptch: "false"
            };
            var dataStr = mergeParams(data);
            sentMsgToServer(dataStr)
        }
        setIconNormal()
    };
    websocket.onmessage = function(event) {
        if (event && event.data) {

            var data = event.data;
            console.log("WS RECIVE",data)

            if (data == "NOT_LOGIN") reset();
            else if (data == "FORCE_LOGOUT") {
                reset();
                alert("您的账号在其他地方登入,请重新登入！")
            } else {
                var jsonData = $.parseJSON(data);
                if (jsonData.status == 200) disptchMessage(jsonData);
                else if (jsonData.status == 500) alert(jsonData.msg)
            }
        }
    };
    websocket.onclose = function(event) {
        setProxy();
        count = 0;
        pingServer()
    };
    websocket.onerror = function(event) {}
}
function reset() {
    closeWebSocket();
    storage.removeItem("model");
    clearCookie();
    setProxy();
    Domains.clear();
    disptchMessage({
        callback: "closePopupWindow",
        disptch: true
    });
    openLoginPage()
}
function fetchPxyCallback(data) {
    // console.log("fetchPxyCallback..............................enter")
   
    if (versionStatus == 0 || versionStatus == 1) {
        proxyListSetting(data.prxList);
        showNotices(data.notices)
    } else {
        setProxy();
        Domains.clear();
        opPageOnInstall()
    }
}
function clearCookie() {
    storage.removeItem("_gecko")
}
function writeCookie(cookie) {
    storage.setItem("_gecko", cookie)
}
function getCookie() {
    return storage.getItem("_gecko")
}

function LoadQRcode(callback,channel,id) {
    var data = {
        action: "loadQRcode",
        callback: callback,
        cookie: getCookie(),
        lastUser: getLastLoginName(),
        version: version,
        channel:channel,
        id:id
    };
    var dataStr = JSON.stringify(data);
    sentMsgToServer(dataStr)
}

function LoadGoods(args) {
    args.action = "loadGoods";
    var dataStr = mergeParams(args);
    connectToServer(dataStr)
}

function checkUserLogin(args) {
    args.action = "checkLogin";
    var dataStr = mergeParams(args);
    connectToServer(dataStr)
}
function loadUserData(args) {
    args.action = "loadUserData";
    var dataStr = mergeParams(args);
    connectToServer(dataStr)
}
function disptchMessage(jsonData) {
    if (jsonData.disptch == true) chrome.extension.sendMessage(jsonData,
    function(response) {});
    else {
        var callback;
        try {
            // console.log("disptchMessage...... callback");
            // console.log(jsonData.callback);
    
              window[jsonData.callback](jsonData.data);
        } catch(exception) {}
        // if (typeof callback === "function") new callback(jsonData.data)
    }
}
function fetchPacData(callback) {
    if (callback) disptch = "true";
    else callback = "fetchPacCallback";
    var lastUser = getLastLoginName();
    var cookie = getCookie();
    var data = {
        action: "fetchPac",
        callback: callback,
        cookie: getCookie(),
        disptch: "false",
        lastUser: lastUser,
        version: version
    };
    var dataStr = JSON.stringify(data);
    sentMsgToServer(dataStr)
}
function getModel() {
    var model = storage.getItem("model");
    if (model) return model;
    else {
        storage.setItem("model", defaultModel);
        return defaultModel
    }
}
function setModel(model) {
    var oldModel = getModel();
    if (oldModel != model) {
        storage.setItem("model", model);
        var pac = Domains.generatePAC(model);
        setProxy(pac)
    }
    // console.log("setModel...........")
    // console.log(model)
}
function getLastLoginName() {
    var user = storage.getItem("lastUser");
    return user ? user: ""
}
function setLastLoginName(lastUser) {
    storage.setItem("lastUser", lastUser)
}
function initWebRequest() {
    chrome.webRequest.onBeforeRequest.addListener(function(obj) {
        refreshSessionStorage();
        clearNoticeInfo(obj.tabId);
        if (obj.tabId != -1 && obj.url.indexOf("chrome-extension://") != 0) {
            var url = getHost(obj.url);
            var href = obj.url.toLowerCase();
            var jsonData = getSessionStorage(obj.tabId);
            if (jsonData && jsonData.url == href) {
                jsonData.list = [];
                jsonData.timestamp = obj.timeStamp
            } else jsonData = {
                tabId: obj.tabId,
                url: href,
                timestamp: obj.timeStamp,
                list: []
            };
            window.sessionStorage.setItem(obj.tabId, JSON.stringify(jsonData))
        }
    },
    {
        urls: ["<all_urls>"],
        types: ["main_frame"]
    });
    chrome.webRequest.onErrorOccurred.addListener(function(obj) {
        if (obj.error == "net::ERR_CONNECTION_TIMED_OUT") {
            var url = getHost(obj.url);
            url = getDomain(url);
            if (url && url != "NULL") {
                var data = window.sessionStorage.getItem(obj.tabId);
                if (data) {
                    var jsonData = $.parseJSON(data);
                    if (obj && obj != null && obj.timeStamp > jsonData.timestamp) if (!Domains.isInList(url) && !isInList(url, jsonData.list)) jsonData.list.push(url);
                    if (jsonData.list.length > 0) setNoticeInfo(obj.tabId);
                    data = JSON.stringify(jsonData);
                    window.sessionStorage.setItem(obj.tabId, data)
                }
            }
        }
    },
    {
        urls: ["<all_urls>"],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "xmlhttprequest"]
    });
    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
        window.sessionStorage.removeItem(tabId + "")
    })
}
function refreshSessionStorage() {
    var len = len = window.sessionStorage.length;
    for (var i = 0; i < len; i++) {
        var tabId = window.sessionStorage.key(i);
        var intId = parseInt(tabId);
        try {
            chrome.tabs.get(intId,
            function(tab) {
                if (!tab || tab == null) window.sessionStorage.removeItem(tabId)
            })
        } catch(e) {
            window.sessionStorage.removeItem(tabId)
        }
    }
}
function getSessionStorage(key) {
    var data = window.sessionStorage.getItem(key);
    if (data) return $.parseJSON(data);
    return null
}
function removeSessionStorage(tabId, urlList) {
    tabId = tabId + "";
    var data = window.sessionStorage.getItem(tabId);
    if (data) {
        var jsonData = $.parseJSON(data);
        var list = [];
        for (var index in jsonData.list) if (!Domains.isInList(jsonData.list[index])) list.push(jsonData.list[index]);
        jsonData.list = list;
        data = JSON.stringify(jsonData);
        window.sessionStorage.setItem(tabId, data)
    }
}
function refreshTab(tabId) {
    var intId = parseInt(tabId);
    chrome.tabs.get(intId,
    function(tab) {
        if (tab && tab != null) chrome.tabs.update(intId, {
            url: tab.url
        },
        function() {})
    })
}
function setNoticeInfo(tabId) {
    chrome.browserAction.setBadgeText({
        text: "!",
        tabId: tabId
    });
    chrome.browserAction.setBadgeBackgroundColor({
        color: [255, 0, 0, 255],
        tabId: tabId
    })
}
function clearNoticeInfo(tabId) {
    chrome.browserAction.setBadgeText({
        text: "",
        tabId: tabId
    });
    chrome.browserAction.setBadgeBackgroundColor({
        color: [0, 0, 0, 0],
        tabId: tabId
    })
}
function sentMsgToServer(msg) {
    console.log("WS SEND",msg)
    if (websocket.readyState == 1)
    {

      websocket.send(msg);

    }
    else {
        alert("与服务器未连接，请检查网络,稍候再试，或重启浏览器！");
        return
    }
}
function connectToServer(dataStr, success, error) {
    if (websocket.readyState == 1) {
  
        websocket.send(dataStr);

        if (success) success()
    } else {
        alert("与服务器未连接，请检查网络,稍候再试，或重启浏览器！");
        if (error) error()
    }
}
function updatePxyInfo() {
    var current = geckoPxy.currentPxy;
    if (current != null) {
        Domains.setPxy(current);
        var pac = Domains.generatePAC(getModel());
        setProxy(pac)
    }
}
function alertMessage(msg) {
    alert(msg)
}
function confirmMessage(msg, cancelFun) {
    var r = confirm(msg);
    if (r) if (invationCode != null) openHomePage();
    else chrome.tabs.create({
        url: homePage + "/file/gecko.crx"
    });
    else if (cancelFun) cancelFun()
}
function openHomePage() {
    chrome.tabs.create({
        url: getHomePage()
    })
}
function getHomePage() {
    return homePage + "?code=" + invationCode + "&index=" + serverIndex
}
function proxyListSetting(list) {
    if (list) {
        geckoPxy.setAllPxy(list);
        Domains.setPxy(geckoPxy.currentPxy);
        var pac = Domains.generatePAC(getModel());
        setProxy(pac);
        disptchMessage({
            callback: "refreshRows",
            disptch: true
        })
    }
}
function forceUpdateProxy(data) {
    var list = data[0];
    if (list) {
        geckoPxy.setAllPxy(list);
        Domains.setPxyServer(data[1]);
        var pac = Domains.generatePAC(getModel());
        setProxy(pac);
        disptchMessage({
            callback: "refreshRows",
            disptch: true
        })
    }
    disptchMessage({
        callback: "closePopupWindow",
        disptch: true
    })
}
function forceOpenNotice(data) {
    var notices = [data];
    showNotices(notices)
}
function pingServer() {
    setIconOff();
    var length = 3 * server.length;
    count = count > length - 1 ? 0 : count;
    serverIndex = Math.floor(count / 3);
    var data = {
        lastUser: getLastLoginName(),
        version: version,
        action: "pingServer",
        cookie: getCookie()
    };
    httpsend(data, "GET",
    function(data) {
        var rd = data.data;
        versionStatus = rd.versionStatus;
        homePage = rd.homePage;
        invat_link = rd.invationLink;
        praise_link = rd.praiceLink;
        showNotices(rd.notices);
        if (data.status == 200) {
            if (rd.invationCode) invationCode = rd.invationCode;
            if (versionStatus == 0 || versionStatus == 1) {
                setLastLoginName(rd.userEmail);
                var key = rd.key;
                initWebSocket(key)
            } else {
                setIconUpdate();
                setProxy();
                Domains.clear();
                geckoPxy.clear();
                opPageOnInstall()
            }
        } else {
            setIconLogin();
            reset()
        }
    },
    function() {
        setTimeout(function() {
            pingServer()
        },
        1E3)
    });
    count++
}
function closeWebSocket() {
    if (websocket != null && websocket.readyState == 1) websocket.close()
}
function openLoginPage(flag, needCreat,isGoods) {
    var loginPage = "login.html";
    var mainPage = "main.html";
    var goodsPage = "goods.html";

    var hasPage = false;
    var target, source;
    if (flag == false) {
        target = chrome.extension.getURL(mainPage);
        source = chrome.extension.getURL(loginPage)
    } else {
        target = chrome.extension.getURL(loginPage);
        source = chrome.extension.getURL(mainPage)
    }
    if(isGoods){
        target = chrome.extension.getURL(goodsPage);
        source = chrome.extension.getURL(mainPage)
    }
    chrome.tabs.query({
        url: source
    },
    function(tabs) {
        if (tabs && tabs.length > 0) {
            var length = tabs.length;
            for (var i = 0; i < length; i++) chrome.tabs.update(tabs[i].id, {
                url: target,
                selected: true
            });
            hasPage = true
        } else chrome.tabs.query({
            url: target
        },
        function(tabs) {
            if (tabs && tabs.length > 0) {
                var length = tabs.length;
                var isSelected = false;
                for (var i = 0; i < length; i++) {
                    isSelected = tabs[i].selected;
                    if (isSelected) {
                        chrome.tabs.update(tabs[i].id, {
                            url: target,
                            selected: true
                        });
                        break
                    }
                }
                if (isSelected == false) chrome.tabs.update(tabs[0].id, {
                    url: target,
                    selected: true
                });
                hasPage = true
            }
            if (!hasPage && !needCreat) chrome.tabs.create({
                url: target,
                selected: true
            })
        })
    })
}
function pingServer2(callback, i) {
    callback()
}
function setIconStart() {
    chrome.browserAction.disable();
    chrome.browserAction.setTitle({
        title: "正在启动，请稍候..."
    });
    chrome.browserAction.setIcon({
        path: "/assets/images/gecko_off 24x24.jpg"
    })
}
function setIconOff() {
    chrome.browserAction.disable();
    chrome.browserAction.setTitle({
        title: "连接服务器失败！请检查网络,稍候再试，或重启浏览器！"
    });
    chrome.browserAction.setIcon({
        path: "/assets/images/gecko 24x24_2.jpg"
    })
}
function setIconUpdate() {
    chrome.browserAction.enable();
    chrome.browserAction.setTitle({
        title: "版本需要更新，请更新！"
    });
    chrome.browserAction.setIcon({
        path: "/assets/images/gecko 24x24_3.jpg"
    })
}
function setIconLogin() {
    chrome.browserAction.enable();
    chrome.browserAction.setTitle({
        title: "用户未登入，请登入账号！"
    });
    chrome.browserAction.setIcon({
        path: "/assets/images/gecko_off 24x24.jpg"
    })
}
function setIconNormal() {
    chrome.browserAction.enable();
    chrome.browserAction.setTitle({
        title: "壁虎漫步"
    });
    chrome.browserAction.setIcon({
        path: "/assets/images/gecko 24x24.png"
    })
}
function addStorageListener() {
    if (window.addEventListener) window.addEventListener("storage", handle_storage, false);
    else if (window.attachEvent) window.attachEvent("onstorage", handle_storage);
    function handle_storage(e) {
        if (!e) e = window.event;
        if (e.key == "domains") if (websocket != null && websocket.readyState == 1 && Domains.locked == false) fetchDomains();
        else Domains.removeList()
    }
}
function fetchDomains() {
    var data = {
        action: "fetchDomains",
        cookie: getCookie(),
        callback: "fetchDomainsCallback",
        disptch: "false"
    };
    var dataStr = mergeParams(data);
    sentMsgToServer(dataStr)
}
function fetchDomainsCallback(data) {
    if (data) Domains.saveList(data.urlList)
}
function getInfo() {
    for (var i = 0; i < gecko_code.length; i++) httpsend(null, "GET",
    function(data) {
        server = data;
        storage.setItem("_s", data.join(","));
        i = gecko_code.length;
        return
    },
    function() {},
    gecko_code[i], false);
    var _s = storage.getItem("_s");
    if (_s && _s != null) server = _s.split(",")
}
var gecko_time = (new Date).getTime();
function geckoLog() {
    console.log((new Date).getTime() - gecko_time)
};