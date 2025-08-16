import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    callId: {
      type: String,
      required: true,
      unique: true,
    },
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callType: {
      type: String,
      enum: ["voice", "video"],
      required: true,
      default: "video",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "ended", "missed", "ongoing"],
      default: "pending",
    },
    duration: {
      type: String,
      default: "0:00",
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    missedReason: {
      type: String,
      enum: ["no_answer", "busy", "declined", "network_error", "user_disconnected"],
      default: null,
    },
    quality: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      default: null,
    },
    // Additional metadata
    metadata: {
      hasVideo: {
        type: Boolean,
        default: true,
      },
      hasAudio: {
        type: Boolean,
        default: true,
      },
      wasVideoEnabled: {
        type: Boolean,
        default: true,
      },
      wasAudioEnabled: {
        type: Boolean,
        default: true,
      },
      reconnectionAttempts: {
        type: Number,
        default: 0,
      },
      networkType: {
        type: String,
        default: null,
      },
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for formatted duration
callSchema.virtual('formattedDuration').get(function() {
  if (this.startTime && this.endTime) {
    const durationMs = this.endTime - this.startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return this.duration;
});

// Virtual to determine if call was successful
callSchema.virtual('isSuccessful').get(function() {
  return this.status === 'ended' && this.duration !== '0:00';
});

// Pre-save middleware to update startTime when status changes to accepted
callSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'accepted' && !this.startTime) {
      this.startTime = new Date();
    } else if (this.status === 'ended' && !this.endTime) {
      this.endTime = new Date();
      
      // Calculate duration if not already set
      if (this.startTime && this.duration === '0:00') {
        const durationMs = this.endTime - this.startTime;
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        this.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }
  }
  next();
});

// Index for better query performance
callSchema.index({ callerId: 1, createdAt: -1 });
callSchema.index({ receiverId: 1, createdAt: -1 });
callSchema.index({ status: 1 });
callSchema.index({ callId: 1 });
callSchema.index({ callType: 1 });

const Call = mongoose.model("Call", callSchema);

export default Call;
