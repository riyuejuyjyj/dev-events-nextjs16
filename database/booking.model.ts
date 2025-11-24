import { Schema, model, models, Document, Types } from "mongoose";
import Event from "./event.model";

// 预订文档的TypeScript接口定义
export interface IBooking extends Document {
  eventId: Types.ObjectId; // 关联的事件ID
  email: string; // 用户邮箱
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event", // 引用Event模型
      required: [true, "事件ID是必需的"], // 必填字段
    },
    email: {
      type: String,
      required: [true, "邮箱是必需的"], // 必填字段
      trim: true, // 去除首尾空格
      lowercase: true, // 转换为小写
      validate: {
        validator: function (email: string) {
          // 符合RFC 5322标准的邮箱验证正则表达式
          const emailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          return emailRegex.test(email);
        },
        message: "请提供有效的邮箱地址", // 验证失败提示信息
      },
    },
  },
  {
    timestamps: true, // 自动生成创建时间和更新时间
  }
);

// 保存前钩子，在创建预订前验证关联的事件是否存在
BookingSchema.pre("save", async function (next) {
  const booking = this as IBooking;

  // 仅在eventId为新值或已修改时进行验证
  if (booking.isModified("eventId") || booking.isNew) {
    try {
      const eventExists = await Event.findById(booking.eventId).select("_id");

      if (!eventExists) {
        const error = new Error(`ID为 ${booking.eventId} 的事件不存在`);
        error.name = "ValidationError";
        return next(error);
      }
    } catch {
      const validationError = new Error("无效的事件ID格式或数据库错误");
      validationError.name = "ValidationError";
      return next(validationError);
    }
  }

  next();
});

// 在eventId上创建索引以加快查询速度
BookingSchema.index({ eventId: 1 });

// 创建复合索引用于常见查询（按日期排序的事件预订）
BookingSchema.index({ eventId: 1, createdAt: -1 });

// 在email上创建索引用于用户预订查询
BookingSchema.index({ email: 1 });

// 强制每个邮箱对每个事件只能有一个预订
BookingSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, name: "uniq_event_email" }
);

const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
