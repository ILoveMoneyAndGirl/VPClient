var Domains = {
    obj: null,
    pxy: null,
    locked: false,
    setPxy: function(p) {
        this.pxy = p;
        if (p) checkUserCookie(function(cookie) {
            var dataStr = mergeParams({
                action: "updateUserPxy",
                model: geckoPxy.getModel(),
                pxyId: p.id,
                cookie: cookie
            });
            connectToServer(dataStr)
        });
        else checkUserCookie(function(cookie) {
            var dataStr = mergeParams({
                action: "updateUserPxy",
                model: geckoPxy.getModel(),
                cookie: cookie
            });
            connectToServer(dataStr)
        })
    
    },
    setPxyServer: function(p) {
        this.pxy = p

    },
    generatePAC: function(model) {

        var DIRECT_URL = "['https://api.gecko.la','https://api2.gecko.la','chrome-extension://','chrome://']";
        var DIRECT_HOST = "['10.[0-9]+.[0-9]+.[0-9]+', '172.[0-9]+.[0-9]+.[0-9]+', '192.168.[0-9]+.[0-9]+']";
        var DIRECT_DNS = "['0.0.0.0', '127.0.0.1', 'localhost', 'api.gecko.la', 'api2.gecko.la']";
        if (this.pxy != null && this.getObj() != null) if (model == ModelType.closed) return "function FindProxyForURL(url, host){return 'DIRECT';}";
        else if (model == ModelType.always) {
            var sb = getHeader().replace("@", this.pxy.info);
            sb += " return p;}";
            return sb
        } else if (model == ModelType.needed) {
            var header = getHeader().replace("@", this.pxy.info);
            var body = getBody().replace("#", JSON.stringify(this.obj));
            return header + body
        } else return "function FindProxyForURL(url, host){return 'DIRECT';}";
        else return "function FindProxyForURL(url, host){return 'DIRECT';}";
        function getHeader() {
            var sb = "function FindProxyForURL(url,host){var D='DIRECT';var p='@';host=host.toLowerCase();";
            sb += " var du = " + DIRECT_URL + ";" + "for(var a in du){if(url.indexOf(du[a]) == 0){return D;}}";
            sb += " var dh = " + DIRECT_HOST + ";" + "for(var b in dh){if(shExpMatch(host,dh[b])){return D;}}";
            sb += " var dn = " + DIRECT_DNS + ";" + "for(var c in dn){if(dnsDomainIs(host,dn[c])){return D;}}";
            return sb
        }
        function getBody() {
            var sb = "var node=#;var hostParts = host.split('.');for(var d=hostParts.length-1;d>=0;d--){var part=hostParts[d];node=node[part];if(node == undefined||node==1){break;}} if(node==1){return p;}return D;}";
            return sb
        }
        
    },
    saveList: function(list) {
        if (list) {
            this.locked = true;
            window.localStorage.setItem("domains", JSON.stringify(list));
            this.convertList();
            this.locked = false
        }
    },
    getList: function() {
        var list = window.localStorage.getItem("domains");
        if (list) return $.parseJSON(list);
        else return null
    },
    convertList: function(list) {
        list = list ? list: this.getList();
        if (list) {
            this.obj = {};
            for (var i in list) {
                var array = list[i].split(".");
                var val = array.pop();
                this.obj[val] = function() {
                    var arg0 = arguments[0];
                    var arg1 = arguments[1];
                    if (arg1.length > 0) {
                        if (arg0 == 1) return 1;
                        if (typeof arg0 == "undefined") arg0 = {};
                        var av = arg1.pop();
                        arg0[av] = arguments.callee(arg0[av], arg1);
                        return arg0
                    } else return 1
                } (this.obj[val], array)
            }
        }
    },
    getObj: function() {
        if (this.obj == null) this.convertList();
        return this.obj
    },
    removeList: function() {
        this.locked = true;
        window.localStorage.removeItem("domains");
        this.locked = false
    },
    clear: function() {
        this.obj = null;
        this.pxy = null;
        this.removeList()
    },
    isInList: function(domain) {
        if (this.obj == null) this.convertList();
        if (this.obj) {
            var node = this.obj;
            var parts = domain.toLowerCase().split(".");
            for (var i = parts.length - 1; i >= 0; i--) {
                var part = parts[i];
                node = node[part];
                if (node == undefined || node == 1) break
            }
            if (node == 1) return true
        }
        return false
    },
    add: function(id, domain) {
        list = this.getList();
        if (list != null) {
            list[id] = domain;
            this.convertList(list);
            this.saveList(list)
        }
    },
    del: function(id) {
        list = this.getList();
        if (list != null) {
            delete list[id];
            this.convertList(list);
            this.saveList(list)
        }
    },
    update: function(id, domain) {
        this.add(id, domain)
    },
    addDomains: function(dds) {
        if (dds) {
            list = this.getList();
            if (list != null) {
                for (var i in dds) list[i] = dds[i];
                this.convertList(list);
                this.saveList(list)
            }
        }
    },
    hasURL: function(url) {
        if (url) {
            url = url.toLowerCase();
            list = this.getList();
            if (list != null) for (var i in list) if (url == list[i]) return true
        }
        return false
    },
    getSerialId: function(url) {
        if (url) {
            url = url.toLowerCase();
            list = this.getList();
            if (list != null) for (var i in list) if (url == list[i]) return i
        }
        return null
    }
};