# ChatBot Backend

A Facebook Messenger and Comment Reply chatbot backend built with Node.js and Express, 
using webhooks to deliver smart, product-aware responses to user messages and comments.

## ✨ Features

- **🧠 Smart Product Inquiry Responses**  
  Leverages OpenAI to understand user messages and reply with context-aware, natural responses based on your product database.

- **💬 Comment Auto-Replies**  
  Automatically detects and responds to Facebook post comments with relevant product suggestions.

- **🎯 AI-Powered Recommendations**  
  Suggests high-quality product matches and simplifies buying decisions through conversational guidance.

- **📦 Product Awareness**  
  Dynamically fetches product information (name, price, description) from MongoDB and responds intelligently—even if some fields are missing.

- **🗂️ Multi-Product Support**  
  Handles multiple products and provides personalized replies depending on the user’s query and post context.

- **📝 User Message History**  
  Maintains chat history per user to improve the quality and consistency of AI responses.

- **🌐 Webhook Integration**  
  Real-time Facebook webhook setup for handling Messenger messages and page comment events.

- **🛠️ Admin Control**  
  Manage shop details, product data, and bot behavior from a simple backend structure.

- **📐 RESTful API Design**  
  Clean, maintainable Node.js + Express architecture designed for scalability and extension.

- **🔗 OpenAI GPT Integration**  
  Uses GPT models to deliver helpful, conversational responses using real product data and shop context.


## 🛠️ Tech Stack

- **Backend**: Node.js with Express.js
- **Facebook Integration**: Webhooks, Facebook Graph API, and Messenger Platform API
- **AI Integration**: OpenAI API (GPT-3.5 / GPT-4) for natural language understanding and smart replies
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based user authentication
- **Webhook Handling**: Real-time Facebook event handling (messages & comments)
- **Environment Management**: dotenv for configuration management


## Project Structure

```
.
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── App
│   │   ├── api
│   │   │   └── facebook.api.ts
│   │   ├── config
│   │   │   ├── config.ts
│   │   │   └── databas.ts
│   │   ├── interface
│   │   │   └── index.d.ts
│   │   ├── Middlewares
│   │   │   ├── AppError.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   └── notFound.ts
│   │   ├── Modules
│   │   │   ├── Chatgpt
│   │   │   │   ├── chatgpt.controller.ts
│   │   │   │   ├── chatgpt.route.ts
│   │   │   │   ├── chatgpt.service.ts
│   │   │   │   ├── chat-history.model.ts
│   │   │   │   └── comment-histroy.model.ts
│   │   │   ├── DeepSeek
│   │   │   │   ├── deepseek.controller.ts
│   │   │   │   ├── deepseek.route.ts
│   │   │   │   └── deepseek.service.ts
│   │   │   ├── Gemini
│   │   │   │   ├── gemini.controller.ts
│   │   │   │   ├── gemini.route.ts
│   │   │   │   └── gemini.service.ts
│   │   │   ├── Page
│   │   │   │   ├── page.controller.ts
│   │   │   │   ├── page.route.ts
│   │   │   │   ├── page.service.ts
│   │   │   │   ├── product.mode.ts
│   │   │   │   ├── shopInfo.model.ts
│   │   │   │   └── shop.promt.ts
│   │   │   └── WebHook
│   │   │       ├── webhook.controller.ts
│   │   │       ├── webhook.route.ts
│   │   │       └── webhook.service.ts
│   │   ├── Routes
│   │   │   └── index.ts
│   │   └── utility
│   │       ├── AppError.ts
│   │       ├── cathcAsync.ts
│   │       ├── sendResponse.ts
│   │       └── validateRequest.ts
│   ├── app.ts
│   ├── server.ts
│   └── test.ts
└── tsconfig.json
```

## Quick Start

### ⚙️ Prerequisites

- Node.js v18 or higher (Recommended: v20+)
- MongoDB v5 or higher (local or cloud, e.g. MongoDB Atlas)
- Git
- Facebook Developer Account (for Page Access Token and Webhooks setup)
- OpenAI API Key (GPT-3.5 or GPT-4 access)


### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd file-name
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   ```sql
    - Make sure MongoDB is installed and running locally, or use a cloud solution like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Example local connection string (already in `.env.example`):
     ```
     DB_URL=mongodb://localhost:27017/chatBotDB
     ```
   - No manual database creation is needed — Mongoose will auto-create collections based on your schema.
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8080`

## Environment Configuration

Copy `.env.example` to `.env` and configure the following variables:

### Database
```env
DB_URL=mongodb://localhost:27017/your_database_name
```

### OpenAI API Key (for smart replies)
```env
OPENAI_API_KEY=your-openai-api-key-here
```

### Gemini API Key (if used as fallback or for experiments)
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### Facebook Page Configuration
```env
PAGE_ID=your-facebook-page-id
PAGE_ACCESS_TOKEN=your-facebook-page-access-token
VERIFY_TOKEN=your-webhook-verify-token
```

### Shop Configuration
```env
SHOP_ID=your-mongodb-shop-object-id
```

## 📡 API Endpoints

### 🌐 Webhook

* `GET /api/v1/webhook` – Webhook verification endpoint (Facebook)
* `POST /api/v1/webhook` – Handle incoming messages from Facebook Messenger

### 💬 AI Responses

* `GET /api/v1/chatgpt/response` – Get response using OpenAI GPT model
* `GET /api/v1/gemini/response` – Get response using Google Gemini model

### 🛒 Product Management

* `GET /api/v1/page/products` – Get all products
* `GET /api/v1/page/product/:id` – Get a specific product by ID
* `POST /api/v1/page/product` – Create a new product
* `PUT /api/v1/page/product/:id` – Update product by ID
* `DELETE /api/v1/page/product/:id` – Delete product by ID

### 🏬 Shop Management

* `GET /api/v1/page/shop` – Get all shops
* `GET /api/v1/page/shop/:id` – Get a specific shop by ID
* `POST /api/v1/page/shop` – Create a new shop
* `PUT /api/v1/page/shop/:id` – Update shop by ID
* `DELETE /api/v1/page/shop/:id` – Delete shop by ID


## 🗃️ Database Schema

The application uses the following main MongoDB collections:

### 🧠 Chat History

Stores user interactions with the chatbot (OpenAI/Gemini).

* **userId** (`string`) – Unique identifier for the user
* **messages** (`array`) – List of message objects:

  * `role` – Can be `'system'`, `'user'`, or `'assistant'`
  * `content` – The actual message text

### 🛍️ Products

Stores product information extracted from Facebook post comments.

* **name** (`string`) – Name of the product *(optional)*
* **description** (`string`) – Description of the product *(optional)*
* **price** (`string`) – Product price *(optional)*
* **postId** (`string`) – Unique Facebook post ID (used for comment mapping)
* **message** (`string`) – Full original message/comment content
* **createdAt** (`Date`) – Timestamp of creation

### 🏪 Shop Info

Stores Facebook Page shop information.

* **pageName** (`string`) – Page name
* **address** (`string`) – Physical address of the shop
* **phone** (`string`) – Contact number
* **pageCategory** (`string`) – Category (e.g., Clothing, Electronics)


## Development

### Running in Development Mode
```bash
NODE_ENV=development npm run start:dev
```

## Testing

```bash
# Run tests


# Run tests with coverage

```

## Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t img_name .

# Run with Docker Compose
docker-compose up -d
```

### Production Environment Variables
Ensure you set production values for:
- `ENV=production`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Author
Naeem Biswass Niloy
Jr. Software Engineer at [ReturnHex](https://returnhex.com)