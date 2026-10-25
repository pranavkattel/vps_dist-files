"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const StepSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: '' },
    duration: { type: String, default: '' },
    tips: [{ type: String }],
    order: { type: Number, required: true }
}, { _id: false });
const DocumentSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['original', 'copy', 'both'],
        required: true
    },
    quantity: { type: Number, default: 1 },
    notes: { type: String, default: '' },
    required: { type: Boolean, default: true },
    order: { type: Number, required: true },
    sample_image: { type: String, default: '' }
}, { _id: false });
const GroundRealitySchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    status: {
        type: String,
        enum: ['verified', 'likely-true', 'unverified'],
        default: 'unverified'
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: '' },
    author: { type: String, default: 'Anonymous User' },
    timestamp: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    verified_at: { type: Date },
    verified_by: { type: String },
    admin_note: { type: String },
    image: { type: String, default: '' }
}, { _id: false });
const ScamWarningSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    warning_points: [{ type: String }],
    severity: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    created_by: { type: String },
    created_at: { type: Date, default: Date.now },
    image: { type: String, default: '' }
}, { _id: false });
const OverviewSchema = new mongoose_1.Schema({
    content: { type: String, default: '' },
    last_edited_by: { type: String },
    last_edited_at: { type: Date, default: Date.now }
}, { _id: false });
const TaskSchema = new mongoose_1.Schema({
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    category_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    category_name: { type: String, required: true },
    category_slug: { type: String, required: true },
    view_count: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'draft',
        index: true
    },
    verified: { type: Boolean, default: false },
    verified_date: { type: String },
    estimated_time: { type: String, required: true },
    cover_image: { type: String, default: '' },
    overview: OverviewSchema,
    steps: [StepSchema],
    documents: [DocumentSchema],
    ground_reality: [GroundRealitySchema],
    scam_warnings: [ScamWarningSchema],
    total_documents: { type: Number, default: 0 },
    completed_documents: { type: Number, default: 0 },
    progress_percentage: { type: Number, default: 0 }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
TaskSchema.index({ category_id: 1, status: 1 });
TaskSchema.index({ status: 1, verified: 1 });
TaskSchema.index({ created_at: -1 });
exports.Task = mongoose_1.default.model('Task', TaskSchema);
//# sourceMappingURL=Task.js.map