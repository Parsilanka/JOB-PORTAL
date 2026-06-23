const axios = require('axios');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessShortCode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.testMode = process.env.MPESA_TEST_MODE === 'true'; // Enable test mode via env variable
    this.authUrl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    this.stkPushUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    this.transactionStatusUrl = 'https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query';
  }

  async getAccessToken() {
    try {
      // In test mode, return a mock token
      if (this.testMode) {
        console.log('M-Pesa TEST MODE: Returning mock access token');
        return 'mock_test_token_' + Date.now();
      }

      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      console.log('Attempting M-Pesa authentication with key:', this.consumerKey.substring(0, 10) + '...');
      const response = await axios.get(this.authUrl, {
        headers: {
          Authorization: `Basic ${auth}`
        },
        timeout: 10000
      });
      return response.data.access_token;
    } catch (error) {
      const errorMsg = error.response?.data?.error_description || error.response?.data || error.message;
      console.error('M-Pesa token error details:', {
        status: error.response?.status,
        data: errorMsg,
        testMode: this.testMode,
        consumerKey: this.consumerKey ? this.consumerKey.substring(0, 10) + '...' : 'NOT SET'
      });
      throw new Error(`Failed to get M-Pesa access token: ${errorMsg}. Enable MPESA_TEST_MODE=true in .env for testing without credentials.`);
    }
  }

  async initiateStkPush(phoneNumber, amount, reference, transactionDesc) {
    try {
      // Validate and format phone number
      let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
      
      // If starts with 0, replace with 254
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      }
      
      // Ensure it starts with 254
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      // Validate length (should be exactly 12 digits)
      if (formattedPhone.length !== 12) {
        return {
          success: false,
          error: `Invalid phone number format: ${phoneNumber}. Must be 10-11 digits.`
        };
      }

      // In test mode, return a mock successful response
      if (this.testMode) {
        console.log('M-Pesa TEST MODE: Simulating STK push for', formattedPhone);
        return {
          success: true,
          data: {
            ResponseCode: '0',
            ResponseDescription: '[TEST MODE] Success. Request accepted for processing',
            CheckoutRequestID: 'ws_CO_DMZ_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            CustomerMessage: '[TEST MODE] Please enter your M-Pesa PIN'
          },
          checkoutRequestId: 'ws_CO_DMZ_' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };
      }

      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: reference,
        TransactionDesc: transactionDesc
      };

      console.log('Initiating STK Push with formatted phone:', formattedPhone);
      const response = await axios.post(this.stkPushUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: response.data.ResponseCode === '0',
        data: response.data,
        checkoutRequestId: response.data.CheckoutRequestID
      };
    } catch (error) {
      console.error('STK Push error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message
      };
    }
  }

  async queryTransactionStatus(transactionId, accountReference) {
    try {
      // In test mode, return a mock successful response
      if (this.testMode) {
        console.log('M-Pesa TEST MODE: Simulating query for transaction', transactionId);
        return {
          ResponseCode: '0',
          ResponseDescription: '[TEST MODE] The service request has been processed successfully.',
          ResultCode: '0',
          ResultDesc: '[TEST MODE] The transaction has been received and is being processed'
        };
      }

      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: transactionId
      };

      const response = await axios.post(this.transactionStatusUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('Query status error:', error.response?.data || error.message);
      return null;
    }
  }

  parseCallback(callbackData) {
    try {
      if (callbackData.Body.stkCallback.ResultCode === 0) {
        const metadata = callbackData.Body.stkCallback.CallbackMetadata.Item;
        let result = {};
        
        metadata.forEach(item => {
          result[item.Name] = item.Value;
        });

        return {
          success: true,
          transactionId: result.MpesaReceiptNumber,
          amount: result.Amount,
          phoneNumber: result.PhoneNumber,
          checkoutRequestId: callbackData.Body.stkCallback.CheckoutRequestID
        };
      }
      return { success: false };
    } catch (error) {
      console.error('Callback parse error:', error);
      return { success: false };
    }
  }
}

module.exports = new MpesaService();
