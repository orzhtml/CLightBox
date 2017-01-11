(function () {
    var myImg = document.getElementById('myImg');
    var rotate = document.getElementById('rotate');
    var horizontal = document.getElementById('horizontal');
    var vertical = document.getElementById('vertical');
    var zoom1 = document.getElementById('zoom1');
    var percentage = document.getElementById('percentage');
    var zoom2 = document.getElementById('zoom2');
    var reset = document.getElementById('reset');
    var save = document.getElementById('save');

    var _radian = _left = _top = 0;
    var _x = _y = 1;
    var _precision = 0.25;
    var _toggle = false;

    rotate.onclick = function () {
        _radian += 90
        Transform(_radian, _x, _y);
    };

    horizontal.onclick = function () {
        _x *= -1;
        Transform(_radian, _x, _y);
    };

    vertical.onclick = function () {
        _y *= -1;
        Transform(_radian, _x, _y);
    };

    zoom1.onclick = function () {
        if (checkShaft(_x) <= 0.01) {
            // 缩小最多到原图的0.01倍
            return;
        }

        switch (checkShaft(_x)) {
            case 0.25: // 等于0.25
                _precision = -0.13;
                break;
            case 0.12: // 等于0.12
                _precision = -0.06;
                break;
            case 0.06: // 等于0.06
                _precision = -0.03;
                break;
            case 0.03: // 等于0.03
                _precision = -0.02;
                break;
            default: // 其他情况 0.25
                _precision = -0.25;
        }

        var xy = scaling(_x, _y, _precision);
        _x = xy.x;
        _y = xy.y;

        percentage.innerHTML = (_x * 100) + '%';
        Transform(_radian, _x, _y);
    }

    zoom2.onclick = function () {
        if (checkShaft(_x) >= 3) {
            // 缩小最多到原图的0.01倍
            return;
        }

        switch (checkShaft(_x)) {
            case 0.01: // 等于0.02
                _precision = 0.02;
                break;
            case 0.03: // 等于0.03
                _precision = 0.03;
                break;
            case 0.06: // 等于0.06
                _precision = 0.06;
                break;
            case 0.12: // 等于0.12
                _precision = 0.13;
                break;
            default: // 其他情况 0.25
                _precision = 0.25;
        }

        var xy = scaling(_x, _y, _precision);
        _x = xy.x;
        _y = xy.y;

        percentage.innerHTML = (_x * 100) + '%';
        Transform(_radian, _x, _y);
    }

    reset.onclick = function () {
        _radian = _left = _top = 0;
        _x = _y = 1;
        _precision = 0.25;
        myImg.style.left = '0px';
        myImg.style.top = '0px';
        percentage.innerHTML = (_x * 100) + '%';
        Transform(_radian, _x, _y);
    }

    Transform(_radian, _x, _y);

    $(document).on({
        'mousemove': function (e) {
            if (!!this.move) {
                var posix = !document.move_target ? {
                        'x': 0,
                        'y': 0
                    } : document.move_target.posix,
                    callback = document.call_down || function () {
                        $(this.move_target).css({
                            'top': e.pageY - posix.y,
                            'left': e.pageX - posix.x
                        });
                    };
                callback.call(this, e, posix);
            }
        },
        'mouseup': function (e) {
            if (!!this.move) {
                var callback = document.call_up || function () {};
                callback.call(this, e);
                $.extend(this, {
                    'move': false,
                    'move_target': null,
                    'call_down': false,
                    'call_up': false
                });
            }
        }
    });

    $(myImg).on('mousedown', function (e) {    
        var left = $(this).css('left').replace('px', '') * 1;
        var top = $(this).css('top').replace('px', '') * 1;    
        this.posix = {
            'x': e.pageX - left,
            'y': e.pageY - top
        };
        $.extend(document, {
            'move': true,
            'move_target': this
        });
        return false;
    });

    function scaling(x, y, zoom) {
        function getZoom(scale, zoom) {
            return scale > 0 && scale > -zoom ? zoom :
                scale < 0 && scale < zoom ? -zoom : 0;
        }

        x += getZoom(x, zoom);
        y += getZoom(y, zoom);
        // 返回精度最小3位小数
        return {
            x: x.toFixed(3) * 1,
            y: y.toFixed(3) * 1
        }
    }

    function checkShaft(scale) {
        return scale < 0 ? -(scale) : scale;
    }

    function Transform(radian, x, y) {
        var valTransform = 'rotate(' + radian + 'deg) scale(' + x + ',' + y + ')';
        $css3Transform(myImg, valTransform);
    }

    function $css3Transform(element, value) {
        var arrPriex = ["O", "Ms", "Moz", "Webkit", ""],
            length = arrPriex.length;
        for (var i = 0; i < length; i += 1) {
            element.style[arrPriex[i] + "Transform"] = value;
        }
    };
})();