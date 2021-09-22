
let tileCache;

const updateTileCache = (tiles) => {  
    tileCache = tiles;
}

const getTileCache= () => {  
    return tileCache;
}

exports.updateTileCache = updateTileCache;
exports.getTileCache = getTileCache;