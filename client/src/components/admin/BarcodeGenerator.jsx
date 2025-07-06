import { useState, useRef, useEffect } from 'react';
import { FaBarcode, FaSpinner, FaDownload, FaCopy, FaCheck } from 'react-icons/fa';
import JsBarcode from 'jsbarcode';
import { generateBarcode as generateBarcodeAPI } from '../../api/aiApi';
import { useSelector } from 'react-redux';

const BarcodeGenerator = ({ productId, productName, currentBarcode, onBarcodeGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBarcode, setGeneratedBarcode] = useState(currentBarcode || '');
  const [barcodeType, setBarcodeType] = useState('CODE128');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);
  const { user: userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (generatedBarcode) {
      generateBarcodeImage();
    }
  }, [generatedBarcode, barcodeType]);

  const generateBarcodeImage = () => {
    if (!generatedBarcode || !canvasRef.current) return;

    try {
      JsBarcode(canvasRef.current, generatedBarcode, {
        format: barcodeType,
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 20,
        textMargin: 2,
        fontOptions: "bold"
      });
    } catch (error) {
      console.error('Error generating barcode image:', error);
      setError('Invalid barcode format');
    }
  };

  const generateNewBarcode = async () => {
    if (!productId) {
      setError('Product ID is required to generate barcode');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await generateBarcodeAPI(productId, productName, barcodeType);
      
      if (response.success) {
        setGeneratedBarcode(response.barcode);
        onBarcodeGenerated(response.barcode);
      } else {
        setError('Failed to generate barcode');
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
      setError(error.response?.data?.message || 'Failed to generate barcode');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyBarcode = async () => {
    if (!generatedBarcode) return;

    try {
      await navigator.clipboard.writeText(generatedBarcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy barcode:', error);
    }
  };

  const downloadBarcode = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `barcode-${generatedBarcode}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleManualBarcodeChange = (e) => {
    const value = e.target.value;
    setGeneratedBarcode(value);
    onBarcodeGenerated(value);
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FaBarcode className="text-green-500" size={20} />
          <h4 className="font-medium text-gray-800">Barcode Generator</h4>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={barcodeType}
            onChange={(e) => setBarcodeType(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="CODE128">CODE128</option>
            <option value="EAN13">EAN-13</option>
            <option value="CODE39">CODE39</option>
          </select>
          <button
            onClick={generateNewBarcode}
            disabled={isGenerating || !productId}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <FaSpinner className="animate-spin" size={14} />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FaBarcode size={14} />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Barcode Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Barcode Value
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={generatedBarcode}
              onChange={handleManualBarcodeChange}
              placeholder="Enter or generate barcode"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <button
              onClick={copyBarcode}
              disabled={!generatedBarcode}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-md transition-colors"
              title="Copy barcode"
            >
              {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
            </button>
          </div>
        </div>

        {/* Barcode Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Barcode Preview
          </label>
          <div className="bg-white border border-gray-300 rounded-md p-4 text-center">
            {generatedBarcode ? (
              <div>
                <canvas ref={canvasRef} className="max-w-full"></canvas>
                <button
                  onClick={downloadBarcode}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1 mx-auto"
                >
                  <FaDownload size={12} />
                  <span>Download</span>
                </button>
              </div>
            ) : (
              <div className="text-gray-500 py-8">
                <FaBarcode size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Generate or enter a barcode to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-600 mt-3">
        <p className="mb-1">📊 <strong>Barcode Types:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>CODE128:</strong> Most versatile, supports letters and numbers</li>
          <li><strong>EAN-13:</strong> Standard retail barcode (13 digits)</li>
          <li><strong>CODE39:</strong> Simple format, numbers and some letters</li>
        </ul>
      </div>
    </div>
  );
};

export default BarcodeGenerator;