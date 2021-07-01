import mongoose from 'mongoose';
import PostModel from "../models/post.js";
import { processResponseData } from "../utils/processResponseData.js";

export const getPosts = async (_, res) => { 
    try {
        console.log(new Date(), 'Finding posts...');
        const post = await PostModel.find();
        const resData = processResponseData(200, post);
        console.log(new Date(), 'Get posts successful. Find posts count:', post.length);
        res.status(200).json(resData);
    } catch (error) {
        const resData = processResponseData(404, [], error.message);
        console.error(new Date(), 'Error occrence when get posts with error: ', error.message);
        res.status(404).json(resData);
    }
}

export const createPost = async (req, res) => {
    const { creator, title, message, tags, selectedFile } = req.body;
    const newPostMessage = new PostModel({ creator, title, message, tags, selectedFile })
    try {
        console.log(new Date(), 'Creating post...');
        const savedPostMessage = await newPostMessage.save();
        const resData = processResponseData(201, savedPostMessage);
        console.log(new Date(), 'Create post successful. New post id:', JSON.stringify(savedPostMessage._id));
        res.status(201).json(resData);
    } catch (error) {
        const resData = processResponseData(409, [], error.message);
        console.error(new Date(), 'Error occrence when create posts with error: ', error.message);
        res.status(409).json(resData);
    }
}

export const updatePost = async (req, res) => {
    try {
        console.log(new Date(), 'Updating post...');
        const { id } = req.params;
        const { creator, title, message, tags, selectedFile } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const resData = processResponseData(404, [], `Can't find the post with id: ${id}, please refresh the page.`);
            console.log(`${new Date()}, Update post failed. Can't find the post with id: ${id}`);
            return res.status(404).send(resData);
        }
        const newPost = { creator, title, message, tags, selectedFile, _id: id, lastestUpdateTime: new Date() };
        const updatedPost = await PostModel.findByIdAndUpdate(id, newPost, { new: true });
        const resData = processResponseData(200, updatedPost);
        console.log(new Date(), 'Update post successful. Updated post id:', JSON.stringify(updatedPost._id));
        res.status(200).json(resData);
    } catch (error) {
        const resData = processResponseData(409, [], error.message);
        console.error(new Date(), 'Error occrence when update posts with error: ', error.message);
        res.status(404).json(resData);
    }
}

export const likePost = async (req, res) => {
    try {
        console.log(new Date(), 'Likeing post...');
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const resData = processResponseData(404, [], `Can't find the post with id: ${id}, please refresh the page.`);
            console.log(`${new Date()}, Like post failed. Can't find the post with id: ${id}`);
            return res.status(404).send(resData);
        }
        console.log(new Date(), 'Finding post...');
        const post = await PostModel.findById(id);
        console.log(new Date(), 'Get post successful. Finded post id:', post._id);
        const updatedPost = await PostModel.findByIdAndUpdate(id, { likeCount: post.likeCount + 1 }, { new: true });
        const resData = processResponseData(200, updatedPost);
        console.error(new Date(), 'Update post successful. Updated post id:', JSON.stringify(updatedPost._id));
        res.status(200).json(resData);
    } catch (error) {
        const resData = processResponseData(409, [], error.message);
        console.error(new Date(), 'Error occrence when like posts with error: ', error.message);
        res.status(404).json(resData);
    }
}

export const deletePost = async (req, res) => {
    try {
        console.log(new Date(), 'Deleting post...');
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const resData = processResponseData(404, [], `Can't find the post with id: ${id}, please refresh the page.`);
            console.log(`${new Date()}, Delete post failed. Can't find the post with id: ${id}`);
            return res.status(404).send(resData)
        }
        const deletedPost = await PostModel.findByIdAndRemove(id);
        const resData = processResponseData(200, deletedPost);
        console.log(new Date(), 'Delete post successful. Delete post id:', JSON.stringify(deletedPost._id));
        res.status(200).json(resData);
    } catch (error) {
        const resData = processResponseData(409, [], error.message);
        console.error(new Date(), 'Error occrence when update posts with error: ', error.message);
        res.status(404).json(resData);
    }
}
