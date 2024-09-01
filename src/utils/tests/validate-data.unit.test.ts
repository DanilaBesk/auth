// import { DESCRIPTION, ID, STATUS, TITLE } from '#/cards/cards.schemas';
// import { ValidationError } from '#/errors/api-error';
// import { validateData } from '#/lib/validate-data';
// import { Request } from 'express';
// import { z } from 'zod';

// describe('validateData', () => {
//   let req: Request;

//   beforeEach(() => {
//     req = {
//       body: {},
//       params: {},
//       query: {}
//     } as Request;
//   });

//   it('Should validate data successfully', async () => {
//     const schema = z.object({
//       body: z.object({
//         title: TITLE,
//         description: DESCRIPTION
//       }),
//       params: z.object({
//         id: ID
//       })
//     });

//     req.body = {
//       title: 'title',
//       description: 'description'
//     };
//     req.params = {
//       id: '1'
//     };

//     const result = await validateData(schema, req);

//     expect(result).toEqual({
//       body: {
//         title: 'title',
//         description: 'description'
//       },
//       params: {
//         id: '1'
//       }
//     });
//   });

//   it('Should throw a validation error, when data is invalid', async () => {
//     const schema = z.object({
//       body: z.object({
//         title: TITLE,
//         status: STATUS
//       })
//     });

//     req.body = {
//       title: 'title',
//       status: 'INVALID_STATUS'
//     };

//     await expect(validateData(schema, req)).rejects.toThrow(ValidationError);
//   });
//   it('Should throw a validation error, when required data is missing', async () => {
//     const schema = z.object({
//       body: z.object({
//         title: TITLE,
//         description: DESCRIPTION
//       }),
//       params: z.object({
//         id: ID
//       })
//     });

//     req.body = {};
//     req.params = {};

//     await expect(validateData(schema, req)).rejects.toThrow(ValidationError);
//   });
// });
