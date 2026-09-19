import { describe, it, expect, vi, beforeEach } from 'vitest';
import protect from '../../middleware/authMiddleware';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function mockDeps() {
  return {
    jwt: { verify: vi.fn() },
    User: { findById: vi.fn() },
  };
}

describe('protect middleware', () => {
  let req;
  let res;
  let next;
  let deps;

  beforeEach(() => {
    req = { headers: {} };
    res = mockRes();
    next = vi.fn();
    deps = mockDeps();
  });

  it('returns 401 when no Authorization header is present', async () => {
    await protect(req, res, next, deps);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Not authorized, no token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the Authorization header does not start with "Bearer"', async () => {
    req.headers.authorization = 'Basic somecredentials';
    await protect(req, res, next, deps);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Not authorized, no token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.user and calls next() when the token is valid and the user exists', async () => {
    req.headers.authorization = 'Bearer valid.token.here';
    deps.jwt.verify.mockReturnValue({ id: 'user-123' });
    const fakeUser = {
      _id: 'user-123',
      name: 'test',
      email: 'test@example.com',
    };
    const select = vi.fn().mockResolvedValue(fakeUser);
    deps.User.findById.mockReturnValue({ select });

    await protect(req, res, next, deps);

    expect(deps.jwt.verify).toHaveBeenCalledWith(
      'valid.token.here',
      process.env.JWT_SECRET,
    );
    expect(deps.User.findById).toHaveBeenCalledWith('user-123');
    expect(select).toHaveBeenCalledWith('-password');
    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 "User not found" when the token is valid but the user no longer exists', async () => {
    req.headers.authorization = 'Bearer valid.token.here';
    deps.jwt.verify.mockReturnValue({ id: 'deleted-user-id' });
    const select = vi.fn().mockResolvedValue(null);
    deps.User.findById.mockReturnValue({ select });

    await protect(req, res, next, deps);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 "token failed" when jwt.verify throws (invalid signature)', async () => {
    req.headers.authorization = 'Bearer tampered.token.here';
    deps.jwt.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    await protect(req, res, next, deps);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Not authorized, token failed',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 "token failed" when jwt.verify throws (expired token)', async () => {
    req.headers.authorization = 'Bearer expired.token.here';
    deps.jwt.verify.mockImplementation(() => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      throw err;
    });

    await protect(req, res, next, deps);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Not authorized, token failed',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('never calls next() on any failure path', async () => {
    const scenarios = [
      () => {
        req.headers.authorization = undefined;
      },
      () => {
        req.headers.authorization = 'Bearer bad';
        deps.jwt.verify.mockImplementation(() => {
          throw new Error('bad');
        });
      },
    ];

    for (const setup of scenarios) {
      req = { headers: {} };
      res = mockRes();
      next = vi.fn();
      deps = mockDeps();
      setup();

      await protect(req, res, next, deps);

      expect(next).not.toHaveBeenCalled();
    }
  });
});
