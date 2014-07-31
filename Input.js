var Input = {};

//------------------------------------------------------------------------------
// Key Handling
//------------------------------------------------------------------------------
Input.Key = {

    __pressed: {},
    __justPressed: {},
    __lastPressed: {},

    // Key code to names mapping.
    KEYCODES: {
        // Function keys.
        112:'f1', 113:'f2', 114:'f3', 115:'f4', 116:'f5', 117:'f6',
        118:'f7', 119:'f8', 120:'f9', 121:'f10', 122:'f11', 123:'f12',
        // Numbers.
        48:'0', 49:'1', 50:'2', 51:'3', 52:'4', 53:'5', 54:'6', 55:'7',
        56:'8', 57:'9',
        // Numpad.
        96: 'numpad 0', 97:'numpad 1', 98:'numpad 2', 99:'numpad 3',
        100:'numpad 4', 101:'numpad 5', 102:'numpad 6', 103:'numpad 7',
        104:'numpad 8', 105:'numpad 9', 106:'numpad *', 107:'numpad +',
        109:'numpad -', 110:'numpad .', 111:'numpad /',
        // Letters.
        65:'a', 66:'b', 67:'c', 68:'d', 69:'e', 70:'f', 71:'g', 72:'h',
        73:'i', 74:'j', 5:'k', 76:'l', 77:'m', 78:'n', 79:'o', 80:'p',
        81:'q', 82:'r', 83:'s', 84:'t', 85:'u', 86:'v', 87:'w', 88:'x',
        89:'y', 90:'z',
        // Arrow keys.
        37:'left arrow', 38:'up arrow', 39:'right arrow', 40:'down arrow',
        // Other.
        8:'backspace', 9:'tab', 13:'enter', 16:'shift', 17:'control',
        18:'alt', 27:'escape', 32:'space', 33:'page up', 34:'page down',
        35:'end', 36:'home', 44:'print screen', 45:'insert', 46:'delete',
        144:'num lock', 145:'scroll lock', 59:'semi-colon',
        186:'semi-colon', 61:'equal sign', 107:'equal sign',
        187:'equal sign', 188: 'comma', 109:'dash', 189: 'dash',
        190:'period', 191:'forward slash', 192:'grave accent',
        219:'open bracket', 220:'back slash', 221:'close bracket',
        222:'single quote'
    },

    update: function() {
        var __justPressed_new = {},
            __lastPressed_new = {};
        for(var name in this.__pressed) {
            if(!this.__lastPressed[name]) {
                __justPressed_new[name] = true;
            }
            __lastPressed_new[name] = true;
        }
        this.__justPressed = __justPressed_new;
        this.__lastPressed = __lastPressed_new;
    },

    // Returns true if the key with the given name is pressed. Returns false
    // otherwise.
    isPressed: function(name) {
        return this.__lastPressed[name] !== undefined;
    },

    // Returns true if the key with the given name was just pressed. Returns
    // false otherwise.
    justPressed: function(name) {
        return this.__justPressed[name] !== undefined;
    },

    // Returns true if the key with the given name is being held. Returns
    // false otherwise.
    isHeld: function(name) {
        return this.isPressed(name) && !this.justPressed(name);
    },

    // Event handling.
    __onKeyDown: function(e) {
        var name = this.KEYCODES[e.which || e.keyCode];
        this.__pressed[name] = true;
        event.stopPropagation();
        event.preventDefault();
    },
    __onKeyUp: function(e) {
        var name = this.KEYCODES[e.which || e.keyCode];
        //TODO:this is about 4 times slower than just updating the property.
        // consider changing this. right now it is being used to avoid
        // too many for loop iterations in 'update' when looking at all
        // the properties of '__pressed'.
        delete this.__pressed[name];
        event.stopPropagation();
        event.preventDefault();
    }
};

// Hook up event handlers.
window.top.addEventListener('keydown', Input.Key.__onKeyDown.bind(Input.Key), false);
window.top.addEventListener('keyup', Input.Key.__onKeyUp.bind(Input.Key), false);
window.addEventListener('keydown', Input.Key.__onKeyDown.bind(Input.Key), false);
window.addEventListener('keyup', Input.Key.__onKeyUp.bind(Input.Key), false);