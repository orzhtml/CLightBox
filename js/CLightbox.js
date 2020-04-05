(function () {
    var center = document.getElementById('center');
    var percentage = document.getElementById('percentage');
    var zoomBtn1 = document.getElementById('zoom1');
    var zoomBtn2 = document.getElementById('zoom2');
    var saveBtn = document.getElementById('save');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext("2d");
    var img = new Image();
    var _timer = null;
    var _width = 0;
    var _height = 0;
    var _imgW = 0;
    var _imgH = 0;
    var _horizontal = 1;
    var _vertical = 1;
    var _radian = 0;
    var _angle = 1;
    var precision = 0.25;
    var leftLength = 0;
    var topLength = 0;
    var toggle = false;
    var base64 = '';
    var GET_SUFFIX = /.+\.|data:image\/([^;]+).*/i;
    var imgSrc = canvas.getAttribute('data-src');
    var fileType = imgSrc.replace(GET_SUFFIX, '$1');

    //img.crossOrigin = "anonymous";
    img.src = canvas.getAttribute('data-src');
    img.onload = function () {
        _imgW = img.width;
        _imgH = img.height;
        _width = canvas.width = _imgW;
        _height = canvas.height = _imgH;
        context.drawImage(img, 0, 0);
        drawing(0);
        canvas.style['webkitTransform'] = 'translate(0px, 0px)';
        canvas.style['mozTransform'] = 'translate(0px, 0px)';
        canvas.style['msTransform'] = 'translate(0px, 0px)';
        canvas.style['transform'] = 'translate(0px, 0px)';
    };

    document.getElementById('rotate').onclick = function () {
        if (parseInt(this.title)) {
            return;
        }
        this.title = 1;
        if (_angle == 4) {
            _angle = 1;
        } else {
            _angle++;
        }
        rotating(this);
    };

    document.getElementById('horizontal').onclick = function () {
        _radian = Math.PI - _radian;
        _vertical *= -1;
        drawing(_radian);
    };

    document.getElementById('vertical').onclick = function () {
        _radian = Math.PI - _radian;
        _horizontal *= -1;
        drawing(_radian);
    };

    zoomBtn1.onclick = function () {
        var old_horizontal = checkShaft(_horizontal);
        if (old_horizontal <= 0.01 || parseInt(this.title) || parseInt(zoomBtn2.title)) {
            // 缩小最多到原图的0.01倍
            return;
        }

        this.title = 1;

        switch (old_horizontal) {
            case 0.25: // 等于0.25
                precision = -0.13;
                break;
            case 0.12: // 等于0.12
                precision = -0.06;
                break;
            case 0.06: // 等于0.06
                precision = -0.03;
                break;
            case 0.03: // 等于0.03
                precision = -0.02;
                break;
            default: // 其他情况 0.25
                precision = -0.25;
        }

        var xy = scaling(_horizontal, _vertical, precision);
        new_horizontal = checkShaft(xy.y); // 计算缩放后的Y轴

        percentage.innerHTML = (new_horizontal * 100) + '%';

        setZoom(this, old_horizontal, new_horizontal, precision);
    };

    zoomBtn2.onclick = function () {
        var old_horizontal = checkShaft(_horizontal);
        if (old_horizontal >= 3 || parseInt(this.title) || parseInt(zoomBtn1.title)) {
            // 最多原图3倍放大
            return;
        }

        this.title = 1;

        switch (old_horizontal) {
            case 0.01: // 等于0.02
                precision = 0.02;
                break;
            case 0.03: // 等于0.03
                precision = 0.03;
                break;
            case 0.06: // 等于0.06
                precision = 0.06;
                break;
            case 0.12: // 等于0.12
                precision = 0.13;
                break;
            default: // 其他情况 0.25
                precision = 0.25;
        }

        var xy = scaling(_horizontal, _vertical, precision);
        new_horizontal = checkShaft(xy.y); // 计算缩放后的Y轴

        percentage.innerHTML = (new_horizontal * 100) + '%';

        setZoom(this, old_horizontal, new_horizontal, precision);
    };

    document.getElementById('reset').onclick = function () {
        _vertical = 1;
        _horizontal = 1;
        _radian = 0;
        precision = 0.25;
        percentage.innerHTML = '100%';
        zoomBtn1.title = 0;
        zoomBtn2.title = 0;
        canvas.style['webkitTransform'] = 'translate(0px, 0px)';
        canvas.style['mozTransform'] = 'translate(0px, 0px)';
        canvas.style['msTransform'] = 'translate(0px, 0px)';
        canvas.style['transform'] = 'translate(0px, 0px)';
        drawing(_radian);
    };

    canvas.onmousedown = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var width = this.offsetWidth;
        var height = this.offsetHeight;
        var transform = canvas.style['webkitTransform'] || canvas.style['mozTransform'] || canvas.style['msTransform'] || canvas.style['transform'];
        var posix = transform.replace(/[^0-9\-,]/g, '').split(',');
        var _posix = {
            x: posix[0],
            y: posix[1]
        };
        leftLength = e.pageX - _posix.x;
        topLength = e.pageY - _posix.y;
        toggle = true;
    };

    document.onmousemove = function (e) {
        if (toggle) {
            canvas.style['webkitTransform'] = 'translate(' + (e.pageX - leftLength) + 'px,' + (e.pageY - topLength) + 'px)';
            canvas.style['mozTransform'] = 'translate(' + (e.pageX - leftLength) + 'px,' + (e.pageY - topLength) + 'px)';
            canvas.style['msTransform'] = 'translate(' + (e.pageX - leftLength) + 'px,' + (e.pageY - topLength) + 'px)';
            canvas.style['transform'] = 'translate(' + (e.pageX - leftLength) + 'px,' + (e.pageY - topLength) + 'px)';
        }
    };

    document.onmouseup = function () {
        toggle = false;
    };

    saveBtn.onclick = function () {
        var __img = new Image();
        var __canvas = document.createElement('canvas');
        var __context = __canvas.getContext("2d");
        var __imgSrc = imgSrc;
        var __fileType = '';
        if (fileType == 'png') {
            __fileType = 'image/png';
        } else {
            __fileType = 'image/jpeg';
        }
        __img.src = __imgSrc;
        __img.onload = function () {
            var __w = __img.width * _horizontal;
            var __h = __img.height * _horizontal;
            var __angle_w = _angle == 1 || _angle == 3 ? __w : __h;
            var __angle_h = _angle == 1 || _angle == 3 ? __h : __w;
            __canvas.width = __angle_w;
            __canvas.height = __angle_h;
            if (_angle == 4) {
                __context.translate(0, __w);
            } else if (_angle == 3) {
                __context.translate(__w, __h);
            } else if (_angle == 2) {
                __context.translate(__h, 0);
            } else {
                __context.translate(0, 0);
            }
            // 旋转的弧度（注意不是角度）
            __context.rotate(_radian);
            __context.scale(_horizontal, _vertical);
            __context.drawImage(__img, 0, 0);
            downloadFile(getLocalDate(), __canvas.toDataURL(__fileType));
        };
    };

    // 重新绘图
    function drawing(radian) {
        // 获取图片的对角线长度
        var imgDiagonalLength = checkShaft(diagonalLength(_imgW * _horizontal, _imgH * _horizontal));
        // 每一次改变画板的图片都重新设置画板宽高
        _width = canvas.width = imgDiagonalLength;
        _height = canvas.height = imgDiagonalLength;
        // 重新定位让内容居中展示
        center.scrollLeft = center.scrollTop = (imgDiagonalLength - (center.offsetWidth - 17)) / 2;
        // 绘制开始
        context.save();
        // 清空画板
        context.clearRect(0, 0, _width, _height);
        // 找到画板中心点
        context.translate(_width / 2, _height / 2);
        // 旋转的弧度（注意不是角度）
        context.rotate(radian);
        // 缩放的比率，正常是 _horizontal:1,_vertical:1
        context.scale(_horizontal, _vertical);
        // 取到图片中心点，以图片中心点位置绘制到画板中间点
        context.drawImage(img, -_imgW / 2, -_imgH / 2);
        // 结束绘制
        context.restore();
    }

    // 检查轴并将负数转为正整数
    function checkShaft(scale) {
        return scale < 0 ? -(scale) : scale;
    }

    // 缩放大小 返回缩放后（y，x）轴的值
    function scaling(y, x, zoom) {
        function getZoom(scale, zoom) {
            return scale > 0 && scale > -zoom ? zoom :
                scale < 0 && scale < zoom ? -zoom : 0;
        }

        y += getZoom(y, zoom);
        x += getZoom(x, zoom);
        // 返回精度最小3位小数
        return {
            y: y.toFixed(3) * 1,
            x: x.toFixed(3) * 1
        }
    }

    // 计算对角线的距离
    function diagonalLength(width, height) {
        return Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)).toFixed(3) * 1;
    }

    // 旋转过度动画
    function rotating(btn) {
        var _i = 0;
        (function animation() {
            // 旋转 10 次结束动画
            if (_i >= 10) {
                _i = 0;
                cancelAnimationFrame(_timer);
                _timer = null;
                btn.title = 0;
            } else {
                // 每次旋转的弧度为 3.14 / 20 
                _radian += Math.PI / 20;
                // 去绘制图像
                drawing(_radian);
                _i++;
                _timer = requestAnimationFrame(function () {
                    animation();
                });
            }
        })();
    }

    // 缩放过度动画
    function setZoom(Btn, oldY, newY, precision) {
        var _oldY = oldY;
        var _xy = {};
        // 每次以需要缩放的精度的 1/10 开始动画
        var _precision = precision / 10;
        (function animation() {
            if (_oldY == newY) {
                cancelAnimationFrame(_timer);
                _timer = null;
                Btn.title = 0;
            } else {
                _xy = scaling(_horizontal, _vertical, _precision); // 计算缩放后的YX轴
                _horizontal = _xy.y;
                _vertical = _xy.x;
                // 去绘制
                drawing(_radian);
                // 精度最小3位小数
                _oldY = (_oldY + _precision).toFixed(3) * 1;
                _timer = requestAnimationFrame(function () {
                    animation();
                });
            }
        })();
    }

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