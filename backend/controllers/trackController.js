import Lesson from "../models/Lesson.js";

export const trackVisit = async (req, res) => {
  try {
    let { itemId } = req.body;
    
    if (!itemId) {
      return res.json({success: false, message: "Lesson ID is required"});
    }
    
    // Extract string ID if an object is passed
    if (typeof itemId === 'object' && itemId._id) {
      itemId = itemId._id;
    }
    
    // Convert to string if it's not already
    itemId = itemId.toString();
    
    const lesson = await Lesson.findById(itemId);
    
    if (!lesson) {
      return res.json({success: false, message: "Lesson not found"});
    }
    
    lesson.visits = (lesson.visits || 0) + 1;
    await lesson.save();
    
    res.json({
      success: true,
      data: { visits: lesson.visits },
      message: "Visit tracked successfully"
    });
    
  } catch (error) {
    res.json({success: false, message: error.message});
    console.log(error.message);
  }
};
