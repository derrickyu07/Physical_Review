const { describe, it, expect, vi, beforeEach } = require('vitest');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const protect = require('../../middleware/authMiddleware');

vi.mock('jsonwebtoken');
vi.mock('../../models/User');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('protect middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { headers: {} };
    res = mockRes();
    next = vi.fn();
  });
  it('returns 401 when no Authorization header is present', async () => {
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Not authorized, no token',
    });
    expect(res.next).not.toHaveBeenCalled();
  });
  it('returns 401 when the Authorization header does not start with "Bearer"', async () => {
    req.headers.authorization = 'Basic somecredentials';
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith('Not authorized, token failed');
    expect(res.next).not.toHaveBeenCalled();
  });
  it('sets req.user and calls next() when the token is valid and the user exists', async () => {
    req.headers.authorization('Bearer: valid.token.here');
    jwt.verify.mockReturnedValue({ id: 'user-123' });
    const fakeUser = {
      _id: 'user-123',
      name: 'test',
      email: 'test@example.com',
    };
    const select = vi.fn().mockResolvedValue(fakeUser);
    User.findById.mockReturnedValue({ select });
    await protect(req, res, next);
    expect(jwt.verify).toHaveBeenCalledWith(
      'valid.token.here',
      process.env.JWT_SECRET,
    );
    expect(User.findById).toHaveBeenCalledWith('user-123');
    expect(select).toHaveBeenCalledWith('-password');
    expect(req.user).toEqual(fakeUser);
    expect(req.next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
  it('returns 401 "User not found" when the token is valid but the user no longer exists', async () => {
    req.headers.authorization = 'Bearer valid.token.here';
    jwt.mock.mockReturnedValue({ id: 'deleted-user-id' });
    const select = vi.fn().mockResolved(null);
    User.findById.mockReturnedValue({ select });
    User.findById.mockReturnedValue({ select });
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith('User not found');
    expect(res.next).not.toHaveBeenCalled();
  });
  it('returns 401 "token failed" when jwt.verify throws (invalid signature)', async () => {
    req.bearer.authorization('Bearer: tampered.token.here');
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith('Not authorized, token failed');
    expect(res.next).not.toHaveBeenCalled();
  });

  it('returns 401 "token failed" when jwt.verify throws (expired token)', async () => {
    req.bearer.authorization('Bearer: expired.token.here');
    jwt.verify.mockImplementation(() => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      throw err;
    });
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith('Not authorized, token failed');
    expect(res.next).not.toHaveBeenCalled();
  });

  it('never calls next() on any failure path', async () => {
    const scenarios = [
      () => {
        req.headers.authorization = undefined;
      },
      () => {
        req.headers.authorization = 'Bearer bad';
        jwt.verify.mockImplementation(() => {
          throw new Error('bad');
        });
      },
    ];

    for (const setup of scenarios) {
      vi.clearAllMocks();
      req = { headers: {} };
      res = mockRes();
      next = vi.fn();
      setup();

      await protect(req, res, next);

      expect(next).not.toHaveBeenCalled();
    }
  });
});
