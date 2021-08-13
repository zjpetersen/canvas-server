const fs = require('fs');
const sizeOf = require('image-size');

//Checks to make sure the image is 16x16 pixels and is a supported image format (png, jpeg, gif)
const checkColorValidity = (color) => {
	result = false;
	color = color.substring(2, color.length);
	let img = Buffer.from(color, 'hex');
	try {
		const dimensions = sizeOf(img);
		if (dimensions.height == 16 && dimensions.width == 16 && getImageDataType(img.toString('base64')) != null) {
			result = true;
		}
	} catch (err) {
		//TODO better error handling
		console.log("Caught error");
	}
	return result;
}

//Gets base64 representation of image
// const getHexColor = (color) => {
// 	color = color.substring(2, color.length);
// 	let img = Buffer.from(color, 'hex');
//     if (img == null) {
//         return img;
//     }
    
//     let imageDataType = getImageDataType(img.toString('base64'));
//     //Image not supported
//     if (imageDataUrlPrefix == null) {
//         return null;
//     }
//     console.log(imageDataUrlPrefix);
//     return "data:image/" + imageDataType + ";base64," + img.toString('base64');
// }

//Png, jpeg and gif are supported
//Expect a base64 input without the leading 0x.
//Ex: iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAJdJREFUOI1jjM57+J+BgYHh+KZgBnRg6bcWqzhMjoGBgYEJn+YnFyfDFaIDmB4mXDYQA45vCoa4AJvtHLpyDAwMDHhdwcDAgN0AUgCGAci2wwA+V1DXBdhsJ+QK6rrg+KZghh+XH2FVKKOfizW9UD8WsLkCl+20cQG6K/DZzsDAwMCEL5kSApZ+ayEuwGbI8U3BeG2H6QEAzwFByYUuFEgAAAAASUVORK5CYII=
const getImageDataType = (base64Color) => {
    if (base64Color.charAt(0) == 'i') { //Png
        return "png";
    } else if (base64Color.charAt(0) == '/') { //jpg
        return "jpeg";
    } else if (base64Color.charAt(0) == 'R') { //gif
        return "gif";
    } else {
        //Format not supported
        return null;
    }
}

//Stores image to file system so that OpenSea can fetch them
const storeImage = (color, tileId, fn) => {
	color = color.substring(2, color.length);
	let img = Buffer.from(color, 'hex');
    unlink(tileId, "png")
        .then(unlink(tileId, "jpeg"))
        .then(unlink(tileId, "gif"))
        .then(
            fs.writeFile("static/image_" + tileId + "." + getImageDataType(img.toString('base64')), img, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("File written successfully");
                    fn();
                }
            })
        );
}

const unlink = (tileId, ext) => {
    return new Promise(function(x,y) {
        fs.unlink("static/image_" + tileId + "." + ext, (err) => {
            if (err) {
                console.log(err);
            }

        })
    });
}

exports.checkColorValidity = checkColorValidity;
// exports.getHexColor = getHexColor;
exports.storeImage = storeImage;
exports.getImageDataType = getImageDataType;