const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Telugu-Net API Documentation",
    version: "1.2.0",
    description: "📘 Definitive 1:1 Production API Documentation. Every endpoint, parameter, and response schema exactly as implemented in the backend.",
  },
  servers: [
    { url: "https://telugu-net-backend-3.onrender.com", description: "Production Server" },
    { url: "http://localhost:5000", description: "Local Development Server" },
    
  ],
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Auth", description: "Authentication & Onboarding" },
    { name: "User", description: "Customer Home & Profile" },
    { name: "Merchant", description: "Business Operations & Discovery" },
    { name: "Payments", description: "Financial Settlement (QR / Razorpay)" },
    { name: "Wallet", description: "User Capital & Recharges" },
    { name: "Ads", description: "Local Advertising Campaigns" },
    { name: "Notifications", description: "Push & In-app Alerts" },
    { name: "Admin", description: "Platform Governance & Analytics" },
    { name: "Transactions", description: "Financial History" },
    { name: "FAQs", description: "Support & Help" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      StandardResponse: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation successful" },
        },
      },
      AuthResponseData: {
        type: "object",
        properties: {
          token: { type: "string" },
          refreshToken: { type: "string" },
          isProfileComplete: { type: "boolean" },
        },
      },
      UserProfile: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["user", "merchant", "admin"] },
          walletBalance: { type: "number" },
          isProfileComplete: { type: "boolean" },
          dateOfBirth: { type: "string", format: "date" },
          address: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          pincode: { type: "string" },
        },
      },
      MerchantProfile: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          shop_name: { type: "string" },
          category: { type: "string" },
          isApproved: { type: "boolean" },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          businessDetails: {
            type: "object",
            properties: {
              address: { type: "string" },
              city: { type: "string" },
              state: { type: "string" },
              pincode: { type: "string" },
            },
          },
          bankDetails: {
            type: "object",
            properties: {
              accountHolder: { type: "string" },
              bankName: { type: "string" },
              accountNumber: { type: "string" },
              ifscCode: { type: "string" },
            },
          },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          _id: { type: "string" },
          refId: { type: "string" },
          amount: { type: "number" },
          type: { type: "string", enum: ["credit", "debit", "recharge", "payment", "withdrawal"] },
          direction: { type: "string", enum: ["credit", "debit"] },
          status: { type: "string", enum: ["pending", "success", "failed"] },
          createdAt: { type: "string", format: "date-time" },
          meta: { type: "object" },
        },
      },
      Ad: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          media: { type: "array", items: { type: "string" } },
          category: { type: "string" },
          location: { type: "string" },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          isPremium: { type: "boolean" },
        },
      },
      Notification: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          body: { type: "string" },
          isRead: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      FAQ: {
        type: "object",
        properties: {
          _id: { type: "string" },
          question: { type: "string" },
          answer: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/auth/request-otp": {
      post: {
        tags: ["Auth"],
        summary: "Request login/register OTP",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["phone"], properties: { phone: { type: "string", example: "9876543210" } } } } },
        },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Verify OTP and get JWT",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["phone", "otp"], properties: { phone: { type: "string", example: "9876543210" }, otp: { type: "string", example: "123456" } } } } },
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/StandardResponse" },
                    { type: "object", properties: { data: { $ref: "#/components/schemas/AuthResponseData" } } },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh Access Token",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string" } } } } },
        },
        responses: { 200: { content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" } } } } } } },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout and Revoke Session",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string" } } } } },
        },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/user/profile": {
      get: {
        tags: ["User"],
        summary: "Get My Profile",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/UserProfile" } } }] } } } } },
      },
      patch: {
        tags: ["User"],
        summary: "Update Profile Info",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, dob: { type: "string", format: "date" }, address: { type: "string" }, city: { type: "string" }, state: { type: "string" }, pincode: { type: "string" } } } } },
        },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/user/profile/complete": {
      patch: {
        tags: ["User"],
        summary: "Complete User Onboarding",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "dateOfBirth", "address", "city", "state", "pincode"],
                properties: { fullName: { type: "string" }, email: { type: "string" }, dateOfBirth: { type: "string", format: "date" }, address: { type: "string" }, city: { type: "string" }, state: { type: "string" }, pincode: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/user/profile/upload": {
      post: {
        tags: ["User"],
        summary: "Upload Profile Image",
        requestBody: { content: { "multipart/form-data": { schema: { type: "object", properties: { image: { type: "string", format: "binary" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/user/fcm-token": {
      post: {
        tags: ["User"],
        summary: "Update Push Token",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["fcmToken"], properties: { fcmToken: { type: "string" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/user/settings": {
      get: {
        tags: ["User"],
        summary: "Get User Settings",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "object" } } }] } } } } },
      },
      patch: {
        tags: ["User"],
        summary: "Update User Settings",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { notifications: { type: "object" }, privacy: { type: "object" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/user/home": {
      get: {
        tags: ["User"],
        summary: "Get Home Data",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "object" } } }] } } } } },
      },
    },
    "/user/my-plan": {
      get: {
        tags: ["User"],
        summary: "Get Active Plan Details",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "object" } } }] } } } } },
      },
    },
    "/user/referral": {
      get: {
        tags: ["User"],
        summary: "Get Referral Info",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "object" } } }] } } } } },
      },
    },
    "/user/offers": {
      get: {
        tags: ["User"],
        summary: "Get Platform Offers",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { type: "object" } } } }] } } } } },
      },
    },
    "/user/nearby-shops": {
      get: {
        tags: ["User"],
        summary: "Find Nearby Shops",
        parameters: [{ name: "lat", in: "query", schema: { type: "number" } }, { name: "lng", in: "query", schema: { type: "number" } }, { name: "category", in: "query", schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { type: "object" } } } }] } } } } },
      },
    },
    "/api/merchants/send-otp": {
      post: {
        tags: ["Merchant"],
        summary: "Request Merchant OTP",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["phone"], properties: { phone: { type: "string", example: "9876543210" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/merchants/verify-otp": {
      post: {
        tags: ["Merchant"],
        summary: "Verify Merchant OTP",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["phone", "otp"], properties: { phone: { type: "string" }, otp: { type: "string" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "object" } } }] } } } } },
      },
    },
    "/api/merchants/register": {
      post: {
        tags: ["Merchant"],
        summary: "Merchant Registration",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["shop_name", "category", "phone", "password"],
                properties: { shop_name: { type: "string" }, category: { type: "string" }, phone: { type: "string" }, password: { type: "string" } },
              },
            },
          },
        },
        responses: { 201: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/merchants/profile": {
      get: {
        tags: ["Merchant"],
        summary: "Get Merchant Profile",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/MerchantProfile" } } }] } } } } },
      },
      patch: {
        tags: ["Merchant"],
        summary: "Update Merchant Info",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { shop_name: { type: "string" }, category: { type: "string" }, bank_details: { type: "object" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/merchants/business-settings": {
      patch: {
        tags: ["Merchant"],
        summary: "Update Address & Pincode",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { address: { type: "string" }, city: { type: "string" }, state: { type: "string" }, pincode: { type: "string" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/merchants/verification-status": {
      get: {
        tags: ["Merchant"],
        summary: "Get KYB Status",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "object" } } }] } } } } },
      },
    },
    "/api/merchants/notifications": {
      patch: {
        tags: ["Merchant"],
        summary: "Update Merchant Notifications",
        requestBody: { content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/merchants/dashboard": {
      get: {
        tags: ["Merchant"],
        summary: "Get Merchant Dashboard",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "object" } } }] } } } } },
      },
    },
    "/api/merchants/transactions": {
      get: {
        tags: ["Merchant"],
        summary: "Get Merchant Transactions",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Transaction" } } } }] } } } } },
      },
    },
    "/api/merchants/wallet": {
      get: {
        tags: ["Merchant"],
        summary: "Get Merchant Wallet",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "object" } } }] } } } } },
      },
    },
    "/api/merchants/request-withdrawal": {
      post: {
        tags: ["Merchant"],
        summary: "Request Fund Withdrawal",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["amount"], properties: { amount: { type: "number" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/merchants/qr-code": {
      get: {
        tags: ["Merchant"],
        summary: "Get Merchant Payment QR",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "object" } } }] } } } } },
      },
    },
    "/api/merchants/ads": {
      get: {
        tags: ["Merchant"],
        summary: "List My Ads",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Ad" } } } }] } } } } },
      },
      post: {
        tags: ["Merchant"],
        summary: "Create Merchant Ad",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title", "media"], properties: { title: { type: "string" }, media: { type: "array", items: { type: "string" } }, isPremium: { type: "boolean" } } } } } },
        responses: { 201: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/merchants/ads/{adId}": {
      get: {
        tags: ["Merchant"],
        summary: "Get Ad Details",
        parameters: [{ name: "adId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Ad" } } }] } } } } },
      },
      patch: {
        tags: ["Merchant"],
        summary: "Update Ad",
        parameters: [{ name: "adId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
      delete: {
        tags: ["Merchant"],
        summary: "Delete Ad",
        parameters: [{ name: "adId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/merchants/login-activity": {
      get: {
        tags: ["Merchant"],
        summary: "Get Recent Logins",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { type: "object" } } } }] } } } } },
      },
    },
    "/api/merchants/terms": {
      get: {
        tags: ["Merchant"],
        summary: "Get Terms & Conditions",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "object" } } }] } } } } },
      },
    },
    "/api/wallet/": {
      get: {
        tags: ["Wallet"],
        summary: "Check Balance",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "number", example: 1250.5 } } }] } } } } },
      },
    },
    "/api/wallet/recharge/create-order": {
      post: {
        tags: ["Wallet"],
        summary: "Initiate Recharge",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["amount"], properties: { amount: { type: "number" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { type: "object", properties: { orderId: { type: "string" } } } } } } },
      },
    },
    "/api/wallet/recharge/verify": {
      post: {
        tags: ["Wallet"],
        summary: "Verify Recharge",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"], properties: { razorpay_order_id: { type: "string" }, razorpay_payment_id: { type: "string" }, razorpay_signature: { type: "string" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/wallet/pay": {
      post: {
        tags: ["Wallet"],
        summary: "Wallet Payment",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["merchantId", "amount"], properties: { merchantId: { type: "string" }, amount: { type: "number" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/ads/": {
      get: {
        tags: ["Ads"],
        summary: "List All Ads",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Ad" } } } }] } } } } },
      },
      post: {
        tags: ["Ads"],
        summary: "Create Ad",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title", "media"], properties: { title: { type: "string" }, media: { type: "array", items: { type: "string" } } } } } } },
        responses: { 201: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/ads/premium": {
      get: {
        tags: ["Ads"],
        summary: "List Premium Ads",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Ad" } } } }] } } } } },
      },
    },
    "/api/ads/my-ads": {
      get: {
        tags: ["Ads"],
        summary: "My Posted Ads",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Ad" } } } }] } } } } },
      },
    },
    "/api/ads/{adId}/review": {
      patch: {
        tags: ["Ads"],
        summary: "Review Advertisement",
        parameters: [{ name: "adId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["approved", "rejected"] }, note: { type: "string" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/notifications/": {
      get: {
        tags: ["Notifications"],
        summary: "My Inbox",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Notification" } } } }] } } } } },
      },
    },
    "/api/notifications/{id}/read": {
      put: {
        tags: ["Notifications"],
        summary: "Mark as Read",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/notifications/read-all": {
      put: {
        tags: ["Notifications"],
        summary: "Mark All as Read",
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/notifications/{id}": {
      delete: {
        tags: ["Notifications"],
        summary: "Delete Message",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/notifications/broadcast": {
      post: {
        tags: ["Notifications"],
        summary: "Send Admin Broadcast",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title", "body"], properties: { title: { type: "string" }, body: { type: "string" }, target: { type: "string", enum: ["all", "users", "merchants"] } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/admin/login": {
      post: {
        tags: ["Admin"],
        summary: "Admin Secure Login",
        security: [],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "Manage Users",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/UserProfile" } } } }] } } } } },
      },
    },
    "/api/admin/users/{userId}/approve": {
      put: {
        tags: ["Admin"],
        summary: "Approve User",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/admin/users/{userId}/deactivate": {
      put: {
        tags: ["Admin"],
        summary: "Suspend User",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/admin/merchants": {
      get: {
        tags: ["Admin"],
        summary: "Manage Merchants",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/MerchantProfile" } } } }] } } } } },
      },
    },
    "/api/admin/merchants/{merchantId}/approve": {
      put: {
        tags: ["Admin"],
        summary: "Approve Business",
        parameters: [{ name: "merchantId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/admin/merchants/{merchantId}/reject": {
      put: {
        tags: ["Admin"],
        summary: "Reject Business",
        parameters: [{ name: "merchantId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/admin/revenue": {
      get: {
        tags: ["Admin"],
        summary: "Revenue Reports",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "object" } } }] } } } } },
      },
    },
    "/api/admin/analytics": {
      get: {
        tags: ["Admin"],
        summary: "Platform Analytics",
        responses: { 200: { content: { "application/json": { schema: { type: "object", properties: { data: { type: "object" } } } } } } },
      },
    },
    "/api/admin/ads/pending": {
      get: {
        tags: ["Admin"],
        summary: "Review Pending Ads",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Ad" } } } }] } } } } },
      },
    },
    "/api/admin/ads/{adId}/approve": {
      put: {
        tags: ["Admin"],
        summary: "Approve Ad",
        parameters: [{ name: "adId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/admin/ads/{adId}/reject": {
      put: {
        tags: ["Admin"],
        summary: "Reject Ad",
        parameters: [{ name: "adId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/admin/withdrawals/pending": {
      get: {
        tags: ["Admin"],
        summary: "Pending Payouts",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { type: "object" } } } }] } } } } },
      },
    },
    "/api/admin/withdrawals/{id}/settle": {
      post: {
        tags: ["Admin"],
        summary: "Settle Fund Transfer",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["action"], properties: { action: { type: "string", enum: ["approve", "reject"] } } } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/payments/qr/initiate": {
      post: {
        tags: ["Payments"],
        summary: "Initiate QR Order",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["merchantId", "amount"], properties: { merchantId: { type: "string" }, amount: { type: "number" } } } } } },
        responses: { 200: { content: { "application/json": { schema: { type: "object", properties: { orderId: { type: "string" } } } } } } },
      },
    },
    "/api/payments/qr/verify": {
      post: {
        tags: ["Payments"],
        summary: "Confirm QR Payment",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["orderId", "paymentId", "signature"] } } } },
        responses: { 200: { content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } },
      },
    },
    "/api/payments/webhook": {
      post: {
        tags: ["Payments"],
        summary: "Payment Processor Webhook",
        requestBody: { content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "Webhook received" } },
      },
    },
    "/api/transactions/": {
      get: {
        tags: ["Transactions"],
        summary: "Platform Audit Trail",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Transaction" } } } }] } } } } },
      },
    },
    "/api/transactions/audit/{refId}": {
      get: {
        tags: ["Transactions"],
        summary: "Verify Individual Txn",
        parameters: [{ name: "refId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Transaction" } } }] } } } } },
      },
    },
    "/api/faqs/": {
      get: {
        tags: ["FAQs"],
        summary: "Support Knowledge Base",
        responses: { 200: { content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/StandardResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/FAQ" } } } }] } } } } },
      },
    },
  },
};

const swaggerOptions = {
  swaggerOptions: { persistAuthorization: true, displayRequestDuration: true, filter: true },
};

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
  console.log(`📘 Definitive 1:1 API Documentation available at: /api-docs`);
}

module.exports = { swaggerDocs };
