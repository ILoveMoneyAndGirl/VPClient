var MSGStr = {
    errorEmail: "请输入正确的邮箱！",
    errorinvitationEmail:"该账号不存在!",
    existEmail: "该邮箱已被注册，或信息有误！",
    normalEmail: "该邮箱可用",
    invalidPassword: "密码长度必须在6-15之间！",
    notSamePassword: "与上面密码不一致！",
    notExistEmail: "用户邮箱不存在！",
    nullEmail: "请输入用户邮箱！",
    errorPassword: "密码不正确！",
    nullPassword: "请输入密码！"
};
$(document).ready(function() {
    bindEvent();
    checkUserCookie(function(cookieVal) {
        extension.checkUserLogin({
            callback: "initLoginPageCallback",
            cookie: cookieVal
        })
    },
    function() {})
});
function initLoginPageCallback(jsonData) {
    if (jsonData.data == true) extension.openLoginPage(false);
    else extension.clearCookie()
}
function bindEvent() {
    $(".tab").click(function() {
        if (!$(this).hasClass("selected")) {
            $(".tab.selected").removeClass("selected");
            $(this).addClass("selected");
            $(".login-form").toggleClass("hidden")
        }
    });
    $("#email_r").blur(checkEmail);
    $("#invitationemail_r").blur(checkInvitationEmail);
    $("#password_r").blur(checkPassword);
    $("#repassword_r").blur(checkRePassword);
    $("#btn_r").click(validateRegInfo);
    $("#email_l").blur(checkLoginEmail);
    $("#password_l").blur(checkLoginPwd);
    $("#btn_l").click(validateLoginInfo);
    $("#password_l").keydown(function(e) {
        var currentKey = e.which;
        if (currentKey == 13) {
            validateLoginInfo();
            return false
        }
    });
    $("#findPwdLink").fancybox({
        "hideOnContentClick": true
    });
    $("#findPwd-btn").click(function() {
        var email = $.trim($("#email_f").val());
        var account_f = $("#account_f");
        removeMessage(account_f);
        if (email == "" || !checkEmailFormat(email)) {
            addMessage(MSGStr.errorEmail, account_f, "error");
            return
        } else {
            var data = {
                action: "findPassword",
                userEmail: email
            };
            extension.httpsend(data, "GET",
            function(result) {
                var msg = result.msg;
                if (result && msg) {
                    var account_f2 = $("#account_f");
                    removeMessage(account_f2);
                    addMessage(msg, account_f2, result.status == 200 ? "info": "error")
                } else alert("服务器发生异常，请稍候再试！")
            })
        }
    })
}
function validateRegInfo() {
    var result = checkPassword() && checkRePassword();//&&checkInvitationEmail();checkEmail() && 
    if(result){
        checkEmail(function(res){
            if(res){
                checkInvitationEmail(function(res){
                    if(res){
                        extension.pingServer2(function() {
                            var email = $.trim($("#email_r").val());
                            var invitationEmail = $.trim($("#invitationemail_r").val());
                            // var password = $.md5($("#password_r").val());
                            // var rePassword = $.md5($("#repassword_r").val());
                               var password =$("#password_r").val();
                            var rePassword = $("#repassword_r").val();
                            var data = {
                                action: "register",
                                userEmail: email,
                                password: password,
                                rePassword: rePassword,
                                invitationEmail:invitationEmail
                            };
                            extension.httpsend(data, "POST",
                            function(msg) {
                                if (msg.status == 500 || msg.data == false) {
                                    alert(msg.msg);
                                    return
                                } else if (msg.data == true) alert("注册成功,请登录！")
                            },
                            function(error) {
                                alert("服务器发生错误，请稍候再试！")
                            })
                         })
                    }
                });
            }
        })
    } 
}

function checkEmail(callback) {
    var email = $.trim($("#email_r").val());
    var account_r = $("#account_r");

    removeMessage(account_r);
    if (checkEmailFormat(email)) {

     if (typeof callback === "function") checkEmailIsExist(email,false,callback);
     else {
            checkEmailIsExist(email,false,function(){});
            return true;
        }
    } else {
        addMessage(MSGStr.errorEmail, account_r, "error");

      if (typeof callback === "function")  callback(false); else return false;
      
    }
}

