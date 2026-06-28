/**
 * Validate prompt data before creating or updating
 * This function checks if all required fields are present and valid
 * @param {Object} promptData - The prompt data to validate
 * @returns {Object} - Object with isValid boolean and errors array
 */
function validatePrompt(promptData) {
  // Array to store validation error messages
  const errors = [];

  // Define required fields that must be present
  const requiredFields = [
    "title",
    "description",
    "content",
    "category",
    "aiTool",
    "difficultyLevel",
    "thumbnail",
    "visibility",
    "creatorId",
  ];

  // Check each required field
  // Loop through the requiredFields array and check if each field exists in promptData
  requiredFields.forEach((field) => {
    // Check if the field is missing or empty
    if (!promptData[field] || promptData[field].trim() === "") {
      // Add an error message for the missing field
      errors.push(`${field} is required`);
    }
  });

  // Check if title is a string and has reasonable length
  if (promptData.title && typeof promptData.title !== "string") {
    errors.push("title must be a string");
  }

  // Check if description is a string
  if (promptData.description && typeof promptData.description !== "string") {
    errors.push("description must be a string");
  }

  // Check if content is a string
  if (promptData.content && typeof promptData.content !== "string") {
    errors.push("content must be a string");
  }

  // Check if tags is an array (if provided)
  if (promptData.tags && !Array.isArray(promptData.tags)) {
    errors.push("tags must be an array");
  }

  // Check if copyCount is a number (if provided)
  if (promptData.copyCount && typeof promptData.copyCount !== "number") {
    errors.push("copyCount must be a number");
  }

  // Check if reviews is an array (if provided)
  if (promptData.reviews && !Array.isArray(promptData.reviews)) {
    errors.push("reviews must be an array");
  }

  // Return validation result
  // If errors array is empty, the data is valid
  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Validate review data before adding to prompt
 * This function checks if review data is valid
 * @param {Object} reviewData - The review data to validate
 * @returns {Object} - Object with isValid boolean and errors array
 */
function validateReview(reviewData) {
  // Array to store validation error messages
  const errors = [];

  // Define required fields for a review
  const requiredFields = ["userId", "userName", "rating", "comment"];

  // Check each required field
  requiredFields.forEach((field) => {
    // Check if the field is missing or empty
    if (!reviewData[field] || reviewData[field].trim() === "") {
      // Add an error message for the missing field
      errors.push(`${field} is required`);
    }
  });

  // Check if rating is a number and between 1 and 5
  if (reviewData.rating) {
    const rating = Number(reviewData.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.push("rating must be a number between 1 and 5");
    }
  }

  // Return validation result
  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

// Export the validation functions so they can be used in other files
module.exports = {
  validatePrompt,
  validateReview,
};
