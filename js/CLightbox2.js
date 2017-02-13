(function () {
    var GET_SUFFIX = /.+\.|data:image\/([^;]+).*/i;

    var myImg = document.getElementById('myImg');
    var rotate = document.getElementById('rotate');
    var horizontal = document.getElementById('horizontal');
    var vertical = document.getElementById('vertical');
    var zoom1 = document.getElementById('zoom1');
    var percentage = document.getElementById('percentage');
    var zoom2 = document.getElementById('zoom2');
    var reset = document.getElementById('reset');
    var save = document.getElementById('save');

    var _imgSrc = myImg.getAttribute('src');
    var _fileType = _imgSrc.replace(GET_SUFFIX, '$1');
    var _radian = _left = _top = 0;
    var _x = _y = 1;
    var _precision = 0.25;
    var _toggle = false;
    var _angle = 1;
    var _xAngle = 0;
    var _yAngle = 0;

    rotate.onclick = function () {
        if (_angle == 4) {
            _angle = 1;
        } else {
            _angle++;
        }
        _radian += 90;
        Transform(_radian, _x, _y);
    };

    horizontal.onclick = function () {
        _x *= -1;
        _xAngle = _xAngle == 1 ? 0 : 1; 
        Transform(_radian, _x, _y);
    };

    vertical.onclick = function () {
        _y *= -1;
        _yAngle = _yAngle == 1 ? 0 : 1;
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

        percentage.innerHTML = (checkShaft(_x) * 100) + '%';
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

        percentage.innerHTML = (checkShaft(_x) * 100) + '%';
        Transform(_radian, _x, _y);
    }

    reset.onclick = function () {
        _radian = _left = _top = _xAngle = _yAngle = 0;
        _x = _y = _angle = 1;
        _precision = 0.25;
        myImg.style.left = myImg.style.top = '0px';
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

    save.onclick = function () {
        var __img = new Image();
        var __canvas = document.createElement('canvas');
        var __context = __canvas.getContext("2d");
        var __imgSrc = _imgSrc;
        var __radian = _radian;
        var __y = _y;
        var __x = _x;
        var __fileType = '';
        if (_fileType == 'png') {
            __fileType = 'image/png';
        } else {
            __fileType = 'image/jpeg';
        }
        __img.src = __imgSrc;
        __img.onload = function () {
            var __w = __img.width * checkShaft(__x);
            var __h = __img.height * checkShaft(__x);
            var __angle_w = _angle == 1 || _angle == 3 ? __w : __h;
            var __angle_h = _angle == 1 || _angle == 3 ? __h : __w;
            __canvas.width = __angle_w;
            __canvas.height = __angle_h;
            
            if (_xAngle == 0 && _yAngle == 0) {
            		if (_angle == 4) {
                		__context.translate(0, __w);
            		} else if (_angle == 3) {
                		__context.translate(__w, __h);
            		} else if (_angle == 2) {
                		__context.translate(__h, 0);
            		} else {
                		__context.translate(0, 0);
            		}
            } else if (_xAngle == 0 && _yAngle == 1) {
            		if (_angle == 4) {
                		__context.translate(__h, __w);
            		} else if (_angle == 3) {
                		__context.translate(__w, 0);
            		} else if (_angle == 2) {
                		__context.translate(0, 0);
            		} else {
                		__context.translate(0, __h);
            		}
            } else if (_xAngle == 1 && _yAngle == 1) {
            		if (_angle == 4) {
                		__context.translate(__h, 0);
            		} else if (_angle == 3) {
                		__context.translate(0, 0);
            		} else if (_angle == 2) {
                		__context.translate(0, __w);
            		} else {
                		__context.translate(__w, __h);
            		}
            } else if (_xAngle == 1 && _yAngle == 0) {
            		if (_angle == 4) {
                		__context.translate(0, 0);
            		} else if (_angle == 3) {
                		__context.translate(0, __h);
            		} else if (_angle == 2) {
                		__context.translate(__h, __w);
            		} else {
                		__context.translate(__w, 0);
            		}
            }
            
            // 旋转的弧度（注意不是角度）
            __context.rotate((_radian * Math.PI / 180 || 0));
            __context.scale(__x, __y);
            __context.drawImage(__img, 0, 0);
            downloadFile(getLocalDate(), __canvas.toDataURL(__fileType));
        };
    };

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
        return Math.abs(scale);
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

    // 下载图片
    function downloadFile(fileName, content) {
        var aLink = document.createElement('a');
        var blob = base64Img2Blob(content); //new Blob([content]);
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", false, false); //initEvent 不加后两个参数在FF下会报错
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob);
        aLink.dispatchEvent(evt);

        // 转换 base64 为 Blob
        function base64Img2Blob(code) {
            var parts = code.split(';base64,');
            var contentType = parts[0].split(':')[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;
            var uInt8Array = new Uint8Array(rawLength);
            for (var i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            return new Blob([uInt8Array], {
                type: contentType
            });
        }
    }

    // 获取本地时间
    function getLocalDate() {
        var date = new Date();
        var dateObj = {
            year: date.getFullYear(),
            month: zeroize(date.getMonth() + 1),
            day: zeroize(date.getDate()),
            hours: zeroize(date.getHours()),
            min: zeroize(date.getMinutes()),
            sec: zeroize(date.getSeconds()),
            milliseconds: zeroize(date.getMilliseconds(), 3)
        };

        // 补零
        function zeroize(n, len) {
            len = len || 2;
            n += '';
            while (n.length < len) {
                n = '0' + n;
            }
            return n;
        }
        // 返回完整时间格式
        return dateObj.year + '' + dateObj.month + '' + dateObj.day + '' + dateObj.hours + '' + dateObj.min + '' + dateObj.sec + '' + dateObj.milliseconds;
    }
})();