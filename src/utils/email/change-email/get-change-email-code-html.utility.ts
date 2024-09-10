/* eslint-disable max-len */
export const getChangeEmailHtml = (
  code: number,
  newEmail: string
) => `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: 'Arial', sans-serif;
        background-color: #f4f7f6;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      h1 {
        font-size: 24px;
        color: #333333;
        margin-bottom: 20px;
        text-align: center;
      }
      p {
        font-size: 16px;
        color: #666666;
        line-height: 1.5;
        margin-bottom: 20px;
        text-align: center;
      }
      .new-email {
        font-size: 16px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        border: 2px solid #007bff;
        border-radius: 8px;
        background-color: #e9f4ff;
        color: #007bff;
        margin-bottom: 20px;
      }
      .code {
        font-size: 24px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 15px;
        border: 2px solid #007bff;
        border-radius: 8px;
        background-color: #e9f4ff;
        color: #007bff;
        margin-bottom: 20px;
      }
      .footer {
        font-size: 14px;
        color: #888888;
        text-align: center;
      }
      .signature {
        font-size: 16px;
        color: #333333;
        text-align: center;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Обновление электронной почты</h1>
      <p>Здравствуйте!</p>
      <p>
        Вы получили это письмо, потому что запросили обновление электронной почты на нашем сайте.
      </p>
      <p>
        Ваш новый адрес электронной почты: <span class="new-email">${newEmail}</span>
      </p>
      <p>
        Пожалуйста, используйте следующий код для подтверждения изменения электронной почты:
      </p>
      <div class="code">${code}</div>
      <p>
        Если вы не делали запрос на обновление электронной почты, просто проигнорируйте это письмо. Ваш текущий адрес электронной почты останется неизменным.
      </p>
      <p class="footer">
        Если у вас возникли вопросы или проблемы, не стесняйтесь обращаться в нашу службу поддержки.
      </p>
      <p class="signature">
        С уважением,<br />
        Команда DanilaBesk
      </p>
    </div>
  </body>
</html>
`;
