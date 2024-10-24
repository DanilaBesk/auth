import { getIpDataHtml, getIpDataText } from '#/templates/get-ip-data.template';
import { TTemplateActionCode } from '#/types/mail.types';

export const getUserDeletionCodeHtml = ({
  requestIp,
  requestIpData,
  requestTime,
  code
}: Omit<TTemplateActionCode, 'email'>) => `<!doctype html>
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
        max-width: 500px;
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
      .code {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
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
      <h1>Код для удаления аккаунта</h1>
      <p>Здравствуйте!</p>
      <p>
       Вы запросили удаление вашего аккаунта. Для подтверждения удаления, пожалуйста, введите следующий код:
      </p>
      <div class="code">${code}</div>
      <p class="footer">
        Если вы не запрашивали этот код, просто проигнорируйте это письмо.
      </p>
      ${getIpDataHtml({ ip: requestIp, ipData: requestIpData, time: requestTime })}
      <p class="signature">
        С уважением,<br />
        Команда DanilaBesk
      </p>
    </div>
  </body>
</html>`;

export const getUserDeletionCodeText = ({
  requestIp,
  requestIpData,
  requestTime,
  code
}: Omit<TTemplateActionCode, 'email'>) => `Здравствуйте!

Вы запросили удаление вашего аккаунта. Для подтверждения удаления, пожалуйста, введите следующий код:

Код для удаления аккаунта: ${code}

Если вы не запрашивали этот код, просто проигнорируйте это письмо.

${getIpDataText({ ip: requestIp, ipData: requestIpData, time: requestTime })}

С уважением,
Команда DanilaBesk`;
