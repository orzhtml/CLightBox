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
    var precision = 0.25;
    var leftLength = 0;
    var topLength = 0;
    var toggle = false;
    var base64 = '';
    var GET_SUFFIX = /\.[^\.]+$/;
    var imgSrc = canvas.getAttribute('data-src');
    var fileType = imgSrc.replace(/.+\.|data:image\/([^;]+).*/i, '$1');

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
    		var _fileType = '';
    		if (fileType == 'png') {
    			_fileType = 'image/png';
    		} else {
    			_fileType = 'image/jpeg';
    		}
        downloadFile(getLocalDate(), canvas.toDataURL(_fileType))
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

    function base64Img2Blob(code) {
        var parts = code.split(';base64,');
        var contentType = parts[0].split(':')[1];
        console.log(contentType);
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

    function downloadFile(fileName, content) {
        var aLink = document.createElement('a');
        var blob = base64Img2Blob(content); //new Blob([content]);
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", false, false); //initEvent 不加后两个参数在FF下会报错
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob);
        console.log(URL.createObjectURL(blob))
        aLink.dispatchEvent(evt);
    }

    function Download() {
        //cavas 保存图片到本地  js 实现
        //------------------------------------------------------------------------
        //1.确定图片的类型  获取到的图片格式 data:image/Png;base64,...... 
        var type = 'png'; //你想要什么图片格式 就选什么吧
        var imgdata = canvas.toDataURL(type);
        //2.0 将mime-type改为image/octet-stream,强制让浏览器下载
        var fixtype = function (type) {
            type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
            var r = type.match(/png|jpeg|bmp|gif/)[0];
            return 'image/' + r;
        };
        imgdata = imgdata.replace(fixtype(type), 'image/octet-stream');
        //3.0 将图片保存到本地
        var savaFile = function (data, filename) {
            var save_link = document.createElement("a");
            save_link.href = data;
            save_link.download = filename;
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            save_link.dispatchEvent(event);
        };
        var filename = '' + new Date().getDate() + '.' + type;
        //注意咯 由于图片下载的比较少 就直接用当前几号做的图片名字
        savaFile(imgdata, filename);
    };

    // 保存图片到本地
    function saveImage(imgPathURL, fileName) {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            //IE     
            if (window.atob) {
                //IE10、IE11
                var blob = convertBase64UrlToBlob(imgPathURL);
                navigator.msSaveBlob(blob, fileName + ".png");
            } else {
                //IE9-
                var w = window.open('about:blank', "new_win");
                w.document.write("<img src=" + imgPathURL + ">");
                w.document.title = fileName;
            }
        } else {
            // 其他
            var saveA = document.createElement("a");
            saveA.setAttribute("target", "_blank");
            saveA.setAttribute("href", imgPathURL);
            saveA.setAttribute("download", fileName + ".png");
            saveA.setAttribute("hidden", "hidden");
            document.body.appendChild(saveA);

            var saveImg = document.createElement("img");
            saveImg.setAttribute("src", imgPathURL);
            saveA.appendChild(saveImg);

            saveImg.click();
        }
    }

    /**
     * 将以 base64 的图片 url 数据转换为 Blob
     * @param urlData
     * 用url方式表示的 base64 图片数据
     */
    function convertBase64UrlToBlob(urlData) {
        var bytes = window.atob(urlData.split(',')[1]); //去掉url的头，并转换为byte
        //处理异常,将ascii码小于0的转换为大于0
        var ab = new ArrayBuffer(bytes.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i);
        }
        return new Blob([ab], {
            type: 'image/png'
        });
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