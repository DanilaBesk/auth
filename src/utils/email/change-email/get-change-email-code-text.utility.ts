/* eslint-disable max-len */
export const getChangeEmailText = (code: number, newEmail: string): string => `
Здравствуйте!

Вы получили это письмо, потому что запросили обновление электронной почты на нашем сайте.

Ваш новый адрес электронной почты: ${newEmail}

Пожалуйста, используйте следующий код для подтверждения изменения электронной почты: ${code}

Если вы не делали запрос на обновление электронной почты, просто проигнорируйте это письмо. Ваш текущий адрес электронной почты останется неизменным.

Если у вас возникли вопросы или проблемы, не стесняйтесь обращаться в нашу службу поддержки.

С уважением,
Команда DanilaBesk
`;
