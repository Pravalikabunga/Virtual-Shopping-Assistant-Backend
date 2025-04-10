const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
async function generateShoppingResponse(prompt) {
  try {
    console.log('Generating response for prompt:', prompt);
    console.log('Using API key:', process.env.GOOGLE_API_KEY ? 'API key is set' : 'API key is missing');
    const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"];
    let lastError = null;  
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log('Model initialized');
        const result = await model.generateContent(prompt);
        console.log('Content generated');        
        const response = await result.response;
        console.log('Response received');        
        return response.text();
      } catch (error) {
        console.error(`Error with model ${modelName}:`, error.message);
        lastError = error;
      }
    }
    throw lastError || new Error('All model attempts failed');
  } catch (error) {
    console.error('Gemini API Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to generate shopping response: ${error.message}`);
  }
}
module.exports = {
  generateShoppingResponse
};