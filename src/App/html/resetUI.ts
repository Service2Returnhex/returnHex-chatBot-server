export const createEmailHtml = (userName: string, resetLink: string) => {
  const emailHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
  background-color: #ffffff;
  max-width: 600px;
  margin: 30px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

      h2 {
        color: #333333;
      }
      p {
        color: #555555;
      }
      .btn {
        display: inline-block;
        padding: 12px 20px;
        margin-top: 20px;
        background-color: #007bff;
        color: #ffffff;
        font-weight: bold;
        text-decoration: none;
        border-radius: 5px;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #999999;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Hello ${userName || "User"},</h2>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <a href="${resetLink}" class="btn">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

  return emailHtml;
};
