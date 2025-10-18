import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
  telegram_id: number;
  telegram_name: string;
  telegram_username?: string;
}

export interface IAnalytics {
  last_view_at: Date | null;
  peak_views: number;
  peak_views_date: Date | null;
  average_watch_time: number;
  total_watch_time: number;
  engagement_rate: number;
}

export interface ISocialVideo extends Document {
  user: IUser;
  url: string;
  file_id: string;
  thumbnail: string;
  source_url: string;
  source_platform: string;
  title: string | null;
  description: string | null;
  duration: number;
  file_size: number;
  width: number;
  height: number;
  views: number[];
  view_count: number;
  likes: number[];
  like_count: number;
  dislikes: number[];
  dislike_count: number;
  comments: any[];
  comment_count: number;
  shares: number[];
  share_count: number;
  favorites: number[];
  favorite_count: number;
  is_public: boolean;
  is_deleted: boolean;
  is_blocked: boolean;
  tags: string[];
  category: string | null;
  location: any | null;
  created_at: Date;
  updated_at: Date;
  published_at: Date;
  analytics: IAnalytics;
}

const socialVideoSchema = new Schema<ISocialVideo>(
  {
    user: {
      telegram_id: { type: Number, required: true, index: true },
      telegram_name: { type: String, required: true },
      telegram_username: { type: String },
    },
    url: { type: String, required: true },
    file_id: { type: String, required: true },
    thumbnail: { type: String, required: false, default: "" },
    source_url: { type: String, required: true },
    source_platform: { 
      type: String, 
      required: true,
      enum: ["instagram", "tiktok", "youtube", "other"],
      index: true,
    },
    title: { type: String, default: null },
    description: { type: String, default: null },
    duration: { type: Number, required: true },
    file_size: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    views: [{ type: Number }],
    view_count: { type: Number, default: 0, index: true },
    likes: [{ type: Number }],
    like_count: { type: Number, default: 0, index: true },
    dislikes: [{ type: Number }],
    dislike_count: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.Mixed }],
    comment_count: { type: Number, default: 0 },
    shares: [{ type: Number }],
    share_count: { type: Number, default: 0 },
    favorites: [{ type: Number }],
    favorite_count: { type: Number, default: 0 },
    is_public: { type: Boolean, default: true, index: true },
    is_deleted: { type: Boolean, default: false, index: true },
    is_blocked: { type: Boolean, default: false, index: true },
    tags: [{ type: String, index: true }],
    category: { type: String, default: null, index: true },
    location: { type: Schema.Types.Mixed, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    published_at: { type: Date, default: Date.now, index: true },
    analytics: {
      last_view_at: { type: Date, default: null },
      peak_views: { type: Number, default: 0 },
      peak_views_date: { type: Date, default: null },
      average_watch_time: { type: Number, default: 0 },
      total_watch_time: { type: Number, default: 0 },
      engagement_rate: { type: Number, default: 0 },
    },
  },
  {
    timestamps: false,
    collection: "social_videos",
  }
);

// Indexes for better performance
socialVideoSchema.index({ created_at: -1 });
socialVideoSchema.index({ published_at: -1 });
socialVideoSchema.index({ view_count: -1 });
socialVideoSchema.index({ like_count: -1 });
socialVideoSchema.index({ is_public: 1, is_deleted: 1, is_blocked: 1 });

// Middleware to update updated_at before save
socialVideoSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

const SocialVideo = mongoose.model<ISocialVideo>("SocialVideo", socialVideoSchema, "social_videos");

export default SocialVideo;

