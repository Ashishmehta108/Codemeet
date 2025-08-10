import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';

const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

describe('RoomService', () => {
  let service: RoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomService, { provide: 'db', useValue: mockDb }],
    })
      .overrideProvider(RoomService)
      .useValue(new RoomService())
      .compile();

    service = module.get<RoomService>(RoomService);

    // Replace private database instance with mock
    (service as any).database = mockDb;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all rooms', async () => {
    const fakeRooms = [{ roomId: '123', name: 'Test Room', createdAt: 'now' }];
    mockDb.select.mockReturnThis();
    mockDb.from.mockResolvedValueOnce(fakeRooms);

    const result = await service.getAllRooms();
    expect(result).toEqual(fakeRooms);
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.from).toHaveBeenCalled();
  });

  it('should create a room', async () => {
    const room = { roomId: '123', name: 'New Room', createdAt: 'now' };
    await service.createRoom(room);

    expect(mockDb.insert).toHaveBeenCalledWith(expect.anything()); // your table
    expect(mockDb.values).toHaveBeenCalledWith(room);
  });

  it('should delete a room', async () => {
    mockDb.delete.mockReturnThis();
    mockDb.where.mockResolvedValueOnce({ count: 1 });

    const result = await service.deleteRoom('123');
    expect(result).toEqual({ count: 1 });
    expect(mockDb.delete).toHaveBeenCalled();
  });
});
