let rt = loadRuntime();
let ui = require("ui");
let uiUtil = require("ui_util");
let res = require("resource");

let TestCaseArray = [
    "ui_media",
];


module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        node_root: cc.Node,
        sv_tests: cc.ScrollView,
        node_item_template: cc.Node,
    },

    onLoad() {
        ui.init(this.node_root);
        this.node_item_template.active = false;

        let content = this.sv_tests.content;
        TestCaseArray.forEach((test) => {
            let testNode = cc.instantiate(this.node_item_template);
            testNode.active = true;
            testNode.parent = content;
            let btn = testNode.getChildByName("btn_test");
            uiUtil.setChildLabel(btn, "label", res.string[test]);
            btn._testName = test;
        });
    },

    onClickButtonExit() {
        rt.exitApplication({
            success() {
                console.log("on exitApplication: success");
            },
            fail() {
                console.log("on exitApplication: fail");
            },
            complete() {
                console.log("on exitApplication: complete");
            }
        });
    },

    onClickButtonTest(event) {
        let test = event.currentTarget._testName;
        if (test) {
            ui.open(test, {
                title: res.string[test],
            });
        }
    },
});
