"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const mongodb_1 = require("../config/mongodb");
const models_1 = require("../models");
const bcrypt_util_1 = require("../utils/bcrypt.util");
const logger_util_1 = require("../utils/logger.util");
const demoCategories = [
    {
        name: 'Citizenship',
        slug: 'citizenship',
        description: 'Documents related to citizenship certificates and nationality',
        color: '#3B82F6',
        icon: '🗂️',
        task_count: 1
    },
    {
        name: 'Passport',
        slug: 'passport',
        description: 'Passport application and renewal processes',
        color: '#10B981',
        icon: '📘',
        task_count: 1
    },
    {
        name: 'Driving License',
        slug: 'driving-license',
        description: 'License application, renewal and related services',
        color: '#F59E0B',
        icon: '🚗',
        task_count: 0
    },
    {
        name: 'Birth Certificate',
        slug: 'birth-certificate',
        description: 'Birth certificate applications and corrections',
        color: '#8B5CF6',
        icon: '👶',
        task_count: 0
    }
];
const demoContributions = [
    {
        reference_code: 'UPD-001',
        contributor_name: 'John Doe',
        contributor_email: 'john@example.com',
        contribution_type: 'new_task',
        proposed_data: {
            title: 'Pay Tax Online',
            description: 'Process to pay land tax online',
            slug: 'pay-tax-online',
            difficulty: 'medium',
            status: 'draft',
            overview: {
                content: 'Guide to paying taxes online.'
            }
        },
        status: 'pending'
    },
    {
        reference_code: 'UPD-002',
        contributor_name: 'Jane Smith',
        contributor_email: 'jane@example.com',
        contribution_type: 'edit_task',
        task_slug: 'passport',
        proposed_data: {
            difficulty: 'hard'
        },
        original_data: {
            difficulty: 'medium'
        },
        status: 'approved'
    },
    {
        reference_code: 'UPD-003',
        contributor_name: 'Ram Bahadur',
        contributor_email: 'ram@example.com',
        contribution_type: 'new_task',
        proposed_data: {
            title: 'Fix License Info',
            description: 'Correction for license info',
        },
        status: 'rejected',
        admin_note: 'Information is already correct'
    }
];
const seedDatabase = async () => {
    try {
        logger_util_1.logger.info('🌱 Starting database seeding...');
        await models_1.Task.deleteMany({});
        await models_1.Category.deleteMany({});
        await models_1.Contribution.deleteMany({});
        await models_1.Admin.deleteMany({});
        logger_util_1.logger.info('🧹 Cleared existing data');
        const adminPassword = await (0, bcrypt_util_1.hashPassword)('sarkari@123$');
        const adminData = {
            username: 'admin',
            email: 'sarkarikam@laevix.com',
            password_hash: adminPassword,
            role: 'super_admin',
            is_active: true
        };
        const admin = await models_1.Admin.create(adminData);
        logger_util_1.logger.info(`👤 Created admin user: ${admin.email} (password: sarkari@123$)`);
        const insertedCategories = await models_1.Category.insertMany(demoCategories);
        logger_util_1.logger.info(`📂 Inserted ${insertedCategories.length} categories`);
        const citizenshipCategory = insertedCategories.find(cat => cat.slug === 'citizenship');
        const passportCategory = insertedCategories.find(cat => cat.slug === 'passport');
        if (!citizenshipCategory || !passportCategory) {
            throw new Error('Required categories not found');
        }
        const demoTasks = [
            {
                title: 'Get Citizenship Certificate (First Time)',
                description: 'नागरिकता प्रमाणपत्र (पहिलो पटक)',
                slug: 'get-citizenship',
                difficulty: 'medium',
                category_id: citizenshipCategory._id,
                category_name: citizenshipCategory.name,
                category_slug: citizenshipCategory.slug,
                view_count: 150,
                status: 'published',
                verified: true,
                verified_date: '2024-01-15',
                estimated_time: '2-4 weeks',
                overview: {
                    content: 'Complete process for obtaining citizenship certificate for first-time applicants in Nepal. This process involves multiple steps and requires careful documentation.',
                    last_edited_by: 'sarkarikam@laevix.com',
                    last_edited_at: new Date('2024-01-15T10:00:00Z')
                },
                steps: [
                    {
                        id: 's1',
                        title: 'Collect recommendation from Ward Office',
                        description: 'Visit your local Ward Office with your birth certificate and parents citizenship. They will provide a recommendation letter (Sifaris Patra).',
                        location: 'Ward Office (Wada Karyalaya)',
                        duration: '1-2 hours',
                        tips: [
                            'Go early in the morning',
                            'Bring 2 passport-sized photos',
                            'Both parents should accompany if possible'
                        ],
                        order: 1
                    },
                    {
                        id: 's2',
                        title: 'Prepare all required documents',
                        description: 'Gather all original documents and make photocopies as specified. Arrange them in order for faster processing.',
                        duration: '30 minutes',
                        tips: [
                            'Use A4 size copies',
                            'Keep documents in a clear folder'
                        ],
                        order: 2
                    },
                    {
                        id: 's3',
                        title: 'Visit District Administration Office',
                        description: 'Go to the DAO before 11 AM to submit your application. You will fill out a form and submit your documents.',
                        location: 'District Administration Office',
                        duration: '2-4 hours',
                        tips: [
                            'Reach before 10 AM',
                            'Offices close for lunch',
                            'Avoid Fridays if possible'
                        ],
                        order: 3
                    },
                    {
                        id: 's4',
                        title: 'Biometric data collection',
                        description: 'Your photo and fingerprints will be taken digitally. Make sure your hands are clean and dry.',
                        location: 'District Administration Office',
                        duration: '15-30 minutes',
                        tips: [],
                        order: 4
                    },
                    {
                        id: 's5',
                        title: 'Wait for verification',
                        description: 'The office will verify your documents. This can take 1-2 weeks. You may receive a call if additional documents are needed.',
                        duration: '1-2 weeks',
                        tips: [],
                        order: 5
                    },
                    {
                        id: 's6',
                        title: 'Collect your citizenship',
                        description: 'Once approved, you will receive a notification. Visit the DAO to collect your citizenship certificate.',
                        location: 'District Administration Office',
                        duration: '30 minutes',
                        tips: [
                            'Bring your token/receipt',
                            'Check during office hours only'
                        ],
                        order: 6
                    }
                ],
                documents: [
                    {
                        id: 'd1',
                        name: 'Birth Certificate',
                        type: 'both',
                        quantity: 2,
                        notes: 'Must be issued by the Ward Office',
                        required: true,
                        order: 1
                    },
                    {
                        id: 'd2',
                        name: "Father's Citizenship Certificate",
                        type: 'both',
                        quantity: 2,
                        required: true,
                        order: 2
                    },
                    {
                        id: 'd3',
                        name: "Mother's Citizenship Certificate",
                        type: 'both',
                        quantity: 2,
                        required: true,
                        order: 3
                    },
                    {
                        id: 'd4',
                        name: 'Ward Recommendation Letter',
                        type: 'original',
                        quantity: 1,
                        notes: 'Fresh recommendation, usually valid for 35 days',
                        required: true,
                        order: 4
                    },
                    {
                        id: 'd5',
                        name: 'Passport-sized Photos',
                        type: 'original',
                        quantity: 4,
                        notes: 'Recent, with white background',
                        required: true,
                        order: 5
                    },
                    {
                        id: 'd6',
                        name: 'School Certificate (SLC/SEE)',
                        type: 'copy',
                        quantity: 2,
                        notes: 'If available, helps verify age',
                        required: false,
                        order: 6
                    }
                ],
                ground_reality: [
                    {
                        id: 'gr1',
                        status: 'verified',
                        title: 'Extra document asked',
                        description: "They asked for grandfather's citizenship copy even though it's not officially required. Bring it just in case.",
                        location: 'Kathmandu DAO',
                        author: 'Anonymous User',
                        timestamp: '3 days ago',
                        upvotes: 15,
                        downvotes: 2
                    },
                    {
                        id: 'gr2',
                        status: 'likely-true',
                        title: 'Token issue',
                        description: 'Token machine was broken. Had to wait in manual queue. Go very early.',
                        location: 'Lalitpur DAO',
                        author: 'Anonymous User',
                        timestamp: '1 week ago',
                        upvotes: 8,
                        downvotes: 1
                    },
                    {
                        id: 'gr3',
                        status: 'unverified',
                        title: 'Fee mismatch',
                        description: 'Staff asked for Rs. 50 for "form processing" which is not official. I paid anyway to avoid conflict.',
                        location: 'Bhaktapur DAO',
                        author: 'Anonymous User',
                        timestamp: '2 weeks ago',
                        upvotes: 12,
                        downvotes: 5
                    }
                ],
                scam_warnings: [
                    {
                        id: 'sw1',
                        title: 'Unofficial "agents" outside office',
                        description: 'People outside government offices may offer to "speed up" your process for a fee. This is not necessary.',
                        category: 'Fake Services',
                        warning_points: [
                            'They approach you first',
                            'Promise guaranteed same-day processing',
                            'Ask for cash only'
                        ],
                        severity: 'high'
                    },
                    {
                        id: 'sw2',
                        title: 'Fake document verification services',
                        description: 'Some may claim they need to "verify" your documents before submission for a fee.',
                        category: 'Document Scams',
                        warning_points: [
                            "Offices don't require pre-verification",
                            "They can't provide official receipts"
                        ],
                        severity: 'medium'
                    }
                ],
                total_documents: 6,
                completed_documents: 0,
                progress_percentage: 0
            },
            {
                title: 'Renew Passport',
                description: 'Process for passport renewal',
                slug: 'renew-passport',
                difficulty: 'easy',
                category_id: passportCategory._id,
                category_name: passportCategory.name,
                category_slug: passportCategory.slug,
                view_count: 200,
                status: 'published',
                verified: true,
                verified_date: '2024-01-10',
                estimated_time: '1-2 weeks',
                overview: {
                    content: 'Process for renewing your expired or soon-to-expire Nepali passport.',
                    last_edited_by: 'sarkarikam@laevix.com',
                    last_edited_at: new Date('2024-01-10T10:00:00Z')
                },
                steps: [
                    {
                        id: 'sp1',
                        title: 'Fill online application',
                        description: 'Complete the passport renewal form online',
                        duration: '30 minutes',
                        tips: ['Have all documents ready before starting'],
                        order: 1
                    }
                ],
                documents: [
                    {
                        id: 'dp1',
                        name: 'Old Passport',
                        type: 'original',
                        quantity: 1,
                        required: true,
                        order: 1
                    }
                ],
                ground_reality: [],
                scam_warnings: [],
                total_documents: 1,
                completed_documents: 0,
                progress_percentage: 0
            }
        ];
        const insertedTasks = await models_1.Task.insertMany(demoTasks);
        logger_util_1.logger.info(`📝 Inserted ${insertedTasks.length} tasks`);
        const insertedContributions = await models_1.Contribution.insertMany(demoContributions);
        logger_util_1.logger.info(`💡 Inserted ${insertedContributions.length} contributions`);
        logger_util_1.logger.info('✅ Database seeding completed successfully!');
        return {
            admin: 1,
            categories: insertedCategories.length,
            tasks: insertedTasks.length,
            contributions: insertedContributions.length
        };
    }
    catch (error) {
        logger_util_1.logger.error('❌ Database seeding failed:', error);
        throw error;
    }
};
exports.seedDatabase = seedDatabase;
if (require.main === module) {
    (async () => {
        try {
            await (0, mongodb_1.connectDatabase)();
            await (0, exports.seedDatabase)();
            await (0, mongodb_1.disconnectDatabase)();
            process.exit(0);
        }
        catch (error) {
            logger_util_1.logger.error('Seeding process failed:', error);
            process.exit(1);
        }
    })();
}
//# sourceMappingURL=seed.js.map