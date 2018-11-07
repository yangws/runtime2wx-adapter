
module.exports = {
    setLabel(label, text, color) {
        if (!cc.isValid(label)) {
            return;
        }
        label.getComponent(cc.Label).string = text;
        if (color) {
            label.color = color;
        }
    },

    setSpriteFrame(sprite, spriteFrame) {
        if (!cc.isValid(sprite)) {
            return;
        }
        sprite.getComponent(cc.Sprite).spriteFrame = spriteFrame;
    },

    getChild(node, path, comp) {
        if (!cc.isValid(node)) {
            return null;
        }
        let name_array = path.split(/\s*\//);
        let ret_node = node;
        while (name_array.length) {
            ret_node = ret_node.getChildByName(name_array.shift());
        }
        if (comp) {
            return ret_node.getComponent(comp);
        } else {
            return ret_node;
        }
    },

    setChildLabel(node, path, text, color) {
        this.setLabel(this.getChild(node, path), text, color);
    },

    /**
     * 全屏吞噬触摸
     * @param node
     * @param cb
     */
    sWallow_Touch_full_screen(node, cb) {
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            event.stopPropagation();
            cb && cb();
        });
    },

    /**
    * 指定区域吞噬触摸
    * @param node
    * @param bg_node
    * @param cb
    */
    swallow_Touch_with_region(node, bg_node, cb) {
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            let boundingBox = bg_node.getBoundingBoxToWorld();
            if (!boundingBox.contains(event.touch.getLocation())) {
                cb && cb();
            }
            event.stopPropagation();
        });
    }
};