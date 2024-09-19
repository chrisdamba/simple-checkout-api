const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

jest.mock('typeorm', () => ({
  createConnection: jest.fn(),
  getRepository: jest.fn().mockReturnValue(mockRepository),
  PrimaryGeneratedColumn: () => {},
  Column: () => {},
  Entity: () => {},
  ManyToOne: () => {},
}))
