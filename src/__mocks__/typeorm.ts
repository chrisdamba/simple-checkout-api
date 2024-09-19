const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

export const getRepository = jest.fn(() => mockRepository)
