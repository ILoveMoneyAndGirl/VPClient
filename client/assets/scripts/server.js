var homePage = "https://gecko.la";
var envo = 2;
 var gecko_code = ["http://127.0.0.1:8888?lastUser=&version=1.0.0&action=getInfo&cookie=null&name=bf&1450884435584"
,"http://120.55.112.31:8888?lastUser=&version=1.43&action=getInfo&cookie=null&name=bf&1450884435584"];

var server = null;
switch (envo) {
case 0:
    server = ["localhost:8080/geckoServer1.4", "localhost:8080/geckoServer1.4"];
    break;
case 1:
    server = ["pro.rt0090.info", "pro.rt0090.info"];
    homePage = "https://pro.rt0090.info";
    break;
case 2:
    server = ["darkbox1.info", "darkbox21.info"];
    homePage = "https://gecko.la";
    break;
default:
    server = ["121.40.136.198:8080", "localhost:8080"];
    break
}
function getWSServer() {
    if (envo == 0) return "ws://" + server[serverIndex] + "/proxyEndpoint";
     else return "ws://" + server[serverIndex+1];// + ":8001"
     
}
function getHTTPServer() {
    if (envo == 0) return "http://" + server[serverIndex] + "/proxyServlet";
    else return "http://"+ server[serverIndex];// + ":8888"
}
function formatData(str,callback){
    var data = {
        isempty:false,
        arryContent: "",
    };
    if(str!=null&&str!=""){
        data.isempty=true;
          var f=str.replace(/(^\s*)|(\s*$)/g, "");
          var r=f.replace(/'/g,'"');
          var s='{"data":'+r+'}'
         var obj= $.parseJSON(s);
        data.arryContent=obj.data;
    }
      callback(data);
}
function httpsend(data, type, callback_success, callback_error, ser, syc) {
    try {
        syc = typeof syc == "undefined" ? true: false;
        var params = parseParam(data);
        var xhr = new XMLHttpRequest;
        var d = (new Date).getTime();
        var _server = ser ? ser: getHTTPServer();
        _server = _server + "?" + (params == null ? "": params + "&") + d;

        xhr.open(type, _server, syc);

        console.log("HTTP SEND:",_server);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) if (xhr.status == 200) {
                var text = xhr.responseText;

                var data;
                if (text.indexOf("{") == 0) {
                    data = $.parseJSON(text);
                    console.log("HTTP RECVIE_1:",data);
                    callback_success(data);
                }
                else {
                    formatData(text,function(data){
                        if(data.isempty){
                               console.log("HTTP RECVIE_2:",data.arryContent);
                            callback_success(data.arryContent);
                        }
                        
                    })
                };
                
            }
        };
        xhr.onerror = function(error) {
            if (callback_error) callback_error()
        };
        xhr.send()
    } catch(e) {
        if (callback_error) callback_error()
    }
}
var parseParam = function(param) {
    if (param == null) return null;
    var paramStr = "";
    $.each(param,
    function(i) {
        var k = i + "=" + encodeURIComponent(param[i] == null ? "null": param[i]);
        paramStr += "&" + k
    });
    return paramStr.substr(1)
};