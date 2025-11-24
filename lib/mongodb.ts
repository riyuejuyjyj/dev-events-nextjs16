import mongoose from "mongoose";

// 定义连接缓存类型
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// 扩展全局对象以包含我们的 mongoose 缓存
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

// 在全局对象上初始化缓存，以便在开发环境的热重载期间保持连接
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * 建立与 MongoDB 的连接
 * 缓存连接以防止在开发环境热重载期间创建多个连接
 * @returns 解析为 Mongoose 实例的 Promise
 */
async function connectDB(): Promise<typeof mongoose> {
  // 如果存在现有连接则返回
  if (cached.conn) {
    return cached.conn;
  }

  // 如果有正在进行的连接则返回该 Promise
  if (!cached.promise) {
    // 验证 MongoDB URI 是否存在
    if (!MONGODB_URI) {
      throw new Error("请在 .env.local 文件中定义 MONGODB_URI 环境变量");
    }
    const options = {
      bufferCommands: false, // 禁用 Mongoose 缓冲
    };

    // 创建新的连接 Promise
    cached.promise = mongoose
      .connect(MONGODB_URI!, options)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    // 等待连接建立
    cached.conn = await cached.promise;
  } catch (error) {
    // 连接失败时重置 Promise 以便重试
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
