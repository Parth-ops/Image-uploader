'use strict';
const sharp = require('sharp');
const fs = require('fs');
const SingleFile = require('../models/singlefile');
const MultipleFile = require('../models/multiplefile');
const path = require('path');

const singleFileUpload = async (req, res, next) => {
    try{
        // console.log(req.file.path);
        const newFileName = new Date().toISOString().replace(/:/g, '-') + '-' + req.file.originalname;
        const newFilePath = path.join('uploads', newFileName);
        const metadata = await sharp(req.file.path).resize().jpeg({ quality: 10 }).toFile(newFilePath);
        console.log(req.file.filename);
        fs.unlinkSync('./uploads/'+req.file.filename, (err) => {console.log(err);});
        console.log(newFilePath);
        const file = new SingleFile({
            fileName: newFileName,
            filePath: newFilePath,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(metadata.size, 2) // 0.00
        });
        console.log(file);
        await file.save();
        res.status(201).send('File Uploaded Successfully');
    }
    catch(error) {
        res.status(400).send(error.message);
    }
}
const multipleFileUpload = async (req, res, next) => {
    try{
        let filesArray = [];
        console.log("Trying to upload multiple files");
        req.files.forEach(element => {
            const file = {
                fileName: element.originalname,
                filePath: element.path,
                fileType: element.mimetype,
                fileSize: fileSizeFormatter(element.size, 2)
            };
            // console.log(element);
            filesArray.push(file);
            
        });
        
        const multipleFiles = new MultipleFile({
            title: req.body.title,
            files: filesArray 
        });

        await multipleFiles.save();

        res.status(201).send('Files Uploaded Successfully');
    }catch(error) {
        res.status(400).send(error.message);
    }
}

const getallSingleFiles = async (req, res, next) => {
    try{
        const files = await SingleFile.find();
        res.status(200).send(files);
    }catch(error) {
        res.status(400).send(error.message);
    }
}
const getallMultipleFiles = async (req, res, next) => {
    try{
        const files = await MultipleFile.find();
        res.status(200).send(files);
    }catch(error) {
        res.status(400).send(error.message);
    }
}

const fileSizeFormatter = (bytes, decimal) => {
    if(bytes === 0){
        return '0 Bytes';
    }
    const dm = decimal || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'YB', 'ZB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + ' ' + sizes[index];

}

module.exports = {
    singleFileUpload,
    multipleFileUpload,
    getallSingleFiles,
    getallMultipleFiles
}