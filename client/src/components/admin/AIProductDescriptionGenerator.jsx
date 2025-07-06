import { useState } from 'react';
import { FaRobot, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { generateProductDescription } from '../../api/aiApi';
import { useSelector } from 'react-redux';

const AIProductDescriptionGenerator = ({ productData, onDescriptionGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [error, setError] = useState('');
  const { user: userInfo } = useSelector((state) => state.auth);

  const generateDescription = async () => {
    if (!productData.name || !productData.category) {
      setError('Product name and category are required to generate description');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedDescription('');

    try {
      const response = await generateProductDescription(productData);
      
      if (response.success) {
        setGeneratedDescription(response.description);
      } else {
        setError('Failed to generate description');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      setError(error.response?.data?.message || 'Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptDescription = () => {
    onDescriptionGenerated(generatedDescription);
    setGeneratedDescription('');
  };

  const rejectDescription = () => {
    setGeneratedDescription('');
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FaRobot className="text-blue-500" size={20} />
          <h4 className="font-medium text-gray-800">AI Description Generator</h4>
        </div>
        <button
          onClick={generateDescription}
          disabled={isGenerating || !productData.name || !productData.category}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <FaSpinner className="animate-spin" size={14} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FaRobot size={14} />
              <span>Generate Description</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3">
          {error}
        </div>
      )}

      {generatedDescription && (
        <div className="bg-white border border-gray-200 rounded-md p-4 mb-3">
          <h5 className="font-medium text-gray-800 mb-2">Generated Description:</h5>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {generatedDescription}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={acceptDescription}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <FaCheck size={12} />
              <span>Use This</span>
            </button>
            <button
              onClick={rejectDescription}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <FaTimes size={12} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600">
        <p className="mb-1">💡 <strong>Tip:</strong> Fill in product name, category, and other details for better AI-generated descriptions.</p>
        <p>🤖 The AI will create engaging descriptions based on your product information.</p>
      </div>
    </div>
  );
};

export default AIProductDescriptionGenerator;