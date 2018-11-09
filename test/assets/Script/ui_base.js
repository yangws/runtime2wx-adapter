let ui = require("ui");
let uiUtil = require("ui_util");

module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        lb_title: cc.Label,
    },

    onLoad() {
        if (this.lb_title) {
            this.lb_title.string = this.args.title;
        }

        uiUtil.sWallow_Touch_full_screen(this.node);
    },

    onClickButtonCancel() {
        ui.close();
    },
});
