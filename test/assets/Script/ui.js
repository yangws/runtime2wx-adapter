let res = require("resource");

let WINDOW_ZINDEX = {
    UI: 1,
};

let ui = cc.Class({
    _event_handler: null,

    ctor() {
        this._event_handler = new cc.EventTarget();
        window._crui = this;
    },

    init(ui_root) {
        this.ui_root = ui_root;
        this.ui_stack = [];
        this._prefab_map = {};
        this._opened_window_array = [];
    },

    on(event_name, cb, node) {
        this._event_handler.on(event_name, (event) => {
            let args = [];
            for (let i = 0; i < event.detail.length; i++) {
                args.push(event.detail[i]);
            }
            args.push(event);
            cb.apply(null, args);
        }, node);
    },

    once(event_name, cb, node) {
        this._event_handler.once(event_name, (event) => {
            let args = [];
            for (let i = 0; i < event.detail.length; i++) {
                args.push(event.detail[i]);
            }
            args.push(event);
            cb.apply(null, args);
        }, node);
    },

    emit(event_name, ...params) {
        this._event_handler.emit(event_name, params);
    },

    off(target_node) {
        this._event_handler.targetOff(target_node);
    },

    open(window_name, args) {
        cc.log("try to open-------->", window_name, args);

        let prefab_info = this._prefab_map[window_name];
        if (prefab_info && prefab_info.prefab) {
            this._do_open(prefab_info.prefab, window_name, args);;
            return;
        }

        //  从resources/prefab目录中下载
        let uri = res.prefab[window_name];
        if (!uri) {
            cc.log("can't find prefab under resources/prefab dir", window_name);
            return;
        }
        //  要开始下载了，把需要下载的窗口缓存成数组，保持先后顺序
        this._opened_window_array.push({
            window_name: window_name,
            ui_args: args,
        });
        cc.loader.onProgress = (progress, total, task) => {
            cc.log(new Date(), "onProgress", progress, total);
        };
        cc.loader.loadRes(uri, (error, prefab) => {
            if (prefab) {
                //  download success
                this._prefab_map[window_name] = {
                    name: window_name,
                    prefab: prefab,
                };
            } else {
                //  download failure, remove all this prefab request from _opened_window_array
                cc.log("download prefab failure:", uri);
                let new_array = [];
                for (let i = 0; i < this._opened_window_array.length; ++i) {
                    let w = this._opened_window_array[i];
                    if (w.window_name !== window_name) {
                        new_array.push(w);
                    }
                }
                this._opened_window_array = new_array;
            }
            //  按顺序打开已下载完成的窗口
            do {
                let first_window = this._opened_window_array[0];
                if (!first_window || !this._prefab_map[first_window.window_name]) {
                    break;
                }
                this._opened_window_array.shift();
                this._do_open(prefab, first_window.window_name, first_window.ui_args);
            } while (true);
        });
    },

    close(args) {
        if (this.ui_stack.length <= 0) {
            cc.log("Scene has no ui window now");
            return;
        }

        let last_window_info = this.ui_stack[this.ui_stack.length - 1];
        this.ui_stack.pop();

        let window_name = last_window_info.window_name;
        cc.log("close-------->", window_name, args);
        this.emit("close", window_name, args);

        let prefab_node = last_window_info.prefab_node;
        prefab_node.parent = null;
        prefab_node.destroy();
    },

    close_all() {
        while (this.ui_stack.length > 0) {
            this.close();
        }
    },

    _do_open(prefab, window_name, ui_args) {
        let prefab_node = cc.instantiate(prefab, window_name);
        if (!prefab_node) {
            cc.log("Couldn't get prefab_instance, error window name");
            return;
        }

        let controller = prefab_node.getComponent(window_name);
        if (!controller) {
            cc.log("Couldn't get prefab controller, error window name");
            return;
        }
        controller.args = ui_args;

        prefab_node.parent = this.ui_root.getChildByName("ui_node");
        prefab_node.zIndex = WINDOW_ZINDEX.UI;
        this.ui_stack.push({
            window_name: window_name,
            prefab_node: prefab_node,
        });
        this.emit("on_ui_open", window_name);
    },
});

module.exports = new ui();