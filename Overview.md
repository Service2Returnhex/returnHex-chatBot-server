 # 🤖 **Hex Chat Bot System - Complete Overview**

## **🏗️ System Architecture**

Your application is a **Facebook Messenger Chatbot Platform** that allows businesses to automate customer interactions on Facebook. It's built as a **full-stack TypeScript application** with separate client and server components.

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.8.3-blue.svg)
![License](https://img.shields.io/badge/license-ISC-yellow.svg)

---

## **🖥️ SERVER SIDE (Backend)**

### **Tech Stack:**
- **Node.js + Express.js** with TypeScript
- **MongoDB** with Mongoose ODM
- **Multiple AI Providers**: OpenAI, Google Gemini, DeepSeek, Groq
- **Facebook Graph API v23.0** integration
- **JWT Authentication** with refresh tokens
- **Email functionality** with Nodemailer

### **🔧 Core Features:**

#### **1. Multi-AI Chat Engine**
```
✅ OpenAI GPT integration
✅ Google Gemini API
✅ DeepSeek API  
✅ Groq API
✅ Chat history tracking
✅ Context-aware responses
```

#### **2. Facebook Integration**
```
✅ Webhook verification
✅ Send direct messages
✅ Reply to post comments
✅ Multi-page support
✅ Access token management
```

#### **3. User Management**
```
✅ User registration/login
✅ Role-based access (admin/user)
✅ JWT authentication
✅ Password reset via email
✅ User status management
```

#### **4. Page Management**
```
✅ Facebook page configuration
✅ Custom system prompts (DM & Comments)
✅ Post training data
✅ Token management
✅ On/Off bot control
```

### **📁 Key Database Models:**

1. **User Model**: Stores user accounts with roles
2. **PageInfo Model**: Facebook page credentials & settings
3. **Post Model**: Training data from Facebook posts
4. **ChatHistory**: DM conversation tracking
5. **CommentHistory**: Comment interaction tracking

---

## **🌐 CLIENT SIDE (Frontend)**

### **Tech Stack:**
- **Next.js 15** with TypeScript
- **React 19** with hooks
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Chart.js** for analytics
- **Axios** for API calls

### **🎨 User Interface:**

#### **1. Landing Page**
```
✅ Hero section with live chat demo
✅ Feature showcase cards
✅ Pricing plans ($0 - Premium)
✅ Customer testimonials
✅ Step-by-step setup guide
✅ Image gallery
```

#### **2. Authentication System**
```
✅ Sign up / Sign in
✅ Forget password
✅ Reset password
✅ Change password
✅ Protected routes
```

#### **3. User Dashboard**
```
✅ Token usage analytics
✅ Active pages overview
✅ Daily/Weekly charts
✅ Page management
✅ Usage statistics
```

#### **4. Admin Dashboard**
```
✅ User management
✅ System analytics
✅ Token monitoring
✅ Page oversight
✅ System configuration
```

#### **5. Bot Configuration**
```
✅ Facebook page setup
✅ Webhook configuration
✅ Access token integration
✅ System prompt training
✅ Post data training
✅ Page info management
```

---

## **🔄 How The System Works**

### **Complete Flow:**

1. **User Registration** → Create account → Login → Access dashboard

2. **Page Setup** → 
   - Enter Facebook page details
   - Generate webhook URL
   - Set verify token
   - Add Facebook access token

3. **Webhook Configuration** →
   - Copy generated webhook URL to Facebook
   - Verify webhook connection
   - Enable bot for the page

4. **AI Training** →
   - Train with Facebook posts
   - Set custom system prompts for DM & comments
   - Configure response behavior

5. **Live Operation** →
   - User messages/comments Facebook page
   - Facebook sends webhook to your server
   - Server processes with AI (OpenAI/Gemini/etc.)
   - Bot responds automatically
   - Track analytics & token usage

### **🎯 Key Business Features:**

- **Multi-Tenant**: Support multiple businesses/pages
- **AI-Powered**: Smart responses using multiple AI providers
- **Analytics**: Track usage, performance, costs
- **Training**: Custom prompts & Facebook post data
- **Scalable**: Role-based access, user management
- **Professional**: Dashboard, billing tracking, user support

---

## **🚀 Deployment Ready**

### **Environment Variables Needed:**
```
✅ Database connection
✅ JWT secrets
✅ Multiple AI API keys
✅ Email service (SMTP)
✅ Facebook app credentials
```

### **Production Features:**
```
✅ Error handling & logging
✅ Rate limiting considerations
✅ Token usage tracking
✅ User role management
✅ Webhook security
```

---

## **💡 Summary**

This is a **complete SaaS chatbot platform** that enables businesses to:
- **Automate** Facebook customer service
- **Train** AI with their specific business data
- **Monitor** performance and costs
- **Scale** across multiple Facebook pages
- **Manage** everything through beautiful dashboards

The system is **production-ready** with proper authentication, error handling, and multi-AI provider support. It's essentially a **"Chatbot-as-a-Service"** platform for Facebook Messenger.

**Perfect for**: Marketing agencies, e-commerce stores, service businesses wanting automated Facebook customer support.

---

## **🏗️ Upgraded System Architecture**

### **📱 Complete SaaS Platform Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           🌐 FRONTEND LAYER (Next.js 15)                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │  📄 Landing │  │  🔐 Auth    │  │ 👤 User     │  │      👑 Admin               │ │
│  │     Page    │  │   System    │  │  Dashboard  │  │       Dashboard             │ │
│  │             │  │             │  │             │  │                             │ │
│  │ • Hero Demo │  │ • Login     │  │ • Token     │  │ • User Management           │ │
│  │ • Features  │  │ • Register  │  │   Analytics │  │ • System Analytics          │ │
│  │ • Pricing   │  │ • Reset PWD │  │ • Page List │  │ • Global Monitoring         │ │
│  │ • Testimonial│ │ • Change    │  │ • Configure │  │ • Token Management          │ │
│  │ • Gallery   │  │   Password  │  │   Bot       │  │ • Performance Metrics       │ │
│  │ • Blog      │  │ • Protected │  │ • Train AI  │  │ • Revenue Tracking          │ │
│  │             │  │   Routes    │  │ • Billing   │  │ • System Health             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                          ⬇ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        🖥️ BACKEND LAYER (Express.js + TypeScript)                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │ 🔐 Auth     │  │ 📄 Page     │  │ 🤖 Multi-AI │  │    📘 Facebook              │ │
│  │   System    │  │ Management  │  │  Processing │  │      Integration            │ │
│  │             │  │             │  │             │  │                             │ │
│  │ • JWT       │  │ • CRUD Ops  │  │ • OpenAI    │  │ • Webhook Verification      │ │
│  │ • Sessions  │  │ • Training  │  │ • Gemini    │  │ • Message Handler           │ │
│  │ • Refresh   │  │ • Prompts   │  │ • DeepSeek  │  │ • Comment Reply             │ │
│  │ • Roles     │  │ • Settings  │  │ • Groq      │  │ • Multi-Page Support        │ │
│  │ • Reset     │  │ • Analytics │  │ • Context   │  │ • Token Management          │ │
│  │ • Validate  │  │ • Posts     │  │ • History   │  │ • Rate Limiting             │ │
│  │             │  │ • Status    │  │ • Routing   │  │ • Error Handling            │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                          ⬇ Database Operations
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             💾 DATABASE LAYER (MongoDB)                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │ 👥 Users    │  │ 📄 PageInfo │  │ 📝 Posts &  │  │      💬 Conversations       │ │
│  │   Model     │  │    Model    │  │   Training  │  │         History             │ │
│  │             │  │             │  │    Model    │  │                             │ │
│  │ • User Data │  │ • Shop ID   │  │ • FB Posts  │  │ • ChatHistory               │ │
│  │ • Roles     │  │ • Page Name │  │ • Training  │  │ • CommentHistory            │ │
│  │ • Status    │  │ • Tokens    │  │   Content   │  │ • Message Context           │ │
│  │ • Auth Info │  │ • Settings  │  │ • Custom    │  │ • User Sessions             │ │
│  │ • Created   │  │ • Prompts   │  │   Prompts   │  │ • Response Analytics        │ │
│  │ • Updated   │  │ • Category  │  │ • Metadata  │  │ • Token Usage               │ │
│  │             │  │ • Verified  │  │             │  │ • Performance Logs          │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    ⬇ External API Integrations
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           🌍 EXTERNAL SERVICES INTEGRATION                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │ 📘 Facebook │  │ 🤖 AI       │  │ 📧 Email    │  │     ☁️ Infrastructure        │ │
│  │   Graph API │  │  Providers  │  │   Services  │  │        & Hosting            │ │
│  │             │  │             │  │             │  │                             │ │
│  │ • v23.0 API │  │ • OpenAI    │  │ • SMTP      │  │ • Server Hosting            │ │
│  │ • Webhooks  │  │   GPT-4     │  │ • Nodemailer│  │ • Database Cloud            │ │
│  │ • Messenger │  │ • Google    │  │ • Password  │  │ • CDN Services              │ │
│  │ • Pages API │  │   Gemini    │  │   Reset     │  │ • SSL Certificates          │ │
│  │ • Posts API │  │ • DeepSeek  │  │ • Templates │  │ • Load Balancing            │ │
│  │ • Comments  │  │   AI        │  │ • Delivery  │  │ • Monitoring Tools          │ │
│  │ • Messages  │  │ • Groq      │  │   Status    │  │ • Backup Systems            │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### **🔄 Enhanced Database Flow**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              💾 DATABASE ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

        Facebook Pages                    Training & AI                    User Management
    ┌─────────────────────┐          ┌─────────────────────┐           ┌─────────────────────┐
    │     📄 PageInfo     │          │    📝 Posts &       │           │      👥 Users       │
    │     Collection      │          │     Training        │           │     Collection      │
    │                     │          │    Collection       │           │                     │
    │ • shopId (unique)   │◄────────►│ • shopId (ref)      │           │ • _id               │
    │ • pageName          │          │ • postContent       │           │ • name              │
    │ • accessToken       │          │ • trainingData      │           │ • email (unique)    │
    │ • verifyToken       │          │ • dmSystemPrompt    │◄─────────►│ • role (admin/user) │
    │ • dmSystemPrompt    │          │ • cmntSystemPrompt  │           │ • password (hashed) │
    │ • cmntSystemPrompt  │          │ • isActive          │           │ • status            │
    │ • isVerified        │          │ • createdAt         │           │ • createdAt         │
    │ • isStarted         │          │ • updatedAt         │           │ • isDeleted         │
    │ • pageCategory      │          └─────────────────────┘           └─────────────────────┘
    │ • address           │                     │                                │
    │ • phone             │                     │                                │
    │ • email             │                     ▼                                ▼
    └─────────────────────┘           ┌─────────────────────┐           ┌─────────────────────┐
               │                      │   💬 ChatHistory    │           │  🔐 RefreshTokens   │
               │                      │    Collection       │           │     Collection      │
               │                      │                     │           │                     │
               │                      │ • userId            │           │ • userId (ref)      │
               │                      │ • messages[]        │           │ • token             │
               │                      │   - role            │           │ • isValid           │
               │                      │   - content         │           │ • expiresAt         │
               │                      │   - timestamp       │           │ • createdAt         │
               │                      │ • shopId (ref)      │           └─────────────────────┘
               │                      │ • createdAt         │
               │                      │ • updatedAt         │
               │                      └─────────────────────┘
               │                                │
               ▼                                ▼
    ┌─────────────────────┐           ┌─────────────────────┐
    │  💬 CommentHistory  │           │   📊 TokenUsage     │
    │    Collection       │           │   (Future Model)    │
    │                     │           │                     │
    │ • commenterId       │           │ • userId (ref)      │
    │ • shopId (ref)      │           │ • shopId (ref)      │
    │ • messages[]        │           │ • provider          │
    │   - role            │           │ • tokensUsed        │
    │   - content         │           │ • cost              │
    │   - timestamp       │           │ • date              │
    │ • createdAt         │           │ • requestType       │
    │ • updatedAt         │           └─────────────────────┘
    └─────────────────────┘
```

### **🚀 Enhanced Request Flow**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              🔄 COMPLETE REQUEST FLOW                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

    👤 User                    📘 Facebook                🖥️ Your Server               🤖 AI Provider
      │                           │                           │                           │
      │ 1. Sends Message          │                           │                           │
      │ ─────────────────────────►│                           │                           │
      │                           │ 2. Webhook POST           │                           │
      │                           │ ─────────────────────────►│                           │
      │                           │                           │ 3. Verify Webhook        │
      │                           │                           │ ─────────────────────────►│
      │                           │                           │ ◄─────────────────────────│
      │                           │                           │ 4. Validate Request       │
      │                           │                           │                           │
      │                           │                           │ 5. Check Rate Limit      │
      │                           │                           │ (IP + User tracking)     │
      │                           │                           │                           │
      │                           │                           │ 6. Get Shop Info          │
      │                           │                           │ (PageInfo.findOne)       │
      │                           │                           │                           │
      │                           │                           │ 7. Load Chat History     │
      │                           │                           │ (ChatHistory.findOne)    │
      │                           │                           │                           │
      │                           │                           │ 8. Get Training Data     │
      │                           │                           │ (Posts + Custom Prompts) │
      │                           │                           │                           │
      │                           │                           │ 9. Build AI Context      │
      │                           │                           │ (System + User prompts)  │
      │                           │                           │                           │
      │                           │                           │ 10. Send to AI Provider  │
      │                           │                           │ ─────────────────────────►│
      │                           │                           │ ◄─────────────────────────│
      │                           │                           │ 11. Receive AI Response  │
      │                           │                           │                           │
      │                           │                           │ 12. Save to History      │
      │                           │                           │ (Update ChatHistory)     │
      │                           │                           │                           │
      │                           │                           │ 13. Track Token Usage    │
      │                           │                           │ (Analytics & Billing)    │
      │                           │                           │                           │
      │                           │ 14. Send Response         │                           │
      │                           │ ◄─────────────────────────│                           │
      │ 15. Receives Reply        │                           │                           │
      │ ◄─────────────────────────│                           │                           │

    📊 Analytics & Monitoring:
    ├── Response Time Tracking
    ├── Error Rate Monitoring  
    ├── Token Usage Analytics
    ├── User Engagement Metrics
    └── System Performance Logs
```

### **⚡ AI Provider Routing Logic**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           🤖 MULTI-AI PROVIDER ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

    Incoming Request
           │
           ▼
    ┌─────────────┐
    │   Router    │ ──► Current: ChatGPT (Primary)
    │  Selection  │     Future: User Configurable
    └─────────────┘
           │
           ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                 AI Provider Options                         │
    ├─────────────┬─────────────┬─────────────┬─────────────────┤
    │   OpenAI    │   Gemini    │  DeepSeek   │      Groq       │
    │   ChatGPT   │             │             │                 │
    │             │             │             │                 │
    │ • GPT-4     │ • Gemini    │ • DeepSeek  │ • Llama Models  │
    │ • Context   │   Pro       │   Chat      │ • Fast Inference│
    │ • Training  │ • Multi     │ • Code      │ • Real-time     │
    │ • Reliable  │   Modal     │   Focus     │ • Low Latency   │
    └─────────────┴─────────────┴─────────────┴─────────────────┘
           │             │             │             │
           ▼             ▼             ▼             ▼
    ┌─────────────────────────────────────────────────────────────┐
    │              Response Processing                            │
    │                                                             │
    │ • Context Preservation                                      │
    │ • Response Formatting                                       │
    │ • Error Handling                                            │
    │ • Token Counting                                            │
    │ • Quality Validation                                        │
    └─────────────────────────────────────────────────────────────┘
           │
           ▼
    ┌─────────────┐
    │   Return    │
    │  Response   │
    └─────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Facebook App with Messenger permissions
- AI API keys (OpenAI, Gemini, etc.)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Service2Returnhex/returnHex-chatBot-server.git
cd chat-bot
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Environment Setup**

Create `.env` file in the server directory:
```env
# Database
DB_URL=mongodb://localhost:27017/hexchatbot

# Server
PORT=5000
NODE_ENV=development

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESS_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
JWT_RESET_SECRET=your_reset_secret
JWT_RESET_EXPIRES_IN=1h

# AI API Keys
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
DEEPSEEK_API_KEY=your_deepseek_key
GROQ_API_KEY=your_groq_key

# Email Configuration
SMTP_AUTH_USER=your_email@domain.com
SMTP_AUTH_PASS=your_email_password

# Security
BCRYPT_SALT_ROUND=12
RESET_PASS_UI_LINK=http://localhost:3000/reset-password
```

Create `.env.local` file in the client directory:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

5. **Start the application**

Start the server:
```bash
cd server
npm run start:dev
```

Start the client:
```bash
cd client
npm run dev
```

## 📖 Usage Guide

### 1. User Registration
- Navigate to `/sign-up`
- Create your account
- Verify email (if configured)

### 2. Facebook Page Setup
- Go to User Dashboard
- Add your Facebook Page details
- Configure webhook URL in Facebook Developer Console
- Add your Page Access Token

### 3. AI Training
- Navigate to "Train Prompt" section
- Set custom system prompts for DMs and comments
- Train with existing Facebook posts
- Configure response behavior

### 4. Bot Activation
- Enable the bot for your page
- Test with a message to your Facebook page
- Monitor responses in the dashboard

### 5. Analytics
- View token usage statistics
- Monitor daily/weekly performance
- Track costs and efficiency

## 🛠️ API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User login
POST /api/v1/auth/logout       # User logout
POST /api/v1/auth/refresh      # Refresh token
POST /api/v1/auth/forgot-password    # Password reset request
POST /api/v1/auth/reset-password     # Password reset
```

### Page Management
```
GET    /api/v1/page/shop/:id        # Get page info
POST   /api/v1/page/create          # Create new page
PUT    /api/v1/page/update/:id      # Update page
DELETE /api/v1/page/delete/:id      # Delete page
```

### AI Chat Endpoints
```
POST /api/v1/chatgpt/chat       # OpenAI chat
POST /api/v1/gemini/chat        # Gemini chat
POST /api/v1/deepseek/chat      # DeepSeek chat
POST /api/v1/groq/chat          # Groq chat
```

### Webhook
```
GET  /api/v1/meta-webhook/:pageId/verify    # Webhook verification
POST /api/v1/meta-webhook/:pageId/messages  # Handle incoming messages
```

## 📁 Project Structure

```
chat-bot/
├── client/                 # Next.js Frontend
│   ├── app/               # App router pages
│   │   ├── (auth)/       # Authentication pages
│   │   ├── user-dashboard/    # User dashboard
│   │   └── admin-dashboard/   # Admin dashboard
│   ├── components/        # React components
│   │   ├── auth/         # Auth components
│   │   ├── ui/           # UI components
│   │   └── userDashboard/ # Dashboard components
│   └── types/            # TypeScript types
├── server/               # Express.js Backend
│   └── src/
│       ├── App/
│       │   ├── Modules/  # Feature modules
│       │   │   ├── auth/     # Authentication
│       │   │   ├── users/    # User management
│       │   │   ├── Page/     # Page management
│       │   │   ├── Chatgpt/  # OpenAI integration
│       │   │   ├── Gemini/   # Gemini integration
│       │   │   ├── DeepSeek/ # DeepSeek integration
│       │   │   ├── Groq/     # Groq integration
│       │   │   └── WebHook/  # Facebook webhook
│       │   ├── config/   # Configuration
│       │   ├── api/      # External API integrations
│       │   └── utility/  # Helper functions
│       ├── app.ts        # Express app setup
│       └── server.ts     # Server entry point
└── README.md            # This file
```

## 🔧 Configuration

### Facebook App Setup
1. Create a Facebook App in [Facebook Developers](https://developers.facebook.com/)
2. Add Messenger product
3. Set webhook URL: `https://yourdomain.com/api/v1/meta-webhook/{pageId}/messages`
4. Subscribe to `messages` and `messaging_postbacks` events
5. Get Page Access Token from your Facebook Page

### Webhook Configuration
- **Verify Token**: Set in your page configuration
- **Webhook URL**: `{SERVER_URL}/api/v1/meta-webhook/{pageId}/messages`
- **Events**: messages, messaging_postbacks

## 🚀 Deployment

### Using Docker (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
1. Set up MongoDB database
2. Configure environment variables
3. Build the client: `npm run build`
4. Start the server: `npm start`
5. Serve the client through a web server (nginx, Apache)

### Environment Variables for Production
```env
NODE_ENV=production
DB_URL=mongodb://your-production-db
RESET_PASS_UI_LINK=https://yourdomain.com/reset-password
```

## 🛡️ Security

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcrypt
- **Input Validation** with Zod schemas
- **CORS Protection** configured
- **Rate Limiting** (implement as needed)
- **Webhook Verification** for Facebook

## 📊 Monitoring

- **Token Usage Tracking** - Monitor AI API consumption
- **Error Logging** - Comprehensive error handling
- **Performance Metrics** - Response times and success rates
- **User Analytics** - Track user engagement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- 📧 Email: support@returnhex.com
- 📱 Phone: +123456789
- 🌐 Website: [returnhex.com](https://returnhex.com)

## 🙏 Acknowledgments

- [Facebook Messenger Platform](https://developers.facebook.com/docs/messenger-platform/)
- [OpenAI API](https://openai.com/api/)
- [Google Gemini API](https://ai.google.dev/)
- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)

---

**Built with ❤️ by Return Hex Team**

**Version 1.1.0** - Latest Release
