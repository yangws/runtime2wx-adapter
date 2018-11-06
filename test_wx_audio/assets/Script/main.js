if (window.loadRuntime === undefined) {
    window.loadRuntime = () => {
        return new Proxy({}, {
            get(target, key, receiver) {
                if (key in target) {
                    return target[key];
                }
                let print = function () {
                    let msg = [key, "(", ""];
                    for (let i = 0; i < arguments.length; i++) {
                        msg.push(JSON.stringify(arguments[i]), ", ");
                    }
                    msg[msg.length - 1] = ")";
                    console.log("call runtime API: " + msg.join("") + ", please run on runtime for effect");
                }
                target[key] = print;
                return print;
            }
        });
    }
}

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}