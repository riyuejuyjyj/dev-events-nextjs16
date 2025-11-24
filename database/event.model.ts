import { Schema, model, models, Document } from "mongoose";

// 事件文档的TypeScript接口定义
export interface IEvent extends Document {
  title: string; // 标题
  slug: string; // URL友好标识符
  description: string; // 描述
  overview: string; // 概览
  image: string; // 图片URL
  venue: string; // 场地
  location: string; // 位置
  date: string; // 日期
  time: string; // 时间
  mode: string; // 模式 (online/offline/hybrid)
  audience: string; // 受众
  agenda: string[]; // 议程列表
  organizer: string; // 组织者
  tags: string[]; // 标签列表
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "标题是必需的"],
      trim: true,
      maxlength: [100, "标题不能超过100个字符"],
    },
    slug: {
      type: String,
      unique: true, // 唯一索引
      lowercase: true, // 转换为小写
      trim: true, // 去除首尾空格
    },
    description: {
      type: String,
      required: [true, "描述是必需的"],
      trim: true,
      maxlength: [1000, "描述不能超过1000个字符"],
    },
    overview: {
      type: String,
      required: [true, "概览是必需的"],
      trim: true,
      maxlength: [500, "概览不能超过500个字符"],
    },
    image: {
      type: String,
      required: [true, "图片URL是必需的"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "场地是必需的"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "位置是必需的"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "日期是必需的"],
    },
    time: {
      type: String,
      required: [true, "时间是必需的"],
    },
    mode: {
      type: String,
      required: [true, "模式是必需的"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "模式必须是 online, offline 或 hybrid 之一",
      },
    },
    audience: {
      type: String,
      required: [true, "受众是必需的"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "议程是必需的"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "至少需要一个议程项",
      },
    },
    organizer: {
      type: String,
      required: [true, "组织者是必需的"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "标签是必需的"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "至少需要一个标签",
      },
    },
  },
  {
    timestamps: true, // 自动生成创建时间和更新时间
  }
);

// 保存前钩子，用于生成slug和数据标准化
EventSchema.pre("save", function (next) {
  const event = this as IEvent;

  // 如果标题更改或为新文档，则生成slug
  if (event.isModified("title") || event.isNew) {
    event.slug = generateSlug(event.title);
  }

  // 如果日期更改，则将其标准化为ISO格式
  if (event.isModified("date")) {
    try {
      event.date = normalizeDate(event.date);
    } catch (error: any) {
      return next(error);
    }
  }

  // 如果时间更改，则将其标准化为HH:MM格式
  if (event.isModified("time")) {
    try {
      event.time = normalizeTime(event.time);
    } catch (error: any) {
      return next(error);
    }
  }

  next();
});

// 辅助函数：生成URL友好的slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // 移除特殊字符
    .replace(/\s+/g, "-") // 将空格替换为连字符
    .replace(/-+/g, "-") // 将多个连字符替换为单个连字符
    .replace(/^-|-$/g, ""); // 移除开头和结尾的连字符
}

// 辅助函数：将日期标准化为ISO格式
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("无效的日期格式");
  }
  return date.toISOString().split("T")[0]; // 返回 YYYY-MM-DD 格式
}

// 辅助函数：将时间标准化为HH:MM格式
function normalizeTime(timeString: string): string {
  // 处理各种时间格式并转换为HH:MM (24小时制)
  const timeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;
  const match = timeString.trim().match(timeRegex);

  if (!match) {
    throw new Error("无效的时间格式。请使用 HH:MM 或 HH:MM AM/PM");
  }

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[4]?.toUpperCase();

  if (period) {
    // 将12小时制转换为24小时制
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  }

  if (
    hours < 0 ||
    hours > 23 ||
    parseInt(minutes) < 0 ||
    parseInt(minutes) > 59
  ) {
    throw new Error("无效的时间值");
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

// 在slug上创建唯一索引以提高查询性能
EventSchema.index({ slug: 1 }, { unique: true });

// 创建复合索引用于常见查询
EventSchema.index({ date: 1, mode: 1 });

const Event = models.Event || model<IEvent>("Event", EventSchema);

export default Event;
