L.Control.prototype._refocusOnMap = function _refocusOnMap(ev) {
    if (this._map && ev && ev.screenX > 0 && ev.screenY > 0) {
        this._map.getContainer().focus({ preventScroll: true });
    }
};