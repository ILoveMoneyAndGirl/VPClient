var geckoPxy = {
    model: null,
    currentPxy: null,
    pxyList: null,
    choosePxy: function(id) {
        var pxy = this.getPxyById(id);
        this.setCurrentPxy(pxy);
        return pxy
    },
    setCurrentPxy: function(pxy) {
        this.currentPxy = pxy;
       
        if(pxy){
            window.localStorage.setItem("selectId", pxy.id)
         }
    },
    getModel: function() {
        if (this.model == null) this.model = window.localStorage.getItem("selectModel");
        if (this.model == null || !this.model) {
            this.model = "auto";
            window.localStorage.setItem("selectModel", this.model)
        }
        return this.model
    },
    setModel: function(m) {
        if (m == "auto") {
            this.model = m;
            window.localStorage.setItem("selectModel", m);
            var pxy = this.getAutoProxy();
            this.setCurrentPxy(pxy)
        } else if (m == "select") {
            this.model = m;
            window.localStorage.setItem("selectModel", m);
            var pxy = this.getSelectProxy();
            this.setCurrentPxy(pxy)
        }
    },
    setAllPxy: function(list) {
        if (list) {
            this.pxyList = list;
            this.setModel(this.getModel())
        }
    },
    isInList: function(list) {
        if (list && this.currentPxy != null) {
            var length = list.length;
            for (var i = 0; i < length; i++) if (this.currentPxy.id == list[i].id && this.currentPxy.info == list[i].info) return true
        }
        return false
    },
    getAutoProxy: function() {
        if (this.pxyList != null) {
            var node = null;
            var length = this.pxyList.length;
            for (var i = 0; i < length; i++) {
                var tmp = this.pxyList[i];
                if (node == null) node = tmp;
                else if (node.status == -1 || node.status > tmp.status) node = tmp
            }
            return node
        }
        return null
    },
    getSelectProxy: function() {
        if (this.pxyList != null) {
            var id = window.localStorage.getItem("selectId");
            if (id != null && id) {
                var length = this.pxyList.length;
                for (var i = 0; i < length; i++) {
                    var tmp = this.pxyList[i];
                    if (id == tmp.id) return tmp
                }
                if (length > 0) return this.pxyList[0];
                else return null
            }
        }
        return null
    },
    getPxyById: function(id) {
        if (this.pxyList) {
            var length = this.pxyList.length;
            for (var i = 0; i < length; i++) {
                var tmp = this.pxyList[i];
                if (id == tmp.id) return tmp
            }
        }
        return null
    },
    clear: function() {
        this.model = null;
        this.currentPxy = null;
        this.pxyList = null;
        window.localStorage.removeItem("selectModel");
        window.localStorage.removeItem("selectId")
    }
};