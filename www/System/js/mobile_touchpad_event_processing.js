/**
*   Модуль добавляе гененрирует событие  ПКМ , MouseDown, MouseMove и MouseUp из событий Touch (экран мобильного устройства )
**/
document.addEventListener("DOMContentLoaded", function() {
    var docDownEventTouch = false;
	var docMoveEventTouchDom, docUpEventTouchDom;
    var _touchObject;
    var docDownEventTouchTimer;
    var _onMoveDom = function(evt) {
        clearTimeout(docDownEventTouchTimer);
        docDownEventTouch = false;
        _touchObject.dispatchEvent(new MouseEvent('mousemove', {'bubbles': true, clientX: Math.round(evt.pageX), clientY: Math.round(evt.pageY),}))
    }
    var _onMouseUpDom = function(evt) {
        clearTimeout(docDownEventTouchTimer);
        docDownEventTouch = false;
        _touchObject.dispatchEvent(new MouseEvent('mouseup', {'bubbles': true,clientX: Math.round(evt.pageX), clientY: Math.round(evt.pageY),}))
        document.removeEventListener('touchmove', docMoveEventTouch);
        document.removeEventListener('touchend', docUpEventTouch);
    }
    document.addEventListener('touchstart', function(evt) {
        docDownEventTouch = true;
        evt.preventDefault();
        var touches = evt.changedTouches;
        _touchObject = document.elementFromPoint(touches[0].pageX, touches[0].pageY);
        var clickX = Math.round(touches[0].pageX);
        var clickY = Math.round(touches[0].pageY);
        _touchObject.dispatchEvent(new MouseEvent('mousedown', {'bubbles': true, clientX: clickX, clientY: clickY,}))
        docDownEventTouchTimer = setTimeout(function() {
            document.elementFromPoint(clickX, clickY).dispatchEvent(new MouseEvent('mousedown', {button: 2, bubbles: true, clientX: clickX, clientY: clickY,}));
            clearTimeout(docDownEventTouchTimer);
            docDownEventTouch = false;
        }, 500);
        document.addEventListener('touchmove', docMoveEventTouchDom = function(event) {_onMoveDom(event.changedTouches[0]||window.event);});
        document.addEventListener('touchend', docUpEventTouchDom = function(event) {_onMouseUpDom(event.changedTouches[0]||window.event);})
    });
});