const axios = require('axios');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessShortCode = process.env.MPESA_SHORT_CODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.authUrl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    this.stkPushUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    this.transactionStatusUrl = 'https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query';
  }

  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      const response = await axios.get(this.authUrl, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });
      return response.data.access_token;
    } catch (error) {
      console.error('M-Pesa token error:', error.response?.data || error.message);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  async initiateStkPush(phoneNumber, amount, reference, transactionDesc) {
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: phoneNumber,
        PartyB: this.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.callbackUrl,
        AccountReference: reference,
        TransactionDesc: transactionDesc
      };

      const response = await axios.post(this.stkPushUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
        }
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
