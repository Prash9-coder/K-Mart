import JsBarcode from 'jsbarcode';

class BarcodeService {
  // Generate barcode for product
  generateBarcode(productId, productName) {
    try {
      // Create a unique barcode based on product ID and timestamp
      const timestamp = Date.now().toString().slice(-6);
      const productCode = productId.toString().slice(-6);
      const barcode = `${productCode}${timestamp}`;
      
      return barcode;
    } catch (error) {
      console.error('Error generating barcode:', error);
      throw new Error('Failed to generate barcode');
    }
  }

  // Generate barcode configuration (client will handle image generation)
  getBarcodeConfig(barcodeValue, options = {}) {
    try {
      const defaultOptions = {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 20,
        textMargin: 2,
        fontOptions: "bold"
      };

      return { ...defaultOptions, ...options };
    } catch (error) {
      console.error('Error generating barcode config:', error);
      throw new Error('Failed to generate barcode configuration');
    }
  }

  // Validate barcode format
  validateBarcode(barcode) {
    try {
      // Basic validation for CODE128 format
      if (!barcode || typeof barcode !== 'string') {
        return false;
      }

      // Check if barcode contains only valid characters
      const validChars = /^[0-9A-Za-z\-\.\ \$\/\+\%]+$/;
      return validChars.test(barcode) && barcode.length >= 6 && barcode.length <= 20;
    } catch (error) {
      console.error('Error validating barcode:', error);
      return false;
    }
  }

  // Generate EAN-13 barcode for retail products
  generateEAN13(countryCode = '890', manufacturerCode, productCode) {
    try {
      // Ensure codes are the right length
      const country = countryCode.padStart(3, '0').slice(0, 3);
      const manufacturer = manufacturerCode.padStart(4, '0').slice(0, 4);
      const product = productCode.padStart(5, '0').slice(0, 5);
      
      // Calculate check digit
      const code = country + manufacturer + product;
      let sum = 0;
      
      for (let i = 0; i < 12; i++) {
        const digit = parseInt(code[i]);
        sum += (i % 2 === 0) ? digit : digit * 3;
      }
      
      const checkDigit = (10 - (sum % 10)) % 10;
      const ean13 = code + checkDigit;
      
      return ean13;
    } catch (error) {
      console.error('Error generating EAN-13:', error);
      throw new Error('Failed to generate EAN-13 barcode');
    }
  }
}

export default new BarcodeService();