var load = function(e) {
    var crop = createCrop();

    var url = document.getElementById('imgInput');
    var img = document.getElementById('initImg');
    var tCrop = document.getElementById('crop');
    var rCrop = document.getElementById('cropReset');
    var reset = document.getElementById('reset');
    var top = document.getElementById('top');
    var bot = document.getElementById('bot');
    var sub = document.getElementById('submitBtm');
 
    var loading = document.createElement('Div');
    loading.appendChild(document.createTextNode('Loading...'));

    var srvErrorNode = document.createElement('Div');
    srvErrorNode.appendChild(document.createTextNode('ERROR: Picture could not load'));

    reset.parentNode.removeChild(reset);

    img.className = 'resized';

    try {
        var imgP = getParam('img', location.search);
        if(imgP) {
            url.value = unescape(imgP);
            changePicture({});
        }
    } catch(e) { }


    events(window, 'keydown', submitKey);
    events(img, 'load', pictureLoaded);
    events(url, 'change', changePicture);
    events(tCrop, 'click', toggleCrop);
    events(rCrop, 'click', resetCrop);
    events(reset, 'click', resetPicture);
    events(sub, 'click', submit);

    var fb = initFBConnect(img);

    function submit(e) {
        var bounds = crop.getBounds();
        var x = parseInt((bounds.x / bounds.tWidth) * bounds.aWidth);
        var width = parseInt((bounds.cWidth / bounds.tWidth) * bounds.aWidth) - x;
        var y = parseInt((bounds.y / bounds.tHeight) * bounds.aHeight);
        var height = parseInt((bounds.cHeight / bounds.tHeight) * bounds.aHeight) - y;
        var params = '?url=' + escape(url.value) +
            '&top=' + escape(top.value) + '&bot=' + escape(bot.value) +
            '&x=' + x + '&width=' + width +
            '&y=' + y + '&height=' + height;
        var src = 'http://willhughes.ca:8080/' + params;
        if(img.src === src) {
            return;
        }

        events(img, 'error', srvError);
        img.src = src;

        crop.endCrop();
        
        try {
            sub.parentNode.insertBefore(fb.getFacebookButton(), sub);
        } catch(e) {}

        img.parentNode.appendChild(loading);
        img.style.display = 'none';

        try {
            var p = tCrop.parentNode;
            p.removeChild(rCrop);
            p.replaceChild(reset, tCrop);
            crop.hide();
        } catch(e) {}
    }

    function submitKey(e) {
        if(e.keyCode === 13) {
            if(e.target && (e.target.tagName === "BUTTON" || e.target === url)) {
                return false;
            }
            submit();
        }
    }

    function srvError(e) {
        events(img, 'error', srvError, true);
        try {
            img.parentNode.appendChild(srvErrorNode);
            loading.parentNode.removeChild(loading);
        } catch(e) { }
    }

    function pictureLoaded(e) {
        events(img, 'error', srvError, true);
        try {
            loading.parentNode.removeChild(loading);
            img.style.display = '';
        } catch(e) { }
    }

    function resetPicture(e) {
        img.style.display = '';
        changePicture();

        if(srvErrorNode.parentNode) {
            srvErrorNode.parentNode.removeChild(srvErrorNode);
        }
        if(loading.parentNode) {
            loading.parentNode.removeChild(loading);
        }

        try {
            var fBtn = fb.getFacebookButton();
            fBtn.parentNode.removeChild(fBtn);
        } catch(e) {}

        var p = reset.parentNode;
        p.replaceChild(rCrop, reset);
        p.insertBefore(tCrop, rCrop);
        toggleCrop();
        toggleCrop();
    }

    function changePicture(e) {
        if(img.src !== url.value) {
            if(e) {
                events(img, 'load', resize);
            }
            img.src = url.value;
        } else {
            resize();
        }
        
        function resize(resizeEvent) {
            events(img, 'load', resize, true);

            img.style.maxWidth = '';
            var w = img.width;
            var h = img.height;

            img.style.maxWidth = '1px';
            img.style.maxWidth = (document.width - 285) + 'px';
            var w2 = img.width;
            var h2 = img.height;

            if(e || window.event) {
                crop.setBounds({
                    x: 0,
                    y: 0,
                    cWidth: w2,
                    cHeight: h2,
                    tWidth: w2,
                    tHeight: h2,
                    aWidth: w,
                    aHeight: h
                });
                crop.destroy();
            }

            crop.updateImgBounds();
        }
    }

    function resetCrop(e) {
        changePicture({});
        crop.resetCrop();
    }

    function toggleCrop(e) {
        crop.toggleCrop();
    }
};

events(window, 'load', load);

