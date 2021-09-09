const fs = require('fs');
const sizeOf = require('image-size');
const sharp = require('sharp');

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
		console.log("Caught error while checking image dimensions and format for: " + color);
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
const storeImage = (color, tileId, s3, fn) => {
    let isStageOrProd = process.env.DEPLOYMENT_ENV === "prod" || process.env.DEPLOYMENT_ENV === "test";
    // let isStageOrProd = true;
    if (!isStageOrProd) { //Only write to s3 if stage or prod
        fn();
    } else {
        color = color.substring(2, color.length);
        let img = Buffer.from(color, 'hex');
        let fileName = "image_" + tileId + "." + getImageDataType(img.toString('base64'));
        
        sharp(img).resize(336, 336, {  kernel: sharp.kernel.nearest}).toBuffer()
            .then(function(imgResized) {
                var uploadParams = { Bucket: process.env.S3_BUCKET, Key: '', Body: '' };
                uploadParams.Body = imgResized;
                uploadParams.Key = "images/" + fileName;
                uploadParams.ACL = "public-read";
                // call S3 to upload file to specified bucket
                this.s3.upload(uploadParams, function (err, data) {
                    if (err) {
                        console.log("Error", err);
                        fn();
                    } if (data) {
                        console.log("Upload Success", data.Location);
                        fn();
                    }
                });
            })
            .catch(err => {
                console.log("Got error during image resizing");
                console.log(err);
            });
    }
}

exports.checkColorValidity = checkColorValidity;
// exports.getHexColor = getHexColor;
exports.storeImage = storeImage;
exports.getImageDataType = getImageDataType;