
$(document).ready(function() {
    bindEvent();
    checkUserCookie(function(cookieVal) {
        extension.LoadGoods({
            callback: "LoadGoods",
            cookie: cookieVal
        })
    })
});


function LoadGoods(data) {
	   //  id: {
    //     type: String,
    //     'default': shortid.generate
    // },
    // price: String,
    // days: Number,
    // des: String


    goods=[{id:"id1",price:5,days:1,des:"试用会员"},
    		{id:"id2",price:25,days:30,des:"月会员"},
    		{id:"id3",price:70,days:90,des:"季度会员"},
    		{id:"id4",price:120,days:180,des:"半年会员"},
    		{id:"id5",price:200,days:365,des:"年度会员"}]

    if (goods && goods.length > 0) {

        $("#goods-content").empty();

        for (var index in goods){
        	var item='<div class="col-xs-4"><div class="card"><h3>@des</h3><span class="price"><small>￥</small>@price</span><small class="duration">@day天</small>'
			var pay='<p class="pay btn btn-block btn-success "><a id=@id_s><font color="#FFFFFF">支付宝支付</font></a> | <a id=@id_1><font color="#FFFFFF">微信支付</font></a</p>'
			var last='<hr><ul><li><i class="glyphicon glyphicon-ok text-success"></i><span tooltip="可将任何网站加入科学上网列表" class="ng-scope">不限制使用的域名</span></li><li><i class="glyphicon glyphicon-ok text-success"></i><span tooltip="开启后，上任何网站都使用翻越" class="ng-scope">开放“一直”模式</span></li><li>&nbsp;</li><li>&nbsp;</li></ul></div></div>'
			item=item.replace("@des",goods[index].des).replace("@price",goods[index].price).replace("@day",goods[index].days)
			pay=pay.replace("@id",goods[index].id).replace("@id",goods[index].id)
			item=item+pay+last

			$(item).appendTo($("#goods-content"))
        }


        for (var index in goods){
        	$("#"+goods[index].id+"_s").click(function() {
			 	   QRCode(0,goods[index].id) 
             })

             $("#"+goods[index].id+"_1").click(function() {
			 	     QRCode(1,goods[index].id) 
             })

		}
     }
 }




function QRCode(a,id) {
	extension.LoadQRcode("ShowQRcode",a,id)

}

function ShowQRcode(data)
{
   console.log(data)
    $("#qrcode").attr("src",data.qrcode)
    $("#pop").removeClass("displayxx")
//             chrome.tabs.create({
//                 url: data.qrcode,
//                 selected: true
//             })
// }
}


function bindEvent() {

    //  $('#delete').on('click', function() {//点击删除按钮显示弹窗
    //     $("#pop").removeClass("display")
    // })

    $(".account").text(extension.getLastLoginName())
    
    $(".cancelxx").on('click', function() {//点击取消隐藏弹窗
        $("#pop").addClass("displayxx")
    })
    
    $(".surexx").on('click', function() {//点击确认进行删除操作并隐藏弹窗
        $("#pop").addClass("displayxx")
        alert("重启浏览器或刷新节点即可更新时间！")
    })
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