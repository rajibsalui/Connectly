import express from 'express';
import Call from '../models/call.model.js';

const router = express.Router();

export const startCall = async(req, res) => {
    try {
        const { callerId, receiverId } = req.body;
        const callId = `${callerId}-${receiverId}-${Date.now()}`;
        const newCall = new Call({ callId, callerId, receiverId });
        await newCall.save();
        res.status(201).json({ message: 'Video call started', callId });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const endCall = async(req, res) => {
    try {
        const { callId } = req.body;
        const callended = await Call.findOneAndDelete({ callId });
        res.status(200).json({ message: 'Video call ended' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getActiveCalls = async(req, res) => {
    try {
        const activeCalls = await Call.find({ status: 'ongoing' });
        res.status(200).json(activeCalls);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

