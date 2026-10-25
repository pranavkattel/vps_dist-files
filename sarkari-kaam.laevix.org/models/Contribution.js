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
exports.Contribution = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ContributionStepSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: '' },
    duration: { type: String, default: '' },
    tips: [{ type: String }],
    order: { type: Number, required: true }
}, { _id: false });
const ContributionDocumentSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['original', 'copy', 'both'], required: true },
    quantity: { type: Number, default: 1 },
    notes: { type: String, default: '' },
    required: { type: Boolean, default: true },
    order: { type: Number, required: true },
    sample_image: { type: String, default: '' }
}, { _id: false });
const ContributionGroundRealitySchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    status: { type: String, enum: ['verified', 'likely-true', 'unverified'], default: 'unverified' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: '' },
    author: { type: String, default: 'Anonymous User' },
    timestamp: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    image: { type: String, default: '' }
}, { _id: false });
const ContributionScamWarningSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    warning_points: [{ type: String }],
    severity: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    image: { type: String, default: '' }
}, { _id: false });
const ContributionOverviewSchema = new mongoose_1.Schema({
    content: { type: String, default: '' },
    last_edited_by: { type: String },
    last_edited_at: { type: Date }
}, { _id: false });
const ContributionTaskDataSchema = new mongoose_1.Schema({
    title: { type: String },
    description: { type: String },
    slug: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    category_id: { type: String },
    category_name: { type: String },
    category_slug: { type: String },
    status: { type: String, enum: ['published', 'draft'] },
    estimated_time: { type: String },
    overview: ContributionOverviewSchema,
    steps: [ContributionStepSchema],
    documents: [ContributionDocumentSchema],
    ground_reality: [ContributionGroundRealitySchema],
    scam_warnings: [ContributionScamWarningSchema]
}, { _id: false });
const ContributionSchema = new mongoose_1.Schema({
    reference_code: {
        type: String,
        required: true,
        unique: true
    },
    contribution_type: {
        type: String,
        enum: ['new_task', 'edit_task'],
        required: true
    },
    task_slug: {
        type: String,
        index: true
    },
    task_title: { type: String },
    contributor_name: {
        type: String,
        required: true,
        trim: true
    },
    contributor_email: { type: String, trim: true },
    contributor_note: { type: String },
    proposed_data: ContributionTaskDataSchema,
    original_data: ContributionTaskDataSchema,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    admin_note: { type: String },
    reviewed_by: { type: String },
    reviewed_at: { type: Date },
    section: {
        type: String,
        enum: ['overview', 'steps', 'documents', 'ground_reality', 'scam_warnings']
    },
    name: { type: String, trim: true },
    contact: { type: String, trim: true },
    office_name: { type: String, trim: true },
    category: { type: String },
    location: { type: String, trim: true },
    note: { type: String },
    contribution_data: { type: mongoose_1.Schema.Types.Mixed },
    current_content: { type: String },
    proposed_content: { type: String },
    step_data: { type: mongoose_1.Schema.Types.Mixed },
    document_data: { type: mongoose_1.Schema.Types.Mixed },
    warning_data: { type: mongoose_1.Schema.Types.Mixed },
    applied_at: { type: Date },
    applied_by: { type: String }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
ContributionSchema.index({ task_slug: 1, status: 1 });
ContributionSchema.index({ status: 1, created_at: -1 });
ContributionSchema.index({ contribution_type: 1, status: 1 });
exports.Contribution = mongoose_1.default.model('Contribution', ContributionSchema);
//# sourceMappingURL=Contribution.js.map