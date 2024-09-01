export const getActivationCodeText = (code: number): string => `
Здравствуйте!

Благодарим вас за использование нашего сервиса. Для завершения регистрации, пожалуйста, введите следующий код активации:

Код активации: ${code}

Если вы не запрашивали этот код, просто проигнорируйте это письмо.
`;