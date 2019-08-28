$(document).ready(function() {
    bindEvent();
    checkUserCookie(function(cookieVal) {
        extension.checkUserLogin({
            callback: "loadOrLogin",
            cookie: cookieVal
        })
    })
});
var pxyList;
var isQuery = false;
function bindEvent() {
    $("#addURL-btn").click(function() {
        var inputURL = $.trim($("#addURL-text").val());
        inputURL = getHost(inputURL);
        if (inputURL == "") {
            alert("请输入正确域名！");
            return
        }
        if (extension.Domains.hasURL(inputURL)) {
            alert("域名已存在列表中！");
            return
        }
        checkUserCookie([inputURL],
        function(cookieVal, array) {
            console.log(array);
            var dataStr = mergeParams({
                action: "addURL",
                url: array[0],
                callback: "addUrlCallback",
                cookie: cookieVal
            });
            extension.connectToServer(dataStr)
        })
    });
    $("#queryURL-btn").click(function() {
        var inputURL = $.trim($("#addURL-text").val());
        inputURL = getHost(inputURL);
        if (inputURL == "" || inputURL == ".") {
            alert("请输入正确域名！");
            return
        }
        queryDomains(inputURL);
        isQuery = true
    });
    $("#addURL-text").bind("input propertychange",
    function() {
        if (isQuery) {
            var inputURL = $.trim($(this).val());
            if (inputURL == "") {
                showAllDomains();
                isQuery = false
            }
        }
    });
    var urlList = $(".url-list");
    urlList.delegate(".url-str", "click",
    function() {
        var next = $(this).parent().next();
        next.css("display", "block");
        next.find("input").focus();
        $(this).parent().css("display", "none")
    });
    urlList.delegate(".cancel", "click",
    function() {
        var parent = $(this).parent();
        var read = parent.prev();
        parent.find("input").val(read.find(".url-str").text());
        parent.css("display", "none");
        read.css("display", "block")
    });
    urlList.delegate(".modify", "click",
    function() {
        var parent = $(this).parent();
        var serialId = $(this).parents(".url-item").attr("id");
        var newVal = $.trim(parent.find("input").val());
        newVal = getHost(newVal);
        if (newVal == "") {
            alert("请输入正确域名！");
            return
        }
        var oldVal = parent.prev().find(".url-str").text();
        if (oldVal == newVal) {
            parent.css("display", "none");
            parent.prev().css("display", "block")
        } else {
            if (extension.Domains.hasURL(newVal)) {
                alert("域名已存在列表中！");
                return
            }
            checkUserCookie([serialId, newVal],
            function(cookieVal, array) {
                var dataStr = mergeParams({
                    action: "updateURL",
                    serialId: array[0],
                    url: array[1],
                    callback: "updateUrlCallback",
                    cookie: cookieVal
                });
                extension.connectToServer(dataStr)
            })
        }
    });
    urlList.delegate(".url-del", "click",
    function() {
        var serialId = $(this).parents(".url-item").attr("id");
        checkUserCookie([serialId],
        function(cookieVal, array) {
            var dataStr = mergeParams({
                action: "deleteURL",
                serialId: array[0],
                callback: "deleteUrlCallback",
                cookie: cookieVal
            });
            extension.connectToServer(dataStr)
        })
    });
    urlList.delegate(".url-str", "mouseover",
    function() {
        $(this).find("span img").css("display", "block")
    });
    urlList.delegate(".url-str", "mouseout",
    function() {
        $(this).find("span img").css("display", "none")
    });
    urlList.delegate(".url-del", "mouseover",
    function() {
        $(this).attr("src", "assets/images/del2.png")
    });
    urlList.delegate(".url-del", "mouseout",
    function() {
        $(this).attr("src", "assets/images/del1.png")
    });
    $("#editPwdLink").fancybox({
        "hideOnContentClick": true
    });
    $("#editPwd-btn").click(resetPwd);
    $("#logout").click(function() {
        checkUserCookie(function(cookieVal) {
            var dataStr = mergeParams({
                action: "logout",
                cookie: cookieVal
            });
            extension.exception = false;
            extension.connectToServer(dataStr);
            extension.reset()
        })
    });
    $(".nav-head span").text(extension.version);
    $("#invationLink").click(function() {
        switchContainer("invation-link")
    });
    $("#domainList").click(function() {
        switchContainer("domain-list")
    });
    $("#mallLink").click(function() {

        extension.openLoginPage(false,true,true);
    });
    $("#commentLink").click(function() {
        var dataStr = mergeParams({
            action: "loadComments",
            callback: "loadCommentsCallback",
            cookie: extension.getCookie()
        });
        extension.connectToServer(dataStr)
    });

    $("#noticeLink").click(function() {
        var dataStr = mergeParams({
            action: "loadNotice",
            callback: "loadNoticeCallback",
            cookie: extension.getCookie()
        });
        extension.connectToServer(dataStr)
    });

    // $("#invat_link").text(extension.getHomePage());
    // $("#invat_link").attr("href", extension.getHomePage());
    // $("#invat_link_f").text(extension.inva_link);
    // $("#invat_link_f").attr("href", extension.inva_link);
    // $("#praiseBtn").click(function() {
    //     chrome.tabs.create({
    //         url: extension.praise_link
    //     })
    // });
    $("#comment-btn").click(function() {
        var text = $.trim($("#comment-text").val());
        if (text == "") {
            alert("请输入吐槽内容！");
            return
        }
        if (text.length > 255) {
            alert("吐槽内容过长，请精简下！");
            return
        }
        var dataStr = mergeParams({
            action: "addComment",
            askComment: text,
            callback: "addCommentCallback",
            cookie: extension.getCookie()
        });
        extension.connectToServer(dataStr)
    })
}
function resetPwd() {
    console.log("resetPwd................................................enter")
    var msg = "密码长度必须在6-15之间！";
    var oldP = $("#oldPwd");
    var newP1 = $("#newPwd1");
    var newP2 = $("#newPwd2");
    if (checkPassword($("#oldPwd"), $("#password_e_o"), msg) && checkPassword($("#newPwd1"), $("#password_e_n1"), msg) && checkPassword($("#newPwd2"), $("#password_e_n2"), msg)) if ($("#newPwd1").val() != $("#newPwd2").val()) {
        removeMessage($("#password_e_n2"));
        addMessage("密码不一致！", $("#password_e_n2"), "error");
        return
    } else checkUserCookie(function(cookieVal) {
        var data = {
            action: "resetPassword",
            oldPwd: $.md5($("#oldPwd").val()),
            newPwd1: $.md5($("#newPwd1").val()),
            newPwd2: $.md5($("#newPwd2").val()),
            lastUser: extension.getLastLoginName(),
            cookie: cookieVal
        };
        extension.httpsend(data, "POST",
        function(data) {
            if (data && data.msg) {
                if (data.data) extension.writeCookie(data.data);
                removeMessage($("#password_e_o"));
                addMessage(data.msg, $("#password_e_o"), data.status == 200 ? "info": "error")
            } else alert("服务器发生异常，请稍候再试！")
        })
    })
}
function checkPassword(pwd, p, msg) {
    removeMessage(p);
    var pswd = pwd.val();
    if (pswd == "" || pswd.length < 6 || pswd.length > 15) {
        addMessage(msg, p, "error");
        return false
    } else return true
}
function loadOrLogin(data,all) {
    console.log("loadOrLogin fffffffffffffff.................");
     console.log(all)
          console.log(data)

    if (data == true) {
        var list = extension.Domains.getList();
        $("#userId").text(extension.getLastLoginName());

        $("#surplusday").text(all.day);
        $("#mallLink").attr("href", all.links.mallurl);
        $("#homeLink").attr("href", all.links.homePage);
        
        $("#invat_link").text(all.links.invationLink);
        $("#invat_link").attr("href", all.links.invationLink);
        $("#invat_link_f").text(all.links.goolgeStroeLink);
        $("#invat_link_f").attr("href", all.links.goolgeStroeLink);
        $("#praiseBtn").click(function() {
             chrome.tabs.create({
                url: all.links.praiceLink
             })
         });

        if (list != null) {
            $(".url-list").html("");
            for (var index in list) addUrlItem(index, list[index])
        } else extension.fetchPacData("fillData")
    } else extension.reset()
}
function fillData(data) {
    var list = data.urlList;
    $(".url-list").html("");
    for (var index in list) addUrlItem(index, list[index]);
    extension.Domains.saveList(list);
    extension.proxyListSetting(data.prxList)
}
function addUrlItem(index, url) {
    var urlItem = html.replace("###", index);
    urlItem = urlItem.replace(new RegExp("@@@", "gm"), url);
    $(urlItem).appendTo($(".url-list"))
}
var html = '<div id="###" class="url-item"><div class="url-container"><div class="read-mode"><img class="url-del" src="assets/images/del1.png" alt="删除域名" title="删除域名"></img>' + '<div class="url-str">@@@<span><img src="assets/images/edit.png" alt="编辑" title="编辑"></img></span></div></div>' + '<div class="edit-mode"><div class="cancel"><img src="assets/images/block.png"/></div>' + '<div class="modify"><img src="assets/images/check.png"/></div><input class="url-text" type="text" value="@@@"></div></div></div>';
function addUrlCallback(data) {
    if (isQuery == true) {
        showAllDomains();
        isQuery = false
    }
    addUrlItem(data.serialId, data.url);
    extension.Domains.add(data.serialId, data.url);
    var pac = extension.Domains.generatePAC(extension.getModel());
    extension.setProxy(pac)
}
function updateUrlCallback(data) {
    var item = $("#" + data.serialId);
    var edit = item.find(".edit-mode");
    var read = item.find(".read-mode");
    read.find(".url-str").text(data.url);
    edit.find("input").val(data.url);
    edit.css("display", "none");
    read.css("display", "block");
    extension.Domains.update(data.serialId, data.url);
    var pac = extension.Domains.generatePAC(extension.getModel());
    extension.setProxy(pac)
}
function deleteUrlCallback(data) {
    var item = $("#" + data.serialId);
    item.remove();
    extension.Domains.del(data.serialId);
    var pac = extension.Domains.generatePAC(extension.getModel());
    extension.setProxy(pac)
}
function addCurrentURLCallback(data) {
    var list = data.urlList;
    for (var index in list) addUrlItem(index, list[index])
}
function queryDomains(val) {
    var list = extension.Domains.getList();
    if (list != null) {
        $(".url-list").html("");
        for (var index in list) if (list[index].indexOf(val) != -1) addUrlItem(index, list[index])
    }
}
function showAllDomains() {
    var list = extension.Domains.getList();
    if (list != null) {
        $(".url-list").html("");
        for (var index in list) addUrlItem(index, list[index])
    }
}
function switchContainer(cid) {
    $(".main-container").hide();
    $("#" + cid).show()
}
function loadCommentsCallback(data) {
    if (data.comments && data.comments.length > 0) {
        $(".comment-list").empty();
        for (var index in data.comments) addComment(data.comments[index])
    }
    switchContainer("comment-link")
}

