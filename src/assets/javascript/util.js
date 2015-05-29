if(typeof String.prototype.endsWith ==="undefined") {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

function dirname(path) {
    if(path.length===0)
        return "";

    var segments = path.split("/");
    if(segments.length<=1)
        return "";
    return segments.slice(0,-1).join("/");
}