function checkInvitationEmail(callback) {
    var email = $.trim($("#invitationemail_r").val());
    if(email==null||email==''){
         console.log("email==null||email==..............");
        if (typeof callback === "function")  return callback(true);else return true;
    }
    var account_r = $("#invitationaccount_r");
    removeMessage(account_r);
    if (checkEmailFormat(email,true)) {
        if (typeof callback === "function")  checkEmailIsExist(email, true,callback);
        else{
            checkEmailIsExist(email, true,function(){});
            return true;
        }
    } else {
        addMessage(MSGStr.errorEmail, account_r, "error");
        if (typeof callback === "function")  callback(false); else return false;
    }
}

function checkEmailFormat(email,isNull) {
    if(isNull&&(email==null||email=='')){
        return true;
    }
    var reg = /\w+[@]{1}\w+[.]\w+/;
    return reg.test(email)
}
function checkEmailIsExist(email,isInvitation,callback) {
    var data = {
        action: "checkRegister",
        userEmail: email
    };
    extension.httpsend(data, "GET",
    function(msg) {
        if(isInvitation==true){
             var account_r = $("#invitationaccount_r");
            if (msg.data == false){ 
                addMessage(MSGStr.errorinvitationEmail, account_r, "error"); 
                callback(false);
            }else{
                callback(true);
            }
            // else  addMessage(MSGStr.normalEmail, account_r, "error");
        }else{
             var account_r = $("#account_r");
            if (msg.data == false) {
                addMessage(MSGStr.normalEmail, account_r, "info");
                callback(true);
            }
             else{
                addMessage(MSGStr.existEmail, account_r, "error")  
                callback(false);
             } 
        }

    })
}
function checkPassword() {
    var userpwd_r = $("#userpwd_r");
    removeMessage(userpwd_r);
    var pswd = $("#password_r").val();
    if (pswd == "" || pswd.length < 6 || pswd.length > 15) {
        addMessage(MSGStr.invalidPassword, userpwd_r, "error");
        return false
    } else return true
}
function checkRePassword() {
    var userrepwd_r = $("#userrepwd_r");
    removeMessage(userrepwd_r);
    var pwd = $("#password_r").val();
    var repwd = $("#repassword_r").val();
    if (pwd != repwd) {
        addMessage(MSGStr.notSamePassword, userrepwd_r, "error");
        return false
    } else return true
}
function validateLoginInfo() {
    var result = checkLoginEmail() && checkLoginPwd();
    if (result) extension.pingServer2(function() {
        email = $.trim($("#email_l").val());
        var pwd = $("#password_l").val();
        // var password = $.md5(pwd);
        var password = pwd;

        var data = {
            action: "login",
            userEmail: email,
            password: password,
            version: extension.version
        };
        extension.httpsend(data, "POST",
        function(msg) {
            var data = msg.data;
            if (msg.status == 200) {
                extension.invationCode = data.invationCode;
                extension.setLastLoginName(data.userEmail);
                extension.versionStatus = data.versionStatus;
                extension.showNotices(data.notices);
                extension.writeCookie(data.cookie);
                extension.initWebSocket(data.key,
                function() {
                    if (data.versionStatus == 0 || data.versionStatus == 1) extension.openLoginPage(false, true)
                })
            } else if (data == false) {
                addMessage(msg.msg, $("#account_l"), "error");
                return
            } else if (data == "NEED_UPDATE") extension.confirmMessage(msg.msg)
        },
        function(error) {
            alert("服务器发生错误，请稍候再试！")
        })
    })
}
function checkLoginEmail() {
    var account_l = $("#account_l");
    removeMessage(account_l);
    if ($.trim($("#email_l").val()) == "") {
        addMessage(MSGStr.nullEmail, account_l, "error");
        return false
    } else return true
}
function checkLoginPwd() {
    var userpwd_l = $("#userpwd_l");
    removeMessage(userpwd_l);
    if ($("#password_l").val() == "") {
        addMessage(MSGStr.nullPassword, userpwd_l, "error");
        return false
    } else return true
};