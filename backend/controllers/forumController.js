import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// ==================== POST CONTROLLERS ====================

// Get all posts (with filters)
export const getPosts = async (req, res) => {
    try {
        const { category, sort, page = 1, limit = 10, search } = req.query;

        const filter = { isApproved: true };
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (search) {
            filter.$text = { $search: search };
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') {
            sortOption = { upvotes: -1, createdAt: -1 };
        } else if (sort === 'views') {
            sortOption = { views: -1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await Post.find(filter)
            .populate('author', 'name email')
            .sort({ isPinned: -1, ...sortOption })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments(filter);

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    total
                }
            }
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single post with comments
export const getPost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId)
            .populate('author', 'name email');

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Increment view count
        post.views += 1;
        await post.save();

        // Get comments for this post
        const comments = await Comment.find({ postId, parentComment: null, isDeleted: false })
            .populate('author', 'name email')
            .sort({ isAcceptedAnswer: -1, upvotes: -1, createdAt: 1 });

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({
                    parentComment: comment._id,
                    isDeleted: false
                })
                    .populate('author', 'name email')
                    .sort({ createdAt: 1 });

                return {
                    ...comment.toObject(),
                    replies,
                    voteScore: comment.upvotes.length - comment.downvotes.length
                };
            })
        );

        res.json({
            success: true,
            data: {
                ...post.toObject(),
                voteScore: post.upvotes.length - post.downvotes.length,
                comments: commentsWithReplies
            }
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new post
export const createPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title, content, category, tags, lessonId } = req.body;

        const post = await Post.create({
            author: userId,
            title,
            content,
            category: category || 'general',
            tags: tags || [],
            lessonId: lessonId || null
        });

        await post.populate('author', 'name email');

        res.status(201).json({ success: true, data: post });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a post
export const updatePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;
        const { title, content, category, tags } = req.body;

        const post = await Post.findOne({ _id: postId, author: userId });
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found or unauthorized" });
        }

        if (title) post.title = title;
        if (content) post.content = content;
        if (category) post.category = category;
        if (tags) post.tags = tags;

        await post.save();
        res.json({ success: true, data: post });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a post
export const deletePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;

        const post = await Post.findOne({ _id: postId, author: userId });
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found or unauthorized" });
        }

        // Delete associated comments
        await Comment.deleteMany({ postId });
        await post.deleteOne();

        res.json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Vote on a post
export const votePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;
        const { voteType } = req.body; // 'up' or 'down'

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Remove existing votes from this user
        post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
        post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());

        // Add new vote
        if (voteType === 'up') {
            post.upvotes.push(userId);
        } else if (voteType === 'down') {
            post.downvotes.push(userId);
        }

        await post.save();

        // Notify author if upvoted
        if (voteType === 'up' && post.author.toString() !== userId.toString()) {
            await Notification.create({
                userId: post.author,
                type: 'forum',
                title: 'Your post received an upvote! 👍',
                message: `Someone upvoted your post: "${post.title}"`,
                icon: '👍',
                link: `/forum/post/${post._id}`
            });
        }

        res.json({
            success: true,
            data: {
                voteScore: post.upvotes.length - post.downvotes.length
            }
        });
    } catch (error) {
        console.error("Error voting on post:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark post as resolved
export const markResolved = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;

        const post = await Post.findOne({ _id: postId, author: userId });
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found or unauthorized" });
        }

        post.isResolved = !post.isResolved;
        await post.save();

        res.json({ success: true, data: post });
    } catch (error) {
        console.error("Error marking post as resolved:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== COMMENT CONTROLLERS ====================

// Add a comment to a post
export const addComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;
        const { content, parentComment } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        let depth = 0;
        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (parent) {
                depth = Math.min(parent.depth + 1, 3);
            }
        }

        const comment = await Comment.create({
            postId,
            author: userId,
            content,
            parentComment: parentComment || null,
            depth
        });

        // Update comment count on post
        post.commentCount += 1;
        await post.save();

        await comment.populate('author', 'name email');

        // Notify post author
        if (post.author.toString() !== userId.toString()) {
            await Notification.create({
                userId: post.author,
                type: 'forum',
                title: 'New comment on your post 💬',
                message: `Someone commented on: "${post.title}"`,
                icon: '💬',
                link: `/forum/post/${post._id}`
            });
        }

        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Vote on a comment
export const voteComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { commentId } = req.params;
        const { voteType } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId.toString());
        comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId.toString());

        if (voteType === 'up') {
            comment.upvotes.push(userId);
        } else if (voteType === 'down') {
            comment.downvotes.push(userId);
        }

        await comment.save();

        res.json({
            success: true,
            data: {
                voteScore: comment.upvotes.length - comment.downvotes.length
            }
        });
    } catch (error) {
        console.error("Error voting on comment:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark comment as accepted answer
export const acceptAnswer = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId, commentId } = req.params;

        const post = await Post.findOne({ _id: postId, author: userId });
        if (!post) {
            return res.status(404).json({ success: false, message: "Only post author can accept answers" });
        }

        // Remove accepted status from other comments
        await Comment.updateMany({ postId }, { isAcceptedAnswer: false });

        // Mark this comment as accepted
        const comment = await Comment.findByIdAndUpdate(
            commentId,
            { isAcceptedAnswer: true },
            { new: true }
        );

        // Notify comment author
        if (comment.author.toString() !== userId.toString()) {
            await Notification.create({
                userId: comment.author,
                type: 'forum',
                title: 'Your answer was accepted! ✅',
                message: `Your answer on "${post.title}" was marked as the solution!`,
                icon: '✅',
                link: `/forum/post/${post._id}`
            });
        }

        res.json({ success: true, data: comment });
    } catch (error) {
        console.error("Error accepting answer:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { commentId } = req.params;

        const comment = await Comment.findOne({ _id: commentId, author: userId });
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found or unauthorized" });
        }

        comment.isDeleted = true;
        comment.content = "[deleted]";
        await comment.save();

        // Update comment count on post
        await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });

        res.json({ success: true, message: "Comment deleted" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get forum categories with post counts
export const getCategories = async (req, res) => {
    try {
        const categories = await Post.aggregate([
            { $match: { isApproved: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const categoryInfo = {
            general: { name: 'General', icon: '💬', description: 'General discussions' },
            javascript: { name: 'JavaScript', icon: '🟨', description: 'JavaScript questions and tips' },
            python: { name: 'Python', icon: '🐍', description: 'Python programming' },
            react: { name: 'React', icon: '⚛️', description: 'React.js discussions' },
            node: { name: 'Node.js', icon: '🟢', description: 'Node.js backend' },
            database: { name: 'Database', icon: '🗄️', description: 'Database and SQL' },
            career: { name: 'Career', icon: '💼', description: 'Career advice' },
            help: { name: 'Help', icon: '🆘', description: 'Ask for help' }
        };

        const result = categories.map(cat => ({
            id: cat._id,
            ...categoryInfo[cat._id],
            postCount: cat.count
        }));

        res.json({ success: true, data: result });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
