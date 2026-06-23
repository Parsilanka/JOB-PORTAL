const Job = require('../models/Job');

// Advanced job search
exports.advancedSearch = async (filters) => {
  try {
    const {
      keyword,
      location,
      jobType,
      category,
      salaryMin,
      salaryMax,
      skills,
      experience,
      sortBy = 'createdAt',
      sortOrder = -1,
      page = 1,
      limit = 10
    } = filters;

    const query = { status: 'active' };

    // Keyword search
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }

    // Category filter
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      query['salary.min'] = query['salary.min'] || {};
      query['salary.max'] = query['salary.max'] || {};
      
      if (salaryMin) {
        query['salary.max'] = { $gte: salaryMin };
      }
      if (salaryMax) {
        query['salary.min'] = { $lte: salaryMax };
      }
    }

    // Skills filter
    if (skills && skills.length > 0) {
      query.skills = { $in: skills };
    }

    // Experience filter
    if (experience) {
      query.experience = { $lte: experience };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    // Execute query
    const jobs = await Job.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('postedBy', 'fullName companyName profilePicture');

    const total = await Job.countDocuments(query);

    return {
      jobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

// Get job categories
exports.getCategories = async () => {
  try {
    const categories = await Job.distinct('category');
    return categories.sort();
  } catch (error) {
    throw error;
  }
};

// Get job locations
exports.getLocations = async () => {
  try {
    const locations = await Job.distinct('location');
    return locations.sort();
  } catch (error) {
    throw error;
  }
};

// Get trending skills
exports.getTrendingSkills = async () => {
  try {
    const skills = await Job.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    return skills.map(s => ({ skill: s._id, count: s.count }));
  } catch (error) {
    throw error;
  }
};

// Get job statistics
exports.getJobStatistics = async () => {
  try {
    const totalJobs = await Job.countDocuments({ status: 'active' });
    
    const jobsByType = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$jobType', count: { $sum: 1 } } }
    ]);

    const jobsByCategory = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const jobsByLocation = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      totalJobs,
      jobsByType,
      jobsByCategory,
      jobsByLocation
    };
  } catch (error) {
    throw error;
  }
};