function loadNoticeCallback(data) {
    if (data.comments && data.comments.length > 0) {
        $(".comment-list").empty();
        for (var index in data.comments) addNotice(data.comments[index])
    }
    switchContainer("notice-link")
}



function addNotice(comment, isInsert) {
    if (comment) {
        var html = '<div><dl class="ask"><dt></dt><dd>@@</dd><span>##</span></dl>' + '<dl class="answer"><dt></dt><dd></dd><span></span></dl><hr/><div\>';
        html = html.replace("@@", comment.notice).replace("##", comment.date);
        // if (comment.answerComment && comment.answerDate) html = html.replace("$$", comment.answerComment).replace("&&", comment.answerDate);
        // else html = html.replace("$$", "(\u6682\u65e0\u56de\u590d)").replace("&&", "");
        if (isInsert) $(html).prependTo($(".comment-list"));
        else $(html).appendTo($(".comment-list"))
    }
}
function addComment(comment, isInsert) {
    if (comment) {
        var html = '<div><dl class="ask"><dt>吐槽内容:</dt><dd>@@</dd><span>##</span></dl>' + '<dl class="answer"><dt>回复内容：</dt><dd>$$>/dd><span>&&</span></dl><hr/><div>';
        html = html.replace("@@", comment.askComment).replace("##", comment.askDate);
        if (comment.answerComment && comment.answerDate) html = html.replace("$$", comment.answerComment).replace("&&", comment.answerDate);
        else html = html.replace("$$", "(暂无回复)").replace("&&", "");
        if (isInsert) $(html).prependTo($(".comment-list"));
        else $(html).appendTo($(".comment-list"))
    }
}
function addCommentCallback(data) {
    addComment(data.comment, true)
};