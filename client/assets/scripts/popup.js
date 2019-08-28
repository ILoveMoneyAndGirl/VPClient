$(document).ready(function() {
    bindEvent();
    displayPopup()
});
function bindEvent() {
    switchRunModel();
    defaultModel();
    addCurrentURL();
    openPersonal();
    $("#row-select").click(function() {
        var list = extension.geckoPxy.pxyList;
        if (list) showProxyList(list);
        else loadProxyList()
    });
    $("#refresh").click(loadProxyList);
    $("#return").click(function() {
        showPxyInfo();
        $("#option-body").css("display", "block");
        $("#row-body").css("display", "none")
    });
    document.getElementById("auto-checkbox").onclick = changeSelectModel
}
function displayPopup() {
    if (extension.versionStatus == -1 || extension.versionStatus == 2) {
        extension.confirmMessage("当前版本不可用,请去主页下载最新版本！");
        return
    } else if (extension.versionStatus == 1) extension.confirmMessage("有新版本，是否去更新！");
    checkUserCookie(function(cookieVal) {
        extension.checkUserLogin({
            callback: "displayPopupCallback",
            cookie: cookieVal
        })
    })
}
function displayPopupCallback(data) {
     console.log("displayPopupCallback................................................enter")
    if (data == true) {
        $(".popup-container").css("display", "block");
        dispalyDomains();
        showPxyInfo()
    } else extension.reset()
}
function dispalyDomains() {
    chrome.tabs.getSelected(function(tab) {
        var jsonData = extension.getSessionStorage(tab.id + "");
        if (jsonData != null && jsonData) if (jsonData.list && jsonData.list.length > 0) {
            setOtherDomain(tab.id, jsonData.list);
            $("#add-url").show();
            return
        }
        setCurrentDomain(tab.id, tab.url)
    })
}
function setOtherDomain(tabId, list) {
    $("#domainText").text("疑似无法访问的域名");
    $("#domainText").attr("name", tabId);
    var domainUrl = $("#domainUrl");
    domainUrl.html("");
    for (var index in list) if (!extension.Domains.isInList(list[index])) $("<input type='checkbox'  checked='checked'/>" + "<label>" + list[index] + "</label><br/>").appendTo(domainUrl)
}
function setCurrentDomain(tabId, url) {
    if (url.indexOf("chrome-extension://") == 0 || url.indexOf("chrome://") == 0 || url == "newtab") tabId = "-1";
    url = getHost(url);
    url = getDomain(url);
    if (url && url != "NULL") {
        $("#domainText").text("当前域名");
        $("#domainText").attr("name", tabId);
        $("#domainUrl").html("<label name='selected'>" + url + "</label>");
        if (extension.Domains.hasURL(url)) $("#currentURL").show();
        else $("#add-url").show()
    }
}
function openPersonal() {
    $(".personal").click(function() {
        extension.openLoginPage(false);
        window.close()
    })
}
function defaultModel() {
    var model = extension.getModel();
    clearClass();
    $("#" + model).addClass("selected")
}
function addCurrentURL() {
    $("#add-url").click(function() {
        checkUserCookie(function(cookieVal) {
            var tabId = $("#domainText").attr("name");
            if (tabId && tabId != "-1") {
                var domains = [];
                var checkbox = $("#domainUrl input");
                if (checkbox.length == 0) $("#domainUrl label").each(function() {
                    if (!extension.Domains.isInList($(this).text())) domains.push($(this).text())
                });
                else checkbox.each(function() {
                    if (this.checked == true) {
                        var t = $(this).next().text();
                        if (!extension.Domains.isInList(t)) domains.push(t)
                    }
                });
                if (domains.length > 0) {
                    var urls = domains.join(",");
                    var dataStr = mergeParams({
                        action: "addURLs",
                        callback: "addCurrentURLCallback",
                        tabId: tabId,
                        urls: urls,
                        cookie: cookieVal
                    });
                    extension.connectToServer(dataStr);
                    return
                } else extension.alertMessage("未选择域名或域名已在列表中！")
            }
            window.close()
        })
    });
    $("#cur-del-img").mouseover(function() {
        $(this).attr("src", "assets/images/del2.png")
    });
    $("#cur-del-img").mouseout(function() {
        $(this).attr("src", "assets/images/del1.png")
    });
    $("#cur-del-img").click(function() {
        checkUserCookie(function(cookieVal) {
            var url = $("#domainUrl label").text();
            var serialId = extension.Domains.getSerialId(url);
            if (serialId != null) {
                var dataStr = mergeParams({
                    action: "deleteURL",
                    serialId: serialId,
                    callback: "deleteUrlCallback",
                    cookie: cookieVal
                });
                extension.connectToServer(dataStr)
            } else {
                extension.alertMessage("在列表中找不到此域名，请稍候再试！");
                closePopupWindow()
            }
        })
    })
}
function addCurrentURLCallback(data) {
    var tabId = data.tabId;
    var urlList = data.urlList;
    if (tabId && urlList) {
        extension.removeSessionStorage(tabId, urlList);
        extension.Domains.addDomains(urlList);
        var pac = extension.Domains.generatePAC(extension.getModel());
        extension.setProxy(pac)
    }
    extension.refreshTab(tabId);
    window.close()
}
function switchRunModel() {
    $(".run-model div").click(function() {
        checkUserCookie([$(this)],
        function(cookieVal, array) {
            extension.setModel(array[0].attr("id"));
            clearClass();
            array[0].addClass("selected")
        })
    })
}
function clearClass() {
    $(".run-model div").each(function() {
        $(this).removeClass("selected")
    })
}
function deleteUrlCallback(data) {
    extension.setProxy(pac);
    extension.Domains.del(data.serialId);
    var pac = extension.Domains.generatePAC(extension.getModel());
    extension.setProxy(pac);
    closePopupWindow()
}
function loadProxyList() {
    checkUserCookie(function(cookieVal) {
        var dataStr = mergeParams({
            action: "loadPxyList",
            callback: "loadProxyListCallback",
            cookie: cookieVal
        });
        extension.connectToServer(dataStr)
    })
}
function loadProxyListCallback(data) {
    var list = data.prxList;
    extension.proxyListSetting(list);
    fillProxyList(list);
    displayProxySelectInfo()
}
function showProxyList(list) {
    fillProxyList(list);
    displayProxySelectInfo()
}
function changeSelectModel() {
    var checked = this.checked;
    var model = checked == "checked" || checked == true ? "auto": "select";
    extension.geckoPxy.setModel(model);
    extension.updatePxyInfo();
    displayProxySelectInfo()
}
function selectPxyNode() {
    var id = $(this).val();
    extension.geckoPxy.choosePxy(id);
    extension.updatePxyInfo()
}
function displayProxySelectInfo() {
    var current = extension.geckoPxy.currentPxy;
    if (current != null) {
        var ul = $("#row-body ul");
        ul.find("input:radio").attr("checked", false);
        var li = ul.find("input[value='" + current.id + "']");
        li[0].checked = true;
        var model = extension.geckoPxy.getModel();
        if (model == "auto") {
            document.getElementById("auto-checkbox").checked = true;
            ul.addClass("disable");
            ul.find("input:radio").attr("disabled", true)
        } else {
            document.getElementById("auto-checkbox").checked = false;
            ul.removeClass("disable");
            ul.find("input:radio").attr("disabled", false)
        }
    }
}
function fillProxyList(list) {
    document.getElementById("auto-checkbox").checked = false;
    var ul = $("#row-body ul");
    ul.html("");
    var li = '<li><label>!</label><input name="row-radio" value="@" class="row-radio" type="radio"><span class="row-status #">$</span></li>';
    var length = list.length;
    for (var i = 0; i < length; i++) {
        var tmp = list[i];
        var row = getRowStatus(tmp.status);
        var liNode = li.replace("!", tmp.address).replace("@", tmp.id).replace("#", row[0]).replace("$", row[1]);
        $(liNode).appendTo(ul)
    }
    ul.find("input[name='row-radio']").click(selectPxyNode);
    $("#option-body").css("display", "none");
    $("#row-body").css("display", "block")
}
function getRowStatus(status) {
    switch (status) {
    case 0:
        return ["little", "空闲"];
    case 1:
        return ["much", "拥挤"];
    case 2:
        return ["more", "繁忙"];
    default:
        return ["unknow", "未知"]
    }
}
function showPxyInfo() {
    var current = extension.geckoPxy.currentPxy;
    if (current != null) {
        var nodeName = current.address;
        var model = extension.geckoPxy.getModel();
        nodeName = model == "auto" ? "自动选择(" + nodeName + ")": nodeName;
        $("#row-select label").text(nodeName)
    } else $("#row-select label").text("无节点")
}
function closePopupWindow() {
    window.close()
};