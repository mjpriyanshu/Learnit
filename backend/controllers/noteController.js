import Note from "../models/Note.js";

// Get note for a lesson
export const getNotes = async (req, res) => {
    try {
        const userId = req.user._id;
        const { lessonId } = req.params;
        const note = await Note.findOne({ userId, lessonId });
        res.json({ success: true, data: note || { content: '', highlights: [], tags: [] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all notes for user
export const getAllNotes = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookmarked } = req.query;
        const filter = { userId };
        if (bookmarked === 'true') filter.isBookmarked = true;

        const notes = await Note.find(filter)
            .populate('lessonId', 'title topic')
            .sort({ updatedAt: -1 });
        res.json({ success: true, data: notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Save or update note
export const saveNote = async (req, res) => {
    try {
        const userId = req.user._id;
        const { lessonId } = req.params;
        const { content, title, highlights, tags, isBookmarked } = req.body;

        let note = await Note.findOne({ userId, lessonId });
        if (note) {
            if (content !== undefined) note.content = content;
            if (title !== undefined) note.title = title;
            if (highlights !== undefined) note.highlights = highlights;
            if (tags !== undefined) note.tags = tags;
            if (isBookmarked !== undefined) note.isBookmarked = isBookmarked;
            await note.save();
        } else {
            note = await Note.create({ userId, lessonId, content: content || '', title, highlights, tags, isBookmarked });
        }
        res.json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle bookmark
export const toggleBookmark = async (req, res) => {
    try {
        const userId = req.user._id;
        const { lessonId } = req.params;
        let note = await Note.findOne({ userId, lessonId });
        if (!note) {
            note = await Note.create({ userId, lessonId, content: '', isBookmarked: true });
        } else {
            note.isBookmarked = !note.isBookmarked;
            await note.save();
        }
        res.json({ success: true, data: { isBookmarked: note.isBookmarked } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete note
export const deleteNote = async (req, res) => {
    try {
        const userId = req.user._id;
        const { lessonId } = req.params;
        await Note.findOneAndDelete({ userId, lessonId });
        res.json({ success: true, message: "Note deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
