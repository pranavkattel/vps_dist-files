"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSlug = exports.slugToTitle = exports.generateUniqueCategorySlug = exports.generateUniqueTaskSlug = exports.generateSlug = void 0;
const slugify_1 = __importDefault(require("slugify"));
const models_1 = require("../models");
const generateSlug = (text) => {
    return (0, slugify_1.default)(text, {
        lower: true,
        strict: true,
        remove: /[*+~.()'";!:@]/g,
    });
};
exports.generateSlug = generateSlug;
const generateUniqueTaskSlug = async (title, excludeId) => {
    let baseSlug = (0, exports.generateSlug)(title);
    let slug = baseSlug;
    let counter = 1;
    while (await taskSlugExists(slug, excludeId)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
};
exports.generateUniqueTaskSlug = generateUniqueTaskSlug;
const generateUniqueCategorySlug = async (name, excludeId) => {
    let baseSlug = (0, exports.generateSlug)(name);
    let slug = baseSlug;
    let counter = 1;
    while (await categorySlugExists(slug, excludeId)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
};
exports.generateUniqueCategorySlug = generateUniqueCategorySlug;
const taskSlugExists = async (slug, excludeId) => {
    const filter = { slug };
    if (excludeId) {
        filter._id = { $ne: excludeId };
    }
    const existing = await models_1.Task.findOne(filter).lean();
    return !!existing;
};
const categorySlugExists = async (slug, excludeId) => {
    const filter = { slug };
    if (excludeId) {
        filter._id = { $ne: excludeId };
    }
    const existing = await models_1.Category.findOne(filter).lean();
    return !!existing;
};
const slugToTitle = (slug) => {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
exports.slugToTitle = slugToTitle;
const isValidSlug = (slug) => {
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugPattern.test(slug) && slug.length >= 1 && slug.length <= 255;
};
exports.isValidSlug = isValidSlug;
//# sourceMappingURL=slug.util.js.map